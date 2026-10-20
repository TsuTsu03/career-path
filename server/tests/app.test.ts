import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";

let app: Express;

beforeAll(async () => {
  // No database in tests: point at an address that refuses quickly, so
  // routes that need MongoDB answer 503 instead of hanging.
  process.env.MONGO_URI = "mongodb://127.0.0.1:1/test";
  process.env.JWT_SECRET = "test-secret";
  app = (await import("../src/app.js")).default;
});

describe("CORS", () => {
  it("allows the CAREER PATH frontend", async () => {
    const res = await request(app)
      .options("/auth/login")
      .set("Origin", "https://career-path-ecru.vercel.app")
      .set("Access-Control-Request-Method", "POST");
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://career-path-ecru.vercel.app"
    );
  });

  it("does not allow other sites", async () => {
    const res = await request(app)
      .options("/auth/login")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "POST");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  }, 20000);
});

describe("security headers and errors", () => {
  it("sends helmet headers and hides x-powered-by", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  }, 20000);

  it("reports the database as down with 503 when it is unreachable", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(503);
    expect(res.body.database).toBe("down");
  }, 20000);

  it("answers malformed JSON with 400", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(res.status).toBe(400);
  });
});
