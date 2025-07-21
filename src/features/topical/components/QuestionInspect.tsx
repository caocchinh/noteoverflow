/* eslint-disable @next/next/no-img-element */
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
  parsePastPaperUrl,
} from "../lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  FastForward,
  Loader2,
  PanelsTopLeft,
  PencilLine,
  ScrollText,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectSeparator } from "@/components/ui/select";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ValidSeason } from "@/constants/types";
import {
  SelectedBookmark,
  SelectedFinishedQuestion,
  SelectedQuestion,
  SortParameters,
} from "../constants/types";
import { QuestionInspectFinishedCheckbox } from "./QuestionInspectFinishedCheckbox";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookmarkButton } from "./BookmarkButton";
import { JumpToTabButton } from "./JumpToTabButton";
import Sort from "./Sort";

const QuestionInspect = ({
  isOpen,
  setIsOpen,
  partitionedTopicalData,
  bookmarks,
  isUserSessionPending,
  isValidSession,
  isBookmarksFetching,
  isBookmarkError,
  isFinishedQuestionsFetching,
  sortParameters,
  setSortParameters,
  isFinishedQuestionsError,
  isInspectSidebarOpen,
  setIsInspectSidebarOpen,
  userFinishedQuestions,
}: {
  isOpen: {
    isOpen: boolean;
    questionId: string;
  };

  setIsOpen: (open: { isOpen: boolean; questionId: string }) => void;
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  bookmarks: SelectedBookmark;
  isUserSessionPending: boolean;
  sortParameters: SortParameters | null;
  setSortParameters: (sortParameters: SortParameters | null) => void;
  isValidSession: boolean;
  isInspectSidebarOpen: boolean;
  setIsInspectSidebarOpen: (open: boolean) => void;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
  isFinishedQuestionsFetching: boolean;
  isFinishedQuestionsError: boolean;
  userFinishedQuestions: SelectedFinishedQuestion;
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentTabThatContainsQuestion, setCurrentTabThatContainsQuestion] =
    useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<
    string | undefined
  >(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);
  const [currentView, setCurrentView] = useState<"question" | "answer">(
    "question"
  );
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
  const currentQuestionData = useMemo(() => {
    return partitionedTopicalData?.[currentTabThatContainsQuestion]?.[
      currentQuestionIndex
    ];
  }, [
    partitionedTopicalData,
    currentTabThatContainsQuestion,
    currentQuestionIndex,
  ]);
  useEffect(() => {
    setSearchInput("");
    setCurrentView("question");
  }, [partitionedTopicalData]);

  const allQuestions = useMemo(() => {
    return partitionedTopicalData?.flat() ?? [];
  }, [partitionedTopicalData]);

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
      setIsBlockingInput(true);
      timeout = setTimeout(() => {
        if (isMobile && isInspectSidebarOpen) {
          setIsVirtualizationReady(true);
        } else if (!isMobile) {
          setIsVirtualizationReady(true);
        } else {
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
        setIsBlockingInput(false);
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

  useEffect(() => {
    setCurrentView("question");
  }, [currentQuestionId]);

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

      displayVirtualizer.scrollToIndex(itemIndex);
    },
    [displayVirtualizer, partitionedTopicalData, isVirtualizationReady]
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
    const tab = isOpen.questionId
      ? partitionedTopicalData?.findIndex((partition) =>
          partition.some((question) => question.id === isOpen.questionId)
        ) ?? 0
      : 0;

    setCurrentTabThatContainsQuestion(tab);
    setCurrentTab(tab);
    setCurrentQuestionId(
      !isOpen.questionId
        ? partitionedTopicalData?.[tab]?.[0]?.id
        : isOpen.questionId
    );

    if (partitionedTopicalData?.[tab] && isVirtualizationReady) {
      scrollToQuestion({ questionId: isOpen.questionId, tab });
    }
  }, [
    isOpen,
    isVirtualizationReady,
    overflowScrollHandler,
    partitionedTopicalData,
    scrollToQuestion,
  ]);

  const virtualDisplayItems = displayVirtualizer.getVirtualItems();
  const listScrollAreaRef = useRef<HTMLDivElement>(null);
  const answerScrollAreaRef = useRef<HTMLDivElement>(null);
  const questionScrollAreaRef = useRef<HTMLDivElement>(null);
  const [isBlockingInput, setIsBlockingInput] = useState(false);
  const handleNextQuestion = () => {
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
  };
  const handlePreviousQuestion = () => {
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
            scrollToQuestion({
              questionId:
                partitionedTopicalData[currentTabThatContainsQuestion - 1][
                  partitionedTopicalData[currentTabThatContainsQuestion - 1]
                    .length - 1
                ].id,
              tab: currentTabThatContainsQuestion - 1,
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
  };
  const isHandleNextQuestionButtonDisabled = useMemo(() => {
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
  const isHandlePreviousQuestionButtonDisabled = useMemo(() => {
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

  return (
    <Dialog
      open={isOpen.isOpen}
      onOpenChange={(open) => {
        if (open) {
          setCurrentView("question");
        }
        setIsOpen({
          isOpen: open,
          questionId:
            currentQuestionId ??
            isOpen.questionId ??
            partitionedTopicalData?.[0]?.[0]?.id ??
            "",
        });
      }}
    >
      <DialogContent
        className="w-[90vw] h-[94dvh] flex flex-row items-center justify-center !max-w-screen dark:bg-accent overflow-hidden p-0"
        showCloseButton={false}
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
            <SidebarHeader className="sr-only">Search questions</SidebarHeader>
            <SidebarContent className="dark:bg-accent flex flex-col gap-2 h-full justify-between items-center border-r border-border p-3 pr-1">
              <div className="flex items-center justify-start w-full gap-2 px-1">
                <div className="flex items-center gap-2 border-b border-border">
                  <Search />
                  <Input
                    className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-accent placeholder:text-sm"
                    placeholder="Search questions"
                    value={searchInput}
                    readOnly={isBlockingInput}
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
                          <div
                            className={cn(
                              "cursor-pointer p-2 rounded-sm flex items-center justify-between hover:bg-foreground/10",
                              currentQuestionId ===
                                partitionedTopicalData?.[currentTab][
                                  virtualItem.index
                                ]?.id && "!bg-logo-main text-white",
                              userFinishedQuestions?.some(
                                (item) =>
                                  item.id ===
                                  partitionedTopicalData?.[currentTab][
                                    virtualItem.index
                                  ]?.id
                              ) &&
                                "bg-green-600 dark:hover:bg-green-600 hover:bg-green-600 text-white"
                            )}
                            onClick={() => {
                              setCurrentQuestionId(
                                partitionedTopicalData?.[currentTab][
                                  virtualItem.index
                                ]?.id
                              );
                              questionScrollAreaRef.current?.scrollTo({
                                top: 0,
                                behavior: "instant",
                              });
                              answerScrollAreaRef.current?.scrollTo({
                                top: 0,
                                behavior: "instant",
                              });

                              setCurrentTabThatContainsQuestion(currentTab);
                            }}
                          >
                            <p>
                              {extractPaperCode({
                                questionId:
                                  partitionedTopicalData?.[currentTab][
                                    virtualItem.index
                                  ]?.id,
                              })}{" "}
                              Q
                              {extractQuestionNumber({
                                questionId:
                                  partitionedTopicalData?.[currentTab][
                                    virtualItem.index
                                  ]?.id,
                              })}
                            </p>
                            <BookmarkButton
                              triggerButtonClassName="h-[26px] w-[26px] border-black border !static"
                              badgeClassName="h-[26px] min-h-[26px] !static"
                              questionId={
                                partitionedTopicalData?.[currentTab][
                                  virtualItem.index
                                ]?.id
                              }
                              isBookmarkDisabled={isUserSessionPending}
                              bookmarks={bookmarks}
                              isValidSession={isValidSession}
                              isBookmarksFetching={isBookmarksFetching}
                              isBookmarkError={isBookmarkError}
                              isInView={true}
                            />
                          </div>
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
                      <Fragment key={searchResults[virtualItem.index]?.id}>
                        <div
                          className={cn(
                            "cursor-pointer p-2 rounded-sm  hover:bg-foreground/10 flex items-center justify-between",
                            currentQuestionId ===
                              searchResults[virtualItem.index]?.id &&
                              "!bg-logo-main text-white",
                            userFinishedQuestions?.some(
                              (item) =>
                                item.id === searchResults[virtualItem.index]?.id
                            ) &&
                              "bg-green-600 dark:hover:bg-green-600 hover:bg-green-600 text-white"
                          )}
                          onClick={() => {
                            setCurrentQuestionId(
                              searchResults[virtualItem.index]?.id
                            );
                            questionScrollAreaRef.current?.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                            answerScrollAreaRef.current?.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                            const newTabIndex =
                              partitionedTopicalData?.findIndex((partition) =>
                                partition.some(
                                  (q) =>
                                    q.id ===
                                    searchResults[virtualItem.index]?.id
                                )
                              );
                            if (newTabIndex !== undefined && newTabIndex > -1) {
                              setCurrentTab(newTabIndex);
                              setCurrentTabThatContainsQuestion(newTabIndex);
                            }
                          }}
                        >
                          {extractPaperCode({
                            questionId: searchResults[virtualItem.index]?.id,
                          })}{" "}
                          Q
                          {extractQuestionNumber({
                            questionId: searchResults[virtualItem.index]?.id,
                          })}
                          <BookmarkButton
                            triggerButtonClassName="h-[26px] w-[26px] border-black border"
                            badgeClassName="h-[26px] min-h-[26px] !static"
                            questionId={searchResults[virtualItem.index]?.id}
                            isBookmarkDisabled={isUserSessionPending}
                            bookmarks={bookmarks}
                            isValidSession={isValidSession}
                            isBookmarksFetching={isBookmarksFetching}
                            isBookmarkError={isBookmarkError}
                            isInView={true}
                          />
                        </div>
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
          <SidebarInset className="h-[inherit] w-full p-2 rounded-md px-4 dark:bg-accent gap-2 overflow-hidden flex flex-col items-center justify-between">
            <div
              className="w-full flex flex-col gap-2 items-center justify-start relative"
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
                  className="flex items-stretch w-max justify-center gap-4 mb-2 relative"
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
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer" asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-9 h-9 cursor-pointer !p-0",
                          currentQuestionData?.year === 2009 &&
                            "opacity-50 cursor-default"
                        )}
                      >
                        <PastPaperLink question={currentQuestionData} type="qp">
                          <ScrollText />
                        </PastPaperLink>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="z-[99999999]" side="bottom">
                      <PastPaperLink question={currentQuestionData} type="qp">
                        {currentQuestionData?.year === 2009
                          ? "Only supported year 2010 and above"
                          : "View paper"}
                      </PastPaperLink>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer -ml-1" asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-9 h-9 cursor-pointer !p-0",
                          currentQuestionData?.year === 2009 &&
                            "opacity-50 cursor-default"
                        )}
                      >
                        <PastPaperLink question={currentQuestionData} type="ms">
                          <PencilLine />
                        </PastPaperLink>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="z-[99999999]" side="bottom">
                      <PastPaperLink question={currentQuestionData} type="ms">
                        {currentQuestionData?.year === 2009
                          ? "Only supported year 2010 and above"
                          : "View mark scheme"}
                      </PastPaperLink>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      className="w-9 rounded-sm cursor-pointer"
                      onClick={handleNextQuestion}
                      title="Next question"
                      disabled={isHandleNextQuestionButtonDisabled}
                    >
                      <ChevronDown />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-9 rounded-sm cursor-pointer"
                      onClick={handlePreviousQuestion}
                      title="Previous question"
                      disabled={isHandlePreviousQuestionButtonDisabled}
                    >
                      <ChevronUp />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      setIsInspectSidebarOpen(!isInspectSidebarOpen)
                    }
                  >
                    Toggle
                    <PanelsTopLeft />
                  </Button>
                  {currentQuestionId && (
                    <BookmarkButton
                      triggerButtonClassName="h-[35px] w-[35px] border-black border !static"
                      badgeClassName="h-[35px] min-h-[35px] !static"
                      questionId={currentQuestionId}
                      isBookmarkDisabled={isUserSessionPending}
                      bookmarks={bookmarks}
                      popOverAlign="start"
                      isValidSession={isValidSession}
                      isBookmarksFetching={isBookmarksFetching}
                      isBookmarkError={isBookmarkError}
                      isInView={true}
                    />
                  )}
                  {currentQuestionData && (
                    <QuestionInspectFinishedCheckbox
                      finishedQuestions={userFinishedQuestions}
                      question={currentQuestionData}
                      isFinishedQuestionDisabled={isUserSessionPending}
                      isFinishedQuestionFetching={isFinishedQuestionsFetching}
                      isFinishedQuestionError={isFinishedQuestionsError}
                      isValidSession={isValidSession}
                    />
                  )}
                  <Sort
                    sortParameters={sortParameters}
                    setSortParameters={setSortParameters}
                    isDisabled={false}
                    onBeforeSort={() => {
                      if (currentQuestionId) {
                        setTimeout(() => {
                          setIsOpen({
                            isOpen: isOpen.isOpen,
                            questionId: currentQuestionId,
                          });
                        }, 0);
                      }
                    }}
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
                  className="h-[76dvh] lg:h-[80dvh] w-full [&_.bg-border]:bg-transparent"
                  type="always"
                  viewportRef={questionScrollAreaRef}
                >
                  <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
                    <QuestionInformation question={currentQuestionData} />
                  </div>
                  <InspectImages
                    imageSource={currentQuestionData?.questionImages ?? []}
                    currentQuestionId={currentQuestionData?.id}
                  />
                </ScrollArea>
              </div>
              <div
                className={cn(
                  currentView === "answer" ? "block w-full" : "hidden"
                )}
              >
                <ScrollArea
                  className="h-[76dvh] lg:h-[80dvh] w-full [&_.bg-border]:bg-transparent"
                  type="always"
                  viewportRef={answerScrollAreaRef}
                >
                  <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
                    <QuestionInformation question={currentQuestionData} />
                  </div>
                  <InspectImages
                    imageSource={currentQuestionData?.answers ?? []}
                    currentQuestionId={currentQuestionData?.id}
                  />
                </ScrollArea>
              </div>
            </div>
            <Button
              className="w-full h-7 flex items-center justify-center cursor-pointer lg:hidden "
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
  );
};

export default QuestionInspect;

const PastPaperLink = ({
  question,
  children,
  type,
}: {
  question: SelectedQuestion | undefined;
  children: React.ReactNode;
  type: "qp" | "ms";
}) => {
  if (!question) {
    return null;
  }
  return (
    <a
      target="_blank"
      className={cn(
        "w-full h-full flex items-center justify-center",
        question.year === 2009 && "pointer-events-none"
      )}
      href={
        question.year === 2009
          ? ""
          : parsePastPaperUrl({
              questionId: question.id,
              year: question.year.toString(),
              season: question.season as ValidSeason,
              type,
            })
      }
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const QuestionInformation = ({
  question,
}: {
  question: SelectedQuestion | undefined;
}) => {
  if (!question) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap w-full gap-2 justify-start items-start mb-3">
      {question.questionTopics?.map((topic) => (
        <Badge key={topic.topic} className="bg-logo-main text-white">
          {topic.topic}
        </Badge>
      ))}
      <Badge>{question.season}</Badge>
      <Badge>{question.year}</Badge>
      <Badge>Paper {question.paperType}</Badge>
      <Badge>
        Question {extractQuestionNumber({ questionId: question.id })}
      </Badge>
    </div>
  );
};

const InspectImages = ({
  imageSource,
  currentQuestionId,
}: {
  imageSource: string[] | undefined;
  currentQuestionId: string | undefined;
}) => {
  if (!imageSource || imageSource.length === 0) {
    return <p className="text-center text-red-600">Unable to fetch resource</p>;
  }
  return (
    <div className="flex flex-col flex-wrap w-full gap-2 relative items-center">
      {imageSource[0]?.includes("http") && (
        <Loader2 className="animate-spin absolute left-1/2 -translate-x-1/2 z-0" />
      )}
      {imageSource.map((item) => (
        <Fragment
          key={`${item}${currentQuestionId}${
            currentQuestionId &&
            extractQuestionNumber({
              questionId: currentQuestionId,
            })
          }`}
        >
          {item.includes("http") ? (
            <img
              className="w-full h-full object-contain relative z-10 !max-w-[800px]"
              src={item}
              alt="Question image"
              loading="lazy"
            />
          ) : (
            <p>{item}</p>
          )}
        </Fragment>
      ))}
    </div>
  );
};
