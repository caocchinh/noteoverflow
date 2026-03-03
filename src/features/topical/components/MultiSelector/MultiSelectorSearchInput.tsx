import { CommandInput } from "@/components/ui/command";
import { X as RemoveIcon } from "lucide-react";
import { memo } from "react";
import { MultiSelectorSearchInputProps } from "./selectors";

const MultiSelectorSearchInput = memo(
  ({
    inputValue,
    isBlockingMobileKeyboard,
    setInputValue,
    inputRef,
    label,
    setOpen,
    commandListScrollArea,
  }: MultiSelectorSearchInputProps) => {
    return (
      <div
        className="dark:bg-accent flex items-center gap-1"
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        <CommandInput
          className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none placeholder:text-[14px] focus-visible:ring-0 focus-visible:ring-offset-0"
          enterKeyHint="search"
          readOnly={isBlockingMobileKeyboard}
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
          className="text-destructive mr-2 cursor-pointer bg-transparent!"
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
  },
);

MultiSelectorSearchInput.displayName = "MultiSelectorSearchInput";

export default MultiSelectorSearchInput;
