/**
 * Extract the top N unique skills from parsed resume data.
 *
 * @param {Object} parsedData
 * @param {number} limit
 * @returns {string[]}
 */
const SOFT_SKILLS = [
  "communication",
  "leadership",
  "teamwork",
  "team collaboration",
  "quick learning",
  "problem-solving",
  "problem solving",
  "adaptability",
  "critical thinking",
  "time management",
  "self motivated",
  "hardworking",
];

export function extractTopSkills(parsedData, limit = 6) {
  if (!parsedData || !Array.isArray(parsedData.skills)) {
    return [];
  }

  const seen = new Set();
  const skills = [];

  for (const skill of parsedData.skills) {
    if (!skill) continue;

    const cleaned = skill
      .toString()
      .trim()
      .toLowerCase();

    if (!cleaned) continue;

    if (cleaned.length < 3) continue;

    const isSoftSkill = SOFT_SKILLS.some((soft) =>
      cleaned.includes(soft)
    );

    if (isSoftSkill) continue;

    if (!seen.has(cleaned)) {
      seen.add(cleaned);
      skills.push(cleaned);
    }

    if (skills.length >= limit) {
      break;
    }
  }

  return skills;
}

/**
 * Convert skills array into a search query for JSearch API.
 *
 * Example:
 * ["react","node","mongodb"]
 *
 * =>
 *
 * "react node mongodb"
 */
export function buildSkillQuery(skills = []) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return "";
  }

  return skills.join(" ");
}

/**
 * Check whether a skill exists inside a job description.
 */
export function containsSkill(jobText, skill) {
  if (!jobText || !skill) return false;

  return jobText
    .toLowerCase()
    .includes(skill.toLowerCase());
}

/**
 * Normalize skills for comparison.
 */
export function normalizeSkills(skills = []) {
  return skills
    .filter(Boolean)
    .map((skill) => skill.toString().trim().toLowerCase());
}

/**
 * Remove duplicate skills.
 */
export function uniqueSkills(skills = []) {
  return [...new Set(normalizeSkills(skills))];
}