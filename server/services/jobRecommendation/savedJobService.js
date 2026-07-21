import SavedJob from "../../models/SavedJob.js";

/**
 * Save Job
 *
 * @param {String} userId
 * @param {Object} job
 * @returns {Object}
 */
export async function saveJob(userId, job) {
  if (!job) {
    throw new Error("Job data is required.");
  }

  const existingJob = await SavedJob.findOne({
    userId,
    jobId: job.jobId,
  });

  if (existingJob) {
    return existingJob;
  }

  const savedJob = await SavedJob.create({
    userId,

    jobId: job.jobId,

    title: job.title,

    company: job.company,

    employerLogo: job.employerLogo,

    location: job.location,

    employmentType: job.employmentType,

    salary:
      typeof job.salary === "object"
        ? `${job.salary.currency || ""} ${job.salary.min || 0} - ${
            job.salary.max || 0
          }`
        : job.salary || "",

    applyLink: job.applyLink,

    description: job.description,

    matchScore: job.matchScore || 0,
  });

  return savedJob;
}

/**
 * Get Saved Jobs
 *
 * @param {String} userId
 * @returns {Array}
 */
export async function getSavedJobs(userId) {
  return await SavedJob.find({
    userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
}

/**
 * Delete Saved Job
 *
 * Optional helper
 */
export async function deleteSavedJob(
  userId,
  jobId
) {
  const deleted = await SavedJob.findOneAndDelete({
    userId,
    jobId,
  });

  return deleted;
}

/**
 * Check whether job is already saved
 *
 * Optional helper
 */
export async function isJobSaved(
  userId,
  jobId
) {
  const job = await SavedJob.findOne({
    userId,
    jobId,
  });

  return !!job;
}