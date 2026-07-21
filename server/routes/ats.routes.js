import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  generateATSScore,
  getATSHistory,
} from "../controllers/ats.controller.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* Generate ATS Score */
/* POST /api/v1/ats/score */
/* -------------------------------------------------------------------------- */

router.post(
  "/score",
  authMiddleware,
  generateATSScore
);

/* -------------------------------------------------------------------------- */
/* ATS History */
/* GET /api/v1/ats/history */
/* -------------------------------------------------------------------------- */

router.get(
  "/history",
  authMiddleware,
  getATSHistory
);

export default router;