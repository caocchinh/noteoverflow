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
import {
  ArrowDownWideNarrow,
  GripVertical,
  Sparkles,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Weight,
  Info,
  ChevronsDown,
  ChevronDown,
  ChevronUp,
  ChevronsUp,
  Minus,
  Plus,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reorder, AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  memo,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
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
import { Badge } from "@/components/ui/badge";
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
    setSortParameters: Dispatch<SetStateAction<SortParameters | null>>;
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
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              tabIndex={-1}
            >
              <Button
                variant="outline"
                className={cn(
                  "cursor-pointer rounded-sm group transition-all duration-200",
                  "hover:bg-gradient-to-r hover:from-logo-main/10 hover:to-purple-500/10",
                  "hover:border-logo-main/50 hover:shadow-md",
                  !isDisabled && "hover:shadow-logo-main/20"
                )}
                title="Sort questions"
                disabled={isDisabled}
                onClick={() => {
                  setIsOpen(true);
                  resetFilters();
                }}
              >
                Sort
                <ArrowDownWideNarrow className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className={cn(!isDisabled && "hidden")}>
            <div className="flex items-center gap-2 justify-center">
              <Info className="w-4 h-4" />
              To sort questions, run a search first.
            </div>
          </TooltipContent>
        </Tooltip>

        <DialogContent
          showCloseButton={false}
          className="w-[1300px] !max-w-[95vw] dark:bg-gradient-to-br dark:from-background dark:to-accent/30 bg-gradient-to-br from-white to-gray-50/50 z-[1000011] gap-0 max-h-[96dvh] border-2 border-logo-main/20 shadow-2xl !py-3"
          overlayClassName="z-[1000010] backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs defaultValue="sort">
              <DialogHeader className="flex flex-row flex-wrap items-center justify-between pb-2 border-b border-border/50">
                <motion.div
                  className="text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-logo-main to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    Weighted Sort
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1">
                    Customize question priority and order
                  </DialogDescription>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TabsList className="dark:bg-input/30 bg-white/80 backdrop-blur-sm border border-border/50 shadow-lg">
                    <TabsTrigger
                      value="sort"
                      className="cursor-pointer data-[state=active]:bg-logo-main data-[state=active]:text-white transition-all duration-200"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Sort
                    </TabsTrigger>
                    <TabsTrigger
                      value="how"
                      className="cursor-pointer data-[state=active]:bg-logo-main data-[state=active]:text-white transition-all duration-200"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Guide
                    </TabsTrigger>
                  </TabsList>
                </motion.div>
              </DialogHeader>

              <TabsContent value="sort" className="mt-0">
                <ScrollArea
                  className="h-[55dvh] sm:h-[70dvh] [&_.bg-border]:bg-logo-main/40 px-6 py-2"
                  type="always"
                >
                  <motion.div
                    className="flex flex-row flex-wrap items-center justify-center gap-6 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {filters && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex-1"
                        >
                          <ReorderList
                            items={filters.year.data}
                            weight={filters.year.weight}
                            setItems={(items, weight) =>
                              updateFilter("year", items, weight)
                            }
                            label="Year"
                            icon="📅"
                            defaultWeight={YEAR_SORT_DEFAULT_WEIGHT}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex-1"
                        >
                          <ReorderList
                            items={filters.paperType.data}
                            weight={filters.paperType.weight}
                            setItems={(items, weight) =>
                              updateFilter("paperType", items, weight)
                            }
                            label="Paper Type"
                            icon="📄"
                            defaultWeight={PAPER_TYPE_SORT_DEFAULT_WEIGHT}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex-1"
                        >
                          <ReorderList
                            items={filters.season.data}
                            weight={filters.season.weight}
                            setItems={(items, weight) =>
                              updateFilter("season", items, weight)
                            }
                            label="Season"
                            icon="🗓️"
                            defaultWeight={SEASON_SORT_DEFAULT_WEIGHT}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="flex-1"
                        >
                          <ReorderList
                            items={filters.topic.data}
                            weight={filters.topic.weight}
                            setItems={(items, weight) =>
                              updateFilter("topic", items, weight)
                            }
                            label="Topic"
                            icon="📚"
                            defaultWeight={TOPIC_SORT_DEFAULT_WEIGHT}
                          />
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="how" className="mt-0">
                <ScrollArea className="h-[55dvh] sm:h-[70dvh] [&_.bg-border]:bg-logo-main/40 px-6 py-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue="how-does-this-work"
                      className="space-y-4"
                    >
                      <AccordionItem
                        value="how-does-this-work"
                        className="border border-border/50 rounded-lg px-4 bg-gradient-to-r from-logo-main/5 to-purple-500/5"
                      >
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-logo-main" />
                            How does this work?
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="w-full text-muted-foreground leading-relaxed">
                          <div className="space-y-3">
                            <p>Questions are sorted using this formula:</p>
                            <div className="bg-muted p-4 rounded-lg border-l-4 border-logo-main">
                              <code className="text-lg font-mono">
                                Position × Weight = Priority Score
                              </code>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">
                                  Drag to reorder:
                                </h4>
                                <p className="text-sm">
                                  Higher position = more important
                                </p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">
                                  Adjust weights:
                                </h4>
                                <p className="text-sm">
                                  Higher weight = greater influence
                                </p>
                              </div>
                            </div>
                            <div className="bg-logo-main/10 p-4 rounded-lg mt-4">
                              <Badge variant="secondary" className="mb-2">
                                Default Settings
                              </Badge>
                              <p className="text-sm">
                                Years (1× weight) descending order, all others
                                (0× weight)
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="unexpected-result"
                        className="border border-border/50 rounded-lg px-4 bg-gradient-to-r from-orange-500/5 to-red-500/5"
                      >
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-orange-500" />
                            Unexpected results?
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="w-full text-muted-foreground leading-relaxed">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Try adjusting weights:
                                </h4>
                                <p className="text-sm">
                                  Set important fields to higher values
                                </p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                  <TrendingDown className="w-4 h-4" />
                                  Simplify filters:
                                </h4>
                                <p className="text-sm">
                                  Reduce selected topics/criteria
                                </p>
                              </div>
                            </div>
                            <div className="bg-orange-500/10 p-4 rounded-lg mt-4">
                              <p className="text-sm font-medium">
                                💡 Pro tip: Start with one field at a time to
                                understand the impact
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </motion.div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t border-border/50 gap-3">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="cursor-pointer hover:bg-muted transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className={cn(
                      "cursor-pointer transition-all duration-200 shadow-lg w-full sm:w-max text-white hover:shadow-xl relative",
                      "bg-gradient-to-r from-logo-main to-purple-600 hover:from-logo-main/90 hover:to-purple-600/90"
                    )}
                    onClick={handleApplySorting}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Apply Sort
                  </Button>
                </motion.div>
              </DialogClose>
            </DialogFooter>
          </motion.div>
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
    icon,
    defaultWeight,
  }: {
    items: string[];
    setItems: (items: string[], weight: number) => void;
    label: string;
    weight: number;
    icon: string;
    defaultWeight: number;
  }) => {
    const [weight, setWeight] = useState(weightProp);
    const [isDragging, setIsDragging] = useState(false);

    // Sync weight state when prop changes
    useEffect(() => {
      setWeight(weightProp);
    }, [weightProp]);

    const handleWeightChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWeight = parseInt(e.target.value) || 0;
        setWeight(newWeight);
        setItems(items, newWeight);
      },
      [items, setItems]
    );

    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const isDefault = weight === defaultWeight;
    const isEmpty = items.length === 0;

    const handleResetWeight = useCallback(() => {
      setWeight(defaultWeight);
      setItems(items, defaultWeight);
    }, [items, setItems, defaultWeight]);

    return (
      <motion.div
        className={cn(
          "flex flex-col gap-4 items-center justify-center min-w-[300px] sm:min-w-[400px] flex-1",
          "bg-gradient-to-br from-white/80 to-gray-50/50 dark:from-muted/50 dark:to-muted/20",
          "p-5 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm",
          "hover:shadow-lg hover:border-logo-main/30",
          isEmpty ? "border-muted/50" : "border-border/50",
          isDragging && "ring-2 ring-logo-main/50 border-logo-main/50 shadow-lg"
        )}
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 w-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-2xl">{icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{label}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={isEmpty ? "secondary" : "default"}
                className={cn(
                  "text-xs",
                  !isEmpty &&
                    "bg-logo-main/10 text-logo-main border-logo-main/20"
                )}
              >
                {isEmpty ? "No items" : `${items.length} items`}
              </Badge>
              {weight > 0 && (
                <Badge variant="outline" className="text-xs">
                  Weight: {weight}×
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-row w-full items-stretch justify-center gap-3">
          <div className="flex flex-col items-center justify-between h-[240px] gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-full w-8 h-8 cursor-pointer bg-logo-main/10 hover:bg-logo-main/20 border-logo-main/30"
                  variant="outline"
                  onClick={() => {
                    scrollAreaRef.current?.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  disabled={isEmpty}
                >
                  <ChevronsUp className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="z-[9999999]">
                Scroll to top
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-full w-8 h-8 cursor-pointer bg-logo-main/10 hover:bg-logo-main/20 border-logo-main/30"
                  variant="outline"
                  onClick={() => {
                    scrollAreaRef.current?.scrollBy({
                      top: -120,
                      behavior: "smooth",
                    });
                  }}
                  disabled={isEmpty}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="z-[9999999]">
                Scroll up
              </TooltipContent>
            </Tooltip>

            <div className="flex-1 w-0.5 bg-gradient-to-b from-logo-main/30 via-logo-main/10 to-logo-main/30 rounded-full" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-full w-8 h-8 cursor-pointer bg-logo-main/10 hover:bg-logo-main/20 border-logo-main/30"
                  variant="outline"
                  onClick={() => {
                    scrollAreaRef.current?.scrollBy({
                      top: 120,
                      behavior: "smooth",
                    });
                  }}
                  disabled={isEmpty}
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="z-[9999999]">
                Scroll down
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-full w-8 h-8 cursor-pointer bg-logo-main/10 hover:bg-logo-main/20 border-logo-main/30"
                  variant="outline"
                  onClick={() => {
                    scrollAreaRef.current?.scrollTo({
                      top: scrollAreaRef.current?.scrollHeight,
                      behavior: "smooth",
                    });
                  }}
                  disabled={isEmpty}
                >
                  <ChevronsDown className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="z-[9999999]">
                Scroll to bottom
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Drag & Drop Area */}
          <div className="flex-1">
            <ScrollArea
              className="h-[240px] w-full [&_.bg-border]:!bg-logo-main/20 pr-3"
              type="always"
              viewportRef={scrollAreaRef}
            >
              {isEmpty ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm">No items to sort</p>
                  </div>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  layoutScroll
                  values={items}
                  onReorder={(newOrder) => {
                    setItems(newOrder, weight);
                  }}
                  className="space-y-2 "
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                >
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <Reorder.Item
                        key={item}
                        value={item}
                        className="group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileDrag={{
                          zIndex: 100,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      >
                        <motion.div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                            "bg-gradient-to-r from-white to-gray-50/50 dark:from-muted/80 dark:to-muted/40",
                            "border border-border/50 cursor-grab active:cursor-grabbing",
                            "hover:border-logo-main/40 hover:shadow-md group-hover:bg-logo-main/5",
                            "shadow-sm"
                          )}
                          whileHover={{ y: -1 }}
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-sm font-mono w-6 text-center">
                              {index + 1}
                            </span>
                            <GripVertical className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex-1 text-sm font-medium text-foreground whitespace-pre-wrap">
                            {item}
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isEmpty}
                className={cn(
                  "cursor-pointer w-1/2 transition-all duration-200",
                  areArraysIdentical(
                    items.toSorted((a, b) => a.localeCompare(b)),
                    items
                  ) &&
                    "!bg-logo-main !text-white border-logo-main hover:bg-logo-main/90"
                )}
                onClick={() =>
                  setItems(
                    items.toSorted((a, b) => a.localeCompare(b)),
                    weight
                  )
                }
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Ascending
              </Button>
            </TooltipTrigger>
            <TooltipContent className="z-[9999999]">
              Sort in ascending order
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isEmpty}
                className={cn(
                  "cursor-pointer w-1/2 transition-all duration-200",
                  areArraysIdentical(
                    items.toSorted((a, b) => b.localeCompare(a)),
                    items
                  ) &&
                    "!bg-logo-main !text-white border-logo-main hover:bg-logo-main/90"
                )}
                onClick={() =>
                  setItems(
                    items.toSorted((a, b) => b.localeCompare(a)),
                    weight
                  )
                }
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                Descending
              </Button>
            </TooltipTrigger>
            <TooltipContent className="z-[9999999]">
              Sort in descending order
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Weight Control */}
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Weight
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetWeight}
                  className={cn(
                    "h-6 px-2 text-xs hover:bg-logo-main/10 hover:text-logo-main ",
                    isDefault && "opacity-0"
                  )}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[9999999]">
                Reset to default weight ({defaultWeight})
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="relative flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWeight(weight - 1);
                setItems(items, weight - 1);
              }}
              className="h-10 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              value={weight || ""}
              onChange={handleWeightChange}
              type="number"
              className={cn(
                "text-center font-mono transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                weight === 0 &&
                  "border-orange-300 bg-orange-50/50 dark:bg-orange-950/20",
                weight > 0 &&
                  weight <= defaultWeight &&
                  "border-green-300 bg-green-50/50 dark:bg-green-950/20",
                weight > defaultWeight &&
                  "border-blue-300 bg-blue-50/50 dark:bg-blue-950/20"
              )}
              placeholder="0"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWeight(weight + 1);
                setItems(items, weight + 1);
              }}
              className="h-10 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
);

ReorderList.displayName = "ReorderList";
