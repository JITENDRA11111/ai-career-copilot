import ProgressBar from "./ProgressBar";

const TypingDots = () => {
  return (
    <div className="flex items-center gap-2 mt-4 justify-center">
      <span className="text-xs font-semibold tracking-wide text-indigo-400 uppercase">
        AI is thinking
      </span>
      <div className="flex gap-1.5 ml-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
        <span
          className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Skeleton Card */
/* -------------------------------------------------------------------------- */

const SkeletonCard = () => (
  <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl shadow-lg p-5 animate-pulse flex flex-col gap-4">
    <div className="h-4 bg-slate-800/80 rounded w-1/3" />
    <div className="space-y-2.5">
      <div className="h-3 bg-slate-800/50 rounded" />
      <div className="h-3 bg-slate-800/50 rounded w-5/6" />
      <div className="h-3 bg-slate-800/50 rounded w-2/3" />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Spinner */
/* -------------------------------------------------------------------------- */

const Spinner = () => (
  <div className="flex justify-center items-center relative">
    <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-800 border-b-purple-500 rounded-full animate-[spin_1s_linear_infinite_reverse]" />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Loading Animation */
/* -------------------------------------------------------------------------- */

const LoadingAnimation = ({
  progress = 0,
  step = "Preparing AI Review...",
  title = "AI Resume Review",
  description = "Please wait while Gemini analyzes your resume.",
}) => {

  return (

    <div className="space-y-8">

      {/* ------------------------------------------------------ */}
      {/* Spinner */}
      {/* ------------------------------------------------------ */}

      <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-2xl shadow-2xl p-10 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />
        
        <Spinner />
        
        <h2 className="mt-8 text-xl font-bold text-slate-100 tracking-wide">
          {title}
        </h2>
        
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
        
        <div className="mt-6 border-t border-slate-800/60 pt-4 inline-block min-w-[200px]">
          <TypingDots />
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* Progress */}
      {/* ------------------------------------------------------ */}

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg p-6">
        <ProgressBar
          progress={progress}
          step={step}
        />
      </div>

      {/* ------------------------------------------------------ */}
      {/* Skeleton Review */}
      {/* ------------------------------------------------------ */}

      <div className="grid md:grid-cols-2 gap-6">

        <SkeletonCard />

        <SkeletonCard />

      </div>

      <SkeletonCard />

      <SkeletonCard />

    </div>

  );

};

export default LoadingAnimation;