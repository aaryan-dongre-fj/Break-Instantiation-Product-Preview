import type { MuxVideoUrls } from "@/components/LandingPages/MuxTokenContext";
import type { PreviewResultBundle } from "@/utils/flowTool";

export type PreviewReportPage = {
  origin_owner_name: string | null;
  origin_owner_role: string | null;
  origin_owner_email: string | null;
  campaign: string | null;
  calendly: string | null;
  status: string;
};

export type NormalizedPreviewResult = {
  modelResponseData: unknown;
  behaviorProfileData: Record<string, unknown> | null;
  timelineProfileData: unknown;
  generalMuxUrls: Record<string, MuxVideoUrls>;
  reportPage: PreviewReportPage;
};

export type SignedMuxUrl = {
  playback_url: string;
  thumbnail_gif_url: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function looksLikeBehavior(value: Record<string, unknown> | null): boolean {
  if (!value) return false;
  return (
    typeof value.osb === "string" ||
    typeof value.asb === "string" ||
    Array.isArray(value.corrected_report)
  );
}

function profileFromReport(raw: unknown): Record<string, unknown> | null {
  const root = asRecord(raw);
  if (!root) return null;
  if (looksLikeBehavior(root)) return root;
  const inner = asRecord(root.data);
  if (looksLikeBehavior(inner)) return inner;
  return root;
}

function timelineFromPayload(raw: unknown): unknown {
  const root = asRecord(raw);
  if (!root) return raw ?? null;
  if (root.timeline_profile || root.eac_urls || Array.isArray(root.report)) return root;
  const inner = asRecord(root.data);
  if (inner && (inner.timeline_profile || inner.eac_urls)) return inner;
  return root;
}

function muxFrom(value: unknown): MuxVideoUrls | null {
  const row = asRecord(value);
  const playbackUrl = row?.playback_url;
  if (typeof playbackUrl !== "string" || !playbackUrl) return null;
  const thumb = row.thumbnail_gif_url;
  return {
    playback_url: playbackUrl,
    thumbnail_gif_url: typeof thumb === "string" ? thumb : "",
  };
}

/** Chapter two's emotion players read these general-mux keys. */
export function eacMuxFromTimeline(timeline: unknown): Record<string, MuxVideoUrls> {
  const eac = asRecord(asRecord(timeline)?.eac_urls);
  if (!eac) return {};
  const urls: Record<string, MuxVideoUrls> = {};
  const pairs: Array<[string, unknown]> = [
    ["eac_origin_body", eac.eac_origin],
    ["eac_protective_body", eac.eac_protect],
    ["eac_escalating_body", eac.eac_esc],
  ];
  for (const [key, value] of pairs) {
    const clip = muxFrom(value);
    if (clip) urls[key] = clip;
  }
  return urls;
}

function modelFromSummary(summary: unknown): unknown {
  const root = asRecord(summary);
  const data = asRecord(root?.data);
  const timeline = asRecord(data?.timeline) ?? asRecord(root?.timeline);
  if (timeline && ("Primary" in timeline || "primary" in timeline)) {
    return { data: { timeline } };
  }
  const numbers = asRecord(root?.timeline_numbers);
  return {
    data: {
      timeline: {
        Primary: numbers?.primary ?? "",
        Secondary: numbers?.secondary ?? "",
        "Tertiary 1": numbers?.tertiary_1 ?? "",
        "Tertiary 2": numbers?.tertiary_2 ?? "",
      },
    },
  };
}

function reportPageFrom(raw: unknown): PreviewReportPage {
  const page = asRecord(raw);
  const text = (key: string) => {
    const value = page?.[key];
    return typeof value === "string" ? value : null;
  };
  return {
    origin_owner_name: text("origin_owner_name"),
    origin_owner_role: text("origin_owner_role"),
    origin_owner_email: text("origin_owner_email"),
    campaign: text("campaign"),
    calendly: text("calendly"),
    status: text("status") || "success",
  };
}

/**
 * Map generate-report + report + timeline-profile + report-page into the
 * shapes CompletedUser already renders. report/ is the profile (insight text
 * and signed playback_urls). timeline-profile/ supplies timeline clips and
 * eac_urls.
 */
export function assemblePreviewResult(
  bundle: PreviewResultBundle
): NormalizedPreviewResult {
  const timeline = timelineFromPayload(bundle.timeline);
  return {
    modelResponseData: modelFromSummary(bundle.summary),
    behaviorProfileData:
      bundle.reportStatus === 404 ? null : profileFromReport(bundle.report),
    timelineProfileData: timeline,
    generalMuxUrls: eacMuxFromTimeline(timeline),
    reportPage: reportPageFrom(bundle.reportPage),
  };
}

function collectIds(value: unknown, ids: Set<string>, depth: number) {
  if (depth > 8 || !value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, ids, depth + 1);
    return;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.playback_id === "string" && record.playback_id) {
    ids.add(record.playback_id);
  }
  for (const child of Object.values(record)) collectIds(child, ids, depth + 1);
}

export function collectPlaybackIds(...values: unknown[]): string[] {
  const ids = new Set<string>();
  for (const value of values) collectIds(value, ids, 0);
  return [...ids];
}

function patchValue(value: unknown, signed: Record<string, SignedMuxUrl>): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => patchValue(item, signed));
  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(record)) {
    next[key] = patchValue(child, signed);
  }
  const id = next.playback_id;
  if (typeof id === "string" && signed[id]) {
    next.playback_url = signed[id].playback_url;
    next.thumbnail_gif_url = signed[id].thumbnail_gif_url;
  }
  return next;
}

/** Replace expired signed URLs in place, matched by playback_id. */
export function patchSignedUrls<T>(value: T, signed: Record<string, SignedMuxUrl>): T {
  return patchValue(value, signed) as T;
}
