import { FileText, Award, UserCheck, Terminal, Calendar } from "lucide-react";

export default function ActivityFeed({ activities }) {
  const getIcon = (type) => {
    switch (type) {
      case "resume":
        return { icon: FileText, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case "ats":
        return { icon: Award, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
      case "interview":
        return { icon: UserCheck, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
      default:
        return { icon: Terminal, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2.5 mb-6">
        <Calendar size={18} className="text-indigo-400" />
        <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Recent Activity
        </h4>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {activities && activities.length > 0 ? (
          activities.map((act) => {
            const config = getIcon(act.type);
            return (
              <div
                key={act.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-900/30 transition-colors"
              >
                <div className={`p-2 rounded-lg border flex-shrink-0 ${config.color}`}>
                  <config.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{act.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(act.date)}</p>
                </div>
                {act.score !== undefined && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Score: {act.score}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm">
            No recent activity to show
          </div>
        )}
      </div>
    </div>
  );
}
