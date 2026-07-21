import {
  analyzeSkillGap,
  getHistory,
  deleteAnalysis,
} from "../services/skillGapService.js";

/**
 * --------------------------------------------------------
 * POST /api/v1/skills/gap
 *
 * Body:
 * {
 *    "resumeId":"...",
 *    "targetRole":"Senior Frontend Engineer"
 * }
 * --------------------------------------------------------
 */
export const generateSkillGap = async (
  req,
  res
) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "resumeId is required.",
      });
    }

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: "targetRole is required.",
      });
    }

    const analysis =
      await analyzeSkillGap(
        req.user.id,
        resumeId,
        targetRole
      );

    return res.status(200).json({
      success: true,
      message:
        "Skill Gap Analysis generated successfully.",
      analysis,
    });
  } catch (error) {
    console.error(
      "Generate Skill Gap Error:",
      error
    );

    if (error.message === "Resume not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
      "Resume has not been parsed."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
      "No skills found in parsed resume."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

/**
 * --------------------------------------------------------
 * GET /api/v1/skills/gap/history
 * --------------------------------------------------------
 */
export const getSkillGapHistory =
  async (req, res) => {
    try {
      const history =
        await getHistory(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        count: history.length,
        history,
      });
    } catch (error) {
      console.error(
        "Skill Gap History Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Internal Server Error",
      });
    }
  };

/**
 * --------------------------------------------------------
 * GET /api/v1/skills/gap/latest
 *
 * Optional endpoint
 * --------------------------------------------------------
 */
export const getLatestSkillGap =
  async (req, res) => {
    try {
      const history =
        await getHistory(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        analysis:
          history.length > 0
            ? history[0]
            : null,
      });
    } catch (error) {
      console.error(
        "Latest Skill Gap Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Internal Server Error",
      });
    }
  };

/**
 * --------------------------------------------------------
 * DELETE /api/v1/skills/gap/:id
 *
 * Optional endpoint
 * --------------------------------------------------------
 */
export const deleteSkillGap = async (req, res) => {
  try {
    const deleted = await deleteAnalysis(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Skill Gap Analysis deleted successfully.",
      deletedId: req.params.id,
    });

  } catch (error) {

    console.error(error);

    if (
      error.message ===
      "Skill Gap Analysis not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};