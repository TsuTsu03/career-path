// server/src/routes/assessments.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createAptitudeAssessment,
  getLatestAptitudeAssessment,
  getAssessmentModelInfo
} from "../controllers/aptitudeAssessmentController.js";

const router = Router();

// GET /api/assessments/model-info  — C4.5 model metadata (any authenticated user)
router.get("/model-info", requireAuth, getAssessmentModelInfo);

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
