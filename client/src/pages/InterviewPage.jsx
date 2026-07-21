import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { UserCheck, ShieldAlert, Award, FileText, Send, Star, AlertCircle, ArrowLeft, Mic, MicOff } from "lucide-react";
import LoadingAnimation from "../components/LoadingAnimation";
import { useNavigationStore } from "../store/navigationStore";

const START_API = `${import.meta.env.VITE_API_URL}/interview/start`;
const LIST_RESUMES_API = `${import.meta.env.VITE_API_URL}/resume/list`;

export default function InterviewPage() {
  const { setIsTaskActive } = useNavigationStore();
  
  // Session states
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [interviewType, setInterviewType] = useState("technical");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [socket, setSocket] = useState(null);

  // QA states
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [answer, setAnswer] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [sessionCompleteReport, setSessionCompleteReport] = useState(null);
  const [error, setError] = useState("");
  
  // Mic state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

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

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  // Protect active session navigation
  useEffect(() => {
    setIsTaskActive(!!session && !sessionCompleteReport);
  }, [session, sessionCompleteReport, setIsTaskActive]);

  // Handle browser back button during active session or report view
  useEffect(() => {
    const handlePopState = (e) => {
      if (session || sessionCompleteReport) {
        if (socket) socket.disconnect();
        if (recognitionRef.current) recognitionRef.current.stop();
        setSession(null);
        setSessionCompleteReport(null);
        setIsRecording(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [session, sessionCompleteReport, socket]);

  const startSession = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setFeedbackList([]);
    setCurrentFeedback(null);
    setSessionCompleteReport(null);

    try {
      const response = await axios.post(
        START_API,
        { resumeId, jobTitle, type: interviewType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const activeSession = response.data.data;
        setSession(activeSession);
        setCurrentQuestion(activeSession.question);
        setQuestionIndex(0);
        setLoading(false);
        window.history.pushState({ session: true }, "");

        // Initialize Sockets practice namespace
        const ioSocket = io(`${import.meta.env.VITE_API_URL.replace("/api/v1", "")}/interview`, {
          auth: { token },
        });

        ioSocket.on("connect", () => {
          console.log("Socket practice session established.");
          ioSocket.emit("join_session", { sessionId: activeSession.sessionId });
        });

        ioSocket.on("feedback", (data) => {
          setCurrentFeedback(data);
          setFeedbackList((prev) => [...prev, data]);
          setLoading(false);
        });

        ioSocket.on("next_question", (data) => {
          setCurrentQuestion(data.question);
          setQuestionIndex(data.index);
          setTotalQuestions(data.total);
          setAnswer("");
          setLoading(false);
        });

        ioSocket.on("session_complete", (data) => {
          setSessionCompleteReport(data);
          setLoading(false);
          ioSocket.disconnect();
        });

        ioSocket.on("error", (err) => {
          setError(err.message || "Socket interaction failed.");
          setLoading(false);
        });

        setSocket(ioSocket);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initialize interview session.");
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Your browser does not support Voice-to-Text. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setAnswer((prev) => prev + (prev.endsWith(" ") ? "" : " ") + transcript);
        } else {
          currentTranscript += transcript;
        }
      }
      // Note: we're only appending final results to the main answer box for simplicity
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setError("Microphone error: " + event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setError("");
  };

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim() || !socket || !session) return;
    setError("");
    setLoading(true);
    setCurrentFeedback(null);

    socket.emit("answer", {
      sessionId: session.sessionId,
      questionIndex,
      answer: answer.trim(),
    });
  };

  const handleEarlySubmit = () => {
    if (!socket || !session) return;
    setLoading(true);
    socket.emit("early_submit", { sessionId: session.sessionId });
  };

  if (sessionCompleteReport) {
    const report = sessionCompleteReport.report;
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-sans">
        <header className="flex justify-between items-center pb-6 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Interview Completed</h2>
              <p className="text-xs text-slate-400">Excellent job completing your preparation session!</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSession(null);
              setSessionCompleteReport(null);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          >
            <ArrowLeft size={14} /> Start New Session
          </button>
        </header>

        {/* Report Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Score</p>
            <h3 className="text-5xl font-black text-indigo-400 mt-2">{sessionCompleteReport.overallScore}/100</h3>
          </div>

          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-2 md:col-span-2">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Strengths</h4>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2">
              {report?.strengths?.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-3">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Improvements</h4>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2">
            {report?.improvements?.map((imp, idx) => (
              <li key={idx}>{imp}</li>
            ))}
          </ul>
        </div>

        {/* Q&A Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Question Breakdown</h4>
          <div className="space-y-4">
            {report?.questionBreakdown?.map((q, idx) => (
              <div key={idx} className="p-5 bg-slate-900/10 border border-slate-800/60 rounded-xl space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm font-semibold text-indigo-400">Q{idx + 1}: {q.question}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Star size={10} /> Score: {q.score}
                  </span>
                </div>
                <p className="text-xs text-slate-300"><span className="font-semibold text-slate-400">Answer:</span> {q.answer}</p>
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900">
                  <p className="text-xs text-slate-400"><span className="font-semibold text-emerald-400">Feedback:</span> {q.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <header className="flex items-center gap-3 pb-6 border-b border-slate-900">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
          <UserCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI Interview Practice Room</h2>
          <p className="text-xs text-slate-400">Practice behavioral, technical, or HR questions in real-time with AI</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!session ? (
        <form onSubmit={startSession} className="max-w-xl bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Configure Practice Session</h3>

          <div className="space-y-4">
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
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Target Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Node.js Engineer"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Interview Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none"
              >
                <option value="technical">Technical Code & Architecture</option>
                <option value="behavioral">Behavioral / Leadership</option>
                <option value="hr">HR / Fit Checks</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || resumes.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? "Starting Session..." : "Initialize Session"}
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Q&A Interface */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Question {questionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-slate-500 font-medium">Session Status: Active</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-100 leading-relaxed">{currentQuestion}</p>
              </div>

              <form onSubmit={submitAnswer} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Your Answer</label>
                  <div className="relative">
                    <textarea
                      required
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your detailed response here..."
                      className={`w-full h-36 bg-slate-950 border ${isRecording ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-slate-800'} focus:border-indigo-500 rounded-lg p-3 pr-12 text-xs text-slate-100 outline-none resize-none transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`absolute right-3 bottom-3 p-2 rounded-full transition-all duration-300 ${
                        isRecording 
                          ? "bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/50" 
                          : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                      }`}
                      title={isRecording ? "Stop Recording" : "Start Recording"}
                    >
                      {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (socket) socket.disconnect();
                      setSession(null);
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                  >
                    Cancel Session
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleEarlySubmit}
                      disabled={loading || questionIndex === 0 && !feedbackList.length}
                      className="px-4 py-2.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/20 disabled:opacity-50 text-xs font-semibold rounded-lg transition"
                      title="End the interview early and calculate a score for the questions answered so far."
                    >
                      End Early
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !answer.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                    >
                      {loading ? "Evaluating..." : "Submit Answer"}
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Real-time feedback timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real-time Performance</h4>
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-4 max-h-[400px] overflow-y-auto">
              {currentFeedback ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Score: {currentFeedback.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-400 block mb-1">AI Feedback:</span>
                    {currentFeedback.feedback}
                  </p>
                  {currentFeedback.followUp && (
                    <div className="p-3 bg-indigo-500/5 rounded border border-indigo-500/10">
                      <p className="text-[11px] text-indigo-400 leading-relaxed">
                        <span className="font-bold block mb-1">AI Follow-up:</span>
                        {currentFeedback.followUp}
                      </p>
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <LoadingAnimation title="AI Interview Evaluation" description="AI is reviewing your answer and calculating feedback metrics..." />
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8 text-xs">
                  Submit an answer to receive live AI feedback and scoring.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
