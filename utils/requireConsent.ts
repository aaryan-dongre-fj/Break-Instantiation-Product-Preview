import { redirect } from "next/navigation";
import { getConsentState } from "./clientPortal";
import { getStaffSession } from "./staffSession";
import { requestCompanyPath } from "@/utils/look";

/** Send a signed-in client to the consent screen until the API has a grant. */
export async function redirectIfConsentMissing() {
  const staff = await getStaffSession();
  if (!staff) redirect(await requestCompanyPath("/login"));
  const consent = await getConsentState(staff);
  if (consent.state === "missing") redirect(await requestCompanyPath("/consent"));
}
