import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Hardcoded roles (or fetch from DB if needed)
const AVAILABLE_ROLES = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "UX Designer",
  "Marketing Manager",
  "Business Analyst"
];

// GET /api/roles
export const getRoles = (req, res) => {
  res.json(AVAILABLE_ROLES);
};

// POST /api/analyze
export const analyzeResume = async (req, res) => {
  console.time('analyzeResume');
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!req.body.role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Parse PDF
    const pdfBuffer = req.file.buffer;
    console.time('pdfParse');
    const pdfData = await pdfParse(pdfBuffer);
    console.timeEnd('pdfParse');
    const resumeText = pdfData.text;

    // Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    // Optimized, concise prompt
    const prompt = `Analyze this resume for the role of ${req.body.role}.
Start with: Overall Score: X/10.
Then list:
- Key strengths
- Areas for improvement
- Specific recommendations
No markdown or asterisks. Use plain text or dashes.

Resume:
${resumeText}`;

    console.time('geminiAPI');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    console.timeEnd('geminiAPI');

    // Parse the analysis text into structured format (same as before)
    const cleanText = analysisText
      .replace(/\*/g, '')
      .replace(/^\s*[-•]\s*/gm, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();

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

    console.timeEnd('analyzeResume');
    res.json({ analysis });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    console.timeEnd('analyzeResume');
    res.status(500).json({ error: "Error analyzing resume" });
  }
};