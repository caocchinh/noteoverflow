import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Trash2, X as XIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { toast } from "sonner";
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
          className="dark:bg-muted z-9999999 w-[85%] max-w-[475px]! px-2!"
          overlayClassName="z-[999999]"
        >
          <DialogHeader>
            <DialogTitle className="text-center">Paper details</DialogTitle>
            <DialogDescription className="sr-only">
              Check the paper details before visiting the paper
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[83dvh] w-full px-4" type="always">
            {/* Paper Details Card */}
            <div className="border-border from-background via-accent/30 to-accent/50 relative rounded-xl border bg-linear-to-br p-6 shadow-lg">
              <div className="relative z-10 grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      Curriculum
                    </span>
                    <span className="text-foreground bg-accent/50 rounded-lg border px-3 py-2 text-sm font-semibold">
                      {selectedCurriculum}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      Subject
                    </span>
                    <span
                      className="text-foreground bg-accent/50 truncate rounded-lg border px-3 py-2 text-sm font-semibold"
                      title={selectedSubject}
                    >
                      {selectedSubject}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      Paper
                    </span>
                    <span className="text-foreground bg-accent/50 rounded-lg border px-3 py-2 text-sm font-semibold">
                      Paper {selectedPaperType} Variant {selectedVariant}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      Year
                    </span>
                    <span className="text-foreground bg-accent/50 rounded-lg border px-3 py-2 text-sm font-semibold">
                      {selectedYear}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Exam Season
                  </span>
                  <span className="text-foreground bg-accent/50 rounded-lg border px-3 py-2 text-sm font-semibold">
                    {selectedSeason} {seasonAbbreviation}
                  </span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Paper code
                  </span>
                  <span
                    className="text-foreground bg-accent/50 cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold"
                    title="Click to copy paper code"
                    onClick={handleCopyPaperCode}
                  >
                    {quickCodeInput}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex w-full flex-col items-center justify-center gap-3 sm:mt-2 sm:flex-row sm:gap-2">
              <Button className="w-full cursor-pointer sm:w-[49%]" asChild>
                <a
                  href={msLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  ref={markingSchemeButtonRef}
                >
                  Open marking scheme <ExternalLink />
                </a>
              </Button>
              <Button className="w-full cursor-pointer sm:w-[49%]" asChild>
                <a href={qpLink} target="_blank" rel="noopener noreferrer">
                  Open question paper <ExternalLink />
                </a>
              </Button>
            </div>

            <div className="mt-3 flex w-full flex-col items-center justify-center gap-3 sm:mt-2 sm:flex-row sm:gap-2">
              <Button className="w-full cursor-pointer sm:w-[49%]" asChild>
                <a href={erLink} target="_blank" rel="noopener noreferrer">
                  Open examiner report <ExternalLink />
                </a>
              </Button>
              <Button className="w-full cursor-pointer sm:w-[49%]" asChild>
                <a href={gtLink} target="_blank" rel="noopener noreferrer">
                  Open grade threshold <ExternalLink />
                </a>
              </Button>
            </div>

            <Button className="mt-3 w-full cursor-pointer" onClick={handleClose}>
              Close <XIcon />
            </Button>

            <Button
              className="mt-3 w-full cursor-pointer"
              variant="destructive"
              onClick={handleClearAndClose}
            >
              Clear Everything <Trash2 />
            </Button>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  },
);

PaperDetailsDialog.displayName = "PaperDetailsDialog";

export default PaperDetailsDialog;
