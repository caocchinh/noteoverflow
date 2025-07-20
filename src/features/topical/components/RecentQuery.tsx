import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FILTERS_CACHE_KEY,
  MAX_NUMBER_OF_RECENT_QUERIES,
  DEFAULT_LAYOUT_STYLE,
  DEFAULT_NUMBER_OF_COLUMNS,
  DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
  PAPER_TYPE_SORT_DEFAULT_WEIGHT,
  TOPIC_SORT_DEFAULT_WEIGHT,
  YEAR_SORT_DEFAULT_WEIGHT,
  SEASON_SORT_DEFAULT_WEIGHT,
} from "@/features/topical/constants/constants";
import { Button } from "@/components/ui/button";
import { History, Loader2, ScanText, Wrench } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilterData, FiltersCache, SortParameters } from "../constants/types";
import { RefObject, useEffect, useRef, useState } from "react";
import { addRecentQuery } from "../server/actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ValidCurriculum } from "@/constants/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { computeWeightedScoreByArrayIndex } from "../lib/utils";

export const RecentQuery = ({
  isEnabled,
  currentQuery,
  setIsSearchEnabled,
  setCurrentQuery,
  isOverwriting,
  setSelectedCurriculum,
  setSelectedSubject,
  setSelectedTopic,
  setSelectedYear,
  setSelectedPaperType,
  setSelectedSeason,
  setSortParameters,
}: {
  isEnabled: boolean;
  setIsSearchEnabled: (isSearchEnabled: boolean) => void;
  currentQuery: {
    curriculumId: string;
    subjectId: string;
  } & FilterData;
  setCurrentQuery: (
    query: {
      curriculumId: string;
      subjectId: string;
    } & FilterData
  ) => void;
  setSelectedCurriculum: (curriculum: ValidCurriculum) => void;
  setSelectedSubject: (subject: string) => void;
  setSelectedTopic: (topic: string[]) => void;
  setSelectedYear: (year: string[]) => void;
  setSortParameters: (value: SortParameters | null) => void;
  setSelectedPaperType: (paperType: string[]) => void;
  setSelectedSeason: (season: string[]) => void;
  isOverwriting: RefObject<boolean>;
}) => {
  const queryClient = useQueryClient();

  const {
    data: recentQuery,
    isError: isRecentQueryError,
    isPending: isRecentQueryPending,
  } = useQuery({
    queryKey: ["user_recent_query"],
    queryFn: async () => {
      const response = await fetch("/api/topical/recent-query", {
        method: "GET",
      });
      const data: {
        data: {
          queryKey: string;
          sortParams: string | null;
          lastSearch: number;
        }[];
        error?: string;
      } = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }

      return data.data;
    },
    enabled: isEnabled,
  });

  const { mutate, isPending: isAddRecentQueryPending } = useMutation({
    mutationKey: ["add_recent_query"],
    mutationFn: async (queryKey: string) => {
      const result = await addRecentQuery({ queryKey: queryKey });
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        isAnyDeleted: result.data?.isAnyDeleted,
        lastSearch: result.data?.lastSearch,
        realQueryKey: queryKey,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<
        {
          queryKey: string;
          sortParams: string | null;
          lastSearch: number;
        }[]
      >(["user_recent_query"], (oldData) => {
        if (!oldData) {
          return oldData;
        }
        if (data && data.realQueryKey) {
          let newData = oldData;
          if (data.isAnyDeleted) {
            newData = newData.filter(
              (item) => item.queryKey !== data.realQueryKey
            );
          }
          const isQueryAlreadyExist = newData.find(
            (item) => item.queryKey === data.realQueryKey
          );
          if (!isQueryAlreadyExist) {
            newData.unshift({
              queryKey: data.realQueryKey,
              sortParams: null,
              lastSearch: data.lastSearch?.getTime() ?? 0,
            });
          } else {
            newData = newData.map((item) => {
              if (item.queryKey === data.realQueryKey) {
                return {
                  ...item,
                  lastSearch: data.lastSearch?.getTime() ?? 0,
                };
              }
              return item;
            });
          }
          return newData;
        }
        return oldData;
      });
    },
  });
  const [accordionValue, setAccordionValue] = useState<string>("0");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"ascending" | "descending">(
    "descending"
  );
  const [loadSortParamsOnSearch, setLoadSortParamsOnSearch] = useState(true);
  const isMounted = useRef(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
      if (savedState) {
        const parsedState: FiltersCache = JSON.parse(savedState);
        setSortBy(parsedState.recentlySearchSortedBy);
        setLoadSortParamsOnSearch(parsedState.loadSortParamsOnSearch);
      }
    } catch {}
    setTimeout(() => {
      isMounted.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      return;
    }
    try {
      let stateToSave: FiltersCache;
      try {
        const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
        stateToSave = existingStateJSON
          ? JSON.parse(existingStateJSON)
          : {
              numberOfColumns: DEFAULT_NUMBER_OF_COLUMNS,
              layoutStyle: DEFAULT_LAYOUT_STYLE,
              numberOfQuestionsPerPage: DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
              isSessionCacheEnabled: true,
              isPersistantCacheEnabled: true,
              showFinishedQuestionTint: true,
              scrollUpWhenPageChange: true,
              showScrollToTopButton: true,
              lastSessionCurriculum: "",
              lastSessionSubject: "",
              filters: {},
            };
      } catch {
        // If reading fails, start with empty state
        stateToSave = {
          recentlySearchSortedBy: "ascending",
          loadSortParamsOnSearch: true,
          numberOfColumns: DEFAULT_NUMBER_OF_COLUMNS,
          layoutStyle: DEFAULT_LAYOUT_STYLE,
          numberOfQuestionsPerPage: DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
          isSessionCacheEnabled: true,
          isPersistantCacheEnabled: true,
          showFinishedQuestionTint: true,
          scrollUpWhenPageChange: true,
          showScrollToTopButton: true,
          lastSessionCurriculum: "",
          lastSessionSubject: "",
          filters: {},
        };
      }
      stateToSave = {
        ...stateToSave,
        recentlySearchSortedBy: sortBy,
        loadSortParamsOnSearch: loadSortParamsOnSearch,
      };

      localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [loadSortParamsOnSearch, sortBy]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full cursor-pointer rounded-sm" variant="outline">
          <History /> Recently searched
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="dark:bg-accent h-[95dvh] z-[100008]"
        overlayClassName="z-[100007]"
      >
        <DialogHeader className="flex justify-between flex-row">
          <div>
            <DialogTitle>Recently searched</DialogTitle>
            <DialogDescription>
              Your last {MAX_NUMBER_OF_RECENT_QUERIES} searches will show here
            </DialogDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-max">
                Settings <Wrench />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[100009] dark:bg-accent !w-max flex flex-col items-center justify-center">
              <p className="text-sm mb-1">Sort by date</p>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value as "ascending" | "descending");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="z-[1000010] dark:bg-accent">
                  <SelectItem value="ascending">Newest first</SelectItem>
                  <SelectItem value="descending">Oldest first</SelectItem>
                </SelectContent>
              </Select>

              <p className="text-sm mb-1 mt-5">
                Load previous sort settings on search?
              </p>
              <Switch
                checked={loadSortParamsOnSearch}
                onCheckedChange={setLoadSortParamsOnSearch}
              />
            </PopoverContent>
          </Popover>
        </DialogHeader>

        <Accordion
          value={accordionValue}
          onValueChange={setAccordionValue}
          type="single"
          collapsible
        >
          <ScrollArea type="always" className="h-[70vh] pr-5">
            {isRecentQueryPending && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin" />
              </div>
            )}
            {isRecentQueryError && (
              <div className="flex justify-center items-center h-full">
                <p className="text-red-500">
                  An error occurred while fetching recent queries! Please
                  refresh the page.
                </p>
              </div>
            )}
            {isAddRecentQueryPending && (
              <div className="flex justify-center items-center text-sm gap-2">
                Updating <Loader2 className="animate-spin" size={13} />
              </div>
            )}
            {recentQuery
              ?.toSorted((a, b) => {
                // Convert string dates to timestamps if they're not already numbers
                const dateA =
                  typeof a.lastSearch === "number"
                    ? a.lastSearch
                    : new Date(a.lastSearch).getTime();
                const dateB =
                  typeof b.lastSearch === "number"
                    ? b.lastSearch
                    : new Date(b.lastSearch).getTime();

                if (sortBy === "ascending") {
                  return dateB - dateA; // Newest first
                }
                return dateA - dateB; // Oldest first
              })
              .map((item, index) => {
                const parsedQuery = JSON.parse(item.queryKey) as {
                  curriculumId: string;
                  subjectId: string;
                } & FilterData;
                return (
                  <AccordionItem
                    key={item.queryKey + index}
                    value={index.toString()}
                  >
                    <AccordionTrigger>
                      <div
                        className={cn(
                          "flex flex-col items-start justify-center",
                          accordionValue === index.toString() &&
                            "text-logo-main"
                        )}
                      >
                        <p>
                          {parsedQuery.curriculumId} - {parsedQuery.subjectId} -{" "}
                          {parsedQuery.topic.length} topic
                          {parsedQuery.topic.length > 1 && "s"} -{" "}
                          {parsedQuery.year.length} year
                          {parsedQuery.year.length > 1 && "s"}
                        </p>
                        <p
                          className={cn(
                            "text-muted-foreground",
                            accordionValue === index.toString() && "text-white"
                          )}
                        >
                          {new Date(item.lastSearch).toLocaleString(undefined, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col border border-logo-main p-3 rounded-sm mb-2 gap-2">
                      <div className="flex w-full flex-wrap gap-2">
                        Topic:
                        {parsedQuery.topic.map((topic) => (
                          <Badge key={topic} className="flex flex-row">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex w-full flex-wrap gap-2">
                        Year:
                        {parsedQuery.year.map((year) => (
                          <Badge key={year} className="flex flex-row">
                            {year}
                          </Badge>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex w-full flex-wrap gap-2">
                        Paper:
                        {parsedQuery.paperType.map((paper) => (
                          <Badge key={paper} className="flex flex-row">
                            {paper}
                          </Badge>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex w-full flex-wrap gap-2">
                        Season:
                        {parsedQuery.season.map((season) => (
                          <Badge key={season} className="flex flex-row">
                            {season}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        className="w-full mt-2 !bg-logo-main !text-white cursor-pointer"
                        onClick={() => {
                          const stringifiedNewQuery =
                            JSON.stringify(parsedQuery);
                          if (
                            stringifiedNewQuery !== JSON.stringify(currentQuery)
                          ) {
                            mutate(stringifiedNewQuery);
                            setCurrentQuery(parsedQuery);
                            isOverwriting.current = true;
                            setSelectedCurriculum(
                              parsedQuery.curriculumId as ValidCurriculum
                            );
                            setSelectedSubject(parsedQuery.subjectId);
                            setSelectedTopic(parsedQuery.topic);
                            setSelectedSeason(parsedQuery.season);
                            setSelectedYear(parsedQuery.year);
                            setIsSearchEnabled(true);
                            setSelectedPaperType(parsedQuery.paperType);

                            if (loadSortParamsOnSearch && item.sortParams) {
                              setSortParameters(
                                JSON.parse(item.sortParams) as SortParameters
                              );
                            } else {
                              setSortParameters({
                                paperType: {
                                  data: computeWeightedScoreByArrayIndex({
                                    data: parsedQuery.paperType,
                                  }),
                                  weight: PAPER_TYPE_SORT_DEFAULT_WEIGHT,
                                },
                                topic: {
                                  data: computeWeightedScoreByArrayIndex({
                                    data: parsedQuery.topic,
                                  }),
                                  weight: TOPIC_SORT_DEFAULT_WEIGHT,
                                },
                                year: {
                                  data: computeWeightedScoreByArrayIndex({
                                    data: parsedQuery.year,
                                  }),
                                  weight: YEAR_SORT_DEFAULT_WEIGHT,
                                },
                                season: {
                                  data: computeWeightedScoreByArrayIndex({
                                    data: parsedQuery.season,
                                  }),
                                  weight: SEASON_SORT_DEFAULT_WEIGHT,
                                },
                              });
                            }

                            setTimeout(() => {
                              isOverwriting.current = false;
                            }, 0);
                          }
                          setIsDialogOpen(false);
                        }}
                      >
                        Search
                        <ScanText />
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </ScrollArea>
        </Accordion>
        <DialogClose asChild>
          <Button className="cursor-pointer">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
