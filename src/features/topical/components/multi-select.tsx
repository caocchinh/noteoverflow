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
import { X as RemoveIcon, Check, Trash2, Sparkles } from "lucide-react";
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

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen !== open) {
        setOpen(newOpen);
      }
    },
    [open]
  );

  // Add click outside handler
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
          break;

        case "Escape":
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
    setOpen,
    scrollAreaRef,
    setIsClickingScrollArea,
    selectAllValues,
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
      <div className="absolute top-3 flex items-center justify-center gap-1 right-2">
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
          onMouseDown={() => {
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
    setActiveIndex,
    handleSelect,
    ref: inputRef,
    commandListRef,
    isClickingScrollArea,
    setOpen,
  } = useMultiSelect();

  return (
    <CommandPrimitive.Input
      {...props}
      tabIndex={0}
      ref={inputRef}
      onKeyDown={(e) => {
        if (e.key !== "Enter") {
          e.stopPropagation();
        }
        if (commandListRef.current) {
          commandListRef.current.scrollTo({
            top: 0,
            behavior: "instant",
          });
        }
      }}
      value={inputValue}
      onValueChange={activeIndex === -1 ? setInputValue : undefined}
      onSelect={handleSelect}
      onBlur={() => {
        // Only close if we're not clicking in the ScrollArea
        if (!isClickingScrollArea) {
          setOpen(false);
        }
      }}
      onFocus={() => {
        setOpen(true);
      }}
      onClick={() => setActiveIndex(-1)}
      className={cn(
        "bg-transparent text-sm outline-none placeholder:text-muted-foreground flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0",
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
>(({ className, children }, ref) => {
  const { value, onValueChange, commandListRef } = useMultiSelect();

  return (
    <CommandList
      ref={(element) => {
        if (ref) {
          if (typeof ref === "function") ref(element);
          else ref.current = element;
        }
        if (commandListRef) commandListRef.current = element;
      }}
      className={cn(
        "p-2 flex flex-col gap-2 rounded-md scrollbar-thin scrollbar-track-transparent transition-colors scrollbar-thumb-muted-foreground dark:scrollbar-thumb-muted scrollbar-thumb-rounded-lg w-full absolute bg-background shadow-md z-10 border border-muted top-0",
        className
      )}
    >
      {value.length > 0 && (
        <>
          <CommandGroup heading={`${value.length} selected`}>
            {value.map((item) => (
              <CommandItem
                key={item}
                className="rounded-md cursor-pointer px-2 py-1 transition-colors flex justify-between "
                onSelect={() => {
                  onValueChange(item);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {item}
                <span className="hidden">skibidi toilet</span>
                <RemoveIcon className="h-4 w-4  cursor-pointer" />
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </>
      )}

      <CommandGroup
        heading={`${React.Children.count(children)} available options`}
      >
        {children}
      </CommandGroup>

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
  const { value: Options, onValueChange, setInputValue } = useMultiSelect();

  const mousePreventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const isIncluded = Options.includes(value);
  return (
    <CommandItem
      ref={ref}
      {...props}
      onSelect={() => {
        onValueChange(value);
        setInputValue("");
      }}
      className={cn(
        "rounded-md cursor-pointer px-2 py-1 transition-colors flex justify-between ",
        className,
        isIncluded && "opacity-50 cursor-default",
        props.disabled && "opacity-50 cursor-not-allowed"
      )}
      onMouseDown={mousePreventDefault}
    >
      {children}
      {isIncluded && <Check className="h-4 w-4" />}
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
