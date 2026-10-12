import { NextResponse } from "next/server";
import { SAMPLE_TIMELINE_PROFILE } from "@/utils/sampleReport";
import { unauthorizedIfNoStaff } from "@/utils/requireStaff";

export async function GET() {
  const denied = await unauthorizedIfNoStaff();
  if (denied) return denied;

  return NextResponse.json({
    data: SAMPLE_TIMELINE_PROFILE,
    status: "success",
  });
}
