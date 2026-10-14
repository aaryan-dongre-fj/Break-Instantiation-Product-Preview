import { headers } from "next/headers";

import type { StaffSession } from "./flowTool";
import { apiBaseUrl, portalOriginFor } from "./instance";
import { companyApiOrigin, requestCompanyHeaders } from "./look";

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

async function apiBase() {
  try {
    const host = (await headers()).get("host");
    return companyApiOrigin(host) ?? apiBaseUrl();
  } catch {
    return apiBaseUrl();
  }
}

async function portalOrigin() {
  try {
    const host = (await headers()).get("host");
    return portalOriginFor(host);
  } catch {
    return portalOriginFor(null);
  }
}

async function postJson(path: string, body: unknown, cookie?: string, csrf?: string) {
  const base = await apiBase();
  const origin = await portalOrigin();
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      ...(await requestCompanyHeaders()),
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: origin,
      Referer: `${origin}/`,
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
      error: "Couldn't reach the company API.",
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
      error: "Couldn't reach the company API.",
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

async function authed(
  path: string,
  staff: StaffSession,
  method: "GET" | "POST" = "GET",
): Promise<PortalResult<unknown>> {
  const base = await apiBase();
  const origin = await portalOrigin();
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(await requestCompanyHeaders()),
        Accept: "application/json",
        "Content-Type": "application/json",
        Origin: origin,
        Referer: `${origin}/`,
        Cookie: `client_session=${staff.session}; csrftoken=${staff.csrf}`,
        "X-CSRFToken": staff.csrf,
      },
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 503, error: "Couldn't reach the company API." };
  }

  const payload = await readBody(response);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: errorDetail(payload, `The API returned ${response.status}.`),
    };
  }
  return { ok: true, status: response.status, data: payload };
}

export type ConsentState =
  | { state: "granted" }
  | { state: "missing" }
  | { state: "error"; error: string };

/** `404` means the client still has to grant consent. */
export async function getConsentState(staff: StaffSession): Promise<ConsentState> {
  const result = await authed("/api/portal/assessment/consent/", staff);
  if (result.ok) return { state: "granted" };
  if (result.status === 404) return { state: "missing" };
  return { state: "error", error: result.error };
}

export type ConsentTemplate = { id: string; version: string; text: string };

export async function getConsentTemplate(
  staff: StaffSession,
): Promise<PortalResult<ConsentTemplate>> {
  const result = await authed("/api/portal/assessment/consent/template/", staff);
  if (!result.ok) {
    if (result.status === 404) {
      return {
        ok: false,
        status: 404,
        error: "Consent wording hasn't been published yet.",
      };
    }
    return result;
  }
  const data = result.data as Partial<ConsentTemplate> | null;
  if (!data || typeof data.text !== "string" || !data.text.trim()) {
    return { ok: false, status: 502, error: "Consent wording came back empty." };
  }
  return {
    ok: true,
    status: result.status,
    data: {
      id: String(data.id ?? ""),
      version: String(data.version ?? ""),
      text: data.text,
    },
  };
}

export function grantConsent(staff: StaffSession) {
  return authed("/api/portal/assessment/consent/", staff, "POST");
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
