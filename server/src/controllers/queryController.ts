// server/src/controllers/queryController.ts
import type { Response } from "express";
import { Types, isValidObjectId } from "mongoose";
import Query, { type IQuery } from "../models/Query.js";
import type { AuthRequest } from "../middleware/auth.js";
import { sendQueryAnsweredEmail } from "../utils/mailer.js";

const MAX_LENGTH = { subject: 200, message: 5000, response: 5000 };
const MAX_RESULTS = 500;

interface PopulatedPerson {
  _id: Types.ObjectId;
  fullName?: string;
  studentId?: string | null;
  email?: string;
}

function asPerson(value: unknown): PopulatedPerson | null {
  return value && typeof value === "object" && "fullName" in value
    ? (value as PopulatedPerson)
    : null;
}

// Shape expected by StudentQueries.tsx and AdminQueryManagement.tsx
function mapQueryToDto(q: IQuery) {
  const student = asPerson(q.student);
  const counselor = asPerson(q.counselor);

  return {
    id: String(q._id),
    subject: q.subject,
    message: q.message,
    status: q.status,
    date: q.createdAt.toISOString(),
    response: q.response,
    responseDate: q.responseDate ? q.responseDate.toISOString() : undefined,
    counselor: q.counselor
      ? (counselor?.fullName ?? "School Counselor")
      : undefined,
    userId: String(student?._id ?? q.student),
    studentName: student?.fullName ?? "Unknown student",
    studentId: student?.studentId ?? "",
    studentEmail: student?.email ?? ""
  };
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * POST /queries
 * Student creates a new query
 */
export const createQuery = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can create queries."
      });
    }

    const subject = cleanText(req.body?.subject, MAX_LENGTH.subject);
    const message = cleanText(req.body?.message, MAX_LENGTH.message);

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required."
      });
    }

    const query = await Query.create({
      student: new Types.ObjectId(req.user.id),
      subject,
      message,
      status: "pending"
    });
    await query.populate("student", "fullName studentId email");

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
    const filter: { student?: Types.ObjectId } = {};

    if (role === "student") {
      filter.student = new Types.ObjectId(id);
    } else if (role === "admin") {
      const userId =
        typeof req.query.userId === "string" ? req.query.userId : "";
      if (userId) {
        if (!isValidObjectId(userId)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid student id." });
        }
        filter.student = new Types.ObjectId(userId);
      }
      // else: admin sees all queries
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid role."
      });
    }

    const queries = await Query.find(filter)
      .sort({ createdAt: -1 })
      .limit(MAX_RESULTS)
      .populate("student", "fullName studentId email")
      .populate("counselor", "fullName");

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
 * Admin answers a query. The student gets an email about it.
 */
export const answerQuery = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can answer queries."
      });
    }

    const id = String(req.params.id ?? "");
    const response = cleanText(req.body?.response, MAX_LENGTH.response);

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "Response is required."
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Query not found."
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
    await query.populate([
      { path: "student", select: "fullName studentId email" },
      { path: "counselor", select: "fullName" }
    ]);

    const dto = mapQueryToDto(query);

    // Best effort: the reply is saved even if the email fails. Awaited so a
    // serverless function does not stop before the email goes out.
    let emailSent = false;
    if (dto.studentEmail) {
      try {
        await sendQueryAnsweredEmail(dto.studentEmail, dto.subject);
        emailSent = true;
      } catch (err) {
        console.error("Error sending query answered email:", err);
      }
    }

    return res.json({
      success: true,
      emailSent,
      query: dto
    });
  } catch (err) {
    console.error("answerQuery error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to answer query."
    });
  }
};
