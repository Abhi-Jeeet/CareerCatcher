# CareerCatcher

**CareerCatcher** is a comprehensive **full-stack web application** with **AI** that bridges the gap between recruiters and job seekers. Recruiters can register their companies, post job openings, and manage applications, while job seekers can explore job opportunities, apply directly, and track their application status. The platform offers **secure login and profile management**, **smooth image/file uploads**, and **reliable data storage** with MongoDB.

Additionally, CareerCatcher includes **AI-powered features** powered by **Gemini AI**: a **Resume Analyzer** that allows job seekers to upload and analyze their resumes, and a **Cover Letter Generator** that helps create personalized cover letters. The Resume Analyzer provides a comprehensive evaluation with an overall score (out of 10), highlights key strengths, identifies areas for improvement, and offers specific recommendations to enhance the resume's effectiveness. The Cover Letter Generator creates tailored cover letters based on job descriptions and user profiles. New users are granted 3 free analysis attempts for each feature, with the possibility of unlimited credits based on settings.

## Features

**Resume Analyzer (Gemini AI)**:
- Uses **Gemini AI** to analyze uploaded resumes.
  
 **Provides**:
- **Overall Score (0-10)**: Evaluate your resume quality.
- **Key Strengths**: Highlight the strong points of your resume.
- **Areas for Improvement**: Identify what can be improved.
- **Recommendations**: Get actionable tips to enhance your resume.

 **Credits**:
- **New users** get **3 free tries** to analyze resumes.
- **Unlimited credits** can be granted if enabled.

**Cover Letter Generator (Gemini AI)**:
- Uses **Gemini AI** to generate personalized cover letters.
  
 **Provides**:
- **Job-Specific Content**: Tailored cover letters based on job descriptions.
- **Professional Tone**: Industry-appropriate language and formatting.
- **Customizable Templates**: Multiple formats to match different industries.
- **Key Highlights**: Emphasizes relevant skills and experiences for the position.

 **Credits**:
- **New users** get **3 free tries** to generate cover letters.
- **Unlimited credits** can be granted if enabled.

**Recruiter Features**:
  - Register and manage company profiles
  - Post job listings with detailed information
  - View and manage job applications from candidates

  **Job Seeker Features**:
  - Browse available job listings
  - Apply directly to job openings
  - Track application status (e.g., Pending, Accepted, Rejected)

  **Authentication & Authorization**:
  - Secure login and user profile management via [Clerk](https://clerk.dev)
  
  **Cloudinary Integration**:
  - Upload and manage images and files seamlessly (e.g., resume, profile pictures)

  **MongoDB Database**:
  - Store and manage job listings, user profiles, and applications efficiently

## Technologies Used

- **Frontend**: React, HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Clerk
- **Image/File Upload**: Cloudinary
- **Deployment**: Vercel

