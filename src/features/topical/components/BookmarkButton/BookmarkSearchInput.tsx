import { CommandInput } from "@/components/ui/command";
import { XIcon } from "lucide-react";
import { memo } from "react";
import { BookmarkSearchInputProps } from "../../types/components";

export const BookmarkSearchInput = memo(
  ({ searchInput, setSearchInput, searchInputRef, setOpen }: BookmarkSearchInputProps) => {
    return (
      <div className="dark:bg-accent border-border mb-2 flex w-full items-center justify-between gap-1 border-b pb-3">
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
          className="text-destructive mr-2 cursor-pointer bg-transparent!"
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
  },
);

BookmarkSearchInput.displayName = "BookmarkSearchInput";
