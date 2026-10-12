import { NextResponse } from "next/server";
import { getClientAuth } from "@/utils/clientSession";
import { getStaffSession } from "@/utils/staffSession";

/** 401 JSON if the staff preview session cookie is missing. */
export async function unauthorizedIfNoStaff(): Promise<NextResponse | null> {
  const staff = await getStaffSession();
  if (!staff) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  return null;
}

/** 401 if the scoring replay has not stashed a Django token yet. */
export async function unauthorizedIfNoClient(): Promise<NextResponse | null> {
  const client = await getClientAuth();
  if (!client) {
    return NextResponse.json(
      {
        error:
          "No scoring session yet. Finish the questionnaire so answers can be sent to the results backend.",
      },
      { status: 401 }
    );
  }
  return null;
}
