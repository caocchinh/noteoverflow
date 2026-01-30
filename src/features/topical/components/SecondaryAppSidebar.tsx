import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScanText } from "lucide-react";
import MultiSelector from "@/features/topical/components/MultiSelector/MultiSelector";
import LayoutSetting from "@/features/topical/components/LayoutSetting";
import VisualSetting from "@/features/topical/components/VisualSetting";
import ButtonUltility from "@/features/topical/components/ButtonUltility";
import { useFilterState, useFilterValidation } from "@/features/topical/hooks";
import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SecondaryAppSidebarProps } from "../types/components";
import { SubjectMetadata } from "../types/models";

const SecondaryAppSidebar = ({
  subjectMetadata,
  currentFilter,
  setCurrentFilter,
  isSidebarOpen,
  setIsSidebarOpen,
  selectedCurriculumn,
  selectedSubject,
}: SecondaryAppSidebarProps) => {
  const {
    filterState: {
      selectedTopic,
      selectedYear,
      selectedPaperType,
      selectedSeason,
      invalidInputs,
      setInvalidInputs,
    },
    handlers: {
      handleTopicChange,
      handleYearChange,
      handlePaperTypeChange,
      handleSeasonChange,
      resetEverything,
    },
    refs: { topicRef, yearRef, paperTypeRef, seasonRef },
  } = useFilterState({
    currentQuery: {
      curriculumId: selectedCurriculumn ?? "",
      subjectId: selectedSubject ?? "",
      topic: currentFilter?.topic ?? [],
      year: currentFilter?.year ?? [],
      paperType: currentFilter?.paperType ?? [],
      season: currentFilter?.season ?? [],
    },
  });

  // Refs to track selected values without triggering effects (keeping existing pattern)
  const selectedTopicRef = useRef<string[] | null>(null);
  const selectedYearRef = useRef<string[] | null>(null);
  const selectedPaperTypeRef = useRef<string[] | null>(null);
  const selectedSeasonRef = useRef<string[] | null>(null);

  const { validateInputs } = useFilterValidation({
    topicRef,
    yearRef,
    paperTypeRef,
    seasonRef,
    selectedTopic,
    selectedYear,
    selectedPaperType,
    selectedSeason,
    selectedSubject: selectedSubject || undefined,
    selectedCurriculum: selectedCurriculumn || undefined,
    setInvalidInputs,
  });

  // Update refs when selected values change
  useEffect(() => {
    selectedTopicRef.current = selectedTopic;
  }, [selectedTopic]);

  useEffect(() => {
    selectedYearRef.current = selectedYear;
  }, [selectedYear]);

  useEffect(() => {
    selectedPaperTypeRef.current = selectedPaperType;
  }, [selectedPaperType]);

  useEffect(() => {
    selectedSeasonRef.current = selectedSeason;
  }, [selectedSeason]);

  const handleRevert = useCallback(() => {
    handleTopicChange(currentFilter?.topic ?? []);
    handleYearChange(currentFilter?.year ?? []);
    handlePaperTypeChange(currentFilter?.paperType ?? []);
    handleSeasonChange(currentFilter?.season ?? []);
  }, [
    currentFilter,
    handleTopicChange,
    handleYearChange,
    handlePaperTypeChange,
    handleSeasonChange,
  ]);

  const handleResetEverything = useCallback(() => {
    resetEverything();
  }, [resetEverything]);

  useEffect(() => {
    // When subjectMetadata changes, filter selections to keep only available options
    if (!subjectMetadata) {
      setCurrentFilter(null);
      return;
    }

    let didUpdate = false;
    const updatedFilter: SubjectMetadata = {
      topic: [],
      year: [],
      paperType: [],
      season: [],
    };

    // Filter topics - keep only those still in metadata
    if (subjectMetadata.topic) {
      const filteredTopics =
        selectedTopicRef.current?.filter((topic) =>
          subjectMetadata.topic!.includes(topic),
        ) ?? [];
      if (
        JSON.stringify(filteredTopics) !==
        JSON.stringify(selectedTopicRef.current)
      ) {
        handleTopicChange(filteredTopics);
        didUpdate = true;
      }
      updatedFilter.topic = filteredTopics;
    }

    // Filter years
    if (subjectMetadata.year) {
      const filteredYears =
        selectedYearRef.current?.filter((year) =>
          subjectMetadata.year!.includes(year),
        ) ?? [];

      if (
        JSON.stringify(filteredYears) !==
        JSON.stringify(selectedYearRef.current)
      ) {
        handleYearChange(filteredYears);
        didUpdate = true;
      }
      updatedFilter.year = filteredYears;
    }

    // Filter paperTypes
    if (subjectMetadata.paperType) {
      const filteredPaperTypes =
        selectedPaperTypeRef.current?.filter((paperType) =>
          subjectMetadata.paperType!.includes(paperType),
        ) ?? [];

      if (
        JSON.stringify(filteredPaperTypes) !==
        JSON.stringify(selectedPaperTypeRef.current)
      ) {
        handlePaperTypeChange(filteredPaperTypes);
        didUpdate = true;
      }
      updatedFilter.paperType = filteredPaperTypes;
    }

    // Filter seasons
    if (subjectMetadata.season) {
      const filteredSeasons =
        selectedSeasonRef.current?.filter((season) =>
          subjectMetadata.season!.includes(season),
        ) ?? [];

      if (
        JSON.stringify(filteredSeasons) !==
        JSON.stringify(selectedSeasonRef.current)
      ) {
        handleSeasonChange(filteredSeasons);
        didUpdate = true;
      }
      updatedFilter.season = filteredSeasons;
    }

    // Update filter if anything changed
    if (didUpdate) {
      setCurrentFilter(updatedFilter);
    }
  }, [
    subjectMetadata,
    setCurrentFilter,
    handlePaperTypeChange,
    handleSeasonChange,
    handleTopicChange,
    handleYearChange,
  ]);

  useEffect(() => {
    if (!currentFilter && subjectMetadata?.topic) {
      handlePaperTypeChange(subjectMetadata?.paperType ?? []);
      handleSeasonChange(subjectMetadata.season);
      handleYearChange(subjectMetadata.year);
      handleTopicChange(subjectMetadata.topic);
      setCurrentFilter({
        paperType: subjectMetadata?.paperType,
        topic: subjectMetadata?.topic,
        year: subjectMetadata?.year,
        season: subjectMetadata?.season,
      });
    }
  }, [
    currentFilter,
    selectedSubject,
    setCurrentFilter,
    subjectMetadata,
    handlePaperTypeChange,
    handleSeasonChange,
    handleTopicChange,
    handleYearChange,
  ]);

  const handleFilter = useCallback(() => {
    const filter = {
      curriculumId: selectedCurriculumn,
      subjectId: selectedSubject,
      topic: selectedTopic?.toSorted() ?? [],
      paperType: selectedPaperType?.toSorted() ?? [],
      year: selectedYear?.toSorted((a, b) => Number(b) - Number(a)) ?? [],
      season: selectedSeason?.toSorted() ?? [],
    };
    const isSameQuery = JSON.stringify(currentFilter) == JSON.stringify(filter);

    // Check validation
    const isValid = validateInputs({ scrollOnError: true });

    if (isValid && !isSameQuery) {
      setCurrentFilter({
        ...filter,
      });
    }
    if (isValid) {
      setIsSidebarOpen(false);
    }
  }, [
    selectedCurriculumn,
    selectedSubject,
    selectedTopic,
    selectedPaperType,
    selectedYear,
    selectedSeason,
    currentFilter,
    validateInputs,
    setCurrentFilter,
    setIsSidebarOpen,
  ]);

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SheetContent
        className="z-100006 overflow-hidden  py-2"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <ScrollArea className="h-full" type="always">
          <SheetHeader className="sr-only">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex w-full flex-col items-centegrep -r . | wc -lr justify-start gap-4 px-4 py-2">
            <div
              className="flex flex-col items-start justify-start gap-1 w-full"
              ref={topicRef}
            >
              <h3
                className={cn(
                  "w-max font-medium text-sm",
                  invalidInputs.topic && "text-destructive",
                )}
              >
                Topic
              </h3>
              <MultiSelector
                allAvailableOptions={subjectMetadata?.topic ?? []}
                label="Topic"
                onValuesChange={handleTopicChange}
                selectedValues={selectedTopic ?? []}
              />
              {invalidInputs.topic && (
                <p className="text-destructive text-sm">Topic is required</p>
              )}
            </div>
            <div
              className="flex flex-col items-start justify-start gap-1 w-full"
              ref={paperTypeRef}
            >
              <h3
                className={cn(
                  "w-max font-medium text-sm",
                  invalidInputs.paperType && "text-destructive",
                )}
              >
                Paper
              </h3>
              <MultiSelector
                allAvailableOptions={subjectMetadata?.paperType ?? []}
                label="Paper"
                onValuesChange={handlePaperTypeChange}
                selectedValues={selectedPaperType ?? []}
              />
              {invalidInputs.paperType && (
                <p className="text-destructive text-sm">Paper is required</p>
              )}
            </div>
            <div
              className="flex flex-col items-start justify-start gap-1 w-full"
              ref={yearRef}
            >
              <h3
                className={cn(
                  "w-max font-medium text-sm",
                  invalidInputs.year && "text-destructive",
                )}
              >
                Year
              </h3>
              <MultiSelector
                allAvailableOptions={subjectMetadata?.year ?? []}
                label="Year"
                onValuesChange={handleYearChange}
                selectedValues={selectedYear ?? []}
              />
              {invalidInputs.year && (
                <p className="text-destructive text-sm">Year is required</p>
              )}
            </div>
            <div
              className="flex flex-col items-start justify-start gap-1 w-full"
              ref={seasonRef}
            >
              <h3
                className={cn(
                  "w-max font-medium text-sm",
                  invalidInputs.season && "text-destructive",
                )}
              >
                Season
              </h3>
              <MultiSelector
                allAvailableOptions={subjectMetadata?.season ?? []}
                label="Season"
                onValuesChange={handleSeasonChange}
                selectedValues={selectedSeason ?? []}
              />
              {invalidInputs.season && (
                <p className="text-destructive text-sm">Season is required</p>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-4 px-4 mt-2">
            <ButtonUltility
              isMounted={true}
              setIsSidebarOpen={setIsSidebarOpen}
              revert={handleRevert}
              resetEverything={handleResetEverything}
            >
              <Button
                className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
                onClick={handleFilter}
              >
                Filter
                <ScanText />
              </Button>
            </ButtonUltility>
            <Separator />

            <LayoutSetting triggerClassName="flex w-full -mt-1 cursor-pointer items-center justify-start gap-2" />
            <VisualSetting />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default SecondaryAppSidebar;
