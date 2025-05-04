import express from "express";
import { applyForJob, getUserData, getUserJobApplications, updateUserResume, analyzeResume } from "../controllers/userController.js";
import upload from "../config/multer.js";

const router = express.Router();

//get user data
router.get('/user', getUserData)

//get user job applications
router.get('/job-applications', getUserJobApplications)

//apply for job
router.post('/apply-job', applyForJob)

//update user profile resume
router.post('/update-resume', upload.single('resume'), updateUserResume)

//analyze resume
router.post('/analyze-resume', upload.single('resume'), analyzeResume)

export default router;