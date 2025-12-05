import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { memo } from "react";

const SortUtil = memo(
  ({
    sortByYear,
  }: {
    sortByYear: (order: "ascending" | "descending") => void;
  }) => {
    return (
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
            Sort
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 z-100009" align="end">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Sort by year
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sortByYear("ascending")}
              className="cursor-pointer justify-start"
            >
              <ArrowUp className="h-3.5 w-3.5 mr-2" />
              Year ascending
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sortByYear("descending")}
              className="cursor-pointer justify-start"
            >
              <ArrowDown className="h-3.5 w-3.5 mr-2" />
              Year descending
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

SortUtil.displayName = "SortUtil";

export default SortUtil;
