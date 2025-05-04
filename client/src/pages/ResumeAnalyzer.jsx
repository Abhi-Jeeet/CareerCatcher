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
} from "@mui/material";
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

  useEffect(() => {}, [userData]);

  useEffect(() => {
    // Fetch available roles from backend
    axios
      .get("/api/roles")
      .then((res) => {
        // Ensure roles is an array and combine with default roles
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
        // Keep default roles even if API call fails
      });
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
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

    console.log("Sending analysis request with:", {
      role,
      file: file.name,
      fileType: file.type,
    });

    try {
      const token = await getToken();
      console.log("Auth token obtained");

      const res = await axios.post(
        backendUrl + "/api/users/analyze-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Analysis Response:", res.data);

      if (res.data.success) {
        setAnalysis(res.data.analysis);
        toast.success(
          `Analysis successful! ${
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
      console.error("Analysis Error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to analyze resume");
      toast.error(err.response?.data?.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto bg-amber-50">
        <h2 className="text-2xl font-semibold mb-6 text-center text-orange-600">
          Resume Analyzer
        </h2>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        borderColor: "orange", // default border
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "orange", // on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "orange", // on focus (SELECTED state)
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
                <Paper sx={{ p: 2, boxShadow: "none", background: "none" }}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full p-[13px]  border border-orange-400 rounded-md"
                  />
                </Paper>
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
                  sx={{
                    backgroundColor: "#fb923c",
                    color: "white",
                    fontWeight: 300,
                    "&:hover": { backgroundColor: "#ea580c" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Analyze Resume"
                  )}
                </Button>
              </div>
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </div>

            {/* Analysis Results Container */}
          </div>
        </div>
        {analysis && (
          <div className="bg-white rounded-lg shadow-lg p-8 my-2">
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
      </div>
      <Footer />
    </>
  );
};

export default ResumeAnalyzer;
