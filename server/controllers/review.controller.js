import Resume from "../models/resume.model.js";
import ResumeReview from "../models/resume.review.js";

import {
  generateResumeReview,
} from "../services/reviewService.js";

/* -------------------------------------------------------------------------- */
/* POST /api/v1/resume/:id/review */
/* -------------------------------------------------------------------------- */

export const reviewResume = async (req, res) => {
  try {

    const { id } = req.params;

    /* ---------------------------------------------------------------------- */
    /* Resume Lookup */
    /* ---------------------------------------------------------------------- */

    const resume = await Resume.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Validation */
    /* ---------------------------------------------------------------------- */

    if (!resume.parsed) {
      return res.status(400).json({
        success: false,
        message:
          "Please parse the resume before requesting an AI review.",
      });
    }

    if (!resume.parsedData) {
      return res.status(400).json({
        success: false,
        message: "Parsed resume data not found.",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Generate AI Review */
    /* ---------------------------------------------------------------------- */

    const review = await generateResumeReview(
      resume.parsedData
    );

    /* ---------------------------------------------------------------------- */
    /* Save Review */
    /* ---------------------------------------------------------------------- */

    const savedReview = await ResumeReview.create({
      userId: req.user._id,

      resumeId: resume._id,

      review,
    });

    /* ---------------------------------------------------------------------- */
    /* Response */
    /* ---------------------------------------------------------------------- */

    return res.status(200).json({
      success: true,

      message:
        "AI Resume Review generated successfully.",

      reviewId: savedReview._id,

      review,
    });

  } catch (err) {

    console.error(
      "Resume Review Controller Error:",
      err
    );

    return res.status(500).json({
      success: false,

      message:
        err.message ||
        "Unable to generate resume review.",
    });

  }
};




/* -------------------------------------------------------------------------- */
/* GET /api/v1/resume/:id/review */
/* -------------------------------------------------------------------------- */

export const getResumeReview = async (req, res) => {
  try {
    const { id } = req.params;

    /* ---------------------------------------------------------------------- */
    /* Pagination (Optional History Support) */
    /* ---------------------------------------------------------------------- */

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 1, 1),
      20
    );

    const skip = (page - 1) * limit;

    /* ---------------------------------------------------------------------- */
    /* Total Reviews */
    /* ---------------------------------------------------------------------- */

    const total = await ResumeReview.countDocuments({
      userId: req.user._id,
      resumeId: id,
    });

    if (total === 0) {
      return res.status(404).json({
        success: false,
        message: "No review found for this resume.",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Fetch Review(s) */
    /* ---------------------------------------------------------------------- */

    const reviews = await ResumeReview.find({
      userId: req.user._id,
      resumeId: id,
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    /* ---------------------------------------------------------------------- */
    /* Response Formatting */
    /* ---------------------------------------------------------------------- */

    const formattedReviews = reviews.map((item) => ({
      reviewId: item._id,

      overallScore: item.review?.overallScore ?? 0,

      summary: item.review?.summary ?? "",

      strengths: item.review?.strengths ?? [],

      weaknesses: item.review?.weaknesses ?? [],

      quickWins: item.review?.quickWins ?? [],

      rewrittenSummary:
        item.review?.rewrittenSummary ?? "",

      sectionFeedback:
        item.review?.sectionFeedback ?? {},

      createdAt: item.createdAt,
    }));

    /* ---------------------------------------------------------------------- */
    /* Success Response */
    /* ---------------------------------------------------------------------- */

    return res.status(200).json({
      success: true,

      pagination: {
        total,

        page,

        limit,

        totalPages: Math.ceil(total / limit),

        hasNext:
          page < Math.ceil(total / limit),

        hasPrev: page > 1,
      },

      latestReview: formattedReviews[0],

      history:
        limit > 1 ? formattedReviews : undefined,
    });

  } catch (err) {

    console.error(
      "Get Resume Review Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Unable to fetch resume review.",
    });

  }
};