import Resume from "../../models/resume.model.js";

import { extractTopSkills } from "./skillService.js";

import { fetchJobsFromJSearch } from "./jsearchService.js";

import {
  calculateOverallScore,
} from "./scoringService.js";

import {
  getCachedRecommendations,
  saveRecommendationsCache,
} from "./cacheService.js";

const MAX_RESULTS = 10;

/**
 * Recommend Jobs
 *
 * @param {String} userId
 * @param {String} resumeId
 * @returns {Array}
 */
export async function recommendJobs(
  userId,
  resumeId
) {

  /**
   * -----------------------------
   * 1. Check Cache
   * -----------------------------
   */

  const cachedJobs =
    await getCachedRecommendations(
      userId,
      resumeId
    );

  if (cachedJobs) {
    // return cachedJobs; // TEMPORARILY BYPASSED TO FLUSH CORRUPT CACHE
  }

  /**
   * -----------------------------
   * 2. Fetch Resume
   * -----------------------------
   */

  const resume =
    await Resume.findById(resumeId);

  if (!resume) {
    throw new Error("Resume not found.");
  }

  if (!resume.parsedData) {
    throw new Error(
      "Resume has not been parsed."
    );
  }

  /**
   * -----------------------------
   * 3. Extract Skills
   * -----------------------------
   */

  const skills = extractTopSkills(
    resume.parsedData,
    6
);
console.log("Top Skills:");

console.log(skills);
  if (!skills.length) {
    return [];
  }

  /**
   * -----------------------------
   * 4. Fetch Jobs
   * -----------------------------
   */

  const jobs =
    await fetchJobsFromJSearch(
      skills
    );

  if (!jobs.length) {
    return [];
  }

  /**
   * -----------------------------
   * 5. Score Jobs
   * -----------------------------
   */

  const scoredJobs =
    jobs.map((job) => {

      const score =
        calculateOverallScore(
          skills,
          resume.parsedData,
          job.raw
        );

      return {

        jobId:
          job.jobId,

        title:
          job.title,

        company:
          job.company,

        employerLogo:
          job.employerLogo,

        location:
          job.location,

        employmentType:
          job.employmentType,

        description:
          job.description,

        applyLink:
          job.applyLink,

        salary:
          job.salary.min > 0 || job.salary.max > 0
            ? `${job.salary.currency || "$"}${job.salary.min > 0 ? job.salary.min : ""}${job.salary.max > 0 ? "-" + job.salary.max : ""} ${job.salary.period || ""}`.trim()
            : "Competitive",

        matchScore:
          score.totalScore,

        scoreBreakdown: {

          skill:
            score.skillScore,

          location:
            score.locationScore,

          salary:
            score.salaryScore,

          seniority:
            score.seniorityScore,
        },
      };

    });

  /**
   * -----------------------------
   * 6. Sort
   * -----------------------------
   */

  scoredJobs.sort(
    (a, b) =>
      b.matchScore -
      a.matchScore
  );

  /**
   * -----------------------------
   * 7. Top 10
   * -----------------------------
   */

  const recommendations =
    scoredJobs.slice(
      0,
      MAX_RESULTS
    );

  /**
   * -----------------------------
   * 8. Save Cache
   * -----------------------------
   */

  await saveRecommendationsCache(
    userId,
    resumeId,
    recommendations
  );

  /**
   * -----------------------------
   * 9. Return
   * -----------------------------
   */

  return recommendations;
}