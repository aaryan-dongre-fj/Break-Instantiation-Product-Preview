import { cookies } from "next/headers";
import type { StaffSession } from "./flowTool";
import { CSRF_COOKIE, SESSION_COOKIE, USER_COOKIE } from "./cookieNames";

/**
 * The upstream staff session lives in cookies on this app's own origin so the
 * browser never sees the token value.
 */

const COOKIE_MAX_AGE = 60 * 60 * 12;

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

export async function getStaffSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  const csrf = jar.get(CSRF_COOKIE)?.value;
  if (!session || !csrf) return null;
  return { session, csrf };
}

export async function getStaffEmail(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(USER_COOKIE)?.value ?? null;
}

export async function setStaffSession(staff: StaffSession, email: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, staff.session, baseCookie);
  jar.set(CSRF_COOKIE, staff.csrf, baseCookie);
  // Readable from JS — it only carries the display email, never the session.
  jar.set(USER_COOKIE, email, { ...baseCookie, httpOnly: false });
}

export async function clearStaffSession() {
  const jar = await cookies();
  for (const name of [SESSION_COOKIE, CSRF_COOKIE, USER_COOKIE]) {
    jar.set(name, "", { ...baseCookie, maxAge: 0 });
  }
}
