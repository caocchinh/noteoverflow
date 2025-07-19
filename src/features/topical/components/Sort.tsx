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

const Sort = ({
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
    [setFilters]
  );

  const handleApplySorting = useCallback(() => {
    if (!filters) return;
    setSortParameters({
      paperType: {
        data: computeWeightedScoreByArrayIndex({
          data: filters.paperType.data,
          weightMultiplier: filters.paperType.weight,
        }),
        weight: filters.paperType.weight,
      },
      topic: {
        data: computeWeightedScoreByArrayIndex({
          data: filters.topic.data,
          weightMultiplier: filters.topic.weight,
        }),
        weight: filters.topic.weight,
      },
      year: {
        data: computeWeightedScoreByArrayIndex({
          data: filters.year.data,
          weightMultiplier: filters.topic.weight,
        }),
        weight: filters.year.weight,
      },
      season: {
        data: computeWeightedScoreByArrayIndex({
          data: filters.season.data,
          weightMultiplier: filters.season.weight,
        }),
        weight: filters.season.weight,
      },
    });
  }, [filters, setSortParameters]);

  // Reset to initial filters if dialog closes/opens
  const resetFilters = useCallback(() => {
    setFilters({
      year: {
        data: Object.keys(sortParameters?.year.data || {}).toSorted((a, b) => {
          return (
            (sortParameters?.year.data?.[b] ?? 0) -
            (sortParameters?.year.data?.[a] ?? 0)
          );
        }),
        weight: 1,
      },
      paperType: {
        data: Object.keys(sortParameters?.paperType.data || {}).toSorted(
          (a, b) => {
            return (
              (sortParameters?.paperType.data?.[b] ?? 0) -
              (sortParameters?.paperType.data?.[a] ?? 0)
            );
          }
        ),
        weight: 1,
      },
      season: {
        data: Object.keys(sortParameters?.season.data || {}).toSorted(
          (a, b) => {
            return (
              (sortParameters?.season.data?.[b] ?? 0) -
              (sortParameters?.season.data?.[a] ?? 0)
            );
          }
        ),
        weight: 1,
      },
      topic: {
        data: Object.keys(sortParameters?.topic.data || {}).toSorted((a, b) => {
          return (
            (sortParameters?.topic.data?.[b] ?? 0) -
            (sortParameters?.topic.data?.[a] ?? 0)
          );
        }),
        weight: 1,
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
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Sort questions</DialogTitle>
          <DialogDescription>
            Determine which questions show ups first
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 items-start justify-center">
          {filters && (
            <>
              <ReorderList
                items={filters.year.data}
                setItems={(items, weight) =>
                  updateFilter("year", items, weight)
                }
                label="Year"
              />
              <ReorderList
                items={filters.paperType.data}
                setItems={(items, weight) =>
                  updateFilter("paperType", items, weight)
                }
                label="Paper Type"
              />
              <ReorderList
                items={filters.season.data}
                setItems={(items, weight) =>
                  updateFilter("season", items, weight)
                }
                label="Season"
              />
              <ReorderList
                items={filters.topic.data}
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
            <AccordionContent>
              Questions are sorted by: Position × Weight = Priority Score. Drag
              items to change position (higher = more important). Adjust weights
              for greater influence. Default: Years (5×) newest-first, all
              others (1×). Your settings determine the final question order.
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
};

export default Sort;

const ReorderList = memo(
  ({
    items,
    setItems,
    label,
  }: {
    items: string[];
    setItems: (items: string[], weight: number) => void;
    label: string;
  }) => {
    const [weight, setWeight] = useState(1);
    return (
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-medium mb-2">{label}</h3>
        <Reorder.Group
          axis="y"
          layoutScroll
          values={items}
          onReorder={(newOrder) => {
            setItems(newOrder, weight);
          }}
          className="min-w-[80px] overflow-y-auto h-[200px]"
        >
          {items.map((item) => (
            <Reorder.Item
              key={item}
              value={item}
              className="bg-card px-3 py-2 my-1 rounded cursor-grab active:cursor-grabbing border border-border"
            >
              {item}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    );
  }
);

// Add display name to the memo component
ReorderList.displayName = "ReorderList";
