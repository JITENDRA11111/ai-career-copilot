// sockets/interviewSocket.js

import interviewService from "../services/interview/interviewService.js";
import socketAuthMiddleware from "../middleware/socketAuthMiddleware.js";

export default function interviewSocket(io) {
  const interviewNamespace = io.of("/interview");

  // Apply authentication middleware to the namespace
  interviewNamespace.use(socketAuthMiddleware);

  interviewNamespace.on("connection", (socket) => {
    console.log("Socket user:", socket.user);
    console.log(`Interview Socket Connected: ${socket.id}`);

    /**
     * Join Interview Session
     */
    socket.on("join_session", ({ sessionId }) => {
      if (!sessionId) {
        socket.emit("error", {
          success: false,
          message: "Session ID is required.",
        });
        return;
      }

      socket.join(sessionId);

      console.log(
        `Socket ${socket.id} joined interview session ${sessionId}`
      );
    });

    /**
     * Submit Answer
     *
     * Payload:
     * {
     *    sessionId,
     *    questionIndex,
     *    answer
     * }
     */
    socket.on("answer", async (data) => {
      try {
        const { sessionId, questionIndex, answer } = data;

        if (
          !sessionId ||
          questionIndex === undefined ||
          !answer?.trim()
        ) {
          return socket.emit("error", {
            success: false,
            message: "Invalid answer payload.",
          });
        }

        // User comes from authenticated socket
        const userId = socket.user.id;

        const result = await interviewService.submitAnswer(
          sessionId,
          userId,
          {
            questionIndex,
            answer,
          }
        );

        // Send AI feedback
        socket.emit("feedback", {
          score: result.feedback?.score,
          feedback: result.feedback?.feedback,
          followUp: result.feedback?.followUp,
        });

        // Interview completed
        if (result.completed) {
          socket.emit("session_complete", {
            overallScore: result.report.overallScore,
            report: {
              overallScore: result.report.overallScore,
              strengths: result.report.strengths,
              improvements: result.report.improvements,
              questionBreakdown: result.report.questionBreakdown,
            },
          });

          return;
        }

        // Send next question
        socket.emit("next_question", {
          question: result.nextQuestion.question,
          index: result.nextQuestion.index,
          total: result.nextQuestion.total,
        });
      } catch (error) {
        console.error("Interview Socket Error:", error);

        socket.emit("error", {
          success: false,
          message: error.message || "Failed to process answer.",
        });
      }
    });

    /**
     * Early Submit Session
     */
    socket.on("early_submit", async ({ sessionId }) => {
      try {
        if (!sessionId) {
          return socket.emit("error", {
            success: false,
            message: "Session ID is required for early submit.",
          });
        }
        
        const userId = socket.user.id;
        const result = await interviewService.earlySubmit(sessionId, userId);
        
        if (result.completed) {
          socket.emit("session_complete", {
            overallScore: result.report.overallScore,
            report: {
              overallScore: result.report.overallScore,
              strengths: result.report.strengths,
              improvements: result.report.improvements,
              questionBreakdown: result.report.questionBreakdown,
            },
          });
        }
      } catch (error) {
        console.error("Early Submit Socket Error:", error);
        socket.emit("error", {
          success: false,
          message: error.message || "Failed to submit early.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(
        `Interview Socket Disconnected: ${socket.id}`
      );
    });
  });
}