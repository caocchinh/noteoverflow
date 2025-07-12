/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  extractPaperCode,
  extractQuestionNumber,
  parsePastPaperUrl,
} from "../lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  PencilLine,
  ScrollText,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectSeparator } from "@/components/ui/select";
import Image from "next/image";
import QuestionInspectBookmark from "./QuestionInspectBookmark";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CHUNK_SIZE } from "../constants/constants";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ValidSeason } from "@/constants/types";
import { SelectedQuestion } from "../constants/types";

const fuzzySearch = (query: string, text: string): boolean => {
  if (!query) {
    return true;
  }
  if (!text) {
    return false;
  }
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  let queryIndex = 0;
  let textIndex = 0;
  while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
    if (lowerQuery[queryIndex] === lowerText[textIndex]) {
      queryIndex++;
    }
    textIndex++;
  }
  return queryIndex === lowerQuery.length;
};

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
  isFinishedQuestionsError,
  userFinishedQuestions,
}: {
  isOpen: {
    isOpen: boolean;
    questionId: string;
  };

  setIsOpen: (open: { isOpen: boolean; questionId: string }) => void;
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  bookmarks: Set<string>;
  isUserSessionPending: boolean;
  isValidSession: boolean;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
  isFinishedQuestionsFetching: boolean;
  isFinishedQuestionsError: boolean;
  userFinishedQuestions: Set<string>;
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
  const currentQuestionData = useMemo(() => {
    return partitionedTopicalData?.[currentTabThatContainsQuestion]?.find(
      (question) => question.id === currentQuestionId
    );
  }, [
    partitionedTopicalData,
    currentTabThatContainsQuestion,
    currentQuestionId,
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

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen.isOpen) {
      setCurrentView("question");
      timeout = setTimeout(() => {
        setIsVirtualizationReady(true);
      }, 0);
    } else {
      setIsVirtualizationReady(false);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  const searchVirtualizer = useVirtualizer({
    count: searchResults.length,
    getScrollElement: () => listScrollAreaRef.current,
    estimateSize: () => 65,
    enabled: isVirtualizationReady,
  });
  const virtualSearchItems = searchVirtualizer.getVirtualItems();

  const displayVirtualizer = useVirtualizer({
    count: CHUNK_SIZE,
    getScrollElement: () => listScrollAreaRef.current,
    estimateSize: () => 65,
    enabled: isVirtualizationReady,
  });

  const scrollToQuestion = useCallback(
    ({ questionId, tab }: { questionId: string; tab: number }) => {
      if (
        !partitionedTopicalData ||
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

  useEffect(() => {
    if (!isOpen.isOpen) {
      return;
    }
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

    if (partitionedTopicalData?.[tab]) {
      scrollToQuestion({ questionId: isOpen.questionId, tab });
    }
  }, [isOpen, partitionedTopicalData, scrollToQuestion]);

  const virtualDisplayItems = displayVirtualizer.getVirtualItems();
  const listScrollAreaRef = useRef<HTMLDivElement>(null);
  const answerScrollAreaRef = useRef<HTMLDivElement>(null);
  const questionScrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog
      open={isOpen.isOpen}
      onOpenChange={(open) =>
        setIsOpen({ isOpen: open, questionId: isOpen.questionId })
      }
    >
      <DialogContent className="w-[89vw] h-[93vh] flex flex-row items-center justify-center !max-w-screen dark:bg-accent overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Question and answer inspector</DialogTitle>
          <DialogDescription>
            View the question and answer for individual questions
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 w-[27%] h-[inherit] justify-between items-center border-r border-border p-3 pr-1">
          <div className="flex items-center gap-2 w-full border-b border-border">
            <Search />
            <Input
              className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-accent"
              placeholder="Search for a question"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value.length === 0 && currentQuestionId) {
                  scrollToQuestion({
                    questionId: currentQuestionId,
                    tab: currentTab,
                  });
                }
              }}
            />
            {searchInput.length > 0 && (
              <X
                className="text-red-600 hover:text-red-600/80 cursor-pointer"
                onClick={() => {
                  setSearchInput("");
                  if (currentQuestionId) {
                    scrollToQuestion({
                      questionId: currentQuestionId,
                      tab: currentTab,
                    });
                  }
                }}
              />
            )}
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
                      <div
                        className={cn(
                          "cursor-pointer p-2 rounded-sm dark:hover:bg-background hover:bg-foreground/10 flex items-center justify-between",
                          currentQuestionId ===
                            partitionedTopicalData?.[currentTab][
                              virtualItem.index
                            ]?.id && "!bg-logo-main text-white"
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
                          const newTabIndex = partitionedTopicalData?.findIndex(
                            (partition) =>
                              partition.some(
                                (q) =>
                                  q.id ===
                                  partitionedTopicalData?.[currentTab][
                                    virtualItem.index
                                  ]?.id
                              )
                          );
                          if (newTabIndex !== undefined && newTabIndex > -1) {
                            setCurrentTabThatContainsQuestion(newTabIndex);
                          }
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
                        <QuestionInspectBookmark
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
                        "cursor-pointer p-2 rounded-sm dark:hover:bg-background hover:bg-foreground/10 flex items-center justify-between",
                        currentQuestionId ===
                          searchResults[virtualItem.index]?.id &&
                          "!bg-logo-main text-white"
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
                        const newTabIndex = partitionedTopicalData?.findIndex(
                          (partition) =>
                            partition.some(
                              (q) =>
                                q.id === searchResults[virtualItem.index]?.id
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
                      <QuestionInspectBookmark
                        questionId={searchResults[virtualItem.index]?.id}
                        isBookmarkDisabled={isUserSessionPending}
                        bookmarks={bookmarks}
                        isValidSession={isValidSession}
                        isBookmarksFetching={isBookmarksFetching}
                        isBookmarkError={isBookmarkError}
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
            <div className="flex items-center gap-2  ">
              <Button
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
                className="w-9 h-9 cursor-pointer"
              >
                <ChevronsLeft />
              </Button>
              <Button
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
                className="w-9 h-9 cursor-pointer"
              >
                <ChevronLeft />
              </Button>
            </div>
            <p className="text-md">
              {currentTab + 1}/{partitionedTopicalData?.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
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
                className="w-9 h-9 cursor-pointer"
              >
                <ChevronRight />
              </Button>
              <Button
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
                className="w-9 h-9 cursor-pointer"
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
        <div className="w-[73%] h-[inherit] p-2 rounded-md pr-4 pl-0">
          <div className="flex items-center w-max justify-center gap-4 mb-2">
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
                  className="w-9 h-9 cursor-pointer !p-0 "
                >
                  <PastPaperLink question={currentQuestionData} type="qp">
                    <ScrollText />
                  </PastPaperLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[99999999]" side="bottom">
                <PastPaperLink question={currentQuestionData} type="qp">
                  View paper
                </PastPaperLink>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger className="cursor-pointer -ml-1" asChild>
                <Button
                  variant="outline"
                  className="w-9 h-9 cursor-pointer !p-0"
                >
                  <PastPaperLink question={currentQuestionData} type="ms">
                    <PencilLine />
                  </PastPaperLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[99999999]" side="bottom">
                <PastPaperLink question={currentQuestionData} type="ms">
                  View mark scheme
                </PastPaperLink>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className={cn(currentView === "question" ? "block" : "hidden")}>
            <ScrollArea
              className="h-[83vh] w-full [&_.bg-border]:bg-logo-main/25"
              type="always"
              viewportRef={questionScrollAreaRef}
            >
              <div className="flex flex-row flex-wrap w-full gap-2 py-2">
                <TopicDisplay question={currentQuestionData} />
              </div>
              <QuestionImages
                questionImages={currentQuestionData?.questionImages ?? []}
              />
            </ScrollArea>
          </div>
          <div className={cn(currentView === "answer" ? "block" : "hidden")}>
            <ScrollArea
              className="h-[90vh] w-full"
              viewportRef={answerScrollAreaRef}
            >
              <div className="flex flex-row flex-wrap w-full gap-2 py-2">
                <TopicDisplay question={currentQuestionData} />
              </div>
              <div className="flex flex-col gap-2">
                {currentQuestionData?.answers.map((answer: string) => (
                  <Fragment
                    key={`${answer}${currentQuestionId}${
                      currentQuestionId &&
                      extractQuestionNumber({
                        questionId: currentQuestionId,
                      })
                    }`}
                  >
                    {answer.includes("http") ? (
                      <Image
                        className="w-full h-full object-contain"
                        key={answer}
                        src={answer}
                        alt="Answer image"
                        width={100}
                        height={100}
                      />
                    ) : (
                      <p>{answer}</p>
                    )}
                  </Fragment>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
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
      className="w-full h-full flex items-center justify-center"
      href={parsePastPaperUrl({
        questionId: question.id,
        year: question.year.toString(),
        season: question.season as ValidSeason,
        type,
      })}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const TopicDisplay = ({
  question,
}: {
  question: SelectedQuestion | undefined;
}) => {
  if (!question) {
    return null;
  }

  return (
    <>
      <p>
        Topic
        {question.questionTopics?.length > 1 ? "s" : ""}:
      </p>
      {question.questionTopics?.map((topic) => (
        <Badge key={topic.topic}>{topic.topic}</Badge>
      ))}
    </>
  );
};

const QuestionImages = ({
  questionImages,
}: {
  questionImages: string[] | undefined;
}) => {
  const [loadedCount, setLoadedCount] = useState(0);
  if (!questionImages) {
    return null;
  }
  return (
    <div className="flex flex-col flex-wrap w-full gap-2">
      {/* {loadedCount < questionImages.length && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )} */}
      {questionImages.map((image) => (
        <img
          className="w-full h-full object-contain"
          key={image}
          src={image}
          alt="Question image"
          loading="lazy"
          onLoad={() => setLoadedCount(loadedCount + 1)}
        />
      ))}
    </div>
  );
};
