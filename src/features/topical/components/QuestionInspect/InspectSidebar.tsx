import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FinishedTracker } from "./FinishedTracker";
import { ChevronDown, ChevronUp, FastForward, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  RefObject,
} from "react";
import { createPortal } from "react-dom";
import QuestionHoverCard from "./QuestionHoverCard";
import { SelectSeparator } from "@/components/ui/select";
import TabNavigationButtons from "./TabNavigationButtons";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  extractPaperCode,
  extractQuestionNumber,
  fuzzySearch,
} from "../../lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  InspectSidebarProps,
  SelectedQuestion,
  QuestionHoverCardProps,
} from "../../constants/types";

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
      prevProps.listId === nextProps.listId
    );
  }
);
MemoizedQuestionItem.displayName = "MemoizedQuestionItem";

const InspectSidebar = memo(
  forwardRef(
    (
      {
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
        overflowScrollHandler,
        currentQuestionIndex,
        navigationButtonsContainerRef,
        isAnnotationGuardDialogOpen,
      }: InspectSidebarProps,
      ref
    ) => {
      const [currentTab, setCurrentTab] = useState(0);
      const [searchInput, setSearchInput] = useState("");
      const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);
      const [pendingQuestionId, setPendingQuestionId] = useState<
        string | undefined
      >(undefined);
      const [pendingTab, setPendingTab] = useState<number | undefined>(
        undefined
      );
      const [
        willScrollToQuestionAfterGuard,
        setWillScrollToQuestionAfterGuard,
      ] = useState(false);
      const listScrollAreaRef = useRef<HTMLDivElement>(null);
      const isMobile = useIsMobile();

      const searchResults = useMemo(() => {
        return searchInput.length > 0
          ? allQuestions.filter((question) => {
              const searchableText = `${extractPaperCode({
                questionId: question.id,
              })} Q${extractQuestionNumber({ questionId: question.id })}`;
              return fuzzySearch(searchInput, searchableText);
            })
          : [];
      }, [searchInput, allQuestions]);

      const searchVirtualizer = useVirtualizer({
        count: searchResults.length,
        getScrollElement: () => listScrollAreaRef.current,
        estimateSize: () => 65,
        enabled: isVirtualizationReady,
      });

      const displayVirtualizer = useVirtualizer({
        count: partitionedTopicalData?.[currentTab]?.length ?? 0,
        getScrollElement: () => listScrollAreaRef.current,
        estimateSize: () => 65,
        enabled: isVirtualizationReady,
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
              (question) => question.id === questionId
            ) ?? 0;
          if (itemIndex === -1) {
            return;
          }

          setTimeout(() => {
            displayVirtualizer.scrollToIndex(itemIndex);
          }, 0);
        },
        [displayVirtualizer, partitionedTopicalData, isVirtualizationReady]
      );

      const handleTransitionEnd = useCallback(
        (e: React.TransitionEvent) => {
          if (e.propertyName === "left") {
            if (overflowScrollHandler) {
              overflowScrollHandler();
            }
          }
        },
        [overflowScrollHandler]
      );

      const handleNextQuestion = useCallback(() => {
        if (
          partitionedTopicalData &&
          currentTabThatContainsQuestion > -1 &&
          partitionedTopicalData[currentTabThatContainsQuestion]
        ) {
          if (searchInput === "") {
            if (
              currentQuestionIndex <
              partitionedTopicalData[currentTabThatContainsQuestion].length - 1
            ) {
              const newQuestionId =
                partitionedTopicalData[currentTabThatContainsQuestion][
                  currentQuestionIndex + 1
                ].id;
              if (
                isHavingUnsafeChangesRef.current["answer"] ||
                isHavingUnsafeChangesRef.current["question"]
              ) {
                setIsAnnotationGuardDialogOpen(true);
                setPendingQuestionId(newQuestionId);
                setPendingTab(currentTabThatContainsQuestion);
                setWillScrollToQuestionAfterGuard(true);
              } else {
                setCurrentQuestionId(newQuestionId);
                setCurrentTab(currentTabThatContainsQuestion);
                scrollToQuestion({
                  questionId: newQuestionId,
                  tab: currentTabThatContainsQuestion,
                });
              }
            } else {
              if (
                currentTabThatContainsQuestion <
                partitionedTopicalData.length - 1
              ) {
                const newQuestionId =
                  partitionedTopicalData[currentTabThatContainsQuestion + 1][0]
                    .id;
                if (
                  isHavingUnsafeChangesRef.current["answer"] ||
                  isHavingUnsafeChangesRef.current["question"]
                ) {
                  setIsAnnotationGuardDialogOpen(true);
                  setPendingQuestionId(newQuestionId);
                  setPendingTab(currentTabThatContainsQuestion + 1);
                  setWillScrollToQuestionAfterGuard(true);
                } else {
                  setCurrentTab(currentTabThatContainsQuestion + 1);
                  setCurrentQuestionId(newQuestionId);
                  listScrollAreaRef.current?.scrollTo({
                    top: 0,
                    behavior: "instant",
                  });
                }
              }
            }
          } else {
            const currentQuestionIndexInSearchResult = searchResults.findIndex(
              (question) => question.id === currentQuestionId
            );
            if (currentQuestionIndexInSearchResult === -1) {
              return;
            }
            if (currentQuestionIndexInSearchResult < searchResults.length - 1) {
              const newQuestionId =
                searchResults[currentQuestionIndexInSearchResult + 1].id;

              if (
                isHavingUnsafeChangesRef.current["answer"] ||
                isHavingUnsafeChangesRef.current["question"]
              ) {
                setIsAnnotationGuardDialogOpen(true);
                setPendingQuestionId(newQuestionId);
                setWillScrollToQuestionAfterGuard(true);
              } else {
                setCurrentQuestionId(newQuestionId);
                searchVirtualizer.scrollToIndex(
                  currentQuestionIndexInSearchResult + 1
                );
              }
            }
          }
        }
      }, [
        currentQuestionId,
        currentQuestionIndex,
        currentTabThatContainsQuestion,
        isHavingUnsafeChangesRef,
        partitionedTopicalData,
        scrollToQuestion,
        searchInput,
        searchResults,
        searchVirtualizer,
        setCurrentQuestionId,
        setIsAnnotationGuardDialogOpen,
        setPendingQuestionId,
        setPendingTab,
      ]);

      const handlePreviousQuestion = useCallback(() => {
        if (partitionedTopicalData) {
          if (searchInput === "") {
            if (currentQuestionIndex > 0) {
              const newQuestionId =
                partitionedTopicalData[currentTabThatContainsQuestion][
                  currentQuestionIndex - 1
                ].id;
              if (
                isHavingUnsafeChangesRef.current["answer"] ||
                isHavingUnsafeChangesRef.current["question"]
              ) {
                setIsAnnotationGuardDialogOpen(true);
                setPendingQuestionId(newQuestionId);
                setPendingTab(currentTabThatContainsQuestion);
                setWillScrollToQuestionAfterGuard(true);
              } else {
                setCurrentQuestionId(newQuestionId);
                setCurrentTab(currentTabThatContainsQuestion);
                scrollToQuestion({
                  questionId: newQuestionId,
                  tab: currentTabThatContainsQuestion,
                });
              }
            } else {
              if (currentTabThatContainsQuestion > 0) {
                const newQuestionId =
                  partitionedTopicalData[currentTabThatContainsQuestion - 1][
                    partitionedTopicalData[currentTabThatContainsQuestion - 1]
                      .length - 1
                  ].id;
                if (
                  isHavingUnsafeChangesRef.current["answer"] ||
                  isHavingUnsafeChangesRef.current["question"]
                ) {
                  setIsAnnotationGuardDialogOpen(true);
                  setPendingQuestionId(newQuestionId);
                  setPendingTab(currentTabThatContainsQuestion - 1);
                  setWillScrollToQuestionAfterGuard(true);
                } else {
                  setCurrentTab(currentTabThatContainsQuestion - 1);
                  setCurrentQuestionId(newQuestionId);
                  setTimeout(() => {
                    scrollToQuestion({
                      questionId: newQuestionId,
                      tab: currentTabThatContainsQuestion - 1,
                    });
                  }, 0);
                }
              }
            }
          } else {
            const currentQuestionIndexInSearchResult = searchResults.findIndex(
              (question) => question.id === currentQuestionId
            );
            if (currentQuestionIndexInSearchResult === -1) {
              return;
            }
            if (currentQuestionIndexInSearchResult > 0) {
              const newQuestionId =
                searchResults[currentQuestionIndexInSearchResult - 1].id;

              if (
                isHavingUnsafeChangesRef.current["answer"] ||
                isHavingUnsafeChangesRef.current["question"]
              ) {
                setIsAnnotationGuardDialogOpen(true);
                setPendingQuestionId(newQuestionId);
                setWillScrollToQuestionAfterGuard(true);
              } else {
                setCurrentQuestionId(newQuestionId);
                searchVirtualizer.scrollToIndex(
                  currentQuestionIndexInSearchResult - 1
                );
              }
            }
          }
        }
      }, [
        currentQuestionId,
        currentQuestionIndex,
        currentTabThatContainsQuestion,
        isHavingUnsafeChangesRef,
        partitionedTopicalData,
        scrollToQuestion,
        searchInput,
        searchResults,
        searchVirtualizer,
        setCurrentQuestionId,
        setIsAnnotationGuardDialogOpen,
        setPendingQuestionId,
        setPendingTab,
      ]);

      const isHandleNextQuestionDisabled = useMemo(() => {
        if (
          !partitionedTopicalData ||
          currentTabThatContainsQuestion < 0 ||
          !partitionedTopicalData[currentTabThatContainsQuestion]
        ) {
          return true;
        }
        if (searchInput === "") {
          return (
            currentQuestionIndex ===
              partitionedTopicalData[currentTabThatContainsQuestion].length -
                1 &&
            currentTabThatContainsQuestion === partitionedTopicalData.length - 1
          );
        } else {
          const currentQuestionIndexInSearchResult = searchResults.findIndex(
            (question) => question.id === currentQuestionId
          );
          if (currentQuestionIndexInSearchResult === -1) {
            return true;
          }
          if (currentQuestionIndexInSearchResult === searchResults.length - 1) {
            return true;
          }
        }
        return false;
      }, [
        partitionedTopicalData,
        searchInput,
        currentQuestionIndex,
        currentTabThatContainsQuestion,
        searchResults,
        currentQuestionId,
      ]);
      const isHandlePreviousQuestionDisabled = useMemo(() => {
        if (
          !partitionedTopicalData ||
          currentTabThatContainsQuestion < 0 ||
          !partitionedTopicalData[currentTabThatContainsQuestion]
        ) {
          return true;
        }
        if (searchInput === "") {
          return (
            currentQuestionIndex === 0 && currentTabThatContainsQuestion === 0
          );
        } else {
          const currentQuestionIndexInSearchResult = searchResults.findIndex(
            (question) => question.id === currentQuestionId
          );
          if (currentQuestionIndexInSearchResult === -1) {
            return true;
          }
          if (currentQuestionIndexInSearchResult === 0) {
            return true;
          }
        }
        return false;
      }, [
        partitionedTopicalData,
        searchInput,
        currentQuestionIndex,
        currentTabThatContainsQuestion,
        searchResults,
        currentQuestionId,
      ]);

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

      const navigateToQuestion = useCallback(
        ({
          questionId,
          scroll = true,
          showAnnotationGuard = true,
        }: {
          questionId: string;
          scroll?: boolean;
          showAnnotationGuard?: boolean;
        }) => {
          const tab = calculateTabThatQuestionResidesIn(questionId);

          if (
            showAnnotationGuard &&
            (isHavingUnsafeChangesRef.current["answer"] ||
              isHavingUnsafeChangesRef.current["question"])
          ) {
            setIsAnnotationGuardDialogOpen(true);
            setPendingQuestionId(questionId);
            setPendingTab(tab);
            setWillScrollToQuestionAfterGuard(true);
            return;
          }
          setCurrentTab(tab);
          setCurrentQuestionId(questionId);

          if (isVirtualizationReady && scroll) {
            scrollToQuestion({ questionId, tab });
          }
        },
        [
          calculateTabThatQuestionResidesIn,
          isHavingUnsafeChangesRef,
          setCurrentQuestionId,
          isVirtualizationReady,
          setIsAnnotationGuardDialogOpen,
          setPendingQuestionId,
          setPendingTab,
          scrollToQuestion,
        ]
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
        ]
      );
      const hasMountedRef = useRef(false);

      // Hydrate inspector on open
      useEffect(() => {
        if (!isOpen.isOpen) {
          return;
        }
        overflowScrollHandler?.();
        const tab = calculateTabThatQuestionResidesIn(isOpen.questionId);
        if (!isVirtualizationReady) {
          setCurrentTab(tab);
          setCurrentQuestionId(
            !isOpen.questionId
              ? partitionedTopicalData?.[tab]?.[0]?.id
              : isOpen.questionId
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
      }, [isOpen, overflowScrollHandler, isVirtualizationReady]);

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

      useEffect(() => {
        if (
          !isAnnotationGuardDialogOpen &&
          currentQuestionId &&
          pendingQuestionId &&
          pendingTab !== undefined
        ) {
          setCurrentQuestionId(pendingQuestionId);
          setCurrentTab(pendingTab);
          if (willScrollToQuestionAfterGuard) {
            scrollToQuestion({
              questionId: pendingQuestionId,
              tab: pendingTab,
            });
          }
          setWillScrollToQuestionAfterGuard(false);
          setPendingQuestionId(undefined);
          setPendingTab(undefined);
        }
      }, [
        currentQuestionId,
        isAnnotationGuardDialogOpen,
        navigateToQuestion,
        pendingQuestionId,
        pendingTab,
        scrollToQuestion,
        setCurrentQuestionId,
        willScrollToQuestionAfterGuard,
      ]);

      return (
        <>
          <Sidebar
            className="top-0 !h-full"
            onTransitionEnd={handleTransitionEnd}
          >
            <SidebarHeader className="sr-only">Search questions</SidebarHeader>
            <SidebarContent className="dark:bg-accent flex flex-col gap-2 h-full justify-between items-center border-r border-border p-3 pr-1 !overflow-hidden">
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
                  currentTabThatContainsQuestion={
                    currentTabThatContainsQuestion
                  }
                  setCurrentTab={setCurrentTab}
                  scrollToQuestion={scrollToQuestion}
                  listScrollAreaRef={listScrollAreaRef}
                />
                <GoToCurrentButton
                  searchInput={searchInput}
                  currentTabThatContainsQuestion={
                    currentTabThatContainsQuestion
                  }
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
                  searchInput.length > 0 ? "h-[90%]" : "h-[80%] "
                )}
                type="always"
                viewportRef={listScrollAreaRef}
              >
                <div
                  className={cn(
                    "relative w-full",
                    searchInput.length > 0 && "!hidden"
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
                            partitionedTopicalData[currentTab][
                              virtualItem.index
                            ].id
                          }
                          resetScrollPositions={resetScrollPositions}
                          question={
                            partitionedTopicalData[currentTab][
                              virtualItem.index
                            ]
                          }
                          navigateToQuestion={navigateToQuestion}
                          isThisTheCurrentQuestion={
                            partitionedTopicalData[currentTab][
                              virtualItem.index
                            ]?.id === currentQuestionId
                          }
                          setCurrentQuestionId={setCurrentQuestionId}
                          listId={listId}
                          isInspectSidebarOpen={isInspectSidebarOpen}
                          isMobileDevice={isMobile}
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
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div
                className={cn(
                  "w-full flex items-center justify-around -mt-2",
                  searchInput.length > 0 && "hidden"
                )}
              >
                <TabNavigationButtons
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  partitionedTopicalData={partitionedTopicalData}
                  currentTabThatContainsQuestion={
                    currentTabThatContainsQuestion
                  }
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
              navigationButtonsContainerRef.current
            )}
        </>
      );
    }
  )
);

InspectSidebar.displayName = "InspectSidebar";

export default InspectSidebar;

const SearchInputSection = memo(
  ({
    searchInput,
    setSearchInput,
    isInputFocusedRef,
    currentQuestionId,
    currentTabThatContainsQuestion,
    setCurrentTab,
    scrollToQuestion,
    listScrollAreaRef,
  }: {
    searchInput: string;
    setSearchInput: (value: string) => void;
    isInputFocusedRef: RefObject<boolean>;
    currentQuestionId?: string;
    currentTabThatContainsQuestion: number;
    setCurrentTab: (tab: number) => void;
    scrollToQuestion: ({
      questionId,
      tab,
    }: {
      questionId: string;
      tab: number;
    }) => void;
    listScrollAreaRef: RefObject<HTMLDivElement | null>;
  }) => {
    return (
      <div className="flex items-center gap-2 border-b border-border">
        <Search />
        <Input
          onFocus={() => {
            isInputFocusedRef.current = true;
          }}
          onBlur={() => {
            isInputFocusedRef.current = false;
          }}
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-accent placeholder:text-sm"
          placeholder="Search questions"
          value={searchInput}
          tabIndex={-1}
          onChange={(e) => {
            if (searchInput == "") {
              listScrollAreaRef.current?.scrollTo({
                top: 0,
              });
            }
            setSearchInput(e.target.value);
            if (e.target.value.length === 0 && currentQuestionId) {
              setCurrentTab(currentTabThatContainsQuestion);
              setTimeout(() => {
                scrollToQuestion({
                  questionId: currentQuestionId,
                  tab: currentTabThatContainsQuestion,
                });
              }, 0);
            }
          }}
        />
        {searchInput.length > 0 && (
          <X
            className="text-red-600 hover:text-red-600/80 cursor-pointer"
            onClick={() => {
              setSearchInput("");
              setCurrentTab(currentTabThatContainsQuestion);
              if (currentQuestionId) {
                setTimeout(() => {
                  scrollToQuestion({
                    questionId: currentQuestionId,
                    tab: currentTabThatContainsQuestion,
                  });
                }, 0);
              }
            }}
          />
        )}
      </div>
    );
  }
);

SearchInputSection.displayName = "SearchInputSection";

const GoToCurrentButton = memo(
  ({
    searchInput,
    currentTabThatContainsQuestion,
    setCurrentTab,
    currentQuestionId,
    scrollToQuestion,
    searchResults,
    searchVirtualizer,
  }: {
    searchInput: string;
    currentTabThatContainsQuestion: number;
    setCurrentTab: (tab: number) => void;
    currentQuestionId?: string;
    scrollToQuestion: ({
      questionId,
      tab,
    }: {
      questionId: string;
      tab: number;
    }) => void;
    searchResults: SelectedQuestion[];
    searchVirtualizer: {
      scrollToIndex: (index: number) => void;
    };
  }) => {
    return (
      <Button
        variant="default"
        className="cursor-pointer rounded-[3px] flex items-center justify-center gap-1"
        title="Go to current question"
        onClick={() => {
          if (searchInput === "") {
            setCurrentTab(currentTabThatContainsQuestion);
            if (currentQuestionId) {
              setTimeout(() => {
                scrollToQuestion({
                  questionId: currentQuestionId,
                  tab: currentTabThatContainsQuestion,
                });
              }, 0);
            }
          } else {
            const currentQuestionIndexInSearchResult = searchResults.findIndex(
              (question) => question.id === currentQuestionId
            );
            if (currentQuestionIndexInSearchResult === -1) {
              return;
            }
            setTimeout(() => {
              searchVirtualizer.scrollToIndex(
                currentQuestionIndexInSearchResult
              );
            }, 0);
          }
        }}
      >
        <FastForward />
        Current
      </Button>
    );
  }
);

GoToCurrentButton.displayName = "GoToCurrentButton";

const NavigationButtons = memo(
  ({
    handleNextQuestion,
    handlePreviousQuestion,
    isHandleNextQuestionDisabled,
    isHandlePreviousQuestionDisabled,
  }: {
    handleNextQuestion: () => void;
    handlePreviousQuestion: () => void;
    isHandleNextQuestionDisabled: boolean;
    isHandlePreviousQuestionDisabled: boolean;
  }) => {
    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          className="w-9 rounded-sm cursor-pointer"
          onClick={handleNextQuestion}
          disabled={isHandleNextQuestionDisabled}
          title="Next question"
        >
          <ChevronDown />
        </Button>
        <Button
          variant="outline"
          className="w-9 rounded-sm cursor-pointer"
          onClick={handlePreviousQuestion}
          disabled={isHandlePreviousQuestionDisabled}
          title="Previous question"
        >
          <ChevronUp />
        </Button>
      </div>
    );
  }
);

NavigationButtons.displayName = "NavigationButtons";
