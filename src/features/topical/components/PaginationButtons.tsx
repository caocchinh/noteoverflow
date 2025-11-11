"use client";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SelectedQuestion } from "@/features/topical/constants/types";
import { memo } from "react";

export interface FirstPageButtonProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  fullPartitionedData: SelectedQuestion[][] | undefined;
  setDisplayedData: (data: SelectedQuestion[]) => void;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const FirstPageButton = memo(
  ({
    currentChunkIndex,
    setCurrentChunkIndex,
    fullPartitionedData,
    setDisplayedData,
    scrollUpWhenPageChange,
    scrollAreaRef,
  }: FirstPageButtonProps) => {
    return (
      <Button
        variant="outline"
        className="cursor-pointer !p-[8px] rounded-[2px]"
        title="First page"
        disabled={currentChunkIndex === 0}
        onClick={() => {
          if (currentChunkIndex === 0) return;
          setCurrentChunkIndex(0);
          setDisplayedData(fullPartitionedData![0]);
          if (scrollUpWhenPageChange) {
            scrollAreaRef.current?.scrollTo({
              top: 0,
              behavior: "instant",
            });
          }
        }}
      >
        <ChevronsLeft />
      </Button>
    );
  }
);
FirstPageButton.displayName = "FirstPageButton";

export interface PreviousPageButtonProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  fullPartitionedData: SelectedQuestion[][] | undefined;
  setDisplayedData: (data: SelectedQuestion[]) => void;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const PreviousPageButton = memo(
  ({
    currentChunkIndex,
    setCurrentChunkIndex,
    fullPartitionedData,
    setDisplayedData,
    scrollUpWhenPageChange,
    scrollAreaRef,
  }: PreviousPageButtonProps) => {
    return (
      <Button
        variant="outline"
        className="cursor-pointer !p-[8px] rounded-[2px]"
        title="Previous page"
        disabled={currentChunkIndex === 0}
        onClick={() => {
          if (currentChunkIndex === 0) return;
          setCurrentChunkIndex(currentChunkIndex - 1);
          setDisplayedData(fullPartitionedData![currentChunkIndex - 1]);
          if (scrollUpWhenPageChange) {
            scrollAreaRef.current?.scrollTo({
              top: 0,
              behavior: "instant",
            });
          }
        }}
      >
        <ChevronLeft />
      </Button>
    );
  }
);
PreviousPageButton.displayName = "PreviousPageButton";

export interface NextPageButtonProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  fullPartitionedData: SelectedQuestion[][] | undefined;
  setDisplayedData: (data: SelectedQuestion[]) => void;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const NextPageButton = memo(
  ({
    currentChunkIndex,
    setCurrentChunkIndex,
    fullPartitionedData,
    setDisplayedData,
    scrollUpWhenPageChange,
    scrollAreaRef,
  }: NextPageButtonProps) => {
    return (
      <Button
        variant="outline"
        className="cursor-pointer !p-[8px] rounded-[2px]"
        title="Next page"
        disabled={
          currentChunkIndex === fullPartitionedData!.length - 1 ||
          fullPartitionedData!.length - 1 < 1
        }
        onClick={() => {
          if (currentChunkIndex === fullPartitionedData!.length - 1) return;
          setCurrentChunkIndex(currentChunkIndex + 1);
          setDisplayedData(fullPartitionedData![currentChunkIndex + 1]);
          if (scrollUpWhenPageChange) {
            scrollAreaRef.current?.scrollTo({
              top: 0,
              behavior: "instant",
            });
          }
        }}
      >
        <ChevronRight />
      </Button>
    );
  }
);
NextPageButton.displayName = "NextPageButton";

export interface LastPageButtonProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  fullPartitionedData: SelectedQuestion[][] | undefined;
  setDisplayedData: (data: SelectedQuestion[]) => void;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const LastPageButton = memo(
  ({
    currentChunkIndex,
    setCurrentChunkIndex,
    fullPartitionedData,
    setDisplayedData,
    scrollUpWhenPageChange,
    scrollAreaRef,
  }: LastPageButtonProps) => {
    return (
      <Button
        variant="outline"
        className="cursor-pointer !p-[8px] rounded-[2px]"
        title="Last page"
        disabled={
          currentChunkIndex === fullPartitionedData!.length - 1 ||
          fullPartitionedData!.length - 1 < 1
        }
        onClick={() => {
          if (currentChunkIndex === fullPartitionedData!.length - 1) return;
          setCurrentChunkIndex(fullPartitionedData!.length - 1);
          setDisplayedData(
            fullPartitionedData![fullPartitionedData!.length - 1]
          );
          if (scrollUpWhenPageChange) {
            scrollAreaRef.current?.scrollTo({
              top: 0,
              behavior: "instant",
            });
          }
        }}
      >
        <ChevronsRight />
      </Button>
    );
  }
);
LastPageButton.displayName = "LastPageButton";
