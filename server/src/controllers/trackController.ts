// server/src/controllers/trackController.ts
import type { Response } from "express";
import Track, { type ITrack } from "../models/Tracks.js";
import { AssessmentResultModel } from "../models/AssessmentResults.js";
import { defaultTracks } from "../data/defaultTracks.js";
import type { AuthRequest } from "../middleware/auth.js";

const TRACK_CODES = ["stem", "abm", "humss", "gas"] as const;
type TrackCode = (typeof TRACK_CODES)[number];

function isTrackCode(value: string): value is TrackCode {
  return (TRACK_CODES as readonly string[]).includes(value);
}

// Seeds any missing strand from the default content. Safe to call often:
// existing documents are never overwritten.
export async function ensureDefaultTracks(): Promise<void> {
  await Track.bulkWrite(
    defaultTracks.map((t) => ({
      updateOne: {
        filter: { code: t.code },
        update: { $setOnInsert: { ...t, isActive: true } },
        upsert: true
      }
    }))
  );
}

function toDto(t: ITrack, recommended: number) {
  return {
    id: t.code,
    code: t.code,
    name: t.name,
    fullName: t.fullName ?? "",
    description: t.description ?? "",
    subjects: t.subjects ?? [],
    careers: t.careers ?? [],
    requirements: t.requirements ?? "",
    isActive: t.isActive,
    // Students whose assessment recommends this strand as their first choice.
    recommendedStudents: recommended
  };
}

/**
 * GET /tracks — any signed-in user.
 */
export async function getTracks(_req: AuthRequest, res: Response) {
  try {
    await ensureDefaultTracks();

    const [tracks, counts] = await Promise.all([
      Track.find(),
      AssessmentResultModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$primaryTrack", count: { $sum: 1 } } }
      ])
    ]);

    const countMap = new Map(counts.map((c) => [c._id, c.count]));
    const ordered = TRACK_CODES.map((code) =>
      tracks.find((t) => t.code === code)
    ).filter((t): t is NonNullable<typeof t> => Boolean(t));

    return res.json({
      success: true,
      tracks: ordered.map((t) => toDto(t, countMap.get(t.code) ?? 0))
    });
  } catch (err) {
    console.error("getTracks error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load tracks." });
  }
}

function cleanList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 30);
}

function cleanText(value: unknown, max: number): string | null {
  return typeof value === "string" ? value.trim().slice(0, max) : null;
}

/**
 * PUT /tracks/:code — admin only.
 */
export async function updateTrack(req: AuthRequest, res: Response) {
  try {
    const code = String(req.params.code ?? "").toLowerCase();
    if (!isTrackCode(code)) {
      return res
        .status(404)
        .json({ success: false, message: "Track not found." });
    }

    await ensureDefaultTracks();
    const track = await Track.findOne({ code });
    if (!track) {
      return res
        .status(404)
        .json({ success: false, message: "Track not found." });
    }

    const fullName = cleanText(req.body.fullName, 120);
    const description = cleanText(req.body.description, 2000);
    const requirements = cleanText(req.body.requirements, 500);
    const subjects = cleanList(req.body.subjects);
    const careers = cleanList(req.body.careers);

    if (fullName !== null) track.fullName = fullName;
    if (description !== null) track.description = description;
    if (requirements !== null) track.requirements = requirements;
    if (subjects !== null) track.subjects = subjects;
    if (careers !== null) track.careers = careers;
    if (typeof req.body.isActive === "boolean") {
      track.isActive = req.body.isActive;
    }

    await track.save();

    const recommended = await AssessmentResultModel.countDocuments({
      primaryTrack: code
    });

    return res.json({ success: true, track: toDto(track, recommended) });
  } catch (err) {
    console.error("updateTrack error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update track." });
  }
}
