# Cover Letter Creator Setup

## Overview
The cover letter creator feature has been successfully implemented! It uses Cohere AI to generate professional cover letters based on:
- Resume (PDF upload)
- Job ID
- Job Title
- Company Name

## Environment Variables Required

Add the following environment variable to your `.env` file in the server directory:

```
COHERE_API_KEY=your_cohere_api_key_here
```

## How to Get a Cohere API Key

1. Go to [Cohere's website](https://cohere.ai/)
2. Sign up for an account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Features Implemented

### Backend
- ✅ Cover letter controller (`server/controllers/coverLetter.js`)
- ✅ Cover letter routes (`server/routes/coverLetter.js`)
- ✅ Cohere AI integration
- ✅ PDF parsing
- ✅ User analysis limit tracking
- ✅ Error handling

### Frontend
- ✅ Job ID input field
- ✅ Job Title input field
- ✅ Company Name input field
- ✅ Resume upload (existing)
- ✅ Cover letter generation
- ✅ Copy to clipboard functionality
- ✅ Loading states and error handling
- ✅ User credits display

## API Endpoint

```
POST /api/cover-letter/generate
```

**Request Body (FormData):**
- `resume`: PDF file
- `jobId`: string
- `jobTitle`: string
- `companyName`: string

**Response:**
```json
{
  "success": true,
  "message": "Cover letter generated successfully",
  "coverLetter": "Generated cover letter text...",
  "remainingAnalyses": "unlimited" | number,
  "unlimitedAnalysis": boolean
}
```

## Usage

1. Navigate to the Cover Letter Creator page
2. Enter the Job ID
3. Enter the Job Title
4. Enter the Company Name
5. Upload your resume (PDF)
6. Click "Generate Cover Letter"
7. Copy the generated cover letter to your clipboard

The system will use the same analysis limit tracking as the resume analyzer (3 free analyses, unlimited for premium users). 