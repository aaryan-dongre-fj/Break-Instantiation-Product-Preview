import type { PreviewAnswer, PreviewResultBundle } from "@/utils/flowTool";

const keyFor = (versionId: string) => `bvi-preview-result:${versionId}`;

/**
 * Dev-only manual fixture. The app never writes this key.
 * Paste a PreviewResultBundle to render results with no walk.
 * Ignored once this tab has real answers from a finished questionnaire.
 */
export const DEBUG_PREVIEW_BUNDLE_KEY = "bvi-preview-debug-bundle";

export type PreviewResultCache = {
  answers: PreviewAnswer[];
  answersHash: string;
  bundle: PreviewResultBundle | null;
};

export function hashAnswers(answers: PreviewAnswer[]): string {
  return JSON.stringify(answers);
}

export function readPreviewResultCache(
  versionId: string
): PreviewResultCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(keyFor(versionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewResultCache & { result?: unknown };
    if (!parsed || !Array.isArray(parsed.answers)) return null;
    return {
      answers: parsed.answers,
      answersHash: parsed.answersHash || hashAnswers(parsed.answers),
      bundle: parsed.bundle ?? null,
    };
  } catch {
    return null;
  }
}

export function readDebugPreviewBundle(): PreviewResultBundle | null {
  if (process.env.NODE_ENV !== "development") return null;
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DEBUG_PREVIEW_BUNDLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewResultBundle;
    if (!parsed || typeof parsed.previewToken !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePreviewResultCache(
  versionId: string,
  data: PreviewResultCache
) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(keyFor(versionId), JSON.stringify(data));
}

export function cachedResultMatches(
  versionId: string,
  answers: PreviewAnswer[]
): PreviewResultCache | null {
  const cached = readPreviewResultCache(versionId);
  if (!cached) return null;
  if (cached.answersHash !== hashAnswers(answers)) return null;
  return cached;
}

export type PreviewBundleFetch =
  | { ok: true; status: number; bundle: PreviewResultBundle }
  | { ok: false; status: number; error: string };

const inflight = new Map<string, Promise<PreviewBundleFetch>>();

/**
 * One POST. The server scores with generate-report/ (no automatic retry, 95s
 * timeout) and then loads report/, timeline-profile/, and report-page/.
 */
export async function loadPreviewBundle(
  versionId: string,
  answers: PreviewAnswer[],
  records?: unknown[]
): Promise<PreviewBundleFetch> {
  const key = `${versionId}:${hashAnswers(answers)}`;
  const existing = inflight.get(key);
  if (existing) return existing;

  const pending = loadPreviewBundleOnce(versionId, answers, records).finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending;
}

async function loadPreviewBundleOnce(
  versionId: string,
  answers: PreviewAnswer[],
  records?: unknown[]
): Promise<PreviewBundleFetch> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);

  let response: Response;
  try {
    response = await fetch(
      `/api/preview/versions/${encodeURIComponent(versionId)}/result`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          records && records.length > 0 ? { answers, records } : { answers }
        ),
        signal: controller.signal,
      }
    );
  } catch {
    return {
      ok: false,
      status: 504,
      error: "Scoring timed out. Try again.",
    };
  } finally {
    clearTimeout(timer);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const record = payload as Record<string, unknown>;
    const error =
      typeof record.error === "string" ? record.error : "Couldn't score this walk.";
    return { ok: false, status: response.status, error };
  }

  const bundle = payload as PreviewResultBundle;
  if (!bundle || typeof bundle.previewToken !== "string") {
    return {
      ok: false,
      status: 502,
      error: "Scoring finished but the preview token was missing.",
    };
  }

  return { ok: true, status: response.status, bundle };
}

export async function refreshMuxUrls(
  versionId: string,
  playbackIds: string[]
): Promise<Record<string, { playback_url: string; thumbnail_gif_url: string }> | null> {
  if (playbackIds.length === 0) return null;
  const response = await fetch(
    `/api/preview/versions/${encodeURIComponent(versionId)}/result/mux-signed-urls`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playback_ids: playbackIds, exp_min: 60 }),
    }
  );
  if (!response.ok) return null;
  const payload = await response.json().catch(() => null);
  if (!payload || typeof payload !== "object") return null;
  return payload as Record<string, { playback_url: string; thumbnail_gif_url: string }>;
}
