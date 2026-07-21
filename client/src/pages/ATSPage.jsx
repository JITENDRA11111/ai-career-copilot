import { useState, useEffect } from "react";
import axios from "axios";
import { Award, AlertCircle, ArrowLeft, Target, CheckCircle2, XCircle, FileText } from "lucide-react";
import LoadingAnimation from "../components/LoadingAnimation";
import { useNavigationStore } from "../store/navigationStore";

const SCORE_API = "http://localhost:5000/api/v1/ats/score";
const LIST_RESUMES_API = "http://localhost:5000/api/v1/resume/list";

export default function ATSPage() {
  const { setIsTaskActive } = useNavigationStore();
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await axios.get(LIST_RESUMES_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const parsedOnly = response.data.resumes.filter((r) => r.parsed);
          setResumes(parsedOnly);
          if (parsedOnly.length > 0) {
            setResumeId(parsedOnly[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load resumes", err);
      }
    };
    fetchResumes();
  }, [token]);

  useEffect(() => {
    setIsTaskActive(loading);
  }, [loading, setIsTaskActive]);

  const calculateScore = async (e) => {
    e.preventDefault();
    if (jobDescription.trim().length < 50) {
      setError("Job description must contain at least 50 characters.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        SCORE_API,
        { resumeId, jobDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setResult(response.data.ats);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate ATS match score.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <header className="flex items-center gap-3 pb-6 border-b border-slate-900">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
          <Award size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">ATS Score Matching</h2>
          <p className="text-xs text-slate-400">Match resume keywords and structures against target job requirements</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center text-center">
          <LoadingAnimation title="Scanning Job Profile" description="Comparing skills, titles, locations and computing matching indexes..." />
        </div>
      )}

      {!loading && !result && (
        <form onSubmit={calculateScore} className="max-w-xl bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Configure Match scan</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Select Parsed Resume</label>
              <select
                required
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none"
              >
                {resumes.map((res) => (
                  <option key={res._id} value={res._id}>
                    {res.fileName}
                  </option>
                ))}
              </select>
              {resumes.length === 0 && (
                <p className="text-[10px] text-rose-400 mt-1">
                  No parsed resumes available. Please upload and parse a resume first in the Resumes page.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Paste Job Description</label>
              <textarea
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description details here (min 50 chars)..."
                className="w-full h-44 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-3 text-xs text-slate-100 outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || resumes.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-lg transition"
          >
            Calculate ATS Match
          </button>
        </form>
      )}

      {result && (
        <div className="space-y-8 animate-fade-in">
          <button
            onClick={() => setResult(null)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          >
            <ArrowLeft size={14} /> Back to Setup
          </button>

          {/* Scores breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Match</p>
              <h3 className="text-5xl font-black text-indigo-400 mt-2">{result.overall}%</h3>
            </div>

            <div className="md:col-span-3 p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Section Breakdowns</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {Object.entries(result.sections || {}).map(([sec, val]) => (
                  <div key={sec} className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{sec}</p>
                    <p className="text-base font-bold mt-1 text-slate-200">{val}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords matches */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={14} /> Matched Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords?.map((kw, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-rose-400">
                <XCircle size={14} /> Missing Target Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords?.map((kw, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={14} className="text-indigo-400" /> AI Suggestions for Match Improvement
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-2 pl-2 leading-relaxed">
                {result.suggestions.map((sug, idx) => (
                  <li key={idx}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
