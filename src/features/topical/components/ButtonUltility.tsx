import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { BrushCleaning, ScanText, Undo2, X } from "lucide-react";
import { FilterData, SortParameters } from "../constants/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { computeWeightedScoreByArrayIndex } from "../lib/utils";
import {
  PAPER_TYPE_SORT_DEFAULT_WEIGHT,
  SEASON_SORT_DEFAULT_WEIGHT,
  YEAR_SORT_DEFAULT_WEIGHT,
  TOPIC_SORT_DEFAULT_WEIGHT,
} from "../constants/constants";
import { useState } from "react";

export default function ButtonUltility({
  resetEverything,
  setIsSidebarOpen,
  setSortParameters,
  isMounted,
  isValidInput,
  setIsSearchEnabled,
  revert,
  setCurrentQuery,
  query,
}: {
  resetEverything: () => void;
  setIsSidebarOpen: (value: boolean) => void;
  revert: () => void;
  setSortParameters: (value: SortParameters | null) => void;
  isMounted: boolean;
  isValidInput: ({ scrollOnError }: { scrollOnError?: boolean }) => boolean;
  setIsSearchEnabled: (value: boolean) => void;
  setCurrentQuery: (
    value: {
      curriculumId: string;
      subjectId: string;
    } & FilterData
  ) => void;
  query: {
    curriculumId: string;
    subjectId: string;
  } & FilterData;
}) {
  const { theme } = useTheme();
  const isMobileDevice = useIsMobile();
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);
  const [isRevertConfirmationOpen, setIsRevertConfirmationOpen] =
    useState(false);

  return (
    <>
      <Button
        className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
        disabled={!isMounted}
        onClick={() => {
          if (isValidInput({ scrollOnError: true })) {
            if (isMobileDevice) {
              setIsSidebarOpen(false);
            }
            setIsSearchEnabled(true);
            setCurrentQuery({
              ...query,
            });
            setSortParameters({
              paperType: {
                data: computeWeightedScoreByArrayIndex({
                  data: query.paperType,
                }),
                weight: PAPER_TYPE_SORT_DEFAULT_WEIGHT,
              },
              topic: {
                data: computeWeightedScoreByArrayIndex({
                  data: query.topic,
                }),
                weight: TOPIC_SORT_DEFAULT_WEIGHT,
              },
              year: {
                data: computeWeightedScoreByArrayIndex({
                  data: query.year,
                }),
                weight: YEAR_SORT_DEFAULT_WEIGHT,
              },
              season: {
                data: computeWeightedScoreByArrayIndex({
                  data: query.season,
                }),
                weight: SEASON_SORT_DEFAULT_WEIGHT,
              },
            });
          }
        }}
      >
        Search
        <ScanText />
      </Button>
      <Dialog
        onOpenChange={setIsClearConfirmationOpen}
        open={isClearConfirmationOpen}
      >
        <DialogTrigger asChild>
          <Button
            className="w-full cursor-pointer"
            disabled={!isMounted}
            variant="outline"
          >
            Clear
            <BrushCleaning />
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-md z-[100007]"
          overlayClassName="!z-[100006]"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Clear all</DialogTitle>
            <DialogDescription>
              This will clear all the selected options and reset the filter. Are
              you sure you want to clear?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="cursor-pointer" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer"
              onClick={() => {
                resetEverything();
                setIsClearConfirmationOpen(false);
              }}
            >
              Clear
              <BrushCleaning />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        onOpenChange={setIsRevertConfirmationOpen}
        open={isRevertConfirmationOpen}
      >
        <DialogTrigger asChild>
          <Button
            className="w-full cursor-pointer !bg-[#fd8231] !text-white"
            disabled={!isMounted}
            variant="outline"
          >
            Revert back
            <Undo2 />
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Revert back</DialogTitle>
            <DialogDescription>
              This will revert back to the last search filter that currently
              displaying{" "}
              <span className="text-[#fd8231]">
                (If you didn&apos;t search, this won&apos;t do anything)
              </span>
              . Are you sure you want to revert?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="cursor-pointer" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer"
              onClick={() => {
                revert();
                setIsRevertConfirmationOpen(false);
              }}
            >
              Revert
              <Undo2 />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button
        className="w-full cursor-pointer"
        onClick={() => {
          setIsSidebarOpen(false);
        }}
        variant={theme === "dark" && isMounted ? "destructive" : "default"}
      >
        Close filter
        <X className="h-4 w-4" />
      </Button>
    </>
  );
}
