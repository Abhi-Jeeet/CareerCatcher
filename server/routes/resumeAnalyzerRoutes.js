import express from "express";
import { getRoles, analyzeResume } from "../controllers/resumeAnalyzerController.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get("/roles", getRoles);
router.post("/analyze", upload.single("resume"), analyzeResume);

export default router;