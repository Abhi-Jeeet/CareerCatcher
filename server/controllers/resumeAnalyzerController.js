import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { CohereClient } from "cohere-ai";

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
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!req.body.role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Parse PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    // Cohere API
    const cohere = new CohereClient({
      token: process.env.COHERE_RESUME_ANALYSER_API_KEY,
    });

    const prompt = `Analyze the following resume ONLY for the role of: ${req.body.role}.

Instructions:
- Your response MUST start with: Overall Score: X/10 (where X is a number from 0 to 10)
- Carefully compare the resume to the requirements and typical skills of a ${req.body.role} position.
- If the resume is NOT a good fit for the selected role, give a LOW score (e.g., 2-5/10) and clearly explain why in your analysis.
- If the resume is a strong fit for the selected role, give a high score and explain why.
- Example: If the resume is for a Software Engineer but the selected role is UX Designer, the score should be low (e.g., 2/10), and the analysis should explain the mismatch.
- Do NOT use 'Not specified' or 'N/A'. If unsure, estimate a score based on the fit for the SELECTED ROLE ONLY.
- Then provide:
  1. Key strengths
  2. Areas for improvement
  3. Specific recommendations
- Do not use asterisks (*) or markdown-style bullets. Instead, use plain text or dashes if needed.

Resume content:
${resumeText}`;

    const response = await cohere.generate({
      model: 'command',
      prompt,
      maxTokens: 800,
      temperature: 0.5,
      k: 0,
      stopSequences: [],
      returnLikelihoods: 'NONE',
    });

    const analysisText = response.generations[0].text;

    // Parse the analysis text into structured format (same as before)
    // Extract score using multiple patterns
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

    res.json({ analysis });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ error: "Error analyzing resume" });
  }
};