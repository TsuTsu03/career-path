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
 * Admin-only list of all student users + assessment details if available
 */
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const users = (await User.find({ role: "student" })
      .select("_id fullName email role createdAt studentId")
      .sort({ createdAt: -1 })
      .lean()) as Array<{
      _id: any;
      fullName?: string;
      email?: string;
      role: "student" | "admin";
      createdAt?: Date | null;
      studentId?: string;
    }>;

    const results = await AssessmentResultModel.find()
      .select("student trackScores primaryTrack secondaryTrack createdAt")
      .lean();

    const assessmentMap = new Map(
      results.map((r: any) => [r.student.toString(), r])
    );

    const payload = users.map((u) => {
      const assessment = assessmentMap.get(u._id.toString());

      return {
        _id: u._id,
        studentId: u.studentId ?? null,
        fullName: u.fullName ?? null,
        email: u.email ?? null,
        role: u.role,
        createdAt: u.createdAt ?? null,
        hasAssessment: !!assessment,
        assessmentResult: assessment
          ? {
              createdAt: assessment.createdAt ?? null,
              trackScores: assessment.trackScores ?? {},
              primaryTrack: assessment.primaryTrack ?? null,
              secondaryTrack: assessment.secondaryTrack ?? null,

              // ✅ FIXED SCORE MAPPING
              primaryTrackScore: assessment.primaryTrack
                ? (assessment.trackScores?.[assessment.primaryTrack] ?? null)
                : null,

              secondaryTrackScore: assessment.secondaryTrack
                ? (assessment.trackScores?.[assessment.secondaryTrack] ?? null)
                : null
            }
          : null
      };
    });

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
