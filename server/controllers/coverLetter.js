import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { CohereClient } from "cohere-ai";
import User from "../models/User.js";

// Initialize Cohere
const cohere = new CohereClient({
    token: process.env.COHERE_COVER_LETTER_API_KEY,
});

// POST /api/cover-letter/generate
export const generateCoverLetter = async (req, res) => {
    try {
        console.log('Cover letter generation request:', req.body);
        console.log('Request file:', req.file);
        
        const userId = req.auth.userId;
        const { jobId, jobTitle, companyName } = req.body;
        const file = req.file;

        if (!file) {
            console.log('No file uploaded');
            return res.status(400).json({ success: false, message: 'Please upload a resume' });
        }

        if (!jobId) {
            console.log('No job ID provided');
            return res.status(400).json({ success: false, message: 'Please provide a job ID' });
        }

        if (!jobTitle) {
            console.log('No job title provided');
            return res.status(400).json({ success: false, message: 'Please provide a job title' });
        }

        if (!companyName) {
            console.log('No company name provided');
            return res.status(400).json({ success: false, message: 'Please provide a company name' });
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

        // For now, use placeholders for user info
        const userName = req.body.name || "[Your Name]";
        const userEmail = req.body.email || "[your.email@email.com]";
        const userPhone = req.body.phone || "[Your Phone Number]";
        const userLinkedIn = req.body.linkedin || "[LinkedIn URL]";
        const userGithub = req.body.github || "[GitHub URL]";
        // Format date as DD/MM/YYYY
        const todayObj = new Date();
        const today = `${String(todayObj.getDate()).padStart(2, '0')}/${String(todayObj.getMonth() + 1).padStart(2, '0')}/${todayObj.getFullYear()}`;

        // Generate cover letter using Cohere
        const response = await cohere.generate({
            model: 'command',
            prompt: `You are a professional cover letter writer. Write ONLY the body of a compelling, professional cover letter (do not include any header or salutation). Use proper paragraph structure (not a single block of text). Use the following information to tailor the letter for the job application. Highlight relevant skills and experiences from the resume, show enthusiasm for the specific role and company, keep it concise but comprehensive (300-500 words), use a professional tone, and mention the specific company name, job title, and job ID. Do NOT repeat the header info in the body.\n\nCompany Name: {companyName}\nJob Title: {jobTitle}\nJob ID: {jobId}\n\nResume Content:\n{resumeText}\n\nCover Letter Body:`
                .replace('{companyName}', companyName)
                .replace('{jobTitle}', jobTitle)
                .replace('{jobId}', jobId)
                .replace('{resumeText}', resumeText),
            maxTokens: 1000,
            temperature: 0.7,
            k: 0,
            stopSequences: [],
            returnLikelihoods: 'NONE'
        });

        const aiBody = response.generations[0].text.trim();

        // Compose the final cover letter with the requested header
        const coverLetter = `${userName}\n${userEmail} | ${userPhone}\nLinkedIn: ${userLinkedIn}\nGitHub: ${userGithub}\n${today}\n\nDear Hiring Manager,\n\n${aiBody}\n\nSincerely,\n${userName}`;

        // Increment analysis count only if not unlimited
        if (!user.unlimitedAnalysis) {
            user.analysisCount += 1;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Cover letter generated successfully',
            coverLetter,
            remainingAnalyses: user.unlimitedAnalysis ? 'unlimited' : 3 - user.analysisCount,
            unlimitedAnalysis: user.unlimitedAnalysis
        });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
