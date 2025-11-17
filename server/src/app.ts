// server/src/app.ts
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js"; // <-- walang .js sa TS

import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import assessmentRoutes from "./routes/assessments.js";
import trackRoutes from "./routes/tracks.js";
import queryRoutes from "./routes/queries.js";
import announcementRoutes from "./routes/announcements.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// connect to DB
connectDB();

app.use(cors());
app.use(express.json());

// keep /api prefix — ok siya for local and Vercel
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/assessments", assessmentRoutes);
app.use("/tracks", trackRoutes);
app.use("/queries", queryRoutes);
app.use("/announcements", announcementRoutes);
app.use("/admin", adminRoutes);

export default app;
