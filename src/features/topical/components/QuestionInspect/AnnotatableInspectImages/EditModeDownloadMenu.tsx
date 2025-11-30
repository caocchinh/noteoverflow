import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PdfViewerWrapperHandle } from "@/features/topical/constants/types";
import { Download } from "lucide-react";
import { memo, RefObject } from "react";
import DownloadOrginalButton from "./DownloadOrginalButton";
import DownloadWithAnnotationsButton from "./DownloadWithAnnotationsButton";

const EditModeDownloadMenu = memo(
  ({
    pdfBlob,
    fileName,
    pdfViewerRef,
    isPdfViewerLoaded,
    isSessionFetching,
  }: {
    pdfBlob: Blob | null;
    fileName: string;
    pdfViewerRef: RefObject<PdfViewerWrapperHandle | null>;
    isPdfViewerLoaded: boolean;
    isSessionFetching: boolean;
  }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="cursor-pointer h-[26px]"
            disabled={!pdfBlob || isSessionFetching}
            variant="outline"
          >
            <span className="hidden sm:block">Download</span>
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-999998 flex flex-col dark:bg-accent p-2 gap-2">
          <DownloadOrginalButton
            pdfBlob={pdfBlob}
            fileName={fileName}
            isSessionFetching={isSessionFetching}
          />
          <DownloadWithAnnotationsButton
            fileName={fileName}
            isPdfViewerLoaded={isPdfViewerLoaded}
            pdfViewerRef={pdfViewerRef}
            isSessionFetching={isSessionFetching}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

EditModeDownloadMenu.displayName = "EditModeDownloadMenu";

export default EditModeDownloadMenu;
