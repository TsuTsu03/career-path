import { beforeAll, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import {
  isValidSubmission,
  readAssessmentSession
} from "../src/controllers/aptitudeAssessmentController.js";
import { classifyStudent, getModelInfo } from "../src/ml/recommender.js";

const SECRET = "test-secret";
const USER = "65b8f3d01aba03047152d42d";

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
});

function session(ids: number[], overrides: Record<string, unknown> = {}) {
  return jwt.sign(
    { sub: USER, purpose: "aptitude-assessment", ids, ...overrides },
    SECRET,
    { expiresIn: "1h" }
  );
}

describe("readAssessmentSession", () => {
  it("returns the issued ids for the right student", () => {
    expect(readAssessmentSession(session([1, 2, 31]), USER)).toEqual([
      1, 2, 31
    ]);
  });

  it("rejects a token issued to another student", () => {
    expect(
      readAssessmentSession(session([1]), "65b8f3d01aba03047152d400")
    ).toBeNull();
  });

  it("rejects login tokens, tampered tokens and unknown question ids", () => {
    const loginToken = jwt.sign({ id: USER, role: "student" }, SECRET);
    expect(readAssessmentSession(loginToken, USER)).toBeNull();
    expect(readAssessmentSession(session([1]) + "x", USER)).toBeNull();
    expect(readAssessmentSession(session([99999]), USER)).toBeNull();
    expect(readAssessmentSession(undefined, USER)).toBeNull();
  });
});

describe("isValidSubmission", () => {
  const issued = [1, 2, 31];
  const answers = [
    { questionId: 1, selectedOptionId: "b" },
    { questionId: 2, selectedOptionId: "" },
    { questionId: 31, selectedOptionId: "a" }
  ];

  it("accepts exactly the issued questions", () => {
    expect(isValidSubmission(answers, issued)).toBe(true);
  });

  it("rejects missing, extra, repeated and swapped questions", () => {
    expect(isValidSubmission(answers.slice(0, 2), issued)).toBe(false);
    expect(
      isValidSubmission(
        [...answers, { questionId: 3, selectedOptionId: "a" }],
        issued
      )
    ).toBe(false);
    expect(
      isValidSubmission(
        [answers[0], answers[0], answers[2]],
        issued
      )
    ).toBe(false);
    expect(
      isValidSubmission(
        [answers[0], answers[1], { questionId: 32, selectedOptionId: "a" }],
        issued
      )
    ).toBe(false);
  });

  it("rejects options that do not exist and non-string values", () => {
    expect(
      isValidSubmission(
        [answers[0], answers[1], { questionId: 31, selectedOptionId: "z" }],
        issued
      )
    ).toBe(false);
    expect(
      isValidSubmission(
        [answers[0], answers[1], { questionId: 31, selectedOptionId: { $ne: 1 } }],
        issued
      )
    ).toBe(false);
  });
});

describe("C4.5 recommender", () => {
  it("reports a trained model with useful holdout accuracy", () => {
    const info = getModelInfo();
    expect(info.algorithm).toBe("C4.5 Decision Tree");
    expect(info.accuracy).toBeGreaterThan(0.8);
  });

  it("recommends STEM for a strong science and math profile", () => {
    const result = classifyStudent({
      verbal: 7,
      numerical: 14,
      scientific: 14,
      abstract: 13,
      clerical: 6,
      entrepreneurial: 5
    });
    expect(result.primaryTrack.track).toBe("stem");
    expect(result.secondaryTrack.track).not.toBe("stem");
    expect(result.decisionPath.length).toBeGreaterThan(1);
  });
});
