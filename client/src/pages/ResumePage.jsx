import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FileText, Upload, Trash2, Cpu, Award, ArrowRight, CheckCircle, AlertCircle, FileDigit } from "lucide-react";
import LoadingAnimation from "../components/LoadingAnimation";
import { useNavigationStore } from "../store/navigationStore";

const UPLOAD_API = `${import.meta.env.VITE_API_URL}/resume/upload`;
const LIST_API = `${import.meta.env.VITE_API_URL}/resume/list`;
const DELETE_API = `${import.meta.env.VITE_API_URL}/resume`;

export default function ResumePage() {
  const { setIsTaskActive } = useNavigationStore();
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsingId, setParsingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const response = await axios.get(LIST_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setResumes(response.data.resumes || []);
      }
    } catch (err) {
      console.error("Failed to load resumes", err);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchResumes();
  }, [token, navigate]);

  useEffect(() => {
    setIsTaskActive(uploading || parsingId !== "");
  }, [uploading, parsingId, setIsTaskActive]);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError("");
    setSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await axios.post(UPLOAD_API, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess("Resume uploaded successfully!");
        setFile(null);
        fetchResumes();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async (resumeId) => {
    setError("");
    setSuccess("");
    setParsingId(resumeId);

    try {
      const response = await axios.post(
        `${DELETE_API}/${resumeId}/parse`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess("Resume parsed and skills indexed successfully!");
        fetchResumes();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Parsing failed. Please check Gemini API quota.");
    } finally {
      setParsingId("");
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    setError("");
    setSuccess("");

    try {
      const response = await axios.delete(`${DELETE_API}/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess("Resume deleted successfully.");
        fetchResumes();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resume.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <header className="flex items-center gap-3 pb-6 border-b border-slate-900">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
          <FileText size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Resume Workspace</h2>
          <p className="text-xs text-slate-400">Upload, parse skills, and request deep AI feedback on your resumes</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Column */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Upload New Resume</h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />

            <div
              onClick={handleBrowseClick}
              className="border border-dashed border-slate-800 hover:border-indigo-500/40 p-8 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-3 bg-slate-950/40"
            >
              <Upload size={28} className="text-slate-500" />
              <p className="text-xs text-slate-300 font-semibold">
                {file ? file.name : "Click to browse files"}
              </p>
              <span className="text-[10px] text-slate-500">PDF, DOCX up to 5MB</span>
            </div>

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
              >
                {uploading ? "Uploading file..." : "Upload Resume"}
              </button>
            )}
          </div>
        </div>

        {/* Resumes List Column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Your Resumes</h3>

          {parsingId && (
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <LoadingAnimation title="Parsing Resume" description="Extracting structures, achievements and indexing skills..." />
            </div>
          )}

          {!parsingId && resumes.length === 0 ? (
            <div className="text-center py-12 border border-slate-800 rounded-xl bg-slate-900/10 text-slate-500 text-sm">
              No resumes uploaded yet. Upload a resume to start.
            </div>
          ) : (
            !parsingId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumes.map((resume) => (
                  <div
                    key={resume._id}
                    className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700/60 transition"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                          <FileDigit size={20} />
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            resume.parsed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {resume.parsed ? "Parsed" : "Not Parsed"}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{resume.fileName}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-900 mt-4">
                      <button
                        onClick={() => handleDelete(resume._id)}
                        className="p-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        title="Delete Resume"
                      >
                        <Trash2 size={13} />
                      </button>

                      {!resume.parsed ? (
                        <button
                          onClick={() => handleParse(resume._id)}
                          className="flex-1 flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-semibold py-1.5 rounded transition"
                        >
                          <Cpu size={12} /> Parse skills
                        </button>
                      ) : (
                        <>
                          <Link
                            to={`/review/${resume._id}`}
                            className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold py-1.5 rounded transition"
                          >
                            <Award size={12} /> AI Review
                          </Link>
                          <Link
                            to={`/ats`}
                            className="flex-1 flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold py-1.5 rounded transition"
                          >
                            ATS Match
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
