import { Dispatch, memo, SetStateAction, useState } from "react";
import { ArrowDownWideNarrow, Check } from "lucide-react";
import { SortParameters } from "../constants/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { DEFAULT_SORT_OPTIONS } from "../constants/constants";

const Sort = memo(
  ({
    sortParameters,
    setSortParameters,
    isDisabled,
    disabledMessage,
    showSortTextTrigger = true,
    descendingSortText = "Newest first",
    ascendingSortText = "Oldest first",
  }: {
    sortParameters: SortParameters;
    setSortParameters: Dispatch<SetStateAction<SortParameters>>;
    isDisabled: boolean;
    disabledMessage: string;
    showSortTextTrigger?: boolean;
    descendingSortText?: string;
    ascendingSortText?: string;
  }) => {
    const currentSort = sortParameters?.sortBy || DEFAULT_SORT_OPTIONS;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    return (
      <Tooltip
        open={
          isTooltipOpen &&
          !isDropdownOpen &&
          (isDisabled || !showSortTextTrigger)
        }
        onOpenChange={setIsTooltipOpen}
      >
        <TooltipTrigger asChild>
          <div tabIndex={-1} className={cn(isDisabled && "opacity-50")}>
            <Popover
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
              modal={true}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isDisabled}
                  className="cursor-pointer !px-[10px]"
                >
                  <ArrowDownWideNarrow className="w-4 h-4" />
                  {showSortTextTrigger && "Sort"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[180px] z-[999999] !p-1">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      if (sortParameters?.sortBy === "ascending") {
                        setSortParameters({ sortBy: "descending" });
                      }
                    }}
                    className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm px-2 py-1.5 text-sm outline-hidden"
                  >
                    <Check
                      className={cn(
                        "mr-2 w-4 h-4",
                        currentSort === "descending"
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {descendingSortText}
                  </button>
                  <button
                    onClick={() => {
                      if (sortParameters?.sortBy === "descending") {
                        setSortParameters({ sortBy: "ascending" });
                      }
                    }}
                    className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm px-2 py-1.5 text-sm outline-hidden"
                  >
                    <Check
                      className={cn(
                        "mr-2 w-4 h-4",
                        currentSort === "ascending"
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {ascendingSortText}
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="z-[1000000]">
          <div className="flex items-center gap-2 justify-center">
            {showSortTextTrigger && disabledMessage}
            {!showSortTextTrigger && "Sort by"}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
);

Sort.displayName = "Sort";

export default Sort;
