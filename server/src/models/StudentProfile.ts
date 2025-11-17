// src/models/StudentProfile.ts
import { Schema, model, Types } from "mongoose";

const studentProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // 1 profile per user
    },
    firstName: String,
    lastName: String,
    gender: String,
    birthDate: Date,
    email: String,
    contactNumber: String,
    address: String,
    guardianName: String,
    guardianContact: String,
    interests: String,
    strengths: String,
    hobbies: String,
    gradeLevel: String,
    section: String,
    studentId: String
  },
  { timestamps: true }
);

export const StudentProfile = model("StudentProfile", studentProfileSchema);
