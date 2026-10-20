// server/src/middleware/rateLimit.ts
//
// Limits for the public auth endpoints. Students in one school often share a
// single public IP, so login and resend are keyed by IP + email: one person
// guessing passwords gets blocked without locking out the whole classroom.
//
// The default store is in memory. On Vercel each warm function instance keeps
// its own counters, so these limits slow down abuse rather than give an exact
// global count. A shared store (e.g. Redis) would make them exact.
import type { Request } from "express";
import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function ipAndEmailKey(req: Request): string {
  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();
  return `${req.ip ?? "unknown"}:${email}`;
}

const tooMany = (message: string) => ({ success: false, message });

export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: ipAndEmailKey,
  message: tooMany(
    "Too many login attempts. Please wait 15 minutes and try again."
  )
});

// A whole class may register from the same school network.
export const registerLimiter = rateLimit({
  windowMs: ONE_HOUR,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany(
    "Too many accounts created from this network. Please try again later."
  )
});

// Each resend sends a real email, so keep this one tight.
export const resendVerificationLimiter = rateLimit({
  windowMs: ONE_HOUR,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: ipAndEmailKey,
  message: tooMany(
    "Too many verification emails requested. Please try again in an hour."
  )
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: ONE_HOUR,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: ipAndEmailKey,
  message: tooMany(
    "Too many password reset requests. Please try again in an hour."
  )
});

// Runs after requireAuth, so each signed-in user has their own counter.
export const changePasswordLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) =>
    String((req as Request & { user?: { id?: string } }).user?.id ?? req.ip),
  message: tooMany("Too many password attempts. Please wait 15 minutes.")
});

// Email-link endpoints (verify email, password setup and reset).
export const tokenLinkLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany("Too many attempts. Please wait a few minutes.")
});
