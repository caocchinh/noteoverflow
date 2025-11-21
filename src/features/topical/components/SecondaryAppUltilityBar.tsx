import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Sort from "./Sort";
import { Separator } from "@/components/ui/separator";
import { JumpToTabButton } from "./JumpToTabButton";
import {
  FirstPageButton,
  LastPageButton,
  NextPageButton,
  PreviousPageButton,
} from "./PaginationButtons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { isOverScrolling } from "../lib/utils";
import { SecondaryAppUltilityBarProps } from "../constants/types";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

const SecondaryAppUltilityBar = ({
  setIsSidebarOpen,
  isQuestionViewDisabled,
  sideBarInsetRef,
  fullPartitionedData,
  currentChunkIndex,
  setCurrentChunkIndex,
  setDisplayedData,
  scrollAreaRef,
  isFilteredDisabled,
  sortParameters,
  setSortParameters,
  setIsQuestionInspectOpen,
  isSidebarOpen,
}: SecondaryAppUltilityBarProps) => {
  const isMobileDevice = useIsMobile();
  const { uiPreferences } = useTopicalApp();
  const ultilityRef = useRef<HTMLDivElement | null>(null);
  const [isUltilityOverflowingLeft, setIsUltilityOverflowingLeft] =
    useState(false);
  const [isUltilityOverflowingRight, setIsUltilityOverflowingRight] =
    useState(false);
  const overflowScrollHandler = useCallback(() => {
    const isOverScrollingResult = isOverScrolling({
      child: ultilityRef.current,
      parent: sideBarInsetRef.current,
      specialLeftCase: !isMobileDevice,
    });
    setIsUltilityOverflowingLeft(isOverScrollingResult.isOverScrollingLeft);
    setIsUltilityOverflowingRight(isOverScrollingResult.isOverScrollingRight);
  }, [isMobileDevice, sideBarInsetRef]);

  const ultilityHorizontalScrollBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.addEventListener("resize", overflowScrollHandler);

    return () => {
      window.removeEventListener("resize", overflowScrollHandler);
    };
  }, [overflowScrollHandler]);

  useEffect(() => {
    overflowScrollHandler();
  }, [overflowScrollHandler, fullPartitionedData, uiPreferences.layoutStyle]);

  return (
    <ScrollArea
      viewPortOnScroll={overflowScrollHandler}
      className="max-w-full w-max relative"
      viewportRef={ultilityHorizontalScrollBarRef}
    >
      {isUltilityOverflowingRight && (
        <Button
          className="absolute right-0 top-1 rounded-full cursor-pointer w-7 h-7 z-[200]"
          title="Move right"
          onClick={() => {
            if (ultilityHorizontalScrollBarRef.current) {
              ultilityHorizontalScrollBarRef.current.scrollBy({
                left: 200,
                behavior: "smooth",
              });
            }
          }}
        >
          <ChevronRight size={5} />
        </Button>
      )}
      {isUltilityOverflowingLeft && (
        <Button
          className="absolute left-0 top-1 rounded-full cursor-pointer w-7 h-7 z-[200]"
          title="Move left"
          onClick={() => {
            if (ultilityHorizontalScrollBarRef.current) {
              ultilityHorizontalScrollBarRef.current.scrollBy({
                left: -200,
                behavior: "smooth",
              });
            }
          }}
        >
          <ChevronLeft size={5} />
        </Button>
      )}
      <div
        className="flex flex-row h-full items-center justify-start gap-2 w-max pr-2"
        ref={ultilityRef}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                className="flex cursor-pointer items-center gap-2 border"
                disabled={isQuestionViewDisabled}
                onClick={() => {
                  if (setIsQuestionInspectOpen) {
                    setIsQuestionInspectOpen((prev) => ({
                      ...prev,
                      isOpen: true,
                    }));
                  }
                }}
                variant="default"
              >
                Inspect
                <Monitor />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className={cn(
              !isQuestionViewDisabled && "!hidden",
              "flex justify-center items-center gap-2"
            )}
          >
            To inspect questions, select a subject first
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                className="!bg-background flex cursor-pointer items-center gap-2 border"
                onClick={() => {
                  setIsSidebarOpen(!isSidebarOpen);
                }}
                disabled={isFilteredDisabled}
                variant="outline"
              >
                Filters
                <SlidersHorizontal />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className={cn(
              !isFilteredDisabled && "!hidden",
              "flex justify-center items-center gap-2"
            )}
          >
            No question to filter
          </TooltipContent>
        </Tooltip>

        {uiPreferences.layoutStyle === "pagination" &&
          !isQuestionViewDisabled &&
          fullPartitionedData &&
          currentChunkIndex !== undefined &&
          setCurrentChunkIndex &&
          setDisplayedData &&
          scrollAreaRef && (
            <>
              <Separator orientation="vertical" className="!h-[30px]" />
              <div className="flex flex-row items-center justify-center gap-2 rounded-sm px-2">
                <FirstPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={fullPartitionedData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={uiPreferences.scrollUpWhenPageChange}
                  scrollAreaRef={scrollAreaRef}
                />
                <PreviousPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={fullPartitionedData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={uiPreferences.scrollUpWhenPageChange}
                  scrollAreaRef={scrollAreaRef}
                />
                <JumpToTabButton
                  className="mx-4"
                  tab={currentChunkIndex}
                  totalTabs={fullPartitionedData!.length}
                  prefix="page"
                  onTabChangeCallback={({ tab }) => {
                    setCurrentChunkIndex(tab);
                    setDisplayedData(fullPartitionedData![tab]);
                    if (uiPreferences.scrollUpWhenPageChange) {
                      scrollAreaRef.current?.scrollTo({
                        top: 0,
                        behavior: "instant",
                      });
                    }
                  }}
                />
                <NextPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={fullPartitionedData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={uiPreferences.scrollUpWhenPageChange}
                  scrollAreaRef={scrollAreaRef}
                />
                <LastPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={fullPartitionedData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={uiPreferences.scrollUpWhenPageChange}
                  scrollAreaRef={scrollAreaRef}
                />
              </div>
            </>
          )}
        <Separator orientation="vertical" className="!h-[30px]" />
        <Sort
          sortParameters={sortParameters}
          setSortParameters={setSortParameters}
          isDisabled={isQuestionViewDisabled}
          disabledMessage="To sort questions, select a subject first."
        />
      </div>

      <ScrollBar
        orientation="horizontal"
        className="[&_.bg-border]:bg-transparent"
      />
    </ScrollArea>
  );
};

export default SecondaryAppUltilityBar;
