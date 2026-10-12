import { NextResponse } from "next/server";
import { refreshPreviewMuxUrls } from "@/utils/flowTool";
import { getStaffSession } from "@/utils/staffSession";

/** Re-sign playback IDs whose preview URLs have expired. Does not re-score. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const staff = await getStaffSession();
  if (!staff) {
    return NextResponse.json(
      { error: "Your session has expired. Sign in again." },
      { status: 401 }
    );
  }

  const { versionId } = await params;

  let body: { playback_ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const playbackIds = Array.isArray(body.playback_ids)
    ? body.playback_ids.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (playbackIds.length === 0) {
    return NextResponse.json(
      { error: "`playback_ids` must be a non-empty array." },
      { status: 400 }
    );
  }

  const result = await refreshPreviewMuxUrls(staff, versionId, playbackIds);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data ?? {});
}
