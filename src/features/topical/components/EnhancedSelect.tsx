"use client";
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
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const EnhancedSelect = ({
  label,
  prerequisite,
  data,
  selectedValue,
  setSelectedValue,
}: {
  label: string;
  prerequisite: string;
  data: { code: string; coverImage: string }[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isBlockingInput, setIsBlockingInput] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobileDevice = useIsMobile();

  return (
    <div className="flex flex-col gap-1">
      <Popover
        modal={isMobileDevice}
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsBlockingInput(true);
            setTimeout(() => {
              setIsBlockingInput(false);
            }, 0);
          }
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={!!prerequisite}
            role="combobox"
            aria-expanded={isOpen}
            className="w-[200px] justify-between h-max whitespace-pre-wrap"
          >
            {selectedValue
              ? data?.find((item) => item.code === selectedValue)?.code
              : !prerequisite
              ? `Select ${label.toLowerCase()}`
              : `Select ${prerequisite.toLowerCase()} first`}

            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 z-[1000000000000000] w-[300px] sm:w-max "
          side={isMobileDevice ? "bottom" : "right"}
          align="center"
        >
          <Command>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}`}
              className="h-9 border-none"
              wrapperClassName="w-full p-4 border-b py-6"
              readOnly={isBlockingInput}
              ref={inputRef}
            />
            <CommandList>
              <ScrollArea className="max-h-[195px]">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {data &&
                    data.map((item) => (
                      <HoverCard key={item.code} openDelay={0} closeDelay={0}>
                        <HoverCardTrigger asChild>
                          <CommandItem
                            key={item.code}
                            value={item.code}
                            onSelect={(currentValue) => {
                              setSelectedValue(currentValue);
                              setIsOpen(false);
                            }}
                            className={cn(
                              "cursor-pointer",
                              !isOpen && "pointer-events-none"
                            )}
                            onTouchStart={() => {
                              setIsBlockingInput(true);
                            }}
                            onTouchEnd={() => {
                              setTimeout(() => {
                                inputRef.current?.focus();
                                setIsBlockingInput(false);
                              }, 0);
                            }}
                          >
                            <Checkbox
                              checked={selectedValue === item.code}
                              className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main"
                            />
                            {item.code}
                          </CommandItem>
                        </HoverCardTrigger>
                        <HoverCardContent
                          className={cn(
                            "w-[100px] cursor-pointer bg-transparent border-none shadow-none relative hidden lg:block z-[999999999999999999999999999999]",
                            !isOpen && "!hidden"
                          )}
                          side="right"
                          sideOffset={-10}
                          align="start"
                          avoidCollisions={true}
                          onClick={() => {
                            setIsOpen(false);
                            setSelectedValue(item.code);
                          }}
                        >
                          <div className="absolute top-0 left-10 bg-card rounded-md p-2 border">
                            <Image
                              src={item.coverImage}
                              alt={item.code}
                              width={100}
                              height={100}
                              className="rounded-[2px]"
                            />
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EnhancedSelect;
