import { NextResponse } from "next/server";
import type { ClientAnswerRecord } from "@/utils/clientApi";
import { loadPreviewResult, type PreviewAnswer } from "@/utils/flowTool";
import { scoreEntryUrl } from "@/utils/productLine";
import { getStaffSession } from "@/utils/staffSession";

export const maxDuration = 300;

/**
 * Score a finished walk, then load report, timeline, and report-page.
 * Every product, including Break, posts here. BVI holds the Break ML
 * preview token and forwards generate-report, report, timeline-profile,
 * report-page, and mux-signed-urls to Break. generate-report runs once.
 * Its preview token stays on the bundle so a later mux refresh does not
 * score again.
 */
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

  let body: { answers?: PreviewAnswer[]; records?: ClientAnswerRecord[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.answers)) {
    return NextResponse.json(
      { error: "`answers` must be an array." },
      { status: 400 }
    );
  }

  if (body.answers.length === 0) {
    return NextResponse.json(
      { error: "Need at least one answer before scoring." },
      { status: 400 }
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[preview-result] ${versionId} ${scoreEntryUrl(versionId)}`);
  }

  const result = await loadPreviewResult(staff, versionId, body.answers);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const response = NextResponse.json(result.data);
  response.headers.set("X-Preview-Token", result.data.previewToken);
  return response;
}
