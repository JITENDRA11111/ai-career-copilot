import CodingTest from "../../models/CodingTest.js";

/* -------------------------------------------------------------------------- */
/* Save New Coding Test */
/* -------------------------------------------------------------------------- */

export async function saveCodingTest({
  userId,
  skill,
  difficulty,
  language,

  title,
  description,

  examples,

  starterCode,

  functionSignature,

  testCases,

  hints,
}) {
  const codingTest = await CodingTest.create({
    userId,
    skill,
    difficulty,
    language,
    title,
    description,
    examples,
    starterCode,
    functionSignature,
    testCases,
    hints,
  });

  return codingTest;
}

/* -------------------------------------------------------------------------- */
/* Get Coding Test By ID */
/* -------------------------------------------------------------------------- */

export async function getCodingTestById(testId) {
  const codingTest = await CodingTest.findById(testId);

  if (!codingTest) {
    throw new Error("Coding test not found.");
  }

  return codingTest;
}

/* -------------------------------------------------------------------------- */
/* Save Submission */
/* -------------------------------------------------------------------------- */

export async function saveSubmission({
  testId,
  language,
  code,
  passed,
  total,
  score,
  executionTime,
  memory,
  results,
  feedback,
}) {
  const codingTest = await getCodingTestById(testId);

  codingTest.submissions.push({
    language,
    code,
    passed,
    total,
    score,
    executionTime,
    memory,
    results,
    feedback,
  });

  if (score > codingTest.bestScore) {
    codingTest.bestScore = score;
  }

  await codingTest.save();

  return codingTest;
}

/* -------------------------------------------------------------------------- */
/* Get User Coding History */
/* -------------------------------------------------------------------------- */

export async function getUserCodingHistory(userId) {
  return await CodingTest.find({
    userId,
  })
    .select(
      "title skill difficulty bestScore createdAt"
    )
    .sort({
      createdAt: -1,
    });
}

/* -------------------------------------------------------------------------- */
/* Get Submission History */
/* -------------------------------------------------------------------------- */

export async function getSubmissionHistory(
  testId,
  userId
) {
  const codingTest = await CodingTest.findOne({
    _id: testId,
    userId,
  }).select("title submissions");

  if (!codingTest) {
    throw new Error("Coding test not found.");
  }

  return codingTest.submissions.sort(
    (a, b) =>
      new Date(b.submittedAt) -
      new Date(a.submittedAt)
  );
}

/* -------------------------------------------------------------------------- */
/* Get Best Submission */
/* -------------------------------------------------------------------------- */

export async function getBestSubmission(
  testId,
  userId
) {
  const codingTest = await CodingTest.findOne({
    _id: testId,
    userId,
  });

  if (!codingTest) {
    throw new Error("Coding test not found.");
  }

  if (codingTest.submissions.length === 0) {
    return null;
  }

  return codingTest.submissions.reduce(
    (best, current) =>
      current.score > best.score
        ? current
        : best
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Coding Test */
/* -------------------------------------------------------------------------- */

export async function deleteCodingTest(
  testId,
  userId
) {
  const deleted =
    await CodingTest.findOneAndDelete({
      _id: testId,
      userId,
    });

  if (!deleted) {
    throw new Error("Coding test not found.");
  }

  return deleted;
}

/* -------------------------------------------------------------------------- */
/* Dashboard Statistics */
/* -------------------------------------------------------------------------- */

export async function getCodingStatistics(
  userId
) {
  const tests =
    await CodingTest.find({
      userId,
    });

  let totalTests = tests.length;

  let totalSubmissions = 0;

  let highestScore = 0;

  let averageScore = 0;

  let solved = 0;

  for (const test of tests) {
    if (test.bestScore > 0) {
      solved++;
    }

    highestScore = Math.max(
      highestScore,
      test.bestScore
    );

    for (const submission of test.submissions) {
      totalSubmissions++;

      averageScore += submission.score;
    }
  }

  averageScore =
    totalSubmissions === 0
      ? 0
      : Math.round(
          averageScore /
            totalSubmissions
        );

  return {
    totalTests,
    solved,
    totalSubmissions,
    highestScore,
    averageScore,
  };
}

/* -------------------------------------------------------------------------- */
/* Recent Coding Tests */
/* -------------------------------------------------------------------------- */

export async function getRecentCodingTests(
  userId,
  limit = 10
) {
  return await CodingTest.find({
    userId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .select(
      "title difficulty skill bestScore createdAt"
    );
}