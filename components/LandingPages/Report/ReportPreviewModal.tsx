"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Load PDFViewer and ReportPdfDocument together so PDFViewer always receives
// a valid Document element — never a lazy placeholder.
const PdfPreview = dynamic(
  async () => {
    const [{ PDFViewer }, { default: ReportPdfDocument }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./pdf/ReportPdfDocument"),
    ]);
    function PdfPreview({ modelResponseData, behaviorProfileData, timelineProfileData, userName }: {
      modelResponseData: any; behaviorProfileData: any; timelineProfileData: any; userName?: string;
    }) {
      return (
        <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: "none" }}>
          <ReportPdfDocument
            modelResponseData={modelResponseData}
            behaviorProfileData={behaviorProfileData}
            timelineProfileData={timelineProfileData}
            userName={userName}
          />
        </PDFViewer>
      );
    }
    return PdfPreview;
  },
  { ssr: false, loading: () => <PdfLoading /> }
);

function PdfLoading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#D1CBC2]/50">
      <Loader2 className="w-8 h-8 animate-spin text-secondary-background" />
    </div>
  );
}

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelResponseData: any;
  behaviorProfileData: any;
  timelineProfileData: any;
  userName?: string;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  modelResponseData,
  behaviorProfileData,
  timelineProfileData,
  userName = "User",
}: ReportPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const [{ pdf }, { default: ReportPdfDoc }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./pdf/ReportPdfDocument"),
      ]);

      const blob = await pdf(
        <ReportPdfDoc
          modelResponseData={modelResponseData}
          behaviorProfileData={behaviorProfileData}
          timelineProfileData={timelineProfileData}
          userName={userName}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Company_X_report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [modelResponseData, behaviorProfileData, timelineProfileData]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[1000px] h-[90vh] bg-[#F7F2EA] rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-6 border-b border-black/5 bg-white z-20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-background/10 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-secondary-background" />
                </div>
                <h3 className="text-xl font-bold text-primary-text tracking-tight leading-none">
                  Your{" "}
                  <span className="font-serif italic text-secondary-background font-light">
                    report
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-3 bg-secondary-background text-white px-8 py-3 rounded-full hover:bg-secondary-background/90 transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-secondary-background/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {downloading ? "Generating…" : "Download PDF"}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 rounded-full transition-all duration-300 text-black/40 hover:text-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="flex-1 overflow-hidden">
              {isOpen && (
                <PdfPreview
                  modelResponseData={modelResponseData}
                  behaviorProfileData={behaviorProfileData}
                  timelineProfileData={timelineProfileData}
                  userName={userName}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
