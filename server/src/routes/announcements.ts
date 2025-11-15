import express from "express";

const router = express.Router();

// GET /api/announcements
router.get("/", async (_req, res) => {
  // TODO: fetch announcements for students
  return res.json({
    success: true,
    announcements: []
  });
});

// POST /api/announcements  (admin only)
router.post("/", async (req, res) => {
  // TODO: create announcement
  return res.status(201).json({
    success: true,
    message: "Announcement created"
  });
});

export default router;
