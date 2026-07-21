import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  generateCodingTest,
  submitCodingSolution,
  evaluateCodingSolution,
  getCodingHistory,
  getSubmissionHistoryController,
  getBestSubmissionController,
  getCodingStatistics,
  getRecentCodingTests,
  deleteCodingTest,
  getCodingTestByIdController,
  generateOACodingTest,
} from "../controllers/coding.controller.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* Generate Coding Question */
/* -------------------------------------------------------------------------- */

router.post(
  "/generate",
  authMiddleware,
  generateCodingTest
);

router.post(
  "/generate-oa",
  authMiddleware,
  generateOACodingTest
);

/* -------------------------------------------------------------------------- */
/* Submit Solution */
/* -------------------------------------------------------------------------- */

router.post(
  "/submit",
  authMiddleware,
  submitCodingSolution
);



/* -------------------------------------------------------------------------- */
/* AI Evaluate Solution */
/* -------------------------------------------------------------------------- */

router.post(
  "/evaluate",
  authMiddleware,
  evaluateCodingSolution
);

/* -------------------------------------------------------------------------- */
/* History */
/* -------------------------------------------------------------------------- */

router.get(
  "/history",
  authMiddleware,
  getCodingHistory
);

/* -------------------------------------------------------------------------- */
/* Submission History */
/* -------------------------------------------------------------------------- */

router.get(
  "/history/:testId",
  authMiddleware,
  getSubmissionHistoryController
);

/* -------------------------------------------------------------------------- */
/* Best Submission */
/* -------------------------------------------------------------------------- */

router.get(
  "/best/:testId",
  authMiddleware,
  getBestSubmissionController
);

/* -------------------------------------------------------------------------- */
/* Statistics */
/* -------------------------------------------------------------------------- */

router.get(
  "/statistics",
  authMiddleware,
  getCodingStatistics
);

router.get(
  "/stats",
  authMiddleware,
  getCodingStatistics
);

/* -------------------------------------------------------------------------- */
/* Recent */
/* -------------------------------------------------------------------------- */

router.get(
  "/recent",
  authMiddleware,
  getRecentCodingTests
);


router.get("/:testId", authMiddleware, getCodingTestByIdController);
/* -------------------------------------------------------------------------- */
/* Delete */
/* -------------------------------------------------------------------------- */

router.delete(
  "/:testId",
  authMiddleware,
  deleteCodingTest
);

export default router;