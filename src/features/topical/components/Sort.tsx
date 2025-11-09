import { Dispatch, SetStateAction, useState } from "react";
import { ArrowDownWideNarrow, Check } from "lucide-react";
import { SortParameters } from "../constants/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DEFAULT_SORT_OPTIONS } from "../constants/constants";

const Sort = ({
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
        isTooltipOpen && !isDropdownOpen && (isDisabled || !showSortTextTrigger)
      }
      onOpenChange={setIsTooltipOpen}
    >
      <TooltipTrigger asChild>
        <div tabIndex={-1} className={cn(isDisabled && "opacity-50")}>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled}
                className="cursor-pointer !px-[10px]"
                onTouchStart={(e) => e.preventDefault()}
              >
                <ArrowDownWideNarrow className="w-4 h-4" />
                {showSortTextTrigger && "Sort"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px] z-[999999]">
              <DropdownMenuItem
                onClick={() => {
                  if (sortParameters?.sortBy === "ascending") {
                    setSortParameters({ sortBy: "descending" });
                  }
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 w-4 h-4",
                    currentSort === "descending" ? "opacity-100" : "opacity-0"
                  )}
                />
                {descendingSortText}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (sortParameters?.sortBy === "descending") {
                    setSortParameters({ sortBy: "ascending" });
                  }
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 w-4 h-4",
                    currentSort === "ascending" ? "opacity-100" : "opacity-0"
                  )}
                />
                {ascendingSortText}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
};

export default Sort;
