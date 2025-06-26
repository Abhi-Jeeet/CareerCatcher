import express from 'express';
import cors from 'cors';

import 'dotenv/config';
import connectDB from './config/db.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js';
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import {clerkMiddleware} from '@clerk/express'
import resumeAnalyzerRoutes from './routes/resumeAnalyzerRoutes.js'
import coverLetterRoutes from './routes/coverLetter.js'


const app = express();

//connect to the database
await connectDB()
await connectCloudinary()


//Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


//Routes
app.get('/', (req, res) => res.send("Api working"))
app.post('/webhooks', clerkWebhooks)
app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api', resumeAnalyzerRoutes);
app.use('/api', coverLetterRoutes);


//Port
const PORT = process.env.PORT || 5000;


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
    
})