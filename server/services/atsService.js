import ai from "../config/gemini.js";
import buildATSPrompt from "./buildATSPrompt.js";

/* ------------------------------------------------------- */
/* Extract JSON From Gemini Response */
/* ------------------------------------------------------- */

const extractJSON = (text) => {
  if (!text) {
    throw new Error("Empty Gemini response");
  }

  // Remove markdown fences
  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Find JSON block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("JSON not found in Gemini response");
  }

  return text.substring(start, end + 1);
};

/* ------------------------------------------------------- */
/* Parse Gemini JSON */
/* ------------------------------------------------------- */

const parseGeminiResponse = (text) => {
  try {
    const jsonString = extractJSON(text);

    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON Parse Error:", err);

    throw new Error("Invalid JSON returned by Gemini");
  }
};

/* ------------------------------------------------------- */
/* Gemini API Call */
/* ------------------------------------------------------- */

const callGemini = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  if (!response.text) {
    throw new Error("No response received from Gemini");
  }

  return response.text;
};

/* ------------------------------------------------------- */
/* Retry Logic */
/* ------------------------------------------------------- */

const callGeminiWithRetry = async (
  prompt,
  retries = 2
) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Gemini Attempt ${attempt}/${retries}`
      );

      const result = await callGemini(prompt);

      return result;
    } catch (err) {
      lastError = err;

      console.log(
        `Attempt ${attempt} failed`
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1500)
        );
      }
    }
  }

  throw lastError;
};

/* ------------------------------------------------------- */
/* Default ATS Response */
/* ------------------------------------------------------- */

const defaultATSResponse = {
  overall: 0,

  sections: {
    skills: 0,
    experience: 0,
    keywords: 0,
    format: 0,
  },

  matchedKeywords: [],

  missingKeywords: [],

  suggestions: [],
};


/* ------------------------------------------------------- */
/* Normalize Score */
/* ------------------------------------------------------- */

const normalizeScore = (value) => {
  value = Number(value);

  if (Number.isNaN(value)) return 0;

  if (value < 0) return 0;

  if (value > 100) return 100;

  return Math.round(value);
};


/* ------------------------------------------------------- */
/* Ensure Array */
/* ------------------------------------------------------- */

const ensureArray = (value) => {
  if (!Array.isArray(value)) return [];

  return [...new Set(value)];
};


/* ------------------------------------------------------- */
/* Validate Gemini Response */
/* ------------------------------------------------------- */

const validateATSResponse = (response) => {
  if (!response || typeof response !== "object") {
    return structuredClone(defaultATSResponse);
  }

  return {
    overall: normalizeScore(response.overall),

    sections: {
      skills: normalizeScore(
        response.sections?.skills
      ),

      experience: normalizeScore(
        response.sections?.experience
      ),

      keywords: normalizeScore(
        response.sections?.keywords
      ),

      format: normalizeScore(
        response.sections?.format
      ),
    },

    matchedKeywords: ensureArray(
      response.matchedKeywords
    ),

    missingKeywords: ensureArray(
      response.missingKeywords
    ),

    suggestions: ensureArray(
      response.suggestions
    ),
  };
};


/* ------------------------------------------------------- */
/* Format ATS Response */
/* ------------------------------------------------------- */

const formatATSResponse = (data) => {
  return {
    overall: data.overall,

    sections: data.sections,

    matchedKeywords: data.matchedKeywords.sort(),

    missingKeywords: data.missingKeywords.sort(),

    suggestions: data.suggestions,
  };
};


/* ------------------------------------------------------- */
/* Main ATS Extraction */
/* ------------------------------------------------------- */

export const extractATSScore = async (
  resume,
  jobDescription
) => {
  try {
    if (!resume) {
      throw new Error("Resume data missing");
    }

    if (!jobDescription) {
      throw new Error("Job description missing");
    }

    const prompt = buildATSPrompt(
      resume,
      jobDescription
    );

    const rawResponse =
      await callGeminiWithRetry(prompt);

    console.log("========== GEMINI ==========");
    console.log(rawResponse);
    console.log("============================");

    const parsed =
    parseGeminiResponse(rawResponse);

    const validated =
    validateATSResponse(parsed);

    return formatATSResponse(validated);
  } catch (err) {
    console.error(
      "ATS Extraction Error:",
      err.message
    );

    throw new Error(
    "AI ATS analysis failed. Please try again."
    );
  }
};