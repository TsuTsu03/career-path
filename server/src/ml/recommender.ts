// server/src/ml/recommender.ts
//
// Trains the C4.5 decision tree ONCE (at process start) from the labelled
// dataset, measures its holdout accuracy, then exposes helpers that classify a
// student's aptitude profile into an SHS strand. The recommendation is genuinely
// produced by the decision tree, not by a fixed scoring table.

import {
  buildTree,
  predict,
  accuracy,
  countLeaves,
  treeDepth,
  type TreeNode,
  type Features,
  type Example
} from "./c45.js";
import { trainingExamples, FEATURE_ATTRIBUTES } from "../data/trainingData.js";
import type { AptitudeDomain, TrackKey } from "../data/aptitudeQuestions.js";

const ALL_TRACKS: TrackKey[] = ["stem", "abm", "humss", "gas"];
const TREE_OPTIONS = { maxDepth: 6, minSamplesSplit: 8 };

const TRACK_LABEL: Record<TrackKey, string> = {
  stem: "STEM",
  abm: "ABM",
  humss: "HUMSS",
  gas: "GAS"
};

// ---- Deterministic shuffle for a reproducible train/test split ----
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }
  return copy;
}

// ---- Evaluate model accuracy on an 80/20 holdout split ----
function evaluateAccuracy(examples: Example[]): number {
  const data = shuffled(examples, 12345);
  const splitIdx = Math.floor(data.length * 0.8);
  const trainSet = data.slice(0, splitIdx);
  const testSet = data.slice(splitIdx);
  const evalTree = buildTree(trainSet, FEATURE_ATTRIBUTES, TREE_OPTIONS);
  return accuracy(evalTree, testSet);
}

// Production tree is trained on the FULL dataset for best predictions.
const decisionTree: TreeNode = buildTree(
  trainingExamples,
  FEATURE_ATTRIBUTES,
  TREE_OPTIONS
);

const holdoutAccuracy = evaluateAccuracy(trainingExamples);

export interface ModelInfo {
  algorithm: string;
  trainingExamples: number;
  features: string[];
  classes: string[];
  leaves: number;
  depth: number;
  accuracy: number; // 0..1, on a 20% holdout test set
}

const modelInfo: ModelInfo = {
  algorithm: "C4.5 Decision Tree",
  trainingExamples: trainingExamples.length,
  features: FEATURE_ATTRIBUTES.map((a) => a.name),
  classes: ALL_TRACKS.map((t) => TRACK_LABEL[t]),
  leaves: countLeaves(decisionTree),
  depth: treeDepth(decisionTree),
  accuracy: Math.round(holdoutAccuracy * 1000) / 1000
};

// eslint-disable-next-line no-console
console.log(
  `[C4.5] Trained on ${modelInfo.trainingExamples} examples ` +
    `(leaves=${modelInfo.leaves}, depth=${modelInfo.depth}, ` +
    `holdout accuracy=${(modelInfo.accuracy * 100).toFixed(1)}%).`
);

export function getModelInfo(): ModelInfo {
  return modelInfo;
}

export interface TrackScore {
  track: TrackKey;
  score: number; // 0..100 (probability/confidence from the reached leaf)
}

export interface Classification {
  primaryTrack: TrackScore;
  secondaryTrack: TrackScore;
  trackScores: Record<TrackKey, number>;
  decisionPath: string[];
}

/**
 * Classify a student given their per-domain scores using the trained C4.5 tree.
 */
export function classifyStudent(
  domainScores: Record<AptitudeDomain, number>
): Classification {
  const features: Features = { ...domainScores };

  const result = predict(decisionTree, features);

  // Probabilities from the reached leaf -> 0..100 score per track.
  const trackScores: Record<TrackKey, number> = {
    stem: 0,
    abm: 0,
    humss: 0,
    gas: 0
  };
  for (const track of ALL_TRACKS) {
    const p = result.probabilities[track] ?? 0;
    trackScores[track] = Math.round(p * 100);
  }

  // Rank tracks by leaf probability (stable tie-break by ALL_TRACKS order).
  const ranked = [...ALL_TRACKS].sort((a, b) => trackScores[b] - trackScores[a]);

  const primaryKey = result.prediction as TrackKey;
  const primary: TrackScore = {
    track: primaryKey,
    score: trackScores[primaryKey]
  };
  const secondaryTrackKey = ranked.find((t) => t !== primary.track) ?? primary.track;
  const secondary: TrackScore = {
    track: secondaryTrackKey,
    score: trackScores[secondaryTrackKey]
  };

  // Build a human-readable decision path straight from the tree traversal.
  const decisionPath: string[] = [];
  decisionPath.push(
    "Classified using the trained C4.5 decision tree. Path taken from the root:"
  );
  result.path.forEach((step, idx) => {
    decisionPath.push(`Step ${idx + 1}: ${step.test}`);
  });
  decisionPath.push(
    `Reached leaf node → predicted strand: ${TRACK_LABEL[primary.track]} ` +
      `(leaf confidence ${primary.score}%).`
  );
  if (secondary.score > 0 && secondary.track !== primary.track) {
    decisionPath.push(
      `Next most likely strand at this leaf: ${TRACK_LABEL[secondary.track]} ` +
        `(${secondary.score}%).`
    );
  }

  return {
    primaryTrack: primary,
    secondaryTrack: secondary,
    trackScores,
    decisionPath
  };
}
