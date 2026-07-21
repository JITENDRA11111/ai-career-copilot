import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  startInterview,
  getInterviewSession,
  getInterviewHistory,
  deleteInterviewSession,
  getInterviewReport,
  getInterviewStats,
  generatePDFReport,
} from "../controllers/interview.controller.js";

const router = express.Router();

/**
 * Start Interview
 * POST /api/v1/interview/start
 */
router.post(
  "/start",
  authMiddleware,
  startInterview
);

/**
 * Interview Stats
 * GET /api/v1/interview/stats
 *
 * IMPORTANT:
 * Keep this ABOVE any /:sessionId routes
 */
router.get(
  "/stats",
  authMiddleware,
  getInterviewStats
);

/**
 * Interview History
 * GET /api/v1/interview/history
 */
router.get(
  "/history",
  authMiddleware,
  getInterviewHistory
);

/**
 * Get Interview Report
 * GET /api/v1/interview/:sessionId/report
 */
router.get(
  "/:sessionId/report",
  authMiddleware,
  getInterviewReport
);

/**
 * Generate PDF Report
 * POST /api/v1/interview/:sessionId/pdf
 */
router.post(
  "/:sessionId/pdf",
  authMiddleware,
  generatePDFReport
);

/**
 * Get Interview Session
 * GET /api/v1/interview/:sessionId
 */
router.get(
  "/:sessionId",
  authMiddleware,
  getInterviewSession
);

/**
 * Delete Interview Session
 * DELETE /api/v1/interview/:sessionId
 */
router.delete(
  "/:sessionId",
  authMiddleware,
  deleteInterviewSession
);

export default router;