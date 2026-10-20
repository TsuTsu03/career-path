// server/src/middleware/securityHeaders.ts
//
// Basic security headers for a JSON API (the same defaults helmet sets that
// matter here). Written by hand because helmet's default export does not
// type-check under Vercel's TypeScript build.
import type { NextFunction, Request, Response } from "express";

export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'"
  );
  next();
}
