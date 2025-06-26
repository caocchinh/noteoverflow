"use client";
import { useMemo, useState } from "react";

import { TOPICAL_DATA } from "@/features/topical/constants/constants";
import { ValidCurriculum } from "@/constants/types";

import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import EnhancedMultiSelect from "@/features/topical/components/EnhancedMultiSelect";
import Image from "next/image";

const TopicalPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    ValidCurriculum | ""
  >("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[
      TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
    ]?.subject;
  }, [selectedCurriculum]);
  const availableTopics = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.topic;
  }, [availableSubjects, selectedSubject]);
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const availableYears = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.year;
  }, [availableSubjects, selectedSubject]);
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
  const availablePaperTypes = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.paperType;
  }, [availableSubjects, selectedSubject]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const availableSeasons = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.season;
  }, [availableSubjects, selectedSubject]);

  return (
    <div className="pt-19 min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center md:text-left">
        Topical Questions
      </h1>
      <div className="mt-6  gap-6 flex items-center md:items-start justify-center flex-col md:flex-row">
        <div className="flex items-center gap-6 ">
          {selectedSubject && (
            <Image
              src={
                availableSubjects!.find((item) => item.code === selectedSubject)
                  ?.coverImage ?? ""
              }
              alt="cover"
              className="self-center"
              width={100}
              height={100}
            />
          )}
          <div className="flex items-start gap-6 flex-col justify-start">
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
              data={availableSubjects}
              selectedValue={selectedSubject}
              setSelectedValue={setSelectedSubject}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedMultiSelect
            label="Topic"
            values={selectedTopic}
            onValuesChange={(values) => setSelectedTopic(values as string[])}
            loop={true}
            data={availableTopics}
          />
          <EnhancedMultiSelect
            label="Year"
            values={selectedYear}
            onValuesChange={(values) => setSelectedYear(values as string[])}
            loop={true}
            data={availableYears}
          />
          <EnhancedMultiSelect
            label="Paper Type"
            values={selectedPaperType}
            onValuesChange={(values) =>
              setSelectedPaperType(values as string[])
            }
            loop={true}
            data={availablePaperTypes}
          />
          <EnhancedMultiSelect
            label="Season"
            values={selectedSeason}
            onValuesChange={(values) => setSelectedSeason(values as string[])}
            loop={true}
            data={availableSeasons}
          />
        </div>
      </div>
    </div>
  );
};

export default TopicalPage;
