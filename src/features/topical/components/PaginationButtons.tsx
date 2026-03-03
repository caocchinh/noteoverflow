"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { memo } from "react";

export interface FirstPageButtonProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const FirstPageButton = memo(
  ({
    currentChunkIndex,
    setCurrentChunkIndex,
    scrollUpWhenPageChange,
    scrollAreaRef,
  }: FirstPageButtonProps) => {
    return (
      <Button
        variant="outline"
        className="cursor-pointer rounded-[2px] p-[8px]!"
        title="First page"
        disabled={currentChunkIndex === 0}
        onClick={() => {
          if (currentChunkIndex === 0) return;
          setCurrentChunkIndex(0);
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
  },
);
FirstPageButton.displayName = "FirstPageButton";

export interface PreviousPageButtonProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const PreviousPageButton = memo(
  ({
    currentChunkIndex,
    setCurrentChunkIndex,
    scrollUpWhenPageChange,
    scrollAreaRef,
  }: PreviousPageButtonProps) => {
    return (
      <Button
        variant="outline"
        className="cursor-pointer rounded-[2px] p-[8px]!"
        title="Previous page"
        disabled={currentChunkIndex === 0}
        onClick={() => {
          if (currentChunkIndex === 0) return;
          setCurrentChunkIndex(currentChunkIndex - 1);
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
  },
);
PreviousPageButton.displayName = "PreviousPageButton";

export interface NextPageButtonProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  totalPages: number;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const NextPageButton = memo(
  ({
    currentChunkIndex,
    setCurrentChunkIndex,
    totalPages,
    scrollUpWhenPageChange,
    scrollAreaRef,
  }: NextPageButtonProps) => {
    return (
      <Button
        variant="outline"
        className="cursor-pointer rounded-[2px] p-[8px]!"
        title="Next page"
        disabled={currentChunkIndex === totalPages - 1 || totalPages - 1 < 1}
        onClick={() => {
          if (currentChunkIndex === totalPages - 1) return;
          setCurrentChunkIndex(currentChunkIndex + 1);
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
  },
);
NextPageButton.displayName = "NextPageButton";

export interface LastPageButtonProps {
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  totalPages: number;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const LastPageButton = memo(
  ({
    currentChunkIndex,
    setCurrentChunkIndex,
    totalPages,
    scrollUpWhenPageChange,
    scrollAreaRef,
  }: LastPageButtonProps) => {
    return (
      <Button
        variant="outline"
        className="cursor-pointer rounded-[2px] p-[8px]!"
        title="Last page"
        disabled={currentChunkIndex === totalPages - 1 || totalPages - 1 < 1}
        onClick={() => {
          if (currentChunkIndex === totalPages - 1) return;
          setCurrentChunkIndex(totalPages - 1);
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
  },
);
LastPageButton.displayName = "LastPageButton";
