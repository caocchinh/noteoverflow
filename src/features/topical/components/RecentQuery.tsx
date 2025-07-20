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
import { History } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilterData } from "../constants/types";
import { RefObject, useEffect, useState } from "react";
import { addRecentQuery } from "../server/actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ValidCurriculum } from "@/constants/types";

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

  const { mutate } = useMutation({
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

  useEffect(() => {
    if (currentQuery.curriculumId && currentQuery.subjectId) {
      mutate(JSON.stringify(currentQuery));
    }
  }, [currentQuery, mutate]);

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
        <DialogHeader>
          <DialogTitle>Recently searched</DialogTitle>
          <DialogDescription>
            Your last {MAX_NUMBER_OF_RECENT_QUERIES} searches will show here
          </DialogDescription>
        </DialogHeader>
        <Accordion
          value={accordionValue}
          onValueChange={setAccordionValue}
          type="single"
          collapsible
        >
          <ScrollArea type="always" className="h-[70vh] pr-5">
            {recentQuery?.map((item, index) => {
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
                        accordionValue === index.toString() && "text-logo-main"
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
                        setCurrentQuery(parsedQuery);
                        setIsDialogOpen(false);
                        setIsSearchEnabled(true);
                        isOverwriting.current = true;
                        setSelectedCurriculum(
                          parsedQuery.curriculumId as ValidCurriculum
                        );
                        setSelectedSubject(parsedQuery.subjectId);
                        setSelectedTopic(parsedQuery.topic);
                        setSelectedSeason(parsedQuery.season);
                        setSelectedYear(parsedQuery.year);
                        setSelectedPaperType(parsedQuery.paperType);
                        setTimeout(() => {
                          isOverwriting.current = false;
                        }, 0);
                      }}
                    >
                      Search
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </ScrollArea>
        </Accordion>
        <DialogClose asChild>
          <Button>Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
