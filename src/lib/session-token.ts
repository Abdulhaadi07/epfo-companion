import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type SessionPayload = {
  userId: string;
  iat: number;
  exp: number;
};

export type UserSession = {
  userId: string;
};

const sessionPayloadSchema = z.object({
  userId: z.string().trim().min(1),
  iat: z.number().int().nonnegative(),
  exp: z.number().int().positive(),
});

type SessionTokenOptions = {
  secret?: string;
  now?: number;
  maxAgeSeconds?: number;
};

function resolveSessionSecret(secret?: string): string | null {
  const value = secret ?? process.env.AUTH_SESSION_SECRET;
  return value?.trim() ? value : null;
}

function signPayload(payloadEncoded: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadEncoded).digest("base64url");
}

export function createSessionToken(userId: string, options: SessionTokenOptions = {}): string {
  const secret = resolveSessionSecret(options.secret);
  if (!secret) throw new Error("AUTH_SESSION_SECRET is required for session signing.");

  const now = options.now ?? Math.floor(Date.now() / 1000);
  const maxAgeSeconds = options.maxAgeSeconds ?? SESSION_MAX_AGE_SECONDS;
  const payload: SessionPayload = {
    userId,
    iat: now,
    exp: now + maxAgeSeconds,
  };
  const payloadEncoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${payloadEncoded}.${signPayload(payloadEncoded, secret)}`;
}

export function verifySessionToken(token: string, options: SessionTokenOptions = {}): UserSession | null {
  const secret = resolveSessionSecret(options.secret);
  if (!secret) return null;

  const separatorIndex = token.indexOf(".");
  if (separatorIndex <= 0 || separatorIndex === token.length - 1) return null;

  const payloadEncoded = token.slice(0, separatorIndex);
  const providedSignature = token.slice(separatorIndex + 1);
  const expectedSignature = signPayload(payloadEncoded, secret);

  try {
    const providedBuffer = Buffer.from(providedSignature, "base64url");
    const expectedBuffer = Buffer.from(expectedSignature, "base64url");
    if (providedBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payloadEncoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  const result = sessionPayloadSchema.safeParse(parsed);
  if (!result.success) return null;

  const now = options.now ?? Math.floor(Date.now() / 1000);
  if (result.data.exp <= now) return null;

  return { userId: result.data.userId };
}
