// services/interview/interviewService.js

import mongoose from "mongoose";

import Resume from "../../models/resume.model.js";
import InterviewSession from "../../models/InterviewSession.js";

import questionService from "./questionService.js";
import evaluationService from "./evaluationService.js";
import reportService from "./reportService.js";
import { cache } from "../../config/redis.js";

class InterviewService {
  /**
   * Start a new interview
   */
  async startInterview(userId, { resumeId, jobTitle, type }) {
    try {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        throw new Error("Invalid Resume ID.");
      }

      const resume = await Resume.findOne({
        _id: resumeId,
        userId,
      });

      if (!resume) {
        throw new Error("Resume not found.");
      }

      if (!resume.parsed || !resume.parsedData) {
        throw new Error(
          "Resume has not been parsed yet. Please parse the resume first."
        );
      }

      const questions = await questionService.generateQuestions({
        resumeData: resume.parsedData,
        jobTitle,
        interviewType: type,
      });

      const formattedQuestions = questions.map((item) => ({
        index: item.index,
        question: item.question,
        answer: "",
        score: 0,
        feedback: "",
        followUp: "",
        followUpAnswer: "",
      }));

      const sessionId = new mongoose.Types.ObjectId().toString();

      const sessionData = {
        _id: sessionId,
        user: userId,
        resume: resumeId,
        jobTitle,
        type,
        status: "active",
        questions: formattedQuestions,
        startedAt: new Date(),
      };

      await cache.set(`interview:session:${sessionId}`, sessionData, 86400);

      return {
        sessionId,
        question: formattedQuestions[0].question,
        index: 0,
        total: formattedQuestions.length,
      };
    } catch (error) {
      console.error("Start Interview Error:", error);
      throw error;
    }
  }

  /**
   * Get interview session
   */
  async getSession(sessionId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new Error("Invalid Session ID.");
      }

      // Try reading from cache
      const cachedSession = await cache.get(`interview:session:${sessionId}`);
      if (cachedSession) {
        if (cachedSession.user.toString() !== userId.toString()) {
          throw new Error("Unauthorized access to this session.");
        }
        const session = new InterviewSession(cachedSession);
        
        // Custom save function to save to cache instead of DB
        session.save = async function() {
          await cache.set(`interview:session:${sessionId}`, this.toObject(), 86400);
          return this;
        };
        
        return session;
      }

      // Fallback to database
      const session = await InterviewSession.findOne({
        _id: sessionId,
        user: userId,
      });

      if (!session) {
        throw new Error("Interview session not found.");
      }

      return session;
    } catch (error) {
      console.error("Get Interview Session Error:", error);
      throw error;
    }
  }

  /**
   * Submit answer for a question
   */
  async submitAnswer(sessionId, userId, { questionIndex, answer }) {
    try {
      const session = await this.getSession(sessionId, userId);

      if (session.status === "completed") {
        throw new Error("Interview session has already been completed.");
      }

      if (
        questionIndex < 0 ||
        questionIndex >= session.questions.length
      ) {
        throw new Error("Invalid question index.");
      }

      const currentQuestion = session.questions[questionIndex];

      const isAnsweringFollowUp = currentQuestion.answer && currentQuestion.followUp && !currentQuestion.followUpAnswer;

      if (currentQuestion.answer && !isAnsweringFollowUp) {
        throw new Error("Answer for this question has already been submitted.");
      }

      let evaluation;
      if (isAnsweringFollowUp) {
        // Evaluate follow up
        evaluation = await evaluationService.evaluateFollowUp({
          question: currentQuestion.question,
          answer: currentQuestion.answer,
          followUpQuestion: currentQuestion.followUp,
          followUpAnswer: answer,
          jobTitle: session.jobTitle,
          interviewType: session.type,
        });

        currentQuestion.followUpAnswer = answer;
        currentQuestion.score = evaluation.score;
        currentQuestion.feedback = evaluation.feedback;

        await session.save();

        const nextIndex = questionIndex + 1;

        if (nextIndex >= session.questions.length) {
          const report = await this.completeInterview(session);
          return {
            completed: true,
            report,
          };
        }

        return {
          completed: false,
          feedback: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            followUp: "", // No further follow ups for this question
          },
          nextQuestion: {
            question: session.questions[nextIndex].question,
            index: nextIndex,
            total: session.questions.length,
          },
        };
      } else {
        // Evaluate main question
        evaluation = await evaluationService.evaluateAnswer({
          question: currentQuestion.question,
          answer,
          jobTitle: session.jobTitle,
          interviewType: session.type,
        });

        currentQuestion.answer = answer;
        currentQuestion.score = evaluation.score;
        currentQuestion.feedback = evaluation.feedback;
        
        // If score is weak (< 70) and a follow up is generated, trigger follow up
        if (evaluation.score < 70 && evaluation.followUp && evaluation.followUp.trim()) {
          currentQuestion.followUp = evaluation.followUp;
          await session.save();

          return {
            completed: false,
            feedback: {
              score: evaluation.score,
              feedback: evaluation.feedback,
              followUp: evaluation.followUp,
            },
            nextQuestion: {
              question: evaluation.followUp,
              index: questionIndex, // same index since we are doing follow up
              total: session.questions.length,
            },
          };
        }

        // Otherwise proceed to next question
        await session.save();

        const nextIndex = questionIndex + 1;

        if (nextIndex >= session.questions.length) {
          const report = await this.completeInterview(session);
          return {
            completed: true,
            report,
          };
        }

        return {
          completed: false,
          feedback: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            followUp: "",
          },
          nextQuestion: {
            question: session.questions[nextIndex].question,
            index: nextIndex,
            total: session.questions.length,
          },
        };
      }
    } catch (error) {
      console.error("Submit Interview Answer Error:", error);
      throw error;
    }
  }

  /**
   * Complete interview and generate final report
   */
  async completeInterview(session) {
    try {
      // Filter out unanswered questions so early submission doesn't penalize
      const answeredQuestions = session.questions.filter(
        (item) => item.answer && item.answer.trim() !== ""
      );

      const interviewHistory = answeredQuestions.map((item) => ({
        question: item.question,
        answer: item.answer,
        score: item.score,
        feedback: item.feedback,
        followUp: item.followUp,
        followUpAnswer: item.followUpAnswer || "",
      }));

      // If no questions were answered, return a base report
      let report = { overallScore: 0, strengths: [], improvements: [], questionBreakdown: [] };
      if (interviewHistory.length > 0) {
        report = await reportService.generateReport({
          jobTitle: session.jobTitle,
          interviewType: session.type,
          interviewHistory,
        });
      }

      // Create new Mongoose document to write to MongoDB
      const dbSession = new InterviewSession({
        _id: session._id,
        user: session.user,
        resume: session.resume,
        jobTitle: session.jobTitle,
        type: session.type,
        status: "completed",
        questions: session.questions,
        overallScore: report.overallScore,
        strengths: report.strengths,
        improvements: report.improvements,
        startedAt: session.startedAt,
        completedAt: new Date(),
      });

      await dbSession.save(); // Saved to MongoDB!

      // Delete from Redis
      await cache.del(`interview:session:${session._id}`);

      return {
        overallScore: report.overallScore,
        strengths: report.strengths,
        improvements: report.improvements,
        questionBreakdown: report.questionBreakdown,
      };
    } catch (error) {
      console.error("Complete Interview Error:", error);
      throw error;
    }
  }
  /**
   * Get all interview sessions of a user
   */
  async getInterviewHistory(userId) {
    try {
      return await InterviewSession.find({
        user: userId,
      })
        .sort({ createdAt: -1 })
        .select(
          "jobTitle type status overallScore createdAt completedAt"
        );
    } catch (error) {
      console.error("Get Interview History Error:", error);
      throw error;
    }
  }

  /**
   * Submit the interview early
   */
  async earlySubmit(sessionId, userId) {
    try {
      const session = await this.getSession(sessionId, userId);
      if (session.status === "completed") {
        throw new Error("Interview session has already been completed.");
      }
      
      const report = await this.completeInterview(session);
      return { completed: true, report };
    } catch (error) {
      console.error("Early Submit Error:", error);
      throw error;
    }
  }

  /**
   * Delete interview session
   */
  async deleteInterviewSession(sessionId, userId) {
    try {
      const session = await InterviewSession.findOne({
        _id: sessionId,
        user: userId,
      });

      if (!session) {
        throw new Error("Interview session not found.");
      }

      await InterviewSession.deleteOne({
        _id: sessionId,
      });

      return true;
    } catch (error) {
      console.error("Delete Interview Session Error:", error);
      throw error;
    }
  }
}

export default new InterviewService();