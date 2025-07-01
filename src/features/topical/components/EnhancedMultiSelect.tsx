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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MultiSelectorProps,
  MultiSelectContextProps,
} from "../constants/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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
  const [isClickingScrollArea, setIsClickingScrollArea] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const commandListRef = useRef<HTMLDivElement | null>(null);
  const [isBlockingInput, setIsBlockingInput] = useState(false);
  const isMobileDevice = useIsMobile();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        open
      ) {
        setOpen(false);
        setInputValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const onValueChangeHandler = useCallback(
    (val: string, option?: "selectAll" | "removeAll") => {
      if (option === "selectAll" && data) {
        onValueChange(data);
      } else if (option === "removeAll") {
        onValueChange([]);
      } else {
        if (value.includes(val)) {
          onValueChange(value.filter((item) => item !== val));
        } else {
          onValueChange([...value, val]);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

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
        isClickingScrollArea,
        setIsClickingScrollArea,
        commandListRef,
        isBlockingInput,
        setIsBlockingInput,
        allAvailableOptions: data,
        label,
        prerequisite,
        isCollapsibleOpen,
        setIsCollapsibleOpen,
        isMobileDevice,
      }}
    >
      <Command
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className={cn(
          "overflow-visible bg-transparent flex flex-col space-y-2 relative !h-max"
        )}
        dir={dir}
        {...props}
        label={label}
      >
        {isMobileDevice ? (
          <>
            <MultiSelectorTrigger />
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerContent
                className="h-[95vh] max-h-[95vh] z-[100004]"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DrawerHeader className="sr-only">
                  <DrawerTitle>Select</DrawerTitle>
                  <DrawerDescription></DrawerDescription>
                  Select {label}
                </DrawerHeader>
                <div
                  className="w-full pt-2 pb-4"
                  onTouchStart={() => {
                    setIsBlockingInput(true);
                  }}
                  onTouchEnd={() => {
                    setTimeout(() => {
                      setIsBlockingInput(false);
                    }, 0);
                  }}
                >
                  <div className="bg-muted mx-auto hidden pt-2  h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
                </div>
                <div
                  className="flex flex-row gap-3 p-2 "
                  onTouchStart={() => {
                    setIsBlockingInput(true);
                  }}
                  onTouchEnd={() => {
                    setTimeout(() => {
                      setIsBlockingInput(false);
                    }, 0);
                  }}
                >
                  <Button
                    className="flex-1/3 cursor-pointer"
                    onClick={() => {
                      onValueChange(data ?? []);
                    }}
                  >
                    Select all
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1/3 cursor-pointer"
                    onClick={() => {
                      onValueChange([]);
                    }}
                  >
                    Remove all
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1/3 cursor-pointer"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Close
                    <RemoveIcon className="h-4 w-4" />
                  </Button>
                </div>
                <MultiSelectorList />
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <Popover open={open} modal={false}>
            <PopoverTrigger asChild>
              <div>
                <MultiSelectorTrigger />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 m-0 border-1 shadow-none z-[1000000000000]"
              side="right"
              align="center"
            >
              <MultiSelectorList />
            </PopoverContent>
          </Popover>
        )}
      </Command>
    </MultiSelectContext.Provider>
  );
}

const MultiSelectorTrigger = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    value,
    onValueChange,
    activeIndex,
    open,
    setOpen,
    setIsClickingScrollArea,
    allAvailableOptions,
    label,
    setInputValue,
    setIsBlockingInput,
  } = useMultiSelect();
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isClickingUltility, setIsClickingUltility] = useState<boolean>(false);
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
        "flex flex-wrap gap-1 w-[300px] p-1 py-2 ring-1 ring-muted mb-0 rounded-lg dark:bg-secondary bg-background relative flex-col",
        {
          "ring-1 focus-within:ring-ring": activeIndex === -1,
          "opacity-50": !allAvailableOptions,
        },
        !allAvailableOptions && "pointer-events-none "
      )}
    >
      <div className="flex items-center justify-center gap-2 px-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="cursor-pointer h-7 w-7 hover:text-destructive transition-colors duration-100 ease-in-out"
              onMouseDown={(e) => {
                mousePreventDefault(e);
                setIsClickingUltility(true);
              }}
              onMouseUp={() => {
                setTimeout(() => {
                  setIsClickingUltility(false);
                }, 0);
              }}
              onClick={() => {
                onValueChange([], "removeAll");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && allAvailableOptions) {
                  onValueChange([], "removeAll");
                }
              }}
              onTouchStart={() => {
                setIsBlockingInput(true);
              }}
              onTouchEnd={() => {
                setTimeout(() => {
                  setIsBlockingInput(false);
                }, 0);
              }}
            >
              <Trash2 className="h-4 w-4 " />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[100000000000]">
            Remove all
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className=" cursor-pointer h-7 w-7 hover:text-yellow-500 transition-colors duration-100 ease-in-out"
              variant="outline"
              onMouseDown={(e) => {
                mousePreventDefault(e);
                setIsClickingUltility(true);
              }}
              onMouseUp={() => {
                setTimeout(() => {
                  setIsClickingUltility(false);
                }, 0);
              }}
              onClick={() => {
                onValueChange(allAvailableOptions, "selectAll");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && allAvailableOptions) {
                  onValueChange(allAvailableOptions, "selectAll");
                }
              }}
              onTouchStart={() => {
                setIsBlockingInput(true);
              }}
              onTouchEnd={() => {
                setTimeout(() => {
                  setIsBlockingInput(false);
                }, 0);
              }}
            >
              <Sparkles className="h-4 w-4 " />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[100000000000]">
            Select all
          </TooltipContent>
        </Tooltip>
        <Button
          variant="default"
          className="text-xs flex-1 cursor-pointer h-6"
          onMouseDown={mousePreventDefault}
          onClick={() => {
            if (!isClickingUltility) {
              setInputValue("");
              setOpen(!open);
            }
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !isClickingUltility &&
              allAvailableOptions
            ) {
              setInputValue("");
              setOpen(!open);
            }
          }}
          onTouchStart={() => {
            setIsBlockingInput(true);
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              setIsBlockingInput(false);
            }, 0);
          }}
        >
          {value.length == 0
            ? `Select ${label.toLowerCase()}`
            : `${value.length} ${label.toLowerCase()}${
                value.length > 1 ? "s" : ""
              } selected`}
        </Button>
      </div>

      {value.length > 0 && (
        <ScrollArea
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
            if (!isClickingUltility) {
              setInputValue("");
              setOpen(!open);
            }
          }}
          onTouchStart={() => {
            setIsBlockingInput(true);
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              setIsBlockingInput(false);
            }, 0);
          }}
        >
          <div className="flex flex-wrap gap-2 p-1 w-full" ref={contentRef}>
            {value.map((item, index) => (
              <Badge
                key={item}
                className={cn(
                  "px-1 rounded-xl text-left flex items-center gap-1 whitespace-pre-wrap wrap-anywhere dark:!border-white/25",
                  activeIndex === index && "ring-2 ring-muted-foreground "
                )}
                variant={"secondary"}
                onTouchStart={() => {
                  setIsBlockingInput(true);
                }}
                onTouchEnd={() => {
                  setTimeout(() => {
                    setIsBlockingInput(false);
                  }, 0);
                }}
              >
                <span className="text-xs">{item}</span>
                <button
                  aria-label={`Remove ${item} option`}
                  aria-roledescription="button to remove option"
                  type="button"
                  onMouseDown={(e) => {
                    mousePreventDefault(e);
                    setIsClickingUltility(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && allAvailableOptions) {
                      onValueChange(item);
                    }
                  }}
                  onClick={() => {
                    onValueChange(item);

                    if (value.length === 1) {
                      setContentHeight(0);
                    }
                  }}
                  onMouseUp={() => {
                    setTimeout(() => {
                      setIsClickingUltility(false);
                    }, 0);
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
    setIsBlockingInput,
    allAvailableOptions,
    open,
    setInputValue,
    isCollapsibleOpen,
    setIsCollapsibleOpen,
    prerequisite,
    inputRef,
    isBlockingInput,
    isClickingScrollArea,
    activeIndex,
    setOpen,
    isMobileDevice,
  } = useMultiSelect();

  useEffect(() => {
    let focusTimeoutId: NodeJS.Timeout;
    let unblockTimeoutId: NodeJS.Timeout;

    if (isMobileDevice && open) {
      focusTimeoutId = setTimeout(() => {
        setIsBlockingInput(true);
        inputRef.current?.focus();
        unblockTimeoutId = setTimeout(() => setIsBlockingInput(false), 100);
      }, 0);
    }
    return () => {
      clearTimeout(focusTimeoutId);
      clearTimeout(unblockTimeoutId);
    };
  }, [inputRef, isMobileDevice, open, setIsBlockingInput]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <CommandInput
        tabIndex={0}
        ref={inputRef}
        value={inputValue}
        readOnly={isBlockingInput}
        placeholder={
          !allAvailableOptions
            ? `Select ${prerequisite.toLowerCase()} first`
            : `Search ${label.toLowerCase()}`
        }
        enterKeyHint="search"
        wrapperClassName="w-full py-6 px-4 border-b"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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
        onBlur={() => {
          if (!isClickingScrollArea && !isBlockingInput) {
            setOpen(false);
            setInputValue("");
          }
        }}
        className={cn(
          "bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full focus-visible:ring-0 focus-visible:ring-offset-0  placeholder:text-[14px]",
          activeIndex !== -1 && "caret-transparent"
        )}
      />
      <CommandList
        ref={commandListRef}
        className={cn(
          "p-2 flex flex-col gap-2 z-[1000] w-full bg-card h-full",
          label === "Year" || label === "Season"
        )}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={() => {
          if (!inputValue) {
            setIsBlockingInput(true);
          }
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            if (!inputValue) {
              setIsBlockingInput(false);
            }
          }, 0);
        }}
      >
        <ScrollArea className="max-h-[50vh]">
          <Collapsible
            open={isCollapsibleOpen}
            onOpenChange={setIsCollapsibleOpen}
          >
            {!inputValue && (
              <CollapsibleTrigger
                className="flex items-center gap-2 justify-between w-full px-3 cursor-pointer"
                title="Toggle selected"
                onTouchStart={() => {
                  setIsBlockingInput(false);
                }}
              >
                <h3
                  className={cn(
                    "text-xs font-medium",
                    value.length > 0
                      ? "text-logo-main"
                      : "text-muted-foreground"
                  )}
                >
                  {`${value.length} selected`}
                </h3>
                <ChevronsUpDown className="h-4 w-4" />
              </CollapsibleTrigger>
            )}
            <CommandGroup value={`${value.length} selected`}>
              <CollapsibleContent>
                {value.length > 0 && !inputValue && (
                  <>
                    {value.map((item) => (
                      <CommandItem
                        key={item}
                        className="rounded-md cursor-pointer px-2 py-1 transition-colors flex justify-start "
                        onSelect={() => {
                          setIsBlockingInput(true);
                          setTimeout(() => {
                            setIsBlockingInput(false);
                          }, 0);
                          onValueChange(item);
                        }}
                        onTouchStart={() => {
                          setIsBlockingInput(true);
                        }}
                        onTouchEnd={() => {
                          setTimeout(() => {
                            inputRef.current?.focus();
                            setIsBlockingInput(false);
                          }, 0);
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
                    if (!inputValue) {
                      setIsBlockingInput(true);
                      setTimeout(() => {
                        setIsBlockingInput(false);
                      }, 0);
                    }
                    setInputValue("");
                  }}
                  className={cn(
                    "rounded-md cursor-pointer px-2 py-1 transition-colors flex justify-start",
                    value.includes(item) && "opacity-50 cursor-default"
                  )}
                  onTouchStart={() => {
                    if (!inputValue) {
                      setIsBlockingInput(true);
                    }
                  }}
                  onTouchEnd={() => {
                    setTimeout(() => {
                      inputRef.current?.focus();
                      setIsBlockingInput(false);
                    }, 0);
                  }}
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
  );
};

MultiSelectorList.displayName = "MultiSelectorList";
