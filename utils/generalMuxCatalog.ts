import type { MuxVideoUrls } from "@/components/LandingPages/MuxTokenContext";
import uploads from "@/general_mux_uploads.json";

type GeneralMuxUpload = {
  title: string;
  playback_id?: string;
  status?: string;
};

const catalog = uploads as GeneralMuxUpload[];

/** Playback ids for the shared results-page videos (intros, explainers, EAC bodies). */
export function generalMuxPlaybackIds(): string[] {
  const ids: string[] = [];
  for (const row of catalog) {
    if (row.status && row.status !== "ready") continue;
    if (!row.title || typeof row.playback_id !== "string" || !row.playback_id) continue;
    ids.push(row.playback_id);
  }
  return ids;
}

/**
 * Map a mux-signed-urls response (keyed by playback_id) onto the titles
 * the results players already read: `source_belief_intro`, `eac_origin_body`, etc.
 */
export function generalMuxFromSigned(
  signed: Record<string, { playback_url?: string; thumbnail_gif_url?: string }> | null
): Record<string, MuxVideoUrls> {
  if (!signed) return {};
  const urls: Record<string, MuxVideoUrls> = {};
  for (const row of catalog) {
    if (!row.title || typeof row.playback_id !== "string") continue;
    const clip = signed[row.playback_id];
    const playbackUrl = clip?.playback_url;
    if (typeof playbackUrl !== "string" || !playbackUrl) continue;
    const thumb = clip?.thumbnail_gif_url;
    urls[row.title] = {
      playback_url: playbackUrl,
      thumbnail_gif_url: typeof thumb === "string" ? thumb : "",
    };
  }
  return urls;
}
