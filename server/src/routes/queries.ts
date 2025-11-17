// server/src/routes/queries.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createQuery,
  getQueries,
  answerQuery
} from "../controllers/queryController.js";

const router = Router();

// All routes require auth; role checks are inside controller
router.get("/", requireAuth, getQueries);
router.post("/", requireAuth, createQuery);
router.patch("/:id/reply", requireAuth, answerQuery);

export default router;
