import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, FileText, UserCheck, BarChart2, ShieldAlert, Home, Terminal, History } from "lucide-react";
import axios from "axios";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import UsersTable from "../components/UsersTable";
import LoadingAnimation from "../components/LoadingAnimation";

const STATS_API = `${import.meta.env.VITE_API_URL}/admin/stats`;
const LOGS_API = `${import.meta.env.VITE_API_URL}/admin/logs`;
const USERS_API = `${import.meta.env.VITE_API_URL}/admin/users`;

export default function Admin() {
  const [statsData, setStatsData] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const statsRes = await axios.get(STATS_API, { headers: { Authorization: `Bearer ${token}` } });
      const logsRes = await axios.get(LOGS_API, { headers: { Authorization: `Bearer ${token}` } });
      const usersRes = await axios.get(`${USERS_API}?page=${page}&limit=10&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatsData(statsRes.data);
      setLogsData(logsRes.data.logs);
      setUsers(usersRes.data.users);
      setPagination(usersRes.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard data.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [page, search, token, navigate]);

  const handleRoleChange = async (userId, newRole) => {
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(
        `${USERS_API}/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSuccess(res.data.message);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate (soft-delete) this user account?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await axios.delete(`${USERS_API}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  const overallStats = statsData?.stats;
  const signupsTrend = statsData?.charts?.signupsTrend || [];
  const featureUsage = statsData?.charts?.featureUsage || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">Admin Control Panel</h1>
              <p className="text-xs text-slate-400 font-medium">Manage platform parameters and check telemetry</p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition"
          >
            <Home size={16} />
            Dashboard
          </Link>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* Platform Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-slate-800 p-6 rounded-xl bg-slate-900/20 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-100">{overallStats?.totalUsers || 0}</h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users size={20} />
            </div>
          </div>

          <div className="border border-slate-800 p-6 rounded-xl bg-slate-900/20 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Resumes Indexed</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-100">{overallStats?.totalResumes || 0}</h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText size={20} />
            </div>
          </div>

          <div className="border border-slate-800 p-6 rounded-xl bg-slate-900/20 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Interviews Generated</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-100">{overallStats?.totalInterviews || 0}</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <UserCheck size={20} />
            </div>
          </div>

          <div className="border border-slate-800 p-6 rounded-xl bg-slate-900/20 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Average Match Score</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-100">{overallStats?.avgAtsScore || 0}%</h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BarChart2 size={20} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Signups Trend Line Chart */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md">
            <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
              Signup Velocity (Last 7 Days)
            </h4>
            <div className="h-64 w-full">
              {signupsTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={signupsTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Line type="monotone" dataKey="signups" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No signups registered recently
                </div>
              )}
            </div>
          </div>

          {/* Feature Usage Bar Chart */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md">
            <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
              Feature Usage Aggregation
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsage} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Management and Activity Logs Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <h4 className="text-md font-bold text-slate-200 uppercase tracking-wider">User Directory</h4>
            <UsersTable
              users={users}
              pagination={pagination}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              onRoleChange={handleRoleChange}
              onDelete={handleDeleteUser}
            />
          </div>

          {/* Activity Logs feed */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <History size={18} className="text-rose-400" />
              <h4 className="text-md font-bold text-slate-200 uppercase tracking-wider">System Logs</h4>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md max-h-[500px] overflow-y-auto space-y-4">
              {logsData.length > 0 ? (
                logsData.map((log) => (
                  <div key={log.id} className="text-xs border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between text-slate-400">
                      <span className="font-semibold text-rose-400">{log.action}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 mt-1 font-medium">{log.details}</p>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>User: {log.user.email}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8 text-sm">
                  No activity logs registered
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
