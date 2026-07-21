import Resume from "../models/resume.model.js";
import ATSScore from "../models/ATSScore.js";

import { extractATSScore } from "../services/atsService.js";

/* -------------------------------------------------------------------------- */
/* POST /api/v1/ats/score */
/* -------------------------------------------------------------------------- */

export const generateATSScore = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    /* ---------------------------------------------------------------------- */
    /* Validation */
    /* ---------------------------------------------------------------------- */

    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume ID and Job Description are required",
      });
    }

    if (jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message:
          "Job Description should contain at least 50 characters.",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Find Resume */
    /* ---------------------------------------------------------------------- */

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Resume Parsed? */
    /* ---------------------------------------------------------------------- */

    if (!resume.parsed) {
      return res.status(400).json({
        success: false,
        message:
          "Resume must be parsed before generating ATS score.",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* AI ATS Analysis */
    /* ---------------------------------------------------------------------- */

    const atsResult = await extractATSScore(
      resume.parsedData,
      jobDescription
    );

    /* ---------------------------------------------------------------------- */
    /* Save History */
    /* ---------------------------------------------------------------------- */

    const atsHistory = await ATSScore.create({
      userId: req.user._id,

      resumeId: resume._id,

      jobDescription,

      score: atsResult,
    });

    /* ---------------------------------------------------------------------- */
    /* Response */
    /* ---------------------------------------------------------------------- */

    return res.status(200).json({
      success: true,

      message: "ATS Score generated successfully",

      ats: atsResult,

      historyId: atsHistory._id,
    });

  } catch (err) {

    console.error("ATS Controller Error:", err);

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Unable to generate ATS score",
    });

  }
};



/* -------------------------------------------------------------------------- */
/* GET /api/v1/ats/history */
/* -------------------------------------------------------------------------- */

export const getATSHistory = async (req, res) => {
  try {
    /* ---------------------------------------------------------------------- */
    /* Pagination */
    /* ---------------------------------------------------------------------- */

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    /* ---------------------------------------------------------------------- */
    /* Total Documents */
    /* ---------------------------------------------------------------------- */

    const total = await ATSScore.countDocuments({
      userId: req.user._id,
    });

    /* ---------------------------------------------------------------------- */
    /* Fetch History */
    /* ---------------------------------------------------------------------- */

    const history = await ATSScore.find({
      userId: req.user._id,
    })
      .populate({
        path: "resumeId",
        select: "fileName uploadedAt parsed",
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

    const formattedHistory = history.map((item) => ({
      id: item._id,

      resume: item.resumeId
        ? {
            id: item.resumeId._id,
            fileName: item.resumeId.fileName,
            uploadedAt: item.resumeId.uploadedAt,
            parsed: item.resumeId.parsed,
          }
        : null,

      overallScore: item.score?.overall ?? 0,

      sections: item.score?.sections ?? {
        skills: 0,
        experience: 0,
        keywords: 0,
        format: 0,
      },

      matchedKeywords:
        item.score?.matchedKeywords ?? [],

      missingKeywords:
        item.score?.missingKeywords ?? [],

      suggestions:
        item.score?.suggestions ?? [],

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

      history: formattedHistory,
    });

  } catch (err) {

    console.error(
      "ATS History Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Unable to fetch ATS history",
    });

  }
};