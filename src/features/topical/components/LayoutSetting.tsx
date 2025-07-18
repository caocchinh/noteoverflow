"use client";
import { Popover } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Blocks } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import ElasticSlider from "./ElasticSlider";
import { FiltersCache, LayoutStyle } from "../constants/types";
import { useEffect, useRef } from "react";
import {
  DEFAULT_NUMBER_OF_COLUMNS,
  FILTERS_CACHE_KEY,
  MAX_NUMBER_OF_COLUMNS,
} from "../constants/constants";

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

  useEffect(() => {
    const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
    if (savedState) {
      const parsedState: FiltersCache = JSON.parse(savedState);
      setNumberOfColumns(
        parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS
      );
    }
    setTimeout(() => {
      isMounted.current = true;
    }, 0);
  }, [setNumberOfColumns]);

  useEffect(() => {
    if (!isMounted.current) {
      return;
    }
    const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
    let stateToSave: FiltersCache = existingStateJSON
      ? JSON.parse(existingStateJSON)
      : { filters: {} };

    stateToSave = {
      ...stateToSave,
      numberOfColumns: numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS,
    };
    localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
  }, [numberOfColumns]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="flex w-full -mt-1 cursor-pointer items-center justify-start gap-2"
          variant="secondary"
        >
          <Blocks />
          Layout settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100006] h-[190px] flex flex-col items-center justify-center gap-3">
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
      </PopoverContent>
    </Popover>
  );
}
