import {
  generateTest,
  submitSolution,
  evaluateSolution,
  history,
  submissionHistory,
  bestSubmission,
  statistics,
  recentTests,
  removeCodingTest,
  getCodingTest,
  generateOATests,
} from "../services/codingService.js";

/* -------------------------------------------------------------------------- */
/* Generate OA Coding Test */
/* -------------------------------------------------------------------------- */

export const generateOACodingTest = async (req, res) => {
  try {
    const { language } = req.body;
    if (!["cpp", "javascript", "python"].includes(language)) {
      return res.status(400).json({ success: false, message: "Unsupported language." });
    }
    const codingTests = await generateOATests({ userId: req.user.id, language });
    return res.status(201).json({ success: true, message: "OA generated successfully.", codingTests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

export async function getCodingTestByIdController(req, res) {
  try {
    const { testId } = req.params;

    const codingTest = await getCodingTest(testId);

    res.status(200).json({
      success: true,
      codingTest,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Generate Coding Test */
/* -------------------------------------------------------------------------- */

export const generateCodingTest = async (req, res) => {
  try {
    const { skill, difficulty, language } = req.body;

    if (!skill || !difficulty || !language) {
      return res.status(400).json({
        success: false,
        message:
          "skill, difficulty and language are required.",
      });
    }

    if (
      !["easy", "medium", "hard"].includes(difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty.",
      });
    }

    if (
      !["cpp", "javascript", "python"].includes(
        language
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language.",
      });
    }

    const codingTest = await generateTest({
      userId: req.user.id,
      skill,
      difficulty,
      language,
    });

    return res.status(201).json({
      success: true,
      message: "Coding test generated successfully.",
      codingTest,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* Submit Solution */
/* -------------------------------------------------------------------------- */

export const submitCodingSolution = async (
  req,
  res
) => {
  try {
    const { testId, code, language } = req.body;

    if (!testId || !code || !language) {
      return res.status(400).json({
        success: false,
        message:
          "testId, code and language are required.",
      });
    }

    const result = await submitSolution({
      testId,
      code,
      language,
    });

    return res.status(200).json({
      success: true,
      message: "Submission evaluated successfully.",
      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal Server Error",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* AI Evaluate Solution */
/* -------------------------------------------------------------------------- */

export const evaluateCodingSolution =
  async (req, res) => {
    try {
      const { testId, code, language } =
        req.body;

      if (
        !testId ||
        !code ||
        !language
      ) {
        return res.status(400).json({
          success: false,
          message:
            "testId, code and language are required.",
        });
      }

      const feedback =
        await evaluateSolution({
          testId,
          code,
          language,
        });

      return res.status(200).json({
        success: true,
        feedback,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Internal Server Error",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/* Get Coding History */
/* -------------------------------------------------------------------------- */

export const getCodingHistory =
  async (req, res) => {
    try {
      const tests = await history(
        req.user.id
      );

      return res.status(200).json({
        success: true,
        count: tests.length,
        tests,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Internal Server Error",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/* Get Submission History */
/* -------------------------------------------------------------------------- */

export const getSubmissionHistoryController =
  async (req, res) => {
    try {
      const submissions =
        await submissionHistory(
          req.params.testId,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        count: submissions.length,
        submissions,
      });
    } catch (error) {
      console.error(error);

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          "Submission history not found.",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/* Best Submission */
/* -------------------------------------------------------------------------- */

export const getBestSubmissionController =
  async (req, res) => {
    try {
      const submission =
        await bestSubmission(
          req.params.testId,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        submission,
      });
    } catch (error) {
      console.error(error);

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          "Submission not found.",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/* Coding Statistics */
/* -------------------------------------------------------------------------- */

export const getCodingStatistics =
  async (req, res) => {
    try {
      const stats =
        await statistics(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        statistics: stats,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Internal Server Error",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/* Recent Coding Tests */
/* -------------------------------------------------------------------------- */

export const getRecentCodingTests =
  async (req, res) => {
    try {
      const tests =
        await recentTests(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        count: tests.length,
        tests,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Internal Server Error",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/* Delete Coding Test */
/* -------------------------------------------------------------------------- */

export const deleteCodingTest =
  async (req, res) => {
    try {
      await removeCodingTest(
        req.params.testId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Coding test deleted successfully.",
      });
    } catch (error) {
      console.error(error);

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          "Coding test not found.",
      });
    }
  };