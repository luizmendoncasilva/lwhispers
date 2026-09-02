import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "lw_session";

function sessionValue(): string {
  const secret = process.env.APP_PASSWORD || "";
  return createHmac("sha256", secret).update("lwhispers-session").digest("hex");
}

export function checkPassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return false;
  return password === expected;
}

export function makeSessionCookieValue(): string {
  return sessionValue();
}

export function isValidSessionCookie(value: string | undefined): boolean {
  if (!value) return false;
  const expected = sessionValue();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
