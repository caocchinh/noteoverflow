import { memo, Dispatch, SetStateAction } from "react";
import { ArrowDownWideNarrow, Info, Check } from "lucide-react";
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

const Sort = memo(
  ({
    sortParameters,
    setSortParameters,
    isDisabled,
  }: {
    sortParameters: SortParameters;
    setSortParameters: Dispatch<SetStateAction<SortParameters>>;
    isDisabled: boolean;
  }) => {
    const currentSort = sortParameters?.sortBy || DEFAULT_SORT_OPTIONS;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            tabIndex={-1}
            className={cn(isDisabled && "opacity-50 cursor-not-allowed")}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isDisabled}
                  className="cursor-pointer"
                >
                  <ArrowDownWideNarrow className="mr-2 w-4 h-4" />
                  Sort
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
                  Newest first
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
                  Oldest first
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className={cn(!isDisabled && "hidden")}>
          <div className="flex items-center gap-2 justify-center">
            <Info className="w-4 h-4" />
            To sort questions, run a search first.
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
);

Sort.displayName = "Sort";

export default Sort;
