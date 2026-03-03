import { Button } from "@/components/ui/button";
import { PdfViewerWrapperHandle } from "@/features/topical/types/components";
import { Brush } from "lucide-react";
import { memo, RefObject } from "react";

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
        className="h-[26px] cursor-pointer"
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
  },
);

ClearAllButton.displayName = "ClearAllButton";
export default ClearAllButton;
