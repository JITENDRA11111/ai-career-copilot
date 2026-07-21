const buildATSPrompt = (
  resume,
  jobDescription
) => `
You are an expert Applicant Tracking System (ATS)
used by top technology companies.

Your task is to compare the candidate's resume
against the provided Job Description.

Analyze both documents carefully.

Return ONLY valid JSON.

Do NOT use markdown.

Do NOT explain anything.

Do NOT include extra text.

--------------------------------------------------

Evaluate these categories:

1. Technical Skills

2. Experience

3. Keyword Match

4. Resume Format

--------------------------------------------------

Return this exact schema.

{
  "overall": 0,

  "sections": {
      "skills":0,
      "experience":0,
      "keywords":0,
      "format":0
  },

  "matchedKeywords":[],

  "missingKeywords":[],

  "suggestions":[]
}

--------------------------------------------------

SCORING RULES

overall

0-39
Poor Match

40-59
Average

60-74
Good

75-89
Very Good

90-100
Excellent

--------------------------------------------------

Skills

Compare:

Languages

Frameworks

Libraries

Databases

Cloud

DevOps

Tools

--------------------------------------------------

Experience

Check:

Relevant Projects

Internships

Professional Experience

Leadership

--------------------------------------------------

Keyword Match

Extract important keywords from Job Description.

Compare against Resume.

Return

matchedKeywords

missingKeywords

--------------------------------------------------

Format

Evaluate

Readability

Section Organization

Bullet Points

Action Verbs

Consistency

--------------------------------------------------

Suggestions

Return 5-10 actionable suggestions.

Examples

"Add Docker project"

"Include AWS"

"Mention REST APIs"

"Add quantified achievements"

--------------------------------------------------

Resume

${JSON.stringify(resume)}

--------------------------------------------------

Job Description

${jobDescription}
`;

export default buildATSPrompt;