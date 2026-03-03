import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, PanelsTopLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { isOverScrolling } from "../../lib/utils";
import { InspectUltilityBarProps } from "../../types/components";
import { BestExamHelpUltility } from "../BestExamHelpUltility";
import { BookmarkButton } from "../BookmarkButton/BookmarkButton";
import { ShareFilter } from "../ShareFilter";
import Sort from "../Sort";
import { QuestionInspectFinishedCheckbox } from "./QuestionInspectFinishedCheckbox";

const ToggleInspectSidebarButton = memo(
  ({ isInspectSidebarOpen, onToggle }: { isInspectSidebarOpen: boolean; onToggle: () => void }) => (
    <Button variant="outline" className="cursor-pointer" onClick={onToggle}>
      {isInspectSidebarOpen ? "Hide" : "Show"}
      <PanelsTopLeft />
    </Button>
  ),
);

ToggleInspectSidebarButton.displayName = "ToggleInspectSidebarButton";

const InspectUltilityBar = memo(
  forwardRef(
    (
      {
        isAnnotationGuardDialogOpen,
        setIsAnnotationGuardDialogOpen,
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
        isHavingUnsafeChangesRef,
      }: InspectUltilityBarProps,
      ref,
    ) => {
      const ultilityRef = useRef<HTMLDivElement | null>(null);
      const { isSessionPending } = useAuth();
      const { setIsCalculatorOpen, isCalculatorOpen } = useTopicalApp();
      const [isUltilityOverflowingRight, setIsUltilityOverflowingRight] = useState(false);
      const [isUltilityOverflowingLeft, setIsUltilityOverflowingLeft] = useState(false);
      const ultilityHorizontalScrollBarRef = useRef<HTMLDivElement | null>(null);
      const isMobile = useIsMobile();
      const pathname = usePathname();

      const overflowScrollHandler = useCallback(() => {
        const isOverScrollingResult = isOverScrolling({
          child: ultilityRef.current,
          parent: sideBarInsetRef.current,
          specialLeftCase: !isMobile,
        });
        setIsUltilityOverflowingLeft(isOverScrollingResult.isOverScrollingLeft);
        setIsUltilityOverflowingRight(isOverScrollingResult.isOverScrollingRight);
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
        [overflowScrollHandler],
      );

      return (
        <>
          {isUltilityOverflowingRight && (
            <Button
              className="absolute top-1 right-0 z-200 h-7 w-7 cursor-pointer rounded-full"
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
              className="absolute top-1 left-0 z-200 h-7 w-7 cursor-pointer rounded-full"
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
              className="relative mb-2 flex w-max items-stretch justify-center gap-4 pt-1"
              ref={ultilityRef}
            >
              <div className="bg-input/80 flex w-max items-center justify-center gap-2 rounded-md p-[3px]">
                <Button
                  onClick={() => setCurrentView("question")}
                  className={cn(
                    "dark:text-muted-foreground bg-input hover:bg-input h-[calc(100%-1px)] cursor-pointer border-2 border-transparent px-2 py-1 text-black dark:bg-transparent",
                    currentView === "question" &&
                      "border-input dark:bg-input/30 bg-white hover:bg-white dark:text-white",
                  )}
                >
                  Question
                </Button>
                <Button
                  onClick={() => setCurrentView("answer")}
                  className={cn(
                    "dark:text-muted-foreground bg-input hover:bg-input h-[calc(100%-1px)] cursor-pointer border-2 border-transparent px-2 py-1 text-black dark:bg-transparent",
                    currentView === "answer" &&
                      "border-input dark:bg-input/30 bg-white hover:bg-white dark:text-white",
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
                    "dark:text-muted-foreground bg-input hover:bg-input h-[calc(100%-1px)] cursor-pointer border-2 border-transparent px-2 py-1 text-black dark:bg-transparent",
                    currentView === "both" &&
                      "border-input dark:bg-input/30 bg-white hover:bg-white dark:text-white",
                  )}
                >
                  Both
                </Button>
                <Button
                  onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                  className={cn(
                    "dark:text-muted-foreground bg-input hover:bg-input h-[calc(100%-1px)] cursor-pointer border-2 border-transparent px-2 py-1 text-black dark:bg-transparent",
                    isCalculatorOpen &&
                      "border-logo-main! bg-logo-main! hover:bg-logo-main/80! text-white!",
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
                  isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
                  setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
                  isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
                />
              )}
              {currentQuestionData && (
                <BookmarkButton
                  isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
                  setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
                  triggerButtonClassName="h-[35px] w-[35px] border-black border !static"
                  badgeClassName="h-[35px] min-h-[35px] !static"
                  question={currentQuestionData}
                  isBookmarkDisabled={isSessionPending}
                  listId={listId}
                  popOverAlign="start"
                  isInView={true}
                  isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
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
                  descendingSortText={
                    pathname == "/search" ? "Best match first" : "Newest year first"
                  }
                  ascendingSortText={
                    pathname == "/search" ? "Worst match first" : "Oldest year first"
                  }
                />
              )}
              <ShareFilter
                type="question"
                isDisabled={false}
                url={`${BETTER_AUTH_URL}/topical/${encodeURIComponent(
                  currentQuestionData?.id ?? "",
                )}`}
              />
            </div>
            <ScrollBar orientation="horizontal" className="[&_.bg-border]:bg-transparent" />
          </ScrollArea>
        </>
      );
    },
  ),
);

InspectUltilityBar.displayName = "InspectUltilityBar";

export default InspectUltilityBar;
