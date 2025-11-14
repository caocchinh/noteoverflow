import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ShareFilter } from "../ShareFilter";
import { BestExamHelpUltility } from "../BestExamHelpUltility";
import { BookmarkButton } from "../BookmarkButton";
import { QuestionInspectFinishedCheckbox } from "./QuestionInspectFinishedCheckbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PanelsTopLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { InspectUltilityBarProps } from "../../constants/types";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Sort from "../Sort";
import { useAuth } from "@/context/AuthContext";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { isOverScrolling } from "../../lib/utils";

const ToggleInspectSidebarButton = memo(
  ({
    isInspectSidebarOpen,
    onToggle,
  }: {
    isInspectSidebarOpen: boolean;
    onToggle: () => void;
  }) => (
    <Button variant="outline" className="cursor-pointer" onClick={onToggle}>
      {isInspectSidebarOpen ? "Hide" : "Show"}
      <PanelsTopLeft />
    </Button>
  )
);

ToggleInspectSidebarButton.displayName = "ToggleInspectSidebarButton";

const InspectUltilityBar = memo(
  forwardRef(
    (
      {
        currentView,
        setCurrentView,
        currentQuestionData,
        listId,
        navigationButtonsContainerRef,
        sortParameters,
        setSortParameters,
        isInspectSidebarOpen,
        setIsInspectSidebarOpen,
        BETTER_AUTH_URL,
        sideBarInsetRef,
      }: InspectUltilityBarProps,
      ref
    ) => {
      const ultilityRef = useRef<HTMLDivElement | null>(null);
      const { isSessionPending } = useAuth();
      const { setIsCalculatorOpen, isCalculatorOpen } = useTopicalApp();
      const [isUltilityOverflowingRight, setIsUltilityOverflowingRight] =
        useState(false);
      const [isUltilityOverflowingLeft, setIsUltilityOverflowingLeft] =
        useState(false);
      const ultilityHorizontalScrollBarRef = useRef<HTMLDivElement | null>(
        null
      );
      const isMobile = useIsMobile();

      const overflowScrollHandler = useCallback(() => {
        const isOverScrollingResult = isOverScrolling({
          child: ultilityRef.current,
          parent: sideBarInsetRef.current,
          specialLeftCase: !isMobile,
        });
        setIsUltilityOverflowingLeft(isOverScrollingResult.isOverScrollingLeft);
        setIsUltilityOverflowingRight(
          isOverScrollingResult.isOverScrollingRight
        );
      }, [isMobile, sideBarInsetRef]);

      const toggleInspectSidebar = useCallback(() => {
        setIsInspectSidebarOpen(!isInspectSidebarOpen);
      }, [isInspectSidebarOpen, setIsInspectSidebarOpen]);

      useEffect(() => {
        window.addEventListener("resize", overflowScrollHandler);

        return () => {
          window.removeEventListener("resize", overflowScrollHandler);
        };
      }, [overflowScrollHandler]);

      useImperativeHandle(
        ref,
        () => ({
          overflowScrollHandler,
        }),
        [overflowScrollHandler]
      );

      return (
        <>
          {isUltilityOverflowingRight && (
            <Button
              className="absolute right-0 top-1  rounded-full cursor-pointer w-7 h-7 z-[200]"
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
          <ScrollArea
            className="w-full whitespace-nowrap"
            viewPortOnScroll={overflowScrollHandler}
            viewportRef={ultilityHorizontalScrollBarRef}
          >
            <div
              className="flex pt-1 items-stretch w-max justify-center gap-4 mb-2 relative"
              ref={ultilityRef}
            >
              <div className="flex items-center w-max justify-center gap-2 p-[3px] bg-input/80 rounded-md">
                <Button
                  onClick={() => setCurrentView("question")}
                  className={cn(
                    "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
                    currentView === "question" &&
                      "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 "
                  )}
                >
                  Question
                </Button>
                <Button
                  onClick={() => setCurrentView("answer")}
                  className={cn(
                    "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
                    currentView === "answer" &&
                      "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 "
                  )}
                >
                  Answer
                </Button>
                <Button
                  onClick={() => {
                    setCurrentView("both");
                    setIsInspectSidebarOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
                    currentView === "both" &&
                      "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 "
                  )}
                >
                  Both
                </Button>
                <Button
                  onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                  className={cn(
                    "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2 bg-input text-black hover:bg-input dark:bg-transparent",
                    isCalculatorOpen &&
                      "!border-logo-main !bg-logo-main !text-white hover:!bg-logo-main/80"
                  )}
                >
                  Calculator
                </Button>
              </div>

              <div
                ref={navigationButtonsContainerRef}
                className="flex items-center justify-center gap-2"
              ></div>
              {currentQuestionData && (
                <QuestionInspectFinishedCheckbox
                  question={currentQuestionData}
                />
              )}
              {currentQuestionData && (
                <BookmarkButton
                  triggerButtonClassName="h-[35px] w-[35px] border-black border !static"
                  badgeClassName="h-[35px] min-h-[35px] !static"
                  question={currentQuestionData}
                  isBookmarkDisabled={isSessionPending}
                  listId={listId}
                  popOverAlign="start"
                  isInView={true}
                />
              )}
              <ToggleInspectSidebarButton
                isInspectSidebarOpen={isInspectSidebarOpen}
                onToggle={toggleInspectSidebar}
              />
              <BestExamHelpUltility question={currentQuestionData} />

              {sortParameters && setSortParameters && (
                <Sort
                  sortParameters={sortParameters}
                  setSortParameters={setSortParameters}
                  isDisabled={false}
                  disabledMessage=""
                  showSortTextTrigger={false}
                  descendingSortText="Newest year first"
                  ascendingSortText="Oldest year first"
                />
              )}
              <ShareFilter
                type="question"
                isDisabled={false}
                url={`${BETTER_AUTH_URL}/topical/${encodeURIComponent(
                  currentQuestionData?.id ?? ""
                )}`}
              />
            </div>
            <ScrollBar
              orientation="horizontal"
              className="[&_.bg-border]:bg-transparent"
            />
          </ScrollArea>
        </>
      );
    }
  )
);

InspectUltilityBar.displayName = "InspectUltilityBar";

export default InspectUltilityBar;
