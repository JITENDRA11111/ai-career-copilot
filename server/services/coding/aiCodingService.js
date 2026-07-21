import ai from "../../config/gemini.js";

/* -------------------------------------------------------------------------- */
/* Generate Coding Question */
/* -------------------------------------------------------------------------- */

export async function generateCodingQuestion(
  skill,
  difficulty,
  language
) {
  try {
    const prompt = `
You are a Senior Software Engineer at Google.

Generate ONE coding interview question.

Target Skill:
${skill === "Random" ? "Pick a COMPLETELY RANDOM Data Structures and Algorithms topic (e.g., Arrays, Strings, Trees, Graphs, DP, Tries, Backtracking, etc.). Be creative and pick anything." : skill}

Difficulty:
${difficulty}

The problem should be language independent.

IMPORTANT: To ensure variety, here is a random seed: ${Math.random()}. 
Do NOT generate the same problem repeatedly. Avoid common problems like "Two Sum" or "Find Duplicates" unless specifically requested. Pick a unique, random scenario-based problem.

Supported Languages:
- C++
- JavaScript
- Python

Return ONLY valid JSON.

{
  "title":"",
  "description":"",

  "examples":[
    {
      "input":{},
      "output":{},
      "explanation":""
    }
  ],

  "starterCode":{
      "cpp":"",
      "javascript":"",
      "python":""
  },

  "functionSignature":{
      "functionName":"",
      "returnType":"",
      "parameters":[
          {
              "name":"",
              "type":""
          }
      ]
  },

  "testCases":[
      {
          "input":{},
          "expectedOutput":"",
          "isHidden":false
      }
  ],

  "hints":[]
}

Rules:

1. Generate an ORIGINAL coding interview problem.

2. Difficulty must strictly match:
   - easy
   - medium
   - hard

3. Description must be clear.

4. Include constraints.

5. Include exactly TWO examples.

6. Generate EXACTLY FIVE test cases.

7. First TWO test cases:
   isHidden = false

8. Last THREE:
   isHidden = true

9. Generate starter code for
   - C++
   - JavaScript
   - Python

10. The starter code MUST ONLY contain the function declaration with a placeholder comment (e.g. "// Your code here"). DO NOT include any default return statement. Do NOT write any solution or logic. CRITICAL: The starter code MUST be formatted across multiple lines with proper 4-space indentation. You MUST use '\\n' literal characters inside the JSON string to create these newlines. DO NOT compress it into a single line string.
FOR C++, JAVASCRIPT, AND PYTHON: DO NOT wrap the function inside any class.

10b. CRITICAL: The expectedOutput for all test cases MUST be 100% mathematically and logically correct. You MUST mentally trace the algorithm to verify every test case. Do not guess the output.

11. Hints should NOT reveal the solution.

12. Generate exactly THREE hints.

13. Return ONLY JSON.

14. No markdown.

15. No explanation.

16.
functionSignature is mandatory.

17.
CRITICAL: The returnType CANNOT BE 'void'. The function MUST return a value. If the problem asks to modify an array in-place, change the problem to RETURN the modified array instead.
CRITICAL: All parameter and return types MUST be standard primitives (int, string, bool, float) or their C++ vector equivalents.
CRITICAL FOR C++: You MUST use 'vector' (e.g., 'vector<int>', 'vector<string>') for any arrays. NEVER use C-style arrays (e.g., 'int[]', 'int arr[]') or pointers (e.g., 'int*') in the function signature. DO NOT use objects, dictionaries, pairs, or custom structs.

18.
Parameter names MUST exactly match starter code.

19.
Examples:

{
  "functionName":"twoSum",

  "returnType":"vector<int>",

  "parameters":[
      {
          "name":"nums",
          "type":"vector<int>"
      },
      {
          "name":"target",
          "type":"int"
      }
  ]
}
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
        "Gemini returned empty response."
      );
    }

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    console.log("========== GEMINI ==========");
console.log(text);
console.log("============================");
    return JSON.parse(text);

  } catch (error) {

    console.error(
      "Coding Question Generation Error:",
      error
    );

    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* AI Code Evaluation */
/* -------------------------------------------------------------------------- */

export async function evaluateCode(
  question,
  code,
  language
) {
  try {

    const prompt = `
You are a Staff Software Engineer at Google.

Review the following coding solution.

Question:

${question.title}

Description:

${question.description}

Programming Language:

${language}

Candidate Code:

${code}

Return ONLY valid JSON.

{
  "summary":"",
  "strengths":[
    ""
  ],
  "improvements":[
    ""
  ],
  "timeComplexity":"",
  "spaceComplexity":"",
  "overallScore":0
}

Rules:

1. Assume the code compiles.

2. Review:
   - readability
   - variable naming
   - modularity
   - correctness
   - optimization
   - edge cases

3. Estimate

   Time Complexity

4. Estimate

   Space Complexity

5. Give 3 strengths.

6. Give 3 improvements.

7. Score should be between 0 and 100.

8. Return JSON only.

9. No markdown.

10. No explanation.

Your response must start with {
and end with }.
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
        "Gemini returned empty response."
      );
    }

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

      const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    const json =
        text.slice(start,end+1);


    return JSON.parse(json);

  } catch (error) {

    console.error(
      "AI Evaluation Error:",
      error
    );

    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* Generate Solution (Optional for Admin/Testing)
 * -------------------------------------------------------------------------- */

export async function generateReferenceSolution(
  question
) {
  try {

    const prompt = `
You are a Google Staff Engineer.

Solve the following problem.

Title:

${question.title}

Description:

${question.description}

Return ONLY JSON.

{
  "cpp":"",
  "javascript":"",
  "python":"",
  "timeComplexity":"",
  "spaceComplexity":"",
  "approach":""
}

Rules:

1. Generate optimal solutions.

2. Generate solutions for

   - C++
   - JavaScript
   - Python

3. Return JSON only.

4. No markdown.

5. No explanation.
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
        "Gemini returned empty response."
      );
    }

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);

  } catch (error) {

    console.error(
      "Reference Solution Error:",
      error
    );

    throw error;
  }
}