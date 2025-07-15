import { Checkbox } from "@/components/ui/checkbox";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useIsMutating } from "@tanstack/react-query";
import { Loader2, Lock, Earth } from "lucide-react";

const AddToBookMarkCommandItem = ({
  onSelect,
  isItemBookmarked,
  listName,
  questionId,
  visibility,
}: {
  onSelect: () => void;
  isItemBookmarked: boolean;
  listName: string;
  questionId: string;
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
        {isMutatingThisQuestionInThisList && (
          <Loader2 className="animate-spin" />
        )}
      </div>
      {visibility === "private" ? (
        <Lock className="w-4 h-4" />
      ) : (
        <Earth className="w-4 h-4" />
      )}
    </CommandItem>
  );
};

export default AddToBookMarkCommandItem;
