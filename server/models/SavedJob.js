import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      default: "",
    },

    employerLogo: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    employmentType: {
      type: String,
      default: "",
    },

    salary: {
      type: String,
      default: "",
    },

    applyLink: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    matchScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

savedJobSchema.index(
  {
    userId: 1,
    jobId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("SavedJob", savedJobSchema);