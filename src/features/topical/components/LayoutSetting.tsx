"use client";
import { Popover } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Blocks, FileStack, Mouse, X } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import ElasticSlider from "./ElasticSlider";
import { FiltersCache, LayoutStyle } from "../constants/types";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_NUMBER_OF_COLUMNS,
  DEFAULT_LAYOUT_STYLE,
  FILTERS_CACHE_KEY,
  MAX_NUMBER_OF_COLUMNS,
  DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
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
  setNumberOfColumns: (numberOfColumns: number) => void;
  layoutStyle: LayoutStyle;
  numberOfColumns: number;
  setLayoutStyle: (layoutStyle: LayoutStyle) => void;
  numberOfQuestionsPerPage: number;
  setNumberOfQuestionsPerPage: (numberOfQuestionsPerPage: number) => void;
}) {
  const isMounted = useRef(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
      if (savedState) {
        const parsedState: FiltersCache = JSON.parse(savedState);
        setNumberOfColumns(
          parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS
        );
        setLayoutStyle(parsedState.layoutStyle ?? DEFAULT_LAYOUT_STYLE);
        setNumberOfQuestionsPerPage(
          parsedState.numberOfQuestionsPerPage ??
            DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE
        );
      }
    } catch (error) {
      // Use default values if localStorage is not available
      setNumberOfColumns(DEFAULT_NUMBER_OF_COLUMNS);
      setLayoutStyle(DEFAULT_LAYOUT_STYLE);
      setNumberOfQuestionsPerPage(DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE);
      console.error("Failed to access localStorage:", error);
    }

    setTimeout(() => {
      isMounted.current = true;
    }, 0);
  }, [setLayoutStyle, setNumberOfColumns, setNumberOfQuestionsPerPage]);

  useEffect(() => {
    if (!isMounted.current) {
      return;
    }

    try {
      let stateToSave: FiltersCache;

      try {
        const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
        stateToSave = existingStateJSON
          ? JSON.parse(existingStateJSON)
          : {
              numberOfColumns: DEFAULT_NUMBER_OF_COLUMNS,
              layoutStyle: DEFAULT_LAYOUT_STYLE,
              numberOfQuestionsPerPage: DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
              isSessionCacheEnabled: true,
              isPersistantCacheEnabled: true,
              showFinishedQuestionTint: true,
              showScrollToTopButton: true,
              lastSessionCurriculum: "",
              lastSessionSubject: "",
              filters: {},
            };
      } catch {
        // If reading fails, start with empty state
        stateToSave = {
          numberOfColumns: DEFAULT_NUMBER_OF_COLUMNS,
          layoutStyle: DEFAULT_LAYOUT_STYLE,
          numberOfQuestionsPerPage: DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
          isSessionCacheEnabled: true,
          isPersistantCacheEnabled: true,
          showFinishedQuestionTint: true,
          showScrollToTopButton: true,
          lastSessionCurriculum: "",
          lastSessionSubject: "",
          filters: {},
        };
      }

      stateToSave = {
        ...stateToSave,
        numberOfColumns: numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS,
        layoutStyle: layoutStyle ?? DEFAULT_LAYOUT_STYLE,
        numberOfQuestionsPerPage:
          numberOfQuestionsPerPage ?? DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
      };

      localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      // Silently handle localStorage errors - settings won't persist
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [numberOfColumns, layoutStyle, numberOfQuestionsPerPage]);

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
                <div className="flex items-center justify-start w-max cursor-pointer flex-row gap-3">
                  <FileStack className="w-4 h-4" />
                  <div className="flex flex-col justify-center items-start">
                    <p className="text-sm">Pagination</p>
                    <p className="text-xs text-muted-foreground text-left whitespace-normal">
                      Better performance on large results.
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="infinite">
                <div className="flex items-center justify-start w-max cursor-pointer flex-row gap-3 ">
                  <Mouse className="w-4 h-4" />
                  <div className="flex flex-col justify-center items-start">
                    <p className="text-sm wrap-anywhere">
                      Infinite/Doom scroll
                    </p>
                    <p className="text-xs text-muted-foreground text-left whitespace-normal">
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
              maxValue={50}
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
