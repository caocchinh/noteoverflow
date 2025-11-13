import { memo } from "react";
import { MultiSelectorSearchInputProps } from "../../constants/types";
import { CommandInput } from "@/components/ui/command";
import { X as RemoveIcon } from "lucide-react";

const MultiSelectorSearchInput = memo(
  ({
    inputValue,
    setInputValue,
    inputRef,
    label,
    setOpen,
    commandListScrollArea,
  }: MultiSelectorSearchInputProps) => {
    return (
      <div
        className="flex items-center gap-1 dark:bg-accent"
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        <CommandInput
          className="w-full bg-transparent text-sm outline-none placeholder:text-[14px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          enterKeyHint="search"
          onValueChange={(e) => {
            setInputValue(e);
            if (!e) {
              setTimeout(() => {
                commandListScrollArea.current?.scrollTo({
                  top: 0,
                  behavior: "instant",
                });
              }, 0);
            }
          }}
          placeholder={`Search ${label.toLowerCase()}`}
          ref={inputRef}
          tabIndex={0}
          value={inputValue}
          wrapperClassName="w-full py-6 px-4 border-b"
        />
        <RemoveIcon
          className="!bg-transparent cursor-pointer mr-2 text-destructive"
          size={20}
          onClick={(e) => {
            e.stopPropagation();
            if (inputValue === "") {
              setOpen(false);
            } else {
              setInputValue("");
            }
          }}
        />
      </div>
    );
  }
);

MultiSelectorSearchInput.displayName = "MultiSelectorSearchInput";

export default MultiSelectorSearchInput;
