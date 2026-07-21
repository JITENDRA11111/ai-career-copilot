// services/interview/questionService.js

import ai from "../../config/gemini.js";
import { buildQuestionPrompt } from "../../utils/interviewPrompt.js";

class QuestionService {
  async generateQuestions({ resumeData, jobTitle, interviewType }) {
    try {
      const prompt = buildQuestionPrompt({
        resumeData,
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

      // Remove markdown if Gemini wraps JSON
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const questions = JSON.parse(text);

      if (!Array.isArray(questions) || questions.length !== 5) {
        throw new Error("Gemini did not return exactly 5 questions.");
      }

      return questions.map((item, index) => ({
        index,
        question: item.question?.trim() || "",
      }));
    } catch (error) {
      console.error("Question Generation Error:", error);

      // Fallback questions
      return [
        {
          index: 0,
          question: "Tell me about yourself.",
        },
        {
          index: 1,
          question: `Why do you want to become a ${jobTitle}?`,
        },
        {
          index: 2,
          question:
            "Describe one challenging project you worked on and how you solved the problem.",
        },
        {
          index: 3,
          question:
            "What are your biggest strengths and how do they help in this role?",
        },
        {
          index: 4,
          question:
            "Do you have any questions for the interviewer?",
        },
      ];
    }
  }
}

export default new QuestionService();