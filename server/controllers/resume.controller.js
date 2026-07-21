import multer from "multer";
import streamifier from "streamifier";

import { parseResume } from "../services/resumeParserService.js";
import Resume from "../models/resume.model.js";
import cloudinary from "../config/cloudinary.js";
import { generateResumeReview } from "../services/reviewService.js";
import { resumeParseQueue } from "../jobs/queues.js";
// Multer

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files allowed"));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

// Upload Controller

export const uploadResume = async (req, res) => {
    console.log("✅ Upload controller reached");
    console.log(req.file);
    console.log(req.user);
    try {
    if (!req.file)
      return res.status(400).json({
        message: "No file uploaded",
      });

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "AI-Career-Copilot/Resumes",
            resource_type: "raw",
            public_id: `${req.user.id}-${Date.now()}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadToCloudinary();

    const resume = await Resume.create({
      userId: req.user.id,
      publicId: result.public_id,
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      parsed: false,
    });

    // Enqueue the parsing job
    await resumeParseQueue.add({
      resumeId: resume._id,
      fileUrl: resume.fileUrl,
      fileName: resume.fileName,
      userEmail: req.user.email,
      userName: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully. Parsing in progress...",
      resume,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// List

export const getResumeList = async (req, res) => {
  try {
    const resumes = await Resume.find({
      userId: req.user.id,
    }).sort({
      uploadedAt: -1,
    });

    res.json({
      success: true,
      resumes,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume)
      return res.status(404).json({
        message: "Resume not found",
      });

    await cloudinary.uploader.destroy(resume.publicId, {
      resource_type: "raw",
    });

    await resume.deleteOne();

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};




export const parseResumeController = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await Resume.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Already Parsed
    // if (resume.parsed) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Resume already parsed",
    //     parsedData: resume.parsedData,
    //   });
    // }

    // Parse using Gemini
    const parsedData = await parseResume(
  resume.fileUrl,
  resume.fileName
);

    // Save Result
    resume.parsed = true;
    resume.parsedData = parsedData;

    await resume.save();

    return res.status(200).json({
      success: true,
      message: "Resume parsed successfully",
      parsedData,
    });

  } catch (err) {

    console.error("Resume Parse Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

