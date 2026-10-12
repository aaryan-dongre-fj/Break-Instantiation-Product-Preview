import { NextResponse } from "next/server";
import { redeemInvite } from "@/utils/clientPortal";
import { setStaffSession } from "@/utils/staffSession";

export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const result = await redeemInvite(token);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await setStaffSession(result.data, result.data.email);
  return NextResponse.json({ email: result.data.email });
}
