import express from "express";
import { getRoles } from "../controllers/resumeAnalyzerController.js";

const router = express.Router();

router.get("/roles", getRoles);

export default router;