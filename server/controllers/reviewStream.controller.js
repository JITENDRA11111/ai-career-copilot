import Resume from "../models/resume.model.js";
import ResumeReview from "../models/resume.review.js";

import { SSEConnection } from "../utils/sse.js";

import {
  streamResumeReviewWithRetry,
} from "../services/reviewStreamService.js";

/* -------------------------------------------------------------------------- */
/* POST /api/v1/resume/:id/review/stream */
/* -------------------------------------------------------------------------- */

export const streamResumeReview = async (
  req,
  res
) => {

  const sse = new SSEConnection(req, res);

  try {

    /* ---------------------------------------------------------------------- */
    /* Authentication */
    /* ---------------------------------------------------------------------- */

    sse.sendProgress(
      "Authenticating...",
      5
    );

    if (!req.user) {

      sse.sendError(
        new Error("Unauthorized")
      );

      return;

    }

    /* ---------------------------------------------------------------------- */
    /* Resume Lookup */
    /* ---------------------------------------------------------------------- */

    const resume =
      await Resume.findOne({

        _id: req.params.id,

        userId: req.user._id,

      });

    if (!resume) {

      sse.sendError(
        new Error("Resume not found.")
      );

      return;

    }

    sse.sendProgress(
      "Resume Found",
      15
    );

    /* ---------------------------------------------------------------------- */
    /* Validation */
    /* ---------------------------------------------------------------------- */

    if (!resume.parsed) {

      sse.sendError(
        new Error(
          "Resume must be parsed before review."
        )
      );

      return;

    }

    if (!resume.parsedData) {

      sse.sendError(
        new Error(
          "Parsed resume data not found."
        )
      );

      return;

    }

    sse.sendProgress(
      "Generating AI Review...",
      20
    );

    /* ---------------------------------------------------------------------- */
    /* Stream Review */
    /* ---------------------------------------------------------------------- */

    const review =
      await streamResumeReviewWithRetry(
        resume.parsedData,
        sse
      );

    sse.sendProgress(
      "Saving Review...",
      95
    );

    /* ---------------------------------------------------------------------- */
    /* Save Review */
    /* ---------------------------------------------------------------------- */

    const savedReview =
      await ResumeReview.findOneAndUpdate(

        {
          userId: req.user._id,
          resumeId: resume._id,
        },

        {
          review,
        },

        {
          new: true,
          upsert: true,
          runValidators: true,
        }

      );

    sse.sendProgress(
      "Completed",
      100
    );

    /* ---------------------------------------------------------------------- */
    /* Complete Event */
    /* ---------------------------------------------------------------------- */

    sse.complete({

      success: true,

      message:
        "AI Resume Review generated successfully.",

      reviewId: savedReview._id,

      review,

      generatedAt:
        savedReview.updatedAt,

    });

    /* ---------------------------------------------------------------------- */
    /* Production Logging */
    /* ---------------------------------------------------------------------- */

    console.log(
      "========== REVIEW STREAM =========="
    );

    console.log(
      `User : ${req.user.email}`
    );

    console.log(
      `Resume : ${resume._id}`
    );

    console.log(
      `Review : ${savedReview._id}`
    );

    console.log(
      `Overall Score : ${review.overallScore}`
    );

    console.log(
      "==================================="
    );

  } catch (err) {

    console.error(
      "Streaming Review Error:",
      err
    );

    if (!sse.closed) {

      sse.sendError(err);

    }

  } finally {

    /* ---------------------------------------------------------------------- */
    /* Cleanup */
    /* ---------------------------------------------------------------------- */

    if (!sse.closed) {

      sse.close();

    }

  }

};