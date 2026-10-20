// server/src/routes/admin.ts
import express from "express";
import {
  getAdminStats,
  getRecentActivity,
  listAdmins,
  resendAdminSetup
} from "../controllers/adminStatsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Everything here is admin-only.
router.use(requireAuth, requireRole("admin"));

router.get("/stats", getAdminStats);
router.get("/activity", getRecentActivity);
router.get("/admins", listAdmins);
router.post("/admins/:id/resend-setup", resendAdminSetup);

export default router;
