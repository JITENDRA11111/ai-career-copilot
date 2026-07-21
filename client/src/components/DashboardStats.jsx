import { FileText, Award, Terminal, Activity } from "lucide-react";

export default function DashboardStats({ stats }) {
  const cards = [
    {
      title: "Average ATS Match",
      value: `${stats?.avgAtsScore || 0}%`,
      description: "Match rate against target jobs",
      icon: Award,
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    },
    {
      title: "Resumes Uploaded",
      value: stats?.resumesCount || 0,
      description: "Documents stored & parsed",
      icon: FileText,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      title: "Avg Interview Score",
      value: `${stats?.avgInterviewScore || 0}%`,
      description: "Across all practice interviews",
      icon: Activity,
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    },
    {
      title: "Interviews Conducted",
      value: stats?.interviewsCount || 0,
      description: "AI Practice sessions completed",
      icon: Activity,
      color: "text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5",
    },
    {
      title: "Avg Coding Score",
      value: `${stats?.avgCodingScore || 0}%`,
      description: "Overall algorithmic performance",
      icon: Terminal,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    },
    {
      title: "Coding Tests Taken",
      value: stats?.codingTestsCount || 0,
      description: "Skills verified via editor",
      icon: Terminal,
      color: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`border p-6 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60 ${card.color.split(" ")[1]} ${card.color.split(" ")[2]}`}
        >
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-100">{card.value}</h3>
            <p className="text-slate-400 text-xs mt-1.5">{card.description}</p>
          </div>
          <div className={`p-3 rounded-lg border ${card.color.split(" ")[0]} ${card.color.split(" ")[1]}`}>
            <card.icon size={22} />
          </div>
        </div>
      ))}
    </div>
  );
}
