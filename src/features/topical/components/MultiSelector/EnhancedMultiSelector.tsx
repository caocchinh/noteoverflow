"use client";

import { ChevronsUpDown } from "lucide-react";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type {
  EnhancedMultiSelectorListProps,
  EnhancedMultiSelectorProps,
  EnhancedMultiSelectorSharedProps,
  MultiSelectorListRef,
} from "../../constants/types";
import MultiSelectorContent from "./MultiSelectorContent";
import MultiSelectorTrigger from "./MultiSelectorTrigger";
import MultiSelectorSearchInput from "./MultiSelectorSearchInput";
import {
  extractUniqueTopicCurriculumnSubdivisions,
  fuzzySearch,
} from "../../lib/utils";
import {
  MultiSelectorDesktoptUltilityButtons,
  MultiSelectorMobiletUltilityButtons,
} from "./MultiSelectUltilityButtons";
import MultiSelectorFilterNavigation from "./MultiSelectorFilterNavigation";

const EnhancedMultiSelector = memo(
  ({
    label,
    selectedValues,
    maxLength = undefined,
    onValuesChange: onValueChange,
    allAvailableOptions,
    currentFilter,
    setCurrentFilter,
  }: EnhancedMultiSelectorProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isMobileDevice = useIsMobile();
    if (
      maxLength !== undefined &&
      typeof maxLength == "number" &&
      maxLength <= 0
    ) {
      throw new Error("maxLength must be greater than 0");
    }

    const allFilterOptions = useMemo(() => {
      return extractUniqueTopicCurriculumnSubdivisions(allAvailableOptions);
    }, [allAvailableOptions]);

    useEffect(() => {
      if (!currentFilter) {
        setCurrentFilter(allFilterOptions[0]);
      }
    }, [allFilterOptions, currentFilter, setCurrentFilter]);

    const allValue = useMemo(() => {
      return allAvailableOptions.map((item) => item.value);
    }, [allAvailableOptions]);

    const onValueChangeHandler = useCallback(
      (val: string | string[]) => {
        if (typeof val === "string") {
          if (selectedValues.includes(val)) {
            onValueChange(selectedValues.filter((item) => item !== val));
          } else {
            onValueChange([...selectedValues, val]);
          }
        } else {
          // val is string[], directly set the value
          onValueChange(val);
        }
      },
      [onValueChange, selectedValues]
    );

    const onSelectAll = useCallback(() => {
      const allValueUnderFilterThatIsNotSelectedYet = allAvailableOptions
        .filter((item) => {
          return (
            item.curriculumnSubdivision.some(
              (item) => item === currentFilter
            ) && !selectedValues.includes(item.value)
          );
        })
        .map((item) => item.value);
      onValueChange([
        ...selectedValues,
        ...allValueUnderFilterThatIsNotSelectedYet,
      ]);
    }, [allAvailableOptions, currentFilter, onValueChange, selectedValues]);

    const onDeleteAll = useCallback(() => {
      const valuesToRemove = selectedValues.filter((selectedValue) =>
        allAvailableOptions.some(
          (option) =>
            option.value === selectedValue &&
            option.curriculumnSubdivision.some((sub) => sub === currentFilter)
        )
      );

      onValueChange(
        selectedValues.filter((value) => !valuesToRemove.includes(value))
      );
    }, [allAvailableOptions, currentFilter, onValueChange, selectedValues]);

    return (
      <>
        {isMobileDevice ? (
          <EnhancedMobileMultiSelector
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
            selectedValues={selectedValues}
            onValueChange={onValueChangeHandler}
            allAvailableOptions={allAvailableOptions}
            label={label}
            allValue={allValue}
            allFilterOptions={allFilterOptions}
            maxLength={maxLength}
            inputRef={inputRef}
            onDeleteAll={onDeleteAll}
            onSelectAll={onSelectAll}
          />
        ) : (
          <EnhancedDesktopMultiSelector
            selectedValues={selectedValues}
            onValueChange={onValueChangeHandler}
            allAvailableOptions={allAvailableOptions}
            label={label}
            allValue={allValue}
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
            allFilterOptions={allFilterOptions}
            maxLength={maxLength}
            inputRef={inputRef}
            onDeleteAll={onDeleteAll}
            onSelectAll={onSelectAll}
          />
        )}
      </>
    );
  }
);

EnhancedMultiSelector.displayName = "EnhancedMultiSelector";

export default EnhancedMultiSelector;

// Shared error message component
const MaxLengthErrorMessage = memo(
  ({ maxLength, label }: { maxLength: number; label: string }) => (
    <h3 className="w-max font-medium text-sm text-destructive mt-1">
      You can only select up to {maxLength}{" "}
      {label.toLowerCase() + (label.toLowerCase() === "topic" ? "s" : "")}
    </h3>
  )
);

MaxLengthErrorMessage.displayName = "MaxLengthErrorMessage";

const EnhancedMobileMultiSelector = memo(
  ({
    selectedValues,
    onValueChange,
    allAvailableOptions,
    label,
    setCurrentFilter,
    currentFilter,
    allValue,
    allFilterOptions,
    maxLength,
    inputRef,
    onDeleteAll,
    onSelectAll,
  }: EnhancedMultiSelectorSharedProps) => {
    const multiSelectorListRef = useRef<MultiSelectorListRef | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    return (
      <>
        <MultiSelectorTrigger
          selectedValues={selectedValues}
          onValueChange={onValueChange}
          open={open}
          setOpen={setOpen}
          allAvailableOptions={allValue}
          label={label}
          setInputValue={multiSelectorListRef.current?.setInputValue}
          maxLength={maxLength}
          showDeleteAll={true}
          showSelectAll={false}
        />
        {maxLength && selectedValues.length > maxLength && (
          <MaxLengthErrorMessage maxLength={maxLength} label={label} />
        )}
        <Drawer onOpenChange={setOpen} open={open} autoFocus={false}>
          <DrawerContent
            autoFocus={false}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            className="z-[100007] h-[95vh] max-h-[95vh] dark:bg-accent"
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Select</DrawerTitle>
              <DrawerDescription />
              Select {label}
            </DrawerHeader>
            <div className="w-full pt-2 pb-4">
              <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-black pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
            </div>
            {maxLength && selectedValues.length > maxLength && (
              <h3 className="w-max font-medium text-sm text-destructive mx-auto -mt-1">
                You can only select up to {maxLength}{" "}
                {label.toLowerCase() +
                  (label.toLowerCase() === "topic" ? "s" : "")}
              </h3>
            )}
            <MultiSelectorMobiletUltilityButtons
              maxLength={maxLength}
              setOpen={setOpen}
              onDeleteAll={onDeleteAll}
              onSelectAll={onSelectAll}
            />
            <MultiSelectorContent
              open={open}
              setOpen={setOpen}
              inputRef={inputRef}
              multiSelectorListRef={multiSelectorListRef}
            >
              <EnhancedMultiSelectorList
                ref={multiSelectorListRef}
                selectedValues={selectedValues}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
                onValueChange={onValueChange}
                inputRef={inputRef}
                allFilterOptions={allFilterOptions}
                label={label}
                allAvailableOptions={allAvailableOptions}
                setOpen={setOpen}
                maxLength={maxLength}
              />
            </MultiSelectorContent>
          </DrawerContent>
        </Drawer>
      </>
    );
  }
);

EnhancedMobileMultiSelector.displayName = "EnhancedMobileMultiSelector";

const EnhancedDesktopMultiSelector = memo(
  ({
    selectedValues,
    onValueChange,
    allAvailableOptions,
    setCurrentFilter,
    label,
    allFilterOptions,
    currentFilter,
    allValue,
    maxLength,
    inputRef,
    onDeleteAll,
    onSelectAll,
  }: EnhancedMultiSelectorSharedProps) => {
    const multiSelectorListRef = useRef<MultiSelectorListRef | null>(null);
    const popoverTriggerRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    return (
      <Popover modal={false} open={open}>
        <PopoverTrigger asChild>
          <div ref={popoverTriggerRef}>
            <MultiSelectorTrigger
              selectedValues={selectedValues}
              onValueChange={onValueChange}
              open={open}
              setOpen={setOpen}
              allAvailableOptions={allValue}
              label={label}
              setInputValue={multiSelectorListRef.current?.setInputValue}
              maxLength={maxLength}
              showDeleteAll={true}
              showSelectAll={false}
            />
            {maxLength && selectedValues.length > maxLength && (
              <MaxLengthErrorMessage maxLength={maxLength} label={label} />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          autoFocus={false}
          className="z-[100007] m-0 border-1 p-0 shadow-none dark:bg-accent"
          side="right"
          onInteractOutside={(e) => {
            if (popoverTriggerRef?.current?.contains(e.target as Node)) {
              return;
            }
            multiSelectorListRef.current?.setInputValue("");
            setOpen(false);
          }}
        >
          <MultiSelectorContent
            open={open}
            setOpen={setOpen}
            inputRef={inputRef}
            multiSelectorListRef={multiSelectorListRef}
          >
            <EnhancedMultiSelectorList
              ref={multiSelectorListRef}
              selectedValues={selectedValues}
              onValueChange={onValueChange}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
              allFilterOptions={allFilterOptions}
              inputRef={inputRef}
              label={label}
              allAvailableOptions={allAvailableOptions}
              setOpen={setOpen}
              maxLength={maxLength}
            />
          </MultiSelectorContent>
          <MultiSelectorDesktoptUltilityButtons
            maxLength={maxLength}
            onDeleteAll={onDeleteAll}
            onSelectAll={onSelectAll}
          />
          <div className="m-2">
            <Button
              className="w-full cursor-pointer h-[30px]"
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

EnhancedDesktopMultiSelector.displayName = "EnhancedDesktopMultiSelector";

const EnhancedMultiSelectorList = forwardRef(
  (
    {
      selectedValues,
      onValueChange,
      inputRef,
      allFilterOptions,
      label,
      allAvailableOptions,
      setCurrentFilter,
      currentFilter,
      setOpen,
    }: EnhancedMultiSelectorListProps,
    ref
  ) => {
    const temporaryFix = (item: string) => {
      if (label === "Season") {
        if (item === "Winter") {
          return "Winter - O/N";
        } else if (item === "Summer") {
          return "Summer - M/J";
        } else if (item === "Spring") {
          return "Spring - F/M";
        }
      }
    };
    const [inputValue, setInputValue] = useState("");
    useImperativeHandle(
      ref,
      () => ({
        setInputValue,
        inputValue,
      }),
      [inputValue]
    );
    const commandListScrollArea = useRef<HTMLDivElement | null>(null);

    const filteredUpToDateAvailableOption = useMemo(() => {
      return allAvailableOptions
        .filter((item) => {
          return (
            item.curriculumnSubdivision.some(
              (item) => item === currentFilter
            ) &&
            fuzzySearch(inputValue, item.value) &&
            item.isUpToDate
          );
        })
        .map((item) => item.value);
    }, [allAvailableOptions, currentFilter, inputValue]);

    const filteredOutdatedAvailableOption = useMemo(() => {
      return allAvailableOptions
        .filter((item) => {
          return (
            item.curriculumnSubdivision.some(
              (item) => item === currentFilter
            ) &&
            fuzzySearch(inputValue, item.value) &&
            !item.isUpToDate
          );
        })
        .map((item) => item.value);
    }, [allAvailableOptions, currentFilter, inputValue]);

    const filteredSelectedValue = useMemo(() => {
      return selectedValues.filter((item) => {
        return (
          [
            ...filteredOutdatedAvailableOption,
            ...filteredUpToDateAvailableOption,
          ].some((all) => all === item) && fuzzySearch(inputValue, item)
        );
      });
    }, [
      filteredOutdatedAvailableOption,
      filteredUpToDateAvailableOption,
      inputValue,
      selectedValues,
    ]);

    const totalAmountOfItems =
      filteredUpToDateAvailableOption.length +
      filteredOutdatedAvailableOption.length;

    return (
      <div className="flex h-full flex-col gap-2">
        <MultiSelectorSearchInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          inputRef={inputRef}
          label={label}
          setOpen={setOpen}
          commandListScrollArea={commandListScrollArea}
        />
        {currentFilter && (
          <MultiSelectorFilterNavigation
            items={allFilterOptions}
            currentItem={currentFilter}
            setItems={setCurrentFilter}
          />
        )}

        <ScrollArea
          viewPortClassName="max-h-[50vh]"
          type="always"
          viewportRef={commandListScrollArea}
        >
          <CommandList
            className={cn(
              "z-[1000] flex h-full w-full flex-col gap-2 dark:bg-acccent p-2",
              label === "Year" || label === "Season"
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
                      "font-medium text-xs",
                      filteredSelectedValue.length > 0
                        ? "text-logo-main"
                        : "text-muted-foreground"
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
                        className="flex cursor-pointer justify-start rounded-md px-2 py-1 transition-colors "
                        key={item}
                        onSelect={() => {
                          onValueChange(item);
                        }}
                      >
                        <Checkbox
                          className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main"
                          defaultChecked={true}
                        />
                        {temporaryFix(item) ?? item}

                        <span className="hidden">skibidi toilet</span>
                      </CommandItem>
                    ))}
                </CollapsibleContent>
              </CommandGroup>
              <CommandSeparator />

              <CommandGroup
                heading={
                  inputValue
                    ? "Search results"
                    : `${totalAmountOfItems} available ${label.toLowerCase()}${
                        totalAmountOfItems && totalAmountOfItems > 1 ? "s" : ""
                      }`
                }
                className={cn(inputValue && "-mt-4")}
              >
                {filteredUpToDateAvailableOption.map((item) => (
                  <CommandItem
                    className={cn(
                      "flex cursor-pointer justify-start rounded-md px-2 py-1 transition-colors",
                      selectedValues.includes(item) &&
                        "cursor-default opacity-50"
                    )}
                    key={item}
                    onSelect={() => {
                      onValueChange(item);
                    }}
                  >
                    <Checkbox
                      checked={selectedValues.includes(item)}
                      className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main "
                    />
                    {temporaryFix(item) ?? item}
                  </CommandItem>
                ))}
              </CommandGroup>

              {filteredOutdatedAvailableOption.length > 0 && (
                <>
                  <CommandSeparator />

                  <CommandGroup
                    heading="Old syllabus"
                    className={cn(inputValue && "-mt-4")}
                  >
                    {filteredOutdatedAvailableOption.map((item) => (
                      <CommandItem
                        className={cn(
                          "flex cursor-pointer justify-start rounded-md px-2 py-1 transition-colors",
                          selectedValues.includes(item) &&
                            "cursor-default opacity-50"
                        )}
                        key={item}
                        onSelect={() => {
                          onValueChange(item);
                        }}
                      >
                        <Checkbox
                          checked={selectedValues.includes(item)}
                          className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main "
                        />
                        {temporaryFix(item) ?? item}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </Collapsible>
            <CommandEmpty>
              <span className="text-muted-foreground">No results found</span>
            </CommandEmpty>
          </CommandList>
        </ScrollArea>
      </div>
    );
  }
);

EnhancedMultiSelectorList.displayName = "EnhancedMultiSelectorList";
