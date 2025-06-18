"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurriculum } from "@/server/main/curriculum";
import { getSubjectByCurriculum } from "@/server/main/subject";
import { useState } from "react";
import {
  CurriculumType,
  SubjectType,
} from "@/features/admin/content/constants/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Check, Plus, X } from "lucide-react";
const UploadPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    string | undefined
  >(undefined);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    undefined
  );
  const [isCurriculumSelectOpen, setIsCurriculumSelectOpen] =
    useState<boolean>(false);
  const [newCurriculum, setNewCurriculum] = useState<string[]>([]);
  const [newCurriculumInput, setNewCurriculumInput] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const [selectedSeason, setSelectedSeason] = useState<string | undefined>(
    undefined
  );
  const [selectedPaperType, setSelectedPaperType] = useState<
    number | undefined
  >(undefined);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
    undefined
  );

  const { data: curriculumData, isPending: isCurriculumPending } = useQuery({
    queryKey: ["curriculum"],
    queryFn: async (): Promise<CurriculumType[]> => {
      const data = await getCurriculum();
      return data;
    },
    select: (data) => {
      if (data.length > 0 && !selectedCurriculum) {
        setSelectedCurriculum(data[0].name);
      }
      return data;
    },
  });

  const { data: subject } = useQuery({
    queryKey: ["subject", selectedCurriculum],
    queryFn: async (): Promise<SubjectType[]> => {
      return await getSubjectByCurriculum(selectedCurriculum ?? "");
    },
    enabled: !!selectedCurriculum,
  });

  return (
    <div>
      <Select
        onValueChange={setSelectedCurriculum}
        value={selectedCurriculum}
        open={isCurriculumSelectOpen}
        onOpenChange={setIsCurriculumSelectOpen}
      >
        <SelectTrigger className="w-max">
          <SelectValue
            placeholder={
              isCurriculumPending
                ? "Fetching existing curriculums..."
                : "Select a curriculum"
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Existing Curriculum</SelectLabel>
            {curriculumData?.map((item) => (
              <SelectItem key={item.name} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>New Curriculum</SelectLabel>
            {newCurriculum.map((item, index) => (
              <div
                key={index}
                className="p-2 hover:bg-muted group cursor-pointer flex items-center justify-between rounded-md w-full"
              >
                <div
                  className="flex-1"
                  onClick={() => {
                    console.log("clicked");
                    setSelectedCurriculum(item);
                    setIsCurriculumSelectOpen(false);
                  }}
                >
                  {item}
                </div>
                <div className="flex items-center gap-2">
                  <X
                    className="w-4 h-4 group-hover:block hidden"
                    onClick={() => {
                      console.log("clicked");
                      setNewCurriculum(
                        newCurriculum.filter((_, i) => i !== index)
                      );
                      setSelectedCurriculum(undefined);
                    }}
                  />
                  <Check
                    className={`w-4 h-4 group-hover:hidden ${
                      selectedCurriculum === item ? "block" : "hidden"
                    }`}
                    onClick={() => {
                      console.log("clicked");
                      setSelectedCurriculum(item);
                    }}
                  />
                </div>
              </div>
            ))}
          </SelectGroup>
          {newCurriculum.map((item, index) => (
            <SelectItem key={index} value={item} className="hidden">
              {item}
            </SelectItem>
          ))}

          <div className="flex items-center gap-2 p-2 mt-2">
            <Input
              placeholder="Enter new curriculum name"
              value={newCurriculumInput}
              onChange={(e) => setNewCurriculumInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCurriculumInput !== "") {
                  if (
                    !newCurriculum
                      .concat(curriculumData?.map((item) => item.name) ?? [])
                      .includes(newCurriculumInput)
                  ) {
                    setNewCurriculum([...newCurriculum, newCurriculumInput]);
                    setNewCurriculumInput("");
                  }
                }
              }}
            />
            <div className="cursor-pointer" title="Add new curriculum">
              <Plus
                className="w-4 h-4 "
                onClick={() => {
                  if (
                    newCurriculumInput &&
                    !newCurriculum.includes(newCurriculumInput)
                  ) {
                    setNewCurriculum([...newCurriculum, newCurriculumInput]);
                    setNewCurriculumInput("");
                  }
                }}
              />
            </div>
          </div>
        </SelectContent>
      </Select>
      <div className="flex items-center justify-start md:justify-center gap-4 flex-wrap">
        {subject?.map((item) => (
          <div key={item.id}>{item.id}</div>
        ))}
      </div>
    </div>
  );
};

export default UploadPage;
