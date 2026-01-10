"use client";
import Sort from "@/features/topical/components/Sort";
import { SortParameters } from "@/features/topical/constants/types";
import { Dispatch, SetStateAction, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Blocks, MoreHorizontalIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ElasticSlider from "@/features/topical/components/ElasticSlider";
import { MAX_NUMBER_OF_COLUMNS } from "@/features/topical/constants/constants";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";

const Ultility = ({
  sortParameters,
  setSortParameters,
}: {
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { uiPreferences, setUiPreference } = useTopicalApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          title="More settings"
        >
          <MoreHorizontalIcon className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-2 space-y-2">
        <div className="space-y-2">
          <Sort
            sortParameters={sortParameters}
            setSortParameters={setSortParameters}
            isDisabled={false}
            disabledMessage="Please run a search first"
            descendingSortText="Best match first"
            triggerClassName="w-full"
            ascendingSortText="Worst match first"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Blocks className="w-4 h-4 mr-2" />
              Layout settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md dark:bg-accent">
            <DialogTitle className="sr-only">Layout settings</DialogTitle>
            <X
              className="w-4 h-4 absolute top-4 right-4 cursor-pointer"
              onClick={() => setIsDialogOpen(false)}
            />
            <div className="flex flex-col items-center justify-center gap-4 pt-6">
              <div className="flex flex-col items-center justify-center gap-3 w-full">
                <h4 className="text-lg font-medium text-center">
                  Number of maximum displayed columns
                </h4>
                <ElasticSlider
                  minValue={1}
                  startingValue={uiPreferences.numberOfColumns}
                  maxValue={MAX_NUMBER_OF_COLUMNS}
                  isStepped
                  stepSize={1}
                  setValue={(value) => {
                    setUiPreference("numberOfColumns", value);
                  }}
                />
              </div>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Ultility;
