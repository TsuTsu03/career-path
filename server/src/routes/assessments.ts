// server/src/routes/assessments.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createAptitudeAssessment,
  getLatestAptitudeAssessment
} from "../controllers/aptitudeAssessmentController.js";

const router = Router();

// POST /api/assessments/aptitude
router.post(
  "/aptitude",
  requireAuth,
  requireRole("student"),
  createAptitudeAssessment
);

// GET /api/assessments/aptitude/latest
// Used by TrackRecommendations.tsx to fetch the latest result
router.get(
  "/aptitude/latest",
  requireAuth,
  requireRole("student"),
  getLatestAptitudeAssessment
);

export default router;
