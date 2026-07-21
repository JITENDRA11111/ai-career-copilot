import ai from "../config/gemini.js";

import buildReviewPrompt from "./reviewPrompt.js";

import {
  parseGeminiResponse,
  validateReview,
  formatReviewResponse,
} from "./reviewService.js";
/* -------------------------------------------------------------------------- */
/* Stream Resume Review */
/* -------------------------------------------------------------------------- */

export const streamResumeReview = async (
  resumeData,
  sse
) => {
  if (!resumeData) {
    throw new Error("Resume data is missing.");
  }

  const prompt = buildReviewPrompt(resumeData);

  let completeResponse = "";

  try {

    sse.sendProgress(
      "Initializing AI Review...",
      5
    );

    /* ---------------------------------------------------------------------- */
    /* Gemini Streaming Request */
    /* ---------------------------------------------------------------------- */

    const stream =
      await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

    let progress = 10;

    /* ---------------------------------------------------------------------- */
    /* Iterate Stream */
    /* ---------------------------------------------------------------------- */

    for await (const chunk of stream) {

      const text = chunk.text || "";

      if (!text) continue;

      completeResponse += text;

      /* ------------------------------------------------------------ */
      /* Send Chunk To Client */
      /* ------------------------------------------------------------ */

      sse.sendChunk(text);

      progress = Math.min(
        progress + 2,
        95
      );

      sse.sendProgress(
        "Generating Review...",
        progress
      );
    }

    sse.sendProgress(
      "Finalizing Review...",
      100
    );

    return completeResponse;

  } catch (err) {

    console.error(
      "Gemini Streaming Error:",
      err
    );

    throw err;

  }
};


/* -------------------------------------------------------------------------- */
/* Retry Wrapper */
/* -------------------------------------------------------------------------- */

export const streamResumeReviewWithRetry = async (
  resumeData,
  sse,
  retries = 3
) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Streaming Review Attempt ${attempt}/${retries}`
      );

      const rawResponse =
        await streamResumeReview(
          resumeData,
          sse
        );

      /* -------------------------------------------------------------- */
      /* Parse JSON */
      /* -------------------------------------------------------------- */

      const parsed =
        parseGeminiResponse(rawResponse);

      /* -------------------------------------------------------------- */
      /* Validate */
      /* -------------------------------------------------------------- */

      const validated =
        validateReview(parsed);

      /* -------------------------------------------------------------- */
      /* Normalize */
      /* -------------------------------------------------------------- */

      const formatted =
        formatReviewResponse(
          validated
        );

      console.log(
        "Streaming Review Completed"
      );

      return formatted;

    } catch (err) {

      lastError = err;

      console.error(
        `Streaming Attempt ${attempt} failed`
      );

      if (attempt < retries) {

        sse.sendProgress(
          "Retrying AI Review...",
          0
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );

      }

    }
  }

  throw lastError;
};


/* -------------------------------------------------------------------------- */
/* Handle Streaming Error */
/* -------------------------------------------------------------------------- */

export const handleStreamError = (
  error,
  sse
) => {

  console.error(
    "Review Stream Error:",
    error
  );

  sse.sendError({
    success: false,

    message:
      error.message ||
      "Unable to generate AI review.",

    timestamp:
      new Date().toISOString(),
  });

};