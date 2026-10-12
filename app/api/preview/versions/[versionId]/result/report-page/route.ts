import { NextResponse } from "next/server";
import { getPreviewReportPage } from "@/utils/flowTool";
import { getStaffSession } from "@/utils/staffSession";

/** Raw `GET …/preview/result/report-page/`. No preview token. */
export async function GET(
  _request: Request,
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
  const result = await getPreviewReportPage(staff, versionId);
  if (!result.ok) {
    const body =
      result.data && typeof result.data === "object"
        ? result.data
        : { error: result.error };
    return NextResponse.json(body, { status: result.status });
  }

  return NextResponse.json(result.data ?? null, { status: result.status });
}
