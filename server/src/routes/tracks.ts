import express from "express";

const router = express.Router();

// GET /api/tracks
router.get("/", async (_req, res) => {
  // TODO: fetch track profiles (STEM, ABM, HUMSS, GAS, etc.)
  return res.json({
    success: true,
    tracks: []
  });
});

// POST /api/tracks
router.post("/", async (req, res) => {
  // TODO: create or update track profile
  return res.status(201).json({
    success: true,
    message: "Track saved"
  });
});

export default router;
