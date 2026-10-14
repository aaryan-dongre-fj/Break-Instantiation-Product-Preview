import { cookies } from "next/headers";
import { requestCompany } from "./look";
import { CLIENT_SESSION_COOKIE, CLIENT_TOKEN_COOKIE } from "./cookieNames";

const COOKIE_MAX_AGE = 60 * 60 * 12;

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE,
};

// Each company's sessions are scoped to its own path, /<company>, so one
// browser signed in to two companies never sends one company's cookie to
// the other.
async function cookieOptions() {
  const company = await requestCompany();
  return { ...baseCookie, path: company ? `/${company}` : "/" };
}

export type ClientAuth = {
  token: string;
  sessionKey: string;
};

export async function getClientAuth(): Promise<ClientAuth | null> {
  const jar = await cookies();
  const token = jar.get(CLIENT_TOKEN_COOKIE)?.value;
  const sessionKey = jar.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token || !sessionKey) return null;
  return { token, sessionKey };
}

export async function setClientAuth(auth: ClientAuth) {
  const jar = await cookies();
  const options = await cookieOptions();
  jar.set(CLIENT_TOKEN_COOKIE, auth.token, options);
  jar.set(CLIENT_SESSION_COOKIE, auth.sessionKey, options);
}

export async function clearClientAuth() {
  const jar = await cookies();
  const options = await cookieOptions();
  for (const name of [CLIENT_TOKEN_COOKIE, CLIENT_SESSION_COOKIE]) {
    jar.set(name, "", { ...options, maxAge: 0 });
  }
}
