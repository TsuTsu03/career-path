import { randomInt } from "crypto";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../middleware/auth.js";
import {
  aptitudeQuestions,
  type AptitudeDomain,
  type AptitudeQuestion
} from "../data/aptitudeQuestions.js";
import {
  AssessmentResultModel,
  type AnswerReviewItem
} from "../models/AssessmentResults.js";
import { classifyStudent, getModelInfo } from "../ml/recommender.js";
import { MAX_DOMAIN_SCORE } from "../data/trainingData.js";

// request body type coming from frontend
interface SubmittedAnswer {
  questionId: number;
  selectedOptionId: string;
}

interface AptitudeRequestBody {
  answers: SubmittedAnswer[];
  assessmentToken: string;
}

type DomainScores = Record<AptitudeDomain, number>;

const DOMAINS: AptitudeDomain[] = [
  "verbal",
  "numerical",
  "scientific",
  "abstract",
  "clerical",
  "entrepreneurial"
];

// The decision tree was trained on domain scores from 0 to MAX_DOMAIN_SCORE,
// so each assessment draws exactly that many questions per domain.
const QUESTIONS_PER_DOMAIN = MAX_DOMAIN_SCORE;
const SESSION_PURPOSE = "aptitude-assessment";
const SESSION_TTL = "4h";

const questionsById = new Map<number, AptitudeQuestion>(
  aptitudeQuestions.map((q) => [q.id, q])
);

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

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const a = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = a;
  }
  return copy;
}

// What the student sees while answering: no correct answer included.
function toPublicQuestion(q: AptitudeQuestion) {
  return { id: q.id, domain: q.domain, stem: q.stem, options: q.options };
}

// After submission the answer key is no longer secret, so the review can
// carry the question text and choices for display.
function withQuestionText(items: AnswerReviewItem[]) {
  return items.map((item) => {
    const q = questionsById.get(item.questionId);
    return {
      questionId: item.questionId,
      domain: item.domain,
      selectedOptionId: item.selectedOptionId,
      correctOptionId: item.correctOptionId,
      isCorrect: item.isCorrect,
      stem: q?.stem ?? "",
      options: q?.options ?? []
    };
  });
}

/**
 * Reads the signed question set issued by GET /aptitude/questions.
 * Returns the question IDs only if the token is valid and belongs to `userId`.
 */
export function readAssessmentSession(
  token: unknown,
  userId: string
): number[] | null {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof token !== "string") return null;

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    if (
      payload.purpose !== SESSION_PURPOSE ||
      payload.sub !== userId ||
      !Array.isArray(payload.ids)
    ) {
      return null;
    }
    const ids = payload.ids as unknown[];
    return ids.every((id) => typeof id === "number" && questionsById.has(id))
      ? (ids as number[])
      : null;
  } catch {
    return null;
  }
}

export function isValidSubmission(
  answers: unknown[],
  issuedIds: number[]
): answers is SubmittedAnswer[] {
  const issued = new Set(issuedIds);
  const seen = new Set<number>();

  // Exactly the issued questions: none extra, missing, repeated or swapped in,
  // and each answer is either blank or one of that question's real options.
  return (
    answers.length === issued.size &&
    answers.every((a) => {
      if (!a || typeof a !== "object") return false;
      const { questionId, selectedOptionId } = a as Record<string, unknown>;
      if (typeof questionId !== "number" || !issued.has(questionId)) {
        return false;
      }
      if (seen.has(questionId)) return false;
      seen.add(questionId);
      if (typeof selectedOptionId !== "string") return false;
      if (selectedOptionId === "") return true;
      const question = questionsById.get(questionId);
      return question?.options.some((o) => o.id === selectedOptionId) ?? false;
    })
  );
}

/**
 * GET /api/assessments/aptitude/questions
 * Draws QUESTIONS_PER_DOMAIN random questions per domain, without the answer
 * key, plus a signed token that pins this exact set to the student.
 */
export async function getAptitudeQuestions(
  req: AuthRequest,
  res: Response
): Promise<Response> {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: no user in request" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set");
    return res
      .status(500)
      .json({ success: false, message: "Server configuration error" });
  }

  try {
    const existing = await AssessmentResultModel.exists({
      student: req.user.id
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already taken the assessment."
      });
    }

    const selected = shuffle(
      DOMAINS.flatMap((domain) =>
        shuffle(aptitudeQuestions.filter((q) => q.domain === domain)).slice(
          0,
          QUESTIONS_PER_DOMAIN
        )
      )
    );

    const assessmentToken = jwt.sign(
      {
        sub: req.user.id,
        purpose: SESSION_PURPOSE,
        ids: selected.map((q) => q.id)
      },
      secret,
      { expiresIn: SESSION_TTL }
    );

    return res.json({
      success: true,
      questions: selected.map(toPublicQuestion),
      assessmentToken
    });
  } catch (error) {
    console.error("Error preparing assessment questions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load assessment questions"
    });
  }
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

  const issuedIds = readAssessmentSession(body.assessmentToken, req.user.id);
  if (!issuedIds) {
    return res.status(400).json({
      success: false,
      message:
        "Your assessment session is invalid or has expired. Please start the assessment again."
    });
  }

  if (!isValidSubmission(body.answers, issuedIds)) {
    return res.status(400).json({
      success: false,
      message:
        "Submitted answers do not match the issued assessment. Please start again."
    });
  }

  try {
    // Block retake if assessment already exists for this student
    const existingAssessment = await AssessmentResultModel.findOne({
      student: req.user.id
    })
      .lean()
      .exec();

    if (existingAssessment) {
      return res.status(409).json({
        success: false,
        message: "You have already taken the assessment.",
        assessmentId:
          existingAssessment._id?.toString?.() ?? String(existingAssessment._id)
      });
    }

    // 1) Score each answer + compute domain scores (these are the decision-tree
    //    FEATURES). Also keep a per-item review (correct vs wrong).
    const domainScores: DomainScores = createEmptyDomainScores();
    const answersReview: AnswerReviewItem[] = [];

    for (const submitted of body.answers) {
      const question = questionsById.get(submitted.questionId);
      if (!question) continue;

      const isCorrect = submitted.selectedOptionId === question.correctOptionId;

      // +1 point per correct answer sa domain na iyon
      if (isCorrect) {
        domainScores[question.domain] += 1;
      }

      answersReview.push({
        questionId: question.id,
        domain: question.domain,
        selectedOptionId: submitted.selectedOptionId,
        correctOptionId: question.correctOptionId,
        isCorrect
      });
    }

    // Keep every feature inside the range the tree was trained on.
    for (const domain of DOMAINS) {
      domainScores[domain] = Math.min(domainScores[domain], MAX_DOMAIN_SCORE);
    }

    // 2) Classify the student using the trained C4.5 decision tree.
    //    The tree (not a fixed table) decides the recommended strand.
    const classification = classifyStudent(domainScores);
    const primary = classification.primaryTrack;
    const secondary = classification.secondaryTrack;

    // 3) Save result to DB
    const created = await AssessmentResultModel.create({
      student: req.user.id,
      domainScores,
      trackScores: classification.trackScores,
      primaryTrack: primary.track,
      secondaryTrack: secondary.track,
      decisionPath: classification.decisionPath,
      answers: answersReview
    });

    return res.status(201).json({
      primaryTrack: primary,
      secondaryTrack: secondary,
      allScores: classification.trackScores,
      domainScores,
      decisionPath: classification.decisionPath,
      answers: withQuestionText(answersReview),
      model: getModelInfo(),
      assessmentId: created._id.toString()
    });
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already taken the assessment."
      });
    }
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

    const trackScores = latest.trackScores ?? {
      stem: 0,
      abm: 0,
      humss: 0,
      gas: 0
    };

    // Use the stored decision-tree result directly (authoritative).
    return res.json({
      primaryTrack: {
        track: latest.primaryTrack,
        score: trackScores[latest.primaryTrack] ?? 0
      },
      secondaryTrack: {
        track: latest.secondaryTrack,
        score: trackScores[latest.secondaryTrack] ?? 0
      },
      allScores: trackScores,
      domainScores: latest.domainScores,
      decisionPath: latest.decisionPath ?? [],
      answers: withQuestionText(latest.answers ?? []),
      model: getModelInfo(),
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

/**
 * GET /api/assessments/model-info
 * Exposes C4.5 model metadata (algorithm, features, accuracy) for transparency
 * and thesis documentation.
 */
export function getAssessmentModelInfo(_req: Request, res: Response): Response {
  return res.json({ success: true, model: getModelInfo() });
}
