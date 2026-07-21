import {
  buildCppWrapper,
  buildJavaScriptWrapper,
  buildPythonWrapper,
} from "./wrapperService.js";

import {
  executeWrappedCode,
  outputsMatch,
  formatExecutionResult,
} from "./onlineCompilerService.js";

/* -------------------------------------------------------------------------- */
/* Build Wrapper */
/* -------------------------------------------------------------------------- */

function buildWrapper(
  language,
  sourceCode,
  functionSignature,
  testCase
) {
  switch (language) {
    case "cpp":
        console.log("Language:", language);
console.log("Function Signature:", functionSignature);
console.log("Test Case:", testCase);
      return buildCppWrapper(
        sourceCode,
        functionSignature,
        testCase
      );

    case "javascript":
      return buildJavaScriptWrapper(
        sourceCode,
        functionSignature,
        testCase
      );

    case "python":
      return buildPythonWrapper(
        sourceCode,
        functionSignature,
        testCase
      );

    default:
      throw new Error(
        "Unsupported language."
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Execute Single Test Case */
/* -------------------------------------------------------------------------- */

export async function executeTestCase(
  language,
  sourceCode,
  functionSignature,
  testCase
) {
  const wrappedCode = buildWrapper(
    language,
    sourceCode,
    functionSignature,
    testCase
  );

  const execution =
    await executeWrappedCode(
      wrappedCode,
      language
    );

  const result =
    formatExecutionResult(
      execution
    );

  const expected = typeof testCase.expectedOutput === "object"
    ? JSON.stringify(testCase.expectedOutput)
    : String(testCase.expectedOutput);

  const actual =
    result.stdout;

  let status =
    result.status;

  if (
    status === "Passed"
  ) {
    status = outputsMatch(
      actual,
      expected
    )
      ? "Passed"
      : "Failed";
  }

  return {
    input: testCase.input,

    expected,

    actual,

    status,

    isHidden:
      testCase.isHidden,

    executionTime:
      result.executionTime,

    memory:
      result.memory,

    exitCode:
      result.exitCode,

    stderr:
      result.stderr,
  };
}

/* -------------------------------------------------------------------------- */
/* Run Test Cases */
/* -------------------------------------------------------------------------- */

export async function runTestCases(
  sourceCode,
  language,
  functionSignature,
  testCases = []
) {
  const results = [];

  let passed = 0;

  let totalExecutionTime = 0;

  let maxMemory = 0;

  for (const testCase of testCases) {
    const result =
      await executeTestCase(
        language,
        sourceCode,
        functionSignature,
        testCase
      );

    if (
      result.status ===
      "Passed"
    ) {
      passed++;
    }

    totalExecutionTime +=
      Number(
        result.executionTime ||
          0
      );

    maxMemory = Math.max(
      maxMemory,
      Number(
        result.memory || 0
      )
    );

    results.push(result);
  }

  const total =
    testCases.length;

  const score =
    total === 0
      ? 0
      : Math.round(
          (passed / total) *
            100
        );

  return {
    passed,

    total,

    score,

    executionTime:
      totalExecutionTime,

    memory:
      maxMemory,

    results,
  };
}

/* -------------------------------------------------------------------------- */
/* Visible Test Cases */
/* -------------------------------------------------------------------------- */

export async function runVisibleTestCases(
  sourceCode,
  language,
  functionSignature,
  testCases = []
) {
  const visible =
    testCases.filter(
      (test) =>
        !test.isHidden
    );

  return runTestCases(
    sourceCode,
    language,
    functionSignature,
    visible
  );
}

/* -------------------------------------------------------------------------- */
/* Hidden Test Cases */
/* -------------------------------------------------------------------------- */

export async function runHiddenTestCases(
  sourceCode,
  language,
  functionSignature,
  testCases = []
) {
  const hidden =
    testCases.filter(
      (test) =>
        test.isHidden
    );

  return runTestCases(
    sourceCode,
    language,
    functionSignature,
    hidden
  );
}