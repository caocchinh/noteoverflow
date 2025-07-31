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
  data,
}: MultiSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isClickingScrollArea, setIsClickingScrollArea] = useState(false);
  const commandListRef = useRef<HTMLDivElement | null>(null);
  const [isBlockingInput, setIsBlockingInput] = useState(false);
  const isMobileDevice = useIsMobile();
  if (
    maxLength !== undefined &&
    typeof maxLength == "number" &&
    maxLength <= 0
  ) {
    throw new Error("maxLength must be greater than 0");
  }

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (e.key === "Escape") {
        if (inputValue) {
          setInputValue("");
          return;
        }
        inputRef.current?.blur();
        if (open) {
          setOpen(false);
        }
      }
    },
    [inputValue, open]
  );
  const popoverTriggerRef = useRef<HTMLDivElement | null>(null);

  return (
    <MultiSelectContext.Provider
      value={{
        value,
        onValueChange: onValueChangeHandler,
        open,
        setOpen,
        inputValue,
        setInputValue,
        inputRef,
        maxLength,
        isClickingScrollArea,
        setIsClickingScrollArea,
        commandListRef,
        isBlockingInput,
        setIsBlockingInput,
        allAvailableOptions: data,
        label,
        prerequisite,
        isMobileDevice,
      }}
    >
      <Command
        className={cn(
          "!h-max relative flex flex-col space-y-2 overflow-visible bg-transparent"
        )}
        onKeyDown={handleKeyDown}
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
                className="z-[100007] h-[95vh] max-h-[95vh] dark:bg-accent"
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
                  <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-black pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
                </div>
                {maxLength && value.length > maxLength && (
                  <h3
                    className="w-max font-medium text-sm text-destructive mx-auto -mt-1"
                    onTouchEnd={() => {
                      setTimeout(() => {
                        setIsBlockingInput(false);
                      }, 0);
                    }}
                    onTouchStart={() => {
                      setIsBlockingInput(true);
                    }}
                  >
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
              <div ref={popoverTriggerRef}>
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
              className="z-[1000000000000] m-0 border-1 p-0 shadow-none dark:bg-accent"
              side="right"
              onInteractOutside={(e) => {
                if (popoverTriggerRef.current?.contains(e.target as Node)) {
                  return;
                }
                setInputValue("");
                setOpen(false);
              }}
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
            {value.map((item) => (
              <Badge
                className={cn(
                  "wrap-anywhere dark:!border-white/25 flex items-center gap-1 whitespace-pre-wrap rounded-xl px-1 text-left"
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
    prerequisite,
    inputRef,
    isBlockingInput,
    isClickingScrollArea,
    setOpen,
    isMobileDevice,
    maxLength,
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
    <div
      className="flex h-full flex-col gap-2"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="flex items-center gap-1 dark:bg-accent"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <CommandInput
          className="w-full bg-transparent text-sm outline-none placeholder:text-[14px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
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
          readOnly={isBlockingInput}
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
            setInputValue("");
          }}
        />
      </div>

      <ScrollArea viewPortClassName="max-h-[50vh]" type="always">
        <CommandList
          className={cn(
            "z-[1000] flex h-full w-full flex-col gap-2 dark:bg-acccent p-2",
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
          <Collapsible>
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
          <CommandEmpty>
            <span className="text-muted-foreground">No results found</span>
          </CommandEmpty>
        </CommandList>
      </ScrollArea>
      <div
        className="flex flex-row gap-2 m-2"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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
            onValueChange(value, "removeAll");
          }}
          variant="destructive"
        >
          Remove all
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
