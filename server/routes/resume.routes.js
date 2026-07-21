import express from "express";
import {
  upload,
  uploadResume,
  getResumeList,
  deleteResume,
  parseResumeController,
} from "../controllers/resume.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.get(
  "/list",
  authMiddleware,
  getResumeList
);

router.delete(
  "/:id",
  authMiddleware,
  deleteResume
);


router.post(
    "/:id/parse",
    authMiddleware,
    parseResumeController
);

export default router;