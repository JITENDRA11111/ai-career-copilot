import {
  recommendJobs,
  saveJob,
  getSavedJobs,
} from "../services/jobService.js";

/**
 * POST /api/jobs/recommend
 *
 * Body:
 * {
 *    "resumeId":"..."
 * }
 */
export const recommend = async (req, res) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "resumeId is required.",
      });
    }

    const jobs = await recommendJobs(
      req.user.id,
      resumeId
    );

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });

  } catch (error) {

    console.error(
      "Recommend Jobs Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/jobs/save
 *
 * Body:
 * {
 *    jobId,
 *    title,
 *    company,
 *    employerLogo,
 *    location,
 *    employmentType,
 *    salary,
 *    applyLink,
 *    description,
 *    matchScore
 * }
 */
export const save = async (req, res) => {
  try {

    const savedJob = await saveJob(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Job saved successfully.",
      job: savedJob,
    });

  } catch (error) {

    console.error(
      "Save Job Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/jobs/saved
 */
export const getSaved = async (req, res) => {
  try {

    const jobs =
      await getSavedJobs(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });

  } catch (error) {

    console.error(
      "Get Saved Jobs Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};