import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { memo, useCallback } from "react";
import DownloadButton from "./DownloadButton";

const NonEditModeDownloadMenu = memo(
  ({
    generatePdfBlob,
    pdfBaseFileName,
  }: {
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
          <Button className="cursor-pointer h-[26px]" variant="outline">
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
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

NonEditModeDownloadMenu.displayName = "NonEditModeDownloadMenu";

export default NonEditModeDownloadMenu;
