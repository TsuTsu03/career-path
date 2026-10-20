// src/routes/students.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getMyProfile,
  upsertMyProfile
} from "../controllers/studentProfileController.js";
import {
  createStudent,
  deleteStudent,
  getStudent,
  listStudents,
  resetStudentAssessment,
  updateStudent
} from "../controllers/adminStudentController.js";

const router = Router();

const adminOnly = [requireAuth, requireRole("admin")];

/**
 * GET /students/me → kunin profile ng current logged-in student
 * POST /students/me → create/update profile ng current student
 * (registered before /:id so "me" is never treated as an id)
 */
router.get("/me", requireAuth, requireRole("student"), getMyProfile);
router.post("/me", requireAuth, requireRole("student"), upsertMyProfile);

// Admin management of student accounts
router.get("/", ...adminOnly, listStudents);
router.post("/", ...adminOnly, createStudent);
router.get("/:id", ...adminOnly, getStudent);
router.patch("/:id", ...adminOnly, updateStudent);
router.delete("/:id", ...adminOnly, deleteStudent);
router.delete("/:id/assessment", ...adminOnly, resetStudentAssessment);

export default router;
