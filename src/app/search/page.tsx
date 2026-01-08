"use client";

import { TOPICAL_DATA } from "@/constants/constants";
import type {
  CIE_A_LEVEL_SUBDIVISION,
  ValidCurriculum,
} from "@/constants/types";
import CoursebookCover from "@/features/topical/components/CoursebookCover";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import MultiSelector from "@/features/topical/components/MultiSelector/MultiSelector";
import EnhancedMultiSelector from "@/features/topical/components/MultiSelector/EnhancedMultiSelector";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { validateSubcurriculumnDivision } from "@/features/topical/lib/utils";

const PAPER_TYPE_FILTER_SEARCH_PAGE_KEY = "currentPaperTypeFilterSearchPage";

type PaperTypeFilterSearchPageCache = {
  [curriculum: string]: {
    [subject: string]: CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined;
  };
};

const SearchPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<ValidCurriculum>("CIE A-LEVEL");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const [currentPaperTypeFilter, setCurrentPaperTypeFilter] = useState<
    CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
  >(undefined);

  const curriculumRef = useRef<HTMLDivElement | null>(null);
  const subjectRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const paperTypeRef = useRef<HTMLDivElement | null>(null);
  const seasonRef = useRef<HTMLDivElement | null>(null);

  const availableCurriculum = useMemo(() => {
    return TOPICAL_DATA.map((item) => ({
      code: item.curriculum,
      coverImage: item.coverImage,
    }));
  }, []);

  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[
      TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
    ]?.subject;
  }, [selectedCurriculum]);

  const availableYears = useMemo(() => {
    return availableSubjects
      ?.find((item) => item.code === selectedSubject)
      ?.year.map(String);
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
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.season;
  }, [availableSubjects, selectedSubject]);

  const subjectSyllabus = useMemo(
    () =>
      TOPICAL_DATA.find(
        (item) => item.curriculum === selectedCurriculum
      )?.subject.find((sub) => sub.code === selectedSubject)?.syllabusLink,
    [selectedCurriculum, selectedSubject]
  );

  const subjectPrerequisite = useMemo(() => {
    return selectedCurriculum ? "" : "Curriculum";
  }, [selectedCurriculum]);

  // Load paper type filter from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load paper type filter preference when subject changes
  useEffect(() => {
    if (!isMounted || !selectedCurriculum || !selectedSubject) {
      return;
    }

    try {
      const savedCache = localStorage.getItem(
        PAPER_TYPE_FILTER_SEARCH_PAGE_KEY
      );
      if (savedCache) {
        const parsedCache: PaperTypeFilterSearchPageCache =
          JSON.parse(savedCache);
        const savedFilter = parsedCache[selectedCurriculum]?.[selectedSubject];

        if (
          savedFilter &&
          validateSubcurriculumnDivision({
            value: savedFilter,
            type: "paperType",
            curriculum: selectedCurriculum,
            subject: selectedSubject,
          })
        ) {
          setCurrentPaperTypeFilter(savedFilter);
        } else {
          setCurrentPaperTypeFilter(undefined);
        }
      } else {
        setCurrentPaperTypeFilter(undefined);
      }
    } catch {
      setCurrentPaperTypeFilter(undefined);
    }
  }, [isMounted, selectedCurriculum, selectedSubject]);

  // Save paper type filter preference to localStorage when it changes
  useEffect(() => {
    if (!isMounted || !selectedCurriculum || !selectedSubject) {
      return;
    }

    try {
      const existingCache = localStorage.getItem(
        PAPER_TYPE_FILTER_SEARCH_PAGE_KEY
      );
      const parsedCache: PaperTypeFilterSearchPageCache = existingCache
        ? JSON.parse(existingCache)
        : {};

      if (!parsedCache[selectedCurriculum]) {
        parsedCache[selectedCurriculum] = {};
      }

      parsedCache[selectedCurriculum][selectedSubject] = currentPaperTypeFilter;

      localStorage.setItem(
        PAPER_TYPE_FILTER_SEARCH_PAGE_KEY,
        JSON.stringify(parsedCache)
      );
    } catch (error) {
      console.error("Failed to save paper type filter to localStorage:", error);
    }
  }, [isMounted, selectedCurriculum, selectedSubject, currentPaperTypeFilter]);

  // Reset selections when curriculum changes
  useEffect(() => {
    if (!isMounted) return;
    setSelectedSubject("");
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setCurrentPaperTypeFilter(undefined);
  }, [selectedCurriculum, isMounted]);

  // Reset filter selections when subject changes
  useEffect(() => {
    if (!isMounted) return;
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
  }, [selectedSubject, isMounted]);

  return (
    <div className="mt-20">
      <CoursebookCover
        selectedSubject={selectedSubject}
        selectedCurriculum={selectedCurriculum}
        availableSubjects={availableSubjects}
        subjectSyllabus={subjectSyllabus}
      />
      <div className="flex flex-col items-start justify-start gap-6">
        {/* Curriculum Selection */}
        <div
          className="flex flex-col items-start justify-start gap-1"
          ref={curriculumRef}
        >
          <h3 className="w-max font-medium text-sm">Curriculum</h3>
          <EnhancedSelect
            data={availableCurriculum}
            label="Curriculum"
            prerequisite=""
            selectedValue={selectedCurriculum}
            setSelectedValue={useCallback((value) => {
              setSelectedCurriculum(value as ValidCurriculum);
            }, [])}
          />
        </div>

        {/* Subject Selection */}
        <div
          className="flex flex-col items-start justify-start gap-1"
          ref={subjectRef}
        >
          <h3 className="w-max font-medium text-sm">Subject</h3>
          <EnhancedSelect
            data={availableSubjects}
            label="Subject"
            prerequisite={subjectPrerequisite}
            selectedValue={selectedSubject}
            setSelectedValue={useCallback(setSelectedSubject, [
              setSelectedSubject,
            ])}
          />
        </div>

        {/* Year Selection */}
        <div
          className="flex flex-col items-start justify-start gap-1"
          ref={yearRef}
        >
          <h3 className="w-max font-medium text-sm">Year</h3>
          <MultiSelector
            allAvailableOptions={availableYears ?? []}
            label="Year"
            onValuesChange={useCallback(
              (values) => setSelectedYear(values as string[]),
              []
            )}
            selectedValues={selectedYear}
          />
        </div>

        {/* Season Selection */}
        <div
          className="flex flex-col items-start justify-start gap-1"
          ref={seasonRef}
        >
          <h3 className="w-max font-medium text-sm">Season</h3>
          <MultiSelector
            allAvailableOptions={availableSeasons ?? []}
            label="Season"
            onValuesChange={useCallback(
              (values) => setSelectedSeason(values as string[]),
              []
            )}
            selectedValues={selectedSeason}
          />
        </div>

        {/* Paper Type Selection */}
        <div
          className="flex flex-col items-start justify-start gap-1"
          ref={paperTypeRef}
        >
          <h3 className="w-max font-medium text-sm">Paper</h3>
          <EnhancedMultiSelector
            isMounted={isMounted}
            currentFilter={currentPaperTypeFilter}
            setCurrentFilter={setCurrentPaperTypeFilter}
            allAvailableOptions={availablePaperTypeFullInfo ?? []}
            label="Paper"
            onValuesChange={useCallback(
              (values) => setSelectedPaperType(values as string[]),
              []
            )}
            selectedValues={selectedPaperType}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
