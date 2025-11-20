// server/src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" },

  // 🔐 Email verification fields
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date }
});

export default mongoose.model<IUser>("User", userSchema);
