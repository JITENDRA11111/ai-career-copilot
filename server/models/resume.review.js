import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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

    review: {
      overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      summary: {
        type: String,
        default: "",
      },

      strengths: [
        {
          type: String,
        },
      ],

      weaknesses: [
        {
          type: String,
        },
      ],

      sectionFeedback: {
        summary: {
          score: Number,
          feedback: String,
          suggestion: String,
        },

        experience: {
          score: Number,
          feedback: String,
          suggestion: String,
        },

        skills: {
          score: Number,
          feedback: String,
          suggestion: String,
        },

        education: {
          score: Number,
          feedback: String,
          suggestion: String,
        },

        projects: {
          score: Number,
          feedback: String,
          suggestion: String,
        },
      },

      quickWins: [
        {
          type: String,
        },
      ],

      rewrittenSummary: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ResumeReview",
  reviewSchema
);