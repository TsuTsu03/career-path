import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import {
  aptitudeQuestions,
  type AptitudeDomain
} from "../data/aptitudeQuestions.js";
import {
  AssessmentResultModel,
  type AnswerReviewItem
} from "../models/AssessmentResults.js";
import { classifyStudent, getModelInfo } from "../ml/recommender.js";

// request body type coming from frontend
interface SubmittedAnswer {
  questionId: number;
  selectedOptionId: string;
}

interface AptitudeRequestBody {
  answers: SubmittedAnswer[];
}

type DomainScores = Record<AptitudeDomain, number>;

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
      const question = aptitudeQuestions.find(
        (q) => q.id === submitted.questionId
      );

      if (!question) {
        // ignore unknown question IDs para hindi mag-crash
        continue;
      }

      const isCorrect = submitted.selectedOptionId === question.correctOptionId;

      // +1 point per correct answer sa domain na iyon
      if (isCorrect) {
        domainScores[question.domain] += 1;
      }

      answersReview.push({
        questionId: question.id,
        domain: question.domain,
        selectedOptionId: submitted.selectedOptionId ?? "",
        correctOptionId: question.correctOptionId,
        isCorrect
      });
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
      answers: answersReview,
      model: getModelInfo(),
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
      answers: latest.answers ?? [],
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
