// services/interview/reportService.js

import ai from "../../config/gemini.js";
import { buildReportPrompt } from "../../utils/interviewPrompt.js";

class ReportService {
  async generateReport({
    jobTitle,
    interviewType,
    interviewHistory,
  }) {
    try {
      const prompt = buildReportPrompt({
        jobTitle,
        interviewType,
        interviewHistory,
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let text = response.text;

      // Remove markdown if Gemini wraps JSON
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const report = JSON.parse(text);

      return {
        overallScore: Number(report.overallScore) || 0,

        strengths: Array.isArray(report.strengths)
          ? report.strengths
          : [],

        improvements: Array.isArray(report.improvements)
          ? report.improvements
          : [],

        questionBreakdown: Array.isArray(report.questionBreakdown)
          ? report.questionBreakdown
          : [],
      };
    } catch (error) {
      console.error("Interview Report Generation Error:", error);

      // ---------- Fallback Report ----------

      const totalQuestions = interviewHistory.length;

      const overallScore =
        totalQuestions > 0
          ? Math.round(
              interviewHistory.reduce(
                (sum, q) => sum + (q.score || 0),
                0
              ) / totalQuestions
            )
          : 0;

      const strengths = [];
      const improvements = [];

      if (overallScore >= 85) {
        strengths.push(
          "Excellent technical understanding",
          "Clear communication",
          "Strong problem-solving skills"
        );
      } else if (overallScore >= 70) {
        strengths.push(
          "Good technical foundation",
          "Reasonable communication skills"
        );

        improvements.push(
          "Provide more detailed explanations",
          "Support answers with practical examples"
        );
      } else {
        improvements.push(
          "Improve technical depth",
          "Practice explaining concepts clearly",
          "Use structured answers",
          "Give more real-world examples"
        );
      }

      const questionBreakdown = interviewHistory.map((item) => ({
        question: item.question,
        score: item.score,
        feedback: item.feedback,
      }));

      return {
        overallScore,
        strengths,
        improvements,
        questionBreakdown,
      };
    }
  }
}

export default new ReportService();