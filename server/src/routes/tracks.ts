// server/src/routes/tracks.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getTracks, updateTrack } from "../controllers/trackController.js";

const router = Router();

// GET /tracks — strand details for students and admins
router.get("/", requireAuth, getTracks);

// PUT /tracks/:code — admin edits a strand (stem, abm, humss, gas)
router.put("/:code", requireAuth, requireRole("admin"), updateTrack);

export default router;
