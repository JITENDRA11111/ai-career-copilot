import { useState, useEffect } from "react";
import axios from "axios";
import { Briefcase, AlertCircle, ArrowLeft, ExternalLink, Bookmark, MapPin, DollarSign, Calendar } from "lucide-react";
import LoadingAnimation from "../components/LoadingAnimation";
import { useNavigationStore } from "../store/navigationStore";

const RECOMMEND_API = `${import.meta.env.VITE_API_URL}/jobs/recommend`;
const SAVE_API = `${import.meta.env.VITE_API_URL}/jobs/save`;
const GET_SAVED_API = `${import.meta.env.VITE_API_URL}/jobs/saved`;
const LIST_RESUMES_API = `${import.meta.env.VITE_API_URL}/resume/list`;

export default function JobSearchPage() {
  const { setIsTaskActive } = useNavigationStore();
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("recommend"); // recommend | saved
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchSavedJobs = async () => {
    try {
      const response = await axios.get(GET_SAVED_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSavedJobs(response.data.jobs);
      }
    } catch (err) {
      console.error("Failed to load saved jobs", err);
    }
  };

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
    fetchSavedJobs();
  }, [token]);

  useEffect(() => {
    setIsTaskActive(loading);
  }, [loading, setIsTaskActive]);

  const findJobs = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setJobs([]);

    try {
      const response = await axios.post(
        RECOMMEND_API,
        { resumeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setJobs(response.data.jobs);
        if (response.data.jobs.length === 0) {
          setError("No jobs found matching your resume profile.");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to find matching jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (job) => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        SAVE_API,
        {
          jobId: job.jobId || job.id || Math.random().toString(),
          title: job.title,
          company: job.company || job.employerName,
          employerLogo: job.employerLogo || "",
          location: job.location || "Remote",
          employmentType: job.employmentType || "Full-Time",
          salary: job.salary || "N/A",
          applyLink: job.applyLink,
          description: job.description || "",
          matchScore: job.matchScore || 80,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess("Job saved successfully!");
        fetchSavedJobs();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save job.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <header className="flex items-center justify-between pb-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Briefcase size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Job Recommendations</h2>
            <p className="text-xs text-slate-400">Discover job offers matching your parsed skills and experience profile</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900/60 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab("recommend")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === "recommend" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === "saved" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Saved Jobs ({savedJobs.length})
          </button>
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

      {activeTab === "recommend" ? (
        <div className="space-y-8">
          {/* Resume selection form */}
          {jobs.length === 0 && (
            <form onSubmit={findJobs} className="max-w-xl bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Search Parameters</h3>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Choose Resume Profile</label>
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

              <button
                type="submit"
                disabled={loading || resumes.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-lg transition"
              >
                {loading ? "Matching Jobs..." : "Fetch Matching Jobs"}
              </button>
            </form>
          )}

          {/* Job listings */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs">
              <LoadingAnimation />
              <p className="mt-4">Scanning active markets using resume profile...</p>
            </div>
          ) : (
            jobs.length > 0 && (
              <div className="space-y-6">
                <button
                  onClick={() => setJobs([])}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
                >
                  <ArrowLeft size={14} /> Clear Search
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job, index) => (
                    <div key={index} className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between hover:border-slate-700/60 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">{job.title}</h4>
                            <p className="text-xs text-indigo-400 font-semibold mt-0.5">{job.company || job.employerName}</p>
                          </div>
                          {job.matchScore && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Score: {job.matchScore}%
                            </span>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-950/40 rounded border border-slate-900">
                            <MapPin size={10} /> {job.location || "Remote"}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-950/40 rounded border border-slate-900">
                            <DollarSign size={10} /> {job.salary || "Competitive"}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-950/40 rounded border border-slate-900">
                            <Calendar size={10} /> {job.employmentType || "Full-Time"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-slate-900">
                        <button
                          onClick={() => handleSaveJob(job)}
                          className="flex items-center justify-center p-2 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          title="Save Job"
                        >
                          <Bookmark size={14} />
                        </button>
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition"
                        >
                          Apply Now
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        /* Saved Jobs list */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.length > 0 ? (
            savedJobs.map((job) => (
              <div key={job._id} className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{job.title}</h4>
                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">{job.company}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-950/40 rounded border border-slate-900">
                      <MapPin size={10} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-950/40 rounded border border-slate-900">
                      <DollarSign size={10} /> {job.salary}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-950/40 rounded border border-slate-900">
                      <Calendar size={10} /> {job.employmentType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition"
                >
                  Apply Now
                  <ExternalLink size={12} />
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-slate-500 py-12 text-sm">
              You haven't saved any jobs yet. Browse recommended jobs to save them here!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
