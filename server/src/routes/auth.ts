import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { generateStudentId } from "../utils/generateStudentId.js";
import {
  changePasswordLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  registerLimiter,
  resendVerificationLimiter,
  tokenLinkLimiter
} from "../middleware/rateLimit.js";
import {
  requireAuth,
  requireRole,
  type AuthRequest
} from "../middleware/auth.js";
import {
  sendAdminSetupEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
} from "../utils/mailer.js";
import {
  ONE_DAY_MS,
  ONE_HOUR_MS,
  PASSWORD_RULES,
  cleanName,
  hashToken,
  isStrongPassword,
  isTokenAndId,
  isValidEmail,
  newToken,
  normalizeEmail
} from "../utils/security.js";

const router = express.Router();

/* =============== REGISTER (STUDENT ONLY) =============== */
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { password, schoolCode, batch } = req.body;

    const normalizedFullName = cleanName(req.body.fullName);
    const normalizedEmail = normalizeEmail(req.body.email);
    const rawPassword = typeof password === "string" ? password : "";

    if (!normalizedFullName || !normalizedEmail || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required."
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
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

    const verificationToken = newToken();
    const verificationTokenExpires = new Date(Date.now() + ONE_DAY_MS);

    const studentId = await generateStudentId({
      schoolCode: typeof schoolCode === "string" ? schoolCode : undefined,
      batch: typeof batch === "string" ? batch : undefined
    });

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
      const normalizedFullName = cleanName(req.body.fullName);
      const normalizedEmail = normalizeEmail(req.body.email);

      if (!normalizedFullName || !normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Full name and email are required."
        });
      }

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address."
        });
      }

      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }

      const passwordSetupToken = newToken();
      const passwordSetupTokenExpires = new Date(Date.now() + ONE_DAY_MS);

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
router.post("/admin/setup-password", tokenLinkLimiter, async (req, res) => {
  try {
    const { token, id, password, confirmPassword } = req.body;

    if (!isTokenAndId(token, id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired setup link"
      });
    }

    if (!password || !confirmPassword) {
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
      passwordSetupTokenExpires: mongoose.trusted({ $gt: new Date() })
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
// Always answers the same way, so the response never reveals whether an
// email address has an account.
router.post(
  "/resend-verification",
  resendVerificationLimiter,
  async (req, res) => {
    const genericMessage =
      "If that email belongs to an account that still needs verification, we sent a new link.";

    try {
      const normalizedEmail = normalizeEmail(req.body.email);

      if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address."
        });
      }

      const user = await User.findOne({ email: normalizedEmail });
      if (!user || user.isVerified) {
        return res.json({ success: true, message: genericMessage });
      }

      const verificationToken = newToken();
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = new Date(Date.now() + ONE_DAY_MS);
      await user.save();

      try {
        await sendVerificationEmail(
          user.email,
          verificationToken,
          String(user._id)
        );
      } catch (emailErr) {
        console.error("Error resending verification email:", emailErr);
      }

      return res.json({ success: true, message: genericMessage });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to resend verification email"
      });
    }
  }
);

/* =============== VERIFY EMAIL =============== */
router.post("/verify-email", tokenLinkLimiter, async (req, res) => {
  try {
    const { token, id } = req.body;

    if (!isTokenAndId(token, id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link"
      });
    }

    const user = await User.findOne({
      _id: id,
      verificationToken: token,
      verificationTokenExpires: mongoose.trusted({ $gt: new Date() })
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

/* =============== FORGOT PASSWORD =============== */
// Same response whether or not the email exists.
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const genericMessage =
    "If that email belongs to an account, we sent a link to reset the password.";

  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({ success: true, message: genericMessage });
    }

    const token = newToken();
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetTokenExpires = new Date(Date.now() + ONE_HOUR_MS);
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, token, String(user._id), "reset");
    } catch (emailErr) {
      console.error("Error sending password reset email:", emailErr);
    }

    return res.json({ success: true, message: genericMessage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =============== RESET PASSWORD =============== */
router.post("/reset-password", tokenLinkLimiter, async (req, res) => {
  try {
    const { token, id, password, confirmPassword } = req.body;

    if (!isTokenAndId(token, id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link"
      });
    }

    if (typeof password !== "string" || password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match."
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, message: PASSWORD_RULES });
    }

    const user = await User.findOne({
      _id: id,
      passwordResetTokenHash: hashToken(token),
      passwordResetTokenExpires: mongoose.trusted({ $gt: new Date() })
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link"
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpires = undefined;
    // Opening the emailed link proves the person owns this address.
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    if (user.role === "admin") {
      user.passwordSetupToken = undefined;
      user.passwordSetupTokenExpires = undefined;
    }
    await user.save();

    return res.json({
      success: true,
      role: user.role,
      message: "Password updated. You can now log in."
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =============== LOGIN =============== */
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { password, role } = req.body;
    const normalizedEmail = normalizeEmail(req.body.email);
    const genericFailure = {
      success: false,
      message: "Invalid email or password"
    };

    const user = normalizedEmail
      ? await User.findOne({ email: normalizedEmail })
      : null;

    if (!user || !user.password) {
      // An admin created by another admin has no password until they open
      // the setup link. Only the admin login page gets this hint.
      if (user && user.role === "admin" && role === "admin") {
        return res.status(403).json({
          success: false,
          needsPasswordSetup: true,
          message:
            "Please set up your password first using the link sent to your email."
        });
      }
      return res.status(401).json(genericFailure);
    }

    const isMatch = await bcrypt.compare(
      typeof password === "string" ? password : "",
      user.password
    );
    if (!isMatch) {
      return res.status(401).json(genericFailure);
    }

    // Role and verification checks come after the password check, so they
    // never tell a stranger which emails have accounts.
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message:
          role === "admin"
            ? "This account is not registered as admin."
            : "This account is not registered as student."
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        needsVerification: true,
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
        role: user.role,
        studentId: user.studentId ?? null
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

/* =============== CURRENT USER =============== */
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select(
      "fullName email role studentId createdAt"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId ?? null,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const fullName = cleanName(req.body.fullName);
    if (!fullName) {
      return res
        .status(400)
        .json({ success: false, message: "Full name is required." });
    }

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { fullName },
      { new: true }
    ).select("fullName email role studentId");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    return res.json({
      success: true,
      message: "Account details saved.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId ?? null
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =============== CHANGE PASSWORD =============== */
router.post(
  "/change-password",
  requireAuth,
  changePasswordLimiter,
  async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (
        typeof currentPassword !== "string" ||
        typeof newPassword !== "string" ||
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message: "Current and new password are required."
        });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "New passwords do not match." });
      }

      if (!isStrongPassword(newPassword)) {
        return res
          .status(400)
          .json({ success: false, message: PASSWORD_RULES });
      }

      const user = await User.findById(req.user!.id);
      if (!user || !user.password) {
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect." });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.json({ success: true, message: "Password changed." });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;
