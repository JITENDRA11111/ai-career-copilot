import {
  generateCodingQuestion,
} from "./coding/aiCodingService.js";

import {
  runTestCases,
} from "./coding/testRunner.js";

import {
  evaluateSubmission,
  generateSubmissionSummary,
  getRecommendation,
} from "./coding/evaluationService.js";

import {
  saveCodingTest,
  saveSubmission,
  getCodingTestById,
  getUserCodingHistory,
  getSubmissionHistory,
  getBestSubmission,
  deleteCodingTest,
  getCodingStatistics,
  getRecentCodingTests,
} from "./coding/codingHistoryService.js";

/* -------------------------------------------------------------------------- */
/* Get Coding Test */
/* -------------------------------------------------------------------------- */

export async function getCodingTest(testId) {
  return await getCodingTestById(testId);
}

/* -------------------------------------------------------------------------- */
/* Generate Coding Test */
/* -------------------------------------------------------------------------- */

export async function generateTest({
  userId,
  skill,
  difficulty,
  language,
}) {
  let finalSkill = skill;
  if (skill === "Advanced Topics") {
    const advancedTopics = [
      "Segment Tree",
      "Fenwick Tree",
      "Disjoint Set Union (Union Find)",
      "Topological Sort",
      "Graph Coloring",
      "A* Search",
      "Minimum Spanning Tree (Kruskal/Prim)",
      "Tree DP & Rerooting DP",
      "Binary Lifting + LCA",
      "Advanced Segment Trees (Lazy, Persistent)",
      "Digit DP",
      "Bitmask & State Compression DP",
      "DSU + Offline Queries",
      "Trie + XOR Problems",
      "Mo's Algorithm",
      "Heavy Light Decomposition",
      "SCC, Bridges, Articulation Points",
      "Max Flow & Bipartite Matching",
      "KMP, Z Algorithm, Rolling Hash",
      "Convex Hull Trick & Li Chao Tree",
      "FFT/NTT",
      "Suffix Array & Suffix Automaton"
    ];
    finalSkill = advancedTopics[Math.floor(Math.random() * advancedTopics.length)];
  }

  // Generate question using Gemini
  const question = await generateCodingQuestion(
    finalSkill,
    difficulty,
    language
  );

  // Save in MongoDB
  const codingTest = await saveCodingTest({
  userId,
  skill: finalSkill,
  difficulty,
  language,

  title: question.title,
  description: question.description,

  examples: question.examples,

  starterCode: question.starterCode,

  functionSignature:
    question.functionSignature,

  testCases: question.testCases,

  hints: question.hints,
});

  return codingTest;
}

/* -------------------------------------------------------------------------- */
/* Generate OA Tests (Easy, Medium, Hard) */
/* -------------------------------------------------------------------------- */

export async function generateOATests({ userId, language }) {
  // Fire off 3 requests in parallel to keep it fast
  const [easyTest, mediumTest, hardTest] = await Promise.all([
    generateTest({ userId, skill: "Random", difficulty: "easy", language }),
    generateTest({ userId, skill: "Random", difficulty: "medium", language }),
    generateTest({ userId, skill: "Random", difficulty: "hard", language })
  ]);
  return [easyTest, mediumTest, hardTest];
}

/* -------------------------------------------------------------------------- */
/* Submit Solution */
/* -------------------------------------------------------------------------- */

export async function submitSolution({
  testId,
  language,
  code,
}) {
  // Load coding test
  const codingTest =
    await getCodingTestById(testId);

     console.log("codingTest:", codingTest);
console.log("functionSignature:", codingTest.functionSignature);
console.log("testCases:", codingTest.testCases);
console.log("Is Array:", Array.isArray(codingTest.testCases));

  // Execute all test cases
  const execution =
    await runTestCases(
      code,
      language,
      codingTest.functionSignature,
      codingTest.testCases
    );
   

  // AI evaluation
  const evaluation =
    await evaluateSubmission({
      question: codingTest,
      code,
      language,
      executionScore:
        execution.score,
    });

  // Save submission
  await saveSubmission({
    testId,

    language,

    code,

    passed:
      execution.passed,

    total:
      execution.total,

    score:
      evaluation.score,

    executionTime:
      execution.executionTime,

    memory:
      execution.memory,

    results:
      execution.results,

    feedback:
      evaluation.feedback,
  });

  // Summary
  const summary =
    generateSubmissionSummary({
      passed:
        execution.passed,

      total:
        execution.total,

      score:
        evaluation.score,
    });

  return {
    ...summary,

    executionTime:
      execution.executionTime,

    memory:
      execution.memory,

    results:
      execution.results,

    feedback:
      evaluation.feedback,

    recommendation:
      getRecommendation(
        evaluation.score
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Evaluate Existing Submission */
/* -------------------------------------------------------------------------- */

export async function evaluateSolution({
  testId,
  code,
  language,
}) {
  const codingTest =
    await getCodingTestById(testId);

  const feedback =
    await evaluateSubmission({
      question:
        codingTest,

      code,

      language,

      executionScore: 100,
    });

  return feedback;
}

/* -------------------------------------------------------------------------- */
/* History */
/* -------------------------------------------------------------------------- */

export async function history(
  userId
) {
  return await getUserCodingHistory(
    userId
  );
}

/* -------------------------------------------------------------------------- */
/* Submission History */
/* -------------------------------------------------------------------------- */

export async function submissionHistory(
  testId,
  userId
) {
  return await getSubmissionHistory(
    testId,
    userId
  );
}

/* -------------------------------------------------------------------------- */
/* Best Submission */
/* -------------------------------------------------------------------------- */

export async function bestSubmission(
  testId,
  userId
) {
  return await getBestSubmission(
    testId,
    userId
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics */
/* -------------------------------------------------------------------------- */

export async function statistics(
  userId
) {
  return await getCodingStatistics(
    userId
  );
}

/* -------------------------------------------------------------------------- */
/* Recent Tests */
/* -------------------------------------------------------------------------- */

export async function recentTests(
  userId
) {
  return await getRecentCodingTests(
    userId
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Coding Test */
/* -------------------------------------------------------------------------- */

export async function removeCodingTest(
  testId,
  userId
) {
  return await deleteCodingTest(
    testId,
    userId
  );
}