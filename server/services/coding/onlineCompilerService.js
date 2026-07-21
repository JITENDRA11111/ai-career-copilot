import axios from "axios";

/* -------------------------------------------------------------------------- */
/* Configuration */
/* -------------------------------------------------------------------------- */

const ONLINE_COMPILER_URL =
  process.env.ONLINE_COMPILER_URL;

const ONLINE_COMPILER_API_KEY =
  process.env.ONLINE_COMPILER_API_KEY;

/* -------------------------------------------------------------------------- */
/* Supported Compilers */
/* -------------------------------------------------------------------------- */

export const COMPILERS = {
  cpp: "g++-15",

  python: "python-3.14",

  javascript: "typescript-deno",

  go: "go-1.26",

  rust: "rust-1.93",
};

/* -------------------------------------------------------------------------- */
/* Execute Code */
/* -------------------------------------------------------------------------- */

export async function executeCode(
  sourceCode,
  language,
  stdin = ""
) {
  try {
    const compiler =
      COMPILERS[language];

    if (!compiler) {
      throw new Error(
        "Unsupported language."
      );
    }

    const response =
      await axios.post(
        `${ONLINE_COMPILER_URL}/api/run-code-sync/`,
        {
          compiler,
          code: sourceCode,
          input: stdin,
        },
        {
          headers: {
            Authorization:
              ONLINE_COMPILER_API_KEY,

            "Content-Type":
              "application/json",
          },

          timeout: 35000,
        }
      );

    const result =
      response.data;

    return {
      stdout:
        (result.output || "").trim(),

      stderr:
        (result.error || "").trim(),

      status:
        result.status ||

        "success",

      exitCode:
        result.exit_code ?? 0,

      signal:
        result.signal,

      executionTime:
        Number(
          result.time || 0
        ),

      totalTime:
        Number(
          result.total || 0
        ),

      memory:
        Number(
          result.memory || 0
        ),
    };
  } catch (error) {
    console.error(
      "OnlineCompiler Error:",
      error.response?.data ||
        error.message
    );

    if (
      error.response?.status ===
      429
    ) {
      throw new Error(
        "Compiler is busy. Please try again."
      );
    }

    throw new Error(
      error.response?.data
        ?.message ||
        "Failed to execute code."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Execute Wrapped Code */
/* -------------------------------------------------------------------------- */

export async function executeWrappedCode(
  wrappedCode,
  language
) {
  return await executeCode(
    wrappedCode,
    language
  );
}

/* -------------------------------------------------------------------------- */
/* Normalize Output */
/* -------------------------------------------------------------------------- */

export function normalizeOutput(
  output
) {
  let str = String(output)
    .replace(/\r/g, "")
    .trim();
  str = str.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false");
  str = str.replace(/\[\s+/g, "[").replace(/\s+\]/g, "]").replace(/,\s+/g, ",");
  return str;
}

/* -------------------------------------------------------------------------- */
/* Compare Outputs */
/* -------------------------------------------------------------------------- */

export function outputsMatch(
  actual,
  expected
) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  if (normActual === normExpected) {
    return true;
  }

  try {
    const parsedActual = JSON.parse(normActual);
    const parsedExpected = JSON.parse(normExpected);

    if (Array.isArray(parsedActual) && Array.isArray(parsedExpected)) {
      const sortDeep = (arr) => {
        return arr
          .map((item) => (Array.isArray(item) ? sortDeep(item) : item))
          .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      };

      return (
        JSON.stringify(sortDeep(parsedActual)) ===
        JSON.stringify(sortDeep(parsedExpected))
      );
    }
  } catch (e) {
    // Fallback to false if parsing fails
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Compilation Error */
/* -------------------------------------------------------------------------- */

export function isCompilationError(
  result
) {
  if (
    result.exitCode === 0
  ) {
    return false;
  }

  const error =
    result.stderr.toLowerCase();

  return (
    error.includes("error:") ||
    error.includes("fatal") ||
    error.includes(
      "compilation"
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Runtime Error */
/* -------------------------------------------------------------------------- */

export function isRuntimeError(
  result
) {
  return (
    result.exitCode !== 0 &&
    !isCompilationError(
      result
    ) &&
    !isTimeout(result) &&
    !isMemoryLimit(result)
  );
}

/* -------------------------------------------------------------------------- */
/* Timeout */
/* -------------------------------------------------------------------------- */

export function isTimeout(
  result
) {
  return (
    result.exitCode === 124
  );
}

/* -------------------------------------------------------------------------- */
/* Memory Limit Exceeded */
/* -------------------------------------------------------------------------- */

export function isMemoryLimit(
  result
) {
  return (
    result.exitCode === 137
  );
}

/* -------------------------------------------------------------------------- */
/* Segmentation Fault */
/* -------------------------------------------------------------------------- */

export function isSegmentationFault(
  result
) {
  return (
    result.exitCode === 139
  );
}

/* -------------------------------------------------------------------------- */
/* Format Execution Result */
/* -------------------------------------------------------------------------- */

export function formatExecutionResult(
  result
) {
  let status = "Passed";

  if (
    isCompilationError(
      result
    )
  ) {
    status =
      "Compilation Error";
  } else if (
    isTimeout(result)
  ) {
    status = "Timeout";
  } else if (
    isMemoryLimit(result)
  ) {
    status =
      "Memory Limit Exceeded";
  } else if (
    isSegmentationFault(
      result
    )
  ) {
    status =
      "Segmentation Fault";
  } else if (
    isRuntimeError(
      result
    )
  ) {
    status =
      "Runtime Error";
  }

  return {
    ...result,
    status,
  };
}