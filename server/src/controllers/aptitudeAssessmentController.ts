// server/src/controllers/aptitudeAssessmentController.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import {
  aptitudeQuestions,
  type AptitudeDomain,
  type TrackKey
} from "../data/aptitudeQuestions.js";
import { AssessmentResultModel } from "../models/AssessmentResults.js";

// request body type coming from frontend
interface SubmittedAnswer {
  questionId: number;
  selectedOptionId: string;
}

interface AptitudeRequestBody {
  answers: SubmittedAnswer[];
}

type DomainScores = Record<AptitudeDomain, number>;
type TrackScores = Record<TrackKey, number>;

const trackKeys: TrackKey[] = ["stem", "abm", "humss", "gas"];

// Weighting matrix: paano nagma-map yung aptitude domains sa SHS tracks
const domainTrackWeights: Record<AptitudeDomain, TrackScores> = {
  verbal: {
    stem: 1,
    abm: 2,
    humss: 3,
    gas: 2
  },
  numerical: {
    stem: 3,
    abm: 3,
    humss: 1,
    gas: 2
  },
  scientific: {
    stem: 3,
    abm: 2,
    humss: 1,
    gas: 2
  },
  abstract: {
    stem: 3,
    abm: 2,
    humss: 2,
    gas: 2
  },
  clerical: {
    stem: 1,
    abm: 3,
    humss: 1,
    gas: 2
  },
  entrepreneurial: {
    stem: 1,
    abm: 3,
    humss: 2,
    gas: 2
  }
};

function createEmptyDomainScores(): DomainScores {
  return {
    verbal: 0,
    numerical: 0,
    scientific: 0,
    abstract: 0,
    clerical: 0,
    entrepreneurial: 0
  };
}

function createEmptyTrackScores(): TrackScores {
  return {
    stem: 0,
    abm: 0,
    humss: 0,
    gas: 0
  };
}

// POST /api/assessments/aptitude
export async function createAptitudeAssessment(
  req: AuthRequest,
  res: Response
): Promise<Response> {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: no user in request" });
  }

  const body = req.body as AptitudeRequestBody | undefined;

  if (!body || !Array.isArray(body.answers) || body.answers.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Answers are required" });
  }

  // 1) Compute domain scores (parang NCAE-style test per aptitude domain)
  const domainScores: DomainScores = createEmptyDomainScores();

  for (const submitted of body.answers) {
    const question = aptitudeQuestions.find(
      (q) => q.id === submitted.questionId
    );
    if (!question) {
      // ignore unknown question IDs para hindi mag-crash
      continue;
    }

    // Simple rule: +1 point per correct answer sa domain na iyon
    if (submitted.selectedOptionId === question.correctOptionId) {
      domainScores[question.domain] += 1;
    }
  }

  // 2) Convert domain scores -> track scores using the weighting matrix
  const trackScores: TrackScores = createEmptyTrackScores();

  (Object.keys(domainScores) as AptitudeDomain[]).forEach((domain) => {
    const domainScore = domainScores[domain];
    const weights = domainTrackWeights[domain];

    trackKeys.forEach((track) => {
      trackScores[track] += domainScore * weights[track];
    });
  });

  // 3) Rank tracks by score
  const sortedTracks = (Object.entries(trackScores) as [TrackKey, number][])
    .sort(([, a], [, b]) => b - a)
    .map(([track, score]) => ({ track, score }));

  const primary = sortedTracks[0];

  if (!primary) {
    return res.status(400).json({
      success: false,
      message: "Unable to compute track scores from given answers"
    });
  }

  const secondary = sortedTracks[1] ?? primary;

  // 4) Generate explanation / decision path
  const decisionPath: string[] = [];

  decisionPath.push(
    `Highest aptitude scores observed in domains: ${getTopDomains(
      domainScores
    ).join(", ")}.`
  );
  decisionPath.push(
    `Track scores – STEM: ${trackScores.stem}, ABM: ${trackScores.abm}, HUMSS: ${trackScores.humss}, GAS: ${trackScores.gas}.`
  );

  if (primary.track === "stem") {
    decisionPath.push(
      "STEM is recommended because you showed strong performance in numerical, scientific, and abstract reasoning domains."
    );
  } else if (primary.track === "abm") {
    decisionPath.push(
      "ABM is recommended because you performed well in numerical, clerical, and entrepreneurial domains related to business and management."
    );
  } else if (primary.track === "humss") {
    decisionPath.push(
      "HUMSS is recommended because of your strengths in verbal, social, and communication-related domains."
    );
  } else {
    decisionPath.push(
      "GAS is recommended as a flexible track because your aptitude profile is balanced across multiple domains."
    );
  }

  try {
    // 5) Save result to DB
    const created = await AssessmentResultModel.create({
      student: req.user.id,
      domainScores,
      trackScores,
      primaryTrack: primary.track,
      secondaryTrack: secondary.track,
      decisionPath
    });

    return res.status(201).json({
      primaryTrack: primary,
      secondaryTrack: secondary,
      allScores: trackScores,
      domainScores,
      decisionPath,
      assessmentId: created._id.toString()
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error saving assessment result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save assessment result"
    });
  }
}

/**
 * GET /api/assessments/aptitude/latest
 * Used by TrackRecommendations.tsx to fetch the latest stored result
 */
export async function getLatestAptitudeAssessment(
  req: AuthRequest,
  res: Response
): Promise<Response> {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: no user in request" });
  }

  try {
    // hanapin yung pinakahuling assessment ng current student
    const latest = await AssessmentResultModel.findOne({
      student: req.user.id
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "No assessment result found for this student"
      });
    }

    // trackScores stored sa DB (same shape as TrackScores)
    const trackScores: TrackScores =
      latest.trackScores ?? createEmptyTrackScores();

    // Re-rank tracks based on stored scores
    const sortedTracks = (Object.entries(trackScores) as [TrackKey, number][])
      .sort(([, a], [, b]) => b - a)
      .map(([track, score]) => ({ track, score }));

    const primary = sortedTracks[0];
    const secondary = sortedTracks[1] ?? primary;

    if (!primary) {
      return res.status(400).json({
        success: false,
        message: "Could not compute primary track from stored scores"
      });
    }

    return res.json({
      primaryTrack: primary,
      secondaryTrack: secondary,
      allScores: trackScores,
      // optional extra data – safe lang kahit di ginagamit ng frontend
      domainScores: latest.domainScores,
      decisionPath: latest.decisionPath ?? [],
      assessmentId: latest._id?.toString?.() ?? String(latest._id)
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching latest assessment result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load latest assessment result"
    });
  }
}

// Helper: kunin top 2–3 domains for explanation
function getTopDomains(domainScores: DomainScores): AptitudeDomain[] {
  const sorted = (Object.entries(domainScores) as [AptitudeDomain, number][])
    .sort(([, a], [, b]) => b - a)
    .map(([domain]) => domain);

  return sorted.slice(0, 3);
}
