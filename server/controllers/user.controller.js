import Resume from "../models/resume.model.js";
import InterviewSession from "../models/InterviewSession.js";
import ATSScore from "../models/ATSScore.js";
import CodingTest from "../models/CodingTest.js";
import SkillGap from "../models/SkillGap.js";

/**
 * GET /api/v1/user/dashboard-stats
 * Aggregates all user-specific data for the progress dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Core Card Stats
    const resumesCount = await Resume.countDocuments({ userId });
    const interviewsCount = await InterviewSession.countDocuments({ user: userId });
    const codingTestsCount = await CodingTest.countDocuments({ userId });

    const avgAtsRes = await ATSScore.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgScore: { $avg: "$score.overall" } } },
    ]);
    const avgAtsScore = avgAtsRes[0]?.avgScore ? Math.round(avgAtsRes[0].avgScore) : 0;

    // 2. Line Chart: ATS Scores Over Time
    const atsHistory = await ATSScore.find({ userId })
      .sort({ createdAt: 1 })
      .select("score.overall createdAt")
      .lean();

    const atsScoresOverTime = atsHistory.map((item) => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      score: item.score?.overall || 0,
    }));

    // 3. Radar Chart: Skill Coverage (Current vs Required for latest target role)
    const latestSkillGap = await SkillGap.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    let skillCoverage = [];
    let targetRole = "None Analyzed Yet";

    if (latestSkillGap) {
      targetRole = latestSkillGap.targetRole;
      const current = latestSkillGap.currentSkills || [];
      const required = latestSkillGap.requiredSkills || [];

      // We normalize all required skills as 100 on the target axis
      // If the user has it, they get 100 on current axis, else 0
      skillCoverage = required.map((skill) => {
        const hasSkill = current.some(
          (s) => s.toLowerCase().trim() === skill.toLowerCase().trim()
        );
        return {
          skill,
          current: hasSkill ? 100 : 0,
          target: 100,
        };
      });
    } else {
      // Default radar placeholders
      skillCoverage = [
        { skill: "JavaScript", current: 80, target: 100 },
        { skill: "React", current: 70, target: 100 },
        { skill: "Node.js", current: 40, target: 100 },
        { skill: "Docker", current: 10, target: 100 },
        { skill: "Databases", current: 60, target: 100 },
      ];
    }

    // 4. Bar Chart: Interview Scores by Type
    const interviewStats = await InterviewSession.aggregate([
      { $match: { user: userId, status: "completed" } },
      { $group: { _id: "$type", avgScore: { $avg: "$overallScore" } } },
    ]);

    const interviewScoresByType = ["behavioral", "technical", "hr"].map((type) => {
      const match = interviewStats.find((s) => s._id === type);
      return {
        type: type.toUpperCase(),
        score: match?.avgScore ? Math.round(match.avgScore) : 0,
      };
    });

    const avgInterviewScoreRes = await InterviewSession.aggregate([
      { $match: { user: userId, status: "completed" } },
      { $group: { _id: null, avgScore: { $avg: "$overallScore" } } },
    ]);
    const avgInterviewScore = avgInterviewScoreRes[0]?.avgScore ? Math.round(avgInterviewScoreRes[0].avgScore) : 0;

    // 4.5 Coding Scores by Difficulty
    const codingStats = await CodingTest.aggregate([
      { $match: { userId } },
      { $group: { _id: "$difficulty", avgScore: { $avg: "$bestScore" } } },
    ]);

    const codingScoresByDifficulty = ["easy", "medium", "hard"].map((difficulty) => {
      const match = codingStats.find((s) => s._id === difficulty);
      return {
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        score: match?.avgScore ? Math.round(match.avgScore) : 0,
      };
    });

    const avgCodingScoreRes = await CodingTest.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgScore: { $avg: "$bestScore" } } },
    ]);
    const avgCodingScore = avgCodingScoreRes[0]?.avgScore ? Math.round(avgCodingScoreRes[0].avgScore) : 0;

    // 5. Recent Activity Feed
    const recentResumes = await Resume.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentInterviews = await InterviewSession.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentAts = await ATSScore.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const activities = [
      ...recentResumes.map((r) => ({
        id: `resume-${r._id}`,
        type: "resume",
        title: `Uploaded resume: ${r.fileName}`,
        date: r.createdAt,
      })),
      ...recentInterviews.map((i) => ({
        id: `interview-${i._id}`,
        type: "interview",
        title: `Attempted ${i.type} interview for ${i.jobTitle}`,
        date: i.createdAt,
        score: i.overallScore,
      })),
      ...recentAts.map((a) => ({
        id: `ats-${a._id}`,
        type: "ats",
        title: `Ran ATS scan for ${a.score?.overall}% match`,
        date: a.createdAt,
        score: a.score?.overall,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      stats: {
        resumesCount,
        interviewsCount,
        codingTestsCount,
        avgAtsScore,
        avgInterviewScore,
        avgCodingScore,
      },
      charts: {
        atsScoresOverTime,
        skillCoverage,
        targetRole,
        interviewScoresByType,
        codingScoresByDifficulty,
      },
      activities,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
