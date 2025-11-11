import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FinishedTracker } from "./FinishedTracker";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FastForward,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import QuestionHoverCard from "./QuestionHoverCard";
import { SelectSeparator } from "@/components/ui/select";
import { JumpToTabButton } from "../JumpToTabButton";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  extractPaperCode,
  extractQuestionNumber,
  fuzzySearch,
} from "../../lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { InspectSidebarProps } from "../../constants/types";

const InspectSidebar = forwardRef(
  (
    {
      allQuestions,
      partitionedTopicalData,
      isOpen,
      setIsOpen,
      currentTabThatContainsQuestion,
      isInspectSidebarOpen,
      currentQuestionId,
      setCurrentView,
      setCurrentQuestionId,
      setCurrentTabThatContainsQuestion,
      isInputFocused,
      resetScrollPositions,
      listId,
      overflowScrollHandler,
      currentQuestionIndex,
    }: InspectSidebarProps,
    ref
  ) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);
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
            setCurrentQuestionId(
              partitionedTopicalData[currentTabThatContainsQuestion][
                currentQuestionIndex + 1
              ].id
            );
            setCurrentTab(currentTabThatContainsQuestion);
            scrollToQuestion({
              questionId:
                partitionedTopicalData[currentTabThatContainsQuestion][
                  currentQuestionIndex + 1
                ].id,
              tab: currentTabThatContainsQuestion,
            });
          } else {
            if (
              currentTabThatContainsQuestion <
              partitionedTopicalData.length - 1
            ) {
              setCurrentTab(currentTabThatContainsQuestion + 1);
              setCurrentTabThatContainsQuestion(
                currentTabThatContainsQuestion + 1
              );
              setCurrentQuestionId(
                partitionedTopicalData[currentTabThatContainsQuestion + 1][0].id
              );
              listScrollAreaRef.current?.scrollTo({
                top: 0,
                behavior: "instant",
              });
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
            setCurrentQuestionId(
              searchResults[currentQuestionIndexInSearchResult + 1].id
            );
            const newTabIndex = partitionedTopicalData?.findIndex((partition) =>
              partition.some(
                (q) =>
                  q.id ===
                  searchResults[currentQuestionIndexInSearchResult + 1].id
              )
            );
            if (newTabIndex > -1) {
              setCurrentTabThatContainsQuestion(newTabIndex);
            }
            searchVirtualizer.scrollToIndex(
              currentQuestionIndexInSearchResult + 1
            );
          }
        }
      }
    }, [
      currentQuestionId,
      currentQuestionIndex,
      currentTabThatContainsQuestion,
      partitionedTopicalData,
      scrollToQuestion,
      searchInput,
      searchResults,
      searchVirtualizer,
      setCurrentQuestionId,
      setCurrentTabThatContainsQuestion,
    ]);
    const handlePreviousQuestion = useCallback(() => {
      if (partitionedTopicalData) {
        if (searchInput === "") {
          if (currentQuestionIndex > 0) {
            setCurrentQuestionId(
              partitionedTopicalData[currentTabThatContainsQuestion][
                currentQuestionIndex - 1
              ].id
            );
            setCurrentTab(currentTabThatContainsQuestion);
            scrollToQuestion({
              questionId:
                partitionedTopicalData[currentTabThatContainsQuestion][
                  currentQuestionIndex - 1
                ].id,
              tab: currentTabThatContainsQuestion,
            });
          } else {
            if (currentTabThatContainsQuestion > 0) {
              setCurrentTab(currentTabThatContainsQuestion - 1);
              setCurrentTabThatContainsQuestion(
                currentTabThatContainsQuestion - 1
              );
              setCurrentQuestionId(
                partitionedTopicalData[currentTabThatContainsQuestion - 1][
                  partitionedTopicalData[currentTabThatContainsQuestion - 1]
                    .length - 1
                ].id
              );
              setTimeout(() => {
                scrollToQuestion({
                  questionId:
                    partitionedTopicalData[currentTabThatContainsQuestion - 1][
                      partitionedTopicalData[currentTabThatContainsQuestion - 1]
                        .length - 1
                    ].id,
                  tab: currentTabThatContainsQuestion - 1,
                });
              }, 0);
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
            setCurrentQuestionId(
              searchResults[currentQuestionIndexInSearchResult - 1].id
            );
            const newTabIndex = partitionedTopicalData?.findIndex((partition) =>
              partition.some(
                (q) =>
                  q.id ===
                  searchResults[currentQuestionIndexInSearchResult - 1].id
              )
            );
            if (newTabIndex > -1) {
              setCurrentTabThatContainsQuestion(newTabIndex);
            }
            searchVirtualizer.scrollToIndex(
              currentQuestionIndexInSearchResult - 1
            );
          }
        }
      }
    }, [
      currentQuestionId,
      currentQuestionIndex,
      currentTabThatContainsQuestion,
      partitionedTopicalData,
      scrollToQuestion,
      searchInput,
      searchResults,
      searchVirtualizer,
      setCurrentQuestionId,
      setCurrentTabThatContainsQuestion,
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
            partitionedTopicalData[currentTabThatContainsQuestion].length - 1 &&
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
      (questionId: string) => {
        const tab = questionId
          ? partitionedTopicalData?.findIndex((partition) =>
              partition.some((question) => question.id === questionId)
            ) ?? 0
          : 0;

        setCurrentTabThatContainsQuestion(tab);
        setCurrentTab(tab);
        setCurrentQuestionId(
          !questionId ? partitionedTopicalData?.[tab]?.[0]?.id : questionId
        );

        if (partitionedTopicalData?.[tab] && isVirtualizationReady) {
          scrollToQuestion({ questionId, tab });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        partitionedTopicalData,
        allQuestions,
        isVirtualizationReady,
        scrollToQuestion,
        setCurrentTabThatContainsQuestion,
        setCurrentTab,
        setCurrentQuestionId,
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

    // Hydrate inspector on open
    useEffect(() => {
      if (!isOpen.isOpen) {
        return;
      }
      if (overflowScrollHandler) {
        overflowScrollHandler();
      }
      navigateToQuestion(isOpen.questionId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, overflowScrollHandler, isVirtualizationReady]);

    useEffect(() => {
      setSearchInput("");
      setCurrentView("question");
      if (
        allQuestions &&
        allQuestions.length > 0 &&
        currentQuestionId &&
        !allQuestions.some((question) => question.id === currentQuestionId)
      ) {
        navigateToQuestion(allQuestions[0].id);
        return;
      }
      if (allQuestions && allQuestions.length === 0) {
        setIsOpen({
          isOpen: false,
          questionId: "",
        });
        return;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allQuestions, navigateToQuestion, setIsOpen]);

    return (
      <Sidebar
        className="top-0 !h-full"
        onTransitionEnd={(e) => {
          if (e.propertyName == "left") {
            if (overflowScrollHandler) {
              overflowScrollHandler();
            }
          }
        }}
      >
        <SidebarHeader className="sr-only">Search questions</SidebarHeader>
        <SidebarContent className="dark:bg-accent flex flex-col gap-2 h-full justify-between items-center border-r border-border p-3 pr-1 !overflow-hidden">
          <FinishedTracker
            allQuestions={allQuestions}
            navigateToQuestion={navigateToQuestion}
          />
          <div className="flex items-center justify-start w-full gap-2 px-1 mt-8">
            <div className="flex items-center gap-2 border-b border-border">
              <Search />
              <Input
                onFocus={() => {
                  isInputFocused.current = true;
                }}
                onBlur={() => {
                  isInputFocused.current = false;
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
                  const currentQuestionIndexInSearchResult =
                    searchResults.findIndex(
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
                  {partitionedTopicalData?.[currentTab][virtualItem.index] && (
                    <Fragment key={virtualItem.index}>
                      <QuestionHoverCard
                        resetScrollPositions={resetScrollPositions}
                        question={
                          partitionedTopicalData[currentTab][virtualItem.index]
                        }
                        currentTab={currentTab}
                        currentQuestionId={currentQuestionId}
                        setCurrentQuestionId={setCurrentQuestionId}
                        setCurrentTabThatContainsQuestion={
                          setCurrentTabThatContainsQuestion
                        }
                        listId={listId}
                        isInspectSidebarOpen={isInspectSidebarOpen}
                        isMobileDevice={isMobile}
                      />
                      <SelectSeparator />
                    </Fragment>
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
                  <Fragment key={virtualItem.index}>
                    <QuestionHoverCard
                      resetScrollPositions={resetScrollPositions}
                      question={searchResults[virtualItem.index]}
                      currentTab={
                        partitionedTopicalData?.findIndex((tab) =>
                          tab.some(
                            (question) =>
                              question.id ===
                              searchResults[virtualItem.index]?.id
                          )
                        ) ?? 0
                      }
                      currentQuestionId={currentQuestionId}
                      setCurrentTabThatContainsQuestion={
                        setCurrentTabThatContainsQuestion
                      }
                      listId={listId}
                      setCurrentQuestionId={setCurrentQuestionId}
                      isInspectSidebarOpen={isInspectSidebarOpen}
                      isMobileDevice={isMobile}
                    />
                    <SelectSeparator />
                  </Fragment>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div
            className={cn(
              "flex justify-between items-center w-full",
              searchInput.length > 0 && "hidden"
            )}
          >
            <div className="flex items-center gap-2">
              <Button
                title="Jump to first tab"
                disabled={currentTab === 0}
                onClick={() => {
                  setCurrentTab(0);
                  if (
                    currentTabThatContainsQuestion == 0 &&
                    currentQuestionId
                  ) {
                    scrollToQuestion({
                      questionId: currentQuestionId,
                      tab: 0,
                    });
                  } else {
                    listScrollAreaRef.current?.scrollTo({
                      top: 0,
                      behavior: "instant",
                    });
                  }
                }}
                variant="outline"
                className="w-9 h-9 cursor-pointer rounded-[2px]"
              >
                <ChevronsLeft />
              </Button>
              <Button
                title="Jump to previous tab"
                disabled={currentTab === 0}
                onClick={() => {
                  if (
                    currentTab > 0 &&
                    currentTab < (partitionedTopicalData?.length ?? 0)
                  ) {
                    setCurrentTab(currentTab - 1);
                  }
                  if (
                    currentTabThatContainsQuestion == currentTab - 1 &&
                    currentQuestionId
                  ) {
                    scrollToQuestion({
                      questionId: currentQuestionId,
                      tab: currentTab - 1,
                    });
                  } else {
                    listScrollAreaRef.current?.scrollTo({
                      top: 0,
                      behavior: "instant",
                    });
                  }
                }}
                variant="outline"
                className="w-9 h-9 cursor-pointer rounded-[2px]"
              >
                <ChevronLeft />
              </Button>
            </div>
            <JumpToTabButton
              tab={currentTab}
              onTabChangeCallback={({ tab }) => {
                setCurrentTab(tab);
                listScrollAreaRef.current?.scrollTo({
                  top: 0,
                  behavior: "instant",
                });
              }}
              totalTabs={partitionedTopicalData?.length ?? 0}
            />
            <div className="flex items-center gap-2">
              <Button
                title="Jump to next tab"
                disabled={
                  currentTab === (partitionedTopicalData?.length ?? 1) - 1
                }
                onClick={() => {
                  if (currentTab < (partitionedTopicalData?.length ?? 0) - 1) {
                    setCurrentTab(currentTab + 1);
                  }
                  if (
                    currentTabThatContainsQuestion == currentTab + 1 &&
                    currentQuestionId
                  ) {
                    scrollToQuestion({
                      questionId: currentQuestionId,
                      tab: currentTab + 1,
                    });
                  } else {
                    listScrollAreaRef.current?.scrollTo({
                      top: 0,
                      behavior: "instant",
                    });
                  }
                }}
                variant="outline"
                className="w-9 h-9 cursor-pointer rounded-[2px]"
              >
                <ChevronRight />
              </Button>
              <Button
                title="Jump to last tab"
                disabled={
                  currentTab === (partitionedTopicalData?.length ?? 1) - 1
                }
                onClick={() => {
                  setCurrentTab((partitionedTopicalData?.length ?? 1) - 1);
                  if (
                    currentTabThatContainsQuestion ==
                      (partitionedTopicalData?.length ?? 1) - 1 &&
                    currentQuestionId
                  ) {
                    scrollToQuestion({
                      questionId: currentQuestionId,
                      tab: (partitionedTopicalData?.length ?? 1) - 1,
                    });
                  } else {
                    listScrollAreaRef.current?.scrollTo({
                      top: 0,
                      behavior: "instant",
                    });
                  }
                }}
                variant="outline"
                className="w-9 h-9 cursor-pointer rounded-[2px]"
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }
);
InspectSidebar.displayName = "InspectSidebar";

export default InspectSidebar;
