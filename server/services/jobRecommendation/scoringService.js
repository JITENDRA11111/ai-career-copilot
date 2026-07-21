const SKILL_WEIGHT = 0.6;
const LOCATION_WEIGHT = 0.2;
const SALARY_WEIGHT = 0.1;
const SENIORITY_WEIGHT = 0.1;

const SENIORITY_LEVELS = {
  INTERN: 20,
  JUNIOR: 40,
  ASSOCIATE: 60,
  MID: 70,
  SENIOR: 85,
  LEAD: 95,
  STAFF: 100,
};

/**
 * Parse salary information from JSearch job object
 */
export function parseSalary(job) {
  let min = Number(job.job_min_salary || 0);
  let max = Number(job.job_max_salary || 0);

  if (!min && !max) {
    return {
      min: 0,
      max: 0,
      average: 0,
    };
  }

  if (!min) min = max;
  if (!max) max = min;

  return {
    min,
    max,
    average: Math.round((min + max) / 2),
  };
}

/**
 * Skill Match Percentage
 */
export function calculateSkillMatch(userSkills = [], job = {}) {
  if (!userSkills.length) return 0;

  const searchableText = [
    job.title,
    job.description,
    job.company,
    job.location,
    job.employmentType,

    job.job_title,
    job.job_description,
    job.job_required_skills?.join(" "),
    job.job_highlights?.Qualifications?.join(" "),
    job.job_highlights?.Responsibilities?.join(" "),
    job.job_highlights?.Benefits?.join(" "),
]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchedSkills = [];

for (const skill of userSkills) {
    if (searchableText.includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
    }
}

console.log("Matched Skills:", matchedSkills);

return Math.round(
    (matchedSkills.length / userSkills.length) * 100
);
}

/**
 * Location Score
 */
export function calculateLocationMatch(
  parsedData = {},
  job = {}
) {
  const resumeLocation = (
    parsedData.location ||
    parsedData.city ||
    parsedData.address ||
    ""
  ).toLowerCase();

  const jobLocation = (
    job.job_city ||
    job.job_state ||
    job.job_country ||
    job.job_location ||
    ""
  ).toLowerCase();

  const employment = (
    job.job_employment_type || ""
  ).toLowerCase();

  if (
    employment.includes("remote") ||
    jobLocation.includes("remote")
  ) {
    return 100;
  }

  if (!resumeLocation || !jobLocation) {
    return 50;
  }

  if (
    jobLocation.includes(resumeLocation)
  ) {
    return 100;
  }

  if (
    resumeLocation.includes(jobLocation)
  ) {
    return 100;
  }

  return 30;
}

/**
 * Seniority Score
 */
export function calculateSeniorityScore(
  job = {}
) {
  const title = (
    job.job_title || ""
  ).toLowerCase();

  if (title.includes("intern"))
    return SENIORITY_LEVELS.INTERN;

  if (
    title.includes("junior") ||
    title.includes("entry")
  )
    return SENIORITY_LEVELS.JUNIOR;

  if (title.includes("associate"))
    return SENIORITY_LEVELS.ASSOCIATE;

  if (
    title.includes("mid") ||
    title.includes("ii")
  )
    return SENIORITY_LEVELS.MID;

  if (
    title.includes("senior") ||
    title.includes("sr")
  )
    return SENIORITY_LEVELS.SENIOR;

  if (
    title.includes("lead") ||
    title.includes("principal")
  )
    return SENIORITY_LEVELS.LEAD;

  if (title.includes("staff"))
    return SENIORITY_LEVELS.STAFF;

  return 60;
}

/**
 * Overall Recommendation Score
 */
export function calculateOverallScore(
  userSkills,
  parsedData,
  job
) {
  const skillScore =
    calculateSkillMatch(
      userSkills,
      job
    );

  const locationScore =
    calculateLocationMatch(
      parsedData,
      job
    );

  const seniorityScore =
    calculateSeniorityScore(job);

  const salary = parseSalary(job);

  let salaryScore = 40;

  if (salary.average > 0) {
    if (salary.average >= 3000000)
      salaryScore = 100;
    else if (
      salary.average >= 2000000
    )
      salaryScore = 90;
    else if (
      salary.average >= 1500000
    )
      salaryScore = 80;
    else if (
      salary.average >= 1000000
    )
      salaryScore = 70;
    else if (
      salary.average >= 700000
    )
      salaryScore = 60;
    else salaryScore = 50;
  }

  const total =
    skillScore * SKILL_WEIGHT +
    locationScore * LOCATION_WEIGHT +
    salaryScore * SALARY_WEIGHT +
    seniorityScore *
      SENIORITY_WEIGHT;

  return {
    totalScore: Math.round(total),

    skillScore,

    locationScore,

    salaryScore,

    seniorityScore,
  };
}