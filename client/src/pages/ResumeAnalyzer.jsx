import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import { AppContext } from "../context/AppContext";

const ResumeAnalyzer = () => {
  const { getToken } = useAuth();
  const { backendUrl, userData } = useContext(AppContext);
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "UX Designer",
    "Marketing Manager",
    "Business Analyst"
  ]);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {}, [userData]);

  useEffect(() => {
    axios
      .get("/api/roles")
      .then((res) => {
        const apiRoles = Array.isArray(res.data) ? res.data : [];
        const defaultRoles = [
          "Software Engineer",
          "Data Scientist",
          "Product Manager",
          "UX Designer",
          "Marketing Manager",
          "Business Analyst"
        ];
        const combinedRoles = [...new Set([...defaultRoles, ...apiRoles])];
        setRoles(combinedRoles);
      })
      .catch(() => {
        setError("Failed to fetch roles");
      });
  }, []);

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

  const handleAnalyze = async () => {
    if (!role) {
      setError("Please select a role");
      return;
    }
    if (!file) {
      setError("Please upload a PDF file");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysis("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    try {
      const token = await getToken();
      const res = await axios.post(
        backendUrl + "/api/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.analysis) {
        setAnalysis(res.data.analysis);
        setIsModalOpen(true);
        toast.success("Analysis successful!");
      } else {
        setError(res.data.message || "Failed to analyze resume");
        toast.error(res.data.message || "Failed to analyze resume");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze resume");
      toast.error(err.response?.data?.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    toast.success("Analysis copied to clipboard!");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-orange-600">
              Resume Analyzer
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Instantly analyze your resume for strengths, weaknesses, and recommendations using AI.
          </p>
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
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormControl fullWidth sx={{ mt: 2.1 }}>
                  <InputLabel
                    sx={{
                      "&.Mui-focused": {
                        color: "orange",
                      },
                    }}
                  >
                    Select Role
                  </InputLabel>
                  <Select
                    value={role}
                    label="Select Role"
                    onChange={(e) => setRole(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "orange",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "orange",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "orange",
                      },
                    }}
                  >
                    {roles.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full p-8 border-2 rounded-lg transition-all duration-200 cursor-pointer ${dragActive ? 'border-orange-500 bg-orange-50' : 'border-orange-400 bg-white'} hover:border-orange-500`}
                  onClick={() => document.getElementById('resume-upload').click()}
                  style={{ minHeight: 120 }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: dragActive ? '#fb923c' : '#f59e42', mb: 1 }} />
                  <p className="text-gray-600 mb-2">{file ? file.name : 'Drag & drop your PDF here, or click to select'}</p>
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
                  onClick={handleAnalyze}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Resume'}
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
        {/* Analysis Modal */}
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
                    d="M12 4v16m8-8H4"
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
                Resume Analysis
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
            {analysis && (
              <div className="bg-white rounded-lg p-6 shadow-md border border-orange-100">
                {/* Score Section */}
                <div className="flex justify-center mb-8">
                  <div className="bg-amber-50 rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-2xl font-bold text-orange-600 mb-2">
                      Overall Score
                    </h3>
                    <div className="text-4xl font-bold text-orange-500">
                      {analysis.score}/10
                    </div>
                  </div>
                </div>
                {/* Analysis Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Key Strengths Section */}
                    <div className="bg-amber-50 rounded-lg p-6 shadow-md">
                      <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Key Strengths
                      </h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {analysis.strengths.length > 0 ? (
                          analysis.strengths.map((strength, index) => (
                            <li key={index} className="py-1">
                              {strength}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">
                            No strengths identified
                          </li>
                        )}
                      </ul>
                    </div>
                    {/* Areas for Improvement Section */}
                    <div className="bg-amber-50 rounded-lg p-6 shadow-md">
                      <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Areas for Improvement
                      </h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {analysis.improvements.length > 0 ? (
                          analysis.improvements.map((improvement, index) => (
                            <li key={index} className="py-1">
                              {improvement}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">
                            No improvements identified
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  {/* Right Column - Recommendations */}
                  <div className="bg-amber-50 rounded-lg p-6 shadow-md">
                    <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      Specific Recommendations
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {analysis.recommendations.length > 0 ? (
                        analysis.recommendations.map((recommendation, index) => (
                          <li key={index} className="py-1">
                            {recommendation}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">
                          No recommendations provided
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default ResumeAnalyzer;
