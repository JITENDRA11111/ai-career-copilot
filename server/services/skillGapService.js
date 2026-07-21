import Resume from "../models/resume.model.js";

import {
  getRequiredSkills,
  generateLearningPlan,
} from "./skillGap/aiSkillService.js";

import {
  compareSkills,
  cleanSkill,
} from "./skillGap/comparisonService.js";

import {
  buildLearningPlan,
  enrichLearningPlan,
} from "./skillGap/learningPlanService.js";

import {
  saveSkillGapAnalysis,
  getSkillGapHistory,
  deleteSkillGap as deleteSkillGapHistory,
} from "./skillGap/historyService.js";

/**
 * Generate Skill Gap Analysis
 *
 * @param {String} userId
 * @param {String} resumeId
 * @param {String} targetRole
 */
export async function analyzeSkillGap(
  userId,
  resumeId,
  targetRole
) {
  if (!resumeId) {
    throw new Error("resumeId is required.");
  }

  if (!targetRole) {
    throw new Error("targetRole is required.");
  }

  /**
   * ------------------------------------------------
   * Fetch Resume
   * ------------------------------------------------
   */

  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });

  if (!resume) {
    throw new Error("Resume not found.");
  }

  if (!resume.parsedData) {
    throw new Error(
      "Resume has not been parsed."
    );
  }

  /**
   * ------------------------------------------------
   * Current Skills
   * ------------------------------------------------
   */

  const SOFT_SKILLS = [
  "communication",
  "team collaboration",
  "problem-solving",
  "problem solving",
  "quick learning",
  "leadership",
  "teamwork",
  "adaptability",
  "critical thinking",
  "time management",
];

const GENERIC_SKILLS = [
  "web development",
  "frontend development",
  "backend development",
  "software development",
  "computer science",
];

const currentSkills = [...new Set(
  (resume.parsedData.skills || [])
    .map(cleanSkill)
    .filter(Boolean)
    .filter(
      (skill) =>
        !SOFT_SKILLS.includes(skill) &&
        !GENERIC_SKILLS.includes(skill)
    )
)];

  if (!currentSkills.length) {
    throw new Error(
      "No skills found in parsed resume."
    );
  }

  const inferredSkills = [];

if (currentSkills.includes("react")) {
  inferredSkills.push("html");
  inferredSkills.push("css");
}

if (currentSkills.includes("tailwind css")) {
  inferredSkills.push("css");
}

currentSkills.push(...inferredSkills);

const finalSkills = [...new Set(currentSkills)];

  /**
   * ------------------------------------------------
   * AI Required Skills
   * ------------------------------------------------
   */

  const aiResponse =
    await getRequiredSkills(
      targetRole
    );

  const requiredSkills =
    aiResponse.requiredSkills || [];

  if (!requiredSkills.length) {
    throw new Error(
      "Unable to generate required skills."
    );
  }

  /**
   * ------------------------------------------------
   * Compare Skills
   * ------------------------------------------------
   */

  const comparison =
    compareSkills(
      currentSkills,
      requiredSkills
    );

  /**
   * ------------------------------------------------
   * AI Learning Plan
   * ------------------------------------------------
   */

  let learningPlan = [];

  try {

    learningPlan =
      await generateLearningPlan(
        targetRole,
        comparison.missingSkills
      );

    learningPlan =
      enrichLearningPlan(
        learningPlan
      );

  } catch (error) {

    console.log(
      "Using Default Learning Plan..."
    );

    learningPlan =
      buildLearningPlan(
        comparison.missingSkills
      );
  }

  /**
   * ------------------------------------------------
   * Save Analysis
   * ------------------------------------------------
   */

  const savedAnalysis =
    await saveSkillGapAnalysis({
      userId,

      resumeId,

      targetRole,

      currentSkills:
        comparison.currentSkills,

      requiredSkills:
        comparison.requiredSkills,

      missingSkills:
        comparison.missingSkills,

      partialSkills:
        comparison.partialSkills,

      learningPlan,

      overallMatch:
        comparison.overallMatch,
    });

  /**
   * ------------------------------------------------
   * Response
   * ------------------------------------------------
   */

  return {
    id: savedAnalysis._id,

    targetRole,

    currentSkills:
      comparison.currentSkills,

    requiredSkills:
      comparison.requiredSkills,

    missingSkills:
      comparison.missingSkills,

    partialSkills:
      comparison.partialSkills,

    matchedSkills:
      comparison.matchedSkills,

    overallMatch:
      comparison.overallMatch,

    learningPlan,

    createdAt:
      savedAnalysis.createdAt,
  };
}

/**
 * Get Analysis History
 */
export async function getHistory(
  userId
) {
  return await getSkillGapHistory(
    userId
  );
}

export async function deleteAnalysis(
  id,
  userId
) {
  return await deleteSkillGapHistory(
    id,
    userId
  );
}
