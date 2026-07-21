import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function ProgressCharts({ charts }) {
  const atsData = charts?.atsScoresOverTime || [];
  const skillData = charts?.skillCoverage || [];
  const interviewData = charts?.interviewScoresByType || [];
  const targetRole = charts?.targetRole || "Software Engineer";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Line Chart: ATS over time */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md lg:col-span-2">
        <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
          ATS Score Progression
        </h4>
        <div className="h-64 w-full">
          {atsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={atsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-800)" />
                <XAxis dataKey="date" stroke="var(--color-slate-500)" fontSize={10} />
                <YAxis stroke="var(--color-slate-500)" domain={[0, 100]} fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-slate-950)", borderColor: "var(--color-slate-800)" }}
                  labelStyle={{ color: "var(--color-slate-400)" }}
                  cursor={{ fill: "var(--color-slate-800)" }}
                />
                <Line type="monotone" dataKey="score" stroke="var(--color-indigo-500)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Practice ATS scoring to view progression
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart: Skill Gap / Coverage */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md">
        <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Skill Gap Analysis
        </h4>
        <p className="text-xs text-indigo-400 mt-1 mb-4 truncate font-medium">Target: {targetRole}</p>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
              <PolarGrid stroke="var(--color-slate-800)" />
              <PolarAngleAxis dataKey="skill" stroke="var(--color-slate-400)" fontSize={9} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--color-slate-600)" fontSize={8} />
              <Radar name="Current Skills" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              <Radar name="Target Skills" dataKey="target" stroke="var(--color-indigo-500)" fill="var(--color-indigo-500)" fillOpacity={0.1} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-slate-950)", borderColor: "var(--color-slate-800)" }}
                labelStyle={{ color: "var(--color-slate-400)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Interview Score by Type */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md lg:col-span-1">
        <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
          Average Interview Scores
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={interviewData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-800)" />
              <XAxis dataKey="type" stroke="var(--color-slate-500)" fontSize={10} />
              <YAxis stroke="var(--color-slate-500)" domain={[0, 100]} fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-slate-950)", borderColor: "var(--color-slate-800)" }}
                labelStyle={{ color: "var(--color-slate-400)" }}
                cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
              />
              <Bar dataKey="score" fill="var(--color-indigo-400)" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Coding Score by Difficulty */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl shadow-lg backdrop-blur-md lg:col-span-2">
        <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
          Average Coding Scores by Difficulty
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts?.codingScoresByDifficulty || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-800)" />
              <XAxis dataKey="difficulty" stroke="var(--color-slate-500)" fontSize={10} />
              <YAxis stroke="var(--color-slate-500)" domain={[0, 100]} fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-slate-950)", borderColor: "var(--color-slate-800)" }}
                labelStyle={{ color: "var(--color-slate-400)" }}
                cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
              />
              <Bar dataKey="score" fill="var(--color-indigo-500)" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
