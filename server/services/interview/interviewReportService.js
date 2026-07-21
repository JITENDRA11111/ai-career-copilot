import mongoose from "mongoose";
import InterviewSession from "../../models/InterviewSession.js";
import User from "../../models/User.js";
import pdfService from "./pdfService.js";
import emailService from "./emailService.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

class InterviewReportService {
  // S3 upload helper
  async uploadToS3(pdfBuffer, sessionId) {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const bucketName = process.env.AWS_S3_BUCKET;
    const key = `reports/${sessionId}-report.pdf`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );

    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  // Cloudinary fallback helper
  async uploadToCloudinary(pdfBuffer, sessionId) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "AI-Career-Copilot/Reports",
          resource_type: "raw",
          public_id: `${sessionId}-report.pdf`,
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );

      streamifier.createReadStream(pdfBuffer).pipe(stream);
    });
  }

  async uploadReport(pdfBuffer, sessionId) {
    if (
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET
    ) {
      try {
        console.log("Uploading report to AWS S3...");
        return await this.uploadToS3(pdfBuffer, sessionId);
      } catch (err) {
        console.error("AWS S3 Upload failed, falling back to Cloudinary:", err.message);
      }
    }
    console.log("Uploading report to Cloudinary...");
    return await this.uploadToCloudinary(pdfBuffer, sessionId);
  }

  /**
   * Paginated Interview History
   */
  async getHistory(userId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    
    const [sessions, total] = await Promise.all([
      InterviewSession.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("jobTitle type status overallScore pdfUrl createdAt completedAt"),
      InterviewSession.countDocuments({ user: userId })
    ]);

    return {
      sessions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get full session report
   */
  async getReport(sessionId, userId) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new Error("Invalid Session ID.");
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      throw new Error("Interview session not found.");
    }

    return session;
  }

  /**
   * Get aggregate stats
   */
  async getStats(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Avg score per type
    const avgScorePerType = await InterviewSession.aggregate([
      { $match: { user: userObjectId, status: "completed" } },
      {
        $group: {
          _id: "$type",
          avgScore: { $avg: "$overallScore" },
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Improvement trend (sorted by completion date)
    const trend = await InterviewSession.find({ user: userId, status: "completed" })
      .sort({ completedAt: 1 })
      .select("jobTitle type overallScore completedAt");

    return {
      avgScorePerType: avgScorePerType.map(item => ({
        type: item._id,
        avgScore: Math.round(item.avgScore * 10) / 10,
        count: item.count
      })),
      trend
    };
  }

  /**
   * Generate PDF Report, upload to S3/Cloudinary, update model
   */
  async generateAndUploadPDFReport(sessionId, userId) {
    const session = await this.getReport(sessionId, userId);
    
    // Generate PDF Buffer
    const pdfBuffer = await pdfService.generateInterviewReportPDF(session);
    
    // Upload PDF
    const pdfUrl = await this.uploadReport(pdfBuffer, sessionId);
    
    // Save URL to session model
    session.pdfUrl = pdfUrl;
    await session.save();

    // Fetch user info for email
    const user = await User.findById(userId);
    if (user && user.email) {
      // Send email notification asynchronously
      emailService.sendReportEmail(user.email, user.name, session, pdfUrl);
    }

    return {
      pdfUrl,
      session
    };
  }
}

export default new InterviewReportService();
