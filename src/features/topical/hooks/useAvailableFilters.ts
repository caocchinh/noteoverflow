import { TOPICAL_DATA } from "@/constants/constants";
import { useMemo } from "react";

export interface UseAvailableFiltersProps {
  selectedCurriculum: string;
  selectedSubject: string;
}

export const useAvailableFilters = ({
  selectedCurriculum,
  selectedSubject,
}: UseAvailableFiltersProps) => {
  const availableCurriculum = useMemo(() => {
    return TOPICAL_DATA.map((item) => ({
      code: item.curriculum,
      coverImage: item.coverImage,
    }));
  }, []);

  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)]
      ?.subject;
  }, [selectedCurriculum]);

  const subjectSyllabus = useMemo(
    () =>
      TOPICAL_DATA.find((item) => item.curriculum === selectedCurriculum)?.subject.find(
        (sub) => sub.code === selectedSubject,
      )?.syllabusLink,
    [selectedCurriculum, selectedSubject],
  );

  const availableTopicsFullInfo = useMemo(() => {
    return availableSubjects
      ?.find((item) => item.code === selectedSubject)
      ?.topic.map((item) => {
        return {
          value: item.topicName,
          curriculumnSubdivision: item.topicCurriculumnSubdivision,
          isUpToDate: item.isTopicUpToDate,
        };
      });
  }, [availableSubjects, selectedSubject]);

  const availableYears = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)?.year.map(String);
  }, [availableSubjects, selectedSubject]);

  const availablePaperTypeFullInfo = useMemo(() => {
    return availableSubjects
      ?.find((item) => item.code === selectedSubject)
      ?.paperType.map((item) => {
        return {
          value: item.paperType.toString(),
          curriculumnSubdivision: item.paperTypeCurriculumnSubdivision,
          isUpToDate: true,
        };
      });
  }, [availableSubjects, selectedSubject]);

  const availableSeasons = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)?.season;
  }, [availableSubjects, selectedSubject]);

  const subjectPrerequisite = useMemo(() => {
    return selectedCurriculum ? "" : "Curriculum";
  }, [selectedCurriculum]);

  return useMemo(
    () => ({
      availableCurriculum,
      availableSubjects,
      availableTopicsFullInfo,
      subjectSyllabus,
      availableYears,
      availablePaperTypeFullInfo,
      availableSeasons,
      subjectPrerequisite,
    }),
    [
      availableCurriculum,
      availableSubjects,
      availableTopicsFullInfo,
      subjectSyllabus,
      availableYears,
      availablePaperTypeFullInfo,
      availableSeasons,
      subjectPrerequisite,
    ],
  );
};
