import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/* Example Schema */
/* -------------------------------------------------------------------------- */

const exampleSchema = new mongoose.Schema(
  {
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    output: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

/* -------------------------------------------------------------------------- */
/* Test Case Schema */
/* -------------------------------------------------------------------------- */

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    expectedOutput: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

/* -------------------------------------------------------------------------- */
/* Starter Code Schema */
/* -------------------------------------------------------------------------- */

const starterCodeSchema = new mongoose.Schema(
  {
    cpp: {
      type: String,
      default: "",
    },

    javascript: {
      type: String,
      default: "",
    },

    python: {
      type: String,
      default: "",
    },

    java: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

/* -------------------------------------------------------------------------- */
/* AI Feedback Schema */
/* -------------------------------------------------------------------------- */

const feedbackSchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      default: "",
    },

    strengths: [
      {
        type: String,
      },
    ],

    improvements: [
      {
        type: String,
      },
    ],

    timeComplexity: {
      type: String,
      default: "",
    },

    spaceComplexity: {
      type: String,
      default: "",
    },

    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    _id: false,
  }
);

/* -------------------------------------------------------------------------- */
/* Submission Result Schema */
/* -------------------------------------------------------------------------- */

const resultSchema = new mongoose.Schema(
  {
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    expected: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    actual: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Passed",
        "Failed",
        "Compilation Error",
        "Runtime Error",
        "Time Limit Exceeded",
      ],
      default: "Failed",
    },
  },
  {
    _id: false,
  }
);

/* -------------------------------------------------------------------------- */
/* Submission Schema */
/* -------------------------------------------------------------------------- */

const submissionSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: [
        "cpp",
        "javascript",
        "python",
        "java",
      ],
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    passed: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    executionTime: {
      type: Number,
      default: 0,
    },

    memory: {
      type: Number,
      default: 0,
    },

    results: [resultSchema],

    feedback: feedbackSchema,

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/* -------------------------------------------------------------------------- */
/* Coding Test Schema */
/* -------------------------------------------------------------------------- */

const codingTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    skill: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    difficulty: {
      type: String,
      enum: [
        "easy",
        "medium",
        "hard",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    examples: [exampleSchema],

    starterCode: starterCodeSchema,

    functionSignature: {
  functionName: {
    type: String,
    required: true,
  },

  returnType: {
    type: String,
    required: true,
  },

  parameters: [
    {
      name: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        required: true,
      },
    },
  ],
},

    testCases: [testCaseSchema],

    hints: [
      {
        type: String,
      },
    ],

    submissions: [submissionSchema],

    bestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

/* -------------------------------------------------------------------------- */
/* Indexes */
/* -------------------------------------------------------------------------- */

codingTestSchema.index({
  userId: 1,
  createdAt: -1,
});

codingTestSchema.index({
  skill: 1,
  difficulty: 1,
});

codingTestSchema.index({
  bestScore: -1,
});

/* -------------------------------------------------------------------------- */
/* Export */
/* -------------------------------------------------------------------------- */

export default mongoose.model(
  "CodingTest",
  codingTestSchema
);