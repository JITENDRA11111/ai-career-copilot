/**
 * Normalize Skills
 *
 * Converts skills into lowercase,
 * removes duplicates and trims spaces.
 */

/**
 * Skill aliases
 * Used to normalize equivalent skill names.
 */
const SKILL_ALIASES = {
  // JavaScript
  js: "javascript",
  javascript: "javascript",
  ecmascript: "javascript",

  // TypeScript
  ts: "typescript",
  typescript: "typescript",

  // React
  react: "react",
  "react.js": "react",
  reactjs: "react",

  // Next.js
  next: "next.js",
  nextjs: "next.js",
  "next.js": "next.js",

  // Node
  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",

  // Express
  express: "express",
  expressjs: "express",
  "express.js": "express",

  // MongoDB
  mongo: "mongodb",
  "mongo db": "mongodb",
  mongodb: "mongodb",

  // HTML / CSS
  html: "html",
  html5: "html",

  css: "css",
  css3: "css",

  // Git
  git: "git",
  github: "git",
  "version control": "git",
  "version control systems": "git",

  // Tailwind
  tailwind: "tailwind css",
  "tailwind css": "tailwind css",

  // REST API
  "rest api": "rest api",
  "restful api": "rest api",
  "restful apis": "rest api",

  // GraphQL
  graphql: "graphql",

  // Testing
  jest: "testing",
  "react testing library": "testing",
  playwright: "testing",
  testing: "testing",

  // Docker
  docker: "docker",
  containerization: "docker",

  // Build tools
  vite: "vite",
  webpack: "webpack",
  babel: "babel",

  // Redux
  redux: "redux",
  zustand: "zustand",

  // Cloud
  aws: "aws",
  gcp: "google cloud",
  "google cloud platform": "google cloud",

  // DSA
  dsa: "data structures and algorithms",
  "data structures": "data structures and algorithms",
  "algorithms": "data structures and algorithms",
  "data structures and algorithms": "data structures and algorithms",

  // OOP
  oop: "object oriented programming",
  oops: "object oriented programming",
  "object-oriented programming": "object oriented programming",

  "chrome devtools": "browser developer tools",
  "developer tools": "browser developer tools",

  "restful apis": "rest api",
  "rest api": "rest api",
  "rest": "rest api",

  "redux toolkit": "redux",

  "responsive design": "responsive design",

  "semantic html": "html",

  "html5 and semantic markup": "html",

  "css3 and responsive design": "css",

  "module bundlers": "webpack",

  webpack: "webpack",
  vite: "webpack",

  "unit testing": "testing",
  "integration testing": "testing",
  jest: "testing",
  playwright: "testing",

  "browser developer tools": "browser developer tools",

  "state management": "redux",
  "state management libraries": "redux",

  "advanced css": "css",
"css": "css",

"html": "html",
"semantic html": "html",
"html5": "html",

"responsive css": "css",
"responsive design": "css",
"react state management": "redux",

"redux toolkit": "redux",

"state management": "redux",

"state management libraries": "redux",
"api integration": "rest api",

"rest api": "rest api",

"restful api": "rest api",

"axios": "rest api",

"fetch api": "rest api",
"rest api": "rest api",
"restful api": "rest api",
"restful apis": "rest api",

"api integration": "rest api",

"axios": "rest api",
"fetch": "rest api",
"fetch api": "rest api",

"express": "rest api",
"node.js": "rest api",
vite: "bundler",

webpack: "bundler",

"module bundler": "bundler",

"build tools": "bundler",
};

/**
 * Normalize a skill
 */
export function cleanSkill(skill) {
  if (!skill) return "";

  let cleaned = skill
    .toLowerCase()
    .trim()

    // Remove text inside brackets
    .replace(/\(.*?\)/g, "")

    // Replace &
    .replace(/&/g, "and")

    // Remove special symbols
    .replace(/-/g, " ")
.replace(/[^a-z0-9.+# ]/g, "")

    // Multiple spaces
    .replace(/\s+/g, " ")

    .trim();

  // Convert aliases
  if (SKILL_ALIASES[cleaned]) {
    cleaned = SKILL_ALIASES[cleaned];
  }

  return cleaned;
}

export function normalizeSkills(skills = []) {
  if (!Array.isArray(skills)) {
    return [];
  }

  const normalized = skills
    .filter(Boolean)
    .map(cleanSkill)
    .filter(Boolean);

  return [...new Set(normalized)];
}

/**
 * Find Exact Matching Skills
 */
export function findCurrentSkills(
  currentSkills = [],
  requiredSkills = []
) {
  const current = normalizeSkills(currentSkills);
  const required = normalizeSkills(requiredSkills);

  return current.filter((skill) =>
    required.includes(skill)
  );
}

/**
 * Find Missing Skills
 */
export function findMissingSkills(
  currentSkills = [],
  requiredSkills = []
) {
  const current = normalizeSkills(currentSkills);
  const required = normalizeSkills(requiredSkills);

  return required.filter(
    (skill) => !current.includes(skill)
  );
}

/**
 * Find Partial Skills
 *
 * Example:
 * React  -> React.js
 * JS     -> JavaScript
 * Node   -> Node.js
 */
/**
 * Skills that are closely related.
 * If a user has the left skill, they get a partial match
 * for the corresponding required skill.
 */
const RELATED_SKILLS = {
  react: [
    "redux",
    "react state management",
    "next.js",
  ],

  "tailwind css": [
    "css",
    "advanced css",
    "responsive design",
  ],

  css: [
    "tailwind css",
    "advanced css",
  ],

  html: [
    "semantic html",
    "html5",
  ],

  "node.js": [
    "rest api",
    "api integration",
    "express",
  ],

  express: [
    "rest api",
    "api integration",
  ],

  mongodb: [
    "database",
    "nosql",
  ],

  vite: [
    "webpack",
    "bundler",
  ],

  webpack: [
    "vite",
    "bundler",
  ],

  git: [
    "github",
    "version control",
  ],

  javascript: [
    "typescript",
  ],

  typescript: [
    "javascript",
  ],
};

export function findPartialSkills(
  currentSkills = [],
  requiredSkills = []
) {
  const current = normalizeSkills(currentSkills);
  const required = normalizeSkills(requiredSkills);

  const partial = [];

  for (const req of required) {
    // Already an exact match
    if (current.includes(req)) continue;

    let isPartial = false;

    // ---------- Related Skills ----------
    for (const cur of current) {
      const related = RELATED_SKILLS[cur] || [];

      if (related.includes(req)) {
        isPartial = true;
        break;
      }
    }

    // ---------- Word Matching ----------
    if (!isPartial) {
      isPartial = current.some((cur) => {
        const curWords = cur.split(/\s+/);
        const reqWords = req.split(/\s+/);

        return reqWords.some(
          (word) =>
            word.length > 3 &&
            curWords.includes(word)
        );
      });
    }

    if (isPartial) {
      partial.push(req);
    }
  }

  return [...new Set(partial)];
}

/**
 * Overall Match Percentage
 */
export function calculateOverallMatch(
  currentSkills = [],
  requiredSkills = []
) {
  const matched = findCurrentSkills(
    currentSkills,
    requiredSkills
  );

  if (!requiredSkills.length) {
    return 0;
  }

  return Math.round(
    (matched.length /
      requiredSkills.length) *
      100
  );
}

/**
 * Complete Skill Gap Analysis
 */
export function compareSkills(
  currentSkills = [],
  requiredSkills = []
) {
  const normalizedCurrent =
    normalizeSkills(currentSkills);

  const normalizedRequired =
    normalizeSkills(requiredSkills);

  const matched =
    findCurrentSkills(
      normalizedCurrent,
      normalizedRequired
    );

  const missing =
    findMissingSkills(
      normalizedCurrent,
      normalizedRequired
    );

  const partial =
    findPartialSkills(
      normalizedCurrent,
      normalizedRequired
    );

  const overallMatch =
    calculateOverallMatch(
      normalizedCurrent,
      normalizedRequired
    );

  return {
    currentSkills: normalizedCurrent,

    requiredSkills: normalizedRequired,

    matchedSkills: matched,

    missingSkills: missing,

    partialSkills: partial,

    overallMatch,
  };
}