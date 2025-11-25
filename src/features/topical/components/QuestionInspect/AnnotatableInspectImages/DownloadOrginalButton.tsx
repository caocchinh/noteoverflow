import { Button } from "@/components/ui/button";
import { handleDownloadPdf } from "@/features/topical/lib/utils";
import { memo } from "react";

const DownloadOrginalButton = memo(
  ({
    pdfBlob,
    fileName,
    isSessionFetching,
  }: {
    pdfBlob: Blob | null;
    fileName: string;
    isSessionFetching: boolean;
  }) => {
    return (
      <Button
        className="cursor-pointer h-[26px]"
        disabled={!pdfBlob || isSessionFetching}
        variant="outline"
        onClick={() => handleDownloadPdf(pdfBlob, fileName)}
      >
        Original
      </Button>
    );
  }
);

DownloadOrginalButton.displayName = "DownloadOrginalButton";
export default DownloadOrginalButton;
