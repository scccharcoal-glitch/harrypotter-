import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function normalizeEnvValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function getSecretKey() {
  const secret = normalizeEnvValue(process.env.SESSION_SECRET);
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const expectedUsername = normalizeEnvValue(process.env.ADMIN_USERNAME);
  const expectedPassword = normalizeEnvValue(process.env.ADMIN_PASSWORD);

  if (!expectedUsername || !expectedPassword) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD environment variables are not set");
  }

  if (username.trim() !== expectedUsername) {
    return false;
  }

  return password.trim() === expectedPassword;
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS };
