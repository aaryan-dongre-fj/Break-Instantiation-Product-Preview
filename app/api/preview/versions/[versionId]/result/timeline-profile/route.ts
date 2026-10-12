import { NextResponse } from "next/server";
import { getPreviewTimeline } from "@/utils/flowTool";
import { getStaffSession } from "@/utils/staffSession";

/** Raw `GET …/preview/result/timeline-profile/`. Forwards `X-Preview-Token`. */
export async function GET(
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

  const token = request.headers.get("X-Preview-Token");
  if (!token) {
    return NextResponse.json(
      { error: "X-Preview-Token is required." },
      { status: 400 }
    );
  }

  const { versionId } = await params;
  const result = await getPreviewTimeline(staff, versionId, token);
  if (!result.ok) {
    const body =
      result.data && typeof result.data === "object"
        ? result.data
        : { error: result.error };
    return NextResponse.json(body, { status: result.status });
  }

  return NextResponse.json(result.data ?? null, { status: result.status });
}
