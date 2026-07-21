import express from "express";

import auth from "../middleware/authMiddleware.js";

import {
  recommend,
  save,
  getSaved,
} from "../controllers/job.controller.js";

const router = express.Router();

/**
 * POST /api/jobs/recommend
 *
 * Body:
 * {
 *    resumeId
 * }
 */
router.post(
  "/recommend",
  auth,
  recommend
);

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
router.post(
  "/save",
  auth,
  save
);

/**
 * GET /api/jobs/saved
 */
router.get(
  "/saved",
  auth,
  getSaved
);

export default router;