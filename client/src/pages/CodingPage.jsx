import { useState, useEffect } from "react";
import axios from "axios";
import { Terminal, Award, HelpCircle, Code2, Play, CheckCircle2, XCircle, AlertCircle, Shuffle, BookOpen, Clock } from "lucide-react";
import LoadingAnimation from "../components/LoadingAnimation";
import Editor from "@monaco-editor/react";
import { useNavigationStore } from "../store/navigationStore";
import { useThemeStore } from "../store/themeStore";

const GENERATE_API = `${import.meta.env.VITE_API_URL}/coding/generate`;
const GENERATE_OA_API = `${import.meta.env.VITE_API_URL}/coding/generate-oa`;
const SUBMIT_API = `${import.meta.env.VITE_API_URL}/coding/submit`;

export default function CodingPage() {
  const { setIsTaskActive } = useNavigationStore();
  const { theme } = useThemeStore();
  const [mode, setMode] = useState(null); // 'random', 'topic', 'oa'
  const [skill, setSkill] = useState("Arrays");
  const [difficulty, setDifficulty] = useState("easy");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  
  // Single mode state
  const [test, setTest] = useState(null);
  
  // OA mode state
  const [oaTests, setOaTests] = useState([]);
  const [oaIndex, setOaIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [oaActive, setOaActive] = useState(false);
  const [showEarlySubmitModal, setShowEarlySubmitModal] = useState(false);

  const [codes, setCodes] = useState({ javascript: "", cpp: "", python: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showHintIndex, setShowHintIndex] = useState(-1);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Timer logic for OA
  useEffect(() => {
    let timer;
    if (oaActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setOaActive(false);
    }
    return () => clearInterval(timer);
  }, [oaActive, timeLeft]);

  // Format time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Sync codes when a new test is loaded
  const currentTest = mode === 'oa' ? oaTests[oaIndex] : test;

  useEffect(() => {
    if (currentTest && currentTest.starterCode) {
      setCodes({
        javascript: currentTest.starterCode.javascript || "",
        cpp: currentTest.starterCode.cpp || "",
        python: currentTest.starterCode.python || ""
      });
      setResult(currentTest.result || null); // Load saved result if navigating in OA
      setShowHintIndex(-1);
    }
  }, [currentTest, oaIndex]);

  useEffect(() => {
    setIsTaskActive(mode !== null);
  }, [mode, setIsTaskActive]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (mode !== null) {
        // If we were in a mode and user clicked back, return to setup
        setMode(null);
        setTest(null);
        setOaTests([]);
        setOaActive(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [mode]);

  const generateQuestion = async (isRandom = false) => {
    setError("");
    setLoading(true);
    setTest(null);
    setResult(null);
    setShowHintIndex(-1);

    try {
      const payload = isRandom ? { skill: "Random", difficulty: ["easy", "medium", "hard"][Math.floor(Math.random()*3)], language } : { skill, difficulty, language };
      const response = await axios.post(GENERATE_API, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setTest(response.data.codingTest);
        setMode(isRandom ? 'random' : 'topic');
        window.history.pushState({ session: true }, "");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate coding problem.");
    } finally {
      setLoading(false);
    }
  };

  const generateOA = async () => {
    setError("");
    setLoading(true);
    setOaTests([]);
    setResult(null);

    try {
      const response = await axios.post(GENERATE_OA_API, { language }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setOaTests(response.data.codingTests);
        setOaIndex(0);
        setTimeLeft(60 * 60);
        setOaActive(true);
        setMode('oa');
        window.history.pushState({ session: true }, "");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate OA.");
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!codes[language]?.trim() || !currentTest || submitting || (mode === 'oa' && !oaActive)) return;

    setError("");
    setSubmitting(true);
    setResult(null);

    try {
      const response = await axios.post(SUBMIT_API, { testId: currentTest._id, code: codes[language].trim(), language }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setResult(response.data.result);
        if (mode === 'oa') {
          // Save result in OA tests array so user doesn't lose it when switching tabs
          const updatedOATests = [...oaTests];
          updatedOATests[oaIndex].result = response.data.result;
          setOaTests(updatedOATests);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Compilation/Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const backToSetup = () => {
    setMode(null);
    setTest(null);
    setOaTests([]);
    setOaActive(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <header className="flex items-center justify-between pb-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Terminal size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Algorithms Coding Sandbox</h2>
            <p className="text-xs text-slate-400">Master coding questions or take a simulated assessment.</p>
          </div>
        </div>
        
        {mode === 'oa' && oaActive && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEarlySubmitModal(true)}
              className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              End Assessment Early
            </button>
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-bold text-lg ${timeLeft <= 300 ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-slate-900/50 border-slate-800 text-slate-300'}`}>
              <Clock size={18} />
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </header>

      {/* Custom Early Submit Confirmation Modal */}
      {showEarlySubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">End Assessment?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your final score will be calculated based on your current progress.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setShowEarlySubmitModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setOaActive(false);
                  setTimeLeft(0);
                  setShowEarlySubmitModal(false);
                }}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition shadow-lg"
              >
                End Now
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center text-center min-h-[400px]">
          <LoadingAnimation title="Compiling Sandbox Challenge" description={mode === 'oa' ? "Assembling 3-question OA (this may take up to 30s)..." : "Building your challenge..."} />
        </div>
      )}

      {!loading && !mode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => generateQuestion(true)} className="flex flex-col items-start text-left p-6 bg-slate-900/20 border border-slate-800 rounded-xl hover:bg-slate-900/50 hover:border-indigo-500/30 transition group cursor-pointer">
            <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-lg mb-4 group-hover:scale-110 transition-transform">
              <Shuffle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Random Challenge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Feeling lucky? Dive straight into a completely random DSA problem of varying difficulty to test your adaptability.</p>
          </button>

          <div className="flex flex-col items-start text-left p-6 bg-slate-900/20 border border-slate-800 rounded-xl">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Topic-Wise Practice</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Target your weak spots. Select a specific algorithm family and difficulty level to drill.</p>
            <div className="w-full space-y-3">
              <select value={skill} onChange={(e) => setSkill(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none">
                <option value="Arrays">Arrays & Hashing</option>
                <option value="Strings">String Manipulation</option>
                <option value="Two Pointers">Two Pointers</option>
                <option value="Sliding Window">Sliding Window</option>
                <option value="Binary Search">Binary Search</option>
                <option value="Stack & Queue">Stack & Queue</option>
                <option value="Linked Lists">Linked Lists</option>
                <option value="Trees">Trees & Graphs</option>
                <option value="Heaps">Heaps & Priority Queues</option>
                <option value="Backtracking">Backtracking</option>
                <option value="Dynamic Programming">Dynamic Programming (1D & 2D)</option>
                <option value="Greedy">Greedy Algorithms</option>
                <option value="Bit Manipulation">Bit Manipulation</option>
                <option value="Math">Math & Geometry</option>
                <option value="Advanced Topics">Advanced Topics</option>
              </select>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-slate-100 outline-none">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button onClick={() => generateQuestion(false)} className="w-full bg-slate-800 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg transition cursor-pointer">
                Start Practice
              </button>
            </div>
          </div>

          <button onClick={generateOA} className="flex flex-col items-start text-left p-6 bg-slate-900/20 border border-slate-800 rounded-xl hover:bg-slate-900/50 hover:border-amber-500/30 transition group cursor-pointer">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg mb-4 group-hover:scale-110 transition-transform">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Mock OA (60 Min)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Simulate a real-world Online Assessment. You will be given 3 random questions (Easy, Medium, Hard) and 60 minutes to solve them all.</p>
          </button>
        </div>
      )}

      {mode === 'oa' && !oaActive && oaTests.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="flex justify-between items-center pb-6 border-b border-slate-900">
            <div>
              <h2 className="text-xl font-bold text-emerald-400">Assessment Completed</h2>
              <p className="text-xs text-slate-400 mt-1">Here is a summary of your performance across the 3 challenges.</p>
            </div>
            <button onClick={backToSetup} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold transition">
              Return to Menu
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Score</p>
              <h3 className="text-5xl font-black text-indigo-400 mt-2">
                {Math.round(
                  oaTests.reduce((sum, t) => sum + (t.result?.score || 0), 0) / oaTests.length
                )}/100
              </h3>
            </div>
            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-2 md:col-span-2">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Questions Overview</h4>
              <div className="space-y-3 mt-4">
                {oaTests.map((t, idx) => {
                  const passed = t.result?.passed || 0;
                  const total = t.result?.total || 0;
                  const isPerfect = passed === total && total > 0;
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-900">
                      <div>
                        <span className="text-xs font-bold text-slate-200">Q{idx + 1}: {t.title}</span>
                        <span className="ml-2 text-[10px] uppercase text-indigo-400">{t.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{passed} / {total} tests</span>
                        {isPerfect ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-rose-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && currentTest && (mode !== 'oa' || oaActive) && (
        <div className="space-y-6 animate-fade-in">
          {mode === 'oa' && (
            <div className="flex gap-2">
              {oaTests.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setOaIndex(idx)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${oaIndex === idx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
                >
                  <span>Q{idx + 1}. {t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1)}</span>
                  {t.result?.passed === t.result?.total && t.result?.total > 0 && <CheckCircle2 size={14} className="text-emerald-400" />}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Question Description and details */}
            <div className="space-y-6">
              <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-slate-100">{currentTest.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                    {currentTest.difficulty}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentTest.description}
                </div>

                {currentTest.examples && currentTest.examples.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Examples</h4>
                    {currentTest.examples.map((ex, index) => (
                      <div key={index} className="bg-slate-950/50 border border-slate-900 rounded-lg p-3 text-xs space-y-1.5 font-mono">
                        <p><span className="text-slate-500">Input:</span> {JSON.stringify(ex.input)}</p>
                        <p><span className="text-slate-500">Output:</span> {JSON.stringify(ex.output)}</p>
                        {ex.explanation && <p className="text-[10px] text-slate-500 font-sans mt-1 italic"><span className="font-semibold">Explanation:</span> {ex.explanation}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {currentTest.hints && currentTest.hints.length > 0 && (
                <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle size={14} /> Hints & Tips
                  </h4>
                  <div className="space-y-2">
                    {currentTest.hints.map((hint, idx) => (
                      <div key={idx} className="border border-slate-800/60 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowHintIndex(showHintIndex === idx ? -1 : idx)}
                          className="w-full text-left px-4 py-2 bg-slate-950/40 text-[11px] font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                        >
                          {showHintIndex === idx ? "Hide" : "Show"} Hint {idx + 1}
                        </button>
                        {showHintIndex === idx && (
                          <div className="px-4 py-3 bg-slate-950/20 text-xs text-slate-300 border-t border-slate-800/40 leading-relaxed">
                            {hint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Code Editor & Submission results */}
            <div className="space-y-6">
              <form onSubmit={submitSolution} className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 size={14} /> Editor
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="ml-2 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python 3</option>
                      <option value="cpp">C++ (GCC)</option>
                    </select>
                  </span>
                  <button
                    type="button"
                    onClick={backToSetup}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    Quit & Back to Setup
                  </button>
                </div>

                <div className="flex-1 bg-slate-950/80 relative">
                  <Editor
                    key={theme}
                    height="100%"
                    language={language === "cpp" ? "cpp" : language}
                    theme={theme === "light" ? "light" : "custom-dark"}
                    beforeMount={(monaco) => {
                      monaco.editor.defineTheme("custom-dark", {
                        base: "vs-dark", inherit: true, rules: [], colors: { "editor.background": theme === "hacker" ? "#1a1a1a" : "#020617" },
                      });
                    }}
                    value={codes[language]}
                    onChange={(value) => setCodes(prev => ({ ...prev, [language]: value || "" }))}
                    options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on", scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 }, fontFamily: "JetBrains Mono, monospace" }}
                  />
                </div>

                <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !codes[language]?.trim() || (mode === 'oa' && !oaActive)}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shadow-md cursor-pointer"
                  >
                    {submitting ? "Compiling..." : "Submit & Run"}
                    <Play size={12} />
                  </button>
                </div>
              </form>

              {result && (
                <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl space-y-4 animate-fade-in text-slate-200">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Output</h4>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      AI Score: {result.score}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-900 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Test Cases Passed</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {result.passed === result.total ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-rose-400" />}
                        <span className="text-lg font-bold">{result.passed} / {result.total}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-900 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verdict</p>
                      <span className={`text-xs font-semibold mt-2 px-2 py-0.5 rounded ${result.passed === result.total ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {result.passed === result.total ? "Accepted" : result.results?.find((r) => r.status === "Compilation Error") ? "Compilation Error" : result.results?.find((r) => r.status !== "Passed" && r.status !== "Failed")?.status || "Rejected"}
                      </span>
                    </div>
                  </div>

                  {result.results?.some((r) => r.stderr) && (
                    <div className="p-4 bg-red-950/40 rounded-lg border border-red-900/50 space-y-2 mt-4">
                      <span className="font-bold text-red-400 block mb-1 text-xs uppercase">Error Output:</span>
                      <pre className="text-[10px] text-red-300 whitespace-pre-wrap font-mono overflow-auto max-h-40">
                        {result.results.find((r) => r.stderr)?.stderr || "Execution failed."}
                      </pre>
                    </div>
                  )}

                  {result.feedback && (
                    <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-900 space-y-3">
                      <div>
                        <span className="font-bold text-indigo-400 block mb-1 text-xs">AI Critique Summary:</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{result.feedback.summary}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
