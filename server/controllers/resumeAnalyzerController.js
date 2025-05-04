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

    // Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      Analyze this resume for a ${req.body.role} position. Do not use asterisks (*) or markdown-style bullets. Instead, use plain text or dashes if needed. Provide:
      1. Overall score (out of 10)
      2. Key strengths
      3. Areas for improvement
      4. Specific recommendations

      Resume content:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    res.json({ analysis });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ error: "Error analyzing resume" });
  }
};