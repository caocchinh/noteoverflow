import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2 } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { handleDownloadPdf } from "@/features/topical/lib/utils";

const DownloadButton = memo(
  ({
    onGeneratePdf,
    pdfBaseFileName,
    typeOfDownload,
  }: {
    onGeneratePdf: () => Promise<Blob | null>;
    pdfBaseFileName: string;
    typeOfDownload: "question" | "answer" | "question-with-answers";
  }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = useCallback(async () => {
      setIsGenerating(true);
      try {
        const blob = await onGeneratePdf();
        handleDownloadPdf(blob, pdfBaseFileName);
      } finally {
        setIsGenerating(false);
      }
    }, [onGeneratePdf, pdfBaseFileName]);

    const label = useMemo(() => {
      switch (typeOfDownload) {
        case "question":
          return "Question only";
        case "answer":
          return "Answer only";
        case "question-with-answers":
          return "Question with answer";
      }
    }, [typeOfDownload]);

    return (
      <Button
        className="cursor-pointer h-[26px]"
        variant="outline"
        onClick={handleDownload}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="hidden sm:block">Generating</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            <span className="hidden sm:block">{label}</span>
          </>
        )}
      </Button>
    );
  }
);

DownloadButton.displayName = "DownloadButton";

const NonEditModeDownloadMenu = memo(
  ({
    onGeneratePdf,
    pdfBaseFileName,
  }: {
    onGeneratePdf: () => Promise<Blob | null>;
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
        <DropdownMenuContent className="z-999998 flex flex-col dark:bg-accent p-2 gap-2">
          <DownloadButton
            onGeneratePdf={onGeneratePdf}
            pdfBaseFileName={pdfBaseFileName}
            typeOfDownload="question"
          />
          <DownloadButton
            onGeneratePdf={onGeneratePdf}
            pdfBaseFileName={pdfBaseFileName}
            typeOfDownload="answer"
          />
          <DownloadButton
            onGeneratePdf={onGeneratePdf}
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
