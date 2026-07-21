import ai from "../config/gemini.js";
import buildReviewPrompt from "./reviewPrompt.js";
import { defaultReview } from "../utils/defaultReview.js";

/* -------------------------------------------------------------------------- */
/* Extract JSON From Gemini Response */
/* -------------------------------------------------------------------------- */

const extractJSON = (text) => {
  if (!text) {
    throw new Error("Empty Gemini response");
  }

  // Remove markdown code fences
  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Find first opening brace
  const start = text.indexOf("{");

  // Find last closing brace
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error(
      "No valid JSON object found in Gemini response."
    );
  }

  return text.substring(start, end + 1);
};

/* -------------------------------------------------------------------------- */
/* Parse Gemini JSON */
/* -------------------------------------------------------------------------- */

const parseGeminiResponse = (text) => {
  try {
    const jsonString = extractJSON(text);

    return JSON.parse(jsonString);
  } catch (err) {
    console.error(
      "Resume Review JSON Parse Error:",
      err
    );

    throw new Error(
      "Invalid JSON returned by Gemini."
    );
  }
};

/* -------------------------------------------------------------------------- */
/* Gemini API Call */
/* -------------------------------------------------------------------------- */

const callGemini = async (prompt) => {
  try {
      const response =
        await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

    if (!response.text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return response.text;

  } catch (err) {

    console.error(
      "Gemini API Error:",
      err.message
    );

    throw err;

  }
};

/* -------------------------------------------------------------------------- */
/* Retry Logic */
/* -------------------------------------------------------------------------- */

const callGeminiWithRetry = async (
  prompt,
  retries = 3
) => {

  let lastError;

  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {

    try {

      console.log(
        `Gemini Review Attempt ${attempt}/${retries}`
      );

      return await callGemini(prompt);

    } catch (err) {

      lastError = err;

      console.log(
        `Attempt ${attempt} failed`
      );

      if (attempt < retries) {

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );

      }

    }

  }

  throw lastError;

};

/* -------------------------------------------------------------------------- */
/* Normalize Score */
/* -------------------------------------------------------------------------- */

const normalizeScore = (score) => {
  score = Number(score);

  if (Number.isNaN(score)) return 0;

  if (score < 0) return 0;

  if (score > 100) return 100;

  return Math.round(score);
};

/* -------------------------------------------------------------------------- */
/* Ensure Array */
/* -------------------------------------------------------------------------- */

const ensureArray = (value) => {
  return Array.isArray(value)
    ? [...new Set(value)]
    : [];
};

/* -------------------------------------------------------------------------- */
/* Ensure String */
/* -------------------------------------------------------------------------- */

const ensureString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};


/* -------------------------------------------------------------------------- */
/* Validate Gemini Review */
/* -------------------------------------------------------------------------- */

const validateReview = (review) => {
  if (!review || typeof review !== "object") {
    return structuredClone(defaultReview);
  }

  return {
    overallScore: normalizeScore(review.overallScore),

    summary: ensureString(review.summary),

    strengths: ensureArray(review.strengths),

    weaknesses: ensureArray(review.weaknesses),

    quickWins: ensureArray(review.quickWins),

    rewrittenSummary: ensureString(
      review.rewrittenSummary
    ),

    sectionFeedback: {
      summary: {
        score: normalizeScore(
          review.sectionFeedback?.summary?.score
        ),
        feedback: ensureString(
          review.sectionFeedback?.summary?.feedback
        ),
        suggestion: ensureString(
          review.sectionFeedback?.summary?.suggestion
        ),
      },

      experience: {
        score: normalizeScore(
          review.sectionFeedback?.experience?.score
        ),
        feedback: ensureString(
          review.sectionFeedback?.experience?.feedback
        ),
        suggestion: ensureString(
          review.sectionFeedback?.experience?.suggestion
        ),
      },

      skills: {
        score: normalizeScore(
          review.sectionFeedback?.skills?.score
        ),
        feedback: ensureString(
          review.sectionFeedback?.skills?.feedback
        ),
        suggestion: ensureString(
          review.sectionFeedback?.skills?.suggestion
        ),
      },

      projects: {
        score: normalizeScore(
          review.sectionFeedback?.projects?.score
        ),
        feedback: ensureString(
          review.sectionFeedback?.projects?.feedback
        ),
        suggestion: ensureString(
          review.sectionFeedback?.projects?.suggestion
        ),
      },

      education: {
        score: normalizeScore(
          review.sectionFeedback?.education?.score
        ),
        feedback: ensureString(
          review.sectionFeedback?.education?.feedback
        ),
        suggestion: ensureString(
          review.sectionFeedback?.education?.suggestion
        ),
      },
    },
  };
};


/* -------------------------------------------------------------------------- */
/* Format Review Response */
/* -------------------------------------------------------------------------- */

const formatReviewResponse = (review) => {
  return {
    overallScore: review.overallScore,

    summary: review.summary,

    strengths: review.strengths,

    weaknesses: review.weaknesses,

    quickWins: review.quickWins,

    rewrittenSummary: review.rewrittenSummary,

    sectionFeedback: review.sectionFeedback,
  };
};
/* -------------------------------------------------------------------------- */
/* Generate Resume Review */
/* -------------------------------------------------------------------------- */

export const generateResumeReview =
  async (resumeData) => {
    try {
      if (!resumeData) {
        throw new Error(
          "Resume data is missing."
        );
      }

      const prompt =
        buildReviewPrompt(resumeData);

      const rawResponse =
        await callGeminiWithRetry(prompt);

         const parsed =
  parseGeminiResponse(rawResponse);

const validated =
  validateReview(parsed);

const formatted =
  formatReviewResponse(validated);

      console.log("========== GEMINI REVIEW ==========");
console.log(
  `Overall Score: ${validated.overallScore}`
);
console.log(
  `Strengths: ${validated.strengths.length}`
);
console.log(
  `Weaknesses: ${validated.weaknesses.length}`
);
console.log(
  `Quick Wins: ${validated.quickWins.length}`
);
console.log("==================================");

     

return formatted;

    } catch (err) {

      console.error(
        "Resume Review Error:",
        err.message
      );

      throw new Error(
  "AI resume review failed. Please try again later."
);

    }
  };

/* -------------------------------------------------------------------------- */
/* Export Helpers */
/* -------------------------------------------------------------------------- */

export {
  callGemini,
  callGeminiWithRetry,
  extractJSON,
  parseGeminiResponse,
  validateReview,
  formatReviewResponse
};