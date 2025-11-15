// models/Announcement.ts
import { Schema, model, type Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: "event" | "deadline" | "general" | "career";
  date: Date;
  author: string;
  important: boolean;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["event", "deadline", "general", "career"],
      default: "general"
    },
    date: { type: Date, default: Date.now },
    author: String,
    important: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IAnnouncement>("Announcement", announcementSchema);
