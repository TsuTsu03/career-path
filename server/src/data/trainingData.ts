// server/src/data/trainingData.ts
//
// Labelled training dataset used to induce the C4.5 decision tree.
//
// Each record is a student "aptitude profile": the number of correct answers
// per aptitude domain (0..15, since the assessment draws 15 items per domain)
// together with the SHS strand that best fits that profile.
//
// NOTE FOR THE RESEARCHERS:
//   This is a *synthetic seed dataset*, generated deterministically from the
//   domain-to-strand archetypes below so the tree is reproducible on every
//   server start. Realistic noise is added so the classes overlap (as real
//   students would), which is why the model's holdout accuracy is high but not
//   a perfect 100%. Replace this with real labelled student records (e.g.
//   historical NCAE / enrolment data) when available — the C4.5 code in
//   ../ml/c45.ts will train on whatever data is provided here.

import type { Example, AttributeSpec } from "../ml/c45.js";
import type { AptitudeDomain, TrackKey } from "./aptitudeQuestions.js";

export const MAX_DOMAIN_SCORE = 15; // 15 items per domain in the assessment

// The six aptitude domains are the decision-tree features (all numeric).
export const FEATURE_ATTRIBUTES: AttributeSpec[] = [
  { name: "verbal", type: "numeric" },
  { name: "numerical", type: "numeric" },
  { name: "scientific", type: "numeric" },
  { name: "abstract", type: "numeric" },
  { name: "clerical", type: "numeric" },
  { name: "entrepreneurial", type: "numeric" }
];

// Typical domain profile (mean score out of 15) for each strand.
const archetypes: Record<TrackKey, Record<AptitudeDomain, number>> = {
  // STEM: strong logical/quantitative reasoning
  stem: {
    verbal: 7,
    numerical: 12,
    scientific: 12,
    abstract: 11,
    clerical: 6,
    entrepreneurial: 6
  },
  // ABM: strong business / organisational aptitude
  abm: {
    verbal: 7,
    numerical: 11,
    scientific: 6,
    abstract: 7,
    clerical: 12,
    entrepreneurial: 12
  },
  // HUMSS: strong language / communication aptitude
  humss: {
    verbal: 13,
    numerical: 6,
    scientific: 6,
    abstract: 7,
    clerical: 8,
    entrepreneurial: 8
  },
  // GAS: balanced profile, no dominant domain
  gas: {
    verbal: 9,
    numerical: 9,
    scientific: 8,
    abstract: 9,
    clerical: 8,
    entrepreneurial: 9
  }
};

// ---- Deterministic PRNG (mulberry32) so the dataset never changes ----
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

// Approximately-Gaussian noise via the central-limit trick (sum of uniforms).
function noise(rng: () => number, std: number): number {
  const sum = rng() + rng() + rng() + rng() - 2; // mean 0, range ~[-2,2]
  return sum * std;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(MAX_DOMAIN_SCORE, Math.round(value)));
}

const SAMPLES_PER_CLASS = 80;
const NOISE_STD = 2.5; // realistic overlap between strands (avoids unrealistic 100% accuracy)

function generateTrainingData(): Example[] {
  const rng = mulberry32(20240617); // fixed seed -> reproducible tree
  const examples: Example[] = [];
  const tracks = Object.keys(archetypes) as TrackKey[];

  for (const track of tracks) {
    const profile = archetypes[track];
    for (let i = 0; i < SAMPLES_PER_CLASS; i++) {
      const features: Record<string, number> = {};
      for (const domain of Object.keys(profile) as AptitudeDomain[]) {
        features[domain] = clampScore(profile[domain] + noise(rng, NOISE_STD));
      }
      examples.push({ features, label: track });
    }
  }

  return examples;
}

export const trainingExamples: Example[] = generateTrainingData();
