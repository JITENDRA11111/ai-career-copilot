const ScoreBadge = ({ score }) => {
  let color = "text-red-600 bg-red-100";

  if (score >= 80)
    color = "text-green-600 bg-green-100";
  else if (score >= 60)
    color = "text-yellow-600 bg-yellow-100";

  return (
    <span
      className={`px-3 py-1 rounded-full font-semibold ${color}`}
    >
      {score}/100
    </span>
  );
};

const ListSection = ({
  title,
  items,
  emptyMessage,
  color,
}) => (
  <div className="bg-white rounded-xl shadow p-6">
    <h3
      className={`text-lg font-bold mb-4 ${color}`}
    >
      {title}
    </h3>

    {items?.length ? (
      <ul className="space-y-2 list-disc list-inside">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-gray-700"
          >
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400">
        {emptyMessage}
      </p>
    )}
  </div>
);

const SectionCard = ({
  name,
  section,
}) => (
  <div className="border rounded-lg p-4">

    <div className="flex justify-between items-center">

      <h4 className="font-semibold capitalize">
        {name}
      </h4>

      <ScoreBadge
        score={section.score}
      />

    </div>

    <p className="mt-3 text-gray-700">
      {section.feedback}
    </p>

    <div className="mt-3 p-3 rounded bg-blue-50">

      <span className="font-semibold">
        Suggestion
      </span>

      <p>{section.suggestion}</p>

    </div>

  </div>
);

const ReviewCard = ({
  review,
}) => {

  if (!review) return null;

  return (
    <div className="space-y-8">

      {/* ====================================================== */}
      {/* Overall Score */}
      {/* ====================================================== */}

      <div className="bg-white shadow rounded-xl p-8">

        <h2 className="text-3xl font-bold">

          AI Resume Review

        </h2>

        <div className="mt-6 flex items-center gap-6">

          <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg">

            {review.overallScore}

          </div>

          <div>

            <h3 className="text-xl font-semibold">

              Overall Resume Score

            </h3>

            <p className="text-gray-600 mt-2">

              {review.summary}

            </p>

          </div>

        </div>

      </div>

      {/* ====================================================== */}
      {/* Strengths & Weaknesses */}
      {/* ====================================================== */}

      <div className="grid md:grid-cols-2 gap-6">

        <ListSection
          title="Strengths"
          items={review.strengths}
          color="text-green-600"
          emptyMessage="No strengths detected."
        />

        <ListSection
          title="Weaknesses"
          items={review.weaknesses}
          color="text-red-600"
          emptyMessage="No weaknesses detected."
        />

      </div>

      {/* ====================================================== */}
      {/* Quick Wins */}
      {/* ====================================================== */}

      <ListSection
        title="Quick Wins"
        items={review.quickWins}
        color="text-blue-600"
        emptyMessage="No recommendations."
      />

      {/* ====================================================== */}
      {/* Section Feedback */}
      {/* ====================================================== */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">

          Section Feedback

        </h2>

        <div className="space-y-5">

          {Object.entries(
            review.sectionFeedback || {}
          ).map(
            ([name, section]) => (

              <SectionCard
                key={name}
                name={name}
                section={section}
              />

            )
          )}

        </div>

      </div>

      {/* ====================================================== */}
      {/* AI Rewritten Summary */}
      {/* ====================================================== */}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow p-6">

        <h2 className="text-2xl font-bold mb-4">

          AI Rewritten Professional Summary

        </h2>

        <p className="leading-8 text-gray-700 whitespace-pre-line">

          {review.rewrittenSummary}

        </p>

      </div>

    </div>
  );
};

export default ReviewCard;