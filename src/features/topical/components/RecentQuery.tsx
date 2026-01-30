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
import { MAX_NUMBER_OF_RECENT_QUERIES } from "@/features/topical/constants/constants";
import { Button } from "@/components/ui/button";
import { History, Loader2, ScanText, Wrench } from "lucide-react";
import { useIsMutating } from "@tanstack/react-query";
import {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  memo,
} from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  updateSearchParams,
  validateCurriculum,
  validateFilterData,
  validateSubject,
} from "../lib/utils";
import { toast } from "sonner";
import Sort from "./Sort";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { useAuth } from "@/context/AuthContext";
import { RecentQueryProps } from "../types/components";
import { FilterData } from "../types/models";
import { useRecentQueries } from "../hooks";

export const RecentQuery = memo(
  forwardRef(
    (
      {
        currentQuery,
        setIsSearchEnabled,
        setCurrentQuery,
        setSelectedCurriculum,
        setSelectedSubject,
        setSelectedTopic,
        setSelectedYear,
        setSelectedPaperType,
        setSelectedSeason,
        setIsSidebarOpen,
      }: RecentQueryProps,
      ref,
    ) => {
      const { uiPreferences, setUiPreference } = useTopicalApp();
      const { isSessionPending, isAuthenticated } = useAuth();
      const isMobile = useIsMobile();
      const {
        recentQuery,
        isRecentQueryError,
        isRecentQueryFetching,
        deleteRecentQueryMutation,
        mutateRecentQuery,
        isAddRecentQueryPending,
      } = useRecentQueries();

      const [accordionValue, setAccordionValue] =
        useState<string>("skibidi toilet");
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      useImperativeHandle(
        ref,
        () => ({
          mutateRecentQuery,
          isAddRecentQueryPending,
        }),
        [isAddRecentQueryPending, mutateRecentQuery],
      );

      const handleApplyQuery = useCallback(
        (
          parsedQuery: {
            curriculumId: string;
            subjectId: string;
          } & FilterData,
        ) => {
          const stringifiedNewQuery = JSON.stringify(parsedQuery);
          if (stringifiedNewQuery !== JSON.stringify(currentQuery)) {
            if (
              !validateCurriculum(parsedQuery.curriculumId) ||
              !validateSubject(
                parsedQuery.curriculumId,
                parsedQuery.subjectId,
              ) ||
              !validateFilterData({
                data: {
                  topic: parsedQuery.topic,
                  paperType: parsedQuery.paperType,
                  year: parsedQuery.year,
                  season: parsedQuery.season,
                },
                curriculumn: parsedQuery.curriculumId,
                subject: parsedQuery.subjectId,
              })
            ) {
              toast.error("Outdated data. Entry will be deleted.");
              setTimeout(() => {
                deleteRecentQueryMutation(JSON.stringify(parsedQuery));
              }, 0);
              return;
            }
            setAccordionValue("dom dom yes yes");
            setCurrentQuery(parsedQuery);
            updateSearchParams({
              query: JSON.stringify(parsedQuery),
              questionId: "",
              isInspectOpen: false,
            });
            setSelectedCurriculum(parsedQuery.curriculumId as ValidCurriculum);
            setSelectedSubject(parsedQuery.subjectId);
            setSelectedTopic(parsedQuery.topic);
            setSelectedSeason(parsedQuery.season);
            setSelectedYear(parsedQuery.year);
            setIsSearchEnabled(true);
            setSelectedPaperType(parsedQuery.paperType);
          }
          if (isMobile) {
            setIsSidebarOpen(false);
          }
          setIsDialogOpen(false);
        },
        [
          currentQuery,
          deleteRecentQueryMutation,
          isMobile,
          setCurrentQuery,
          setIsSearchEnabled,
          setIsSidebarOpen,
          setSelectedCurriculum,
          setSelectedPaperType,
          setSelectedSeason,
          setSelectedSubject,
          setSelectedTopic,
          setSelectedYear,
        ],
      );

      return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full cursor-pointer rounded-sm"
              variant="outline"
            >
              <History /> Recently searched
            </Button>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="dark:bg-accent h-[95dvh] z-100008"
            overlayClassName="z-[100007]"
          >
            <DialogHeader className="flex justify-between flex-row text-left gap-2">
              <div>
                <DialogTitle>Recently searched</DialogTitle>
                <DialogDescription className="w-[85%]">
                  Your last {MAX_NUMBER_OF_RECENT_QUERIES} searches will show
                  here. Synced accross devices.
                </DialogDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-max">
                    Settings <Wrench />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="z-100009 dark:bg-accent w-max! flex flex-col items-center justify-center">
                  <p className="text-sm mb-1">Sort by date</p>
                  <Sort
                    sortParameters={{
                      sortBy: uiPreferences.recentlySearchSortedBy,
                    }}
                    setSortParameters={(value) => {
                      const newValue =
                        typeof value === "function"
                          ? value({
                              sortBy: uiPreferences.recentlySearchSortedBy,
                            })
                          : value;
                      setUiPreference(
                        "recentlySearchSortedBy",
                        newValue.sortBy,
                      );
                    }}
                    isDisabled={false}
                    disabledMessage=""
                    descendingSortText="Most recently"
                    ascendingSortText="Least recently"
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
              <ScrollArea type="always" className="h-[65vh] pr-5">
                {isRecentQueryFetching && (
                  <div className="flex justify-center items-center h-full gap-2">
                    Fetching <Loader2 className="animate-spin" />
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-red-500 text-center">
                      Please sign in to view recently searched queries.
                    </p>
                  </div>
                )}
                {isRecentQueryError && (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-red-500 text-center">
                      An error occurred while fetching recent queries! Please
                      refresh the page.
                    </p>
                  </div>
                )}
                {isAddRecentQueryPending &&
                  !isSessionPending &&
                  isAuthenticated && (
                    <div className="flex justify-center items-center text-sm gap-2">
                      Updating <Loader2 className="animate-spin" size={13} />
                    </div>
                  )}
                {recentQuery && recentQuery.length == 0 && (
                  <div className="h-full w-full flex items-center justify-center">
                    No item found! Try searching for something.
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

                    if (uiPreferences.recentlySearchSortedBy === "descending") {
                      return dateB - dateA; // Newest first
                    }
                    return dateA - dateB; // Oldest first
                  })
                  .map((item, index) => {
                    return (
                      <RecentQueryItem
                        key={item.queryKey + index}
                        index={index}
                        item={item}
                        accordionValue={accordionValue}
                        onApplyQuery={handleApplyQuery}
                        isAuthenticated={isAuthenticated}
                        isSessionPending={isSessionPending}
                      />
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
    },
  ),
);

RecentQuery.displayName = "RecentQuery";

const RecentQueryItem = memo(
  ({
    item,
    index,
    accordionValue,
    onApplyQuery,
    isAuthenticated,
    isSessionPending,
  }: {
    item: {
      queryKey: string;
      lastSearch: Date;
    };
    index: number;
    accordionValue: string;
    onApplyQuery: (
      parsedQuery: {
        curriculumId: string;
        subjectId: string;
      } & FilterData,
    ) => void;
    isAuthenticated: boolean;
    isSessionPending: boolean;
  }) => {
    const parsedQuery = JSON.parse(item.queryKey) as {
      curriculumId: string;
      subjectId: string;
    } & FilterData;
    const isThisItemDeleting = useIsMutating({
      mutationKey: ["delete_recent_query", item.queryKey],
    });

    return (
      <AccordionItem
        value={index.toString()}
        className={cn(isThisItemDeleting && "opacity-50 pointer-events-none")}
      >
        <AccordionTrigger>
          <div className="flex flex-row items-center justify-start w-full gap-4">
            {index + 1}.
            <div
              className={cn(
                "flex flex-col items-start justify-center",
                accordionValue === index.toString() && "text-logo-main",
                isThisItemDeleting && "text-red-500!",
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
                  accordionValue === index.toString() &&
                    "dark:text-white text-black",
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
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col border border-logo-main p-3 rounded-sm mb-2 gap-2">
          <div className="flex w-full flex-wrap gap-2">
            Topic:
            {parsedQuery.topic.map((topic) => (
              <Badge key={topic} className="flex flex-row whitespace-pre-wrap">
                {topic}
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="flex w-full flex-wrap gap-2">
            Year:
            {parsedQuery.year.map((year) => (
              <Badge key={year} className="flex flex-row whitespace-pre-wrap">
                {year}
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="flex w-full flex-wrap gap-2">
            Paper:
            {parsedQuery.paperType.map((paper) => (
              <Badge key={paper} className="flex flex-row whitespace-pre-wrap">
                {paper}
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="flex w-full flex-wrap gap-2">
            Season:
            {parsedQuery.season.map((season) => (
              <Badge key={season} className="flex flex-row whitespace-pre-wrap">
                {season}
              </Badge>
            ))}
          </div>
          <Button
            className={cn(
              "w-full mt-2 bg-logo-main text-white! cursor-pointer hover:bg-logo-main",
              isThisItemDeleting && "bg-red-500!",
            )}
            onClick={() => {
              if (isThisItemDeleting || isSessionPending || !isAuthenticated) {
                return;
              }
              onApplyQuery(parsedQuery);
            }}
          >
            Search
            <ScanText />
          </Button>
        </AccordionContent>
      </AccordionItem>
    );
  },
);

RecentQueryItem.displayName = "RecentQueryItem";
