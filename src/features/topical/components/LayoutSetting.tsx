"use client";
import { Popover } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Blocks, FileStack, Mouse, X } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import ElasticSlider from "./ElasticSlider";
import { LayoutStyle } from "../constants/types";
import { SetStateAction, Dispatch, useState } from "react";
import {
  MAX_NUMBER_OF_COLUMNS,
  MAXIMUM_NUMBER_OF_QUESTIONS_PER_PAGE,
} from "../constants/constants";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LayoutSetting({
  setNumberOfColumns,
  numberOfColumns,
  layoutStyle,
  setLayoutStyle,
  numberOfQuestionsPerPage,
  setNumberOfQuestionsPerPage,
}: {
  setNumberOfColumns: Dispatch<SetStateAction<number>>;
  layoutStyle: LayoutStyle;
  numberOfColumns: number;
  setLayoutStyle: Dispatch<SetStateAction<LayoutStyle>>;
  numberOfQuestionsPerPage: number;
  setNumberOfQuestionsPerPage: Dispatch<SetStateAction<number>>;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          className="flex w-full -mt-1 cursor-pointer items-center justify-start gap-2"
          variant="secondary"
        >
          <Blocks />
          Layout settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100006]  flex flex-col items-center justify-center gap-3">
        <X
          className="w-4 h-4 absolute top-2 right-2 cursor-pointer"
          onClick={() => setIsPopoverOpen(false)}
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <h4 className="text-sm font-medium text-center">
            Number of maximum displayed columns
          </h4>
          <ElasticSlider
            minValue={1}
            startingValue={numberOfColumns}
            maxValue={MAX_NUMBER_OF_COLUMNS}
            isStepped
            stepSize={1}
            setValue={setNumberOfColumns}
          />
        </div>
        <Separator orientation="horizontal" />
        <div className="flex flex-col items-center justify-center gap-3 w-full">
          <h4 className="text-sm font-medium text-center">Layout style</h4>
          <Select
            value={layoutStyle}
            onValueChange={(value) => setLayoutStyle(value as LayoutStyle)}
          >
            <SelectTrigger className="w-[90%] !h-max">
              <SelectValue placeholder="Select a layout style" />
            </SelectTrigger>
            <SelectContent className="z-[9999999]">
              <SelectItem value="pagination">
                <div className="flex items-center justify-start cursor-pointer flex-row gap-3 w-full">
                  <FileStack className="w-4 h-4" />
                  <div className="flex flex-col justify-center items-start">
                    <p className="text-sm">Pagination</p>
                    <p className="text-xs text-muted-foreground text-left wrap-anywhere">
                      Better performance on large results.
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="infinite">
                <div className="flex items-center justify-start cursor-pointer flex-row gap-3 w-full">
                  <Mouse className="w-4 h-4" />
                  <div className="flex flex-col justify-center items-start">
                    <p className="text-sm wrap-anywhere">
                      Infinite/Doom scroll
                    </p>
                    <p className="text-xs text-muted-foreground text-left wrap-anywhere">
                      More dopamine.
                    </p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Separator orientation="horizontal" />
          <div className="flex flex-col items-center justify-center gap-3 w-full">
            <h4 className="text-sm font-medium text-center">
              Number of questions per page
            </h4>
            <p className="text-xs text-muted-foreground text-center">
              On pagination layout only , this is the number of questions
              displayed per page.
            </p>
            <ElasticSlider
              minValue={1}
              startingValue={numberOfQuestionsPerPage}
              maxValue={MAXIMUM_NUMBER_OF_QUESTIONS_PER_PAGE}
              isStepped
              stepSize={1}
              setValue={setNumberOfQuestionsPerPage}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
