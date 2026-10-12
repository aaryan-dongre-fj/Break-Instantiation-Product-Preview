import { NextResponse } from "next/server";
import {
  loginClientUser,
  previewClientEmail,
  randomClientPassword,
  registerClientUser,
  replayClientWalk,
  getClientSessionKey,
  type ClientAnswerRecord,
} from "@/utils/clientApi";
import { setClientAuth } from "@/utils/clientSession";
import { instance } from "@/utils/instance";
import { unauthorizedIfNoStaff } from "@/utils/requireStaff";

export const maxDuration = 300;

function scoringCampaign(requested?: string): string {
  const fromEnv = process.env.CLIENT_API_CAMPAIGN?.trim();
  if (fromEnv) return fromEnv;
  const fromProduct = requested?.trim();
  if (fromProduct && fromProduct !== "break" && fromProduct !== "general") {
    return fromProduct;
  }
  return "break_admin-admin-1";
}

/**
 * Open a throwaway respondent on CLIENT_API_BASE, replay the staff walk's
 * answers into `/api/v2/sessions/{key}/answers/`, and stash the Django token
 * + session_key so the results page can poll generate-report.
 */
export async function POST(request: Request) {
  const denied = await unauthorizedIfNoStaff();
  if (denied) return denied;

  let body: { campaign?: string; answers?: ClientAnswerRecord[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json(
      { error: "`answers` must be a non-empty array." },
      { status: 400 }
    );
  }

  const campaign = scoringCampaign(body.campaign);
  const email = previewClientEmail();
  const password = randomClientPassword();

  const registered = await registerClientUser({
    email,
    password,
    name: instance.productName,
    phone: "+15555550100",
    campaign,
  });
  if (!registered.ok) {
    return NextResponse.json(
      {
        error: `Couldn't create a scoring user on campaign "${campaign}": ${registered.error}`,
      },
      { status: registered.status }
    );
  }

  const loggedIn = await loginClientUser(email, password);
  if (!loggedIn.ok) {
    return NextResponse.json(
      { error: `Scoring login failed: ${loggedIn.error}` },
      { status: loggedIn.status }
    );
  }

  const session = await getClientSessionKey(loggedIn.data);
  if (!session.ok) {
    return NextResponse.json(
      { error: session.error },
      { status: session.status }
    );
  }

  const replayed = await replayClientWalk(
    loggedIn.data,
    session.data,
    body.answers
  );
  if (!replayed.ok) {
    return NextResponse.json(
      { error: replayed.error },
      { status: replayed.status }
    );
  }

  await setClientAuth({ token: loggedIn.data, sessionKey: session.data });
  return NextResponse.json({ status: "success", campaign });
}
