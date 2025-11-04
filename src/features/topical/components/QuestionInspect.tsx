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
  Dispatch,
  Fragment,
  RefObject,
  SetStateAction,
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
  updateSearchParams,
} from "../lib/utils";
import { Button } from "@/components/ui/button";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Eye,
  EyeClosed,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ValidSeason } from "@/constants/types";
import {
  CurrentQuery,
  QuestionHoverCardProps,
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
import { SortBy } from "./SortBy";
import { ShareFilter } from "./ShareFilter";
import { QuestionInformation } from "./QuestionInformation";
import { InspectImages } from "./InspectImages";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Loader from "./Loader/Loader";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const QuestionHoverCard = ({
  question,
  currentTab,
  currentQuestionId,
  setCurrentQuestionId,
  questionScrollAreaRef,
  answerScrollAreaRef,
  setCurrentTabThatContainsQuestion,
  userFinishedQuestions,
  bookmarks,
  isUserSessionPending,
  isMobileDevice,
  isValidSession,
  listId,
  isBookmarksFetching,
  isBookmarkError,
  isInspectSidebarOpen,
}: QuestionHoverCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [hoverCardOpen, setHoverCardOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const touchStartTimeRef = useRef<number | null>(null);
  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: ["all_user_bookmarks", question.id],
    }) > 0;
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      touchStartTimeRef.current = null;
    };
  }, []);
  const hoverCardBreakPoint = useIsMobile({ breakpoint: 1185 });

  return (
    <HoverCard
      open={
        ((hoverCardOpen && !isPopoverOpen) ||
          (isPopoverOpen && !hoverCardBreakPoint)) &&
        isInspectSidebarOpen
      }
    >
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "cursor-pointer relative p-2 rounded-sm flex items-center justify-between hover:bg-foreground/10",
            currentQuestionId === question?.id && "!bg-logo-main text-white",
            userFinishedQuestions?.some(
              (item) => item.question.id === question?.id
            ) &&
              "bg-green-600 dark:hover:bg-green-600 hover:bg-green-600 text-white"
          )}
          onTouchStart={() => {
            touchStartTimeRef.current = Date.now();
          }}
          onMouseEnter={() => {
            if (touchStartTimeRef.current) {
              return;
            }
            if (isPopoverOpen) {
              return;
            }
            hoverTimeoutRef.current = setTimeout(() => {
              setHoverCardOpen(true);
            }, 375);
          }}
          onMouseLeave={() => {
            if (touchStartTimeRef.current) {
              return;
            }
            if (!isPopoverOpen) {
              setHoverCardOpen(false);
            }
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onClick={() => {
            setCurrentQuestionId(question?.id);
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
              questionId: question?.id,
            })}{" "}
            Q
            {extractQuestionNumber({
              questionId: question?.id,
            })}
          </p>
          <BookmarkButton
            triggerButtonClassName="h-[26px] w-[26px] border-black border !static"
            popOverTriggerClassName={cn(
              "absolute top-1/2 -translate-y-1/2 right-1 h-7 w-7  flex cursor-pointer z-[30]"
            )}
            badgeClassName="hidden"
            question={question}
            isBookmarkDisabled={isUserSessionPending}
            bookmarks={bookmarks}
            setIsHovering={setHoverCardOpen}
            setIsPopoverOpen={setIsPopoverOpen}
            isPopoverOpen={isPopoverOpen}
            isValidSession={isValidSession}
            listId={listId}
            isBookmarksFetching={isBookmarksFetching}
            isBookmarkError={isBookmarkError}
            isInView={true}
          />
          {isMutatingThisQuestion && (
            <Badge
              className="absolute top-1/2 -translate-y-1/2 right-2 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-black rounded-[3px] !min-h-[28px] z-[31]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (isUserSessionPending) {
                  return;
                }
                if (isBookmarkError) {
                  toast.error("Bookmark error. Please refresh the page.", {
                    duration: 2000,
                    position:
                      isMobileDevice && isPopoverOpen
                        ? "top-center"
                        : "bottom-right",
                  });
                  return;
                }
                if (!isValidSession) {
                  toast.error("Please sign in to bookmark questions.", {
                    duration: 2000,
                    position:
                      isMobileDevice && isPopoverOpen
                        ? "top-center"
                        : "bottom-right",
                  });
                  return;
                }
                setIsPopoverOpen(true);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            >
              Saving
              <Loader2 className="animate-spin" />
            </Badge>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className={cn(
          "z-[100007] w-max p-0 overflow-hidden border-none max-w-md min-h-[100px] !bg-white md:flex hidden   items-center justify-center rounded-sm",
          currentQuestionId === question?.id && "!hidden"
        )}
        side="right"
        sideOffset={25}
      >
        {!isImageLoaded && !isImageError && (
          <div className="absolute top-0 left-0 w-full h-full z-[99] bg-white flex flex-wrap gap-2 items-center justify-center content-center p-2 overflow-hidden">
            <Loader />
          </div>
        )}
        {isImageError && (
          <div className="absolute top-0 left-0 w-full h-full z-[99] bg-white flex flex-wrap gap-2 items-center justify-center content-center p-2 overflow-hidden">
            <p className="text-red-500 text-sm">Image failed to load</p>
          </div>
        )}
        <img
          onLoad={() => {
            setIsImageLoaded(true);
          }}
          loading="lazy"
          onError={() => {
            setIsImageError(true);
          }}
          src={question?.questionImages[0]}
          alt="Question image"
          width={400}
          className="max-h-[70dvh] overflow-hidden object-cover object-top"
        />
      </HoverCardContent>
    </HoverCard>
  );
};

const QuestionInspect = ({
  isOpen,
  currentQuery,
  setIsOpen,
  partitionedTopicalData,
  bookmarks,
  imageTheme,
  isUserSessionPending,
  isValidSession,
  isBookmarksFetching,
  isBookmarkError,
  listId,
  isFinishedQuestionsFetching,
  sortBy,
  BETTER_AUTH_URL,
  setSortBy,
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

  setIsOpen: Dispatch<SetStateAction<{ isOpen: boolean; questionId: string }>>;
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  bookmarks: SelectedBookmark[];
  imageTheme: "dark" | "light";
  currentQuery?: CurrentQuery;
  isUserSessionPending: boolean;
  sortBy?: "ascending" | "descending";
  setSortBy?: Dispatch<SetStateAction<"ascending" | "descending">>;
  sortParameters?: SortParameters | null;
  setSortParameters?: Dispatch<SetStateAction<SortParameters | null>>;
  isValidSession: boolean;
  isInspectSidebarOpen: boolean;
  setIsInspectSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
  isFinishedQuestionsFetching: boolean;
  isFinishedQuestionsError: boolean;
  userFinishedQuestions: SelectedFinishedQuestion[];
  listId?: string;
  BETTER_AUTH_URL: string;
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentTabThatContainsQuestion, setCurrentTabThatContainsQuestion] =
    useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<
    string | undefined
  >(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);
  const [currentView, setCurrentView] = useState<
    "question" | "answer" | "both"
  >("question");

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

  useEffect(() => {
    questionScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    answerScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
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

  useEffect(() => {
    setIsOpen((prev) => {
      return {
        ...prev,
        questionId: currentQuestionId ?? prev.questionId,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortParameters, setIsOpen]);

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
    >
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
          if (isCoolDown) return;

          if (
            (e.key === "ArrowUp" ||
              ((e.key === "w" || e.key === "a" || e.key === "ArrowLeft") &&
                !isInputFocused)) &&
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
              ((e.key === "s" || e.key === "d" || e.key === "ArrowRight") &&
                !isInputFocused)) &&
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
            <SidebarHeader className="sr-only">Search questions</SidebarHeader>
            <SidebarContent className="dark:bg-accent flex flex-col gap-2 h-full justify-between items-center border-r border-border p-3 pr-1 !overflow-hidden">
              <FinishedTracker
                allQuestions={allQuestions}
                isFinishedQuestionsFetching={isFinishedQuestionsFetching}
                isValidSession={isValidSession}
                isUserSessionPending={isUserSessionPending}
              />
              <div className="flex items-center justify-start w-full gap-2 px-1 mt-5">
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
                            question={
                              partitionedTopicalData[currentTab][
                                virtualItem.index
                              ]
                            }
                            currentTab={currentTab}
                            currentQuestionId={currentQuestionId}
                            setCurrentQuestionId={setCurrentQuestionId}
                            questionScrollAreaRef={questionScrollAreaRef}
                            answerScrollAreaRef={answerScrollAreaRef}
                            setCurrentTabThatContainsQuestion={
                              setCurrentTabThatContainsQuestion
                            }
                            userFinishedQuestions={userFinishedQuestions}
                            bookmarks={bookmarks}
                            isUserSessionPending={isUserSessionPending}
                            isValidSession={isValidSession}
                            listId={listId}
                            isBookmarksFetching={isBookmarksFetching}
                            isBookmarkError={isBookmarkError}
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
                          questionScrollAreaRef={questionScrollAreaRef}
                          answerScrollAreaRef={answerScrollAreaRef}
                          setCurrentTabThatContainsQuestion={
                            setCurrentTabThatContainsQuestion
                          }
                          userFinishedQuestions={userFinishedQuestions}
                          bookmarks={bookmarks}
                          isUserSessionPending={isUserSessionPending}
                          isValidSession={isValidSession}
                          listId={listId}
                          isBookmarksFetching={isBookmarksFetching}
                          isBookmarkError={isBookmarkError}
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
                      onClick={() => setCurrentView("both")}
                      className={cn(
                        "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
                        currentView === "both" &&
                          "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 "
                      )}
                    >
                      Both
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
                      finishedQuestions={userFinishedQuestions}
                      question={currentQuestionData}
                      isFinishedQuestionDisabled={isUserSessionPending}
                      isFinishedQuestionFetching={isFinishedQuestionsFetching}
                      isFinishedQuestionError={isFinishedQuestionsError}
                      isValidSession={isValidSession}
                    />
                  )}
                  {currentQuestionData && (
                    <BookmarkButton
                      triggerButtonClassName="h-[35px] w-[35px] border-black border !static"
                      badgeClassName="h-[35px] min-h-[35px] !static"
                      question={currentQuestionData}
                      isBookmarkDisabled={isUserSessionPending}
                      listId={listId}
                      bookmarks={bookmarks}
                      popOverAlign="start"
                      isValidSession={isValidSession}
                      isBookmarksFetching={isBookmarksFetching}
                      isBookmarkError={isBookmarkError}
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
                          : "View entire paper"}
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
                          : "View entire mark scheme"}
                      </PastPaperLink>
                    </TooltipContent>
                  </Tooltip>

                  {sortBy && setSortBy && (
                    <SortBy sortBy={sortBy} setSortBy={setSortBy} />
                  )}
                  {sortParameters && setSortParameters && (
                    <Sort
                      sortParameters={sortParameters}
                      setSortParameters={setSortParameters}
                      isDisabled={false}
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
                  <InspectImages
                    imageSource={currentQuestionData?.questionImages ?? []}
                    currentQuestionId={currentQuestionData?.id}
                    imageTheme={imageTheme}
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
                  <InspectImages
                    imageSource={currentQuestionData?.answers ?? []}
                    currentQuestionId={currentQuestionData?.id}
                    imageTheme={imageTheme}
                  />
                </ScrollArea>
              </div>
              <div
                className={cn(
                  currentView === "both" ? "block w-full" : "hidden"
                )}
              >
                <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
                  <QuestionInformation
                    question={currentQuestionData}
                    showCurriculumn={false}
                    showSubject={false}
                  />
                </div>
                <BothViews
                  currentQuestionData={currentQuestionData}
                  imageTheme={imageTheme}
                  isMobile={isMobile}
                  questionScrollAreaRef={questionScrollAreaRef}
                  answerScrollAreaRef={answerScrollAreaRef}
                />
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

const FinishedTracker = ({
  allQuestions,
  isValidSession,
  isFinishedQuestionsFetching,
  isUserSessionPending,
}: {
  allQuestions: SelectedQuestion[];
  isValidSession: boolean;
  isFinishedQuestionsFetching: boolean;
  isUserSessionPending: boolean;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMutatingFinishedQuestion =
    useIsMutating({
      mutationKey: ["user_finished_questions"],
    }) > 0;
  const queryClient = useQueryClient();
  const userFinishedQuestions: SelectedFinishedQuestion[] | undefined =
    queryClient.getQueryData(["user_finished_questions"]);
  return (
    <div className="absolute w-full h-7 bg-green-600 left-0 top-0 flex items-center justify-center text-white text-sm">
      {!isFinishedQuestionsFetching &&
        !isUserSessionPending &&
        isValidSession && (
          <>
            Finished{" "}
            {
              allQuestions.filter((q) =>
                userFinishedQuestions?.some((fq) => fq.question.id === q.id)
              ).length
            }{" "}
            out of {allQuestions.length}
          </>
        )}
      {(isUserSessionPending || isFinishedQuestionsFetching) && (
        <span className="text-xs flex items-center justify-center gap-2">
          Fetching data <Loader2 className="animate-spin " size={12} />
        </span>
      )}
      {!isValidSession && !isUserSessionPending && (
        <span className="text-xs flex items-center justify-center gap-2">
          Sign in to track progress
        </span>
      )}
    </div>
  );
};

const BothViews = ({
  isMobile,
  currentQuestionData,
  imageTheme,
  questionScrollAreaRef,
  answerScrollAreaRef,
}: {
  isMobile: boolean;
  currentQuestionData: SelectedQuestion | undefined;
  imageTheme: "dark" | "light";
  questionScrollAreaRef: RefObject<HTMLDivElement | null>;
  answerScrollAreaRef: RefObject<HTMLDivElement | null>;
}) => {
  const [isHidingAnswer, setIsHidingAnswer] = useState(false);
  const [isHidingQuestion, setIsHidingQuestion] = useState(false);
  return (
    <ResizablePanelGroup
      direction={isMobile ? "vertical" : "horizontal"}
      className={cn(
        "rounded-lg border w-full",
        isMobile ? "!h-[65dvh]" : "!h-[74dvh]"
      )}
    >
      <ResizablePanel defaultSize={50} minSize={15}>
        <div
          className="ml-3 m-2 mb-4 flex flex-row gap-1 items-center justify-start flex-wrap cursor-pointer w-max"
          title="Toggle visibility"
          onClick={() => {
            setIsHidingQuestion(!isHidingQuestion);
          }}
        >
          <p className="text-sm">Question</p>
          {!isHidingQuestion ? (
            <Eye strokeWidth={2} />
          ) : (
            <EyeClosed strokeWidth={2} />
          )}
        </div>
        <ScrollArea
          className={cn(
            "h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 p-3 pt-0",
            isMobile && "!h-full",
            isHidingQuestion && "blur-sm"
          )}
          type="always"
          viewportRef={questionScrollAreaRef}
        >
          <InspectImages
            imageSource={currentQuestionData?.questionImages ?? []}
            currentQuestionId={currentQuestionData?.id}
            imageTheme={imageTheme}
          />
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={15}>
        <div
          className="ml-3 w-max m-2 mb-4 flex flex-row gap-1 items-center justify-start flex-wrap cursor-pointer"
          title="Toggle visibility"
          onClick={() => {
            setIsHidingAnswer(!isHidingAnswer);
          }}
        >
          <p className="text-sm">Answer</p>
          {!isHidingAnswer ? <Eye strokeWidth={2} /> : <EyeClosed />}
        </div>
        <ScrollArea
          className={cn(
            "h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 p-3 pt-0",
            isMobile && "!h-full",
            isHidingAnswer && "blur-sm"
          )}
          type="always"
          viewportRef={answerScrollAreaRef}
        >
          <InspectImages
            imageSource={currentQuestionData?.questionImages ?? []}
            currentQuestionId={currentQuestionData?.id}
            imageTheme={imageTheme}
          />
          {/* <InspectImages
                        imageSource={currentQuestionData?.answers ?? []}
                        currentQuestionId={currentQuestionData?.id}
                        imageTheme={imageTheme}
                      /> */}
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
