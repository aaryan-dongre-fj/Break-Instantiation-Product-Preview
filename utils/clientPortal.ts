import type { StaffSession } from "./flowTool";
import { STAFF_API_BASE } from "./flowTool";

export type PortalResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

type RedeemedSession = StaffSession & { email: string };

function readSetCookie(response: Response, name: string): string | null {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const raw =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie") as string]
        : [];

  for (const cookie of raw) {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");
    if (separator > 0 && pair.slice(0, separator).trim() === name) {
      return pair.slice(separator + 1).trim();
    }
  }
  return null;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorDetail(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  return fallback;
}

async function postJson(path: string, body: unknown, cookie?: string, csrf?: string) {
  return fetch(`${STAFF_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: STAFF_API_BASE,
      Referer: `${STAFF_API_BASE}/`,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(csrf ? { "X-CSRFToken": csrf } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

function sessionFrom(response: Response, email: string): PortalResult<RedeemedSession> {
  const session =
    readSetCookie(response, "client_session") ?? readSetCookie(response, "sessionid");
  const csrf =
    readSetCookie(response, "csrftoken") ?? readSetCookie(response, "__Secure-csrftoken");

  if (!session || !csrf) {
    return {
      ok: false,
      status: 502,
      error: "Sign-in succeeded, but the session cookie was missing.",
    };
  }

  return { ok: true, status: response.status, data: { session, csrf, email } };
}

export async function requestMagicLogin(email: string): Promise<PortalResult<{ detail: string }>> {
  let response: Response;
  try {
    response = await postJson("/api/clients/auth/magic-login/request/", { email });
  } catch {
    return {
      ok: false,
      status: 503,
      error: `Couldn't reach ${STAFF_API_BASE}.`,
    };
  }

  const payload = await readBody(response);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: errorDetail(payload, "Couldn't send a sign-in link."),
    };
  }

  const detail =
    payload && typeof payload === "object" && typeof (payload as { detail?: unknown }).detail === "string"
      ? (payload as { detail: string }).detail
      : "If an account exists, a sign-in link has been sent.";

  return { ok: true, status: response.status, data: { detail } };
}

async function redeem(path: string, token: string): Promise<PortalResult<RedeemedSession>> {
  let response: Response;
  try {
    response = await postJson(path, { token });
  } catch {
    return {
      ok: false,
      status: 503,
      error: `Couldn't reach ${STAFF_API_BASE}.`,
    };
  }

  const payload = await readBody(response);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: errorDetail(payload, "This link is invalid or has expired."),
    };
  }

  const email =
    payload && typeof payload === "object" && typeof (payload as { email?: unknown }).email === "string"
      ? (payload as { email: string }).email
      : "";

  return sessionFrom(response, email);
}

export function redeemInvite(token: string) {
  return redeem("/api/clients/auth/invites/redeem/", token);
}

export function redeemMagicLogin(token: string) {
  return redeem("/api/clients/auth/magic-login/redeem/", token);
}

export async function revokeClientSession(staff: StaffSession) {
  try {
    await postJson(
      "/api/clients/auth/logout/",
      {},
      `client_session=${staff.session}; csrftoken=${staff.csrf}`,
      staff.csrf,
    );
  } catch {
    // Local cookies are still cleared by the caller.
  }
}
