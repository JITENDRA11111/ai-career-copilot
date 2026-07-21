import ai from "../config/gemini.js";
import Resume from "../models/resume.model.js";

function formatResume(parsedData) {
  let resume = "";

  resume += `Name: ${parsedData.name || ""}\n`;
  resume += `Email: ${parsedData.email || ""}\n`;
  resume += `Phone: ${parsedData.phone || ""}\n\n`;

  resume += `Summary:\n${parsedData.summary || ""}\n\n`;

  resume += `Skills:\n${(parsedData.skills || []).join(", ")}\n\n`;

  resume += `Experience:\n`;

  (parsedData.experience || []).forEach((exp, index) => {
    resume += `${index + 1}. ${exp.title || ""}\n`;
    resume += `Company: ${exp.company || ""}\n`;
    resume += `Duration: ${exp.duration || ""}\n`;

    (exp.bullets || []).forEach((bullet) => {
      resume += `• ${bullet}\n`;
    });

    resume += "\n";
  });

  resume += `Education:\n`;

  (parsedData.education || []).forEach((edu) => {
    resume += `${edu.degree || ""}\n`;
    resume += `${edu.school || ""}\n`;
    resume += `${edu.year || ""}\n\n`;
  });

  if (parsedData.certifications?.length) {
    resume += `Certifications:\n${parsedData.certifications.join(", ")}\n\n`;
  }

  if (parsedData.languages?.length) {
    resume += `Languages:\n${parsedData.languages.join(", ")}\n\n`;
  }

  return resume;
}

export async function generateCoverLetter({
  resumeId,
  jobTitle,
  company,
  jobDescription,
  tone,
}) {
  const resume = await Resume.findById(resumeId);

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (!resume.parsedData) {
    throw new Error("Resume has not been parsed yet.");
  }

  const resumeText = formatResume(resume.parsedData);

  const prompt = `
You are an expert career coach and recruiter.

Using ONLY the information from the resume below, write a personalized cover letter.

Resume:
${resumeText}

Job Title:
${jobTitle}

Company:
${company}

Job Description:
${jobDescription}

Tone:
${tone}

Instructions:

- Write exactly THREE paragraphs.
- First paragraph: introduce the candidate and express interest.
- Second paragraph: explain why the candidate is a strong fit using resume experience.
- Third paragraph: conclude confidently with enthusiasm.
- Do NOT invent achievements.
- Keep the length between 300 and 450 words.
- Return ONLY the cover letter.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text.trim();

  const html = text
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return {
    text,
    html,
  };
}

export async function regenerateCoverLetter({
  previousContent,
  feedback,
}) {
  const prompt = `
You are an expert recruiter.

Rewrite the following cover letter.

Current Cover Letter:

${previousContent}

User Feedback:

${feedback}

Requirements:

- Keep it professional.
- Apply every user suggestion.
- Improve wording.
- Keep exactly THREE paragraphs.
- Return ONLY the cover letter.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text.trim();

  const html = text
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return {
    text,
    html,
  };
}