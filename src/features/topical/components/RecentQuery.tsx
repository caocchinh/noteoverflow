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
  DEFAULT_SORT_BY,
  DEFAULT_CACHE,
} from "@/features/topical/constants/constants";
import { Button } from "@/components/ui/button";
import { History, Loader2, ScanText, Wrench } from "lucide-react";
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CurrentQuery,
  FilterData,
  FiltersCache,
  SortParameters,
} from "../constants/types";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
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
  computeDefaultSortParams,
} from "../lib/utils";
import { toast } from "sonner";
import { deleteRecentQuery } from "../server/actions";
import { SortBy } from "./SortBy";

export const RecentQuery = ({
  isUserSessionPending,
  isValidSession,
  currentQuery,
  setIsSearchEnabled,
  setCurrentQuery,
  isAddRecentQueryPending,
  setSortParameters,
  isOverwriting,
  setSelectedCurriculum,
  setSelectedSubject,
  setSelectedTopic,
  setSelectedYear,
  setSelectedPaperType,
  setSelectedSeason,
  setIsSidebarOpen,
}: {
  isUserSessionPending: boolean;
  isValidSession: boolean;
  setIsSearchEnabled: Dispatch<SetStateAction<boolean>>;
  currentQuery: CurrentQuery;
  setCurrentQuery: Dispatch<SetStateAction<CurrentQuery>>;
  isAddRecentQueryPending: boolean;
  setSelectedCurriculum: Dispatch<SetStateAction<"" | ValidCurriculum>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setSelectedTopic: Dispatch<SetStateAction<string[]>>;
  setSortParameters: Dispatch<SetStateAction<SortParameters | null>>;
  setSelectedYear: Dispatch<SetStateAction<string[]>>;
  setSelectedPaperType: Dispatch<SetStateAction<string[]>>;
  setSelectedSeason: Dispatch<SetStateAction<string[]>>;
  isOverwriting: RefObject<boolean>;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}) => {
  const {
    data: recentQuery,
    isError: isRecentQueryError,
    isFetching: isRecentQueryFetching,
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
    enabled: !isUserSessionPending && isValidSession,
  });

  const [accordionValue, setAccordionValue] =
    useState<string>("skibidi toilet");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"ascending" | "descending">(
    DEFAULT_SORT_BY
  );
  const isMounted = useRef(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
      if (savedState) {
        const parsedState: FiltersCache = JSON.parse(savedState);
        setSortBy(parsedState.recentlySearchSortedBy ?? DEFAULT_SORT_BY);
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
          : { ...DEFAULT_CACHE };
      } catch {
        // If reading fails, start with empty state
        stateToSave = { ...DEFAULT_CACHE };
      }
      stateToSave = {
        ...stateToSave,
        recentlySearchSortedBy: sortBy,
      };

      localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [sortBy]);
  const queryClient = useQueryClient();
  const [queryThatIsDeleting, setQueryThatIsDeleting] = useState<string | null>(
    null
  );

  const key = ["delete_recent_query", queryThatIsDeleting];

  const { mutate: deleteRecentQueryMutation } = useMutation({
    mutationKey: key,
    mutationFn: async (queryKey: string) => {
      const result = await deleteRecentQuery({ queryKey: queryKey });
      if (result.error) {
        throw new Error(result.error);
      }
      return queryKey;
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
        return oldData.filter((item) => item.queryKey !== data);
      });
    },
    onError: (error) => {
      toast.error(
        "Failed to delete outdated data: " +
          error.message +
          ". Please refresh the page."
      );
    },
  });

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
        <DialogHeader className="flex justify-between flex-row text-left gap-2">
          <div>
            <DialogTitle>Recently searched</DialogTitle>
            <DialogDescription className="w-[85%]">
              Your last {MAX_NUMBER_OF_RECENT_QUERIES} searches will show here.
              Synced accross devices.
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
              <SortBy sortBy={sortBy} setSortBy={setSortBy} />
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
              <div className="flex justify-center items-center h-full">
                Fetching <Loader2 className="animate-spin" />
              </div>
            )}
            {!isValidSession && (
              <div className="flex justify-center items-center h-full">
                <p className="text-red-500">
                  Please sign in to view recently searched queries.
                </p>
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
            {isAddRecentQueryPending &&
              !isUserSessionPending &&
              isValidSession && (
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

                if (sortBy === "descending") {
                  return dateB - dateA; // Newest first
                }
                return dateA - dateB; // Oldest first
              })
              .map((item, index) => {
                return (
                  <RecentQueryItem
                    key={item.queryKey + index}
                    setCurrentQuery={setCurrentQuery}
                    setSelectedCurriculum={setSelectedCurriculum}
                    setSelectedSubject={setSelectedSubject}
                    setSelectedTopic={setSelectedTopic}
                    setSelectedYear={setSelectedYear}
                    setSelectedPaperType={setSelectedPaperType}
                    setAccordionValue={setAccordionValue}
                    isUserSessionPending={isUserSessionPending}
                    isValidSession={isValidSession}
                    setSelectedSeason={setSelectedSeason}
                    isOverwriting={isOverwriting}
                    setIsSidebarOpen={setIsSidebarOpen}
                    currentQuery={currentQuery}
                    setIsSearchEnabled={setIsSearchEnabled}
                    accordionValue={accordionValue}
                    index={index}
                    item={item}
                    setQueryThatIsDeleting={setQueryThatIsDeleting}
                    deleteRecentQueryMutation={deleteRecentQueryMutation}
                    setIsDialogOpen={setIsDialogOpen}
                    setSortParameters={setSortParameters}
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
};

const RecentQueryItem = ({
  currentQuery,
  setQueryThatIsDeleting,
  index,
  setCurrentQuery,
  isOverwriting,
  setIsSidebarOpen,
  setIsSearchEnabled,
  accordionValue,
  setSelectedCurriculum,
  setSelectedPaperType,
  setSelectedSeason,
  setSelectedSubject,
  setSelectedYear,
  setSelectedTopic,
  setIsDialogOpen,
  item,
  deleteRecentQueryMutation,
  setSortParameters,
  isUserSessionPending,
  isValidSession,
  setAccordionValue,
}: {
  item: {
    queryKey: string;
    sortParams: string | null;
    lastSearch: number;
  };
  index: number;
  setCurrentQuery: Dispatch<SetStateAction<CurrentQuery>>;
  setSelectedCurriculum: Dispatch<SetStateAction<"" | ValidCurriculum>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setSelectedTopic: Dispatch<SetStateAction<string[]>>;
  setSelectedYear: Dispatch<SetStateAction<string[]>>;
  setSelectedPaperType: Dispatch<SetStateAction<string[]>>;
  setAccordionValue: Dispatch<SetStateAction<string>>;
  setSelectedSeason: Dispatch<SetStateAction<string[]>>;
  isOverwriting: RefObject<boolean>;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  setIsSearchEnabled: Dispatch<SetStateAction<boolean>>;
  accordionValue: string;
  currentQuery: CurrentQuery;
  setQueryThatIsDeleting: Dispatch<SetStateAction<string | null>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  deleteRecentQueryMutation: (queryKey: string) => void;
  setSortParameters: Dispatch<SetStateAction<SortParameters | null>>;
  isUserSessionPending: boolean;
  isValidSession: boolean;
}) => {
  const isMobileDevice = useIsMobile();
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
        {index + 1}.
        <div
          className={cn(
            "flex flex-col items-start justify-center",
            accordionValue === index.toString() && "text-logo-main",
            isThisItemDeleting && "!text-red-500"
          )}
        >
          <p>
            {parsedQuery.curriculumId} - {parsedQuery.subjectId} -{" "}
            {parsedQuery.topic.length} topic
            {parsedQuery.topic.length > 1 && "s"} - {parsedQuery.year.length}{" "}
            year
            {parsedQuery.year.length > 1 && "s"}
          </p>
          <p
            className={cn(
              "text-muted-foreground",
              accordionValue === index.toString() &&
                "dark:text-white text-black"
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
          className={cn(
            "w-full mt-2 bg-logo-main !text-white cursor-pointer hover:bg-logo-main",
            isThisItemDeleting && "!bg-red-500"
          )}
          onClick={() => {
            if (isThisItemDeleting || isUserSessionPending || !isValidSession) {
              return;
            }
            const stringifiedNewQuery = JSON.stringify(parsedQuery);
            if (stringifiedNewQuery !== JSON.stringify(currentQuery)) {
              if (
                !validateCurriculum(parsedQuery.curriculumId) ||
                !validateSubject(
                  parsedQuery.curriculumId,
                  parsedQuery.subjectId
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
                setQueryThatIsDeleting(item.queryKey);
                setTimeout(() => {
                  deleteRecentQueryMutation(item.queryKey);
                }, 0);
                return;
              }
              setAccordionValue("dom dom yes yes");
              setCurrentQuery(parsedQuery);
              updateSearchParams({ query: JSON.stringify(parsedQuery) });
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
              setSortParameters(
                computeDefaultSortParams({
                  paperType: parsedQuery.paperType,
                  topic: parsedQuery.topic,
                  year: parsedQuery.year,
                  season: parsedQuery.season,
                })
              );

              setTimeout(() => {
                isOverwriting.current = false;
              }, 0);
            }
            if (isMobileDevice) {
              setIsSidebarOpen(false);
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
};
