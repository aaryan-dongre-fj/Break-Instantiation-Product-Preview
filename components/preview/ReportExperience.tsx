"use client";

import React from "react";
import CompletedUser from "@/components/LandingPages/CompletedUser";
import { StaffEmailContext } from "@/components/AppNavbar/ProfileMenu";

/**
 * Staff-preview host for the production CompletedUser fetch + UI.
 * Report data comes from staff `preview/result/` (STAFF_API_BASE), cached
 * in sessionStorage after the walk completes.
 */
export default function ReportExperience({
  email,
  versionId,
}: {
  email: string | null;
  versionId: string;
}) {
  const userName = email ? email.split("@")[0] : "there";

  return (
    <StaffEmailContext.Provider value={email}>
      <CompletedUser userName={userName} versionId={versionId} />
    </StaffEmailContext.Provider>
  );
}
