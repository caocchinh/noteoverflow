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
import { BrushCleaning, ScanText, X } from "lucide-react";
import { FilterData, SortParameters } from "../constants/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { computeWeightedScoreByArrayIndex } from "../lib/utils";
import {
  PAPER_TYPE_SORT_DEFAULT_WEIGHT,
  SEASON_SORT_DEFAULT_WEIGHT,
  YEAR_SORT_DEFAULT_WEIGHT,
  TOPIC_SORT_DEFAULT_WEIGHT,
} from "../constants/constants";

export default function ButtonUltility({
  isResetConfirmationOpen,
  setIsResetConfirmationOpen,
  resetEverything,
  setIsSidebarOpen,
  setSortParameters,
  isMounted,
  isValidInput,
  setIsSearchEnabled,
  setCurrentQuery,
  query,
}: {
  isResetConfirmationOpen: boolean;
  setIsResetConfirmationOpen: (value: boolean) => void;
  resetEverything: () => void;
  setIsSidebarOpen: (value: boolean) => void;
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
                  weightMultiplier: PAPER_TYPE_SORT_DEFAULT_WEIGHT,
                }),
                weight: PAPER_TYPE_SORT_DEFAULT_WEIGHT,
              },
              topic: {
                data: computeWeightedScoreByArrayIndex({
                  data: query.topic,
                  weightMultiplier: TOPIC_SORT_DEFAULT_WEIGHT,
                }),
                weight: TOPIC_SORT_DEFAULT_WEIGHT,
              },
              year: {
                data: computeWeightedScoreByArrayIndex({
                  data: query.year,
                  weightMultiplier: YEAR_SORT_DEFAULT_WEIGHT,
                }),
                weight: YEAR_SORT_DEFAULT_WEIGHT,
              },
              season: {
                data: computeWeightedScoreByArrayIndex({
                  data: query.season,
                  weightMultiplier: SEASON_SORT_DEFAULT_WEIGHT,
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
        onOpenChange={setIsResetConfirmationOpen}
        open={isResetConfirmationOpen}
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
                setIsResetConfirmationOpen(false);
              }}
            >
              Clear
              <BrushCleaning />
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
