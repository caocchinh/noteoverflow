import { memo, RefObject, useCallback, type KeyboardEvent } from "react";
import { Command } from "@/components/ui/command";
import { BookmarkListRef } from "../../constants/types";

interface BookmarkContentProps {
  children: React.ReactNode;
  bookmarkListRef: RefObject<BookmarkListRef | null>;
  open: boolean;
  handleOpenChange: (value: boolean | ((prev: boolean) => boolean)) => void;
  setIsHovering?: (value: boolean) => void;
  setShouldOpen?: (value: boolean) => void;
}

const useBookmarkKeyDown = (
  bookmarkListRef: RefObject<BookmarkListRef | null>,
  open: boolean,
  handleOpenChange: (value: boolean | ((prev: boolean) => boolean)) => void
) => {
  return useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (e.key === "Escape") {
        if (bookmarkListRef.current?.searchInput) {
          bookmarkListRef.current?.setSearchInput("");
          return;
        }
        if (open) {
          handleOpenChange(false);
        }
      }
    },
    [bookmarkListRef, handleOpenChange, open]
  );
};

const BookmarkContent = memo(
  ({
    children,
    bookmarkListRef,
    open,
    handleOpenChange,
  }: BookmarkContentProps) => {
    const handleKeyDown = useBookmarkKeyDown(
      bookmarkListRef,
      open,
      handleOpenChange
    );

    return (
      <Command
        shouldFilter={false}
        onKeyDown={handleKeyDown}
        className="!h-max bg-transparent overflow-visible !w-max"
      >
        {children}
      </Command>
    );
  }
);

BookmarkContent.displayName = "BookmarkContent";

export default BookmarkContent;
