/**
 * Server-side client for the staff flow-tool preview API.
 *
 * Every call in here runs on the Next server, never in the browser: the staff
 * session is an HttpOnly cookie on the API's domain, and this app's origin is
 * not in the API's CORS/CSRF allow-list, so proxying is what makes the app
 * work from localhost and from wherever it gets deployed.
 * See FLOW_TOOL_PREVIEW_API.md.
 */

import { apiBaseUrl, portalOrigin } from "./instance";
import { requestApiBase } from "./look";

export function staffApiBase() {
  return apiBaseUrl();
}

const FLOW_TOOL_PREFIX = "/api/staff/flow-tool";

// Cookie names as set by the API (§1). The `__Secure-` prefix is deliberate
// upstream; we never set these on our own origin, we only echo them back.
const UPSTREAM_SESSION_COOKIE = "client_session";
const UPSTREAM_CSRF_COOKIE = "csrftoken";

export type StaffSession = {
  session: string;
  csrf: string;
};

export type FlowToolProduct = {
  id: string;
  name: string;
  code: string;
  is_default: boolean;
  active_version_id: string | null;
};

export type PreviewOption = {
  id: string;
  code: string;
  label: string;
  display_order: number;
};

export type PreviewSection = {
  id: string;
  code: string;
  name: string;
  description: string;
  display_order: number;
};

export type PreviewQuestion = {
  id: string;
  code: string;
  prompt: string;
  subtext: string;
  answer_type: string;
  is_required: boolean;
  display_order: number;
  section: PreviewSection;
  archived_at: string | null;
  options: PreviewOption[];
};

export type PreviewAnswer = {
  question_id: string;
  option_ids: string[];
};

export type PreviewState = {
  next_questions: PreviewQuestion[];
  is_new_section: boolean;
  is_complete: boolean;
  answered_count: number;
  total_count: number;
};

export type UpstreamResult<T> =
  | { ok: true; status: number; data: T; previewToken?: string | null }
  | { ok: false; status: number; error: string; data?: unknown };

/** Pull one cookie value out of a fetch response's Set-Cookie headers. */
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

function errorDetail(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const detail = record.detail ?? record.error ?? record.message;
    return typeof detail === "string" && detail.trim() ? detail : null;
  }
  return typeof payload === "string" && payload.trim() ? payload : null;
}

/** Turn an upstream failure into something worth showing a staff user. */
function describeError(status: number, payload: unknown): string {
  const detail = errorDetail(payload);

  switch (status) {
    case 400:
      return "The answers sent no longer match this version — it was probably republished mid-walk. Restart the preview.";
    case 401:
      return "Your session has expired. Sign in again.";
    case 403:
      return "This account can't open questionnaires yet.";
    case 404:
      return "That version no longer exists. It may have been rolled back or republished — go back and pick the product again.";
    case 409:
      return "The published version's question graph is broken (a cycle, or an edge pointing at a deleted question). This shouldn't be possible on a published version — flag it to the backend team.";
    default:
      return typeof detail === "string"
        ? detail
        : `The flow-tool API returned ${status}.`;
  }
}

/**
 * Log in with a staff account and capture the session + CSRF cookie values.
 * The login POST itself needs no CSRF header — there is no token yet (§1).
 */
export async function staffLogin(
  email: string,
  password: string,
): Promise<UpstreamResult<StaffSession>> {
  const base = await requestApiBase();
  const origin = portalOrigin();
  let response: Response;
  try {
    response = await fetch(`${base}/api/staff/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
        Referer: `${origin}/`,
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 503,
      error: `Couldn't reach ${base}. Check the host and your connection.`,
    };
  }

  const payload = await readBody(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        response.status === 400 || response.status === 401
          ? "Wrong email or password."
          : describeError(response.status, payload),
    };
  }

  const session =
    readSetCookie(response, UPSTREAM_SESSION_COOKIE) ??
    readSetCookie(response, "sessionid") ??
    readSetCookie(response, "staff_session");
  const csrf =
    readSetCookie(response, UPSTREAM_CSRF_COOKIE) ??
    readSetCookie(response, "__Secure-csrftoken");

  if (!session || !csrf) {
    return {
      ok: false,
      status: 502,
      error:
        "Login succeeded but the API didn't return both the session and CSRF cookies.",
    };
  }

  return { ok: true, status: response.status, data: { session, csrf } };
}

/** Result-endpoint failures. Prefer the API's own `error` / `detail` string. */
function describeResultError(status: number, payload: unknown): string {
  const detail = errorDetail(payload);
  switch (status) {
    case 400:
      return detail || "Preview token is missing, invalid, or older than an hour.";
    case 403:
      return detail || "Not signed in, or this account can't view results.";
    case 404:
      return detail || "This product isn't supported for results yet.";
    case 502:
      return detail || "The results service is down.";
    case 503:
      return detail || "Preview results aren't configured on this environment.";
    default:
      return detail || `The results API returned ${status}.`;
  }
}

/** Call a flow-tool endpoint as the logged-in staff user. */
async function staffRequest<T>(
  path: string,
  staff: StaffSession,
  init: {
    method?: "GET" | "POST";
    body?: unknown;
    headers?: Record<string, string>;
    timeoutMs?: number;
    errorMode?: "walk" | "result";
  } = {},
): Promise<UpstreamResult<T>> {
  const method = init.method ?? "GET";
  const base = await requestApiBase();
  const origin = portalOrigin();

  let response: Response;
  try {
    response = await fetch(`${base}${FLOW_TOOL_PREFIX}/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // POSTs need this. GETs ignore it. Same cookies as preview/.
        "X-CSRFToken": staff.csrf,
        Cookie: `${UPSTREAM_SESSION_COOKIE}=${staff.session}; ${UPSTREAM_CSRF_COOKIE}=${staff.csrf}`,
        Origin: origin,
        Referer: `${origin}/`,
        ...init.headers,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: init.timeoutMs ? AbortSignal.timeout(init.timeoutMs) : undefined,
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      return {
        ok: false,
        status: 504,
        error: "Scoring took longer than 95 seconds. Try again.",
      };
    }
    return {
      ok: false,
      status: 503,
      error: `Couldn't reach ${base}. Check the host and your connection.`,
    };
  }

  const payload = await readBody(response);
  const previewToken = response.headers.get("X-Preview-Token");

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        init.errorMode === "result"
          ? describeResultError(response.status, payload)
          : describeError(response.status, payload),
      data: payload,
    };
  }

  return { ok: true, status: response.status, data: payload as T, previewToken };
}

/** Every questionnaire product, with the version served to respondents today. */
export async function getProducts(
  staff: StaffSession,
): Promise<UpstreamResult<FlowToolProduct[]>> {
  const result = await staffRequest<FlowToolProduct[]>("products/", staff);
  if (!result.ok && result.status === 404) {
    return {
      ok: false,
      status: 404,
      error: "Questionnaire products aren't available on this environment yet.",
    };
  }
  return result;
}

/** Version row fields used to walk `questionnaire_spawned_from_version`. */
export type FlowToolVersionRef = {
  id: string;
  questionnaire: string;
  questionnaire_name: string;
  questionnaire_spawned_from_version: string | null;
};

/**
 * Every version. Unpaginated. Includes the hidden `code="break"` questionnaire
 * that `products/` leaves out, so a spawned child can still be traced to it.
 */
export async function getVersions(
  staff: StaffSession,
): Promise<UpstreamResult<FlowToolVersionRef[]>> {
  const result = await staffRequest<unknown>("versions/", staff);
  if (!result.ok) return result;
  const data = result.data;
  const list = Array.isArray(data)
    ? data
    : data &&
        typeof data === "object" &&
        Array.isArray((data as { results?: unknown }).results)
      ? (data as { results: FlowToolVersionRef[] }).results
      : null;
  if (!list) {
    return {
      ok: false,
      status: 502,
      error: "Versions list was not an array.",
    };
  }
  return { ok: true, status: result.status, data: list as FlowToolVersionRef[] };
}

/**
 * Walk a published version. Stateless — the full answer list is replayed from
 * the entry point on every call, so the caller owns the answers so far (§3).
 */
export function walkVersion(
  staff: StaffSession,
  versionId: string,
  answers: PreviewAnswer[],
): Promise<UpstreamResult<PreviewState>> {
  return staffRequest<PreviewState>(
    `versions/${encodeURIComponent(versionId)}/preview/`,
    staff,
    { method: "POST", body: { answers } },
  );
}

const RESULT_PREFIX = (versionId: string) =>
  `versions/${encodeURIComponent(versionId)}/preview/result`;

/** First score after a backend restart can take ~45s. Do not retry this call. */
const GENERATE_REPORT_TIMEOUT_MS = 95_000;

export type PreviewResultBundle = {
  previewToken: string;
  summary: unknown;
  report: unknown | null;
  reportStatus: number;
  timeline: unknown;
  reportPage: unknown;
};

function resultPath(versionId: string, leaf: string) {
  return `${RESULT_PREFIX(versionId)}/${leaf}`;
}

function previewTokenHeader(token: string): Record<string, string> {
  return { "X-Preview-Token": token };
}

/**
 * Score a finished walk. Same `{ answers }` body as `preview/`.
 * Call once when `is_complete` is true. Call again only if the answers change,
 * or when a later call says the preview token expired. Do not retry a slow call.
 */
export function generatePreviewReport(
  staff: StaffSession,
  versionId: string,
  answers: PreviewAnswer[],
): Promise<UpstreamResult<unknown>> {
  return staffRequest<unknown>(
    resultPath(versionId, "generate-report/"),
    staff,
    {
      method: "POST",
      body: { answers },
      timeoutMs: GENERATE_REPORT_TIMEOUT_MS,
      errorMode: "result",
    },
  );
}

export function getPreviewReport(
  staff: StaffSession,
  versionId: string,
  previewToken: string,
): Promise<UpstreamResult<unknown>> {
  return staffRequest<unknown>(resultPath(versionId, "report/"), staff, {
    headers: previewTokenHeader(previewToken),
    errorMode: "result",
  });
}

export function getPreviewTimeline(
  staff: StaffSession,
  versionId: string,
  previewToken: string,
): Promise<UpstreamResult<unknown>> {
  return staffRequest<unknown>(resultPath(versionId, "timeline-profile/"), staff, {
    headers: previewTokenHeader(previewToken),
    errorMode: "result",
  });
}

export function getPreviewReportPage(
  staff: StaffSession,
  versionId: string,
): Promise<UpstreamResult<unknown>> {
  return staffRequest<unknown>(resultPath(versionId, "report-page/"), staff, {
    errorMode: "result",
  });
}

export function refreshPreviewMuxUrls(
  staff: StaffSession,
  versionId: string,
  playbackIds: string[],
): Promise<UpstreamResult<Record<string, { playback_url: string; thumbnail_gif_url: string }>>> {
  return staffRequest<Record<string, { playback_url: string; thumbnail_gif_url: string }>>(
    resultPath(versionId, "mux-signed-urls/"),
    staff,
    {
      method: "POST",
      body: { playback_ids: playbackIds, exp_min: 60 },
      errorMode: "result",
    },
  );
}

function isMissingBehaviorProfile(result: UpstreamResult<unknown>): boolean {
  if (result.ok || result.status !== 404) return false;
  const payload =
    result.data && typeof result.data === "object"
      ? (result.data as Record<string, unknown>)
      : null;
  const error = payload?.error;
  return (
    (typeof error === "string" && /profile not found/i.test(error)) ||
    Array.isArray(payload?.results)
  );
}

/**
 * generate-report, then report + timeline-profile + report-page.
 * generate-report is not retried. A 404 from report/ means no profile matched.
 */
export async function loadPreviewResult(
  staff: StaffSession,
  versionId: string,
  answers: PreviewAnswer[],
): Promise<UpstreamResult<PreviewResultBundle>> {
  const generated = await generatePreviewReport(staff, versionId, answers);
  if (!generated.ok) return generated;

  const token = generated.previewToken;
  if (!token) {
    return {
      ok: false,
      status: 502,
      error: "Scoring finished but the API did not return an X-Preview-Token.",
    };
  }

  const [report, timeline, reportPage] = await Promise.all([
    getPreviewReport(staff, versionId, token),
    getPreviewTimeline(staff, versionId, token),
    getPreviewReportPage(staff, versionId),
  ]);

  if (!timeline.ok) return timeline;
  if (!reportPage.ok) return reportPage;
  if (!report.ok && !isMissingBehaviorProfile(report)) return report;

  return {
    ok: true,
    status: 200,
    previewToken: token,
    data: {
      previewToken: token,
      summary: generated.data,
      report: report.ok ? report.data : null,
      reportStatus: report.ok ? report.status : 404,
      timeline: timeline.data,
      reportPage: reportPage.data,
    },
  };
}
