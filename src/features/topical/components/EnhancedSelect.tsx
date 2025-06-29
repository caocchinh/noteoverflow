"use client";
import { Label } from "@/components/ui/label";

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
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Add these styles globally only once

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

  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={`${label.toLowerCase()}-enhanced-topical-select`}
        className="w-max"
      >
        {label}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
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
          avoidCollisions={false}
          side="bottom"
          align="end"
        >
          <Command>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}`}
              className="h-9 border-none"
              wrapperClassName="w-full p-4 border-b"
            />
            <CommandList>
              <ScrollArea className="max-h-[195px] md:max-h-[300px] ">
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
                            "w-max bg-transparent cursor-pointer border-none shadow-none relative hidden lg:block",
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
                          <div className="absolute top-0 left-6 bg-white rounded-md p-2 border">
                            <Image
                              src={item.coverImage}
                              alt={item.code}
                              width={100}
                              height={100}
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
