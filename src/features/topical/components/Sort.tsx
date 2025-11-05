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

const Sort = memo(
  ({
    sortParameters,
    setSortParameters,
    isDisabled,
  }: {
    sortParameters: SortParameters | null;
    setSortParameters: Dispatch<SetStateAction<SortParameters | null>>;
    isDisabled: boolean;
  }) => {
    const handleSortChange = (value: string) => {
      setSortParameters({
        sortBy: value as "year-asc" | "year-desc",
      });
    };

    const currentSort = sortParameters?.sortBy || "year-desc";

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
                    if (sortParameters?.sortBy === "year-asc") {
                      handleSortChange("year-desc");
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4",
                      currentSort === "year-desc" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (sortParameters?.sortBy === "year-desc") {
                      handleSortChange("year-asc");
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4",
                      currentSort === "year-asc" ? "opacity-100" : "opacity-0"
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
