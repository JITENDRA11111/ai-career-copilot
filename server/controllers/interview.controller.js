// controllers/interview.controller.js

import interviewService from "../services/interview/interviewService.js";
import interviewReportService from "../services/interview/interviewReportService.js";

/**
 * POST /api/v1/interview/start
 */
export const startInterview = async (req, res) => {
  try {
    const { resumeId, jobTitle, type } = req.body;

    if (!resumeId || !jobTitle || !type) {
      return res.status(400).json({
        success: false,
        message: "resumeId, jobTitle and type are required.",
      });
    }

    if (!["technical", "behavioral", "hr"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview type.",
      });
    }

    const result = await interviewService.startInterview(req.user.id, {
      resumeId,
      jobTitle,
      type,
    });

    return res.status(200).json({
      success: true,
      message: "Interview started successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Start Interview Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to start interview.",
    });
  }
};

/**
 * GET /api/v1/interview/:sessionId
 */
export const getInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await interviewService.getSession(
      sessionId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Get Interview Session Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch interview session.",
    });
  }
};

/**
 * GET /api/v1/interview/history
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await interviewReportService.getHistory(req.user.id, { page, limit });

    return res.status(200).json({
      success: true,
      data: result.sessions,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Interview History Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch interview history.",
    });
  }
};

/**
 * GET /api/v1/interview/stats
 * 
 * IMPORTANT:
 * Keep this ABOVE /:sessionId
 */
export const getInterviewStats = async (req, res) => {
  try {
    const stats = await interviewReportService.getStats(req.user.id);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get Interview Stats Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch interview stats.",
    });
  }
};

/**
 * GET /api/v1/interview/:sessionId/report
 */
export const getInterviewReport = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await interviewReportService.getReport(
      sessionId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Get Interview Report Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch interview report.",
    });
  }
};

/**
 * POST /api/v1/interview/:sessionId/pdf
 */
export const generatePDFReport = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await interviewReportService.generateAndUploadPDFReport(
      sessionId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "PDF report generated and uploaded successfully.",
      data: {
        pdfUrl: result.pdfUrl,
      },
    });
  } catch (error) {
    console.error("Generate PDF Report Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF report.",
    });
  }
};

/**
 * DELETE /api/v1/interview/:sessionId
 */
export const deleteInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await interviewService.deleteInterviewSession(
      sessionId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Interview session deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Interview Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete interview session.",
    });
  }
};