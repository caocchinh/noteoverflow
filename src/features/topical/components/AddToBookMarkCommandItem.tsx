import { Checkbox } from "@/components/ui/checkbox";
import { CommandItem } from "@/components/ui/command";
import { useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const AddToBookMarkCommandItem = ({
  onSelect,
  isItemBookmarked,
  listName,
  questionId,
}: {
  onSelect: () => void;
  isItemBookmarked: boolean;
  listName: string;
  questionId: string;
}) => {
  const isMutatingThisQuestionInThisList =
    useIsMutating({
      mutationKey: ["all_user_bookmarks", questionId, listName],
    }) > 0;
  return (
    <CommandItem
      className="cursor-pointer flex items-center justify-start"
      disabled={isMutatingThisQuestionInThisList}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onSelect={onSelect}
    >
      <Checkbox
        checked={isItemBookmarked}
        className="data-[state=checked]:!bg-logo-main"
      />
      {listName}
      {isMutatingThisQuestionInThisList && <Loader2 className="animate-spin" />}
    </CommandItem>
  );
};

export default AddToBookMarkCommandItem;
