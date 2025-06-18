"use client";

import { useQuery } from "@tanstack/react-query";
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

  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
    undefined
  );
  const [isTopicSelectOpen, setIsTopicSelectOpen] = useState<boolean>(false);
  const [newTopic, setNewTopic] = useState<string[]>([]);
  const [newTopicInput, setNewTopicInput] = useState<string>("");

  const [selectedPaperType, setSelectedPaperType] = useState<
    string | undefined
  >(undefined);
  const [isPaperTypeSelectOpen, setIsPaperTypeSelectOpen] =
    useState<boolean>(false);
  const [newPaperType, setNewPaperType] = useState<string[]>([]);
  const [newPaperTypeInput, setNewPaperTypeInput] = useState<string>("");

  const [selectedSeason, setSelectedSeason] = useState<string | undefined>(
    undefined
  );
  const [isSeasonSelectOpen, setIsSeasonSelectOpen] = useState<boolean>(false);
  const [newSeason, setNewSeason] = useState<string[]>([]);
  const [newSeasonInput, setNewSeasonInput] = useState<string>("");

  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const [isYearSelectOpen, setIsYearSelectOpen] = useState<boolean>(false);
  const [newYear, setNewYear] = useState<string[]>([]);
  const [newYearInput, setNewYearInput] = useState<string>("");

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

  const { data: subjectInfo, isPending: isSubjectInfoPending } = useQuery({
    queryKey: ["subjectInfo", selectedSubject],
    queryFn: async () => {
      const [topicData, paperTypeData, seasonData, yearData] =
        await Promise.all([
          getTopic(selectedSubject!),
          getPaperType(selectedSubject!),
          getSeason(selectedSubject!),
          getYear(selectedSubject!),
        ]);
      return { topicData, paperTypeData, seasonData, yearData };
    },
    enabled: !!selectedSubject,
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

  const handleAddNewTopic = (item: string) => {
    setNewTopic([...newTopic, item]);
    setNewTopicInput("");
  };

  const handleRemoveNewTopic = (index: number) => {
    setNewTopic(newTopic.filter((_, i) => i !== index));
    if (selectedTopic === newTopic[index]) {
      setSelectedTopic("");
    }
  };

  const handleAddNewPaperType = (item: string) => {
    setNewPaperType([...newPaperType, item]);
    setNewPaperTypeInput("");
  };

  const handleRemoveNewPaperType = (index: number) => {
    setNewPaperType(newPaperType.filter((_, i) => i !== index));
    if (selectedPaperType === newPaperType[index]) {
      setSelectedPaperType("");
    }
  };

  const handleAddNewSeason = (item: string) => {
    setNewSeason([...newSeason, item]);
    setNewSeasonInput("");
  };

  const handleRemoveNewSeason = (index: number) => {
    setNewSeason(newSeason.filter((_, i) => i !== index));
    if (selectedSeason === newSeason[index]) {
      setSelectedSeason("");
    }
  };

  const handleAddNewYear = (item: string) => {
    setNewYear([...newYear, item]);
    setNewYearInput("");
  };

  const handleRemoveNewYear = (index: number) => {
    setNewYear(newYear.filter((_, i) => i !== index));
    if (selectedYear === newYear[index]) {
      setSelectedYear("");
    }
  };

  return (
    <div>
      <CustomSelect
        selectedValue={selectedCurriculum}
        onValueChange={setSelectedCurriculum}
        isOpen={isCurriculumSelectOpen}
        onOpenChange={setIsCurriculumSelectOpen}
        existingItems={curriculumData?.map((item) => item.name) ?? []}
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
        existingItems={subject?.map((item) => item.id) ?? []}
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

      <CustomSelect
        selectedValue={selectedTopic}
        onValueChange={setSelectedTopic}
        isOpen={isTopicSelectOpen}
        onOpenChange={setIsTopicSelectOpen}
        existingItems={subjectInfo?.topicData ?? []}
        newItems={newTopic}
        onAddNewItem={handleAddNewTopic}
        onRemoveNewItem={handleRemoveNewTopic}
        placeholder={
          !selectedSubject ? "Select a subject first" : "Select a topic"
        }
        loadingPlaceholder="Fetching existing topics..."
        isLoading={isSubjectInfoPending}
        newItemInputValue={newTopicInput}
        onNewItemInputChange={setNewTopicInput}
        existingItemsLabel="Existing Topics"
        newItemsLabel="New Topics"
        inputPlaceholder="Enter new topic name"
        className="w-max mt-4"
        disabled={!selectedSubject}
      />

      <CustomSelect
        selectedValue={selectedPaperType}
        onValueChange={setSelectedPaperType}
        isOpen={isPaperTypeSelectOpen}
        onOpenChange={setIsPaperTypeSelectOpen}
        existingItems={
          subjectInfo?.paperTypeData?.map((item) => item.toString()) ?? []
        }
        newItems={newPaperType}
        onAddNewItem={handleAddNewPaperType}
        onRemoveNewItem={handleRemoveNewPaperType}
        placeholder={
          !selectedSubject ? "Select a subject first" : "Select a paper type"
        }
        loadingPlaceholder="Fetching existing paper types..."
        isLoading={isSubjectInfoPending}
        newItemInputValue={newPaperTypeInput}
        onNewItemInputChange={setNewPaperTypeInput}
        existingItemsLabel="Existing Paper Types"
        newItemsLabel="New Paper Types"
        inputPlaceholder="Enter new paper type"
        className="w-max mt-4"
        disabled={!selectedSubject}
      />

      <CustomSelect
        selectedValue={selectedSeason}
        onValueChange={setSelectedSeason}
        isOpen={isSeasonSelectOpen}
        onOpenChange={setIsSeasonSelectOpen}
        existingItems={subjectInfo?.seasonData ?? []}
        newItems={newSeason}
        onAddNewItem={handleAddNewSeason}
        onRemoveNewItem={handleRemoveNewSeason}
        placeholder={
          !selectedSubject ? "Select a subject first" : "Select a season"
        }
        loadingPlaceholder="Fetching existing seasons..."
        isLoading={isSubjectInfoPending}
        newItemInputValue={newSeasonInput}
        onNewItemInputChange={setNewSeasonInput}
        existingItemsLabel="Existing Seasons"
        newItemsLabel="New Seasons"
        inputPlaceholder="Enter new season"
        className="w-max mt-4"
        disabled={!selectedSubject}
      />

      <CustomSelect
        selectedValue={selectedYear}
        onValueChange={setSelectedYear}
        isOpen={isYearSelectOpen}
        onOpenChange={setIsYearSelectOpen}
        existingItems={
          subjectInfo?.yearData?.map((item) => item.toString()) ?? []
        }
        newItems={newYear}
        onAddNewItem={handleAddNewYear}
        onRemoveNewItem={handleRemoveNewYear}
        placeholder={
          !selectedSubject ? "Select a subject first" : "Select a year"
        }
        loadingPlaceholder="Fetching existing years..."
        isLoading={isSubjectInfoPending}
        newItemInputValue={newYearInput}
        onNewItemInputChange={setNewYearInput}
        existingItemsLabel="Existing Years"
        newItemsLabel="New Years"
        inputPlaceholder="Enter new year"
        className="w-max mt-4"
        disabled={!selectedSubject}
      />
    </div>
  );
};

export default UploadPage;
