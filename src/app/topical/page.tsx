"use client";
import { useState } from "react";
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import { TOPICAL_DATA } from "@/features/topical/constants/constants";
import { ValidCurriculum } from "@/constants/types";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const TopicalPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    ValidCurriculum | ""
  >("");
  const [isCurriculumSelectOpen, setIsCurriculumSelectOpen] = useState(false);
  const [isSubjectSelectOpen, setIsSubjectSelectOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjectSearchInput, setSubjectSearchInput] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);

  return (
    <div className="pt-24  p-6">
      <h1 className="text-4xl font-bold">Topical Questions</h1>
      <div className="mt-6  gap-6 flex items-center justify-start">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="curriculum"
            onClick={() => {
              setIsCurriculumSelectOpen(!isCurriculumSelectOpen);
            }}
          >
            Curriculum
          </Label>
          <Select
            onValueChange={(value) =>
              setSelectedCurriculum(value as ValidCurriculum)
            }
            value={selectedCurriculum}
            onOpenChange={setIsCurriculumSelectOpen}
            open={isCurriculumSelectOpen}
          >
            <SelectTrigger id="curriculum">
              <SelectValue placeholder="Select curriculum" />
            </SelectTrigger>
            <SelectContent className="w-max">
              {TOPICAL_DATA.map((item) => (
                <HoverCard key={item.curriculum} openDelay={0} closeDelay={0}>
                  <HoverCardTrigger asChild>
                    <SelectItem
                      key={item.curriculum}
                      value={item.curriculum}
                      className="relative p-2"
                    >
                      <div key={item.curriculum} className="w-full">
                        {item.curriculum}
                      </div>
                    </SelectItem>
                  </HoverCardTrigger>
                  <HoverCardContent
                    className="w-max bg-transparent border-none shadow-none relative"
                    side="right"
                    sideOffset={-1}
                    align="start"
                  >
                    <div className="absolute top-0 left-3 bg-white rounded-md p-2 border">
                      <Image
                        src={item.coverImage}
                        alt={item.curriculum}
                        width={100}
                        height={100}
                      />
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="subject"
            onClick={() => {
              setIsSubjectSelectOpen(!isSubjectSelectOpen);
            }}
          >
            Subject
          </Label>
          <Select
            onValueChange={setSelectedSubject}
            value={selectedSubject}
            onOpenChange={(open) => {
              setIsSubjectSelectOpen(open);
              setSubjectSearchInput("");
            }}
            open={isSubjectSelectOpen}
            disabled={!selectedCurriculum}
          >
            <SelectTrigger id="subject">
              <SelectValue
                placeholder={
                  selectedCurriculum
                    ? "Select subject"
                    : "Select curriculum first"
                }
              />
            </SelectTrigger>
            <SelectContent className="w-full">
              <div className="flex items-center gap-2 px-2 sticky w-full h-full ">
                <SearchIcon className="w-4 h-4" />
                <Input
                  placeholder="Search subject"
                  value={subjectSearchInput}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={(e) => setSubjectSearchInput(e.target.value)}
                  className="w-max border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <SelectSeparator className="w-full" />

              <ScrollArea className="h-[250px] w-full">
                {TOPICAL_DATA[
                  TOPICAL_DATA.findIndex(
                    (item) => item.curriculum === selectedCurriculum
                  )!
                ]?.subject.filter((item) =>
                  item.code
                    .toLowerCase()
                    .includes(subjectSearchInput.toLowerCase())
                ).length == 0 && (
                  <div className="w-full h-full flex items-center justify-center">
                    Nothing to show!
                  </div>
                )}
                {TOPICAL_DATA[
                  TOPICAL_DATA.findIndex(
                    (item) => item.curriculum === selectedCurriculum
                  )!
                ]?.subject.map((item) => (
                  <HoverCard key={item.code} openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                      <SelectItem
                        key={item.code}
                        value={item.code}
                        className={cn(
                          "p-2",
                          subjectSearchInput &&
                            !item.code
                              .toLowerCase()
                              .includes(subjectSearchInput.toLowerCase()) &&
                            "hidden"
                        )}
                      >
                        <div key={item.code} className="w-full">
                          {item.code}
                        </div>
                      </SelectItem>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-max bg-transparent border-none shadow-none relative"
                      side="right"
                      sideOffset={-1}
                      align="start"
                      avoidCollisions={true}
                    >
                      <div className="absolute top-0 left-3 bg-white rounded-md p-2 border">
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
      </div>
      {/* <MultiSelector values={value} onValuesChange={setValue} loop={true}>
        <MultiSelectorTrigger>
          <MultiSelectorInput placeholder="Select topics" />
        </MultiSelectorTrigger>
        <MultiSelectorContent>
          <MultiSelectorList>
            {TOPICAL_DATA.map((item, i) => (
              <MultiSelectorItem key={i} value={item.subject}>
                {item.curriculum}
              </MultiSelectorItem>
            ))}
          </MultiSelectorList>
        </MultiSelectorContent>
      </MultiSelector> */}
    </div>
  );
};

export default TopicalPage;
