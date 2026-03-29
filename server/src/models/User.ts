import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "student" | "admin";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string | null;
  role: UserRole;
  studentId: string | null;
  isVerified: boolean;

  verificationToken: string | undefined;
  verificationTokenExpires: Date | undefined;

  passwordSetupToken: string | undefined;
  passwordSetupTokenExpires: Date | undefined;

  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    verificationToken: {
      type: String,
      default: undefined
    },
    verificationTokenExpires: {
      type: Date,
      default: undefined
    },

    passwordSetupToken: {
      type: String,
      default: undefined
    },
    passwordSetupTokenExpires: {
      type: Date,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUser>("User", userSchema);
