// server/src/app.ts
import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
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

// Only the CAREER PATH frontend may call this API from a browser.
// Extra origins can be added with CORS_ORIGINS (comma-separated).
const allowedOrigins = new Set(
  [
    "https://career-path-ecru.vercel.app",
    "https://career-path-den-jansen-flores-projects.vercel.app",
    "http://localhost:5173",
    process.env.CLIENT_URL,
    ...(process.env.CORS_ORIGINS ?? "").split(",")
  ]
    .map((origin) => origin?.trim().replace(/\/$/, ""))
    .filter((origin): origin is string => Boolean(origin))
);

// Vercel preview deployments of the frontend project.
const previewOrigin =
  /^https:\/\/career-path-[a-z0-9-]+-den-jansen-flores-projects\.vercel\.app$/;

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (curl, server-to-server) carry no
    // browser credentials, so CORS does not apply to them.
    if (!origin || allowedOrigins.has(origin) || previewOrigin.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }
};

// Vercel sits in front of the app; trust its X-Forwarded-For so rate limits
// see the real client IP instead of the proxy's.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));

// keep /api prefix — ok siya for local and Vercel
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/assessments", assessmentRoutes);
app.use("/tracks", trackRoutes);
app.use("/queries", queryRoutes);
app.use("/announcements", announcementRoutes);
app.use("/admin", adminRoutes);

export default app;
