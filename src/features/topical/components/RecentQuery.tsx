import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ValidCurriculum } from "@/constants/types";
import { useAuth } from "@/context/AuthContext";
import { MAX_NUMBER_OF_RECENT_QUERIES } from "@/features/topical/constants/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useIsMutating } from "@tanstack/react-query";
import { History, Loader2, ScanText, Wrench } from "lucide-react";
import { forwardRef, memo, useCallback, useImperativeHandle, useState } from "react";
import { toast } from "sonner";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { useRecentQueries } from "../hooks";
import {
  updateSearchParams,
  validateCurriculum,
  validateFilterData,
  validateSubject,
} from "../lib/utils";
import { RecentQueryProps } from "../types/components";
import { FilterData } from "../types/models";
import Sort from "./Sort";

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

      const [accordionValue, setAccordionValue] = useState<string>("skibidi toilet");
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
              !validateSubject(parsedQuery.curriculumId, parsedQuery.subjectId) ||
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
            <Button className="w-full cursor-pointer rounded-sm" variant="outline">
              <History /> Recently searched
            </Button>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="dark:bg-accent z-100008 h-[95dvh]"
            overlayClassName="z-[100007]"
          >
            <DialogHeader className="flex flex-row justify-between gap-2 text-left">
              <div>
                <DialogTitle>Recently searched</DialogTitle>
                <DialogDescription className="w-[85%]">
                  Your last {MAX_NUMBER_OF_RECENT_QUERIES} searches will show here. Synced accross
                  devices.
                </DialogDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-max">
                    Settings <Wrench />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="dark:bg-accent z-100009 flex w-max! flex-col items-center justify-center">
                  <p className="mb-1 text-sm">Sort by date</p>
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
                      setUiPreference("recentlySearchSortedBy", newValue.sortBy);
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
                  <div className="flex h-full items-center justify-center gap-2">
                    Fetching <Loader2 className="animate-spin" />
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-red-500">
                      Please sign in to view recently searched queries.
                    </p>
                  </div>
                )}
                {isRecentQueryError && (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-red-500">
                      An error occurred while fetching recent queries! Please refresh the page.
                    </p>
                  </div>
                )}
                {isAddRecentQueryPending && !isSessionPending && isAuthenticated && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    Updating <Loader2 className="animate-spin" size={13} />
                  </div>
                )}
                {recentQuery && recentQuery.length == 0 && (
                  <div className="flex h-full w-full items-center justify-center">
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
        className={cn(isThisItemDeleting && "pointer-events-none opacity-50")}
      >
        <AccordionTrigger>
          <div className="flex w-full flex-row items-center justify-start gap-4">
            {index + 1}.
            <div
              className={cn(
                "flex flex-col items-start justify-center",
                accordionValue === index.toString() && "text-logo-main",
                isThisItemDeleting && "text-red-500!",
              )}
            >
              <p>
                {parsedQuery.curriculumId} - {parsedQuery.subjectId} - {parsedQuery.topic.length}{" "}
                topic
                {parsedQuery.topic.length > 1 && "s"} - {parsedQuery.year.length} year
                {parsedQuery.year.length > 1 && "s"}
              </p>
              <p
                className={cn(
                  "text-muted-foreground",
                  accordionValue === index.toString() && "text-black dark:text-white",
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
        <AccordionContent className="border-logo-main mb-2 flex flex-col gap-2 rounded-sm border p-3">
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
              "bg-logo-main hover:bg-logo-main mt-2 w-full cursor-pointer text-white!",
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
