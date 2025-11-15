// models/Query.ts
import { Schema, model, type Document } from "mongoose";

export interface IQuery extends Document {
  student: Schema.Types.ObjectId;
  counselor?: Schema.Types.ObjectId;
  subject: string;
  message: string;
  status: "pending" | "answered";
  response?: string;
  responseDate?: Date;
}

const querySchema = new Schema<IQuery>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    counselor: { type: Schema.Types.ObjectId, ref: "User" },
    subject: String,
    message: String,
    status: { type: String, enum: ["pending", "answered"], default: "pending" },
    response: String,
    responseDate: Date
  },
  { timestamps: true }
);

export default model<IQuery>("Query", querySchema);
