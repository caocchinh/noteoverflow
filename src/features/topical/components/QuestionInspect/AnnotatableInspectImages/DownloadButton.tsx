import { Button } from "@/components/ui/button";
import { handleDownloadPdf } from "@/features/topical/lib/utils";
import { Loader2 } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

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

    const handleDownload = useCallback(async () => {
      setIsGenerating(true);
      try {
        const blob = await onGeneratePdf();
        handleDownloadPdf(blob, `${pdfBaseFileName} - ${label}.pdf`);
      } finally {
        setIsGenerating(false);
      }
    }, [onGeneratePdf, pdfBaseFileName, label]);

    return (
      <Button
        className="cursor-pointer h-[26px]"
        variant="outline"
        onClick={handleDownload}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span>Generating</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            <span>{label}</span>
          </>
        )}
      </Button>
    );
  }
);

DownloadButton.displayName = "DownloadButton";

export default DownloadButton;
