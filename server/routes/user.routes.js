import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import { getDashboardStats } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

router.get("/dashboard-stats", authMiddleware, getDashboardStats);

export default router;