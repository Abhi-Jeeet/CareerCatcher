import express from 'express';
import { changeJobApplicationsStatus, changeJobVisibility, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerComapany } from '../controllers/companyController.js';
import upload from '../config/multer.js';
import { protectCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

//Register a company
router.post('/register',upload.single('image'), registerComapany)

//company login
router.post('/login',loginCompany)

//get company data
router.get('/company',protectCompany,getCompanyData)

//post a job
router.post('/post-job', protectCompany,postJob)

//Get applicants data of comapny
router.get('/applicants', protectCompany,getCompanyJobApplicants)

// Get company job list
router.get('/list-jobs', protectCompany,getCompanyPostedJobs)

//change application status
router.post('/change-status', protectCompany,changeJobApplicationsStatus)

//change applications visibility
router.post('/change-visibility', protectCompany,changeJobVisibility)

export default router;