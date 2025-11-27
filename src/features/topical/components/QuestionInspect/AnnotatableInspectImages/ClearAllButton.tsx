import { memo, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Brush } from "lucide-react";
import { PdfViewerWrapperHandle } from "@/features/topical/constants/types";

const ClearAllButton = memo(
  ({
    pdfViewerRef,
    isPdfViewerLoaded,
    isSessionFetching,
  }: {
    pdfViewerRef: RefObject<PdfViewerWrapperHandle | null>;
    isPdfViewerLoaded: boolean;
    isSessionFetching: boolean;
  }) => {
    return (
      <Button
        className="cursor-pointer h-[26px]"
        disabled={isSessionFetching || !isPdfViewerLoaded}
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          pdfViewerRef.current?.deleteAllAnnotations();
        }}
        title="Clear all annotations"
      >
        <span className="hidden sm:block">Clear all</span>
        <Brush className="h-4 w-4" />
      </Button>
    );
  }
);

ClearAllButton.displayName = "ClearAllButton";
export default ClearAllButton;
