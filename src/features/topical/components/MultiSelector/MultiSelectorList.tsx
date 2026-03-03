import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { fuzzySearch } from "../../lib/utils";
import MultiSelectorSearchInput from "./MultiSelectorSearchInput";
import { MultiSelectorListProps } from "./selectors";

const formatOptionLabel = ({ item, label }: { item: string; label: string }) => {
  if (label === "Season") {
    if (item === "Winter") {
      return "Winter - O/N";
    } else if (item === "Summer") {
      return "Summer - M/J";
    } else if (item === "Spring") {
      return "Spring - F/M";
    }
  }
  return item;
};

const MultiSelectorList = forwardRef(
  (
    {
      selectedValues,
      onValueChange,
      inputRef,
      label,
      allAvailableOptions,
      setOpen,
    }: MultiSelectorListProps,
    ref,
  ) => {
    const [inputValue, setInputValue] = useState("");

    useImperativeHandle(
      ref,
      () => ({
        setInputValue,
        inputValue,
      }),
      [inputValue],
    );
    const commandListScrollArea = useRef<HTMLDivElement | null>(null);

    const filteredAvailableOption = useMemo(() => {
      return allAvailableOptions.filter((item) => {
        return fuzzySearch(inputValue, item);
      });
    }, [allAvailableOptions, inputValue]);

    const filteredSelectedValue = useMemo(() => {
      return selectedValues.filter((item) => {
        return selectedValues.some((all) => all === item) && fuzzySearch(inputValue, item);
      });
    }, [inputValue, selectedValues]);

    const [isBlockingMobileKeyboard, setIsBlockingMobileKeyboard] = useState(false);

    const blockMobileKeyboardOpen = useCallback(() => {
      setIsBlockingMobileKeyboard(true);
      setTimeout(() => {
        setIsBlockingMobileKeyboard(false);
      }, 0);
    }, []);

    return (
      <div className="flex h-full flex-col gap-2">
        <MultiSelectorSearchInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          inputRef={inputRef}
          label={label}
          isBlockingMobileKeyboard={isBlockingMobileKeyboard}
          setOpen={setOpen}
          commandListScrollArea={commandListScrollArea}
        />

        <ScrollArea
          viewPortClassName="max-h-[50vh]"
          type="always"
          viewportRef={commandListScrollArea}
        >
          <CommandList
            className={cn(
              "dark:bg-acccent z-1000 flex h-full w-full flex-col gap-2 p-2",
              label === "Year" || label === "Season",
            )}
          >
            <Collapsible>
              {!inputValue && (
                <CollapsibleTrigger
                  className="flex w-full cursor-pointer items-center justify-between gap-2 px-3"
                  title="Toggle selected"
                >
                  <h3
                    className={cn(
                      "text-xs font-medium",
                      filteredSelectedValue.length > 0 ? "text-logo-main" : "text-muted-foreground",
                    )}
                  >
                    {`${filteredSelectedValue.length} selected`}
                  </h3>
                  <ChevronsUpDown className="h-4 w-4" />
                </CollapsibleTrigger>
              )}
              <CommandGroup value={`${filteredSelectedValue.length} selected`}>
                <CollapsibleContent>
                  {filteredSelectedValue.length > 0 &&
                    !inputValue &&
                    filteredSelectedValue.map((item) => (
                      <CommandItem
                        className="flex cursor-pointer justify-start rounded-md px-2 py-1 transition-colors"
                        key={item}
                        onTouchStart={blockMobileKeyboardOpen}
                        onSelect={() => {
                          onValueChange(item);
                        }}
                      >
                        <Checkbox
                          className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main data-[state=checked]:text-white"
                          defaultChecked={true}
                        />
                        {formatOptionLabel({ item, label })}
                      </CommandItem>
                    ))}
                </CollapsibleContent>
              </CommandGroup>
              <CommandSeparator />

              <CommandGroup
                heading={
                  inputValue
                    ? "Search results"
                    : `${filteredAvailableOption?.length} available ${label.toLowerCase()}${
                        filteredAvailableOption?.length && filteredAvailableOption?.length > 1
                          ? "s"
                          : ""
                      }`
                }
              >
                {filteredAvailableOption?.map((item) => (
                  <CommandItem
                    className={cn(
                      "flex cursor-pointer justify-start rounded-md px-2 py-1 transition-colors",
                      selectedValues.includes(item) && "cursor-default opacity-50",
                    )}
                    key={item}
                    onTouchStart={blockMobileKeyboardOpen}
                    onSelect={() => {
                      onValueChange(item);
                    }}
                  >
                    <Checkbox
                      checked={selectedValues.includes(item)}
                      className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main data-[state=checked]:text-white"
                    />
                    {formatOptionLabel({ item, label })}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Collapsible>
            <CommandEmpty>
              <span className="text-muted-foreground">No results found</span>
            </CommandEmpty>
          </CommandList>
        </ScrollArea>
      </div>
    );
  },
);

MultiSelectorList.displayName = "MultiSelectorList";

export default MultiSelectorList;
