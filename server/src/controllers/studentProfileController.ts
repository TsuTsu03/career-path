// src/controllers/studentProfileController.ts
import type { Response } from "express";
import { StudentProfile } from "../models/StudentProfile.js";
import type { AuthRequest } from "../middleware/auth.js";

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

    const data = {
      user: req.user.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      birthDate: req.body.birthDate,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      guardianName: req.body.guardianName,
      guardianContact: req.body.guardianContact,
      interests: req.body.interests,
      strengths: req.body.strengths,
      hobbies: req.body.hobbies,
      gradeLevel: req.body.gradeLevel,
      section: req.body.section,
      studentId: req.body.studentId
    };

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
