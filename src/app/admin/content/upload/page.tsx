"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { getCurriculum } from "@/server/main/curriculum";
import { getSubjectByCurriculum } from "@/server/main/subject";
import { useState } from "react";
import {
  CurriculumType,
  SubjectType,
} from "@/features/admin/content/constants/types";
import CustomSelect from "@/features/admin/content/components/custom-select";
import { getPaperType } from "@/server/main/paperType";
import { getSeason } from "@/server/main/season";
import { getYear } from "@/server/main/year";
import { getTopic } from "@/server/main/topic";

const UploadPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    string | undefined
  >(undefined);
  const [isCurriculumSelectOpen, setIsCurriculumSelectOpen] =
    useState<boolean>(false);
  const [newCurriculum, setNewCurriculum] = useState<string[]>([]);
  const [newCurriculumInput, setNewCurriculumInput] = useState<string>("");

  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    undefined
  );
  const [isSubjectSelectOpen, setIsSubjectSelectOpen] =
    useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState<string>("");

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

  const [
    { data: topicData, isPending: isTopicPending },
    { data: paperTypeData, isPending: isPaperTypePending },
    { data: seasonData, isPending: isSeasonPending },
    { data: yearData, isPending: isYearPending },
  ] = useQueries({
    queries: [
      {
        queryKey: ["topic", selectedSubject],
        queryFn: () => getTopic(selectedSubject!),
        enabled: !!selectedSubject,
      },
      {
        queryKey: ["paperType", selectedSubject],
        queryFn: () => getPaperType(selectedSubject!),
        enabled: !!selectedSubject,
      },
      {
        queryKey: ["season", selectedSubject],
        queryFn: () => getSeason(selectedSubject!),
        enabled: !!selectedSubject,
      },
      {
        queryKey: ["year", selectedSubject],
        queryFn: () => getYear(selectedSubject!),
        enabled: !!selectedSubject,
      },
    ],
  });

  const handleAddNewCurriculum = (item: string) => {
    setNewCurriculum([...newCurriculum, item]);
    setNewCurriculumInput("");
  };

  const handleRemoveNewCurriculum = (index: number) => {
    setNewCurriculum(newCurriculum.filter((_, i) => i !== index));
    if (selectedCurriculum === newCurriculum[index]) {
      setSelectedCurriculum("");
    }
  };

  const handleAddNewSubject = (item: string) => {
    setNewSubject([...newSubject, item]);
    setNewSubjectInput("");
  };

  const handleRemoveNewSubject = (index: number) => {
    setNewSubject(newSubject.filter((_, i) => i !== index));
    if (selectedSubject === newSubject[index]) {
      setSelectedSubject("");
    }
  };

  return (
    <div>
      <CustomSelect
        selectedValue={selectedCurriculum}
        onValueChange={setSelectedCurriculum}
        isOpen={isCurriculumSelectOpen}
        onOpenChange={setIsCurriculumSelectOpen}
        existingItems={curriculumData ?? []}
        newItems={newCurriculum}
        onAddNewItem={handleAddNewCurriculum}
        onRemoveNewItem={handleRemoveNewCurriculum}
        placeholder="Select a curriculum"
        loadingPlaceholder="Fetching existing curriculums..."
        isLoading={isCurriculumPending}
        newItemInputValue={newCurriculumInput}
        onNewItemInputChange={setNewCurriculumInput}
        existingItemsLabel="Existing Curriculum"
        newItemsLabel="New Curriculum"
        inputPlaceholder="Enter new curriculum name"
      />

      <CustomSelect
        selectedValue={selectedSubject}
        onValueChange={setSelectedSubject}
        isOpen={isSubjectSelectOpen}
        onOpenChange={setIsSubjectSelectOpen}
        existingItems={(subject ?? []).map((item) => ({
          id: item.id,
          name: item.id,
        }))}
        newItems={newSubject}
        onAddNewItem={handleAddNewSubject}
        onRemoveNewItem={handleRemoveNewSubject}
        placeholder={
          !selectedCurriculum ? "Select a curriculum first" : "Select a subject"
        }
        newItemInputValue={newSubjectInput}
        onNewItemInputChange={setNewSubjectInput}
        existingItemsLabel="Existing Subjects"
        newItemsLabel="New Subjects"
        inputPlaceholder="Enter new subject name"
        className="w-max mt-4"
        disabled={!selectedCurriculum}
        valueKey="id"
      />
    </div>
  );
};

export default UploadPage;
