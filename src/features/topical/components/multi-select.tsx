"use client";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandItem,
  CommandEmpty,
  CommandList,
  CommandSeparator,
  CommandGroup,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { X as RemoveIcon, Trash2, Sparkles } from "lucide-react";
import React, {
  KeyboardEvent,
  createContext,
  forwardRef,
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

interface MultiSelectorProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  values: string[];
  onValuesChange: (value: string[]) => void;
  loop?: boolean;
  allAvailableOptions?: string[];
}

interface MultiSelectContextProps {
  value: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange: (value: any) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  ref: React.RefObject<HTMLInputElement | null>;
  handleSelect: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  removeAllValues: () => void;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  isClickingScrollArea: boolean;
  setIsClickingScrollArea: React.Dispatch<React.SetStateAction<boolean>>;
  commandListRef: React.RefObject<HTMLDivElement | null>;
  allAvailableOptions?: string[];
  selectAllValues: () => void;
  isCommandItemInteraction: boolean;
  setIsCommandItemInteraction: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileKeyboardOpen: boolean;
  setIsMobileKeyboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MultiSelectContext = createContext<MultiSelectContextProps | null>(null);

const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error("useMultiSelect must be used within MultiSelectProvider");
  }
  return context;
};

/**
 * MultiSelect Docs: {@link: https://shadcn-extension.vercel.app/docs/multi-select}
 */

// TODO : expose the visibility of the popup

const MultiSelector = ({
  values: value,
  onValuesChange: onValueChange,
  loop = false,
  className,
  children,
  dir,
  allAvailableOptions,
  ...props
}: MultiSelectorProps) => {
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

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen !== open) {
        setOpen(newOpen);
      }
    },
    [open]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        open
      ) {
        handleOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, handleOpenChange]);

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
    if (allAvailableOptions) {
      onValueChange(allAvailableOptions);
    }
  }, [allAvailableOptions, onValueChange]);

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
          handleOpenChange(true);
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
            handleOpenChange(false);
          }
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, inputValue, activeIndex, loop, handleOpenChange]
  );

  return (
    <MultiSelectContext.Provider
      value={{
        value,
        onValueChange: onValueChangeHandler,
        open,
        setOpen: handleOpenChange,
        inputValue,
        setInputValue,
        activeIndex,
        setActiveIndex,
        ref: inputRef,
        handleSelect,
        removeAllValues,
        scrollAreaRef,
        isClickingScrollArea,
        setIsClickingScrollArea,
        commandListRef,
        allAvailableOptions,
        selectAllValues,
        isCommandItemInteraction,
        setIsCommandItemInteraction,
        isMobileKeyboardOpen,
        setIsMobileKeyboardOpen,
      }}
    >
      <Command
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className={cn(
          "overflow-visible bg-transparent flex flex-col space-y-2",
          className
        )}
        dir={dir}
        {...props}
      >
        {children}
      </Command>
    </MultiSelectContext.Provider>
  );
};

const MultiSelectorTrigger = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    value,
    onValueChange,
    activeIndex,
    open,
    removeAllValues,
    isCommandItemInteraction,
    setOpen,
    scrollAreaRef,
    setIsClickingScrollArea,
    selectAllValues,
    setIsCommandItemInteraction,
    setInputValue,
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
      const height = Math.min(containerHeight || 0, 120);
      if (height == 120) {
        setPaddingRight("10px");
      } else {
        setPaddingRight("initial");
      }
      setContentHeight(height);
    }
  }, [value]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap gap-1 p-1 py-2 ring-1 ring-muted mb-0 rounded-lg bg-background relative",
        {
          "ring-1 focus-within:ring-ring": activeIndex === -1,
        },
        className
      )}
      {...props}
    >
      {children}
      <div className="absolute top-2 flex items-center justify-center gap-[5px] right-2">
        <Badge
          variant="default"
          className="px-1 rounded-xl w-[100px] cursor-pointer flex items-center gap-1 whitespace-pre-wrap wrap-anywhere select-none"
          onMouseDown={(e) => {
            mousePreventDefault(e);
          }}
          onClick={() => {
            setInputValue("");
            setOpen(!open || isCommandItemInteraction);
          }}
          onTouchStart={() => {
            setIsCommandItemInteraction(true);
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              setIsCommandItemInteraction(false);
            }, 100);
          }}
        >
          Select
        </Badge>
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
                  "px-1 rounded-xl flex items-center gap-1 whitespace-pre-wrap wrap-anywhere",
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
  );
});

MultiSelectorTrigger.displayName = "MultiSelectorTrigger";

const MultiSelectorInput = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, ...props }, ref) => {
  const {
    inputValue,
    setInputValue,
    activeIndex,
    commandListRef,
    handleSelect,
    ref: inputRef,
    isClickingScrollArea,
    setOpen,
    isCommandItemInteraction,
  } = useMultiSelect();

  return (
    <CommandPrimitive.Input
      {...props}
      tabIndex={0}
      ref={inputRef}
      value={inputValue}
      readOnly={isCommandItemInteraction && !inputValue}
      enterKeyHint="search"
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
        "bg-transparent w-[110px] text-sm outline-none placeholder:text-muted-foreground flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 placeholder:text-[12px]",
        className,
        activeIndex !== -1 && "caret-transparent"
      )}
    />
  );
});

MultiSelectorInput.displayName = "MultiSelectorInput";

const MultiSelectorContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children }, ref) => {
  const { open } = useMultiSelect();
  return (
    <div ref={ref} className="relative">
      {open && children}
    </div>
  );
});

MultiSelectorContent.displayName = "MultiSelectorContent";

const MultiSelectorList = forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, children }, ref) => {
  const {
    value,
    onValueChange,
    commandListRef,
    inputValue,
    setIsCommandItemInteraction,
    open,
  } = useMultiSelect();

  // Simple solution to prevent auto-scrolling when dropdown appears
  useEffect(() => {
    if (open && commandListRef.current) {
      const scrollPosition = window.scrollY;

      // Force window to maintain the same scroll position after dropdown renders
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
      });
    }
  }, [open, commandListRef]);

  return (
    <CommandList
      ref={commandListRef}
      className={cn(
        "p-2 flex flex-col gap-2 rounded-md z-[1000] w-full absolute bg-background shadow-md border border-muted top-0",
        className
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
        {value.length > 0 && !inputValue && (
          <>
            <CommandGroup heading={`${value.length} selected`}>
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
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup
          heading={
            !!inputValue
              ? "Search results"
              : `${React.Children.count(children)} available options`
          }
        >
          {children}
        </CommandGroup>
      </ScrollArea>
      <CommandEmpty>
        <span className="text-muted-foreground">No results found</span>
      </CommandEmpty>
    </CommandList>
  );
});

MultiSelectorList.displayName = "MultiSelectorList";

const MultiSelectorItem = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  { value: string } & React.ComponentPropsWithoutRef<
    typeof CommandPrimitive.Item
  >
>(({ className, value, children, ...props }, ref) => {
  const {
    value: Options,
    onValueChange,
    setIsCommandItemInteraction,
    setInputValue,
    inputValue,
    commandListRef,
  } = useMultiSelect();

  const isIncluded = Options.includes(value);
  return (
    <CommandItem
      ref={ref}
      {...props}
      onSelect={() => {
        onValueChange(value);
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
        className,
        isIncluded && "opacity-50 cursor-default",
        props.disabled && "opacity-50 cursor-not-allowed"
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Checkbox
        checked={isIncluded}
        className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main  "
      />
      {children}
    </CommandItem>
  );
});

MultiSelectorItem.displayName = "MultiSelectorItem";

export {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
};
