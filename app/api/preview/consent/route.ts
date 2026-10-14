import { NextResponse } from "next/server";
import { grantConsent } from "@/utils/clientPortal";
import { getStaffSession } from "@/utils/staffSession";

export async function POST() {
  const staff = await getStaffSession();
  if (!staff) {
    return NextResponse.json({ error: "Your session has expired. Sign in again." }, { status: 401 });
  }

  const result = await grantConsent(staff);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
