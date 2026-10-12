import { NextResponse } from "next/server";
import { unauthorizedIfNoStaff } from "@/utils/requireStaff";

export async function POST(request: Request) {
  const denied = await unauthorizedIfNoStaff();
  if (denied) return denied;

  let body: { phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Phone number is required", status: "error" },
      { status: 400 }
    );
  }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!phone) {
    return NextResponse.json(
      { error: "Phone number is required", status: "error" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    data: { notify_contact: phone },
    status: "success",
  });
}
