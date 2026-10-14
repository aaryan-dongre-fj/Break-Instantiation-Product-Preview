"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CompletedUserUI from "./CompletedUserUI";
import { MuxTokenProvider, type MuxVideoUrls } from "./MuxTokenContext";
import {
  assemblePreviewResult,
  collectPlaybackIds,
  eacMuxFromTimeline,
  patchSignedUrls,
  type PreviewReportPage,
} from "@/utils/previewResult";
import {
  generalMuxFromSigned,
  generalMuxPlaybackIds,
} from "@/utils/generalMuxCatalog";
import {
  hashAnswers,
  loadPreviewBundle,
  readDebugPreviewBundle,
  readPreviewResultCache,
  refreshMuxUrls,
  writePreviewResultCache,
} from "@/utils/previewResultCache";

type ReportPageData = PreviewReportPage;

type CompletedUserProps = {
  userName?: string;
  versionId: string;
};

export default function CompletedUser({
  userName = "User",
  versionId,
}: CompletedUserProps) {
  const router = useRouter();
  const bonusVideosRef = useRef<HTMLDivElement>(null);

  const scrollToBonusVideos = () => {
    bonusVideosRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  let isPaidUser = false;
  let isFreeUser = false;
  let isBsUser = false;
  let isBsVIPUser = false;
  let isPractitionerUser = false;
  let isGiftUser = false;
  let isMiscCampaignUser = false;
  let isPremiumUser = false;
  let isBookUser = false;
  let isBookQrUser = false;
  let isCorporateFunnelUser = false;
  let isGordonOnlyUser = false;
  let isCircleUser = false;

  const [pageData, setPageData] = useState<ReportPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelResponseData, setModelResponseData] = useState<any>(null);
  const [behaviorProfileData, setBehaviorProfileData] = useState<any>(null);
  const [timelineProfileData, setTimelineProfileData] = useState<any>(null);
  const [generalMuxUrls, setGeneralMuxUrls] = useState<Record<string, MuxVideoUrls>>({});
  const [generateStatus, setGenerateStatus] = useState<"generating" | "error" | "unavailable" | "done">("generating");
  const [generateError, setGenerateError] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const profileRef = useRef<unknown>(null);
  const timelineRef = useRef<unknown>(null);

  const generalMuxFor = useCallback(
    async (timeline: unknown): Promise<Record<string, MuxVideoUrls>> => {
      const signed = await refreshMuxUrls(versionId, generalMuxPlaybackIds());
      // Catalog titles win. Timeline eac_urls only fill a body slot the catalog did not sign.
      return { ...eacMuxFromTimeline(timeline), ...generalMuxFromSigned(signed) };
    },
    [versionId]
  );

  const applyBundle = useCallback(async (bundle: Parameters<typeof assemblePreviewResult>[0]) => {
    const normalized = assemblePreviewResult(bundle);
    const generalMuxUrls = await generalMuxFor(normalized.timelineProfileData);
    if (cancelledRef.current) return;

    profileRef.current = normalized.behaviorProfileData;
    timelineRef.current = normalized.timelineProfileData;
    setModelResponseData(normalized.modelResponseData);
    setBehaviorProfileData(normalized.behaviorProfileData);
    setTimelineProfileData(normalized.timelineProfileData);
    setGeneralMuxUrls(generalMuxUrls);
    setPageData(normalized.reportPage);
    setGenerateStatus("done");
    setLoading(false);

    const heroGif =
      generalMuxUrls["overall_break_down_of_bpm_and_9_markers"]
        ?.thumbnail_gif_url;
    if (heroGif) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = heroGif;
      });
    }
  }, [generalMuxFor]);

  const runFetchFlow = useCallback(
    async (forceFetch: boolean) => {
      const cached = readPreviewResultCache(versionId);

      // Manual UI fixture only. Never written by the walk, and ignored once
      // this tab has real answers from a finished questionnaire.
      if (!cached || cached.answers.length < 1) {
        const debugBundle = readDebugPreviewBundle();
        if (debugBundle) {
          await applyBundle(debugBundle);
          return;
        }
        if (!cancelledRef.current) {
          setGenerateError(
            "Finish the questionnaire first so we have answers to score."
          );
          setGenerateStatus("error");
          setLoading(false);
        }
        return;
      }

      // Same answers already scored. Do not call generate-report/ again.
      if (!forceFetch && cached.bundle) {
        await applyBundle(cached.bundle);
        return;
      }

      const scored = await loadPreviewBundle(versionId, cached.answers);
      if (cancelledRef.current) return;

      if (scored.status === 401) {
        router.replace("/login");
        return;
      }

      if (!scored.ok) {
        setGenerateError(scored.error);
        setGenerateStatus(scored.status === 503 ? "unavailable" : "error");
        setLoading(false);
        return;
      }

      writePreviewResultCache(versionId, {
        answers: cached.answers,
        answersHash: hashAnswers(cached.answers),
        bundle: scored.bundle,
      });
      await applyBundle(scored.bundle);
    },
    [applyBundle, router, versionId]
  );

  useEffect(() => {
    cancelledRef.current = false;
    runFetchFlow(false);
    return () => {
      cancelledRef.current = true;
    };
  }, [runFetchFlow]);

  const handleRetry = () => {
    cancelledRef.current = false;
    setGenerateStatus("generating");
    setGenerateError(null);
    setError(null);
    setPageData(null);
    setLoading(true);
    void runFetchFlow(true);
  };

  const resignVideos = useCallback(async () => {
    const ids = collectPlaybackIds(profileRef.current, timelineRef.current);
    const signed = await refreshMuxUrls(versionId, ids);
    if (!signed || cancelledRef.current) return;
    const nextProfile = patchSignedUrls(profileRef.current, signed);
    const nextTimeline = patchSignedUrls(timelineRef.current, signed);
    profileRef.current = nextProfile;
    timelineRef.current = nextTimeline;
    setBehaviorProfileData(nextProfile);
    setTimelineProfileData(nextTimeline);
    setGeneralMuxUrls(await generalMuxFor(nextTimeline));
  }, [generalMuxFor, versionId]);

  if (generateStatus === "generating") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary-background gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-secondary-background" />
        <p className="text-primary-text font-medium text-lg">Generating your report…</p>
        <p className="text-primary-text/50 text-sm">This may take a moment.</p>
      </div>
    );
  }

  if (generateStatus === "unavailable") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-background px-6">
        <p className="text-primary-text font-medium text-lg text-center max-w-md">
          {generateError}
        </p>
      </div>
    );
  }

  if (generateStatus === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary-background gap-6 px-6">
        <p className="text-primary-text font-medium text-lg text-center max-w-md">
          {generateError}
        </p>
        <button
          onClick={handleRetry}
          className="bg-primary-text text-primary-background font-medium text-base px-8 py-4 rounded-full hover:bg-primary-text/90 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-background">
        <Loader2
          className="mb-4 h-12 w-12 animate-spin text-secondary-background"
          data-testid="loading-spinner"
        />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen w-full m-0 overflow-y-auto bg-primary-background text-primary-text flex items-center justify-center">
        <p className="text-primary-text text-xl">
          Error loading page data. Please try again later.
        </p>
      </div>
    );
  }

  const { campaign, calendly, status } = pageData;

  if (status !== "success") {
    console.warn("Backend status is not 'success', redirecting.");
  }

  const lowerCaseCampaign =
    typeof campaign === "string" ? campaign.toLowerCase() : "";

  if (
    [
      "social",
      "retargeting",
      "men",
      "women",
      "general",
      "newlandingpage",
      "manychat",
      "selfstudy",
      "podcast",
    ].some((item) => lowerCaseCampaign.includes(item))
  ) {
    isPaidUser = true;
  } else if (["strategist"].some((item) => lowerCaseCampaign.includes(item))) {
    isBsUser = true;
    if (
      pageData.origin_owner_email?.toLowerCase() === "contact@bizziegold.com"
    ) {
      isBsVIPUser = true;
      isBsUser = false;
    }
  } else if (
    ["practitioner"].some((item) => lowerCaseCampaign.includes(item))
  ) {
    isPractitionerUser = true;
  } else if (["gift_of_bpm"].some((item) => lowerCaseCampaign.includes(item))) {
    isGiftUser = true;
  } else if (
    ["ytt-training"].some((item) => lowerCaseCampaign.includes(item))
  ) {
    isMiscCampaignUser = true;
  } else if (lowerCaseCampaign.includes("premium")) {
    isPremiumUser = true;
  } else if (lowerCaseCampaign.includes("book-qr")) {
    isBookQrUser = true;
  } else if (lowerCaseCampaign.includes("corporate-funnel")) {
    isCorporateFunnelUser = true;
  } else if (["book"].some((item) => lowerCaseCampaign.includes(item))) {
    isBookUser = true;
  } else if (lowerCaseCampaign.includes("freelink-gordon-only")) {
    isGordonOnlyUser = true;
  } else if (lowerCaseCampaign.includes("bpm-circle-1")) {
    isCircleUser = true;
  } else {
    isFreeUser = true;
  }

  const calendarLink = pageData.calendly || "";

  const showCalendly = Boolean(pageData.origin_owner_name) && !isBookUser && !isCircleUser;

  const showBonusVideos = isPaidUser || isPractitionerUser || isGiftUser;

  const hasPattern = behaviorProfileData !== null;

  void scrollToBonusVideos;
  void calendly;
  void isFreeUser;
  void isBsUser;
  void isPractitionerUser;
  void isGiftUser;
  void isPremiumUser;
  void isGordonOnlyUser;
  void showBonusVideos;

  return (
    <MuxTokenProvider
      value={{
        generalMuxUrls,
        onBeforePlay: async () => {},
        onTokenError: resignVideos,
      }}
    >
      <CompletedUserUI
        isBookUser={isBookUser}
        isMiscCampaignUser={isMiscCampaignUser}
        isBookQrUser={isBookQrUser}
        isCorporateFunnelUser={isCorporateFunnelUser}
        showCalendly={showCalendly}
        calendarLink={calendarLink}
        isBsVIPUser={isBsVIPUser}
        modelResponseData={modelResponseData}
        behaviorProfileData={behaviorProfileData}
        timelineProfileData={timelineProfileData}
        hasPattern={hasPattern}
        userName={userName}
      />
    </MuxTokenProvider>
  );
}
