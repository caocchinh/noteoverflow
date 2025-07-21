import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowDownWideNarrow, ArrowUp, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reorder } from "motion/react";
import { useCallback, memo, useState, useRef } from "react";
import {
  areArraysIdentical,
  computeWeightedScoreByArrayIndex,
} from "../lib/utils";
import { SortParameters } from "../constants/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  PAPER_TYPE_SORT_DEFAULT_WEIGHT,
  SEASON_SORT_DEFAULT_WEIGHT,
  TOPIC_SORT_DEFAULT_WEIGHT,
  YEAR_SORT_DEFAULT_WEIGHT,
} from "../constants/constants";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { updateSortParams } from "../server/actions";

interface Filters {
  topic: {
    data: string[];
    weight: number;
  };
  year: {
    data: string[];
    weight: number;
  };
  season: {
    data: string[];
    weight: number;
  };
  paperType: {
    data: string[];
    weight: number;
  };
}

const sortByScore = (data: Record<string, number> = {}) => {
  return Object.keys(data).toSorted((a, b) => (data[b] || 0) - (data[a] || 0));
};

const Sort = memo(
  ({
    sortParameters,
    setSortParameters,
    onSortCallBack,
    isDisabled,
    onBeforeSort,
  }: // currentQuery,
  {
    sortParameters: SortParameters | null;
    setSortParameters: (value: SortParameters | null) => void;
    onSortCallBack?: () => void;
    isDisabled: boolean;
    onBeforeSort?: () => void;
    // currentQuery: {
    //   curriculumId: string;
    //   subjectId: string;
    // } & FilterData;
  }) => {
    const [filters, setFilters] = useState<Filters | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const updateFilter = useCallback(
      (key: keyof Filters, items: string[], weight: number) => {
        setFilters((prev) => {
          if (!prev) return null;
          return { ...prev, [key]: { ...prev[key], data: items, weight } };
        });
      },
      []
    );

    const handleApplySorting = useCallback(() => {
      if (!filters) return;
      onBeforeSort?.();
      const result: SortParameters = {} as SortParameters;

      // Process all filter types in one loop
      (Object.keys(filters) as Array<keyof Filters>).forEach((key) => {
        const filterData = filters[key];
        result[key] = {
          data: computeWeightedScoreByArrayIndex({
            data: filterData.data,
          }),
          weight: isNaN(filterData.weight) ? 0 : filterData.weight,
        };
      });
      // updateSortParams({
      //   queryKey: JSON.stringify(currentQuery),
      //   sortParams: JSON.stringify(result),
      // });
      setSortParameters(result);
      onSortCallBack?.();
    }, [filters, onBeforeSort, setSortParameters, onSortCallBack]);

    // Reset to initial filters if dialog closes/opens
    const resetFilters = useCallback(() => {
      if (!sortParameters) {
        // Set default values if sortParameters is null
        setFilters({
          year: {
            data: [],
            weight: YEAR_SORT_DEFAULT_WEIGHT,
          },
          paperType: {
            data: [],
            weight: PAPER_TYPE_SORT_DEFAULT_WEIGHT,
          },
          season: {
            data: [],
            weight: SEASON_SORT_DEFAULT_WEIGHT,
          },
          topic: {
            data: [],
            weight: TOPIC_SORT_DEFAULT_WEIGHT,
          },
        });
        return;
      }

      // Create filters with sorted data
      setFilters({
        year: {
          data: sortByScore(sortParameters.year.data),
          weight: sortParameters.year.weight ?? YEAR_SORT_DEFAULT_WEIGHT,
        },
        paperType: {
          data: sortByScore(sortParameters.paperType.data),
          weight:
            sortParameters.paperType.weight ?? PAPER_TYPE_SORT_DEFAULT_WEIGHT,
        },
        season: {
          data: sortByScore(sortParameters.season.data),
          weight: sortParameters.season.weight ?? SEASON_SORT_DEFAULT_WEIGHT,
        },
        topic: {
          data: sortByScore(sortParameters.topic.data),
          weight: sortParameters.topic.weight ?? TOPIC_SORT_DEFAULT_WEIGHT,
        },
      });
    }, [sortParameters]);

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="outline"
                className="cursor-pointer rounded-[2px]"
                title="Sort questions"
                disabled={isDisabled}
                onClick={() => {
                  setIsOpen(true);
                  resetFilters();
                }}
              >
                Sort
                <ArrowDownWideNarrow />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className={cn(!isDisabled && "hidden")}>
            To sort questions, run a search first.
          </TooltipContent>
        </Tooltip>
        <DialogContent
          showCloseButton={false}
          className="w-[1300px] !max-w-[90vw] dark:bg-accent z-[1000011] gap-0 max-h-[96dvh]"
          overlayClassName="z-[1000010]"
        >
          <Tabs defaultValue="sort">
            <DialogHeader className="flex flex-row itemscenter justify-between mb-2">
              <div className="text-left">
                <DialogTitle>Weighted sort</DialogTitle>
                <DialogDescription>
                  Determine which questions show ups first
                </DialogDescription>
              </div>
              <TabsList className="dark:bg-input/30">
                <TabsTrigger value="sort" className="cursor-pointer">
                  Sort
                </TabsTrigger>
                <TabsTrigger value="how" className="cursor-pointer">
                  What is this?
                </TabsTrigger>
              </TabsList>
            </DialogHeader>

            <TabsContent value="sort">
              <ScrollArea
                className="h-[55dvh] sm:h-[70dvh] [&_.bg-border]:bg-logo-main/40 px-5"
                type="always"
              >
                <div className="flex gap-6 items-start justify-center w-full flex-wrap">
                  {filters && (
                    <>
                      <ReorderList
                        items={filters.year.data}
                        weight={filters.year.weight}
                        setItems={(items, weight) =>
                          updateFilter("year", items, weight)
                        }
                        label="Year"
                      />
                      <ReorderList
                        items={filters.paperType.data}
                        weight={filters.paperType.weight}
                        setItems={(items, weight) =>
                          updateFilter("paperType", items, weight)
                        }
                        label="Paper Type"
                      />
                      <ReorderList
                        items={filters.season.data}
                        weight={filters.season.weight}
                        setItems={(items, weight) =>
                          updateFilter("season", items, weight)
                        }
                        label="Season"
                      />
                      <ReorderList
                        items={filters.topic.data}
                        weight={filters.topic.weight}
                        setItems={(items, weight) =>
                          updateFilter("topic", items, weight)
                        }
                        label="Topic"
                      />
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="how">
              <Accordion
                type="single"
                collapsible
                defaultValue="how-does-this-work"
              >
                <AccordionItem value="how-does-this-work">
                  <AccordionTrigger>How does this work?</AccordionTrigger>
                  <AccordionContent className="w-full">
                    Questions are sorted by: Position × Weight = Priority Score.
                    Drag items to change position (higher up the list = more
                    important). Adjust weights for greater influence (A weight
                    of zero means that field has no effect on the outcome of the
                    sorted questions).{" "}
                    <span className="text-logo-main">
                      Default: Years (1×) descending order, all others (0×)
                    </span>
                    . Your settings determine the final question order.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="unexpected-result">
                  <AccordionTrigger>
                    The results does not make sense
                  </AccordionTrigger>
                  <AccordionContent className="w-full">
                    Try to add or reduce weight on each field. If a field is
                    very important, set the weight of it to a very high value,
                    keep trial and error until you get the desired outcome. If
                    it still does not work, please try to reduce the amount of
                    items in your filter when searching for question (e.g.
                    reduce the amount of topics selected).
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button className="cursor-pointer" onClick={handleApplySorting}>
                Apply
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

Sort.displayName = "Sort";

export default Sort;

const ReorderList = memo(
  ({
    items,
    setItems,
    label,
    weight: weightProp,
  }: {
    items: string[];
    setItems: (items: string[], weight: number) => void;
    label: string;
    weight: number;
  }) => {
    const [weight, setWeight] = useState(weightProp);

    const handleWeightChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWeight = parseInt(e.target.value);
        setWeight(newWeight);
        setItems(items, newWeight);
      },
      [items, setItems]
    );
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);

    return (
      <div className="flex flex-col gap-3 items-center justify-center min-w-[210px] flex-1 dark:bg-muted-foreground/7 bg-white p-2 rounded-sm border border-foreground">
        <h3 className="text-sm font-medium">{label}</h3>

        <div className="flex flex-row w-full items-stretch justify-center">
          <div className="flex flex-col items-center justify-between h-full">
            <Button
              className="rounded-full w-7 h-7 cursor-pointer"
              variant="outline"
              onClick={() => {
                scrollAreaRef.current?.scrollBy({
                  top: -145,
                  behavior: "smooth",
                });
              }}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              className="rounded-full w-7 h-7 cursor-pointer"
              variant="outline"
              onClick={() => {
                scrollAreaRef.current?.scrollBy({
                  top: 145,
                  behavior: "smooth",
                });
              }}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea
            className="h-[225px] w-full [&_.bg-border]:!bg-muted-foreground/55 pr-4 sm:pr-7"
            type="always"
            viewportRef={scrollAreaRef}
          >
            <Reorder.Group
              axis="y"
              layoutScroll
              values={items}
              onReorder={(newOrder) => {
                setItems(newOrder, weight);
              }}
              className="min-w-[80px] w-full"
            >
              {items.map((item, index) => (
                <Reorder.Item
                  key={item}
                  value={item}
                  className="flex flex-row items-center justify-center gap-2"
                >
                  <p className="text-sm text-white">{index + 1}.</p>
                  <div className=" dark:bg-input/30 px-3 py-2 my-2 w-full rounded cursor-grab active:cursor-grabbing border border-border">
                    {item}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </ScrollArea>
        </div>
        <div className="flex flex-col gap-2 items-center justify-center w-full">
          <Button
            variant="outline"
            className={cn(
              "cursor-pointer w-full",
              areArraysIdentical(
                items.toSorted((a, b) => a.localeCompare(b)),
                items
              ) && "!bg-logo-main !text-white"
            )}
            onClick={() =>
              setItems(
                items.toSorted((a, b) => a.localeCompare(b)),
                weight
              )
            }
          >
            Ascending
          </Button>
          <Button
            variant="outline"
            className={cn(
              "cursor-pointer w-full",
              areArraysIdentical(
                items.toSorted((a, b) => b.localeCompare(a)),
                items
              ) && "!bg-logo-main !text-white"
            )}
            onClick={() =>
              setItems(
                items.toSorted((a, b) => b.localeCompare(a)),
                weight
              )
            }
          >
            Descending
          </Button>
        </div>
        <div className="flex flex-col gap-1 items-center justify-center">
          <p className="text-sm  text-muted-foreground">Weight</p>
          <Input value={weight} onChange={handleWeightChange} type="number" />
        </div>
      </div>
    );
  }
);

ReorderList.displayName = "ReorderList";
