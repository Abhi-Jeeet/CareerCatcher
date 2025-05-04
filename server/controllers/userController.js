import Job from "../models/job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import {v2 as cloudinary} from 'cloudinary'
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";




//Get user data
export const getUserData = async(req, res)=>{
    const userId = req.auth.userId

    try {
        const user = await User.findById(userId)
        if(!user){
            return res.json({success:false, message:"User not found"})
        }
        return res.json({success:true, user})
    } catch (error) {
        res.json({success:false, message:error.message})    
    }
}

//apply for a job
export const applyForJob = async(req, res)=>{
    const {jobId} = req.body

    const userId = req.auth.userId

    try {
        const isAlreadyApplied = await JobApplication.findOne({jobId,userId})

        if(isAlreadyApplied){
            return res.json({success:false, message:"You have already applied for this job"})
        }
        const jobData = await Job.findById(jobId)
        if(!jobData){
            return res.json({success:false, message:"Job not found"})
        }
        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date:Date.now()
        })
        res.json({success:true, message:"Applied successfully"})

    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

//get user applied applications
export const getUserJobApplications = async(req, res)=>{

    try {
        const userId = req.auth.userId

        const applications = await JobApplication.find({userId}).populate('companyId','name email image').populate('jobId','title description location category level salary')
        .exec()

        if(!applications){
            return res.json({success:false, message:"No applications found for this user"})
        }

        return res.json({success:true, applications})
    } catch (error) {
        res.json({success:false, message:error.message})
    }

}

//update user profile(resume)

export const updateUserResume = async(req, res)=>{
    try {
        const userId = req.auth.userId

        const resumeFile = req.file
        const userData = await User.findById(userId)

        if(resumeFile){
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path) 

            userData.resume = resumeUpload.secure_url

        }
        await userData.save()

        return res.json({success:true, message:"Resume updated successfully"})
        
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

export const analyzeResume = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        const userId = req.auth.userId;
        const { role } = req.body;
        const file = req.file;

        if (!file) {
            console.log('No file uploaded');
            return res.status(400).json({ success: false, message: 'Please upload a resume' });
        }

        if (!role) {
            console.log('No role selected');
            return res.status(400).json({ success: false, message: 'Please select a role' });
        }

        // Check if user exists and get analysis count
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check analysis limit only if user doesn't have unlimited analysis
        if (!user.unlimitedAnalysis && user.analysisCount >= 3) {
            console.log('Analysis limit reached for user:', userId);
            return res.status(400).json({ 
                success: false, 
                message: 'You have reached the maximum number of analyses (3). Please upgrade your account for more analyses.' 
            });
        }

        // Parse PDF
        const pdfBuffer = req.file.buffer;
        const pdfData = await pdfParse(pdfBuffer);
        const resumeText = pdfData.text;

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
            Analyze this resume for a ${role} position. Provide a detailed analysis in the following format:
            
            1. Overall Score: [number between 0 and 10]
            2. Key Strengths (list 3-5 points)
            3. Areas for Improvement (list 3-5 points)
            4. Specific Recommendations (list 3-5 points)
            
            Important: 
            - Do not use asterisks (*) or markdown-style bullets
            - Use plain text with dashes (-) for lists
            - Keep each point on a new line
            - Do not include any special formatting characters
            - For the score, use format: "Overall Score: X" where X is a number between 0 and 10
            
            Resume content:
            ${resumeText}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();

        // Clean and parse the analysis text
        const cleanText = analysisText
            .replace(/\*/g, '') // Remove asterisks
            .replace(/^\s*[-•]\s*/gm, '') // Remove bullet points
            .replace(/\n\s*\n/g, '\n') // Remove extra newlines
            .trim();

        // Extract score using multiple patterns
        const scorePatterns = [
            /Overall Score:?\s*(\d+(?:\.\d+)?)/i,
            /Score:?\s*(\d+(?:\.\d+)?)/i,
            /(\d+(?:\.\d+)?)\s*\/\s*10/i,
            /(\d+(?:\.\d+)?)\s*out of 10/i
        ];

        let score = "Not specified";
        for (const pattern of scorePatterns) {
            const match = cleanText.match(pattern);
            if (match && match[1]) {
                score = match[1];
                break;
            }
        }

        // Parse the analysis text into structured format
        const analysis = {
            score,
            strengths: cleanText
                .match(/Key Strengths:?\s*([\s\S]*?)(?=Areas for Improvement|$)/i)?.[1]
                ?.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.includes('Areas for Improvement')) || [],
            improvements: cleanText
                .match(/Areas for Improvement:?\s*([\s\S]*?)(?=Specific Recommendations|$)/i)?.[1]
                ?.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.includes('Specific Recommendations')) || [],
            recommendations: cleanText
                .match(/Specific Recommendations:?\s*([\s\S]*?)$/i)?.[1]
                ?.split('\n')
                .map(line => line.trim())
                .filter(line => line) || []
        };

        // Increment analysis count only if not unlimited
        if (!user.unlimitedAnalysis) {
            user.analysisCount += 1;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Resume analyzed successfully',
            analysis,
            remainingAnalyses: user.unlimitedAnalysis ? 'unlimited' : 3 - user.analysisCount,
            unlimitedAnalysis: user.unlimitedAnalysis
        });

    } catch (error) {
        console.error('Error analyzing resume:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};