// server/src/utils/security.ts
import crypto from "crypto";
import mongoose from "mongoose";

export const ONE_HOUR_MS = 1000 * 60 * 60;
export const ONE_DAY_MS = ONE_HOUR_MS * 24;

export const PASSWORD_RULES =
  "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.";

export function isStrongPassword(password: string) {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  return isLongEnough && hasLetter && hasUpper && hasNumber && hasSpecial;
}

// Tokens come straight from the request body. Only accept plain strings so a
// body like {"token": {"$ne": ""}} can never reach the query as an operator.
export function isTokenAndId(token: unknown, id: unknown): token is string {
  return (
    typeof token === "string" &&
    /^[a-f0-9]{64}$/.test(token) &&
    typeof id === "string" &&
    mongoose.isValidObjectId(id)
  );
}

export function newToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function cleanName(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}
