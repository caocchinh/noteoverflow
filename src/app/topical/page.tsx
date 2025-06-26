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

import EnhancedSelect from "@/features/topical/components/EnhancedSelect";

const TopicalPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    ValidCurriculum | ""
  >("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);

  return (
    <div className="pt-24  p-6">
      <h1 className="text-4xl font-bold">Topical Questions</h1>
      <div className="mt-6  gap-6 flex items-center justify-start">
        <EnhancedSelect
          label="Curriculum"
          prerequisite=""
          data={TOPICAL_DATA.map((item) => ({
            code: item.curriculum,
            coverImage: item.coverImage,
          }))}
          selectedValue={selectedCurriculum}
          setSelectedValue={(value) => {
            setSelectedCurriculum(value as ValidCurriculum);
          }}
        />
        <EnhancedSelect
          label="Subject"
          prerequisite="Curriculum"
          data={
            TOPICAL_DATA[
              TOPICAL_DATA.findIndex(
                (item) => item.curriculum === selectedCurriculum
              )!
            ]?.subject
          }
          selectedValue={selectedSubject}
          setSelectedValue={setSelectedSubject}
        />
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
