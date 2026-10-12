import { Suspense } from "react";
import RedeemLink from "@/components/preview/RedeemLink";
import { instance } from "@/utils/instance";

export const metadata = {
  title: `Invitation · ${instance.productName}`,
};

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
