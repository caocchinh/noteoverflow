import { memo, RefObject, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PdfViewerWrapperHandle } from "@/features/topical/constants/types";

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
    const handleDownload = useCallback(async () => {
      if (!pdfViewerRef.current || !isPdfViewerLoaded) return;

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
      }
    }, [fileName, isPdfViewerLoaded, pdfViewerRef]);

    return (
      <Button
        className="cursor-pointer h-[26px]"
        disabled={isSessionFetching || !isPdfViewerLoaded}
        variant="outline"
        onClick={handleDownload}
      >
        With annotations
      </Button>
    );
  }
);

DownloadWithAnnotationsButton.displayName = "DownloadWithAnnotationsButton";

export default DownloadWithAnnotationsButton;
