// server/src/routes/admin.ts
import express from "express";
import { getAdminStats } from "../controllers/adminStatsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /admin/stats  (protected, admin-only)
router.get("/stats", requireAuth, requireRole("admin"), getAdminStats);

export default router;
