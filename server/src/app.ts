// server/src/app.ts
import express from "express";
import cors, { type CorsOptions } from "cors";
import mongoose from "mongoose";
import { connectDB, requireDb } from "./config/db.js"; // <-- walang .js sa TS
import { securityHeaders } from "./middleware/securityHeaders.js";

import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import assessmentRoutes from "./routes/assessments.js";
import trackRoutes from "./routes/tracks.js";
import queryRoutes from "./routes/queries.js";
import announcementRoutes from "./routes/announcements.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Start connecting early; requests wait for it through requireDb below.
connectDB().catch((err) => console.error("❌ MongoDB Connection Error:", err));

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

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));

// GET /health — uptime checks. Also pings MongoDB so a scheduled call keeps
// the free Atlas cluster from pausing for inactivity.
app.get("/health", async (_req, res) => {
  try {
    await connectDB();
    await mongoose.connection.db?.admin().ping();
    res.json({ success: true, status: "ok", database: "up" });
  } catch {
    res
      .status(503)
      .json({ success: false, status: "degraded", database: "down" });
  }
});

app.use(requireDb);

// keep /api prefix — ok siya for local and Vercel
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/assessments", assessmentRoutes);
app.use("/tracks", trackRoutes);
app.use("/queries", queryRoutes);
app.use("/announcements", announcementRoutes);
app.use("/admin", adminRoutes);

// Unknown routes and unexpected errors still answer in JSON.
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // Malformed JSON bodies from express.json()
    if (err instanceof SyntaxError) {
      res.status(400).json({ success: false, message: "Invalid JSON body" });
      return;
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
);

export default app;
