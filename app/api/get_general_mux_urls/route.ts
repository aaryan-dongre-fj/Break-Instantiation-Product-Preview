import { NextResponse } from "next/server";
import { SAMPLE_GENERAL_MUX_URLS } from "@/utils/sampleReport";
import { unauthorizedIfNoStaff } from "@/utils/requireStaff";

export async function GET() {
  const denied = await unauthorizedIfNoStaff();
  if (denied) return denied;

  return NextResponse.json({
    data: SAMPLE_GENERAL_MUX_URLS,
    status: "success",
  });
}
