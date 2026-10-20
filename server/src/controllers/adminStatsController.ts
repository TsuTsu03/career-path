// server/src/controllers/adminStatsController.ts
import type { Response } from "express";
import { isValidObjectId } from "mongoose";
import User from "../models/User.js";
import Query from "../models/Query.js";
import Track from "../models/Tracks.js";
import type { AuthRequest } from "../middleware/auth.js";
import { AssessmentResultModel } from "../models/AssessmentResults.js";
import { ensureDefaultTracks } from "./trackController.js";
import { sendAdminSetupEmail } from "../utils/mailer.js";
import { ONE_DAY_MS, newToken } from "../utils/security.js";

/**
 * GET /admin/stats
 * Dashboard counters plus the strand distribution of assessment results.
 */
export async function getAdminStats(_req: AuthRequest, res: Response) {
  try {
    await ensureDefaultTracks();

    const [
      totalStudents,
      pendingQueries,
      activeTracks,
      completedAssessments,
      distribution
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Query.countDocuments({ status: "pending" }),
      Track.countDocuments({ isActive: true }),
      AssessmentResultModel.countDocuments({}),
      AssessmentResultModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$primaryTrack", count: { $sum: 1 } } }
      ])
    ]);

    const strandDistribution = { stem: 0, abm: 0, humss: 0, gas: 0 };
    for (const row of distribution) {
      if (row._id in strandDistribution) {
        strandDistribution[row._id as keyof typeof strandDistribution] =
          row.count;
      }
    }

    return res.json({
      success: true,
      totalStudents,
      pendingQueries,
      activeTracks,
      completedAssessments,
      strandDistribution
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch admin stats" });
  }
}

interface ActivityItem {
  type: "registered" | "assessment" | "query" | "answered";
  action: string;
  user: string;
  date: Date;
}

/**
 * GET /admin/activity
 * The latest real events: new students, finished assessments, new and
 * answered queries.
 */
export async function getRecentActivity(_req: AuthRequest, res: Response) {
  try {
    const LIMIT = 8;

    const [students, results, queries, answered] = await Promise.all([
      User.find({ role: "student" })
        .select("fullName createdAt")
        .sort({ createdAt: -1 })
        .limit(LIMIT)
        .lean(),
      AssessmentResultModel.find()
        .select("student primaryTrack createdAt")
        .sort({ createdAt: -1 })
        .limit(LIMIT)
        .populate<{ student: { fullName?: string } | null }>(
          "student",
          "fullName"
        )
        .lean(),
      Query.find()
        .select("student subject createdAt")
        .sort({ createdAt: -1 })
        .limit(LIMIT)
        .populate<{ student: { fullName?: string } | null }>(
          "student",
          "fullName"
        )
        .lean(),
      Query.find({ status: "answered" })
        .select("student subject responseDate")
        .sort({ responseDate: -1 })
        .limit(LIMIT)
        .populate<{ student: { fullName?: string } | null }>(
          "student",
          "fullName"
        )
        .lean()
    ]);

    const items: ActivityItem[] = [
      ...students.map((s) => ({
        type: "registered" as const,
        action: "New student registered",
        user: s.fullName,
        date: s.createdAt ?? new Date(0)
      })),
      ...results.map((r) => ({
        type: "assessment" as const,
        action: `Assessment completed (${String(r.primaryTrack).toUpperCase()})`,
        user: r.student?.fullName ?? "Unknown student",
        date: r.createdAt
      })),
      ...queries.map((q) => ({
        type: "query" as const,
        action: `New query: ${q.subject}`,
        user: q.student?.fullName ?? "Unknown student",
        date: q.createdAt
      })),
      ...answered
        .filter((q) => q.responseDate)
        .map((q) => ({
          type: "answered" as const,
          action: `Query answered: ${q.subject}`,
          user: q.student?.fullName ?? "Unknown student",
          date: q.responseDate as Date
        }))
    ];

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({
      success: true,
      activities: items.slice(0, LIMIT).map((item) => ({
        ...item,
        date: new Date(item.date).toISOString()
      }))
    });
  } catch (error) {
    console.error("getRecentActivity error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load recent activity" });
  }
}

/**
 * GET /admin/admins
 * All admin accounts, including ones still waiting to set a password.
 */
export async function listAdmins(_req: AuthRequest, res: Response) {
  try {
    const admins = await User.find({ role: "admin" })
      .select("fullName email createdAt password passwordSetupTokenExpires")
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      success: true,
      admins: admins.map((a) => ({
        id: String(a._id),
        fullName: a.fullName,
        email: a.email,
        createdAt: a.createdAt ?? null,
        pendingSetup: !a.password,
        setupLinkExpired:
          !a.password &&
          (!a.passwordSetupTokenExpires ||
            a.passwordSetupTokenExpires.getTime() < Date.now())
      }))
    });
  } catch (error) {
    console.error("listAdmins error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load admins" });
  }
}

/**
 * POST /admin/admins/:id/resend-setup
 * Issues a fresh 24-hour password setup link for an admin who has not set
 * a password yet.
 */
export async function resendAdminSetup(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id ?? "");
    if (!isValidObjectId(id)) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found." });
    }

    const admin = await User.findOne({ _id: id, role: "admin" });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found." });
    }
    if (admin.password) {
      return res.status(400).json({
        success: false,
        message: "This admin has already set a password."
      });
    }

    const token = newToken();
    admin.passwordSetupToken = token;
    admin.passwordSetupTokenExpires = new Date(Date.now() + ONE_DAY_MS);
    await admin.save();

    await sendAdminSetupEmail(admin.email, token, String(admin._id));

    return res.json({ success: true, message: "Setup link sent." });
  } catch (error) {
    console.error("resendAdminSetup error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send setup link." });
  }
}
