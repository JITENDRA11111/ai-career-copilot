import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Cpu, Award } from "lucide-react";
import { useReviewStream } from "../hooks/useReviewStream";
import LoadingAnimation from "../components/LoadingAnimation";
import ReviewCard from "../components/ReviewCard";

export default function ReviewPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const {
    connected,
    isStreaming,
    progress,
    step,
    chunks,
    review,
    error,
    startReview,
    stopReview,
  } = useReviewStream();

  // Trigger review on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (resumeId && token) {
      startReview(resumeId, token);
    }
  }, [resumeId, token, navigate]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <header className="flex items-center justify-between pb-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Resume Reviewer</h2>
            <p className="text-xs text-slate-400">Detailed overview of resume structure, technical skills, and improvements</p>
          </div>
        </div>

        <Link
          to="/resume"
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
        >
          <ArrowLeft size={14} /> Back to Resumes
        </Link>
      </header>

      {/* Connection & Live Progress Overlay */}
      {isStreaming && (
        <div className="space-y-6">
          <LoadingAnimation
            progress={progress}
            step={step}
            title="Analyzing Resume"
            description="Llama is reading your resume structures and scoring credentials..."
          />

          {/* Real-time thought logs stream */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-3">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={14} className="animate-spin" /> Real-time Streaming Output
            </p>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-900 max-h-48 overflow-y-auto pr-1">
              <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {chunks || "Connecting to stream server..."}
              </pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={stopReview}
                className="px-4 py-2 bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600/20 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Abort Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Block */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm">AI Analysis Failed</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">{error}</p>
          <button
            onClick={() => startReview(resumeId, token)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition shadow-md"
          >
            <RefreshCw size={12} /> Retry Analysis
          </button>
        </div>
      )}

      {/* Completed Review Card */}
      {!isStreaming && review && (
        <div className="bg-slate-900/10 p-1 border border-slate-900 rounded-xl space-y-6 text-slate-800">
          <ReviewCard review={review} />
        </div>
      )}
    </div>
  );
}