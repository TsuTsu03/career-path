// src/controllers/studentProfileController.ts
import type { Response } from "express";
import { StudentProfile } from "../models/StudentProfile.js";
import User from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.js";

// Field name → max length. Anything not listed here is ignored, so a student
// cannot overwrite their account email or school-issued student ID.
const EDITABLE_FIELDS: Record<string, number> = {
  firstName: 60,
  lastName: 60,
  gender: 30,
  contactNumber: 30,
  address: 300,
  guardianName: 120,
  guardianContact: 30,
  interests: 1000,
  strengths: 1000,
  hobbies: 1000,
  gradeLevel: 40,
  section: 40
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "No user in request" });
    }

    const profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const upsertMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "No user in request" });
    }

    const user = await User.findById(req.user.id).select("email studentId");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    const data: Record<string, unknown> = {
      user: req.user.id,
      // Always taken from the account, never from the request.
      email: user.email,
      studentId: user.studentId
    };

    for (const [field, max] of Object.entries(EDITABLE_FIELDS)) {
      const value = req.body?.[field];
      if (value === undefined || value === null) continue;
      if (typeof value !== "string") {
        return res
          .status(400)
          .json({ success: false, message: `Invalid value for ${field}.` });
      }
      data[field] = value.trim().slice(0, max);
    }

    const birthDate = req.body?.birthDate;
    if (birthDate) {
      const parsed = new Date(String(birthDate));
      if (Number.isNaN(parsed.getTime()) || parsed > new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid birth date." });
      }
      data.birthDate = parsed;
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      data,
      { new: true, upsert: true }
    );

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Error saving student profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
