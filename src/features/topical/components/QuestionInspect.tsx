"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectedQuestion } from "../server/actions";
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
import { extractPaperCode, extractQuestionNumber } from "../lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectSeparator } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import QuestionInspectBookmark from "./QuestionInspectBookmark";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CHUNK_SIZE } from "../constants/constants";

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
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentTabThatContainsQuestion, setCurrentTabThatContainsQuestion] =
    useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<
    string | undefined
  >(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen.isOpen) {
      timeout = setTimeout(() => {
        setIsVirtualizationReady(true);
      }, 0);
    } else {
      setIsVirtualizationReady(false);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  const scrollToQuestion = useCallback(
    ({
      questionId,
      tab,
      isDelayed,
    }: {
      questionId: string;
      tab: number;
      isDelayed: boolean;
    }) => {
      if (!partitionedTopicalData || partitionedTopicalData[tab].length === 0) {
        return;
      }
      const itemIndex =
        partitionedTopicalData[tab].findIndex(
          (question) => question.id === questionId
        ) ?? 0;
      if (itemIndex === -1) {
        return;
      }

      if (isDelayed) {
        const timeout = setTimeout(() => {
          scrollAreaRef.current?.scrollTo({
            top:
              (itemIndex / partitionedTopicalData?.[tab]?.length) *
              scrollAreaRef.current?.scrollHeight,
            behavior: "instant",
          });
          return () => clearTimeout(timeout);
        }, 0);
      } else {
        scrollAreaRef.current?.scrollTo({
          top:
            (itemIndex / partitionedTopicalData?.[tab]?.length) *
            scrollAreaRef.current?.scrollHeight,
          behavior: "instant",
        });
      }
    },
    [partitionedTopicalData]
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
    setCurrentQuestionId(isOpen.questionId);

    if (partitionedTopicalData?.[tab]) {
      scrollToQuestion({ questionId: isOpen.questionId, tab, isDelayed: true });
    }
  }, [isOpen, partitionedTopicalData, scrollToQuestion]);

  useEffect(() => {
    setSearchInput("");
  }, [partitionedTopicalData]);

  const allQuestions = useMemo(() => {
    return partitionedTopicalData?.flat() ?? [];
  }, [partitionedTopicalData]);

  const searchResults = useMemo(() => {
    return searchInput.length > 0
      ? allQuestions.filter((question) => {
          const searchableText = `${extractPaperCode(
            question.id
          )} Q${extractQuestionNumber(question.id)}`;
          return fuzzySearch(searchInput, searchableText);
        })
      : [];
  }, [searchInput, allQuestions]);

  const searchVirtualizer = useVirtualizer({
    count: searchResults.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => 65,
    enabled: isVirtualizationReady,
  });
  const virtualSearchItems = searchVirtualizer.getVirtualItems();

  const displayVirtualizer = useVirtualizer({
    count: CHUNK_SIZE,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => 65,
    enabled: isVirtualizationReady,
  });
  const virtualDisplayItems = displayVirtualizer.getVirtualItems();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
                    isDelayed: true,
                  });
                }
              }}
            />
          </div>
          <ScrollArea
            className={cn(
              "w-full",
              searchInput.length > 0 ? "h-[90%]" : "h-[80%] "
            )}
            type="always"
            viewportRef={scrollAreaRef}
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
                          {extractPaperCode(
                            partitionedTopicalData?.[currentTab][
                              virtualItem.index
                            ]?.id
                          )}{" "}
                          Q
                          {extractQuestionNumber(
                            partitionedTopicalData?.[currentTab][
                              virtualItem.index
                            ]?.id
                          )}
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
                      {extractPaperCode(searchResults[virtualItem.index]?.id)} Q
                      {extractQuestionNumber(
                        searchResults[virtualItem.index]?.id
                      )}
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
                      isDelayed: true,
                    });
                  } else {
                    scrollAreaRef.current?.scrollTo({
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
                      isDelayed: true,
                    });
                  } else {
                    scrollAreaRef.current?.scrollTo({
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
                      isDelayed: true,
                    });
                  } else {
                    scrollAreaRef.current?.scrollTo({
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
                      isDelayed: true,
                    });
                  } else {
                    scrollAreaRef.current?.scrollTo({
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
          <Tabs defaultValue="question">
            <TabsList>
              <TabsTrigger value="question" className="cursor-pointer">
                Question
              </TabsTrigger>
              <TabsTrigger value="answer" className="cursor-pointer">
                Answer
              </TabsTrigger>
            </TabsList>
            <TabsContent value="question">
              <ScrollArea
                className="h-[83vh] w-full [&_.bg-border]:bg-logo-main/25"
                type="always"
              >
                <div className="flex flex-col gap-2 w-full">
                  {partitionedTopicalData?.[currentTabThatContainsQuestion]
                    ?.find((q) => q.id === currentQuestionId)
                    ?.questionImages?.map((image) => (
                      <Image
                        className="w-full h-full object-contain"
                        key={image.imageSrc}
                        src={image.imageSrc}
                        alt="Question image"
                        width={100}
                        height={100}
                      />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="answer">
              <ScrollArea className="h-[90vh] w-full">
                <div className="flex flex-col gap-2">
                  {partitionedTopicalData?.[currentTabThatContainsQuestion]
                    ?.find((q) => q.id === currentQuestionId)
                    ?.answers?.map((answer) => (
                      <Image
                        className="w-full h-full object-contain"
                        key={answer.answer}
                        src={answer.answer}
                        alt="Answer image"
                        width={100}
                        height={100}
                      />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionInspect;
