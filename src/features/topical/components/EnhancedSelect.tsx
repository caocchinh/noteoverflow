"use client";
import { ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
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
        onOpenChange={(open) => {
          if (open) {
            setIsBlockingInput(true);
            setTimeout(() => {
              setIsBlockingInput(false);
            }, 0);
          }
          setIsOpen(open);
        }}
        open={isOpen}
      >
        <PopoverTrigger asChild>
          <Button
            aria-expanded={isOpen}
            className="h-max w-[200px] justify-between whitespace-pre-wrap"
            disabled={!!prerequisite}
            variant="outline"
          >
            {(() => {
              if (selectedValue) {
                return data?.find((item) => item.code === selectedValue)?.code;
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
          align="center"
          className="z-[1000000000000000] w-[300px] p-0 sm:w-max"
          side={isMobileDevice ? "bottom" : "right"}
        >
          <Command>
            <CommandInput
              className="h-9 border-none"
              placeholder={`Search ${label.toLowerCase()}`}
              readOnly={isBlockingInput}
              ref={inputRef}
              wrapperClassName="w-full p-4 border-b py-6 dark:bg-accent"
            />
            <ScrollArea viewPortClassName="max-h-[195px]" type="always">
              <CommandList className="dark:bg-accent">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {data?.map((item) => (
                    <HoverCard closeDelay={0} key={item.code} openDelay={0}>
                      <HoverCardTrigger asChild>
                        <CommandItem
                          className={cn(
                            "cursor-pointer",
                            !isOpen && "pointer-events-none"
                          )}
                          key={item.code}
                          onSelect={(currentValue) => {
                            setSelectedValue(currentValue);
                            setIsOpen(false);
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
                          value={item.code}
                        >
                          <Checkbox
                            checked={selectedValue === item.code}
                            className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main"
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
                  ))}
                </CommandGroup>
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EnhancedSelect;
