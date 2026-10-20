import { describe, expect, it } from "vitest";
import {
  hashToken,
  isStrongPassword,
  isTokenAndId,
  isValidEmail,
  newToken,
  normalizeEmail
} from "../src/utils/security.js";

const VALID_ID = "65b8f3d01aba03047152d42d";

describe("isTokenAndId", () => {
  it("accepts a 64-char hex token and an ObjectId", () => {
    expect(isTokenAndId(newToken(), VALID_ID)).toBe(true);
  });

  it("rejects query operators passed as the token", () => {
    expect(isTokenAndId({ $ne: "" }, VALID_ID)).toBe(false);
    expect(isTokenAndId({ $gt: "" }, VALID_ID)).toBe(false);
  });

  it("rejects malformed tokens and ids", () => {
    expect(isTokenAndId("short", VALID_ID)).toBe(false);
    expect(isTokenAndId(newToken(), "not-an-id")).toBe(false);
    expect(isTokenAndId(newToken(), { $ne: null })).toBe(false);
  });
});

describe("isStrongPassword", () => {
  it("needs length, uppercase, number and symbol", () => {
    expect(isStrongPassword("Abcdef1!")).toBe(true);
    expect(isStrongPassword("abcdef1!")).toBe(false);
    expect(isStrongPassword("Abcdefg!")).toBe(false);
    expect(isStrongPassword("Abcdefg1")).toBe(false);
    expect(isStrongPassword("Ab1!")).toBe(false);
  });
});

describe("email helpers", () => {
  it("normalizes and validates", () => {
    expect(normalizeEmail("  Juan@Example.COM ")).toBe("juan@example.com");
    expect(normalizeEmail({ $ne: "" })).toBe("");
    expect(isValidEmail("juan@example.com")).toBe(true);
    expect(isValidEmail("juan@")).toBe(false);
  });
});

describe("hashToken", () => {
  it("is stable and does not return the token itself", () => {
    const token = newToken();
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });
});
