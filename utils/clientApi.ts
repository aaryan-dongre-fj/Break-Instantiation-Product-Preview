/**
 * Server-side client for the respondent / scoring API
 * (`CLIENT_API_BASE`, default http://127.0.0.1:8000).
 *
 * Staff login + product walk stay on STAFF_API_BASE. After a walk finishes we
 * open a throwaway respondent session here, replay the answers, then the
 * results page reads generate-report / report / timeline / mux from this host.
 */

import { instance } from "./instance";

export const CLIENT_API_BASE = (
  process.env.CLIENT_API_BASE ?? instance.apiBaseUrl
).replace(/\/+$/, "");

/**
 * Community path Break's own signup uses (`defaultDynamicUrl` in
 * Break-Frontend). The campaign name is a body field. Putting `general`
 * in the path 404s with an HTML page.
 */
export const BREAK_COMMUNITY_SLUG =
  process.env.CLIENT_API_COMMUNITY?.trim() || "company-x";

export type ClientAnswerRecord = {
  question_id: string;
  question_code: string;
  prompt: string;
  answer_type: string;
  option_ids: string[];
  option_codes: Record<string, string>;
  option_labels: Record<string, string>;
  text: string;
  section_code: string;
  section_order: number;
};

export type ClientResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

type ClientStep = {
  content?: string;
  progress?: number;
  question?: Record<string, unknown>;
  questions?: Record<string, unknown>[];
  section_number?: number | string;
  section_data?: Array<{ number?: number }>;
  timeline_number?: number | string;
  is_last?: boolean;
  [key: string]: unknown;
};

function coerceScalar(value: unknown): string | number {
  if (typeof value === "number") return value;
  const text = String(value ?? "");
  if (/^-?\d+$/.test(text)) return Number(text);
  return text;
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

function errorMessage(status: number, payload: unknown): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const detail =
      record.detail ?? record.error ?? record.message ?? record.data;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (detail && typeof detail === "object") {
      try {
        return JSON.stringify(detail);
      } catch {
        /* ignore */
      }
    }
  }
  if (typeof payload === "string" && payload.trim()) {
    if (payload.includes("<html") || payload.includes("<!DOCTYPE")) {
      return `The scoring API returned ${status} as an HTML page, not JSON.`;
    }
    return payload.slice(0, 300);
  }
  return `The scoring API returned ${status}.`;
}

async function clientFetch(
  path: string,
  init: {
    method?: "GET" | "POST";
    token?: string;
    body?: unknown;
    acceptStatuses?: number[];
  } = {}
): Promise<ClientResult<unknown>> {
  const accept = init.acceptStatuses ?? [200];
  let response: Response;
  try {
    response = await fetch(`${CLIENT_API_BASE}${path}`, {
      method: init.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.token ? { Authorization: `Token ${init.token}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 503,
      error: `Couldn't reach ${CLIENT_API_BASE}. Check CLIENT_API_BASE and the network.`,
    };
  }

  const payload = await readBody(response);
  if (!accept.includes(response.status)) {
    return {
      ok: false,
      status: response.status,
      error: errorMessage(response.status, payload),
      data: payload,
    };
  }
  return { ok: true, status: response.status, data: payload };
}

export async function registerClientUser(input: {
  email: string;
  password: string;
  name: string;
  phone: string;
  campaign: string;
}): Promise<ClientResult<unknown>> {
  const slug = encodeURIComponent(BREAK_COMMUNITY_SLUG);
  return clientFetch(`/api/community/${slug}/`, {
    method: "POST",
    body: input,
    acceptStatuses: [200, 201],
  });
}

export async function loginClientUser(
  username: string,
  password: string
): Promise<ClientResult<string>> {
  const result = await clientFetch("/api/auth_token/", {
    method: "POST",
    body: { username, password },
  });
  if (!result.ok) return result;
  const payload = result.data as { token?: string; data?: { token?: string } };
  const token = payload?.token || payload?.data?.token;
  if (!token) {
    return {
      ok: false,
      status: 502,
      error: "Scoring login succeeded but no token was returned.",
      data: result.data,
    };
  }
  return { ok: true, status: 200, data: token };
}

export async function getClientSessionKey(
  token: string
): Promise<ClientResult<string>> {
  const result = await clientFetch("/api/v2/sessions/me/", { token });
  if (!result.ok) return result;
  const payload = result.data as { session_key?: string };
  if (!payload?.session_key) {
    return {
      ok: false,
      status: 502,
      error: "Scoring API did not return a session_key.",
      data: result.data,
    };
  }
  return { ok: true, status: 200, data: payload.session_key };
}

function unwrapStep(payload: unknown): ClientStep {
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (inner && typeof inner === "object") return inner as ClientStep;
  }
  return (payload ?? {}) as ClientStep;
}

export async function getClientNext(
  token: string,
  sessionKey: string
): Promise<ClientResult<ClientStep>> {
  const result = await clientFetch(
    `/api/v2/sessions/${encodeURIComponent(sessionKey)}/next/`,
    { token }
  );
  if (!result.ok) return result;
  return { ok: true, status: result.status, data: unwrapStep(result.data) };
}

export async function postClientAnswer(
  token: string,
  sessionKey: string,
  body: { current_question_id?: unknown; response: unknown; section: unknown }
): Promise<ClientResult<ClientStep>> {
  const result = await clientFetch(
    `/api/v2/sessions/${encodeURIComponent(sessionKey)}/answers/`,
    { method: "POST", token, body, acceptStatuses: [200, 201] }
  );
  if (!result.ok) return result;
  return { ok: true, status: result.status, data: unwrapStep(result.data) };
}

export async function generateClientReport(
  token: string,
  sessionKey: string,
  retry = false
): Promise<ClientResult<unknown>> {
  const suffix = retry ? "?retry=1" : "";
  return clientFetch(
    `/api/v2/sessions/${encodeURIComponent(sessionKey)}/generate-report/${suffix}`,
    { token, acceptStatuses: [200, 202] }
  );
}

export async function getClientReport(
  token: string,
  sessionKey: string
): Promise<ClientResult<unknown>> {
  return clientFetch(
    `/api/v2/sessions/${encodeURIComponent(sessionKey)}/report/`,
    { token }
  );
}

export async function getClientTimelineProfile(
  token: string,
  sessionKey: string
): Promise<ClientResult<unknown>> {
  return clientFetch(
    `/api/v2/sessions/${encodeURIComponent(sessionKey)}/timeline-profile/`,
    { token }
  );
}

export async function getClientReportPage(
  token: string
): Promise<ClientResult<unknown>> {
  return clientFetch("/api/report_page/", { token });
}

export async function getClientMuxUrls(
  token: string,
  playbackIds: string[]
): Promise<ClientResult<Record<string, { playback_url: string; thumbnail_gif_url: string }>>> {
  return clientFetch("/api/mux_signed_urls/", {
    method: "POST",
    token,
    body: { playback_ids: playbackIds, exp_min: 60 },
  }) as Promise<
    ClientResult<Record<string, { playback_url: string; thumbnail_gif_url: string }>>
  >;
}

export async function updateClientNotifyContact(
  token: string,
  phone: string
): Promise<ClientResult<unknown>> {
  return clientFetch("/api/update_notify_contact/", {
    method: "POST",
    token,
    body: { notify_contact: phone },
    acceptStatuses: [200, 201],
  });
}

function questionIdOf(question: Record<string, unknown> | undefined): string | null {
  if (!question) return null;
  const id = question.id ?? question.question_id;
  return id == null ? null : String(id);
}

function questionCodeOf(question: Record<string, unknown> | undefined): string {
  if (!question) return "";
  return String(question.code ?? question.question_code ?? "");
}

function questionPromptOf(question: Record<string, unknown> | undefined): string {
  if (!question) return "";
  const raw =
    question.prompt ?? question.question_text ?? question.question ?? question.text;
  return typeof raw === "string" ? raw.trim() : "";
}

function samePrompt(left: string, right: string): boolean {
  const norm = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[?!.]+$/g, "");
  return Boolean(norm(left)) && norm(left) === norm(right);
}

function findRecord(
  records: ClientAnswerRecord[],
  used: Set<string>,
  question: Record<string, unknown> | undefined
): ClientAnswerRecord | undefined {
  const id = questionIdOf(question);
  if (id) {
    const byId = records.find(
      (record) => !used.has(record.question_id) && record.question_id === id
    );
    if (byId) return byId;
  }
  const code = questionCodeOf(question);
  if (code) {
    const byCode = records.find(
      (record) => !used.has(record.question_id) && record.question_code === code
    );
    if (byCode) return byCode;
  }
  const prompt = questionPromptOf(question);
  if (prompt) {
    return records.find(
      (record) =>
        !used.has(record.question_id) && samePrompt(record.prompt, prompt)
    );
  }
  return undefined;
}

function mapOptionId(
  record: ClientAnswerRecord,
  optionId: string,
  clientQuestion: Record<string, unknown> | undefined
): string | number {
  const rawOptions = clientQuestion?.options ?? clientQuestion?.question_options;
  const options = Array.isArray(rawOptions) ? rawOptions : [];
  const code = record.option_codes[optionId];
  const label = record.option_labels[optionId];
  const match = options.find((option) => {
    if (!option || typeof option !== "object") return false;
    const row = option as Record<string, unknown>;
    return (
      String(row.id) === optionId ||
      (code && String(row.code ?? "") === code) ||
      (label &&
        String(row.label ?? row.text ?? "")
          .trim()
          .toLowerCase() === label.trim().toLowerCase())
    );
  }) as Record<string, unknown> | undefined;
  if (match?.id != null) return coerceScalar(match.id);
  return coerceScalar(optionId);
}

function responseFor(
  record: ClientAnswerRecord,
  step: ClientStep
): unknown {
  const question = step.question;
  const type = String(
    question?.question_type ?? record.answer_type ?? ""
  ).toUpperCase();

  if (/NUMBER|NUMERIC|SCALE|RATING|INTEGER/.test(type) && record.option_ids.length === 0) {
    const parsed = parseInt(record.text, 10);
    return Number.isNaN(parsed) ? record.text : parsed;
  }

  if (/FREEFORM|FREE_FORM|TEXT/.test(type) && record.option_ids.length === 0) {
    return record.text;
  }

  if (record.option_ids.length > 1 || /MULTI/.test(type)) {
    return record.option_ids
      .map((id) => mapOptionId(record, id, question))
      .join(",");
  }

  if (record.option_ids.length === 1) {
    return mapOptionId(record, record.option_ids[0], question);
  }

  return record.text;
}

function fallbackResponse(step: ClientStep): unknown {
  const question = step.question;
  const rawOptions = question?.options ?? question?.question_options;
  const options = Array.isArray(rawOptions) ? rawOptions : [];
  const first = options.find(
    (option) =>
      option &&
      typeof option === "object" &&
      (option as Record<string, unknown>).id != null
  ) as Record<string, unknown> | undefined;
  const type = String(question?.question_type ?? "").toUpperCase();
  if (first?.id != null) {
    return /MULTI/.test(type)
      ? String(coerceScalar(first.id))
      : coerceScalar(first.id);
  }
  if (/NUMBER|NUMERIC|SCALE|RATING|INTEGER/.test(type)) return 30;
  return "preview";
}

function sectionFor(step: ClientStep, record?: ClientAnswerRecord): unknown {
  if (step.section_number != null) return coerceScalar(step.section_number);
  const fromSection = step.section_data?.[0]?.number;
  if (fromSection != null) return fromSection;
  if (record?.section_order) return record.section_order;
  return record?.section_code || 0;
}

/**
 * Drive the scoring host's stateful `/next/` + `/answers/` loop using the
 * staff walk's recorded answers. Graphs are assumed in sync across hosts.
 */
async function advanceAfterAnswer(
  token: string,
  sessionKey: string,
  step: ClientStep,
  posted: ClientResult<ClientStep>
): Promise<ClientResult<ClientStep>> {
  if (!posted.ok) {
    if (/already exists/i.test(posted.error)) {
      return getClientNext(token, sessionKey);
    }
    const content = String(step.content ?? "unknown");
    return {
      ...posted,
      error: `${posted.error} (${content} · id ${questionIdOf(step.question) ?? "?"} · ${questionPromptOf(step.question) || "no prompt"})`,
    };
  }

  const answeredId = questionIdOf(step.question);
  const nextId = questionIdOf(posted.data.question);
  if (
    answeredId &&
    nextId === answeredId &&
    posted.data.content === step.content
  ) {
    return getClientNext(token, sessionKey);
  }
  return posted;
}

export async function replayClientWalk(
  token: string,
  sessionKey: string,
  records: ClientAnswerRecord[]
): Promise<ClientResult<{ steps: number }>> {
  const used = new Set<string>();
  const seen = new Set<string>();
  const trail: string[] = [];
  let lastUnique = 0;
  let lastUniqueStep = 0;
  let stepResult = await getClientNext(token, sessionKey);
  if (!stepResult.ok) return stepResult;
  let step = stepResult.data;
  let previousSignature = "";
  let repeats = 0;

  for (let i = 0; i < 400; i += 1) {
    const content = String(step.content ?? "");
    const prompt = questionPromptOf(step.question).slice(0, 70);
    const signature = `${content}:${questionIdOf(step.question) ?? ""}:${step.timeline_number ?? ""}:${prompt}`;
    seen.add(signature);
    trail.push(
      `${content}:${questionIdOf(step.question) ?? ""}:s${step.section_number ?? ""}:${prompt}`
    );
    if (trail.length > 8) trail.shift();
    if (i < 8 || i % 30 === 0) {
      console.log(`[break-replay] ${i} unique=${seen.size} ${signature}`);
    }
    if (signature === previousSignature) repeats += 1;
    else {
      previousSignature = signature;
      repeats = 0;
    }
    if (repeats >= 2 || (i > 20 && seen.size === lastUnique && i - lastUniqueStep >= 8)) {
      return {
        ok: false,
        status: 409,
        error: `Scoring replay stuck on ${content || "unknown"} (id ${questionIdOf(step.question) ?? "?"}, section ${step.section_number ?? "?"}, ${prompt || "no prompt"}). ${JSON.stringify(step).slice(0, 500)}`,
        data: step,
      };
    }
    if (seen.size !== lastUnique) {
      lastUnique = seen.size;
      lastUniqueStep = i;
    }
    if (content === "completed") {
      return { ok: true, status: 200, data: { steps: i } };
    }

    if (content === "section") {
      const posted = await postClientAnswer(token, sessionKey, {
        current_question_id: 0,
        response: 1,
        section: sectionFor(step),
      });
      const advanced = await advanceAfterAnswer(token, sessionKey, step, posted);
      if (!advanced.ok) return advanced;
      step = advanced.data;
      continue;
    }

    if (content === "timeline_question") {
      const rawQuestions = Array.isArray(step.question)
        ? step.question
        : step.questions;
      const questions = Array.isArray(rawQuestions) ? rawQuestions : [];
      const response: Record<string, number> = {};
      for (const question of questions) {
        const record = findRecord(records, used, question);
        if (record) used.add(record.question_id);
        const qid = questionIdOf(question);
        if (!qid) continue;
        const chosen = record?.option_ids[0];
        const asNum =
          record && chosen != null
            ? Number(mapOptionId(record, chosen, question))
            : 1;
        response[qid] = Number.isNaN(asNum) ? 1 : asNum > 0 ? 1 : 0;
      }
      const posted = await postClientAnswer(token, sessionKey, {
        current_question_id: step.timeline_number ?? 1,
        response,
        section: sectionFor(step),
      });
      const advanced = await advanceAfterAnswer(token, sessionKey, step, posted);
      if (!advanced.ok) return advanced;
      step = advanced.data;
      continue;
    }

    if (content === "timeline_ordering") {
      const statements = Array.isArray(step.timeline_statements)
        ? step.timeline_statements
        : [];
      const order = statements
        .map((statement) => {
          if (!statement || typeof statement !== "object") return "";
          return String((statement as Record<string, unknown>).number ?? "");
        })
        .filter(Boolean)
        .join(",");
      const posted = await postClientAnswer(token, sessionKey, {
        response: order,
        section: "timeline_ordering",
      });
      const advanced = await advanceAfterAnswer(token, sessionKey, step, posted);
      if (!advanced.ok) return advanced;
      step = advanced.data;
      continue;
    }

    if (content === "freeform_question") {
      const record = findRecord(records, used, step.question);
      if (record) used.add(record.question_id);
      const parts = (record?.text || "preview")
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean);
      while (parts.length < 3) parts.push(parts[0] || "preview");
      const posted = await postClientAnswer(token, sessionKey, {
        current_question_id: 1,
        response: parts.slice(0, 3).join(";"),
        section: sectionFor(step, record),
      });
      const advanced = await advanceAfterAnswer(token, sessionKey, step, posted);
      if (!advanced.ok) return advanced;
      step = advanced.data;
      continue;
    }

    const record = findRecord(records, used, step.question);
    if (record) used.add(record.question_id);

    const posted = await postClientAnswer(token, sessionKey, {
      current_question_id: coerceScalar(
        step.question?.id ?? record?.question_id ?? 0
      ),
      response: record ? responseFor(record, step) : fallbackResponse(step),
      section: sectionFor(step, record),
    });
    const advanced = await advanceAfterAnswer(token, sessionKey, step, posted);
    if (!advanced.ok) return advanced;
    step = advanced.data;
  }

  console.log(`[break-replay] unfinished unique=${seen.size} last=${trail.join(" | ")}`);
  return {
    ok: false,
    status: 504,
    error: `Scoring replay exceeded 400 steps (${seen.size} distinct). Last: ${trail.join(" | ")}`,
  };
}

export function randomClientPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function previewClientEmail(): string {
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `preview.${stamp}@companyx.example`;
}
