import axios from "axios";
import pdf from "pdf-parse-new";
import mammoth from "mammoth";
import ai from "../config/gemini.js";
import { validateResume } from "../utils/resumeValidator.js";

/* ------------------------------------------------------- */
/* Download Resume From Cloudinary */
/* ------------------------------------------------------- */

const downloadResume = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
};

/* ------------------------------------------------------- */
/* Extract PDF */
/* ------------------------------------------------------- */

const extractPdfText = async (buffer) => {
  const data = await pdf(buffer);

  return data.text;
};

/* ------------------------------------------------------- */
/* Extract DOCX */
/* ------------------------------------------------------- */

const extractDocxText = async (buffer) => {
  const { value } = await mammoth.extractRawText({
    buffer,
  });

  return value;
};

/* ------------------------------------------------------- */
/* Detect File Type */
/* ------------------------------------------------------- */

const extractResumeText = async (fileUrl, fileName) => {
  const buffer = await downloadResume(fileUrl);

  const extension = fileName.split(".").pop().toLowerCase();

  switch (extension) {
    case "pdf":
      return await extractPdfText(buffer);

    case "docx":
      return await extractDocxText(buffer);

    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
};

/* ------------------------------------------------------- */
/* Approx Token Limiter */
/* 1 token ≈ 4 chars */
/* 6000 tokens ≈ 24000 chars */
/* ------------------------------------------------------- */

const truncateText = (text) => {
  const MAX_CHARS = 24000;

  if (!text) return "";

  if (text.length <= MAX_CHARS) return text;

  return text.substring(0, MAX_CHARS);
};

/* ------------------------------------------------------- */
/* Gemini Prompt */
/* ------------------------------------------------------- */

const buildPrompt = (resumeText) => `
You are an expert Applicant Tracking System (ATS) Resume Parser and HR Resume Analyst.

Your task is to analyze the resume and return ONLY a valid JSON object.

IMPORTANT INSTRUCTIONS:

- Return ONLY valid JSON.
- Do NOT wrap the response inside \`\`\`json or markdown.
- Do NOT include explanations, notes, comments or extra text.
- The response MUST be valid JSON that can be parsed using JSON.parse().
- Every key shown below MUST exist.
- Never omit any key.
- If information is unavailable, use:
  - "" for strings
  - [] for arrays
  - {} only where specified
- Never return null.
- Do not invent information.
- Infer a professional summary only if it is not explicitly present.
- Normalize dates into readable formats (e.g. "Jan 2025 - Present").
- Remove duplicate skills.
- Keep project descriptions concise (1–3 sentences).
- Preserve important bullet points.
- Extract hyperlinks whenever available.
- If GitHub or LinkedIn contains only a username, convert it into a complete URL whenever possible.
- ATS score must be an integer between 0 and 100.

----------------------------
CLASSIFICATION RULES
----------------------------

Projects:
- Personal projects
- Academic projects
- Freelance projects
- Hackathon projects

Examples:
- Green Cart
- Chat Waves
- AI Career Copilot

These MUST appear under "projects".

Experience:
Only include:
- Full-time jobs
- Part-time jobs
- Internships
- Research positions
- Teaching assistant roles
- Organizational positions
- Leadership positions

Do NOT classify personal software projects as experience.

----------------------------
ATS ANALYSIS
----------------------------

Evaluate the resume as an ATS would.

ATS Score should consider:

- Resume structure
- Skills
- Keywords
- Technical depth
- Projects
- Experience
- Education
- Readability
- Action verbs

Return:

- strengths
- weaknesses
- missingSkills
- recommendedRoles
- keywords

If weaknesses or missing skills exist, provide meaningful suggestions.

----------------------------
OUTPUT SCHEMA
----------------------------

{
  "name": "",
  "email": "",
  "phone": "",

  "summary": "",

  "skills": [],

  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "highlights": []
    }
  ],

  "experience": [
    {
      "title": "",
      "company": "",
      "duration": "",
      "bullets": []
    }
  ],

  "education": [
    {
      "degree": "",
      "school": "",
      "year": ""
    }
  ],

  "certifications": [],

  "languages": [],

  "links": {
    "github": "",
    "linkedin": "",
    "portfolio": ""
  },

  "ats": {
    "score": 0,

    "strengths": [],

    "weaknesses": [],

    "missingSkills": [],

    "recommendedRoles": [],

    "keywords": []
  }
}

----------------------------
FIELD GUIDELINES
----------------------------

summary:
Write a professional 2-3 sentence summary if one is not explicitly present.

skills:
Return unique technical and soft skills.

projects:
Each project should contain:
- name
- description
- technologies
- highlights

highlights should contain important achievements or major implemented features.

experience:
Include only actual work, internships, leadership or organizational positions.

education:
Include degree, institution and graduation year (or expected year).

links:
Return complete URLs whenever possible.

certifications:
Return certification names only.

languages:
Return spoken/programming languages only if explicitly mentioned.

ATS:
score:
Integer from 0 to 100.

strengths:
List the strongest aspects of the resume.

weaknesses:
Mention areas needing improvement.

missingSkills:
Mention important industry skills missing for modern Software Engineer or Full Stack Developer roles.

recommendedRoles:
Examples:
- Software Engineer
- Full Stack Developer
- Backend Developer
- Frontend Developer
- MERN Developer

keywords:
Return important ATS keywords extracted from the resume.

----------------------------
RESUME
----------------------------

${resumeText}
`;
/* ------------------------------------------------------- */
/* Gemini Parsing */
/* ------------------------------------------------------- */

const parseWithGemini = async (resumeText) => {
  const prompt = buildPrompt(resumeText);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  let text = response.text.trim();

  // Remove markdown if Gemini adds it
  text = text.replace(/```json/g, "");
  text = text.replace(/```/g, "");

  const first = text.indexOf("{");
    const last = text.lastIndexOf("}");

    if (first !== -1 && last !== -1) {
    text = text.substring(first, last + 1);
    }

    return JSON.parse(text);
};

/* ------------------------------------------------------- */
/* Public Function */
/* ------------------------------------------------------- */

export const parseResume = async (fileUrl, fileName) => {
  try {
    let text = await extractResumeText(fileUrl, fileName);

    text = truncateText(text);

    let parsed;

    try {
    parsed = await parseWithGemini(text);
    } catch (err) {

    console.log("Retrying Gemini...");

    parsed = await parseWithGemini(text);

    }

    const validated = validateResume(parsed);

    return validated;
  } catch (err) {
    console.error("Resume Parsing Error:", err);

    throw new Error("Unable to parse resume");
  }
};