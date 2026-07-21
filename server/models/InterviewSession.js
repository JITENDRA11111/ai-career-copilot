import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      default: "",
      trim: true,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    feedback: {
      type: String,
      default: "",
    },

    followUp: {
      type: String,
      default: "",
    },

    followUpAnswer: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const InterviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["technical", "behavioral", "hr"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    questions: {
      type: [QuestionSchema],
      default: [],
    },

    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    pdfUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InterviewSession", InterviewSessionSchema);