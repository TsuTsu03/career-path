// server/src/controllers/adminStatsController.ts
import type { Request, Response } from "express";
import User from "../models/User.js";
import Query from "../models/Query.js";
import Track from "../models/Tracks.js";
import type { AuthRequest } from "../middleware/auth.js";
import { AssessmentResultModel } from "../models/AssessmentResults.js";

export async function getAdminStats(req: AuthRequest, res: Response) {
  try {
    // optional safety: make sure admin talaga
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: admin only" });
    }

    const [totalStudents, pendingQueries, activeTracks, completedAssessments] =
      await Promise.all([
        // lahat ng users na role === "student"
        User.countDocuments({ role: "student" }),
        // adjust kung iba field mo for pending
        Query.countDocuments({ status: "pending" }),
        // kung may isActive field, pwede gawing { isActive: true }
        Track.countDocuments({}),
        AssessmentResultModel.countDocuments({})
      ]);

    return res.json({
      success: true,
      totalStudents,
      pendingQueries,
      activeTracks,
      completedAssessments
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch admin stats" });
  }
}
