import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import { AppContext } from "../context/AppContext";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import geminiLogo from '../assets/gemini.png';

const CoverLetter = () => {
  const { getToken } = useAuth();
  const { backendUrl, userData } = useContext(AppContext);
  const [jobId, setJobId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  useEffect(() => {}, [userData]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobId) {
      setError("Please enter a job ID");
      return;
    }
    if (!jobTitle) {
      setError("Please enter a job title");
      return;
    }
    if (!companyName) {
      setError("Please enter a company name");
      return;
    }
    if (!file) {
      setError("Please upload a PDF file");
      return;
    }
    setLoading(true);
    setError("");
    setCoverLetter("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobId", jobId);
    formData.append("jobTitle", jobTitle);
    formData.append("companyName", companyName);
    formData.append("name", name);
    formData.append("address", address);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("linkedin", linkedin);
    formData.append("github", github);

    console.log("Sending cover letter generation request with:", {
      jobId,
      jobTitle,
      companyName,
      file: file.name,
      fileType: file.type,
    });

    try {
      const token = await getToken();
      console.log("Auth token obtained");

      const res = await axios.post(
        backendUrl + "/api/cover-letter/generate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Cover Letter Response:", res.data);

      if (res.data.success) {
        setCoverLetter(res.data.coverLetter);
        setIsModalOpen(true);
        toast.success(
          `Cover letter generated successfully! ${
            res.data.unlimitedAnalysis
              ? "Unlimited access active."
              : `You have ${res.data.remainingAnalyses} analyses remaining.`
          }`
        );
      } else {
        setError(res.data.message);
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Cover Letter Generation Error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to generate cover letter");
      toast.error(err.response?.data?.message || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Cover letter copied to clipboard!");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Helper for consistent input styling
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "orange" },
      "&:hover fieldset": { borderColor: "orange" },
      "&.Mui-focused fieldset": { borderColor: "orange" },
    },
    "& .MuiInputLabel-root": {
      "&.Mui-focused": { color: "orange" },
    },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto bg-amber-50">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-orange-600">
              Cover Letter Generator
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Generate professional cover letters tailored to your resume and job application using AI technology
          </p>
          
          {/* Google Gemini AI Badge */}
          <div className="flex items-center justify-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-200 inline-flex">
            <img src={geminiLogo} alt="Google Gemini Logo" style={{ width: 24, height: 24 }} />
            <span className="text-sm font-medium text-gray-700">Powered by Google Gemini</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Credits Section */}
          <div className="lg:w-1/4 bg-white rounded-lg shadow-lg p-6 h-[200px]">
            <h3 className="text-xl font-semibold mb-4 text-orange-600">
              Your Credits
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Remaining Analyses:</span>
              <span className="text-2xl font-bold text-orange-600">
                {userData?.unlimitedAnalysis
                  ? "Unlimited"
                  : `${3 - (userData?.analysisCount || 0)}/3`}
              </span>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {userData?.unlimitedAnalysis
                  ? "You have unlimited analyses available."
                  : `You have ${
                      3 - (userData?.analysisCount || 0)
                    } free analyses.`}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Input Container */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="space-y-6">
                {/* Row 1: Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextField
                    fullWidth
                    label="Job ID"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    sx={inputSx}
                  />
                </div>
                {/* Row 2: User Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextField
                    fullWidth
                    label="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={inputSx}
                  />
                </div>
                {/* Row 3: User Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    label="LinkedIn URL"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    label="GitHub URL"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    sx={inputSx}
                  />
                </div>
              </div>
              <div className="mt-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full p-8 border-2 rounded-lg transition-all duration-200 cursor-pointer ${dragActive ? 'border-orange-500 bg-orange-50' : 'border-orange-400 bg-white'} hover:border-orange-500`}
                  onClick={() => document.getElementById('resume-upload').click()}
                  style={{ minHeight: 120 }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: dragActive ? '#fb923c' : '#f59e42', mb: 1 }} />
                  <p className="text-gray-600 mb-2">{file ? file.name : 'Drag & drop your Resume here, or click to select your Resume'}</p>
                  <input
                    id="resume-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  variant="contained"
                  onClick={handleGenerateCoverLetter}
                  disabled={
                    loading ||
                    (!userData?.unlimitedAnalysis &&
                      (userData?.analysisCount || 0) >= 3)
                  }
                  endIcon={<SendIcon sx={{ ml: 1 }} />}
                  sx={{
                    background: 'linear-gradient(90deg, #fb923c 0%, #ea580c 100%)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '1rem',
                    borderRadius: '999px',
                    boxShadow: '0 4px 14px 0 rgba(251,146,60,0.15)',
                    px: 5,
                    py: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)',
                      boxShadow: '0 6px 20px 0 rgba(251,146,60,0.25)',
                      transform: 'translateY(-2px) scale(1.03)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Cover Letter'}
                </Button>
              </div>
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </div>
          </div>
        </div>

        {/* Cover Letter Modal */}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#fef3c7",
              borderBottom: "1px solid #fed7aa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#ea580c",
                  margin: 0,
                }}
              >
                Generated Cover Letter
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                onClick={handleCopyToClipboard}
                sx={{
                  backgroundColor: "rgba(251, 146, 60, 0.1)",
                  color: "#ea580c",
                  "&:hover": {
                    backgroundColor: "rgba(251, 146, 60, 0.2)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </IconButton>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent
            sx={{
              padding: "24px",
              backgroundColor: "#fef3c7",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <div className="bg-white rounded-lg p-6 shadow-md border border-orange-100">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium">
                {coverLetter}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default CoverLetter;
