import { Link, useLocation } from "react-router-dom";
import { useNavigationStore } from "../store/navigationStore";
import { useThemeStore } from "../store/themeStore";
import {
  LayoutDashboard,
  FileText,
  Award,
  Terminal,
  UserCheck,
  Briefcase,
  ShieldCheck,
  LogOut,
  Target,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { isTaskActive, setShowWarningModal } = useNavigationStore();
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    if (theme === 'original') setTheme('hacker');
    else if (theme === 'hacker') setTheme('light');
    else setTheme('original');
  };

  const getThemeIcon = () => {
    if (theme === 'original') return <Monitor size={16} />;
    if (theme === 'hacker') return <Moon size={16} />;
    return <Sun size={16} />;
  };

  const getThemeLabel = () => {
    if (theme === 'original') return 'Original Theme';
    if (theme === 'hacker') return 'Hacker Theme';
    return 'Light Theme';
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Resumes", path: "/resume", icon: FileText },
    { name: "ATS Match", path: "/ats", icon: Award },
    { name: "Skill Gap", path: "/skills", icon: Target },
    { name: "Coding Sandbox", path: "/coding", icon: Terminal },
    { name: "AI Interview", path: "/interview", icon: UserCheck },
    { name: "Jobs Recommendations", path: "/jobs", icon: Briefcase },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleNavClick = (e, path) => {
    if (isTaskActive && location.pathname !== path) {
      e.preventDefault();
      setShowWarningModal(true, path);
    }
  };

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between p-5 backdrop-blur-md shrink-0 h-screen sticky top-0 hidden md:flex">
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <ShieldCheck size={20} />
          </div>
          <span className="font-bold text-md text-slate-100 uppercase tracking-wider">
            Career Copilot
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {/* User Card */}
        {user.role === "admin" && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              location.pathname.startsWith("/admin")
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                : "text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/10"
            }`}
          >
            <ShieldCheck size={16} />
            Admin Panel
          </Link>
        )}

        <button
          onClick={cycleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 transition cursor-pointer"
        >
          {getThemeIcon()}
          {getThemeLabel()}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition cursor-pointer"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
