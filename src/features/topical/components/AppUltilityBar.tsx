import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { JumpToTabButton } from "@/features/topical/components/JumpToTabButton";
import {
  FirstPageButton,
  LastPageButton,
  NextPageButton,
  PreviousPageButton,
} from "@/features/topical/components/PaginationButtons";
import { ShareFilter } from "@/features/topical/components/ShareFilter";
import Sort from "@/features/topical/components/Sort";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Monitor, SlidersHorizontal } from "lucide-react";
import {
  Dispatch,
  forwardRef,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { isOverScrolling } from "../lib/utils";
import { AppUltilityBarProps, QuestionInspectOpenState } from "../types/components";
import ExportDisabledDialog from "./ExportMode/ExportDisabledDialog";
import LayoutSetting from "./LayoutSetting";

const AppUltilityBar = memo(
  forwardRef(
    (
      {
        finishedQuestionsFilteredPartitionedData,
        isExportModeEnabled,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setIsExportModeEnabled,
        ultilityRef,
        isQuestionViewDisabled,
        setIsQuestionInspectOpen,
        scrollAreaRef,
        currentChunkIndex,
        setCurrentChunkIndex,
        sortParameters,
        sideBarInsetRef,
        setSortParameters,
        showFinishedQuestion,
        setShowFinishedQuestion,
        filterUrl,
      }: AppUltilityBarProps,
      ref,
    ) => {
      const { isAppSidebarOpen, setIsAppSidebarOpen, uiPreferences, setUiPreference } =
        useTopicalApp();
      const [isUltilityOverflowingLeft, setIsUltilityOverflowingLeft] = useState(false);
      const [isUltilityOverflowingRight, setIsUltilityOverflowingRight] = useState(false);
      const isMobileDevice = useIsMobile();

      const overflowScrollHandler = useCallback(() => {
        const isOverScrollingResult = isOverScrolling({
          child: ultilityRef.current,
          parent: sideBarInsetRef.current,
          specialLeftCase: !isMobileDevice,
        });
        setIsUltilityOverflowingLeft(isOverScrollingResult.isOverScrollingLeft);
        setIsUltilityOverflowingRight(isOverScrollingResult.isOverScrollingRight);
      }, [isMobileDevice, sideBarInsetRef, ultilityRef]);
      const ultilityHorizontalScrollBarRef = useRef<HTMLDivElement | null>(null);

      useEffect(() => {
        window.addEventListener("resize", overflowScrollHandler);

        return () => {
          window.removeEventListener("resize", overflowScrollHandler);
        };
      }, [overflowScrollHandler]);

      useEffect(() => {
        overflowScrollHandler();
      }, [
        overflowScrollHandler,
        finishedQuestionsFilteredPartitionedData,
        uiPreferences.layoutStyle,
      ]);

      useImperativeHandle(
        ref,
        () => ({
          overflowScrollHandler,
        }),
        [overflowScrollHandler],
      );

      return (
        <>
          {isUltilityOverflowingRight && (
            <Button
              className="absolute top-5 right-0 z-200 h-7 w-7 cursor-pointer rounded-full"
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
              className="absolute top-5 left-0 z-200 h-7 w-7 cursor-pointer rounded-full"
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
            className="w-full"
            viewportRef={ultilityHorizontalScrollBarRef}
          >
            <div
              className="mt-1 flex h-full w-max flex-row items-center justify-start gap-2 pr-2 pl-4"
              ref={ultilityRef}
            >
              {!isExportModeEnabled && (
                <>
                  <FilterToggleButton
                    isAppSidebarOpen={isAppSidebarOpen}
                    setIsAppSidebarOpen={setIsAppSidebarOpen}
                  />
                  <InspectTriggerButton
                    isQuestionViewDisabled={isQuestionViewDisabled}
                    setIsQuestionInspectOpen={setIsQuestionInspectOpen}
                  />
                </>
              )}
              {uiPreferences.layoutStyle === "pagination" && !isQuestionViewDisabled && (
                <>
                  {!isExportModeEnabled && (
                    <Separator orientation="vertical" className="h-[30px]!" />
                  )}
                  <div className="flex flex-row items-center justify-center gap-2 rounded-sm px-2">
                    <FirstPageButton
                      currentChunkIndex={currentChunkIndex}
                      setCurrentChunkIndex={setCurrentChunkIndex}
                      scrollUpWhenPageChange={uiPreferences.scrollUpWhenPageChange}
                      scrollAreaRef={scrollAreaRef}
                    />
                    <PreviousPageButton
                      currentChunkIndex={currentChunkIndex}
                      setCurrentChunkIndex={setCurrentChunkIndex}
                      scrollUpWhenPageChange={uiPreferences.scrollUpWhenPageChange}
                      scrollAreaRef={scrollAreaRef}
                    />
                    <JumpToTabButton
                      className="mx-4"
                      tab={currentChunkIndex}
                      totalTabs={finishedQuestionsFilteredPartitionedData!.length}
                      prefix="page"
                      onTabChangeCallback={({ tab }) => {
                        setCurrentChunkIndex(tab);
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
                      totalPages={finishedQuestionsFilteredPartitionedData!.length}
                      scrollUpWhenPageChange={uiPreferences.scrollUpWhenPageChange}
                      scrollAreaRef={scrollAreaRef}
                    />
                    <LastPageButton
                      currentChunkIndex={currentChunkIndex}
                      setCurrentChunkIndex={setCurrentChunkIndex}
                      totalPages={finishedQuestionsFilteredPartitionedData!.length}
                      scrollUpWhenPageChange={uiPreferences.scrollUpWhenPageChange}
                      scrollAreaRef={scrollAreaRef}
                    />
                  </div>
                </>
              )}
              <Separator orientation="vertical" className="h-[30px]!" />
              <Sort
                sortParameters={sortParameters}
                setSortParameters={setSortParameters}
                isDisabled={isQuestionViewDisabled}
                disabledMessage="To sort questions, run a search first."
                descendingSortText="Newest year first"
                ascendingSortText="Oldest year first"
              />
              <ShowFinishedToggle
                isQuestionViewDisabled={isQuestionViewDisabled}
                showFinishedQuestion={showFinishedQuestion}
                setShowFinishedQuestion={setShowFinishedQuestion}
              />

              {isExportModeEnabled && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex h-full cursor-pointer items-center justify-center gap-1 rounded-md border p-2",
                          uiPreferences.isStrictModeEnabled
                            ? "border-logo-main"
                            : "border-muted-foreground",
                        )}
                        onClick={() => {
                          setUiPreference("isStrictModeEnabled", (prev) => !prev);
                        }}
                      >
                        <Switch
                          checked={uiPreferences.isStrictModeEnabled}
                          className="cursor-pointer"
                        />
                        <p
                          className={cn(
                            uiPreferences.isStrictModeEnabled
                              ? "text-logo-main"
                              : "text-muted-foreground",
                            "cursor-pointer text-sm",
                          )}
                        >
                          Strict mode
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Questions containing unrelated topics will be excluded.
                    </TooltipContent>
                  </Tooltip>
                  <LayoutSetting triggerClassName="flex w-max cursor-pointer items-center justify-start gap-2 bg-white dark:bg-black border border-black dark:border-white" />
                </>
              )}

              {!isExportModeEnabled && (
                <ExportDisabledDialog isQuestionViewDisabled={isQuestionViewDisabled} />
              )}
              <ShareFilter isDisabled={isQuestionViewDisabled} url={filterUrl} />
            </div>

            <ScrollBar orientation="horizontal" className="[&_.bg-border]:bg-transparent" />
          </ScrollArea>
        </>
      );
    },
  ),
);

AppUltilityBar.displayName = "AppUltilityBar";

export default AppUltilityBar;

const ShowFinishedToggle = memo(
  ({
    isQuestionViewDisabled,
    showFinishedQuestion,
    setShowFinishedQuestion,
  }: {
    isQuestionViewDisabled: boolean;
    showFinishedQuestion: boolean;
    setShowFinishedQuestion: Dispatch<SetStateAction<boolean>>;
  }) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex h-full cursor-pointer items-center justify-center gap-1 rounded-md border p-2",
              isQuestionViewDisabled && "cursor-default! opacity-50",
              showFinishedQuestion ? "border-green-600" : "border-muted-foreground",
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
                "cursor-pointer border border-dashed data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-solid",
                isQuestionViewDisabled && "cursor-default!",
              )}
              id="show-finished-question"
              checked={showFinishedQuestion ?? false}
            />
            <p
              className={cn(
                showFinishedQuestion ? "text-green-600" : "text-muted-foreground",
                "cursor-pointer text-sm",
                isQuestionViewDisabled && "cursor-default!",
              )}
            >
              {showFinishedQuestion ? "Show" : "Hide"} finished
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className={cn(
            !isQuestionViewDisabled && "hidden!",
            "flex items-center justify-center gap-2",
          )}
        >
          To toggle this, run a search first.
        </TooltipContent>
      </Tooltip>
    );
  },
);
ShowFinishedToggle.displayName = "ShowFinishedToggle";

const FilterToggleButton = memo(
  ({
    isAppSidebarOpen,
    setIsAppSidebarOpen,
  }: {
    isAppSidebarOpen: boolean;
    setIsAppSidebarOpen: Dispatch<SetStateAction<boolean>>;
  }) => {
    return (
      <Button
        className="bg-background! flex cursor-pointer items-center gap-2 border"
        onClick={useCallback(() => {
          setIsAppSidebarOpen(!isAppSidebarOpen);
        }, [isAppSidebarOpen, setIsAppSidebarOpen])}
        variant="outline"
      >
        Filters
        <SlidersHorizontal />
      </Button>
    );
  },
);
FilterToggleButton.displayName = "FilterToggleButton";

export const InspectTriggerButton = memo(
  ({
    isQuestionViewDisabled,
    setIsQuestionInspectOpen,
  }: {
    isQuestionViewDisabled: boolean;
    setIsQuestionInspectOpen: Dispatch<SetStateAction<QuestionInspectOpenState>> | undefined;
  }) => {
    return (
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
            !isQuestionViewDisabled && "hidden!",
            "flex items-center justify-center gap-2",
          )}
        >
          To inspect questions, run a search first.
        </TooltipContent>
      </Tooltip>
    );
  },
);

InspectTriggerButton.displayName = "InspectTriggerButton";
