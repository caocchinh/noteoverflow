import { memo } from "react";
import { CommandInput } from "@/components/ui/command";
import { XIcon } from "lucide-react";
import { BookmarkSearchInputProps } from "../../constants/types";

export const BookmarkSearchInput = memo(
  ({
    searchInput,
    setSearchInput,
    searchInputRef,
    setOpen,
  }: BookmarkSearchInputProps) => {
    return (
      <div className="flex w-full items-center justify-between gap-1 dark:bg-accent mb-2 pb-3 border-b border-border ">
        <CommandInput
          placeholder="Search bookmark lists"
          wrapperClassName="w-full ml-2"
          onClick={(e) => {
            e.currentTarget.focus();
          }}
          value={searchInput}
          ref={searchInputRef}
          onValueChange={setSearchInput}
          onDoubleClick={(e) => {
            e.currentTarget.select();
          }}
        />
        <XIcon
          className="!bg-transparent cursor-pointer mr-2 text-destructive"
          size={20}
          onClick={(e) => {
            e.stopPropagation();
            if (searchInput) {
              setSearchInput("");
            } else {
              setOpen(false);
            }
          }}
        />
      </div>
    );
  }
);

BookmarkSearchInput.displayName = "BookmarkSearchInput";
