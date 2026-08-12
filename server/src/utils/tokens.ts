import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export type TokenPayload = {
  userId: string;
  role: string; // "CANDIDATE" | "ADMIN" | "ORG_ADMIN" | "RECRUITER"
  accountType: "USER" | "HR"; // which table the id belongs to
};

// Short-lived access token — sent on every request, kept in memory on the
// frontend (NOT localStorage, to reduce XSS token-theft risk).
// The `as jwt.SignOptions` cast is needed because our expiry strings come
// from validated env config (a plain `string`), while @types/jsonwebtoken
// expects a narrower literal type — the runtime value is still validated
// by zod at boot (see config/env.ts), so this is safe.
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

// Long-lived refresh token — stored in an httpOnly, secure, sameSite cookie
// so client-side JS can never read it (mitigates XSS stealing it).
export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  return {
    userId: decoded.userId,
    role: decoded.role,
    accountType: decoded.accountType,
  };
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  return {
    userId: decoded.userId,
    role: decoded.role,
    accountType: decoded.accountType,
  };
}

// We never store the raw refresh token in the DB — only its hash. If the DB
// ever leaks, the tokens themselves aren't directly usable from the dump.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
