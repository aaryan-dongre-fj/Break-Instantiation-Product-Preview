import { NextResponse } from "next/server";
import { SAMPLE_MODEL_RESPONSE } from "@/utils/sampleReport";
import { unauthorizedIfNoStaff } from "@/utils/requireStaff";

export const maxDuration = 300;

/**
 * Dummy generate-report payload so the results UI can be tested without a
 * live scoring session. Swap back to `generateClientReport` when wiring
 * CLIENT_API_BASE for real.
 */
export async function GET(request: Request) {
  const denied = await unauthorizedIfNoStaff();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  void searchParams.get("retry");

  return NextResponse.json({
    data: SAMPLE_MODEL_RESPONSE,
    status: "success",
  });
}
