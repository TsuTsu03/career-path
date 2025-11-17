// src/routes/students.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getMyProfile,
  upsertMyProfile
} from "../controllers/studentProfileController.js";

const router = Router();

// GET /api/students/me → kunin profile ng current logged-in student
router.get("/me", requireAuth, requireRole("student"), getMyProfile);

// POST /api/students/me → create/update profile
router.post("/me", requireAuth, requireRole("student"), upsertMyProfile);

export default router;
