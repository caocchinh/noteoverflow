"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  extractPaperCode,
  extractQuestionNumber,
  fuzzySearch,
  isOverScrolling,
  updateSearchParams,
} from "../../lib/utils";
import { Button } from "@/components/ui/button";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  FastForward,
  PanelsTopLeft,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectSeparator } from "@/components/ui/select";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BestExamHelpUltility } from "../BestExamHelpUltility";
import { QuestionInspectProps } from "../../constants/types";
import { QuestionInspectFinishedCheckbox } from "../QuestionInspectFinishedCheckbox";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookmarkButton } from "../BookmarkButton";
import { JumpToTabButton } from "../JumpToTabButton";
import Sort from "../Sort";
import { ShareFilter } from "../ShareFilter";
import { QuestionInformation } from "../QuestionInformation";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { useAuth } from "@/context/AuthContext";
import { AnnotatableInspectImages } from "./AnnotatableInspectImages/AnnotatableInspectImages";
import { FinishedTracker } from "./FinishedTracker";
import BrowseMoreQuestions from "./BrowseMoreQuestions";
import QuestionHoverCard from "./QuestionHoverCard";
import BothViews from "./BothViews";

const QuestionInspect = ({
  isOpen,
  currentQuery,
  setIsOpen,
  partitionedTopicalData,
  listId,
  BETTER_AUTH_URL,
  sortParameters,
  setSortParameters,
  isInspectSidebarOpen,
  setIsInspectSidebarOpen,
}: QuestionInspectProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentTabThatContainsQuestion, setCurrentTabThatContainsQuestion] =
    useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<
    string | undefined
  >(undefined);
  const [searchInput, setSearchInput] = useState("");
  const { isSessionPending } = useAuth();
  const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);
  const [currentView, setCurrentView] = useState<
    "question" | "answer" | "both"
  >("question");
  const [isBrowseMoreOpen, setIsBrowseMoreOpen] = useState(false);
  const { isCalculatorOpen, setIsCalculatorOpen } = useTopicalApp();
  console.log(currentQuestionId);
  const currentQuestionIndex = useMemo(() => {
    return (
      partitionedTopicalData?.[currentTabThatContainsQuestion]?.findIndex(
        (question) => question.id === currentQuestionId
      ) ?? 0
    );
  }, [
    partitionedTopicalData,
    currentTabThatContainsQuestion,
    currentQuestionId,
  ]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const currentQuestionData = useMemo(() => {
    return partitionedTopicalData?.[currentTabThatContainsQuestion]?.[
      currentQuestionIndex
    ];
  }, [
    partitionedTopicalData,
    currentTabThatContainsQuestion,
    currentQuestionIndex,
  ]);

  const allQuestions = useMemo(() => {
    return partitionedTopicalData?.flat() ?? [];
  }, [partitionedTopicalData]);

  // Random selection of 20 questions that are not finished (or less if there aren't that many)
  const browseMoreData = useMemo(() => {
    if (!allQuestions || allQuestions.length === 0) {
      return [];
    }

    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(20, allQuestions.length));
  }, [allQuestions]);

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

  const isMobile = useIsMobile();
  useEffect(() => {
    if (isMobile) {
      setIsInspectSidebarOpen(false);
    }
  }, [isMobile, setIsInspectSidebarOpen]);

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

  const resetScrollPositions = useCallback(() => {
    questionScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    answerScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    bothViewsQuestionScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    bothViewsAnswerScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  useEffect(() => {
    setCurrentView("question");
    resetScrollPositions();
  }, [currentQuestionId, resetScrollPositions]);

  const searchVirtualizer = useVirtualizer({
    count: searchResults.length,
    getScrollElement: () => listScrollAreaRef.current,
    estimateSize: () => 65,
    enabled: isVirtualizationReady,
  });
  const virtualSearchItems = searchVirtualizer.getVirtualItems();

  const displayVirtualizer = useVirtualizer({
    count: partitionedTopicalData?.[currentTab]?.length ?? 0,
    getScrollElement: () => listScrollAreaRef.current,
    estimateSize: () => 65,
    enabled: isVirtualizationReady,
  });

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
  const ultilityRef = useRef<HTMLDivElement | null>(null);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const [isUltilityOverflowingRight, setIsUltilityOverflowingRight] =
    useState(false);
  const [isUltilityOverflowingLeft, setIsUltilityOverflowingLeft] =
    useState(false);
  const ultilityHorizontalScrollBarRef = useRef<HTMLDivElement | null>(null);

  const overflowScrollHandler = useCallback(() => {
    const isOverScrollingResult = isOverScrolling({
      child: ultilityRef.current,
      parent: sideBarInsetRef.current,
      specialLeftCase: !isMobile,
    });
    setIsUltilityOverflowingLeft(isOverScrollingResult.isOverScrollingLeft);
    setIsUltilityOverflowingRight(isOverScrollingResult.isOverScrollingRight);
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener("resize", overflowScrollHandler);

    return () => {
      window.removeEventListener("resize", overflowScrollHandler);
    };
  }, [overflowScrollHandler]);

  // Hydrate inspector on open
  useEffect(() => {
    if (!isOpen.isOpen) {
      return;
    }
    overflowScrollHandler();
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

  const virtualDisplayItems = displayVirtualizer.getVirtualItems();
  const listScrollAreaRef = useRef<HTMLDivElement>(null);
  const answerScrollAreaRef = useRef<HTMLDivElement>(null);
  const questionScrollAreaRef = useRef<HTMLDivElement>(null);
  const bothViewsQuestionScrollAreaRef = useRef<HTMLDivElement>(null);
  const bothViewsAnswerScrollAreaRef = useRef<HTMLDivElement>(null);

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
      return currentQuestionIndex === 0 && currentTabThatContainsQuestion === 0;
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
  const [isCoolDown, setIsCoolDown] = useState(false);

  useEffect(() => {
    if (isOpen.isOpen) {
      setCurrentView("question");
      updateSearchParams({
        query: JSON.stringify(currentQuery),
        isInspectOpen: true,
        questionId: isOpen.questionId ?? "",
      });
    } else {
      setIsInputFocused(false);
      if (currentQuery?.curriculumId && currentQuery?.subjectId) {
        updateSearchParams({
          query: JSON.stringify(currentQuery),
          questionId: isOpen.questionId ?? "",
          isInspectOpen: false,
        });
      }
    }
  }, [currentQuery, isOpen]);

  useEffect(() => {
    if (currentQuery && currentQuestionId) {
      updateSearchParams({
        query: JSON.stringify(currentQuery),
        isInspectOpen: true,
        questionId: currentQuestionId,
      });
    }
  }, [currentQuestionId, currentQuery]);

  return (
    <>
      <Dialog
        open={isOpen.isOpen}
        onOpenChange={(open) => {
          setIsOpen({
            isOpen: open,
            questionId:
              currentQuestionId ??
              isOpen.questionId ??
              partitionedTopicalData?.[0]?.[0]?.id ??
              "",
          });
        }}
        modal={false}
      >
        {isOpen.isOpen && (
          <div className="fixed inset-0 z-[100003] bg-black/50" />
        )}
        <DialogContent
          className="w-[95vw] h-[94dvh] flex flex-row items-center justify-center !max-w-screen dark:bg-accent overflow-hidden p-0"
          showCloseButton={false}
          onKeyDown={(e) => {
            if (e.key === "e" && !isInputFocused) {
              e.preventDefault();
              if (currentView === "question") {
                setCurrentView("answer");
              } else {
                setCurrentView("question");
              }
            }
            if (e.key === "r" && !isInputFocused) {
              e.preventDefault();
              setCurrentView("both");
              setIsInspectSidebarOpen(false);
            }
            if (e.key === "t" && !isInputFocused) {
              e.preventDefault();
              setIsInspectSidebarOpen(!isInspectSidebarOpen);
            }
            if (isCoolDown) return;

            if (
              (e.key === "ArrowUp" ||
                ((e.key === "w" || e.key === "a") && !isInputFocused)) &&
              !isHandlePreviousQuestionDisabled
            ) {
              e.preventDefault();
              handlePreviousQuestion();
              setIsCoolDown(true);
              setTimeout(() => {
                setIsCoolDown(false);
              }, 25);
            } else if (
              (e.key === "ArrowDown" ||
                ((e.key === "s" || e.key === "d") && !isInputFocused)) &&
              !isHandleNextQuestionDisabled
            ) {
              e.preventDefault();
              handleNextQuestion();

              setIsCoolDown(true);
              setTimeout(() => {
                setIsCoolDown(false);
              }, 25);
            }
          }}
          onKeyUp={() => {
            setIsCoolDown(false);
          }}
          onInteractOutside={(e) => {
            if (isOpen.isOpen && isCalculatorOpen) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Question and answer inspector</DialogTitle>
            <DialogDescription>
              View the question and answer for individual questions
            </DialogDescription>
          </DialogHeader>
          <SidebarProvider
            onOpenChange={setIsInspectSidebarOpen}
            openMobile={isInspectSidebarOpen}
            onOpenChangeMobile={setIsInspectSidebarOpen}
            open={isInspectSidebarOpen}
            className="!min-h-[inherit]"
            style={
              {
                "--sidebar-width": "299.6px",
                height: "inherit",
                minHeight: "inherit !important",
              } as React.CSSProperties
            }
          >
            <Sidebar
              className="top-0 !h-full"
              onTransitionEnd={(e) => {
                if (e.propertyName == "left") {
                  overflowScrollHandler();
                }
              }}
            >
              <SidebarHeader className="sr-only">
                Search questions
              </SidebarHeader>
              <SidebarContent className="dark:bg-accent flex flex-col gap-2 h-full justify-between items-center border-r border-border p-3 pr-1 !overflow-hidden">
                <FinishedTracker
                  allQuestions={allQuestions}
                  navigateToQuestion={navigateToQuestion}
                />
                <div className="flex items-center justify-start w-full gap-2 px-1 mt-8">
                  <div className="flex items-center gap-2 border-b border-border">
                    <Search />
                    <Input
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
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
                        {partitionedTopicalData?.[currentTab][
                          virtualItem.index
                        ] && (
                          <Fragment key={virtualItem.index}>
                            <QuestionHoverCard
                              resetScrollPositions={resetScrollPositions}
                              question={
                                partitionedTopicalData[currentTab][
                                  virtualItem.index
                                ]
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
                        if (
                          currentTab <
                          (partitionedTopicalData?.length ?? 0) - 1
                        ) {
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
                        setCurrentTab(
                          (partitionedTopicalData?.length ?? 1) - 1
                        );
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
            <SidebarInset className="h-[inherit] w-full p-2 rounded-md px-4 dark:bg-accent gap-2 overflow-hidden flex flex-col items-center justify-between">
              <div
                className="w-full h-[inherit] flex flex-col gap-2 items-center justify-start relative"
                ref={sideBarInsetRef}
              >
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

                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        className="w-9 rounded-sm cursor-pointer"
                        onClick={handleNextQuestion}
                        title="Next question"
                        disabled={isHandleNextQuestionDisabled}
                      >
                        <ChevronDown />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-9 rounded-sm cursor-pointer"
                        onClick={handlePreviousQuestion}
                        title="Previous question"
                        disabled={isHandlePreviousQuestionDisabled}
                      >
                        <ChevronUp />
                      </Button>
                    </div>
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
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() =>
                        setIsInspectSidebarOpen(!isInspectSidebarOpen)
                      }
                    >
                      {isInspectSidebarOpen ? "Hide" : "Show"}
                      <PanelsTopLeft />
                    </Button>
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

                <div
                  className={cn(
                    currentView === "question" ? "block w-full" : "hidden"
                  )}
                >
                  <ScrollArea
                    className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
                    type="always"
                    viewportRef={questionScrollAreaRef}
                  >
                    <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
                      <QuestionInformation
                        question={currentQuestionData}
                        showCurriculumn={false}
                        showSubject={false}
                      />
                    </div>
                    <AnnotatableInspectImages
                      imageSource={currentQuestionData?.questionImages ?? []}
                      currentQuestionId={currentQuestionData?.id}
                    />
                    <div className="my-6"></div>
                    <BrowseMoreQuestions
                      browseMoreData={browseMoreData}
                      navigateToQuestion={navigateToQuestion}
                      isBrowseMoreOpen={isBrowseMoreOpen}
                      setIsBrowseMoreOpen={setIsBrowseMoreOpen}
                    />
                  </ScrollArea>
                </div>
                <div
                  className={cn(
                    currentView === "answer" ? "block w-full" : "hidden"
                  )}
                >
                  <ScrollArea
                    className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
                    type="always"
                    viewportRef={answerScrollAreaRef}
                  >
                    <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
                      <QuestionInformation
                        question={currentQuestionData}
                        showCurriculumn={false}
                        showSubject={false}
                      />
                    </div>
                    <AnnotatableInspectImages
                      imageSource={currentQuestionData?.answers ?? []}
                      currentQuestionId={currentQuestionData?.id}
                    />
                  </ScrollArea>
                </div>
                <div
                  className={cn(
                    currentView === "both" ? "block w-full" : "hidden"
                  )}
                >
                  <div className="flex flex-row flex-wrap w-full gap-2 -mb-3 py-2 justify-start items-start">
                    <QuestionInformation
                      question={currentQuestionData}
                      showCurriculumn={false}
                      showSubject={false}
                    />
                  </div>
                  <BothViews
                    currentQuestionData={currentQuestionData}
                    questionScrollAreaRef={bothViewsQuestionScrollAreaRef}
                    answerScrollAreaRef={bothViewsAnswerScrollAreaRef}
                  />
                </div>
              </div>
              <Button
                className="w-full h-7 flex items-center justify-center cursor-pointer"
                variant="outline"
                onClick={() => {
                  if (currentQuestionId) {
                    setIsOpen({ isOpen: false, questionId: currentQuestionId });
                  }
                }}
              >
                Close
              </Button>
            </SidebarInset>
          </SidebarProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionInspect;
