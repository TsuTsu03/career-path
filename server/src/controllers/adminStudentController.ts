// server/src/controllers/adminStudentController.ts
//
// Admin management of student accounts: list, view, create, edit, delete,
// and reset an assessment so the student can retake it.
import type { Response } from "express";
import { isValidObjectId, trusted } from "mongoose";
import User from "../models/User.js";
import Query from "../models/Query.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { AssessmentResultModel } from "../models/AssessmentResults.js";
import type { AuthRequest } from "../middleware/auth.js";
import { generateStudentId } from "../utils/generateStudentId.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
import {
  ONE_DAY_MS,
  cleanName,
  hashToken,
  isValidEmail,
  newToken,
  normalizeEmail
} from "../utils/security.js";

const MAX_STUDENTS = 2000;

function cleanShort(value: unknown, max = 40): string | undefined {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

function notFound(res: Response) {
  return res
    .status(404)
    .json({ success: false, message: "Student not found." });
}

/**
 * GET /students
 * All student accounts with profile basics and assessment summary.
 */
export async function listStudents(_req: AuthRequest, res: Response) {
  try {
    const users = await User.find({ role: "student" })
      .select("_id fullName email role createdAt studentId isVerified password")
      .sort({ createdAt: -1 })
      .limit(MAX_STUDENTS)
      .lean();

    const ids = users.map((u) => u._id);

    const [results, profiles] = await Promise.all([
      AssessmentResultModel.find({ student: trusted({ $in: ids }) })
        .select("student trackScores primaryTrack secondaryTrack createdAt")
        .lean(),
      StudentProfile.find({ user: trusted({ $in: ids }) })
        .select("user gradeLevel section")
        .lean()
    ]);

    const assessmentMap = new Map(results.map((r) => [String(r.student), r]));
    const profileMap = new Map(profiles.map((p) => [String(p.user), p]));

    const payload = users.map((u) => {
      const assessment = assessmentMap.get(String(u._id));
      const profile = profileMap.get(String(u._id));

      return {
        _id: u._id,
        studentId: u.studentId ?? null,
        fullName: u.fullName ?? null,
        email: u.email ?? null,
        role: u.role,
        createdAt: u.createdAt ?? null,
        isVerified: Boolean(u.isVerified),
        hasPassword: Boolean(u.password),
        gradeLevel: profile?.gradeLevel ?? null,
        section: profile?.section ?? null,
        hasAssessment: Boolean(assessment),
        assessmentResult: assessment
          ? {
              createdAt: assessment.createdAt ?? null,
              trackScores: assessment.trackScores ?? {},
              primaryTrack: assessment.primaryTrack ?? null,
              secondaryTrack: assessment.secondaryTrack ?? null,
              primaryTrackScore: assessment.primaryTrack
                ? (assessment.trackScores?.[assessment.primaryTrack] ?? null)
                : null,
              secondaryTrackScore: assessment.secondaryTrack
                ? (assessment.trackScores?.[assessment.secondaryTrack] ?? null)
                : null
            }
          : null
      };
    });

    return res.json(payload);
  } catch (err) {
    console.error("GET /students error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch students" });
  }
}

/**
 * GET /students/:id
 * One student with full profile, assessment result and query count.
 */
export async function getStudent(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id ?? "");
    if (!isValidObjectId(id)) return notFound(res);

    const user = await User.findOne({ _id: id, role: "student" })
      .select("fullName email studentId createdAt isVerified password")
      .lean();
    if (!user) return notFound(res);

    const [profile, result, queryCount] = await Promise.all([
      StudentProfile.findOne({ user: id }).lean(),
      AssessmentResultModel.findOne({ student: id })
        .sort({ createdAt: -1 })
        .lean(),
      Query.countDocuments({ student: id })
    ]);

    const correct = result?.answers?.filter((a) => a.isCorrect).length ?? 0;

    return res.json({
      success: true,
      student: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId ?? null,
        createdAt: user.createdAt ?? null,
        isVerified: Boolean(user.isVerified),
        hasPassword: Boolean(user.password),
        queryCount,
        profile: profile
          ? {
              firstName: profile.firstName ?? "",
              lastName: profile.lastName ?? "",
              gender: profile.gender ?? "",
              birthDate: profile.birthDate ?? null,
              contactNumber: profile.contactNumber ?? "",
              address: profile.address ?? "",
              guardianName: profile.guardianName ?? "",
              guardianContact: profile.guardianContact ?? "",
              interests: profile.interests ?? "",
              strengths: profile.strengths ?? "",
              hobbies: profile.hobbies ?? "",
              gradeLevel: profile.gradeLevel ?? "",
              section: profile.section ?? ""
            }
          : null,
        assessment: result
          ? {
              createdAt: result.createdAt,
              primaryTrack: result.primaryTrack,
              secondaryTrack: result.secondaryTrack,
              trackScores: result.trackScores,
              domainScores: result.domainScores,
              decisionPath: result.decisionPath ?? [],
              correctAnswers: correct,
              totalQuestions: result.answers?.length ?? 0
            }
          : null
      }
    });
  } catch (err) {
    console.error("GET /students/:id error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load student" });
  }
}

/**
 * POST /students
 * Creates a student account. The student gets an email link to choose a
 * password, so the admin never handles it.
 */
export async function createStudent(req: AuthRequest, res: Response) {
  try {
    const fullName = cleanName(req.body.fullName);
    const email = normalizeEmail(req.body.email);

    if (!fullName || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Full name and email are required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }
    if (await User.exists({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const token = newToken();
    const user = await User.create({
      fullName,
      email,
      password: null,
      role: "student",
      studentId: await generateStudentId(),
      isVerified: false,
      passwordResetTokenHash: hashToken(token),
      passwordResetTokenExpires: new Date(Date.now() + ONE_DAY_MS)
    });

    const gradeLevel = cleanShort(req.body.gradeLevel);
    const section = cleanShort(req.body.section);
    if (gradeLevel || section) {
      await StudentProfile.create({
        user: user._id,
        firstName: "",
        lastName: "",
        email,
        studentId: user.studentId,
        gradeLevel,
        section
      });
    }

    let emailSent = true;
    try {
      await sendPasswordResetEmail(email, token, String(user._id), "new-account");
    } catch (emailErr) {
      emailSent = false;
      console.error("Error sending new student email:", emailErr);
    }

    return res.status(201).json({
      success: true,
      emailSent,
      message: emailSent
        ? "Student account created. A link to set the password was emailed."
        : "Student account created, but the email could not be sent.",
      student: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId
      }
    });
  } catch (err) {
    console.error("POST /students error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create student" });
  }
}

/**
 * PATCH /students/:id
 * Edits name, email, grade level and section.
 */
export async function updateStudent(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id ?? "");
    if (!isValidObjectId(id)) return notFound(res);

    const user = await User.findOne({ _id: id, role: "student" });
    if (!user) return notFound(res);

    if (req.body.fullName !== undefined) {
      const fullName = cleanName(req.body.fullName);
      if (!fullName) {
        return res
          .status(400)
          .json({ success: false, message: "Full name is required." });
      }
      user.fullName = fullName;
    }

    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email);
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address."
        });
      }
      if (email !== user.email && (await User.exists({ email }))) {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
      }
      user.email = email;
    }

    await user.save();

    const gradeLevel = cleanShort(req.body.gradeLevel);
    const section = cleanShort(req.body.section);
    if (gradeLevel !== undefined || section !== undefined) {
      await StudentProfile.findOneAndUpdate(
        { user: user._id },
        {
          ...(gradeLevel !== undefined ? { gradeLevel } : {}),
          ...(section !== undefined ? { section } : {}),
          email: user.email,
          studentId: user.studentId
        },
        { upsert: true }
      );
    } else {
      await StudentProfile.updateOne(
        { user: user._id },
        { email: user.email }
      );
    }

    return res.json({ success: true, message: "Student updated." });
  } catch (err) {
    console.error("PATCH /students/:id error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update student" });
  }
}

/**
 * DELETE /students/:id
 * Removes the account and everything tied to it.
 */
export async function deleteStudent(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id ?? "");
    if (!isValidObjectId(id)) return notFound(res);

    const user = await User.findOneAndDelete({ _id: id, role: "student" });
    if (!user) return notFound(res);

    await Promise.all([
      StudentProfile.deleteMany({ user: id }),
      AssessmentResultModel.deleteMany({ student: id }),
      Query.deleteMany({ student: id })
    ]);

    return res.json({ success: true, message: "Student deleted." });
  } catch (err) {
    console.error("DELETE /students/:id error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete student" });
  }
}

/**
 * DELETE /students/:id/assessment
 * Clears the student's result so they can take the assessment again.
 */
export async function resetStudentAssessment(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id ?? "");
    if (!isValidObjectId(id)) return notFound(res);

    if (!(await User.exists({ _id: id, role: "student" }))) {
      return notFound(res);
    }

    const { deletedCount } = await AssessmentResultModel.deleteMany({
      student: id
    });

    return res.json({
      success: true,
      message:
        deletedCount > 0
          ? "Assessment reset. The student can take it again."
          : "This student has no assessment to reset."
    });
  } catch (err) {
    console.error("DELETE /students/:id/assessment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to reset assessment" });
  }
}
