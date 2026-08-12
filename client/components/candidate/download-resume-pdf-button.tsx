"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { ResumePdfDocument } from "@/components/candidate/resume-pdf-document";
import type { ResumeDetail, Profile } from "@/lib/api";

export function DownloadResumePdfButton({
  resume,
  profile,
  variant = "outline",
  size = "sm",
}: {
  resume: ResumeDetail;
  profile: Profile | null;
  variant?: "outline" | "default" | "ghost";
  size?: "sm" | "default";
}) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Generated entirely in the browser — no server round-trip, no
      // Cloudinary upload. The blob is created locally, downloaded, and
      // then immediately discarded (the object URL is revoked below).
      const blob = await pdf(<ResumePdfDocument resume={resume} profile={profile} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.title.replace(/[^a-z0-9]+/gi, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Download PDF
    </Button>
  );
}
