"use client";

import {
  ChevronsUpDown,
  X as RemoveIcon,
  Sparkles,
  Trash2,
} from "lucide-react";
import React, {
  Dispatch,
  forwardRef,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type {
  MultiSelectorListRef,
  MultiSelectorProps,
  MultiSelectorSharedProps,
} from "../constants/types";

const EnhancedMultiSelect = memo(
  ({
    label,
    prerequisite,
    selectedValues,
    maxLength = undefined,
    onValuesChange: onValueChange,
    allAvailableOptions,
  }: MultiSelectorProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const commandListRef = useRef<HTMLDivElement | null>(null);
    const isMobileDevice = useIsMobile();
    if (
      maxLength !== undefined &&
      typeof maxLength == "number" &&
      maxLength <= 0
    ) {
      throw new Error("maxLength must be greater than 0");
    }

    const onValueChangeHandler = useCallback(
      (val: string | string[], option?: "selectAll" | "removeAll") => {
        if (option === "selectAll" && allAvailableOptions) {
          onValueChange(allAvailableOptions);
        } else if (option === "removeAll") {
          onValueChange([]);
        } else if (typeof val === "string") {
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
      [selectedValues, allAvailableOptions, onValueChange]
    );

    const popoverTriggerRef = useRef<HTMLDivElement | null>(null);

    return (
      <>
        {isMobileDevice ? (
          <MobileMultiSelector
            selectedValues={selectedValues}
            onValueChange={onValueChangeHandler}
            open={open}
            setOpen={setOpen}
            allAvailableOptions={allAvailableOptions}
            label={label}
            maxLength={maxLength}
            prerequisite={prerequisite}
            commandListRef={commandListRef}
            inputRef={inputRef}
          />
        ) : (
          <DesktopMultiSelector
            selectedValues={selectedValues}
            onValueChange={onValueChangeHandler}
            open={open}
            setOpen={setOpen}
            allAvailableOptions={allAvailableOptions}
            label={label}
            maxLength={maxLength}
            prerequisite={prerequisite}
            commandListRef={commandListRef}
            inputRef={inputRef}
            popoverTriggerRef={popoverTriggerRef}
          />
        )}
      </>
    );
  }
);

EnhancedMultiSelect.displayName = "EnhancedMultiSelect";

export default EnhancedMultiSelect;

const useMultiSelectorKeyDown = (
  multiSelectorListRef: React.RefObject<MultiSelectorListRef | null>,
  inputRef: React.RefObject<HTMLInputElement | null>,
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

const MultiSelectorContent = memo(
  ({
    selectedValues,
    onValueChange,
    open,
    setOpen,
    allAvailableOptions,
    label,
    maxLength,
    prerequisite,
    commandListRef,
    inputRef,
    multiSelectorListRef,
  }: MultiSelectorSharedProps & {
    multiSelectorListRef: React.RefObject<MultiSelectorListRef | null>;
  }) => {
    const handleKeyDown = useMultiSelectorKeyDown(
      multiSelectorListRef,
      inputRef,
      open,
      setOpen
    );

    return (
      <Command
        className="!h-max relative flex flex-col space-y-2 overflow-visible bg-transparent"
        onKeyDown={handleKeyDown}
      >
        <MultiSelectorList
          ref={multiSelectorListRef}
          selectedValues={selectedValues}
          onValueChange={onValueChange}
          commandListRef={commandListRef}
          inputRef={inputRef}
          label={label}
          allAvailableOptions={allAvailableOptions}
          prerequisite={prerequisite}
          setOpen={setOpen}
          maxLength={maxLength}
        />
      </Command>
    );
  }
);

MultiSelectorContent.displayName = "MultiSelectorContent";

const MobileMultiSelector = memo(
  ({
    selectedValues,
    onValueChange,
    open,
    setOpen,
    allAvailableOptions,
    label,
    maxLength,
    prerequisite,
    commandListRef,
    inputRef,
  }: Omit<MultiSelectorSharedProps, "popoverTriggerRef">) => {
    const multiSelectorListRef = useRef<MultiSelectorListRef | null>(null);

    return (
      <>
        <MultiSelectorTrigger
          selectedValues={selectedValues}
          onValueChange={onValueChange}
          open={open}
          setOpen={setOpen}
          allAvailableOptions={allAvailableOptions}
          label={label}
          setInputValue={multiSelectorListRef.current?.setInputValue}
          maxLength={maxLength}
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
            <div className="flex flex-row gap-3 p-2 ">
              <Button
                className="flex-1/3 cursor-pointer"
                onClick={() => {
                  onValueChange([]);
                }}
                variant="destructive"
              >
                Remove all
                <Trash2 className="h-4 w-4" />
              </Button>
              {!maxLength && (
                <Button
                  className="flex-1/3 cursor-pointer"
                  onClick={() => {
                    onValueChange(allAvailableOptions ?? []);
                  }}
                >
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
            <MultiSelectorContent
              selectedValues={selectedValues}
              onValueChange={onValueChange}
              open={open}
              setOpen={setOpen}
              allAvailableOptions={allAvailableOptions}
              label={label}
              maxLength={maxLength}
              prerequisite={prerequisite}
              commandListRef={commandListRef}
              inputRef={inputRef}
              multiSelectorListRef={multiSelectorListRef}
            />
          </DrawerContent>
        </Drawer>
      </>
    );
  }
);

MobileMultiSelector.displayName = "MobileMultiSelector";

const DesktopMultiSelector = memo(
  ({
    selectedValues,
    onValueChange,
    open,
    setOpen,
    allAvailableOptions,
    label,
    maxLength,
    prerequisite,
    commandListRef,
    inputRef,
    popoverTriggerRef,
  }: MultiSelectorSharedProps) => {
    const multiSelectorListRef = useRef<MultiSelectorListRef | null>(null);

    return (
      <Popover modal={false} open={open}>
        <PopoverTrigger asChild>
          <div ref={popoverTriggerRef}>
            <MultiSelectorTrigger
              selectedValues={selectedValues}
              onValueChange={onValueChange}
              open={open}
              setOpen={setOpen}
              allAvailableOptions={allAvailableOptions}
              label={label}
              setInputValue={multiSelectorListRef.current?.setInputValue}
              maxLength={maxLength}
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
            selectedValues={selectedValues}
            onValueChange={onValueChange}
            open={open}
            setOpen={setOpen}
            allAvailableOptions={allAvailableOptions}
            label={label}
            maxLength={maxLength}
            prerequisite={prerequisite}
            commandListRef={commandListRef}
            inputRef={inputRef}
            multiSelectorListRef={multiSelectorListRef}
            popoverTriggerRef={popoverTriggerRef}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

DesktopMultiSelector.displayName = "DesktopMultiSelector";

const MultiSelectorTrigger = memo(
  ({
    selectedValues,
    onValueChange,
    open,
    setOpen,
    allAvailableOptions,
    label,
    setInputValue,
    maxLength,
  }: {
    selectedValues: string[];
    onValueChange: (
      val: string | string[],
      option?: "selectAll" | "removeAll"
    ) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    allAvailableOptions: string[];
    label: string;
    setInputValue: Dispatch<SetStateAction<string>> | undefined;
    maxLength: number | undefined;
  }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);
    const [isClickingUltility, setIsClickingUltility] =
      useState<boolean>(false);
    const [paddingRight, setPaddingRight] = useState<string>("initial");

    const mousePreventDefault = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    useEffect(() => {
      if (contentRef.current) {
        const containerHeight = contentRef.current.clientHeight;
        const height = Math.min(containerHeight || 0, 85);
        if (height >= 85) {
          setPaddingRight("10px");
        } else {
          setPaddingRight("initial");
        }
        setContentHeight(height);
      }
    }, [selectedValues]);

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

    return (
      <div
        className={cn(
          "relative mb-0 flex w-[300px] flex-col flex-wrap gap-1 rounded-lg bg-background p-1 py-2 ring-1 ring-muted dark:bg-secondary",
          {
            "opacity-50": !allAvailableOptions,
          },
          !allAvailableOptions && "pointer-events-none "
        )}
      >
        <div className="flex items-center justify-center gap-2 px-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-7 w-7 cursor-pointer transition-colors duration-100 ease-in-out hover:text-destructive"
                onClick={() => {
                  onValueChange([], "removeAll");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && allAvailableOptions) {
                    onValueChange([], "removeAll");
                  }
                }}
                onMouseDown={(e) => {
                  mousePreventDefault(e);
                  setIsClickingUltility(true);
                }}
                onMouseUp={() => {
                  setTimeout(() => {
                    setIsClickingUltility(false);
                  }, 0);
                }}
                variant="outline"
              >
                <Trash2 className="h-4 w-4 " />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="z-[100000000000]">
              Remove all
            </TooltipContent>
          </Tooltip>
          {!maxLength && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className=" h-7 w-7 cursor-pointer transition-colors duration-100 ease-in-out hover:text-yellow-500"
                  onClick={() => {
                    onValueChange(allAvailableOptions ?? [], "selectAll");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && allAvailableOptions) {
                      onValueChange(allAvailableOptions ?? [], "selectAll");
                    }
                  }}
                  onMouseDown={(e) => {
                    mousePreventDefault(e);
                    setIsClickingUltility(true);
                  }}
                  onMouseUp={() => {
                    setTimeout(() => {
                      setIsClickingUltility(false);
                    }, 0);
                  }}
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 " />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[100000000000]">
                Select all
              </TooltipContent>
            </Tooltip>
          )}
          <Button
            className="h-6 flex-1 cursor-pointer text-xs"
            onClick={() => {
              if (!isClickingUltility) {
                setInputValue?.("");
                setOpen(!open);
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !isClickingUltility &&
                allAvailableOptions
              ) {
                setInputValue?.("");
                setOpen(!open);
              }
            }}
            onMouseDown={mousePreventDefault}
            variant="default"
          >
            {selectedValues.length === 0
              ? `Select ${label.toLowerCase()}`
              : `${selectedValues.length} ${label.toLowerCase()}${
                  selectedValues.length > 1 ? "s" : ""
                } selected`}
          </Button>
        </div>

        {selectedValues.length > 0 && (
          <ScrollArea
            className="w-full overflow-hidden"
            onClick={() => {
              if (!isClickingUltility) {
                setInputValue?.("");
                setOpen(!open);
              }
            }}
            style={{ height: `${contentHeight}px`, paddingRight }}
          >
            <div className="flex w-full flex-wrap gap-2 p-1" ref={contentRef}>
              {selectedValues.map((item) => (
                <Badge
                  className={cn(
                    "wrap-anywhere dark:!border-white/25 flex items-center gap-1 whitespace-pre-wrap rounded-xl px-1 text-left"
                  )}
                  key={item}
                  variant={"secondary"}
                >
                  <span className="text-xs">{temporaryFix(item) ?? item}</span>
                  <button
                    aria-label={`Remove ${item} option`}
                    aria-roledescription="button to remove option"
                    onClick={() => {
                      onValueChange(item);

                      if (selectedValues.length === 1) {
                        setContentHeight(0);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && allAvailableOptions) {
                        onValueChange(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      mousePreventDefault(e);
                      setIsClickingUltility(true);
                    }}
                    onMouseUp={() => {
                      setTimeout(() => {
                        setIsClickingUltility(false);
                      }, 0);
                    }}
                    type="button"
                  >
                    <span className="sr-only">Remove {item} option</span>
                    <RemoveIcon className="h-4 w-4 cursor-pointer transition-colors duration-100 ease-in-out hover:stroke-destructive" />
                  </button>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }
);

MultiSelectorTrigger.displayName = "MultiSelectorTrigger";

const MultiSelectorSearchInput = memo(
  ({
    inputValue,
    setInputValue,
    inputRef,
    label,
    allAvailableOptions,
    prerequisite,
    setOpen,
    commandListRef,
  }: {
    inputValue: string;
    setInputValue: (value: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    label: string;
    allAvailableOptions: string[] | undefined;
    prerequisite: string;
    setOpen: (open: boolean) => void;
    commandListRef: React.RefObject<HTMLDivElement | null>;
  }) => {
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
                commandListRef.current?.scrollTo({
                  top: 0,
                  behavior: "instant",
                });
              }, 100);
            }
          }}
          placeholder={
            allAvailableOptions
              ? `Search ${label.toLowerCase()}`
              : `Select ${prerequisite.toLowerCase()} first`
          }
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

const MultiSelectorList = forwardRef(
  (
    {
      selectedValues,
      onValueChange,
      commandListRef,
      inputRef,
      label,
      allAvailableOptions,
      prerequisite,
      setOpen,
      maxLength,
    }: {
      selectedValues: string[];
      onValueChange: (
        val: string | string[],
        option?: "selectAll" | "removeAll"
      ) => void;
      commandListRef: React.RefObject<HTMLDivElement | null>;
      inputRef: React.RefObject<HTMLInputElement | null>;
      label: string;
      allAvailableOptions: string[];
      prerequisite: string;
      setOpen: (open: boolean) => void;
      maxLength: number | undefined;
    },
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

    return (
      <div className="flex h-full flex-col gap-2">
        <MultiSelectorSearchInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          inputRef={inputRef}
          label={label}
          allAvailableOptions={allAvailableOptions}
          prerequisite={prerequisite}
          setOpen={setOpen}
          commandListRef={commandListRef}
        />

        <ScrollArea viewPortClassName="max-h-[50vh]" type="always">
          <CommandList
            className={cn(
              "z-[1000] flex h-full w-full flex-col gap-2 dark:bg-acccent p-2",
              label === "Year" || label === "Season"
            )}
            ref={commandListRef}
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
                      selectedValues.length > 0
                        ? "text-logo-main"
                        : "text-muted-foreground"
                    )}
                  >
                    {`${selectedValues.length} selected`}
                  </h3>
                  <ChevronsUpDown className="h-4 w-4" />
                </CollapsibleTrigger>
              )}
              <CommandGroup value={`${selectedValues.length} selected`}>
                <CollapsibleContent>
                  {selectedValues.length > 0 &&
                    !inputValue &&
                    selectedValues.map((item) => (
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
                    : `${
                        allAvailableOptions?.length
                      } available ${label.toLowerCase()}${
                        allAvailableOptions?.length &&
                        allAvailableOptions?.length > 1
                          ? "s"
                          : ""
                      }`
                }
              >
                {allAvailableOptions?.map((item) => (
                  <CommandItem
                    className={cn(
                      "flex cursor-pointer justify-start rounded-md px-2 py-1 transition-colors",
                      selectedValues.includes(item) &&
                        "cursor-default opacity-50"
                    )}
                    key={item}
                    onSelect={() => {
                      onValueChange(item);
                      setTimeout(() => {
                        if (inputValue) {
                          commandListRef.current?.scrollTo({
                            top: 0,
                            behavior: "instant",
                          });
                        }
                      }, 100);
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
            </Collapsible>
            <CommandEmpty>
              <span className="text-muted-foreground">No results found</span>
            </CommandEmpty>
          </CommandList>
        </ScrollArea>
        <div className="flex flex-row gap-2 m-2">
          {!maxLength && (
            <Button
              className="cursor-pointer flex-1/2 md:flex hidden items-center justify-center"
              onClick={() => {
                onValueChange(allAvailableOptions ?? [], "selectAll");
              }}
            >
              Select all
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
          <Button
            className="cursor-pointer flex-1/2 md:flex hidden items-center justify-center"
            onClick={() => {
              onValueChange(selectedValues, "removeAll");
            }}
            variant="destructive"
          >
            Remove all
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

MultiSelectorList.displayName = "MultiSelectorList";
