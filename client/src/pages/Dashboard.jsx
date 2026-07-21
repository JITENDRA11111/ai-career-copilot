import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Award, Terminal, LogOut, ShieldAlert, Cpu } from "lucide-react";
import axios from "axios";
import DashboardStats from "../components/DashboardStats";
import ProgressCharts from "../components/ProgressCharts";
import ActivityFeed from "../components/ActivityFeed";
import LoadingAnimation from "../components/LoadingAnimation";

const STATS_API = "http://localhost:5000/api/v1/user/dashboard-stats";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(STATS_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setData(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard statistics.");
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-900">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user.name || "User")}`}
              alt="Avatar"
              className="w-12 h-12 rounded-xl border border-slate-800 shadow-md"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                Hi, {user.name || "Candidate"}
              </h1>
              <p className="text-xs text-slate-400 font-medium">Ready to copilot your career path?</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition"
              >
                <ShieldAlert size={16} />
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition cursor-pointer"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Core Stats Cards */}
        <DashboardStats stats={data?.stats} />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Charts widget */}
          <div className="xl:col-span-2 space-y-8">
            <ProgressCharts charts={data?.charts} />
          </div>

          {/* Activity feed & Quick Actions */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2.5 mb-6">
                <Cpu size={18} className="text-indigo-400" />
                <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Quick Actions
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/resume"
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/40 transition group"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition">
                      Upload Resume
                    </p>
                    <p className="text-xs text-slate-400">Upload and parse resume metrics</p>
                  </div>
                </Link>

                <Link
                  to="/ats"
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/40 transition group"
                >
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Award size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition">
                      ATS Match Scanner
                    </p>
                    <p className="text-xs text-slate-400">Match score against job descriptions</p>
                  </div>
                </Link>

                {/* Coding Sandbox Route */}
                <Link
                  to="/coding"
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/40 transition group cursor-pointer"
                >
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Terminal size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition">
                      Coding Test Sandbox
                    </p>
                    <p className="text-xs text-slate-400">Challenge algorithm problems</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Activity Feed Widget */}
            <ActivityFeed activities={data?.activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
