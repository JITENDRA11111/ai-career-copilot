import { useState, useEffect } from "react";
import axios from "axios";
import { Target, Star, BookOpen, AlertCircle, ArrowLeft, Award } from "lucide-react";
import { useNavigationStore } from "../store/navigationStore";

const GAP_API = `${import.meta.env.VITE_API_URL}/skills/gap`;
const LIST_RESUMES_API = `${import.meta.env.VITE_API_URL}/resume/list`;

export default function SkillGapPage() {
  const { setIsTaskActive } = useNavigationStore();
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("Senior Frontend Engineer");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await axios.get(LIST_RESUMES_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setResumes(response.data.resumes);
          if (response.data.resumes.length > 0) {
            setResumeId(response.data.resumes[0]._id);
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

  const runAnalysis = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setReport(null);

    try {
      const response = await axios.post(
        GAP_API,
        { resumeId, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReport(response.data.analysis);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate skill gap report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <header className="flex items-center gap-3 pb-6 border-b border-slate-900">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
          <Target size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Skill Gap Analysis</h2>
          <p className="text-xs text-slate-400">Map your skills against job markets and unlock recommended learning plans</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!report ? (
        <form onSubmit={runAnalysis} className="max-w-xl bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Configure Skill Check</h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Select Resume</label>
              <select
                required
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none"
              >
                {resumes.map((res) => (
                  <option key={res._id} value={res._id}>
                    {res.fileName} ({new Date(res.uploadedAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
              {resumes.length === 0 && (
                <p className="text-[10px] text-rose-400 mt-1">Please upload a resume in the Resumes section first.</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Target Market Role</label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || resumes.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? "Analyzing Skills..." : "Analyze Skill Gaps"}
          </button>
        </form>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <button
            onClick={() => setReport(null)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          >
            <ArrowLeft size={14} /> Back to Setup
          </button>

          {/* Skill Breakdown Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Star size={14} className="text-indigo-400" /> Current Skills Identified
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.currentSkills?.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-rose-400" /> Missing / Target Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.missingSkills?.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Roadmap timeline */}
          <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-400" /> AI Recommendation Learning Plan
            </h3>
            <div className="space-y-4">
              {report.learningPlan?.map((plan, index) => (
                <div key={index} className="p-4 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{plan.skill}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Estimated Duration: {plan.estimatedWeeks} Weeks</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${plan.priority === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
                      {plan.priority} Priority
                    </span>
                  </div>

                  {plan.resources && plan.resources.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Suggested Courses & Docs:</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20 transition rounded text-xs font-semibold"
                          >
                            {res.name} ({res.type})
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
