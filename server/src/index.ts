import express from "express";
import cors from "cors";
import "./config/db.js";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import assessmentRoutes from "./routes/assessments.js";
import trackRoutes from "./routes/tracks.js";
import queryRoutes from "./routes/queries.js";
import announcementRoutes from "./routes/announcements.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/assessments", assessmentRoutes);
app.use("/tracks", trackRoutes);
app.use("/queries", queryRoutes);
app.use("/announcements", announcementRoutes);

app.listen(process.env.PORT || 9007, () => {
  console.log("Server listening...");
});
