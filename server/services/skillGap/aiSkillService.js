import ai from "../../config/gemini.js";

/**
 * Ask Gemini for the skills required for a target role.
 *
 * @param {String} targetRole
 * @returns {Object}
 */
export async function getRequiredSkills(targetRole) {
  try {
    const prompt = `
You are a Senior Staff Frontend Engineer at Google.

A candidate wants to become a:

"${targetRole}"

Your task is to identify ONLY the core technical skills expected for this role at top product companies like Google, Microsoft, Amazon, Meta and Uber.

Return ONLY valid JSON.

{
  "requiredSkills": [
    "..."
  ]
}

Rules:

1. Return EXACTLY 12 skills.

2. Use ONLY short skill names.
   Good:
   - JavaScript
   - TypeScript
   - React
   - Next.js
   - Redux
   - HTML
   - CSS
   - Git
   - REST API
   - Jest
   - Webpack
   - Docker

   Bad:
   - Browser APIs & Web Standards
   - State Management Libraries (Redux, Zustand)
   - HTML5 & Semantic Markup
   - CSS3 and Responsive Design
   - Version Control Systems (Git)

3. Prefer React ecosystem unless the role explicitly mentions Angular or Vue.

4. Prioritize these categories:
   • Programming Language
   • Framework
   • Library
   • Styling
   • API
   • Database (if required)
   • Build Tool
   • Testing
   • Version Control

5. Do NOT include:
   • CI/CD
   • Cloud
   • Kubernetes
   • GCP
   • AWS
   • Accessibility
   • Security
   • Web Performance
   • System Design
   • Soft Skills

6. If the role is Frontend, prefer:
   JavaScript
   TypeScript
   React
   Next.js
   Redux
   HTML
   CSS
   Tailwind CSS
   REST API
   Git
   Jest
   Webpack

7. If the role is Backend, prefer:
   Node.js
   Express.js
   MongoDB
   SQL
   REST API
   Docker
   Git
   JWT
   Redis
   Microservices

8. If the role is Full Stack, combine both.

9. Return ONLY JSON.

10. Do NOT wrap the JSON in markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);

    return parsed;

  } catch (error) {

    console.error(
      "Gemini Required Skills Error:",
      error
    );

    throw error;
  }
}

/**
 * Generate AI Learning Plan
 *
 * @param {String} targetRole
 * @param {Array} missingSkills
 *
 * @returns {Array}
 */
export async function generateLearningPlan(
  targetRole,
  missingSkills
) {
  try {

    const prompt = `
You are a Senior Engineering Manager.

Candidate target role:

${targetRole}

Missing Skills:

${missingSkills.join(", ")}

Create a learning roadmap.

Return ONLY valid JSON.

{
  "learningPlan":[
    {
      "skill":"TypeScript",
      "priority":"High",
      "estimatedWeeks":2,
      "resources":[
        {
          "name":"...",
          "url":"...",
          "type":"Course"
        }
      ]
    }
  ]
}

Rules:

1. Priority = High, Medium or Low.
2. Estimated weeks should be realistic.
3. Provide 3 learning resources.
4. Mix Documentation + YouTube + Course.
5. Only JSON.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

    let text = response.text;

    if (!text) {
      throw new Error(
        "Gemini returned empty learning plan."
      );
    }

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed =
      JSON.parse(text);

    return parsed.learningPlan || [];

  } catch (error) {

    console.error(
      "Gemini Learning Plan Error:",
      error
    );

    throw error;
  }
}