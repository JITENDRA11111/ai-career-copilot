import { evaluateCode } from "./aiCodingService.js";

/* -------------------------------------------------------------------------- */
/* Validate Evaluation */
/* -------------------------------------------------------------------------- */

function sanitizeEvaluation(evaluation = {}) {
  return {
    summary:
      evaluation.summary ||
      "No summary generated.",

    strengths: Array.isArray(
      evaluation.strengths
    )
      ? evaluation.strengths
      : [],

    improvements: Array.isArray(
      evaluation.improvements
    )
      ? evaluation.improvements
      : [],

    timeComplexity:
      evaluation.timeComplexity ||
      "Unknown",

    spaceComplexity:
      evaluation.spaceComplexity ||
      "Unknown",

    overallScore: Math.max(
      0,
      Math.min(
        100,
        Number(
          evaluation.overallScore || 0
        )
      )
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Merge Execution Score + AI Score */
/* -------------------------------------------------------------------------- */

function calculateFinalScore(
  executionScore,
  aiScore
) {
  /**
   * Weightage:
   * Execution : 70%
   * Code Quality : 30%
   */

  return Math.round(
    executionScore * 0.7 +
      aiScore * 0.3
  );
}

/* -------------------------------------------------------------------------- */
/* Evaluate Submission */
/* -------------------------------------------------------------------------- */

export async function evaluateSubmission({
  question,
  code,
  language,
  executionScore,
}) {
  try {
    const aiEvaluation =
      await evaluateCode(
        question,
        code,
        language
      );

    const feedback =
      sanitizeEvaluation(
        aiEvaluation
      );

    const finalScore =
      calculateFinalScore(
        executionScore,
        feedback.overallScore
      );

    return {
      score: finalScore,

      feedback,
    };
  } catch (error) {
    console.error(
      "Evaluation Service Error:",
      error
    );

    /**
     * Fallback if Gemini fails.
     */

    return {
      score: executionScore,

      feedback: {
        summary:
          "AI evaluation unavailable.",

        strengths: [],

        improvements: [],

        timeComplexity:
          "Unknown",

        spaceComplexity:
          "Unknown",

        overallScore:
          executionScore,
      },
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Generate Overall Result Summary */
/* -------------------------------------------------------------------------- */

export function generateSubmissionSummary({
  passed,
  total,
  score,
}) {
  let verdict = "";

  if (score === 100) {
    verdict =
      "Excellent! All test cases passed.";
  } else if (score >= 80) {
    verdict =
      "Very Good. Minor improvements needed.";
  } else if (score >= 60) {
    verdict =
      "Good attempt. Some test cases failed.";
  } else if (score >= 40) {
    verdict =
      "Average. Review your algorithm.";
  } else {
    verdict =
      "Poor. Consider revisiting the problem.";
  }

  return {
    passed,
    total,
    score,
    verdict,
  };
}

/* -------------------------------------------------------------------------- */
/* Compare Current Score With Best Score */
/* -------------------------------------------------------------------------- */

export function isNewBestScore(
  currentScore,
  previousBest
) {
  return (
    currentScore >
    (previousBest || 0)
  );
}

/* -------------------------------------------------------------------------- */
/* Calculate Improvement */
/* -------------------------------------------------------------------------- */

export function scoreImprovement(
  previousBest,
  currentScore
) {
  return (
    currentScore -
    (previousBest || 0)
  );
}

/* -------------------------------------------------------------------------- */
/* Recommendation For User */
/* -------------------------------------------------------------------------- */

export function getRecommendation(
  score
) {
  if (score === 100) {
    return "Proceed to the next problem.";
  }

  if (score >= 80) {
    return "Review edge cases and optimize your solution.";
  }

  if (score >= 60) {
    return "Practice similar medium-level problems.";
  }

  if (score >= 40) {
    return "Revise the underlying algorithm and data structures.";
  }

  return "Study the topic again and solve easier problems before retrying.";
}