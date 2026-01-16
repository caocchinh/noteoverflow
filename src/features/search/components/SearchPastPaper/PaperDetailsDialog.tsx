import { memo, useCallback, useMemo } from "react";
import { ExternalLink, Trash2, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaperDetailsDialogProps } from "./types";

const PaperDetailsDialog = memo(
  ({
    isOpen,
    onOpenChange,
    selectedCurriculum,
    selectedSubject,
    selectedPaperType,
    selectedVariant,
    selectedSeason,
    selectedYear,
    quickCodeInput,
    parseLink,
    onClearEverything,
    markingSchemeButtonRef,
  }: PaperDetailsDialogProps) => {
    const handleCopyPaperCode = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(quickCodeInput);
        toast.success("Paper code copied to clipboard!", {
          description: `${quickCodeInput} is now in your clipboard`,
          duration: 3000,
        });
      } catch {
        toast.error("Failed to copy to clipboard", {
          description: "Please try selecting and copying manually",
          duration: 3000,
        });
      }
    }, [quickCodeInput]);

    const seasonAbbreviation = useMemo(() => {
      switch (selectedSeason) {
        case "Spring":
          return "(F/M)";
        case "Summer":
          return "(M/J)";
        default:
          return "(O/N)";
      }
    }, [selectedSeason]);

    const handleClose = useCallback(() => {
      onOpenChange(false);
    }, [onOpenChange]);

    const handleClearAndClose = useCallback(() => {
      onClearEverything();
      onOpenChange(false);
    }, [onClearEverything, onOpenChange]);

    const msLink = useMemo(() => parseLink({ type: "ms" }), [parseLink]);
    const qpLink = useMemo(() => parseLink({ type: "qp" }), [parseLink]);
    const erLink = useMemo(() => parseLink({ type: "er" }), [parseLink]);
    const gtLink = useMemo(() => parseLink({ type: "gt" }), [parseLink]);

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="dark:bg-muted z-9999999 max-w-[475px]! w-[85%] px-2!"
          overlayClassName="z-[999999]"
        >
          <DialogHeader>
            <DialogTitle className="text-center">Paper details</DialogTitle>
            <DialogDescription className="sr-only">
              Check the paper details before visiting the paper
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="w-full h-[83dvh] px-4" type="always">
            {/* Paper Details Card */}
            <div className="relative rounded-xl border border-border bg-linear-to-br from-background via-accent/30 to-accent/50 p-6 shadow-lg">
              <div className="relative z-10 grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Curriculum
                    </span>
                    <span className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border">
                      {selectedCurriculum}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Subject
                    </span>
                    <span
                      className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border truncate"
                      title={selectedSubject}
                    >
                      {selectedSubject}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Paper
                    </span>
                    <span className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border">
                      Paper {selectedPaperType} Variant {selectedVariant}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Year
                    </span>
                    <span className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border">
                      {selectedYear}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Exam Season
                  </span>
                  <span className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border">
                    {selectedSeason} {seasonAbbreviation}
                  </span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Paper code
                  </span>
                  <span
                    className="text-sm font-semibold cursor-pointer text-foreground bg-accent/50 px-3 py-2 rounded-lg border"
                    title="Click to copy paper code"
                    onClick={handleCopyPaperCode}
                  >
                    {quickCodeInput}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full items-center justify-center sm:mt-2 mt-3">
              <Button className="w-full sm:w-[49%] cursor-pointer" asChild>
                <a
                  href={msLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  ref={markingSchemeButtonRef}
                >
                  Open marking scheme <ExternalLink />
                </a>
              </Button>
              <Button className="w-full sm:w-[49%] cursor-pointer" asChild>
                <a href={qpLink} target="_blank" rel="noopener noreferrer">
                  Open question paper <ExternalLink />
                </a>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full items-center justify-center mt-3 sm:mt-2">
              <Button className="w-full sm:w-[49%] cursor-pointer" asChild>
                <a href={erLink} target="_blank" rel="noopener noreferrer">
                  Open examiner report <ExternalLink />
                </a>
              </Button>
              <Button className="w-full sm:w-[49%] cursor-pointer" asChild>
                <a href={gtLink} target="_blank" rel="noopener noreferrer">
                  Open grade threshold <ExternalLink />
                </a>
              </Button>
            </div>

            <Button
              className="w-full mt-3 cursor-pointer"
              onClick={handleClose}
            >
              Close <XIcon />
            </Button>

            <Button
              className="w-full mt-3 cursor-pointer"
              variant="destructive"
              onClick={handleClearAndClose}
            >
              Clear Everything <Trash2 />
            </Button>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }
);

PaperDetailsDialog.displayName = "PaperDetailsDialog";

export default PaperDetailsDialog;
