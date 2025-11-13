import { memo, RefObject, useCallback } from "react";
import {
  MultiSelectorContentProps,
  MultiSelectorListRef,
} from "../../constants/types";
import { Command } from "@/components/ui/command";

const useMultiSelectorKeyDown = (
  multiSelectorListRef: RefObject<MultiSelectorListRef | null>,
  inputRef: RefObject<HTMLInputElement | null>,
  open: boolean,
  setOpen: (open: boolean) => void
) => {
  return useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (e.key === "Escape") {
        if (multiSelectorListRef.current?.inputValue) {
          multiSelectorListRef.current?.setInputValue("");
          return;
        }
        inputRef.current?.blur();
        if (open) {
          setOpen(false);
        }
      }
    },
    [inputRef, multiSelectorListRef, open, setOpen]
  );
};

const MultiSelectorContent = memo(
  ({
    children,
    inputRef,
    open,
    setOpen,
    multiSelectorListRef,
  }: MultiSelectorContentProps) => {
    const handleKeyDown = useMultiSelectorKeyDown(
      multiSelectorListRef,
      inputRef,
      open,
      setOpen
    );

    return (
      <Command
        shouldFilter={false}
        className="!h-max relative flex flex-col space-y-2 overflow-visible bg-transparent"
        onKeyDown={handleKeyDown}
      >
        {children}
      </Command>
    );
  }
);

MultiSelectorContent.displayName = "MultiSelectorContent";

export default MultiSelectorContent;
