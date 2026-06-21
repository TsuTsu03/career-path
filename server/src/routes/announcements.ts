// server/src/routes/announcements.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcementController.js";

const router = Router();

// GET /announcements  — any authenticated user (students + admin)
router.get("/", requireAuth, getAnnouncements);

// Admin-only management
router.post("/", requireAuth, requireRole("admin"), createAnnouncement);
router.patch("/:id", requireAuth, requireRole("admin"), updateAnnouncement);
router.delete("/:id", requireAuth, requireRole("admin"), deleteAnnouncement);

export default router;
