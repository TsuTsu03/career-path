// models/Track.ts
import { Schema, model, type Document } from "mongoose";

export interface ITrack extends Document {
  code: "stem" | "abm" | "humss" | "gas";
  name: string;
  fullName: string;
  description: string;
  careers: string[];
  subjects: string[];
  requirements: string;
  isActive: boolean;
}

const trackSchema = new Schema<ITrack>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      enum: ["stem", "abm", "humss", "gas"]
    },
    name: String,
    fullName: String,
    description: String,
    careers: [String],
    subjects: [String],
    requirements: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model<ITrack>("Track", trackSchema);
