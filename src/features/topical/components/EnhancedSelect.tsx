"use client";
import { ChevronsUpDown, XIcon } from "lucide-react";
import Image from "next/image";
import {
  SetStateAction,
  Dispatch,
  useRef,
  useState,
  useCallback,
  KeyboardEvent,
  memo,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { fuzzySearch } from "../lib/utils";

const EnhancedSelect = memo(
  ({
    label,
    prerequisite,
    side,
    data,
    selectedValue,
    triggerClassName,
    setSelectedValue,
    popoverContentClassName,
    modal,
  }: {
    label: string;
    prerequisite: string;
    side?: "left" | "right" | "bottom" | "top";
    data: { code: string; coverImage: string }[];
    popoverContentClassName?: string;
    selectedValue: string;
    triggerClassName?: string;
    setSelectedValue: Dispatch<SetStateAction<string>>;
    modal?: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isMobileDevice = useIsMobile();
    const [inputValue, setInputValue] = useState<string>("");
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();

        if (e.key === "Escape") {
          if (inputValue) {
            setInputValue("");
            return;
          }
          inputRef.current?.blur();
          if (isOpen) {
            setIsOpen(false);
          }
        }
      },
      [inputValue, isOpen]
    );

    return (
      <div className="flex flex-col gap-1">
        <Popover modal={modal || isMobileDevice} open={isOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={triggerRef}
              aria-expanded={isOpen}
              className={cn(
                "h-max w-[200px] justify-between whitespace-pre-wrap",
                triggerClassName
              )}
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              disabled={!!prerequisite}
              variant="outline"
            >
              {(() => {
                if (selectedValue) {
                  return data?.find((item) => item.code === selectedValue)
                    ?.code;
                }
                if (prerequisite) {
                  return `Select ${prerequisite.toLowerCase()} first`;
                }
                return `Select ${label.toLowerCase()}`;
              })()}

              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            autoFocus={false}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            onInteractOutside={(e) => {
              if (triggerRef.current?.contains(e.target as Node)) {
                return;
              }
              setIsOpen(false);
              setInputValue("");
            }}
            align="center"
            className={cn(
              "z-[1000000000000000] w-[300px] p-0 sm:w-max",
              popoverContentClassName
            )}
            side={side || (isMobileDevice ? "bottom" : "right")}
            avoidCollisions={isMobileDevice ? false : true}
          >
            <Command shouldFilter={false} onKeyDown={handleKeyDown}>
              <div className="flex items-center gap-1 dark:bg-accent">
                <CommandInput
                  className="h-9 border-none"
                  placeholder={`Search ${label.toLowerCase()}`}
                  ref={inputRef}
                  onClick={() => {
                    inputRef.current?.focus();
                  }}
                  value={inputValue}
                  wrapperClassName="w-full p-4 border-b py-6 "
                  onValueChange={(value) => {
                    setInputValue(value);
                  }}
                />
                <XIcon
                  className="!bg-transparent cursor-pointer mr-2 text-destructive"
                  size={20}
                  onClick={() => {
                    if (inputValue) {
                      setInputValue("");
                    } else {
                      setIsOpen(false);
                    }
                  }}
                />
              </div>
              <ScrollArea viewPortClassName="max-h-[195px]" type="always">
                <CommandList className="dark:bg-accent">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {data
                      ?.filter((item) => fuzzySearch(inputValue, item.code))
                      .map((item) => (
                        <EnhancedSelectItem
                          key={item.code}
                          item={item}
                          isOpen={isOpen}
                          setIsOpen={setIsOpen}
                          setInputValue={setInputValue}
                          setSelectedValue={setSelectedValue}
                          selectedValue={selectedValue}
                        />
                      ))}
                  </CommandGroup>
                </CommandList>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

EnhancedSelect.displayName = "EnhancedSelect";

const EnhancedSelectItem = ({
  item,
  isOpen,
  setIsOpen,
  setInputValue,
  setSelectedValue,

  selectedValue,
}: {
  item: { code: string; coverImage: string };
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  setInputValue: (value: string) => void;
  setSelectedValue: (value: string) => void;
  selectedValue: string;
}) => {
  return (
    <HoverCard closeDelay={0} key={item.code} openDelay={0}>
      <HoverCardTrigger asChild>
        <CommandItem
          className={cn("cursor-pointer", !isOpen && "pointer-events-none")}
          key={item.code}
          onSelect={(currentValue) => {
            setSelectedValue(currentValue);
            setIsOpen(false);
            setInputValue("");
          }}
          value={item.code}
        >
          <Checkbox
            checked={selectedValue === item.code}
            className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main rounded-full"
          />
          {item.code}
        </CommandItem>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        avoidCollisions={true}
        className={cn(
          "relative z-[999999999999999999999999999999] hidden w-[100px] cursor-pointer border-none bg-transparent shadow-none lg:block",
          !isOpen && "!hidden"
        )}
        onClick={() => {
          setIsOpen(false);
          setSelectedValue(item.code);
        }}
        side="right"
        sideOffset={-10}
      >
        <div className="absolute top-0 left-10 rounded-md border  dark:bg-accent bg-card p-2">
          <Image
            alt={item.code}
            className="rounded-[2px]"
            height={100}
            src={item.coverImage}
            width={100}
          />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EnhancedSelect;
