import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FinishedTracker } from "../FinishedTracker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import QuestionHoverCard from "../QuestionHoverCard";
import { SelectSeparator } from "@/components/ui/select";
import TabNavigationButtons from "../TabNavigationButtons";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useIsMobile } from "@/hooks/use-mobile";
import { QuestionHoverCardProps } from "../../../constants/types";
import NavigationButtons from "./NavigationButtons";
import GoToCurrentButton from "./GoToCurrentButton";
import SearchInputSection from "./SearchInputSection";
import { useInspectSearch } from "./useInspectSearch";
import { useInspectNavigation } from "./useInspectNavigation";
import { useInspectContext } from "../../../context/InspectContext";

// Memoized wrapper with custom comparison to prevent unnecessary re-renders
const MemoizedQuestionItem = memo(
  (props: QuestionHoverCardProps) => (
    <>
      <QuestionHoverCard {...props} />
      <SelectSeparator />
    </>
  ),
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.question.id === nextProps.question.id &&
      prevProps.isThisTheCurrentQuestion ===
        nextProps.isThisTheCurrentQuestion &&
      prevProps.isInspectSidebarOpen === nextProps.isInspectSidebarOpen &&
      prevProps.isMobileDevice === nextProps.isMobileDevice &&
      prevProps.listId === nextProps.listId &&
      prevProps.isAnnotationGuardDialogOpen ===
        nextProps.isAnnotationGuardDialogOpen &&
      prevProps.setIsAnnotationGuardDialogOpen ===
        nextProps.setIsAnnotationGuardDialogOpen &&
      prevProps.isHavingUnsafeChangesRef === nextProps.isHavingUnsafeChangesRef
    );
  },
);
MemoizedQuestionItem.displayName = "MemoizedQuestionItem";

const InspectSidebar = memo(
  forwardRef((_, ref) => {
    const {
      allQuestions,
      partitionedTopicalData,
      isOpen,
      setIsOpen,
      currentTabThatContainsQuestion,
      isInspectSidebarOpen,
      currentQuestionId,
      isHavingUnsafeChangesRef,
      setIsAnnotationGuardDialogOpen,
      setCurrentView,
      calculateTabThatQuestionResidesIn,
      setCurrentQuestionId,
      isInputFocusedRef,
      resetScrollPositions,
      listId,
      inspectUltilityBarRef,
      currentQuestionIndex,
      navigationButtonsContainerRef,
      isAnnotationGuardDialogOpen,
    } = useInspectContext();

    const listScrollAreaRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);

    const { searchInput, setSearchInput, searchResults } =
      useInspectSearch(allQuestions);

    const getSearchItemKey = useCallback(
      (index: number) => searchResults[index]?.id ?? index,
      [searchResults],
    );

    const [currentTab, setCurrentTab] = useState(0);

    const getDisplayItemKey = useCallback(
      (index: number) =>
        partitionedTopicalData?.[currentTab]?.length
          ? partitionedTopicalData[currentTab][index]?.id
          : index,
      [partitionedTopicalData, currentTab],
    );

    const searchVirtualizer = useVirtualizer({
      count: searchResults.length,
      getScrollElement: () => listScrollAreaRef.current,
      estimateSize: () => 65,
      enabled: isVirtualizationReady,
      getItemKey: getSearchItemKey,
    });

    const displayVirtualizer = useVirtualizer({
      count: partitionedTopicalData?.[currentTab]?.length ?? 0,
      getScrollElement: () => listScrollAreaRef.current,
      estimateSize: () => 65,
      enabled: isVirtualizationReady,
      getItemKey: getDisplayItemKey,
    });

    const virtualSearchItems = searchVirtualizer.getVirtualItems();
    const virtualDisplayItems = displayVirtualizer.getVirtualItems();

    const scrollToQuestion = useCallback(
      ({ questionId, tab }: { questionId: string; tab: number }) => {
        if (
          !partitionedTopicalData ||
          !partitionedTopicalData[tab] ||
          partitionedTopicalData[tab].length === 0 ||
          !isVirtualizationReady
        ) {
          return;
        }

        const itemIndex =
          partitionedTopicalData[tab].findIndex(
            (question) => question.id === questionId,
          ) ?? 0;
        if (itemIndex === -1) {
          return;
        }

        setTimeout(() => {
          displayVirtualizer.scrollToIndex(itemIndex);
        }, 0);
      },
      [displayVirtualizer, partitionedTopicalData, isVirtualizationReady],
    );

    const {
      handleNextQuestion,
      handlePreviousQuestion,
      navigateToQuestion,
      isHandleNextQuestionDisabled,
      isHandlePreviousQuestionDisabled,
    } = useInspectNavigation({
      partitionedTopicalData,
      currentTabThatContainsQuestion,
      currentQuestionIndex,
      currentQuestionId,
      setCurrentQuestionId,
      searchInput,
      searchResults,
      isHavingUnsafeChangesRef,
      setIsAnnotationGuardDialogOpen,
      isAnnotationGuardDialogOpen,
      scrollToQuestion,
      searchVirtualizer,
      listScrollAreaRef,
      isVirtualizationReady,
      calculateTabThatQuestionResidesIn,
      setCurrentTab,
    });

    useEffect(() => {
      let timeout: NodeJS.Timeout;
      if (isOpen.isOpen) {
        timeout = setTimeout(() => {
          if (isMobile && isInspectSidebarOpen) {
            setIsVirtualizationReady(true);
          } else if (!isMobile) {
            setIsVirtualizationReady(true);
          } else if (isMobile && !isInspectSidebarOpen) {
            setIsVirtualizationReady(false);
            setIsOpen({
              isOpen: true,
              questionId:
                currentQuestionId ??
                isOpen.questionId ??
                partitionedTopicalData?.[0]?.[0]?.id ??
                "",
            });
          }
        }, 0);
      } else {
        setIsVirtualizationReady(false);
      }
      return () => clearTimeout(timeout);
    }, [
      isOpen.isOpen,
      isInspectSidebarOpen,
      isMobile,
      isOpen.questionId,
      setIsOpen,
      currentQuestionId,
      partitionedTopicalData,
    ]);

    const handleTransitionEnd = useCallback(
      (e: React.TransitionEvent) => {
        if (e.propertyName === "left") {
          if (inspectUltilityBarRef.current?.overflowScrollHandler) {
            inspectUltilityBarRef.current.overflowScrollHandler();
          }
        }
      },
      [inspectUltilityBarRef],
    );

    useImperativeHandle(
      ref,
      () => ({
        handleNextQuestion,
        handlePreviousQuestion,
        navigateToQuestion,
        isHandleNextQuestionDisabled,
        isHandlePreviousQuestionDisabled,
      }),
      [
        handleNextQuestion,
        handlePreviousQuestion,
        navigateToQuestion,
        isHandleNextQuestionDisabled,
        isHandlePreviousQuestionDisabled,
      ],
    );
    const hasMountedRef = useRef(false);

    // Hydrate inspector on open
    useEffect(() => {
      if (!isOpen.isOpen) {
        return;
      }
      inspectUltilityBarRef.current?.overflowScrollHandler();
      const tab = calculateTabThatQuestionResidesIn(isOpen.questionId);
      if (!isVirtualizationReady) {
        setCurrentTab(tab);
        setCurrentQuestionId(
          !isOpen.questionId
            ? partitionedTopicalData?.[tab]?.[0]?.id
            : isOpen.questionId,
        );
      } else {
        scrollToQuestion({ questionId: isOpen.questionId, tab });
      }
      if (!hasMountedRef.current) {
        setTimeout(() => {
          hasMountedRef.current = true;
        }, 0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, inspectUltilityBarRef, isVirtualizationReady]);

    useEffect(() => {
      if (!hasMountedRef.current) {
        return;
      }
      setSearchInput("");
      setCurrentView("question");
      if (
        allQuestions &&
        allQuestions.length > 0 &&
        currentQuestionId &&
        !allQuestions.some((question) => question.id === currentQuestionId)
      ) {
        navigateToQuestion({
          questionId: allQuestions[0].id,
          showAnnotationGuard: false,
        });
        return;
      } else {
        if (currentQuestionId) {
          navigateToQuestion({
            questionId: currentQuestionId,
            showAnnotationGuard: false,
          });
        }
      }
      if (allQuestions && allQuestions.length === 0) {
        setIsOpen({
          isOpen: false,
          questionId: "",
        });
        return;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allQuestions]);

    return (
      <>
        <Sidebar
          className="top-0 h-full!"
          onTransitionEnd={handleTransitionEnd}
        >
          <SidebarHeader className="sr-only">Search questions</SidebarHeader>
          <SidebarContent className="dark:bg-accent flex flex-col gap-2 h-full justify-between items-center border-r border-border p-3 pr-1 overflow-hidden!">
            <FinishedTracker
              allQuestions={allQuestions}
              navigateToQuestion={navigateToQuestion}
            />
            <div className="flex items-center justify-start w-full gap-2 px-1 mt-8">
              <SearchInputSection
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                isInputFocusedRef={isInputFocusedRef}
                currentQuestionId={currentQuestionId}
                currentTabThatContainsQuestion={currentTabThatContainsQuestion}
                setCurrentTab={setCurrentTab}
                scrollToQuestion={scrollToQuestion}
                listScrollAreaRef={listScrollAreaRef}
              />
              <GoToCurrentButton
                searchInput={searchInput}
                currentTabThatContainsQuestion={currentTabThatContainsQuestion}
                setCurrentTab={setCurrentTab}
                currentQuestionId={currentQuestionId}
                scrollToQuestion={scrollToQuestion}
                searchResults={searchResults}
                searchVirtualizer={searchVirtualizer}
              />
            </div>
            <ScrollArea
              className={cn(
                "w-full",
                searchInput.length > 0 ? "h-[90%]" : "h-[80%] ",
              )}
              type="always"
              viewportRef={listScrollAreaRef}
            >
              <div
                className={cn(
                  "relative w-full",
                  searchInput.length > 0 && "hidden!",
                )}
                style={{
                  height: displayVirtualizer.getTotalSize(),
                }}
              >
                {virtualDisplayItems.map((virtualItem) => (
                  <div
                    className="absolute top-0 left-0 w-full pr-3"
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                  >
                    {partitionedTopicalData?.[currentTab][
                      virtualItem.index
                    ] && (
                      <MemoizedQuestionItem
                        key={
                          partitionedTopicalData[currentTab][virtualItem.index]
                            .id
                        }
                        resetScrollPositions={resetScrollPositions}
                        question={
                          partitionedTopicalData[currentTab][virtualItem.index]
                        }
                        navigateToQuestion={navigateToQuestion}
                        isThisTheCurrentQuestion={
                          partitionedTopicalData[currentTab][virtualItem.index]
                            ?.id === currentQuestionId
                        }
                        setCurrentQuestionId={setCurrentQuestionId}
                        listId={listId}
                        isInspectSidebarOpen={isInspectSidebarOpen}
                        isMobileDevice={isMobile}
                        isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
                        setIsAnnotationGuardDialogOpen={
                          setIsAnnotationGuardDialogOpen
                        }
                        isAnnotationGuardDialogOpen={
                          isAnnotationGuardDialogOpen
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
              <div
                className="relative w-full"
                style={{
                  height: searchVirtualizer.getTotalSize(),
                }}
              >
                {virtualSearchItems.map((virtualItem) => (
                  <div
                    className="absolute top-0 left-0 w-full pr-3"
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                  >
                    <MemoizedQuestionItem
                      key={searchResults[virtualItem.index].id}
                      resetScrollPositions={resetScrollPositions}
                      question={searchResults[virtualItem.index]}
                      navigateToQuestion={navigateToQuestion}
                      isThisTheCurrentQuestion={
                        searchResults[virtualItem.index]?.id ===
                        currentQuestionId
                      }
                      listId={listId}
                      setCurrentQuestionId={setCurrentQuestionId}
                      isInspectSidebarOpen={isInspectSidebarOpen}
                      isMobileDevice={isMobile}
                      isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
                      setIsAnnotationGuardDialogOpen={
                        setIsAnnotationGuardDialogOpen
                      }
                      isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div
              className={cn(
                "w-full flex items-center justify-around -mt-2",
                searchInput.length > 0 && "hidden",
              )}
            >
              <TabNavigationButtons
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                partitionedTopicalData={partitionedTopicalData}
                currentTabThatContainsQuestion={currentTabThatContainsQuestion}
                currentQuestionId={currentQuestionId}
                scrollToQuestion={scrollToQuestion}
                listScrollAreaRef={listScrollAreaRef}
              />
            </div>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        {navigationButtonsContainerRef.current &&
          createPortal(
            <NavigationButtons
              handleNextQuestion={handleNextQuestion}
              handlePreviousQuestion={handlePreviousQuestion}
              isHandleNextQuestionDisabled={isHandleNextQuestionDisabled}
              isHandlePreviousQuestionDisabled={
                isHandlePreviousQuestionDisabled
              }
            />,
            navigationButtonsContainerRef.current,
          )}
      </>
    );
  }),
);

InspectSidebar.displayName = "InspectSidebar";

export default InspectSidebar;
