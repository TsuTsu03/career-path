// models/Assessment.ts
import { Schema, model, type Document } from "mongoose";

export interface IAssessment extends Document {
  student: Schema.Types.ObjectId; // User/Student
  answers: Record<string, number>; // questionId → score
  primaryTrack: "stem" | "abm" | "humss" | "gas";
  primaryScore: number;
  secondaryTrack: "stem" | "abm" | "humss" | "gas";
  secondaryScore: number;
  allScores: {
    stem: number;
    abm: number;
    humss: number;
    gas: number;
  };
}

const assessmentSchema = new Schema<IAssessment>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: Object, default: {} },
    primaryTrack: String,
    primaryScore: Number,
    secondaryTrack: String,
    secondaryScore: Number,
    allScores: {
      stem: Number,
      abm: Number,
      humss: Number,
      gas: Number
    }
  },
  { timestamps: true }
);

export default model<IAssessment>("Assessment", assessmentSchema);
