// models/StudentProfile.ts
import { Schema, model, type Document } from "mongoose";

export interface IStudentProfile extends Document {
  user: Schema.Types.ObjectId; // reference to User
  gradeLevel: number;
  section?: string;
  lrn?: string;
  averageGrade?: number;
  stemGrade?: number;
  abmGrade?: number;
  humssGrade?: number;
  gasGrade?: number;
  interests: string[]; // from assessment/profile
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gradeLevel: Number,
    section: String,
    lrn: String,
    averageGrade: Number,
    stemGrade: Number,
    abmGrade: Number,
    humssGrade: Number,
    gasGrade: Number,
    interests: [String]
  },
  { timestamps: true }
);

export default model<IStudentProfile>("StudentProfile", studentProfileSchema);
