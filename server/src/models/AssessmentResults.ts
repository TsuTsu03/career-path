// server/src/models/AssessmentResult.ts
import { Schema, model, type Types } from "mongoose";
import type { AptitudeDomain, TrackKey } from "../data/aptitudeQuestions.js";

export interface AssessmentResultDocument {
  student: Types.ObjectId;
  domainScores: Record<AptitudeDomain, number>;
  trackScores: Record<TrackKey, number>;
  primaryTrack: TrackKey;
  secondaryTrack: TrackKey;
  decisionPath: string[];
  createdAt: Date;
  updatedAt: Date;
}

const assessmentResultSchema = new Schema<AssessmentResultDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    domainScores: {
      verbal: { type: Number, required: true },
      numerical: { type: Number, required: true },
      scientific: { type: Number, required: true },
      abstract: { type: Number, required: true },
      clerical: { type: Number, required: true },
      entrepreneurial: { type: Number, required: true }
    },
    trackScores: {
      stem: { type: Number, required: true },
      abm: { type: Number, required: true },
      humss: { type: Number, required: true },
      gas: { type: Number, required: true }
    },
    primaryTrack: { type: String, required: true },
    secondaryTrack: { type: String, required: true },
    decisionPath: [{ type: String, required: true }]
  },
  { timestamps: true }
);

export const AssessmentResultModel = model<AssessmentResultDocument>(
  "AssessmentResult",
  assessmentResultSchema
);
