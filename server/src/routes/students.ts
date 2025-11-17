// src/routes/students.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getMyProfile,
  upsertMyProfile
} from "../controllers/studentProfileController.js";
import User from "../models/User.js";

const router = Router();

/**
 * GET /students
 * Admin-only list of all student users (for AdminStudentManagement)
 */
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id fullName email role createdAt")
      .lean();

    return res.json(students);
  } catch (err) {
    console.error("GET /students error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch students" });
  }
});

/**
 * GET /students/me → kunin profile ng current logged-in student
 */
router.get("/me", requireAuth, requireRole("student"), getMyProfile);

/**
 * POST /students/me → create/update profile ng current student
 */
router.post("/me", requireAuth, requireRole("student"), upsertMyProfile);

export default router;
