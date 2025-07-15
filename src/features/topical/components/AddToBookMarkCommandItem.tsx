import { Checkbox } from "@/components/ui/checkbox";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useIsMutating } from "@tanstack/react-query";
import { Loader2, Lock, Globe } from "lucide-react";

const AddToBookMarkCommandItem = ({
  onSelect,
  isItemBookmarked,
  listName,
  isPlaceholder = false,
  questionId,
  visibility,
}: {
  onSelect: () => void;
  isItemBookmarked: boolean;
  listName: string;
  questionId: string;
  isPlaceholder?: boolean;
  visibility: "private" | "public";
}) => {
  const isMutatingThisQuestionInThisList =
    useIsMutating({
      mutationKey: ["all_user_bookmarks", questionId, listName],
    }) > 0;
  return (
    <CommandItem
      className={cn(
        "cursor-pointer wrap-anywhere flex items-center justify-between",
        isMutatingThisQuestionInThisList && "opacity-50 cursor-default"
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onSelect={() => {
        if (isMutatingThisQuestionInThisList) {
          return;
        }
        onSelect();
      }}
    >
      <div className="flex items-center justify-start gap-2">
        <Checkbox
          checked={isItemBookmarked}
          className="data-[state=checked]:!bg-logo-main "
        />
        {listName}
        {isPlaceholder && <span className="sr-only">skibidi toilet</span>}
        {isMutatingThisQuestionInThisList && (
          <Loader2 className="animate-spin" />
        )}
      </div>
      {visibility === "private" ? (
        <Lock className="w-4 h-4" />
      ) : (
        <Globe className="w-4 h-4" />
      )}
    </CommandItem>
  );
};

export default AddToBookMarkCommandItem;
