// services/interview/evaluationService.js

import ai from "../../config/gemini.js";
import { buildEvaluationPrompt, buildFollowUpEvaluationPrompt } from "../../utils/interviewPrompt.js";

class EvaluationService {
  async evaluateAnswer({
    question,
    answer,
    jobTitle,
    interviewType,
  }) {
    try {
      const prompt = buildEvaluationPrompt({
        question,
        answer,
        jobTitle,
        interviewType,
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let text = response.text;

      // Remove markdown formatting if present
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const evaluation = JSON.parse(text);

      return {
        score: Math.max(
          0,
          Math.min(100, Number(evaluation.score) || 0)
        ),

        feedback:
          evaluation.feedback ||
          "No detailed feedback generated.",

        followUp:
          evaluation.followUp || "",
      };
    } catch (error) {
      console.error("Evaluation Error:", error);

      // Simple fallback scoring based on answer length
      const wordCount = answer
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      let score = 40;

      if (wordCount >= 30) score = 60;
      if (wordCount >= 60) score = 75;
      if (wordCount >= 100) score = 90;

      return {
        score,
        feedback:
          "The answer was evaluated using the fallback evaluator because the AI evaluation service was unavailable. Try providing more detailed explanations with examples.",

        followUp:
          score < 70
            ? "Can you elaborate on your answer with a real-world example?"
            : "",
      };
    }
  }

  async evaluateFollowUp({
    question,
    answer,
    followUpQuestion,
    followUpAnswer,
    jobTitle,
    interviewType,
  }) {
    try {
      const prompt = buildFollowUpEvaluationPrompt({
        question,
        answer,
        followUpQuestion,
        followUpAnswer,
        jobTitle,
        interviewType,
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let text = response.text;
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const evaluation = JSON.parse(text);

      return {
        score: Math.max(
          0,
          Math.min(100, Number(evaluation.score) || 0)
        ),

        feedback:
          evaluation.feedback ||
          "No detailed feedback generated.",
      };
    } catch (error) {
      console.error("Follow-Up Evaluation Error:", error);

      // Simple fallback
      const wordCount = followUpAnswer
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      let score = 50;
      if (wordCount >= 20) score = 70;
      if (wordCount >= 40) score = 85;

      return {
        score,
        feedback:
          "The follow-up answer was evaluated using the fallback evaluator because the AI evaluation service was unavailable.",
      };
    }
  }
}

export default new EvaluationService();