import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  reviewResume,
  getResumeReview,
} from "../controllers/review.controller.js";

import {
  streamResumeReview,
} from "../controllers/reviewStream.controller.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* AI Review */
/* -------------------------------------------------------------------------- */

router.post(
  "/:id/review",
  authMiddleware,
  reviewResume
);

/* -------------------------------------------------------------------------- */
/* Streaming AI Review */
/* -------------------------------------------------------------------------- */

router.post(
  "/:id/review/stream",
  authMiddleware,
  streamResumeReview
);

/* -------------------------------------------------------------------------- */
/* Get Latest Review */
/* -------------------------------------------------------------------------- */

router.get(
  "/:id/review",
  authMiddleware,
  getResumeReview
);

export default router;