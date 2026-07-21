import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShieldCheck, AlertTriangle } from "lucide-react";
import Sidebar from "./Sidebar";
import { useNavigationStore } from "../store/navigationStore";
import { useThemeStore } from "../store/themeStore";

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isTaskActive, setIsTaskActive, showWarningModal, pendingPath, setShowWarningModal } = useNavigationStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Resumes", path: "/resume" },
    { name: "ATS Match", path: "/ats" },
    { name: "Skill Gap", path: "/skills" },
    { name: "Coding Sandbox", path: "/coding" },
    { name: "AI Interview", path: "/interview" },
    { name: "Jobs Recommendations", path: "/jobs" },
  ];

  const handleMobileNavClick = (e, path) => {
    if (isTaskActive && location.pathname !== path) {
      e.preventDefault();
      setMobileMenuOpen(false);
      setShowWarningModal(true, path);
    } else {
      setMobileMenuOpen(false);
    }
  };

  const handleConfirmLeave = () => {
    setIsTaskActive(false);
    setShowWarningModal(false, null);
    if (pendingPath) {
      navigate(pendingPath);
    }
  };

  const handleCancelLeave = () => {
    setShowWarningModal(false, null);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background glow ornaments */}
      {theme !== 'hacker' && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <ShieldCheck size={16} />
            </div>
            <span className="font-bold text-sm tracking-wider uppercase">Career Copilot</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        {/* Mobile Overlay Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[57px] bg-slate-950 z-20 flex flex-col p-6 space-y-4">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={(e) => handleMobileNavClick(e, item.path)}
                    className={`px-4 py-3 rounded-lg text-sm font-semibold transition ${
                      isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="mt-auto w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-semibold text-rose-400"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Page Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10">
          {children}
        </main>
      </div>

      {/* Global Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                <AlertTriangle size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">Leave Active Session?</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  You are currently in an active task or session. If you leave now, all your unsaved progress will be permanently lost.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCancelLeave}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-amber-900/20"
              >
                Yes, leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
