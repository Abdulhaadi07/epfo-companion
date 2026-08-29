import { describe, expect, it } from "vitest";
import { createSessionToken, SESSION_MAX_AGE_SECONDS, verifySessionToken } from "./session-token";

const TEST_SECRET = "test-session-secret";
const USER_ID = "synthetic-user-under_verification";
const NOW = 1_700_000_000;

describe("session token", () => {
  it("accepts a valid signed session", () => {
    const token = createSessionToken(USER_ID, { secret: TEST_SECRET, now: NOW });
    expect(verifySessionToken(token, { secret: TEST_SECRET, now: NOW })).toEqual({ userId: USER_ID });
  });

  it("rejects a tampered payload", () => {
    const token = createSessionToken(USER_ID, { secret: TEST_SECRET, now: NOW });
    const [payloadEncoded, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: "synthetic-user-ready", iat: NOW, exp: NOW + SESSION_MAX_AGE_SECONDS }),
      "utf8",
    ).toString("base64url");

    expect(verifySessionToken(`${tamperedPayload}.${signature}`, { secret: TEST_SECRET, now: NOW })).toBeNull();
    expect(verifySessionToken(`${payloadEncoded}.invalid-signature`, { secret: TEST_SECRET, now: NOW })).toBeNull();
  });

  it("rejects malformed session tokens", () => {
    expect(verifySessionToken("not-a-valid-token", { secret: TEST_SECRET, now: NOW })).toBeNull();
    expect(verifySessionToken(".", { secret: TEST_SECRET, now: NOW })).toBeNull();
    expect(
      verifySessionToken(
        `${Buffer.from(JSON.stringify({ userId: USER_ID }), "utf8").toString("base64url")}.short`,
        { secret: TEST_SECRET, now: NOW },
      ),
    ).toBeNull();
    expect(
      verifySessionToken(
        `${Buffer.from("not-json", "utf8").toString("base64url")}.${createSessionToken(USER_ID, { secret: TEST_SECRET, now: NOW }).split(".")[1]}`,
        { secret: TEST_SECRET, now: NOW },
      ),
    ).toBeNull();
    expect(
      verifySessionToken(
        `${Buffer.from(JSON.stringify({ iat: NOW, exp: NOW + 60 }), "utf8").toString("base64url")}.${createSessionToken(USER_ID, { secret: TEST_SECRET, now: NOW }).split(".")[1]}`,
        { secret: TEST_SECRET, now: NOW },
      ),
    ).toBeNull();
  });

  it("rejects an expired session", () => {
    const token = createSessionToken(USER_ID, { secret: TEST_SECRET, now: NOW, maxAgeSeconds: 60 });
    expect(verifySessionToken(token, { secret: TEST_SECRET, now: NOW + 60 })).toBeNull();
    expect(verifySessionToken(token, { secret: TEST_SECRET, now: NOW + 61 })).toBeNull();
  });
});
