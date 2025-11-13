import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, Trash2, X as RemoveIcon } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  MultiSelectorTriggerButtonUltilityProps,
  MultiSelectorTriggerProps,
} from "../../constants/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const MultiSelectorTrigger = memo(
  ({
    selectedValues,
    onValueChange,
    open,
    setOpen,
    allAvailableOptions,
    label,
    setInputValue,
    maxLength,
  }: MultiSelectorTriggerProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);
    const [isClickingUltility, setIsClickingUltility] =
      useState<boolean>(false);
    const [paddingRight, setPaddingRight] = useState<string>("initial");

    const mousePreventDefault = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    useEffect(() => {
      if (contentRef.current) {
        const containerHeight = contentRef.current.clientHeight;
        const height = Math.min(containerHeight || 0, 85);
        if (height >= 85) {
          setPaddingRight("10px");
        } else {
          setPaddingRight("initial");
        }
        setContentHeight(height);
      }
    }, [selectedValues]);

    const temporaryFix = useCallback(
      (item: string) => {
        if (label === "Season") {
          if (item === "Winter") {
            return "Winter - O/N";
          } else if (item === "Summer") {
            return "Summer - M/J";
          } else if (item === "Spring") {
            return "Spring - F/M";
          }
        }
      },
      [label]
    );

    return (
      <div
        className={cn(
          "relative mb-0 flex w-[300px] flex-col flex-wrap gap-1 rounded-lg bg-background p-1 py-2 ring-1 ring-muted dark:bg-secondary",
          {
            "opacity-50": !allAvailableOptions,
          },
          !allAvailableOptions && "pointer-events-none "
        )}
      >
        <div className="flex items-center justify-center gap-2 px-1">
          <MultiSelectorTriggerButtonUltility
            setIsClickingUltility={setIsClickingUltility}
            onValueChange={useCallback(
              (val: string | string[], option?: "selectAll" | "removeAll") => {
                onValueChange(val, option);
              },
              // eslint-disable-next-line react-hooks/exhaustive-deps
              [allAvailableOptions]
            )}
            allAvailableOptions={allAvailableOptions}
            maxLength={maxLength}
            mousePreventDefault={mousePreventDefault}
          />
          <Button
            className="h-6 flex-1 cursor-pointer text-xs"
            onClick={() => {
              if (!isClickingUltility) {
                setInputValue?.("");
                setOpen(!open);
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !isClickingUltility &&
                allAvailableOptions
              ) {
                setInputValue?.("");
                setOpen(!open);
              }
            }}
            onMouseDown={mousePreventDefault}
            variant="default"
          >
            {selectedValues.length === 0
              ? `Select ${label.toLowerCase()}`
              : `${selectedValues.length} ${label.toLowerCase()}${
                  selectedValues.length > 1 ? "s" : ""
                } selected`}
          </Button>
        </div>

        {selectedValues.length > 0 && (
          <ScrollArea
            className="w-full overflow-hidden"
            onClick={() => {
              if (!isClickingUltility) {
                setInputValue?.("");
                setOpen(!open);
              }
            }}
            style={{ height: `${contentHeight}px`, paddingRight }}
          >
            <div className="flex w-full flex-wrap gap-2 p-1" ref={contentRef}>
              {selectedValues.map((item) => (
                <Badge
                  className="wrap-anywhere dark:!border-white/25 flex items-center gap-1 whitespace-pre-wrap rounded-xl px-1 text-left"
                  key={item}
                  variant={"secondary"}
                >
                  <span className="text-xs">{temporaryFix(item) ?? item}</span>
                  <button
                    aria-label={`Remove ${item} option`}
                    aria-roledescription="button to remove option"
                    onClick={() => {
                      onValueChange(item);

                      if (selectedValues.length === 1) {
                        setContentHeight(0);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && allAvailableOptions) {
                        onValueChange(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      mousePreventDefault(e);
                      setIsClickingUltility(true);
                    }}
                    onMouseUp={() => {
                      setTimeout(() => {
                        setIsClickingUltility(false);
                      }, 0);
                    }}
                    type="button"
                  >
                    <span className="sr-only">Remove {item} option</span>
                    <RemoveIcon className="h-4 w-4 cursor-pointer transition-colors duration-100 ease-in-out hover:stroke-destructive" />
                  </button>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }
);

MultiSelectorTrigger.displayName = "MultiSelectorTrigger";

export default MultiSelectorTrigger;

const MultiSelectorTriggerButtonUltility = memo(
  ({
    onValueChange,
    mousePreventDefault,
    setIsClickingUltility,
    allAvailableOptions,
    maxLength,
  }: MultiSelectorTriggerButtonUltilityProps) => {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-7 w-7 cursor-pointer transition-colors duration-100 ease-in-out hover:text-destructive"
              onClick={() => {
                onValueChange([], "removeAll");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && allAvailableOptions) {
                  onValueChange([], "removeAll");
                }
              }}
              onMouseDown={(e) => {
                mousePreventDefault(e);
                setIsClickingUltility(true);
              }}
              onMouseUp={() => {
                setTimeout(() => {
                  setIsClickingUltility(false);
                }, 0);
              }}
              variant="outline"
            >
              <Trash2 className="h-4 w-4 " />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[100000000000]">
            Remove all
          </TooltipContent>
        </Tooltip>
        {!maxLength && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className=" h-7 w-7 cursor-pointer transition-colors duration-100 ease-in-out hover:text-yellow-500"
                onClick={() => {
                  onValueChange(allAvailableOptions ?? [], "selectAll");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && allAvailableOptions) {
                    onValueChange(allAvailableOptions ?? [], "selectAll");
                  }
                }}
                onMouseDown={(e) => {
                  mousePreventDefault(e);
                  setIsClickingUltility(true);
                }}
                onMouseUp={() => {
                  setTimeout(() => {
                    setIsClickingUltility(false);
                  }, 0);
                }}
                variant="outline"
              >
                <Sparkles className="h-4 w-4 " />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="z-[100000000000]">
              Select all
            </TooltipContent>
          </Tooltip>
        )}
      </>
    );
  }
);

MultiSelectorTriggerButtonUltility.displayName =
  "MultiSelectorTriggerButtonUltility";
