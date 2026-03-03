"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ElasticSlider from "@/features/topical/components/ElasticSlider";
import Sort from "@/features/topical/components/Sort";
import { MAX_NUMBER_OF_COLUMNS } from "@/features/topical/constants/constants";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { SortParameters } from "@/features/topical/types/models";
import { Blocks, MoreHorizontalIcon, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

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
        <Button variant="outline" size="icon" className="cursor-pointer" title="More settings">
          <MoreHorizontalIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 space-y-2 p-2">
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
              <Blocks className="mr-2 h-4 w-4" />
              Layout settings
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-accent max-w-md">
            <DialogTitle className="sr-only">Layout settings</DialogTitle>
            <X
              className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
              onClick={() => setIsDialogOpen(false)}
            />
            <div className="flex flex-col items-center justify-center gap-4 pt-6">
              <div className="flex w-full flex-col items-center justify-center gap-3">
                <h4 className="text-center text-lg font-medium">
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
