// src/routes/students.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getMyProfile,
  upsertMyProfile
} from "../controllers/studentProfileController.js";
import User from "../models/User.js";
import { AssessmentResultModel } from "../models/AssessmentResults.js";

const router = Router();

/**
 * GET /students
 * Admin-only list of all student users + flag kung may assessment na
 */
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const results = await AssessmentResultModel.find().select("student").lean();

    const completedSet = new Set(results.map((r) => r.student.toString()));

    // i-cast natin sa custom type para may createdAt
    const users = (await User.find({ role: "student" })
      .select("_id fullName email role createdAt")
      .lean()) as Array<{
      _id: any;
      fullName?: string;
      email?: string;
      role: "student" | "admin";
      createdAt?: Date;
    }>;

    const payload = users.map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt ?? null,
      hasAssessment: completedSet.has(u._id.toString())
    }));

    return res.json(payload);
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
