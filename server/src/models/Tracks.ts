// models/Track.ts
import { Schema, model, type Document } from "mongoose";

export interface ITrack extends Document {
  code: "stem" | "abm" | "humss" | "gas";
  name: string;
  description: string;
  careers: string[];
  subjects: string[];
  isActive: boolean;
}

const trackSchema = new Schema<ITrack>(
  {
    code: { type: String, required: true, unique: true },
    name: String,
    description: String,
    careers: [String],
    subjects: [String],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model<ITrack>("Track", trackSchema);
