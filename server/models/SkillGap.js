import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "Course",
        "Documentation",
        "YouTube",
        "Article",
        "Book",
        "Practice",
        "Certification",
        "Other",
      ],
      default: "Course",
    },
  },
  {
    _id: false,
  }
);

const learningPlanSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: [
        "High",
        "Medium",
        "Low",
      ],
      default: "Medium",
    },

    estimatedWeeks: {
      type: Number,
      default: 2,
      min: 1,
    },

    resources: [resourceSchema],
  },
  {
    _id: false,
  }
);

const skillGapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    currentSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    missingSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    partialSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    learningPlan: [
      learningPlanSchema,
    ],

    overallMatch: {
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

/**
 * Faster history lookup
 */
skillGapSchema.index({
  userId: 1,
  createdAt: -1,
});

/**
 * Prevent duplicate analyses
 */
skillGapSchema.index({
  userId: 1,
  resumeId: 1,
  targetRole: 1,
});

export default mongoose.model(
  "SkillGap",
  skillGapSchema
);