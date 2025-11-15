import express from "express";

const router = express.Router();

// GET /api/queries?userId=...
router.get("/", async (req, res) => {
  const { userId } = req.query;
  // TODO: filter by student counselor/admin view
  return res.json({
    success: true,
    queries: [],
    userId
  });
});

// POST /api/queries
router.post("/", async (req, res) => {
  // TODO: create new query from student
  return res.status(201).json({
    success: true,
    message: "Query submitted"
  });
});

// PATCH /api/queries/:id/reply
router.patch("/:id/reply", async (req, res) => {
  // TODO: save counselor response
  return res.json({
    success: true,
    message: "Query answered"
  });
});

export default router;
