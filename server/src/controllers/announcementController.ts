// server/src/controllers/announcementController.ts
import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Announcement, { type IAnnouncement } from "../models/Announcement.js";
import type { AuthRequest } from "../middleware/auth.js";

type AnnouncementCategory = "event" | "deadline" | "general" | "career";

const CATEGORIES: AnnouncementCategory[] = [
  "event",
  "deadline",
  "general",
  "career"
];
const MAX_ANNOUNCEMENTS = 200;

function cleanText(value: unknown, max: number): string | undefined {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

function cleanCategory(value: unknown): AnnouncementCategory | undefined {
  return CATEGORIES.includes(value as AnnouncementCategory)
    ? (value as AnnouncementCategory)
    : undefined;
}

// Shape expected by the frontend (AdminAnnouncements.tsx / Announcements.tsx)
function mapAnnouncementToDto(a: IAnnouncement) {
  return {
    id: (a._id as { toString(): string }).toString(),
    title: a.title,
    content: a.content,
    category: a.category,
    // frontend expects a plain date string (YYYY-MM-DD is fine for display)
    date: a.date ? a.date.toISOString() : new Date().toISOString(),
    author: a.author ?? "Admin",
    important: a.important
  };
}

/**
 * GET /announcements
 * Visible to any authenticated user (students + admin).
 */
export const getAnnouncements = async (_req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find()
      .sort({ important: -1, date: -1, createdAt: -1 })
      .limit(MAX_ANNOUNCEMENTS)
      .exec();

    return res.json({
      success: true,
      announcements: announcements.map(mapAnnouncementToDto)
    });
  } catch (err) {
    console.error("getAnnouncements error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements."
    });
  }
};

/**
 * POST /announcements  (admin only)
 */
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const title = cleanText(req.body?.title, 200);
    const content = cleanText(req.body?.content, 10000);
    const category = cleanCategory(req.body?.category);
    const author = cleanText(req.body?.author, 120);
    const important = req.body?.important;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required."
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category ?? "general",
      author: author || "Admin",
      important: Boolean(important),
      date: new Date()
    });

    return res.status(201).json({
      success: true,
      announcement: mapAnnouncementToDto(announcement)
    });
  } catch (err) {
    console.error("createAnnouncement error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create announcement."
    });
  }
};

/**
 * PATCH /announcements/:id  (admin only)
 */
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id ?? "");
    const title = cleanText(req.body?.title, 200);
    const content = cleanText(req.body?.content, 10000);
    const category = cleanCategory(req.body?.category);
    const author = cleanText(req.body?.author, 120);
    const important = req.body?.important;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found."
      });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found."
      });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category !== undefined) announcement.category = category;
    if (author) announcement.author = author;
    if (important !== undefined) announcement.important = Boolean(important);

    await announcement.save();

    return res.json({
      success: true,
      announcement: mapAnnouncementToDto(announcement)
    });
  } catch (err) {
    console.error("updateAnnouncement error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update announcement."
    });
  }
};

/**
 * DELETE /announcements/:id  (admin only)
 */
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id ?? "");
    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found."
      });
    }

    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found."
      });
    }

    return res.json({
      success: true,
      message: "Announcement deleted."
    });
  } catch (err) {
    console.error("deleteAnnouncement error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement."
    });
  }
};
