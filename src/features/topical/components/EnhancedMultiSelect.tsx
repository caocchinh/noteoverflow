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
import { X as RemoveIcon, Trash2, Sparkles } from "lucide-react";
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
import { Command as CommandPrimitive } from "cmdk";
import { Label } from "@/components/ui/label";

interface MultiSelectorProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  values: string[];
  onValuesChange: (value: string[]) => void;
  loop?: boolean;
  data?: string[];
  label: string;
  prerequisite: string;
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
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shouldOpenDrawer: boolean;
  label: string;
  prerequisite: string;
}

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
  className,
  children,
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
  const shouldOpenDrawer =
    typeof window !== "undefined" &&
    (window.innerWidth <= 1024 ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ));

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
      }}
    >
      <Command
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className={cn(
          "overflow-visible bg-transparent  flex flex-col space-y-2 relative !h-max",
          className
        )}
        dir={dir}
        {...props}
      >
        {children}
        <MultiSelectorTrigger />
        <MultiSelectorList />
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
    removeAllValues,
    setOpen,
    scrollAreaRef,
    setIsClickingScrollArea,
    selectAllValues,
    allAvailableOptions,
    shouldOpenDrawer,
    label,
    setIsDrawerOpen,
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
      className={cn(
        "flex flex-col gap-2",
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
          <MultiSelectorInput />

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
                if (shouldOpenDrawer) {
                  setIsDrawerOpen(true);
                } else {
                  setOpen(true);
                }
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
    </div>
  );
};

MultiSelectorTrigger.displayName = "MultiSelectorTrigger";

const MultiSelectorInput = () => {
  const {
    inputValue,
    setInputValue,
    value,
    activeIndex,
    commandListRef,
    handleSelect,
    ref: inputRef,
    isClickingScrollArea,
    setOpen,
    isCommandItemInteraction,
    shouldOpenDrawer,
    allAvailableOptions,
    prerequisite,
  } = useMultiSelect();

  return (
    <CommandInput
      tabIndex={0}
      ref={inputRef}
      value={inputValue}
      readOnly={isCommandItemInteraction && !inputValue}
      placeholder={
        !allAvailableOptions
          ? `Select ${prerequisite.toLowerCase()} first`
          : `${value.length} selected`
      }
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
        if (shouldOpenDrawer) {
        } else {
          setOpen(true);
        }
      }}
      onFocus={() => {
        if (shouldOpenDrawer) {
        } else {
          setOpen(true);
        }
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
  );
};

MultiSelectorInput.displayName = "MultiSelectorInput";

// const MultiSelectorContent = () => {
//   const { open, shouldOpenDrawer, isDrawerOpen, setIsDrawerOpen } =
//     useMultiSelect();
//   return (
//     <div ref={ref} className="relative">
//       {open && !shouldOpenDrawer && children}
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
//     </div>
//   );
// });

const MultiSelectorList = () => {
  const {
    value,
    onValueChange,
    commandListRef,
    shouldOpenDrawer,
    inputValue,
    setIsCommandItemInteraction,
    open,
    allAvailableOptions,
    setInputValue,
  } = useMultiSelect();

  return (
    <>
      {open && (
        <CommandList
          ref={commandListRef}
          className={cn(
            "p-2 flex flex-col gap-2 rounded-md z-[1000] w-full  bg-background shadow-md border border-muted top-full",
            !shouldOpenDrawer && "absolute"
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ScrollArea
            className={cn("max-h-[300px]", shouldOpenDrawer && "max-h-[68vh]")}
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
          </ScrollArea>
          <CommandEmpty>
            <span className="text-muted-foreground">No results found</span>
          </CommandEmpty>
        </CommandList>
      )}
    </>
  );
};

MultiSelectorList.displayName = "MultiSelectorList";
