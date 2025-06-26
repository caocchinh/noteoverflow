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
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

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
  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={`${label.toLowerCase()}-enhanced-topical-select`}
        onClick={() => {
          setIsSelectOpen(!isSelectOpen);
        }}
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
          className="cursor-pointer"
        >
          <SelectValue
            placeholder={
              !selectedValue &&
              `Select ${label.toLowerCase()} ${prerequisite && "first"}`
            }
          />
        </SelectTrigger>

        <SelectContent className="w-full">
          <div className="flex items-center gap-2 px-2 sticky w-full h-full ">
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

          <ScrollArea className="h-[250px] w-full">
            {data?.filter((item) =>
              item.code.toLowerCase().includes(searchInput.toLowerCase())
            ).length == 0 && (
              <div className="w-full h-[250px] flex items-center justify-center">
                Nothing found!
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
                      searchInput &&
                        !item.code
                          .toLowerCase()
                          .includes(searchInput.toLowerCase()) &&
                        "hidden"
                    )}
                  >
                    <div key={item.code} className="w-full">
                      {item.code}
                    </div>
                  </SelectItem>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-max bg-transparent border-none shadow-none relative hidden sm:block"
                  side="right"
                  sideOffset={-10}
                  align="start"
                  avoidCollisions={true}
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
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnhancedSelect;
