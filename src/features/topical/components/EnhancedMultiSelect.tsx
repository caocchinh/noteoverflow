"use client";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandItem,
  CommandEmpty,
  CommandList,
  CommandSeparator,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  X as RemoveIcon,
  Trash2,
  Sparkles,
  ChevronsUpDown,
} from "lucide-react";
import React, {
  KeyboardEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MultiSelectorProps,
  MultiSelectContextProps,
} from "../constants/types";
import { useIsMobile } from "../hooks/useIsMobile";

const MultiSelectContext = createContext<MultiSelectContextProps | null>(null);

const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error("useMultiSelect must be used within MultiSelectProvider");
  }
  return context;
};

export default function EnhancedMultiSelect({
  label,
  prerequisite,
  values: value,
  onValuesChange: onValueChange,
  loop = true,
  dir,
  data,
  ...props
}: MultiSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isValueSelected, setIsValueSelected] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isClickingScrollArea, setIsClickingScrollArea] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const commandListRef = useRef<HTMLDivElement | null>(null);
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);
  const [isCommandItemInteraction, setIsCommandItemInteraction] =
    useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const isMobileDevice = useIsMobile();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const shouldOpenDrawer = typeof window !== "undefined" && isMobileDevice;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        open
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const onValueChangeHandler = useCallback(
    (val: string) => {
      if (value.includes(val)) {
        onValueChange(value.filter((item) => item !== val));
      } else {
        onValueChange([...value, val]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  const removeAllValues = useCallback(() => {
    onValueChange([]);
  }, [onValueChange]);

  const selectAllValues = useCallback(() => {
    if (data) {
      onValueChange(data);
    }
  }, [data, onValueChange]);

  const handleSelect = React.useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      e.preventDefault();
      const target = e.currentTarget;
      const selection = target.value.substring(
        target.selectionStart ?? 0,
        target.selectionEnd ?? 0
      );

      setSelectedValue(selection);
      setIsValueSelected(selection === inputValue);
    },
    [inputValue]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const target = inputRef.current;

      if (!target) return;
      if (commandListRef.current) {
        commandListRef.current.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }

      const moveNext = () => {
        const nextIndex = activeIndex + 1;
        setActiveIndex(
          nextIndex > value.length - 1 ? (loop ? 0 : -1) : nextIndex
        );
      };

      const movePrev = () => {
        const prevIndex = activeIndex - 1;
        setActiveIndex(prevIndex < 0 ? value.length - 1 : prevIndex);
      };

      const moveCurrent = () => {
        const newIndex =
          activeIndex - 1 <= 0
            ? value.length - 1 === 0
              ? -1
              : 0
            : activeIndex - 1;
        setActiveIndex(newIndex);
      };

      switch (e.key) {
        case "ArrowLeft":
          if (dir === "rtl") {
            if (value.length > 0 && (activeIndex !== -1 || loop)) {
              moveNext();
            }
          } else {
            if (value.length > 0 && target.selectionStart === 0) {
              movePrev();
            }
          }
          break;

        case "ArrowRight":
          if (dir === "rtl") {
            if (value.length > 0 && target.selectionStart === 0) {
              movePrev();
            }
          } else {
            if (value.length > 0 && (activeIndex !== -1 || loop)) {
              moveNext();
            }
          }
          break;

        case "Backspace":
        case "Delete":
          if (value.length > 0) {
            if (activeIndex !== -1 && activeIndex < value.length) {
              onValueChangeHandler(value[activeIndex]);
              moveCurrent();
            } else {
              if (target.selectionStart === 0) {
                if (selectedValue === inputValue || isValueSelected) {
                  onValueChangeHandler(value[value.length - 1]);
                }
              }
            }
          }
          break;

        case "Enter":
          setOpen(true);
          if (commandListRef.current) {
            commandListRef.current.scrollTo({
              top: 0,
              behavior: "instant",
            });
          }
          break;

        case "Escape":
          setInputValue("");
          inputRef.current?.blur();
          if (activeIndex !== -1) {
            setActiveIndex(-1);
          } else if (open) {
            setOpen(false);
          }
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, inputValue, activeIndex, loop, setOpen]
  );

  return (
    <MultiSelectContext.Provider
      value={{
        value,
        onValueChange: onValueChangeHandler,
        open,
        setOpen,
        inputValue,
        setInputValue,
        activeIndex,
        setActiveIndex,
        inputRef,
        handleSelect,
        removeAllValues,
        scrollAreaRef,
        isClickingScrollArea,
        setIsClickingScrollArea,
        commandListRef,
        selectAllValues,
        isCommandItemInteraction,
        setIsCommandItemInteraction,
        isMobileKeyboardOpen,
        setIsMobileKeyboardOpen,
        isDrawerOpen,
        setIsDrawerOpen,
        allAvailableOptions: data,
        shouldOpenDrawer,
        label,
        prerequisite,
        isCollapsibleOpen,
        setIsCollapsibleOpen,
      }}
    >
      <Command
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className={cn(
          "overflow-visible bg-transparent  flex flex-col space-y-2 relative !h-max"
        )}
        dir={dir}
        {...props}
      >
        <Popover open={open}>
          <PopoverTrigger>
            <MultiSelectorTrigger />
          </PopoverTrigger>
          <PopoverContent
            className="p-0 m-0 border-none shadow-none"
            side="right"
            align="center"
          >
            <MultiSelectorList />
          </PopoverContent>
        </Popover>
      </Command>
    </MultiSelectContext.Provider>
  );
}

//       {isDrawerOpen && (
//         <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
//           <DrawerContent className="h-[70vh] flex flex-col items-start justify-start">
//             <div className="flex items-center gap-2 p-4 w-full">
//               <Search className="h-4 w-4" />
//               <MultiSelectorInput
//                 className="flex-1 p-4 border border-white"
//                 placeholder="Search"
//               />
//             </div>
//             {children}
//           </DrawerContent>
//         </Drawer>
//       )}

const MultiSelectorTrigger = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    value,
    onValueChange,
    activeIndex,
    open,
    removeAllValues,
    setOpen,
    scrollAreaRef,
    setIsClickingScrollArea,
    selectAllValues,
    allAvailableOptions,
    label,
  } = useMultiSelect();
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isClickingRemove, setIsClickingRemove] = useState<boolean>(false);
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
  }, [value]);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 !m-0",
        !allAvailableOptions && "pointer-events-none "
      )}
    >
      <Label>{label}</Label>
      <div
        className={cn(
          "flex flex-wrap gap-1 w-[300px] p-1 py-2 ring-1 ring-muted mb-0 rounded-lg bg-background relative",
          {
            "ring-1 focus-within:ring-ring": activeIndex === -1,
            "opacity-50": !allAvailableOptions,
          }
        )}
      >
        <div className="flex items-center justify-center gap-2 px-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className=" cursor-pointer"
                title="Select all"
                onMouseDown={mousePreventDefault}
                onClick={selectAllValues}
              >
                <Sparkles className="h-4 w-4 hover:stroke-yellow-500 transition-colors duration-100 ease-in-out" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Select all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className=" cursor-pointer"
                title="Remove all"
                onMouseDown={mousePreventDefault}
                onClick={() => {
                  removeAllValues();
                  setContentHeight(0);
                }}
              >
                <Trash2 className="h-4 w-4 hover:stroke-destructive transition-colors duration-100 ease-in-out" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Remove all</TooltipContent>
          </Tooltip>
        </div>

        {value.length > 0 && (
          <ScrollArea
            ref={scrollAreaRef}
            className="w-full overflow-hidden"
            style={{ height: `${contentHeight}px`, paddingRight: paddingRight }}
            onMouseDown={(e) => {
              mousePreventDefault(e);
              setIsClickingScrollArea(true);
            }}
            onMouseUp={() => {
              setIsClickingScrollArea(false);
            }}
            onClick={() => {
              if (!open && !isClickingRemove) {
                setOpen(true);
              }
            }}
          >
            <div className="flex flex-wrap gap-2 p-1 w-full" ref={contentRef}>
              {value.map((item, index) => (
                <Badge
                  key={item}
                  className={cn(
                    "px-1 rounded-xl text-left flex items-center gap-1 whitespace-pre-wrap wrap-anywhere",
                    activeIndex === index && "ring-2 ring-muted-foreground "
                  )}
                  variant={"secondary"}
                >
                  <span className="text-xs">{item}</span>
                  <button
                    aria-label={`Remove ${item} option`}
                    aria-roledescription="button to remove option"
                    type="button"
                    onMouseDown={(e) => {
                      mousePreventDefault(e);
                      setIsClickingRemove(true);
                    }}
                    onClick={() => {
                      onValueChange(item);
                      if (value.length === 1) {
                        setContentHeight(0);
                      }
                    }}
                    onMouseUp={() => {
                      setTimeout(() => {
                        setIsClickingRemove(false);
                      }, 100);
                    }}
                  >
                    <span className="sr-only">Remove {item} option</span>
                    <RemoveIcon className="h-4 w-4 cursor-pointer hover:stroke-destructive transition-colors duration-100 ease-in-out" />
                  </button>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

MultiSelectorTrigger.displayName = "MultiSelectorTrigger";

const MultiSelectorList = () => {
  const {
    value,
    onValueChange,
    commandListRef,
    inputValue,
    label,
    setIsCommandItemInteraction,
    open,
    allAvailableOptions,
    setInputValue,
    isCollapsibleOpen,
    setIsCollapsibleOpen,
    prerequisite,
    inputRef,
    isCommandItemInteraction,
    isClickingScrollArea,
    handleSelect,
    activeIndex,
    setOpen,
  } = useMultiSelect();

  return (
    <>
      {open && (
        <div className="flex flex-col gap-2  ">
          <CommandInput
            tabIndex={0}
            ref={inputRef}
            value={inputValue}
            readOnly={isCommandItemInteraction && !inputValue}
            placeholder={
              !allAvailableOptions
                ? `Select ${prerequisite.toLowerCase()} first`
                : `Search ${label.toLowerCase()}`
            }
            enterKeyHint="search"
            wrapperClassName="w-full p-4 border-b"
            onValueChange={(e) => {
              if (activeIndex === -1) {
                setInputValue(e);
              }

              if (!e) {
                setTimeout(() => {
                  commandListRef.current?.scrollTo({
                    top: 0,
                    behavior: "instant",
                  });
                }, 100);
              }
            }}
            onSelect={handleSelect}
            onClick={() => {
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
            }}
            onBlur={() => {
              if (!isClickingScrollArea && !isCommandItemInteraction) {
                setOpen(false);
                setInputValue("");
              }
            }}
            className={cn(
              "bg-transparent text-sm outline-none placeholder:text-muted-foreground w-[205px] focus-visible:ring-0 focus-visible:ring-offset-0  placeholder:text-[14px]",
              activeIndex !== -1 && "caret-transparent"
            )}
          />
          <CommandList
            ref={commandListRef}
            className={cn(
              "p-2 flex flex-col gap-2 z-[1000] w-full bg-background ",
              (label === "Year" || label === "Season") && "max-h-[210px] "
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ScrollArea
              className="max-h-[300px]"
              onTouchStart={() => {
                if (!inputValue) {
                  setIsCommandItemInteraction(true);
                }
              }}
              onClick={() => {
                if (!inputValue) {
                  setIsCommandItemInteraction(true);
                  setTimeout(() => {
                    setIsCommandItemInteraction(false);
                  }, 100);
                }
              }}
              onTouchEnd={() => {
                setTimeout(() => {
                  if (!inputValue) {
                    setIsCommandItemInteraction(false);
                  }
                }, 100);
              }}
            >
              <Collapsible
                open={isCollapsibleOpen}
                onOpenChange={setIsCollapsibleOpen}
              >
                {!inputValue && (
                  <CollapsibleTrigger className="absolute top-1 right-0 cursor-pointer">
                    <ChevronsUpDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                )}
                <CommandGroup heading={`${value.length} selected`}>
                  <CollapsibleContent>
                    {value.length > 0 && !inputValue && (
                      <>
                        {value.map((item) => (
                          <CommandItem
                            key={item}
                            className="rounded-md cursor-pointer px-2 py-1 transition-colors flex justify-start "
                            onSelect={() => {
                              setIsCommandItemInteraction(true);
                              onValueChange(item);
                              setTimeout(() => {
                                setIsCommandItemInteraction(false);
                              }, 100);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Checkbox
                              defaultChecked={true}
                              className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main"
                            />
                            {item}

                            <span className="hidden">skibidi toilet</span>
                          </CommandItem>
                        ))}
                      </>
                    )}
                  </CollapsibleContent>
                </CommandGroup>
                <CommandSeparator />

                <CommandGroup
                  heading={
                    !!inputValue
                      ? "Search results"
                      : `${allAvailableOptions?.length} available options`
                  }
                >
                  {allAvailableOptions?.map((item) => (
                    <CommandItem
                      key={item}
                      onSelect={() => {
                        onValueChange(item);
                        if (!inputValue) {
                          setIsCommandItemInteraction(true);
                          setTimeout(() => {
                            setIsCommandItemInteraction(false);
                          }, 100);
                        }
                        setTimeout(() => {
                          if (inputValue) {
                            commandListRef.current?.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                          }
                        }, 100);
                        setInputValue("");
                      }}
                      className={cn(
                        "rounded-md cursor-pointer px-2 py-1 transition-colors flex justify-start",
                        value.includes(item) && "opacity-50 cursor-default"
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Checkbox
                        checked={value.includes(item)}
                        className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main  "
                      />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Collapsible>
            </ScrollArea>
            <CommandEmpty>
              <span className="text-muted-foreground">No results found</span>
            </CommandEmpty>
          </CommandList>
        </div>
      )}
    </>
  );
};

MultiSelectorList.displayName = "MultiSelectorList";
