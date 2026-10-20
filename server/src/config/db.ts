import mongoose from "mongoose";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";

dotenv.config(); // <-- add this

// Treat request values in query filters as plain values, never as operators
// like $ne or $gt. Queries that need a real operator use mongoose.trusted().
mongoose.set("sanitizeFilter", true);

// One shared connection per process. On Vercel a warm function reuses it
// across requests instead of reconnecting every time.
let connection: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connection) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    connection = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then((m) => {
        console.log("✅ MongoDB Connected Successfully");
        return m;
      })
      .catch((err) => {
        // Let the next request try again instead of crashing the process.
        connection = null;
        throw err;
      });
  }

  return connection;
};

/**
 * Express middleware: makes sure the database is reachable before a route
 * runs. If it is not (for example a paused Atlas cluster), the client gets a
 * clear 503 instead of a timeout or a generic error.
 */
export async function requireDb(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    res.status(503).json({
      success: false,
      message:
        "The database is temporarily unavailable. Please try again in a few minutes."
    });
  }
}
