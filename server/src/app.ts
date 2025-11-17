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

const app = express();

// connect to DB
connectDB();

app.use(cors());
app.use(express.json());

// keep /api prefix — ok siya for local and Vercel
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/announcements", announcementRoutes);

export default app;
