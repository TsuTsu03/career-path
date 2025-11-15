import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

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

    const user = new User({
      fullName,
      email,
      password: hashed,
      role: finalRole
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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
