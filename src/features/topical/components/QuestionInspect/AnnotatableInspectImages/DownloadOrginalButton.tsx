import { Button } from "@/components/ui/button";
import { handleDownloadPdf } from "@/features/topical/lib/utils";
import { memo, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

const DownloadOrginalButton = memo(
  ({
    pdfBlob,
    fileName,
    isSessionFetching,
  }: {
    pdfBlob: Blob | null;
    fileName: string;
    isSessionFetching: boolean;
  }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = useCallback(async () => {
      if (!pdfBlob) return;

      setIsGenerating(true);
      try {
        handleDownloadPdf(pdfBlob, fileName);
      } finally {
        setIsGenerating(false);
      }
    }, [pdfBlob, fileName]);

    return (
      <Button
        className="cursor-pointer h-[26px]"
        disabled={!pdfBlob || isSessionFetching || isGenerating}
        variant="outline"
        onClick={handleDownload}
      >
        {isGenerating ? (
          <>
            <span>Downloading</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          "Original"
        )}
      </Button>
    );
  }
);

DownloadOrginalButton.displayName = "DownloadOrginalButton";
export default DownloadOrginalButton;
