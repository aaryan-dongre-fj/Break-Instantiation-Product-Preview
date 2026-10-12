import { NextResponse } from "next/server";
import { staffLogin } from "@/utils/flowTool";
import { setStaffSession } from "@/utils/staffSession";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const result = await staffLogin(email, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await setStaffSession(result.data, email);
  return NextResponse.json({ email });
}
