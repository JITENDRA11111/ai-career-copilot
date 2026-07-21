// utils/interviewPrompt.js

export const buildQuestionPrompt = ({
  resumeData,
  jobTitle,
  interviewType,
}) => `
You are an experienced interviewer at a top tech company.

Candidate Resume:
${JSON.stringify(resumeData, null, 2)}

Target Job Role:
${jobTitle}

Interview Type:
${interviewType}

Instructions:

- Generate EXACTLY 5 interview questions.
- Questions should match the candidate's resume and target job role.
- Keep the difficulty suitable for SDE placement interviews.
- Do not ask duplicate questions.
- Do not include answers.
- Return ONLY valid JSON.

Format:

[
  {
    "question": "Question 1"
  },
  {
    "question": "Question 2"
  },
  {
    "question": "Question 3"
  },
  {
    "question": "Question 4"
  },
  {
    "question": "Question 5"
  }
]
`;

export const buildEvaluationPrompt = ({
  question,
  answer,
  jobTitle,
  interviewType,
}) => `
You are a senior interviewer.

Evaluate the candidate's answer.

Job Role:
${jobTitle}

Interview Type:
${interviewType}

Question:
${question}

Candidate Answer:
${answer}

Evaluate based on:

- Technical correctness
- Communication
- Completeness
- Confidence
- Clarity

Return ONLY valid JSON.

{
  "score": 0-100,
  "feedback": "Detailed constructive feedback",
  "followUp": "A follow-up question if the answer is weak, otherwise return an empty string"
}
`;

export const buildReportPrompt = ({
  jobTitle,
  interviewType,
  interviewHistory,
}) => `
You are a senior hiring manager.

Generate the final interview report.

Job Role:
${jobTitle}

Interview Type:
${interviewType}

Interview Data:

${JSON.stringify(interviewHistory, null, 2)}

Return ONLY valid JSON.

{
  "overallScore": 0,
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "improvements": [
    "Improvement 1",
    "Improvement 2"
  ],
  "questionBreakdown": [
    {
      "question": "",
      "score": 0,
      "feedback": ""
    }
  ]
}
`;

export const buildFollowUpEvaluationPrompt = ({
  question,
  answer,
  followUpQuestion,
  followUpAnswer,
  jobTitle,
  interviewType,
}) => `
You are a senior interviewer.

Evaluate the candidate's follow-up answer in the context of the original question and original answer.

Job Role:
${jobTitle}

Interview Type:
${interviewType}

Original Question:
${question}

Original Candidate Answer:
${answer}

Your Follow-Up Question:
${followUpQuestion}

Candidate's Follow-Up Answer:
${followUpAnswer}

Evaluate how the candidate addressed the follow-up. Combine this assessment with the original answer to determine a final, adjusted score and consolidated feedback for this question.

Return ONLY valid JSON.

{
  "score": 0-100,
  "feedback": "Consolidated constructive feedback covering both responses"
}
`;