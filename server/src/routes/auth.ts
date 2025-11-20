// server/src/routes/auth.ts
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

/* =============== EMAIL SENDER HELPER =============== */
async function sendVerificationEmail(
  email: string,
  token: string,
  userId: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email?token=${token}&id=${userId}`;

  await transporter.sendMail({
    from: `"CARPATH" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <p>Hi,</p>
      <p>Thank you for registering. Please click the link below to verify your email:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
    `
  });
}

/* =============== REGISTER =============== */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Only allow valid roles, fallback to "student"
    const allowedRoles = ["student", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "student";

    const hashed = await bcrypt.hash(password, 10);

    // 🔐 create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const user = new User({
      fullName,
      email,
      password: hashed,
      role: finalRole,
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    await user.save();

    // send verification email
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        // ⚠️ gamit na natin yung virtual string id, hindi _id (unknown)
        user.id
      );
    } catch (emailErr) {
      console.error("Error sending verification email:", emailErr);
      // optional: you can still allow registration but warn frontend
    }

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =============== VERIFY EMAIL =============== */
router.post("/verify-email", async (req, res) => {
  try {
    const { token, id } = req.body;

    if (!token || !id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing token or id" });
    }

    const user = await User.findOne({
      _id: id,
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() } // not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link"
      });
    }

    user.isVerified = true;

    // ❌ dati: user.verificationToken = undefined;
    // exactOptionalPropertyTypes + ?prop → bawal mag-assign ng undefined
    // ✅ use delete + cast to any para happy si TS
    delete (user as any).verificationToken;
    delete (user as any).verificationTokenExpires;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =============== LOGIN =============== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2️⃣ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // 🔐 2.5 Block login if not verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in."
      });
    }

    // 3️⃣ Generate JWT token (include role)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    // 4️⃣ Return user data + token
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
