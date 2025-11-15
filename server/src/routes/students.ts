import express from "express";

const router = express.Router();

// GET /api/students
router.get("/", async (req, res) => {
  // TODO: palitan with real DB logic
  return res.json({ success: true, students: [] });
});

// POST /api/students
router.post("/", async (req, res) => {
  // TODO: create student record
  return res.status(201).json({ success: true, message: "Student created" });
});

export default router;
