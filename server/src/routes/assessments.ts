import express from "express";

const router = express.Router();

// POST /api/assessments
router.post("/", async (req, res) => {
  // TODO: save assessment answers + computed results
  return res.status(201).json({
    success: true,
    message: "Assessment saved",
    results: req.body.results ?? null
  });
});

// GET /api/assessments/:userId
router.get("/:userId", async (req, res) => {
  // TODO: get last assessment of user
  return res.json({
    success: true,
    assessment: null
  });
});

export default router;
