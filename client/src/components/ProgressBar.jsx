import { useMemo } from "react";

const ProgressBar = ({
  progress = 0,
  step = "",
  showPercentage = true,
}) => {
  const safeProgress = useMemo(() => {
    return Math.min(100, Math.max(0, progress));
  }, [progress]);

  const completed = safeProgress >= 100;

  return (
    <div className="w-full">

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {step || "Preparing..."}
        </span>
        {showPercentage && (
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {safeProgress}%
          </span>
        )}
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-slate-700/50">
        <div
          className={`
            h-full rounded-full
            transition-all
            duration-500
            ease-out
            relative
            ${
              completed
                ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            }
          `}
          style={{ width: `${safeProgress}%` }}
        >
          {/* Shimmer effect */}
          {!completed && (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2.5 flex justify-between text-[10px] font-medium text-slate-500 uppercase tracking-wide">
        <span>{completed ? "Completed" : "Processing..."}</span>
        <span className={completed ? "text-emerald-400" : ""}>{completed ? "✓ Ready" : "Please wait"}</span>
      </div>

    </div>
  );
};

export default ProgressBar;