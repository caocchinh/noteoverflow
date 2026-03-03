"use client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Blocks, FileStack, Mouse, X } from "lucide-react";
import { useState } from "react";
import {
  MAX_NUMBER_OF_COLUMNS,
  MAXIMUM_NUMBER_OF_QUESTIONS_PER_PAGE,
} from "../constants/constants";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { LayoutStyle } from "../types/preferences";
import ElasticSlider from "./ElasticSlider";

export default function LayoutSetting({ triggerClassName }: { triggerClassName: string }) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { uiPreferences, setUiPreference } = useTopicalApp();

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button className={triggerClassName} variant="secondary">
          <Blocks />
          Layout settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-100006 flex flex-col items-center justify-center gap-3">
        <X
          className="absolute top-2 right-2 h-4 w-4 cursor-pointer"
          onClick={() => setIsPopoverOpen(false)}
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <h4 className="text-center text-sm font-medium">Number of maximum displayed columns</h4>
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
        <Separator orientation="horizontal" />
        <div className="flex w-full flex-col items-center justify-center gap-3">
          <h4 className="text-center text-sm font-medium">Layout style</h4>
          <Select
            value={uiPreferences.layoutStyle}
            onValueChange={(value) => setUiPreference("layoutStyle", value as LayoutStyle)}
          >
            <SelectTrigger className="h-max! w-[90%]">
              <SelectValue placeholder="Select a layout style" />
            </SelectTrigger>
            <SelectContent className="z-9999999">
              <SelectItem value="pagination">
                <div className="flex w-full cursor-pointer flex-row items-center justify-start gap-3">
                  <FileStack className="h-4 w-4" />
                  <div className="flex flex-col items-start justify-center">
                    <p className="text-sm">Pagination</p>
                    <p className="text-muted-foreground text-left text-xs wrap-anywhere">
                      Better performance on large results.
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="infinite">
                <div className="flex w-full cursor-pointer flex-row items-center justify-start gap-3">
                  <Mouse className="h-4 w-4" />
                  <div className="flex flex-col items-start justify-center">
                    <p className="text-sm wrap-anywhere">Infinite/Doom scroll</p>
                    <p className="text-muted-foreground text-left text-xs wrap-anywhere">
                      More dopamine.
                    </p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Separator orientation="horizontal" />
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <h4 className="text-center text-sm font-medium">Number of questions per page</h4>
            <p className="text-muted-foreground text-center text-xs">
              On pagination layout only , this is the number of questions displayed per page.
            </p>
            <ElasticSlider
              minValue={1}
              startingValue={uiPreferences.numberOfQuestionsPerPage}
              maxValue={MAXIMUM_NUMBER_OF_QUESTIONS_PER_PAGE}
              isStepped
              stepSize={1}
              setValue={(value) => {
                setUiPreference("numberOfQuestionsPerPage", value);
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
