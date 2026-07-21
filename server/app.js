import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import atsRoutes from "./routes/ats.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import coverLetterRoutes from "./routes/coverLetter.routes.js";
import jobRoutes from "./routes/job.routes.js";
import skillGapRoutes from "./routes/skillGap.routes.js";
import codingRoutes from "./routes/coding.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import interviewSocket from "./sockets/interviewSocket.js";
import socketAuthMiddleware from "./middleware/socketAuthMiddleware.js";
import adminRoutes from "./routes/admin.routes.js";
import { bullBoardRouter } from "./jobs/index.js";
import { logger } from "./config/logger.js";
import mongoose from "mongoose";
import { cache } from "./config/redis.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
});


io.use(socketAuthMiddleware);


app.set("trust proxy",1);
/* -------------------------------------------------------------------------- */
/* Security */
/* -------------------------------------------------------------------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows images to be loaded
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : "*",
    credentials: true,
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(globalLimiter);

/* -------------------------------------------------------------------------- */
/* Middleware */
/* -------------------------------------------------------------------------- */

app.use(compression());

app.use(cookieParser());

app.use(express.json({ limit: "20mb" }));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev", {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

/* -------------------------------------------------------------------------- */
/* Passport */
/* -------------------------------------------------------------------------- */

app.use(passport.initialize());


/* -------------------------------------------------------------------------- */
/* Health Check */
/* -------------------------------------------------------------------------- */

app.get("/api/health", async (req, res) => {
    let dbStatus = "unknown";
    try {
      dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    } catch (e) {
      dbStatus = "error";
    }

    let redisStatus = "unknown";
    try {
      await cache.set("health_check", "ok", 10);
      const val = await cache.get("health_check");
      redisStatus = val === "ok" ? "connected" : "error";
    } catch (e) {
      redisStatus = "error";
    }

    res.json({
        success: true,
        status: dbStatus === "connected" && redisStatus === "connected" ? "healthy" : "degraded",
        version: "1.0.0",
        uptime: process.uptime(),
        timestamp: new Date(),
        services: {
          database: dbStatus,
          redis: redisStatus
        }
    });
});
/* -------------------------------------------------------------------------- */
/* API Routes */
/* -------------------------------------------------------------------------- */

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/user", userRoutes);

app.use("/api/v1/resume", resumeRoutes);

app.use("/api/v1/ats", atsRoutes);

app.use("/api/v1/resume", reviewRoutes);

app.use("/api/v1/cover-letter", coverLetterRoutes);

app.use("/api/v1/jobs", jobRoutes);

app.use("/api/v1/skills", skillGapRoutes);

app.use("/api/v1/coding", codingRoutes);

app.use("/api/v1/interview", interviewRoutes);
app.use("/api/v1/admin", adminRoutes);

// Bull Board UI for admin
app.use("/api/admin/queues", bullBoardRouter);

/* -------------------------------------------------------------------------- */
/* 404 */
/* -------------------------------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* -------------------------------------------------------------------------- */
/* Error Handler */
/* -------------------------------------------------------------------------- */

app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);

  return res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
});

interviewSocket(io);

export  {app,server,io};