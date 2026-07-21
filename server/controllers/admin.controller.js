import User from "../models/User.js";
import Resume from "../models/resume.model.js";
import InterviewSession from "../models/InterviewSession.js";
import ATSScore from "../models/ATSScore.js";
import CodingTest from "../models/CodingTest.js";
import ActivityLog from "../models/ActivityLog.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * GET /api/admin/users
 * Paginated user list with stats
 */
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = { deletedAt: null };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const resumesCount = await Resume.countDocuments({ userId: user._id });
        const interviewsCount = await InterviewSession.countDocuments({ user: user._id });
        const codingTestsCount = await CodingTest.countDocuments({ userId: user._id });

        const avgAtsRes = await ATSScore.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, avgScore: { $avg: "$score.overall" } } },
        ]);
        const avgAtsScore = avgAtsRes[0]?.avgScore ? Math.round(avgAtsRes[0].avgScore) : 0;

        return {
          ...user,
          stats: {
            resumesCount,
            interviewsCount,
            codingTestsCount,
            avgAtsScore,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
      users: usersWithStats,
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * GET /api/admin/stats
 * Platform-wide statistics and metrics
 */
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ deletedAt: null });
    const totalResumes = await Resume.countDocuments();
    const totalInterviews = await InterviewSession.countDocuments();
    const totalCodingTests = await CodingTest.countDocuments();

    const avgAtsRes = await ATSScore.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score.overall" } } },
    ]);
    const avgAtsScore = avgAtsRes[0]?.avgScore ? Math.round(avgAtsRes[0].avgScore) : 0;

    // Signups per day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const signupsTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, deletedAt: null } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Feature usage breakdown
    const featureUsage = [
      { name: "Resumes Uploaded", count: totalResumes },
      { name: "Interviews Done", count: totalInterviews },
      { name: "Coding Tests", count: totalCodingTests },
      { name: "ATS Scored", count: await ATSScore.countDocuments() },
    ];

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalResumes,
        totalInterviews,
        totalCodingTests,
        avgAtsScore,
      },
      charts: {
        signupsTrend: signupsTrend.map((item) => ({ date: item._id, signups: item.count })),
        featureUsage,
      },
    });
  } catch (error) {
    console.error("Admin Get Stats Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Change a user's role
 */
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role value" });
    }

    const user = await User.findById(id);
    if (!user || user.deletedAt) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    await logActivity(
      req.user._id,
      "CHANGE_ROLE",
      `Changed role of user ${user.email} (${user._id}) to ${role}`,
      req
    );

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Admin Change Role Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Soft delete user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.deletedAt) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.deletedAt = new Date();
    await user.save();

    await logActivity(
      req.user._id,
      "DELETE_USER",
      `Soft deleted user ${user.email} (${user._id})`,
      req
    );

    return res.status(200).json({
      success: true,
      message: "User account deactivated (soft deleted) successfully.",
    });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * GET /api/admin/logs
 * Recent platform activity logs
 */
export const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      logs: logs.map((log) => ({
        id: log._id,
        user: log.userId
          ? { id: log.userId._id, name: log.userId.name, email: log.userId.email, role: log.userId.role }
          : { name: "System / Guest", email: "N/A" },
        action: log.action,
        details: log.details,
        ip: log.ip || "N/A",
        userAgent: log.userAgent || "N/A",
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin Get Logs Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
