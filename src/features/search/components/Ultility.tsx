import Sort from "@/features/topical/components/Sort";
import LayoutSetting from "@/features/topical/components/LayoutSetting";
import { SortParameters } from "@/features/topical/constants/types";
import { Dispatch, SetStateAction } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";

const Ultility = ({
  sortParameters,
  setSortParameters,
}: {
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontalIcon className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4 space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Sort</h4>
          <Sort
            sortParameters={sortParameters}
            setSortParameters={setSortParameters}
            isDisabled={false}
            disabledMessage="Please run a search first"
            descendingSortText="Best match first"
            ascendingSortText="Worst match first"
          />
        </div>
        <LayoutSetting triggerClassName="w-full" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Ultility;
