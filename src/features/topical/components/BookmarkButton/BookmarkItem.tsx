import { memo } from "react";
import { CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMutating } from "@tanstack/react-query";
import { BookmarkItemProps } from "../../constants/types";

export const BookmarkItem = memo(
  ({
    listName,
    visibility,
    listId,
    onSelect,
    question,
    chosenBookmarkList,
  }: BookmarkItemProps) => {
    const isMutating =
      useIsMutating({
        mutationKey: [
          "user_saved_activities",
          "bookmarks",
          question.id,
          listName,
          visibility,
        ],
      }) > 0;

    return (
      <CommandItem
        className={cn(
          "cursor-pointer wrap-anywhere flex items-center justify-between",
          isMutating && "opacity-50 cursor-default"
        )}
        onSelect={() => {
          if (isMutating) {
            return;
          }
          onSelect();
        }}
      >
        <div className="flex items-center justify-start gap-2">
          <Checkbox
            checked={chosenBookmarkList.has(listId)}
            className="data-[state=checked]:bg-logo-main!"
          />
          {listName}
          {isMutating && <Loader2 className="animate-spin" />}
        </div>
        {visibility === "private" ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
      </CommandItem>
    );
  }
);

BookmarkItem.displayName = "BookmarkItem";
