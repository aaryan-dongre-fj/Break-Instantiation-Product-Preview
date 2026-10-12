"use client";

import { Document } from "@react-pdf/renderer";
import { instance } from "@/utils/instance";
import RpPage1 from "./RpPage1";
import RpPage3 from "./RpPage3";
import RpPage4 from "./RpPage4";
import RpPage5 from "./RpPage5";
import RpPage6 from "./RpPage6";

interface ReportPdfDocumentProps {
  modelResponseData: any;
  behaviorProfileData: any;
  timelineProfileData: any;
  userName?: string;
}

export default function ReportPdfDocument({
  modelResponseData,
  behaviorProfileData,
  timelineProfileData,
  userName,
}: ReportPdfDocumentProps) {
  return (
    <Document title={`${instance.productName} report`} author={instance.productName}>
      <RpPage1 behaviorProfileData={behaviorProfileData} userName={userName} />
      <RpPage3 behaviorProfileData={behaviorProfileData} />
      <RpPage4
        behaviorProfileData={behaviorProfileData}
        timelineProfileData={timelineProfileData}
      />
      <RpPage5
        modelResponseData={modelResponseData}
        timelineProfileData={timelineProfileData}
        behaviorProfileData={behaviorProfileData}
      />
      <RpPage6 behaviorProfileData={behaviorProfileData} />
    </Document>
  );
}
