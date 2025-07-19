import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrow, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reorder } from "motion/react";
import { useCallback, memo, useState } from "react";
import { computeWeightedScoreByArrayIndex } from "../lib/utils";
import { SortParameters } from "../constants/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  PAPER_TYPE_SORT_DEFAULT_WEIGHT,
  SEASON_SORT_DEFAULT_WEIGHT,
  TOPIC_SORT_DEFAULT_WEIGHT,
  YEAR_SORT_DEFAULT_WEIGHT,
} from "../constants/constants";

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
  }: {
    sortParameters: SortParameters | null;
    setSortParameters: (value: SortParameters | null) => void;
  }) => {
    const [filters, setFilters] = useState<Filters | null>(null);

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

      setSortParameters(result);
    }, [filters, setSortParameters]);

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
      <Dialog
        onOpenChange={(open) => {
          if (open) {
            resetFilters();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="cursor-pointer rounded-[2px]"
            title="Sort questions"
          >
            Sort
            <ArrowDownWideNarrow />
          </Button>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="w-[700px] !max-w-[90vw]"
        >
          <DialogHeader>
            <DialogTitle>Weighted sort</DialogTitle>
            <DialogDescription>
              Determine which questions show ups first
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-5 items-start justify-center w-full">
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
          <Accordion type="single" collapsible>
            <AccordionItem value="how-does-this-work">
              <AccordionTrigger>How does this work?</AccordionTrigger>
              <AccordionContent className="w-full">
                Questions are sorted by: Position × Weight = Priority Score.
                Drag items to change position (higher = more important). Adjust
                weights for greater influence. Default: Years (5×) newest-first,
                all others (1×). Your settings determine the final question
                order.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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

    return (
      <div className="flex flex-col gap-3 items-center justify-center w-full">
        <h3 className="text-sm font-medium -mb-4">{label}</h3>
        <ScrollArea className="h-[250px] w-full" type="always">
          <Reorder.Group
            axis="y"
            layoutScroll
            values={items}
            onReorder={(newOrder) => {
              setItems(newOrder, weight);
            }}
            className="min-w-[80px] w-full pr-3"
          >
            {items.map((item) => (
              <Reorder.Item
                key={item}
                value={item}
                className="bg-card px-3 py-2 my-2 w-full rounded cursor-grab active:cursor-grabbing border border-border"
              >
                {item}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </ScrollArea>
        <div className="flex flex-col gap-1 items-center justify-center">
          <p className="text-sm  text-muted-foreground">Weight</p>
          <Input value={weight} onChange={handleWeightChange} type="number" />
        </div>
      </div>
    );
  }
);

ReorderList.displayName = "ReorderList";
