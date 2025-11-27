import { memo, RefObject, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { PdfViewerWrapperHandle } from "@/features/topical/constants/types";
import { Loader2 } from "lucide-react";

const DownloadWithAnnotationsButton = memo(
  ({
    fileName,
    pdfViewerRef,
    isPdfViewerLoaded,
    isSessionFetching,
  }: {
    fileName: string;
    pdfViewerRef: RefObject<PdfViewerWrapperHandle | null>;
    isPdfViewerLoaded: boolean;
    isSessionFetching: boolean;
  }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = useCallback(async () => {
      if (!pdfViewerRef.current || !isPdfViewerLoaded) return;

      setIsGenerating(true);
      try {
        const pdfWithAnnotations =
          await pdfViewerRef.current.exportPdfWithAnnotations();

        if (!pdfWithAnnotations) {
          console.error("Failed to export PDF with annotations");
          return;
        }

        const url = URL.createObjectURL(pdfWithAnnotations);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading PDF with annotations:", error);
      } finally {
        setIsGenerating(false);
      }
    }, [fileName, isPdfViewerLoaded, pdfViewerRef]);

    return (
      <Button
        className="cursor-pointer h-[26px]"
        disabled={isSessionFetching || !isPdfViewerLoaded || isGenerating}
        variant="outline"
        onClick={handleDownload}
      >
        {isGenerating ? (
          <>
            <span>Generating</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          "With annotations"
        )}
      </Button>
    );
  }
);

DownloadWithAnnotationsButton.displayName = "DownloadWithAnnotationsButton";

export default DownloadWithAnnotationsButton;
