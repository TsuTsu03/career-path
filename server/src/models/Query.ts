// server/src/models/Query.ts
import { Schema, model, type Document, Types } from "mongoose";

export interface IQuery extends Document {
  student: Types.ObjectId; // student user _id
  counselor?: Types.ObjectId; // admin user _id (who answered)
  subject: string;
  message: string;
  status: "pending" | "answered";
  response?: string;
  responseDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const querySchema = new Schema<IQuery>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    counselor: { type: Schema.Types.ObjectId, ref: "User" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending"
    },
    response: String,
    responseDate: Date
  },
  { timestamps: true }
);

// Clean JSON: use `id` instead of `_id`, remove __v
querySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  }
});

export default model<IQuery>("Query", querySchema);
