import type { Metadata } from "next";
import { Suspense } from "react";
import RedeemLink from "@/components/preview/RedeemLink";
import { loadLook } from "@/utils/look";

export async function generateMetadata(): Promise<Metadata> {
  const look = await loadLook();
  return { title: `Invitation · ${look.name}` };
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-primary-background text-primary-text/60">
          Signing you in…
        </div>
      }
    >
      <RedeemLink kind="invite" />
    </Suspense>
  );
}
