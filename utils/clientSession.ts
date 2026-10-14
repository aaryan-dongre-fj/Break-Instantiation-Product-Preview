import { cookies } from "next/headers";
import { CLIENT_SESSION_COOKIE, CLIENT_TOKEN_COOKIE } from "./cookieNames";

const COOKIE_MAX_AGE = 60 * 60 * 12;

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

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
  jar.set(CLIENT_TOKEN_COOKIE, auth.token, baseCookie);
  jar.set(CLIENT_SESSION_COOKIE, auth.sessionKey, baseCookie);
}

export async function clearClientAuth() {
  const jar = await cookies();
  for (const name of [CLIENT_TOKEN_COOKIE, CLIENT_SESSION_COOKIE]) {
    jar.set(name, "", { ...baseCookie, maxAge: 0 });
  }
}
