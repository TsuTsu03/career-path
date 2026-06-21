// server/src/controllers/announcementController.ts
import type { Request, Response } from "express";
import Announcement, { type IAnnouncement } from "../models/Announcement.js";
import type { AuthRequest } from "../middleware/auth.js";

type AnnouncementCategory = "event" | "deadline" | "general" | "career";

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
    const { title, content, category, author, important } = req.body as {
      title?: string;
      content?: string;
      category?: AnnouncementCategory;
      author?: string;
      important?: boolean;
    };

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
      author: author ?? "Admin",
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
    const { id } = req.params;
    const { title, content, category, author, important } = req.body as {
      title?: string;
      content?: string;
      category?: AnnouncementCategory;
      author?: string;
      important?: boolean;
    };

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found."
      });
    }

    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (category !== undefined) announcement.category = category;
    if (author !== undefined) announcement.author = author;
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
    const { id } = req.params;

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
