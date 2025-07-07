"use client";

import {
  ChevronsUpDown,
  X as RemoveIcon,
  Sparkles,
  Trash2,
} from "lucide-react";
import React, {
  createContext,
  type KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
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
  MultiSelectContextProps,
  MultiSelectorProps,
} from "../constants/types";

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
  maxLength = undefined,
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
  if (
    maxLength !== undefined &&
    typeof maxLength == "number" &&
    maxLength <= 0
  ) {
    throw new Error("maxLength must be greater than 0");
  }

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
      } else if (value.includes(val)) {
        onValueChange(value.filter((item) => item !== val));
      } else {
        onValueChange([...value, val]);
      }
    },
    [value, data, onValueChange]
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

      if (!target) {
        return;
      }
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
        let newIndex: number;
        if (activeIndex - 1 <= 0) {
          newIndex = value.length - 1 === 0 ? -1 : 0;
        } else {
          newIndex = activeIndex - 1;
        }
        setActiveIndex(newIndex);
      };

      switch (e.key) {
        case "ArrowLeft":
          if (dir === "rtl") {
            if (value.length > 0 && (activeIndex !== -1 || loop)) {
              moveNext();
            }
          } else if (value.length > 0 && target.selectionStart === 0) {
            movePrev();
          }
          break;

        case "ArrowRight":
          if (dir === "rtl") {
            if (value.length > 0 && target.selectionStart === 0) {
              movePrev();
            }
          } else if (value.length > 0 && (activeIndex !== -1 || loop)) {
            moveNext();
          }
          break;

        case "Backspace":
        case "Delete":
          if (value.length > 0) {
            if (activeIndex !== -1 && activeIndex < value.length) {
              onValueChangeHandler(value[activeIndex]);
              moveCurrent();
            } else if (
              target.selectionStart === 0 &&
              (selectedValue === inputValue || isValueSelected)
            ) {
              onValueChangeHandler(value.at(-1) ?? "");
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
          if (inputValue) {
            setInputValue("");
            return;
          }
          inputRef.current?.blur();
          if (activeIndex !== -1) {
            setActiveIndex(-1);
          } else if (open) {
            setOpen(false);
          }
          break;
      }
    },
    [
      value,
      inputValue,
      activeIndex,
      loop,
      dir,
      onValueChangeHandler,
      selectedValue,
      isValueSelected,
      open,
    ]
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
        maxLength,
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
        className={cn(
          "!h-max relative flex flex-col space-y-2 overflow-visible bg-transparent"
        )}
        dir={dir}
        onKeyDown={handleKeyDown}
        ref={containerRef}
        {...props}
        label={label}
      >
        {isMobileDevice ? (
          <>
            <MultiSelectorTrigger />
            {maxLength && value.length > maxLength && (
              <h3 className="w-max font-medium text-sm text-destructive mt-1">
                You can only select up to {maxLength}{" "}
                {label.toLowerCase() +
                  (label.toLowerCase() === "topic" ? "s" : "")}
              </h3>
            )}
            <Drawer onOpenChange={setOpen} open={open}>
              <DrawerContent
                className="z-[100004] h-[95vh] max-h-[95vh]"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DrawerHeader className="sr-only">
                  <DrawerTitle>Select</DrawerTitle>
                  <DrawerDescription />
                  Select {label}
                </DrawerHeader>
                <div
                  className="w-full pt-2 pb-4"
                  onTouchEnd={() => {
                    setTimeout(() => {
                      setIsBlockingInput(false);
                    }, 0);
                  }}
                  onTouchStart={() => {
                    setIsBlockingInput(true);
                  }}
                >
                  <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-muted pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
                </div>
                {maxLength && value.length > maxLength && (
                  <h3 className="w-max font-medium text-sm text-destructive mx-auto -mt-1">
                    You can only select up to {maxLength}{" "}
                    {label.toLowerCase() +
                      (label.toLowerCase() === "topic" ? "s" : "")}
                  </h3>
                )}
                <div
                  className="flex flex-row gap-3 p-2 "
                  onTouchEnd={() => {
                    setTimeout(() => {
                      setIsBlockingInput(false);
                    }, 0);
                  }}
                  onTouchStart={() => {
                    setIsBlockingInput(true);
                  }}
                >
                  {!maxLength && (
                    <Button
                      className="flex-1/3 cursor-pointer"
                      onClick={() => {
                        onValueChange(data ?? []);
                      }}
                    >
                      Select all
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  )}
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
                <MultiSelectorList />
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <Popover modal={false} open={open}>
            <PopoverTrigger asChild>
              <div>
                <MultiSelectorTrigger />
                {maxLength && value.length > maxLength && (
                  <h3 className="w-max font-medium text-sm text-destructive mt-1">
                    You can only select up to {maxLength}{" "}
                    {label.toLowerCase() +
                      (label.toLowerCase() === "topic" ? "s" : "")}
                  </h3>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="center"
              className="z-[1000000000000] m-0 border-1 p-0 shadow-none"
              side="right"
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
    maxLength,
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
        "relative mb-0 flex w-[300px] flex-col flex-wrap gap-1 rounded-lg bg-background p-1 py-2 ring-1 ring-muted dark:bg-secondary",
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
              onTouchEnd={() => {
                setTimeout(() => {
                  setIsBlockingInput(false);
                }, 0);
              }}
              onTouchStart={() => {
                setIsBlockingInput(true);
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
                  onValueChange(allAvailableOptions, "selectAll");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && allAvailableOptions) {
                    onValueChange(allAvailableOptions, "selectAll");
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
                onTouchEnd={() => {
                  setTimeout(() => {
                    setIsBlockingInput(false);
                  }, 0);
                }}
                onTouchStart={() => {
                  setIsBlockingInput(true);
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
          onMouseDown={mousePreventDefault}
          onTouchEnd={() => {
            setTimeout(() => {
              setIsBlockingInput(false);
            }, 0);
          }}
          onTouchStart={() => {
            setIsBlockingInput(true);
          }}
          variant="default"
        >
          {value.length === 0
            ? `Select ${label.toLowerCase()}`
            : `${value.length} ${label.toLowerCase()}${
                value.length > 1 ? "s" : ""
              } selected`}
        </Button>
      </div>

      {value.length > 0 && (
        <ScrollArea
          className="w-full overflow-hidden"
          onClick={() => {
            if (!isClickingUltility) {
              setInputValue("");
              setOpen(!open);
            }
          }}
          onMouseDown={(e) => {
            mousePreventDefault(e);
            setIsClickingScrollArea(true);
          }}
          onMouseUp={() => {
            setIsClickingScrollArea(false);
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              setIsBlockingInput(false);
            }, 0);
          }}
          onTouchStart={() => {
            setIsBlockingInput(true);
          }}
          style={{ height: `${contentHeight}px`, paddingRight }}
        >
          <div className="flex w-full flex-wrap gap-2 p-1" ref={contentRef}>
            {value.map((item, index) => (
              <Badge
                className={cn(
                  "wrap-anywhere dark:!border-white/25 flex items-center gap-1 whitespace-pre-wrap rounded-xl px-1 text-left",
                  activeIndex === index && "ring-2 ring-muted-foreground "
                )}
                key={item}
                onTouchEnd={() => {
                  setTimeout(() => {
                    setIsBlockingInput(false);
                  }, 0);
                }}
                onTouchStart={() => {
                  setIsBlockingInput(true);
                }}
                variant={"secondary"}
              >
                <span className="text-xs">{item}</span>
                <button
                  aria-label={`Remove ${item} option`}
                  aria-roledescription="button to remove option"
                  onClick={() => {
                    onValueChange(item);

                    if (value.length === 1) {
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
    <div className="flex h-full flex-col gap-2">
      <CommandInput
        className={cn(
          "w-full bg-transparent text-sm outline-none placeholder:text-[14px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
          activeIndex !== -1 && "caret-transparent"
        )}
        enterKeyHint="search"
        onBlur={() => {
          if (!(isClickingScrollArea || isBlockingInput)) {
            setOpen(false);
            setInputValue("");
          }
        }}
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
        placeholder={
          allAvailableOptions
            ? `Search ${label.toLowerCase()}`
            : `Select ${prerequisite.toLowerCase()} first`
        }
        readOnly={isBlockingInput}
        ref={inputRef}
        tabIndex={0}
        value={inputValue}
        wrapperClassName="w-full py-6 px-4 border-b"
      />
      <CommandList
        className={cn(
          "z-[1000] flex h-full w-full flex-col gap-2 bg-card p-2",
          label === "Year" || label === "Season"
        )}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            if (!inputValue) {
              setIsBlockingInput(false);
            }
          }, 0);
        }}
        onTouchStart={() => {
          if (!inputValue) {
            setIsBlockingInput(true);
          }
        }}
        ref={commandListRef}
      >
        <ScrollArea className="max-h-[50vh]">
          <Collapsible
            onOpenChange={setIsCollapsibleOpen}
            open={isCollapsibleOpen}
          >
            {!inputValue && (
              <CollapsibleTrigger
                className="flex w-full cursor-pointer items-center justify-between gap-2 px-3"
                onTouchStart={() => {
                  setIsBlockingInput(false);
                }}
                title="Toggle selected"
              >
                <h3
                  className={cn(
                    "font-medium text-xs",
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
                {value.length > 0 &&
                  !inputValue &&
                  value.map((item) => (
                    <CommandItem
                      className="flex cursor-pointer justify-start rounded-md px-2 py-1 transition-colors "
                      key={item}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        setIsBlockingInput(true);
                        setTimeout(() => {
                          setIsBlockingInput(false);
                        }, 0);
                        onValueChange(item);
                      }}
                      onTouchEnd={() => {
                        setTimeout(() => {
                          inputRef.current?.focus();
                          setIsBlockingInput(false);
                        }, 0);
                      }}
                      onTouchStart={() => {
                        setIsBlockingInput(true);
                      }}
                    >
                      <Checkbox
                        className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main"
                        defaultChecked={true}
                      />
                      {item}

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
                    value.includes(item) && "cursor-default opacity-50"
                  )}
                  key={item}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
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
                  onTouchEnd={() => {
                    setTimeout(() => {
                      inputRef.current?.focus();
                      setIsBlockingInput(false);
                    }, 0);
                  }}
                  onTouchStart={() => {
                    if (!inputValue) {
                      setIsBlockingInput(true);
                    }
                  }}
                >
                  <Checkbox
                    checked={value.includes(item)}
                    className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main "
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
