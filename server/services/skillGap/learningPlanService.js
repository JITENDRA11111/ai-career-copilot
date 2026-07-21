/**
 * learningPlanService.js
 *
 * Generates a structured learning roadmap from
 * AI-generated recommendations.
 */

/**
 * Default Resources
 *
 * Used if AI doesn't provide resources.
 */
const DEFAULT_RESOURCES = {
  react: [
    {
      name: "React Official Documentation",
      url: "https://react.dev/",
      type: "Documentation",
    },
    {
      name: "React Course - freeCodeCamp",
      url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      type: "YouTube",
    },
    {
      name: "React - Udemy",
      url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
      type: "Course",
    },
  ],

  typescript: [
    {
      name: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
      type: "Documentation",
    },
    {
      name: "TypeScript Course",
      url: "https://www.youtube.com/watch?v=30LWjhZzg50",
      type: "YouTube",
    },
    {
      name: "Understanding TypeScript",
      url: "https://www.udemy.com/course/understanding-typescript/",
      type: "Course",
    },
  ],

  nextjs: [
    {
      name: "Next.js Docs",
      url: "https://nextjs.org/docs",
      type: "Documentation",
    },
    {
      name: "Next.js Crash Course",
      url: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
      type: "YouTube",
    },
    {
      name: "Next.js - Udemy",
      url: "https://www.udemy.com/course/nextjs-react-the-complete-guide/",
      type: "Course",
    },
  ],

  nodejs: [
    {
      name: "Node.js Docs",
      url: "https://nodejs.org/docs/latest/api/",
      type: "Documentation",
    },
    {
      name: "Node.js Course",
      url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
      type: "YouTube",
    },
    {
      name: "NodeJS Complete Guide",
      url: "https://www.udemy.com/course/nodejs-the-complete-guide/",
      type: "Course",
    },
  ],

  express: [
    {
      name: "Express Documentation",
      url: "https://expressjs.com/",
      type: "Documentation",
    },
    {
      name: "Express.js Tutorial",
      url: "https://www.youtube.com/watch?v=L72fhGm1tfE",
      type: "YouTube",
    },
  ],

  mongodb: [
    {
      name: "MongoDB Docs",
      url: "https://www.mongodb.com/docs/",
      type: "Documentation",
    },
    {
      name: "MongoDB Course",
      url: "https://www.youtube.com/watch?v=ExcRbA7fy_A",
      type: "YouTube",
    },
  ],

  docker: [
    {
      name: "Docker Docs",
      url: "https://docs.docker.com/",
      type: "Documentation",
    },
    {
      name: "Docker Full Course",
      url: "https://www.youtube.com/watch?v=3c-iBn73dDE",
      type: "YouTube",
    },
  ],

  kubernetes: [
    {
      name: "Kubernetes Docs",
      url: "https://kubernetes.io/docs/",
      type: "Documentation",
    },
  ],

  aws: [
    {
      name: "AWS Skill Builder",
      url: "https://skillbuilder.aws/",
      type: "Course",
    },
  ],

  graphql: [
    {
      name: "GraphQL Docs",
      url: "https://graphql.org/learn/",
      type: "Documentation",
    },
  ],

  redux: [
    {
      name: "Redux Toolkit",
      url: "https://redux-toolkit.js.org/",
      type: "Documentation",
    },
  ],

  testing: [
    {
      name: "Jest Documentation",
      url: "https://jestjs.io/",
      type: "Documentation",
    },
  ],
};

/**
 * Estimate learning duration
 */
export function estimateWeeks(priority) {
  switch (priority?.toLowerCase()) {
    case "high":
      return 4;

    case "medium":
      return 2;

    case "low":
      return 1;

    default:
      return 2;
  }
}

/**
 * Get default learning resources
 */
export function getDefaultResources(skill) {
  const key = skill
    .toLowerCase()
    .replace(".js", "");

  return (
    DEFAULT_RESOURCES[key] || [
      {
        name: `${skill} Official Documentation`,
        url: `https://www.google.com/search?q=${encodeURIComponent(
          skill + " documentation"
        )}`,
        type: "Documentation",
      },
    ]
  );
}

/**
 * Merge AI resources with defaults
 */
export function enrichLearningPlan(plan = []) {
  return plan.map((item) => ({
    skill: item.skill,

    priority: item.priority || "Medium",

    estimatedWeeks:
      item.estimatedWeeks ||
      estimateWeeks(item.priority),

    resources:
      item.resources &&
      item.resources.length
        ? item.resources
        : getDefaultResources(item.skill),
  }));
}

/**
 * Build learning plan if AI fails
 */
export function buildLearningPlan(
  missingSkills = []
) {
  return missingSkills.map((skill, index) => ({
    skill,

    priority:
      index < 3
        ? "High"
        : index < 6
        ? "Medium"
        : "Low",

    estimatedWeeks:
      index < 3
        ? 4
        : index < 6
        ? 2
        : 1,

    resources:
      getDefaultResources(skill),
  }));
}