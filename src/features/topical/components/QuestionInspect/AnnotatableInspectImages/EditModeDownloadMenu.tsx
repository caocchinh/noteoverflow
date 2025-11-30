import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PdfViewerWrapperHandle } from "@/features/topical/constants/types";
import { Download } from "lucide-react";
import { memo, RefObject, useCallback } from "react";
import DownloadWithAnnotationsButton from "./DownloadWithAnnotationsButton";
import DownloadButton from "./DownloadButton";

const EditModeDownloadMenu = memo(
  ({
    pdfBlob,
    fileName,
    pdfViewerRef,
    isPdfViewerLoaded,
    isSessionFetching,
    generatePdfBlob,
    pdfBaseFileName,
  }: {
    pdfBlob: Blob | null;
    fileName: string;
    pdfViewerRef: RefObject<PdfViewerWrapperHandle | null>;
    isPdfViewerLoaded: boolean;
    isSessionFetching: boolean;
    generatePdfBlob: ({
      typeOfContent,
    }: {
      typeOfContent: "question" | "answer" | "question-with-answers";
    }) => Promise<Blob | null>;
    pdfBaseFileName: string;
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
          <DownloadButton
            onGeneratePdf={useCallback(
              () => generatePdfBlob({ typeOfContent: "question" }),
              [generatePdfBlob]
            )}
            pdfBaseFileName={pdfBaseFileName}
            typeOfDownload="question"
          />
          <DownloadButton
            onGeneratePdf={useCallback(
              () => generatePdfBlob({ typeOfContent: "answer" }),
              [generatePdfBlob]
            )}
            pdfBaseFileName={pdfBaseFileName}
            typeOfDownload="answer"
          />
          <DownloadButton
            onGeneratePdf={useCallback(
              () => generatePdfBlob({ typeOfContent: "question-with-answers" }),
              [generatePdfBlob]
            )}
            pdfBaseFileName={pdfBaseFileName}
            typeOfDownload="question-with-answers"
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
