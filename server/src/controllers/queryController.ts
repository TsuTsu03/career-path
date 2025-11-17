// server/src/controllers/queryController.ts
import type { Request, Response } from "express";
import { Types } from "mongoose";
import Query, { type IQuery } from "../models/Query.js";
import type { AuthRequest } from "../middleware/auth.js";

// Shape expected by the frontend StudentQueries.tsx
function mapQueryToDto(q: IQuery) {
  return {
    id: q.id, // from toJSON transform
    subject: q.subject,
    message: q.message,
    status: q.status,
    date: q.createdAt.toISOString(),
    response: q.response,
    responseDate: q.responseDate ? q.responseDate.toISOString() : undefined,
    // For now simple label; later pwede mong i-populate actual admin name
    counselor: q.counselor ? "School Admin" : undefined,
    userId: q.student.toString()
  };
}

/**
 * POST /queries
 * Student creates a new query
 */
export const createQuery = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message } = req.body as {
      subject?: string;
      message?: string;
    };

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required."
      });
    }

    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can create queries."
      });
    }

    const query = await Query.create({
      student: new Types.ObjectId(req.user.id),
      subject,
      message,
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      query: mapQueryToDto(query)
    });
  } catch (err) {
    console.error("createQuery error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit query."
    });
  }
};

/**
 * GET /queries
 * - student: only own queries
 * - admin: all queries or filtered by ?userId=
 */
export const getQueries = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { role, id } = req.user;

    const filter: any = {};

    if (role === "student") {
      filter.student = new Types.ObjectId(id);
    } else if (role === "admin") {
      const userId = (req.query.userId as string) || "";
      if (userId) {
        filter.student = new Types.ObjectId(userId);
      }
      // else: admin sees all queries
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid role."
      });
    }

    const queries = await Query.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      queries: queries.map(mapQueryToDto)
    });
  } catch (err) {
    console.error("getQueries error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch queries."
    });
  }
};

/**
 * PATCH /queries/:id/reply
 * Admin answers a query
 */
export const answerQuery = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can answer queries."
      });
    }

    const { id } = req.params;
    const { response } = req.body as { response?: string };

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "Response is required."
      });
    }

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found."
      });
    }

    query.response = response;
    query.responseDate = new Date();
    query.status = "answered";
    query.counselor = new Types.ObjectId(req.user.id);

    await query.save();

    return res.json({
      success: true,
      query: mapQueryToDto(query)
    });
  } catch (err) {
    console.error("answerQuery error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to answer query."
    });
  }
};
