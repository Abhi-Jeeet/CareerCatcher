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

// CORS configuration for Vercel deployment
const corsOptions = {
  origin: [
    'https://career-catcher-client1.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

//Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(clerkMiddleware());

// Debugging middleware for CORS issues
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  console.log('Headers:', req.headers);
  next();
});

// Handle OPTIONS requests for CORS preflight
app.options('*', cors(corsOptions));

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

// Increase timeout for serverless functions
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
    
})