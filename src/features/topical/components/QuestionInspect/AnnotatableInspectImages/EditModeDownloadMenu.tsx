import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PdfViewerWrapperHandle } from "@/features/topical/constants/types";
import { Download } from "lucide-react";
import { memo, RefObject, useCallback, useMemo } from "react";
import DownloadWithAnnotationsButton from "./DownloadWithAnnotationsButton";
import DownloadButton from "./DownloadButton";

const EditModeDownloadMenu = memo(
  ({
    pdfBlob,
    pdfViewerRef,
    isPdfViewerLoaded,
    isSessionFetching,
    generatePdfBlob,
    pdfBaseFileName,
    typeOfView,
  }: {
    pdfBlob: Blob | null;
    pdfViewerRef: RefObject<PdfViewerWrapperHandle | null>;
    isPdfViewerLoaded: boolean;
    typeOfView: "question" | "answer";
    isSessionFetching: boolean;
    generatePdfBlob: ({
      typeOfContent,
    }: {
      typeOfContent: "question" | "answer" | "question-with-answers";
    }) => Promise<Blob | null>;
    pdfBaseFileName: string;
  }) => {
    const fileNameWithLabel = useMemo(() => {
      if (typeOfView === "question") {
        return `${pdfBaseFileName} - Annotated question`;
      } else if (typeOfView === "answer") {
        return `${pdfBaseFileName} - Annotated answer`;
      }
      return `${pdfBaseFileName}`;
    }, [pdfBaseFileName, typeOfView]);

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
        <DropdownMenuContent
          className="z-999998 flex flex-col dark:bg-accent p-2 gap-2"
          data-annotatable-download-menu
        >
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
            fileName={fileNameWithLabel}
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
