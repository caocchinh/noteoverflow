"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SearchIcon, WandSparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./EnhancedSelect.module.css";

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
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [contentHeight, setContentHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const filterUtil = useCallback(
    (item: { code: string; coverImage: string }) => {
      if (!searchInput) return true;

      const code = item.code.toLowerCase();
      const search = searchInput.toLowerCase();

      // Simple fuzzy search - characters need to appear in order but don't need to be consecutive
      let codeIndex = 0;
      let searchIndex = 0;

      while (codeIndex < code.length && searchIndex < search.length) {
        if (code[codeIndex] === search[searchIndex]) {
          searchIndex++;
        }
        codeIndex++;
      }

      // If we matched all search characters, return true
      return searchIndex === search.length;
    },
    [searchInput]
  );

  useEffect(() => {
    if (isSelectOpen && contentRef.current) {
      const filteredItems = data?.filter(filterUtil);

      // Set height based on content or fallback to 250px
      const height =
        filteredItems?.length === 0
          ? 250
          : Math.min(filteredItems?.length * 40 || 0, 170);
      setContentHeight(height);
    }
  }, [isSelectOpen, searchInput, data, filterUtil]);

  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={`${label.toLowerCase()}-enhanced-topical-select`}
        className="w-max"
      >
        {label}
      </Label>
      <Select
        onValueChange={setSelectedValue}
        value={selectedValue}
        onOpenChange={(open) => {
          setIsSelectOpen(open);
          setSearchInput("");
        }}
        open={isSelectOpen}
        disabled={!data}
      >
        <SelectTrigger
          id={`${label.toLowerCase()}-enhanced-topical-select`}
          className={`cursor-pointer w-[200px] !h-max ${styles.stubbornSelectValue}`}
        >
          <SelectValue
            placeholder={
              selectedValue || !prerequisite
                ? `Select ${label.toLowerCase()}`
                : `Select ${prerequisite.toLowerCase()} first`
            }
          />
        </SelectTrigger>

        <SelectContent className="w-full">
          <div className="flex items-center gap-2 p-2 sticky w-full h-full ">
            <SearchIcon className="w-4 h-4" />
            <Input
              placeholder={`Search ${label.toLowerCase()}`}
              value={searchInput}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-max border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <SelectSeparator className="w-full" />

          <ScrollArea
            className="w-full"
            style={{ height: `${contentHeight}px` }}
          >
            <div ref={contentRef}>
              {data?.filter(filterUtil).length == 0 && (
                <div className="w-full h-[250px] flex items-center justify-center flex-col gap-2">
                  Nothing found!
                  <WandSparkles size={25} />
                </div>
              )}
              {data?.map((item) => (
                <HoverCard key={item.code} openDelay={0} closeDelay={0}>
                  <HoverCardTrigger asChild>
                    <SelectItem
                      key={item.code}
                      value={item.code}
                      className={cn(
                        "p-2",
                        searchInput && !filterUtil(item) && "hidden"
                      )}
                    >
                      <div key={item.code} className="w-full">
                        {item.code}
                      </div>
                    </SelectItem>
                  </HoverCardTrigger>
                  <HoverCardContent
                    className="w-max bg-transparent cursor-pointer border-none shadow-none relative hidden lg:block"
                    side="right"
                    sideOffset={-10}
                    align="start"
                    avoidCollisions={true}
                    onClick={() => {
                      setIsSelectOpen(false);
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
            </div>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnhancedSelect;
