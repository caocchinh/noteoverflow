import { useEffect, useRef } from "react";
import { AppUltilityBarProps } from "../constants/types";
import { useUtilityOverflow } from "../hooks/useUtilityOverflow";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FirstPageButton,
  PreviousPageButton,
  NextPageButton,
  LastPageButton,
} from "@/features/topical/components/PaginationButtons";
import { ShareFilter } from "@/features/topical/components/ShareFilter";
import { Separator } from "@/components/ui/separator";
import { JumpToTabButton } from "@/features/topical/components/JumpToTabButton";
import Sort from "@/features/topical/components/Sort";
import { Switch } from "@/components/ui/switch";
import { useTopicalApp } from "./TopicalLayoutProvider";

const AppUltilityBar = ({
  fullPartitionedData,
  layoutStyle,
  ultilityRef,
  isQuestionViewDisabled,
  setIsQuestionInspectOpen,
  scrollAreaRef,
  currentChunkIndex,
  setCurrentChunkIndex,
  setDisplayedData,
  scrollUpWhenPageChange,
  sortParameters,
  setSortParameters,
  showFinishedQuestion,
  setShowFinishedQuestion,
  filterUrl,
}: AppUltilityBarProps) => {
  const { isAppSidebarOpen, setIsAppSidebarOpen } = useTopicalApp();
  const {
    isUltilityOverflowingLeft,
    isUltilityOverflowingRight,
    overflowScrollHandler,
  } = useUtilityOverflow();
  const ultilityHorizontalScrollBarRef = useRef<HTMLDivElement | null>(null);

  // Note: ultilityRef is passed as prop and used in the JSX below

  useEffect(() => {
    window.addEventListener("resize", overflowScrollHandler);

    return () => {
      window.removeEventListener("resize", overflowScrollHandler);
    };
  }, [overflowScrollHandler]);

  useEffect(() => {
    overflowScrollHandler();
  }, [overflowScrollHandler, fullPartitionedData, layoutStyle]);

  return (
    <>
      {isUltilityOverflowingRight && (
        <Button
          className="absolute right-0 top-5 rounded-full cursor-pointer w-7 h-7 z-[200]"
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
          className="absolute left-0 top-5 rounded-full cursor-pointer w-7 h-7 z-[200]"
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
      <ScrollArea
        viewPortOnScroll={overflowScrollHandler}
        className="w-full  "
        viewportRef={ultilityHorizontalScrollBarRef}
      >
        <div
          className="flex flex-row h-full items-center justify-start gap-2 w-max pl-4 pr-2"
          ref={ultilityRef}
        >
          <Button
            className="!bg-background flex cursor-pointer items-center gap-2 border"
            onClick={() => {
              setIsAppSidebarOpen(!isAppSidebarOpen);
            }}
            variant="outline"
          >
            Filters
            <SlidersHorizontal />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  className="flex cursor-pointer items-center gap-2 border"
                  disabled={isQuestionViewDisabled}
                  onClick={() => {
                    setIsQuestionInspectOpen((prev) => ({
                      ...prev,
                      isOpen: true,
                    }));
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
              To inspect questions, run a search first.
            </TooltipContent>
          </Tooltip>
          {layoutStyle === "pagination" && !isQuestionViewDisabled && (
            <>
              <Separator orientation="vertical" className="!h-[30px]" />
              <div className="flex flex-row items-center justify-center gap-2 rounded-sm px-2">
                <FirstPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={fullPartitionedData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={scrollUpWhenPageChange}
                  scrollAreaRef={scrollAreaRef}
                />
                <PreviousPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={fullPartitionedData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={scrollUpWhenPageChange}
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
                    if (scrollUpWhenPageChange) {
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
                  scrollUpWhenPageChange={scrollUpWhenPageChange}
                  scrollAreaRef={scrollAreaRef}
                />
                <LastPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={fullPartitionedData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={scrollUpWhenPageChange}
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
            disabledMessage="To sort questions, run a search first."
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "border-1 h-full flex items-center justify-center gap-1 p-2 rounded-md cursor-pointer",
                  isQuestionViewDisabled && "opacity-50 !cursor-default",
                  showFinishedQuestion
                    ? "border-green-600"
                    : "border-muted-foreground"
                )}
                onClick={() => {
                  if (isQuestionViewDisabled) {
                    return;
                  }
                  setShowFinishedQuestion(!showFinishedQuestion);
                }}
              >
                <Switch
                  className={cn(
                    "border cursor-pointer border-dashed data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-solid ",
                    isQuestionViewDisabled && "!cursor-default"
                  )}
                  id="show-finished-question"
                  checked={showFinishedQuestion ?? false}
                />
                <p
                  className={cn(
                    showFinishedQuestion
                      ? "text-green-600"
                      : "text-muted-foreground",
                    "cursor-pointer text-sm",
                    isQuestionViewDisabled && "!cursor-default"
                  )}
                >
                  Show finished questions
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className={cn(
                !isQuestionViewDisabled && "!hidden",
                "flex justify-center items-center gap-2"
              )}
            >
              To toggle this, run a search first.
            </TooltipContent>
          </Tooltip>
          <ShareFilter isDisabled={isQuestionViewDisabled} url={filterUrl} />
        </div>

        <ScrollBar
          orientation="horizontal"
          className="[&_.bg-border]:bg-transparent"
        />
      </ScrollArea>
    </>
  );
};

export default AppUltilityBar;
