import { NextResponse } from "next/server";
import { revokeClientSession } from "@/utils/clientPortal";
import { clearClientAuth } from "@/utils/clientSession";
import { clearStaffSession, getStaffSession } from "@/utils/staffSession";

export async function POST() {
  const session = await getStaffSession();
  if (session) await revokeClientSession(session);
  await clearStaffSession();
  await clearClientAuth();
  return NextResponse.json({ ok: true });
}
