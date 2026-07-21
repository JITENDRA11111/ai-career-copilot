import mongoose from "mongoose";

const atsScoreSchema = new mongoose.Schema(
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

    jobDescription: {
      type: String,
      required: true,
    },

    score: {
      overall: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      sections: {
        skills: {
          type: Number,
          default: 0,
        },

        experience: {
          type: Number,
          default: 0,
        },

        keywords: {
          type: Number,
          default: 0,
        },

        format: {
          type: Number,
          default: 0,
        },
      },

      matchedKeywords: [
        {
          type: String,
        },
      ],

      missingKeywords: [
        {
          type: String,
        },
      ],

      suggestions: [
        {
          type: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ATSScore",
  atsScoreSchema
);