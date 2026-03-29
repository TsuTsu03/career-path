import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { generateStudentId } from "../utils/generateStudentId.js";
import {
  requireAuth,
  requireRole,
  type AuthRequest
} from "../middleware/auth.js";

const router = express.Router();

function createTransporter() {
  const port = Number(process.env.EMAIL_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/* =============== EMAIL SENDER HELPERS =============== */
async function sendVerificationEmail(
  email: string,
  token: string,
  userId: string
) {
  const transporter = createTransporter();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email?token=${token}&id=${userId}`;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "CARPATH"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <p>Hi,</p>
        <p>Thank you for registering. Please click the button below to verify your email:</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `
  });
}

async function sendAdminSetupEmail(
  email: string,
  token: string,
  userId: string
) {
  const transporter = createTransporter();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const setupUrl = `${clientUrl}/admin/setup-password?token=${token}&id=${userId}`;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "CARPATH"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: "Set up your admin account password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <p>Hello,</p>
        <p>An administrator account has been created for you in CAREER PATH.</p>
        <p>Please click the button below to set your password:</p>
        <p>
          <a href="${setupUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
            Set Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${setupUrl}">${setupUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `
  });
}

function isStrongPassword(password: string) {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  return isLongEnough && hasLetter && hasUpper && hasNumber && hasSpecial;
}

/* =============== REGISTER (STUDENT ONLY) =============== */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, schoolCode, batch } = req.body;

    const normalizedFullName = String(fullName ?? "").trim();
    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();
    const rawPassword = String(password ?? "");

    if (!normalizedFullName || !normalizedEmail || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required."
      });
    }

    if (!isStrongPassword(rawPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password is too weak."
      });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashed = await bcrypt.hash(rawPassword, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const studentId = await generateStudentId({ schoolCode, batch });

    const user = new User({
      fullName: normalizedFullName,
      email: normalizedEmail,
      password: hashed,
      role: "student",
      studentId,
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    await user.save();

    let emailSent = true;

    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        String(user._id)
      );
    } catch (emailErr) {
      emailSent = false;
      console.error("Error sending verification email:", emailErr);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "User registered successfully. Please check your email to verify your account."
        : "User registered successfully, but verification email could not be sent.",
      emailSent,
      user: {
        id: user._id,
        studentId: user.studentId ?? null,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err: any) {
    console.error(err);

    if (err?.code === 11000) {
      if (err?.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }

      if (err?.keyPattern?.studentId) {
        return res.status(400).json({
          success: false,
          message: "Generated student ID already exists. Please try again."
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =============== ADMIN CREATE =============== */
router.post(
  "/admin/create",
  requireAuth,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const { fullName, email } = req.body;

      const normalizedFullName = String(fullName ?? "").trim();
      const normalizedEmail = String(email ?? "")
        .trim()
        .toLowerCase();

      if (!normalizedFullName || !normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Full name and email are required."
        });
      }

      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }

      const passwordSetupToken = crypto.randomBytes(32).toString("hex");
      const passwordSetupTokenExpires = new Date(
        Date.now() + 1000 * 60 * 60 * 24
      );

      const user = new User({
        fullName: normalizedFullName,
        email: normalizedEmail,
        password: null,
        role: "admin",
        isVerified: true,
        passwordSetupToken,
        passwordSetupTokenExpires
      });

      await user.save();

      let emailSent = true;

      try {
        await sendAdminSetupEmail(
          user.email,
          passwordSetupToken,
          String(user._id)
        );
      } catch (emailErr) {
        emailSent = false;
        console.error("Error sending admin setup email:", emailErr);
      }

      return res.status(201).json({
        success: true,
        message: emailSent
          ? "Admin created successfully. Password setup email sent."
          : "Admin created successfully, but password setup email could not be sent.",
        emailSent,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      });
    } catch (err: any) {
      console.error(err);

      if (err?.code === 11000 && err?.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);

/* =============== ADMIN SETUP PASSWORD =============== */
router.post("/admin/setup-password", async (req, res) => {
  try {
    const { token, id, password, confirmPassword } = req.body;

    if (!token || !id || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match."
      });
    }

    if (!isStrongPassword(String(password))) {
      return res.status(400).json({
        success: false,
        message: "Password is too weak."
      });
    }

    const user = await User.findOne({
      _id: id,
      role: "admin",
      passwordSetupToken: token,
      passwordSetupTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired setup link"
      });
    }

    const hashed = await bcrypt.hash(String(password), 10);

    user.password = hashed;
    user.passwordSetupToken = undefined;
    user.passwordSetupTokenExpires = undefined;
    user.isVerified = true;

    await user.save();

    return res.json({
      success: true,
      message: "Password created successfully. You can now log in."
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =============== RESEND VERIFICATION EMAIL =============== */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    await sendVerificationEmail(
      user.email,
      verificationToken,
      String(user._id)
    );

    return res.json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email"
    });
  }
});

/* =============== VERIFY EMAIL =============== */
router.post("/verify-email", async (req, res) => {
  try {
    const { token, id } = req.body;

    if (!token || !id) {
      return res.status(400).json({
        success: false,
        message: "Missing token or id"
      });
    }

    const user = await User.findOne({
      _id: id,
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link"
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =============== LOGIN =============== */
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message:
          role === "admin"
            ? "This account is not registered as admin."
            : "This account is not registered as student."
      });
    }

    if (user.role === "admin" && !user.password) {
      return res.status(403).json({
        success: false,
        needsPasswordSetup: true,
        message:
          "Please set up your password first using the link sent to your email."
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(String(password ?? ""), user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in."
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    const token = jwt.sign(
      { id: String(user._id), email: user.email, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;
