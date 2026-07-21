import express from "express";

import auth from "../middleware/authMiddleware.js";

import {
  generateSkillGap,
  getSkillGapHistory,
  getLatestSkillGap,
  deleteSkillGap,
} from "../controllers/skillGap.controller.js";

const router = express.Router();

/**
 * ---------------------------------------------------------
 * POST /api/v1/skills/gap
 *
 * Body:
 * {
 *    resumeId,
 *    targetRole
 * }
 * ---------------------------------------------------------
 */
router.post(
  "/gap",
  auth,
  generateSkillGap
);

/**
 * ---------------------------------------------------------
 * GET /api/v1/skills/gap/history
 * ---------------------------------------------------------
 */
router.get(
  "/gap/history",
  auth,
  getSkillGapHistory
);

/**
 * ---------------------------------------------------------
 * GET /api/v1/skills/gap/latest
 * (Optional)
 * ---------------------------------------------------------
 */
router.get(
  "/gap/latest",
  auth,
  getLatestSkillGap
);

/**
 * ---------------------------------------------------------
 * DELETE /api/v1/skills/gap/:id
 * (Optional)
 * ---------------------------------------------------------
 */
router.delete(
  "/gap/:id",
  auth,
  deleteSkillGap
);

export default router;