import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, X as RemoveIcon } from "lucide-react";
import { Dispatch, memo, SetStateAction } from "react";

export const MultiSelectorDesktoptUltilityButtons = memo(
  ({
    onDeleteAll,
    onSelectAll,
    maxLength,
  }: {
    onDeleteAll: () => void;
    onSelectAll: () => void;
    maxLength: number | undefined;
  }) => {
    return (
      <div className="flex flex-row gap-2 m-2">
        {!maxLength && (
          <Button
            className="cursor-pointer flex-1/2 md:flex hidden items-center justify-center h-[30px]"
            onClick={onSelectAll}
          >
            Select all
            <Sparkles className="h-4 w-4" />
          </Button>
        )}
        <Button
          className="cursor-pointer flex-1/2 md:flex hidden items-center justify-center h-[30px] "
          onClick={onDeleteAll}
          variant="destructive"
        >
          Remove all
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

MultiSelectorDesktoptUltilityButtons.displayName =
  "MultiSelectorDesktoptUltilityButtons";

export const MultiSelectorMobiletUltilityButtons = memo(
  ({
    onDeleteAll,
    onSelectAll,
    maxLength,
    setOpen,
  }: {
    onDeleteAll: () => void;
    onSelectAll: () => void;
    maxLength: number | undefined;
    setOpen: Dispatch<SetStateAction<boolean>>;
  }) => {
    return (
      <div className="flex flex-row gap-3 p-2 ">
        <Button
          className="flex-1/3 cursor-pointer"
          onClick={onDeleteAll}
          variant="destructive"
        >
          Remove all
          <Trash2 className="h-4 w-4" />
        </Button>
        {!maxLength && (
          <Button className="flex-1/3 cursor-pointer" onClick={onSelectAll}>
            Select all
            <Sparkles className="h-4 w-4" />
          </Button>
        )}
        <Button
          className="flex-1/3 cursor-pointer"
          onClick={() => {
            setOpen(false);
          }}
          variant="outline"
        >
          Close
          <RemoveIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

MultiSelectorMobiletUltilityButtons.displayName =
  "MultiSelectorMobiletUltilityButtons";
