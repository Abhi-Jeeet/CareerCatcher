import express from "express";
import { generateCoverLetter } from "../controllers/coverLetter.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// POST /api/cover-letter/generate
router.post("/cover-letter/generate", upload.single("resume"), generateCoverLetter);

export default router;
