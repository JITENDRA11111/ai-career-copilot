import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getUsers,
  getStats,
  changeUserRole,
  deleteUser,
  getLogs,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply auth and admin checks to all admin endpoints
router.use(authMiddleware, adminMiddleware);

router.get("/users", getUsers);
router.get("/stats", getStats);
router.put("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteUser);
router.get("/logs", getLogs);

export default router;
