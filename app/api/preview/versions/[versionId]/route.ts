import { NextResponse } from "next/server";
import { walkVersion, type PreviewAnswer } from "@/utils/flowTool";
import { getStaffSession } from "@/utils/staffSession";

/** Advance (or replay) the walk for one published version. */
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

  let body: { answers?: PreviewAnswer[] };
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

  const result = await walkVersion(staff, versionId, body.answers);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
