import ButtonUltility from "@/features/topical/components/ButtonUltility";
import CacheSetting from "@/features/topical/components/CacheSetting";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import LayoutSetting from "@/features/topical/components/LayoutSetting";
import MultiSelector from "@/features/topical/components/MultiSelector/MultiSelector";
import { RecentQuery } from "@/features/topical/components/RecentQuery";
import VisualSetting from "@/features/topical/components/VisualSetting";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ValidCurriculum } from "@/constants/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { FileText, ScanText } from "lucide-react";
import Link from "next/link";
import { memo, useCallback } from "react";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import {
  useAvailableFilters,
  useFilterPersistence,
  useFilterState,
  useFilterValidation,
} from "../../hooks";
import { AppSidebarProps } from "../../types/components";
import CoursebookCover from "../CoursebookCover";
import EnhancedMultiSelector from "../MultiSelector/EnhancedMultiSelector";
import ShareFilterButton from "./ShareFilterButton";
import StrictModeToggle from "./StrictModeToggle";

const AppSidebar = memo(
  ({
    currentQuery,
    setCurrentQuery,
    setIsSearchEnabled,
    filterUrl,
    isExportModeEnabled,
    mountedRef,
    searchParams,
    setIsValidSearchParams,
    isTopicalDataFetching,
    appUltilityBarRef,
    recentQueryRef,
  }: AppSidebarProps) => {
    const isMobileDevice = useIsMobile();
    const { setIsAppSidebarOpen } = useTopicalApp();

    const {
      filterState: {
        selectedCurriculum,
        selectedSubject,
        selectedTopic,
        selectedYear,
        selectedPaperType,
        selectedSeason,
        currentPaperTypeFilter,
        currentTopicFilter,
        invalidInputs,
        setInvalidInputs,
      },
      setters: { setCurrentPaperTypeFilter, setCurrentTopicFilter },
      handlers: {
        handleCurriculumChange,
        handleSubjectChange,
        handleTopicChange,
        handleYearChange,
        handlePaperTypeChange,
        handleSeasonChange,
        resetEverything,
        revert,
      },
      refs: { curriculumRef, subjectRef, topicRef, yearRef, paperTypeRef, seasonRef },
      other: { sidebarKey },
    } = useFilterState({ currentQuery });

    const { validateInputs } = useFilterValidation({
      curriculumRef,
      subjectRef,
      topicRef,
      yearRef,
      paperTypeRef,
      seasonRef,
      selectedCurriculum,
      selectedSubject,
      selectedTopic,
      selectedYear,
      selectedPaperType,
      selectedSeason,
      setInvalidInputs,
    });

    const {
      availableCurriculum,
      availableSubjects,
      availableTopicsFullInfo,
      subjectSyllabus,
      availableYears,
      availablePaperTypeFullInfo,
      availableSeasons,
      subjectPrerequisite,
    } = useAvailableFilters({
      selectedCurriculum,
      selectedSubject,
    });

    const { isMounted } = useFilterPersistence({
      currentQuery,
      setCurrentQuery,
      setIsSearchEnabled,
      searchParams,
      setIsValidSearchParams,
      mountedRef,
      filterState: {
        selectedCurriculum,
        selectedSubject,
        selectedTopic,
        selectedYear,
        selectedPaperType,
        selectedSeason,
        currentPaperTypeFilter,
        currentTopicFilter,
      },
      setters: {
        setCurrentPaperTypeFilter,
        setCurrentTopicFilter,
      },
      handlers: {
        handleCurriculumChange,
        handleSubjectChange,
        handleTopicChange,
        handleYearChange,
        handlePaperTypeChange,
        handleSeasonChange,
      },
    });

    const onCurriculumChange = useCallback(
      (value: string | ((prev: string) => string)) => {
        if (typeof value === "function") {
          handleCurriculumChange((prev) => value(prev) as ValidCurriculum);
        } else {
          handleCurriculumChange(value as ValidCurriculum);
        }
      },
      [handleCurriculumChange],
    );

    const handleSearch = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const query = {
          curriculumId: selectedCurriculum,
          subjectId: selectedSubject,
          topic: selectedTopic.toSorted(),
          paperType: selectedPaperType.toSorted(),
          year: selectedYear.toSorted((a: string, b: string) => Number(b) - Number(a)),
          season: selectedSeason.toSorted(),
        };
        const isSameQuery = JSON.stringify(currentQuery) == JSON.stringify(query);
        if (validateInputs({ scrollOnError: true }) && !isSameQuery) {
          setIsSearchEnabled(true);
          setCurrentQuery({
            ...query,
          });
        } else if (isSameQuery && isMobileDevice) {
          setIsAppSidebarOpen(false);
        }
      },
      [
        selectedCurriculum,
        selectedSubject,
        selectedTopic,
        selectedPaperType,
        selectedYear,
        selectedSeason,
        currentQuery,
        validateInputs,
        setIsSearchEnabled,
        setCurrentQuery,
        isMobileDevice,
        setIsAppSidebarOpen,
      ],
    );

    const handleTransitionEnd = useCallback(
      (e: React.TransitionEvent) => {
        if (e.propertyName === "left") {
          appUltilityBarRef.current?.overflowScrollHandler?.();
        }
      },
      [appUltilityBarRef],
    );

    return (
      <Sidebar key={sidebarKey} variant="floating" onTransitionEnd={handleTransitionEnd}>
        <SidebarHeader className="sr-only m-0 p-0">Filters</SidebarHeader>
        <ScrollArea className="h-full" type="always">
          <SidebarContent className="flex w-full flex-col items-center justify-start gap-4 overflow-x-hidden p-4 pt-2">
            <Link
              href="/disclaimer"
              className="text-muted-foreground hover:text-foreground flex w-full items-center justify-start gap-2 text-sm transition-colors"
            >
              <FileText className="h-4 w-4" />
              Disclaimer
            </Link>
            <RecentQuery
              ref={recentQueryRef}
              setIsSidebarOpen={setIsAppSidebarOpen}
              setIsSearchEnabled={setIsSearchEnabled}
              setCurrentQuery={setCurrentQuery}
              currentQuery={currentQuery}
              setSelectedCurriculum={handleCurriculumChange}
              setSelectedSubject={handleSubjectChange}
              setSelectedTopic={handleTopicChange}
              setSelectedYear={handleYearChange}
              setSelectedPaperType={handlePaperTypeChange}
              setSelectedSeason={handleSeasonChange}
            />

            <StrictModeToggle />
            <SidebarSeparator />

            <div className="flex w-full flex-col items-center justify-start gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <CoursebookCover
                    selectedSubject={selectedSubject}
                    selectedCurriculum={selectedCurriculum}
                    availableSubjects={availableSubjects}
                    subjectSyllabus={subjectSyllabus}
                  />
                  <div className="flex flex-col items-start justify-start gap-6">
                    <div
                      className="flex flex-col items-start justify-start gap-1"
                      ref={curriculumRef}
                    >
                      <h3
                        className={cn(
                          "w-max text-sm font-medium",
                          invalidInputs.curriculum && "text-destructive",
                        )}
                      >
                        Curriculum
                      </h3>
                      <EnhancedSelect
                        data={availableCurriculum}
                        label="Curriculum"
                        prerequisite=""
                        selectedValue={selectedCurriculum}
                        setSelectedValue={onCurriculumChange}
                      />
                      {invalidInputs.curriculum && (
                        <p className="text-destructive text-sm">Curriculum is required</p>
                      )}
                    </div>

                    <div className="flex flex-col items-start justify-start gap-1" ref={subjectRef}>
                      <h3
                        className={cn(
                          "w-max text-sm font-medium",
                          invalidInputs.subject && "text-destructive",
                        )}
                      >
                        Subject
                      </h3>
                      <EnhancedSelect
                        data={availableSubjects}
                        label="Subject"
                        prerequisite={subjectPrerequisite}
                        selectedValue={selectedSubject}
                        setSelectedValue={handleSubjectChange}
                      />
                      {invalidInputs.subject && (
                        <p className="text-destructive text-sm">Subject is required</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-center justify-center gap-4">
                <div
                  className="flex w-full flex-col items-start justify-start gap-1"
                  ref={topicRef}
                >
                  <h3
                    className={cn(
                      "w-max text-sm font-medium",
                      invalidInputs.topic && "text-destructive",
                    )}
                  >
                    Topic
                  </h3>
                  <EnhancedMultiSelector
                    isMounted={isMounted}
                    currentFilter={currentTopicFilter}
                    setCurrentFilter={setCurrentTopicFilter}
                    allAvailableOptions={availableTopicsFullInfo ?? []}
                    label="Topic"
                    onValuesChange={handleTopicChange}
                    selectedValues={selectedTopic}
                  />
                  {invalidInputs.topic && (
                    <p className="text-destructive text-sm">Topic is required</p>
                  )}
                </div>
                <div
                  className="flex w-full flex-col items-start justify-start gap-1"
                  ref={paperTypeRef}
                >
                  <h3
                    className={cn(
                      "w-max text-sm font-medium",
                      invalidInputs.paperType && "text-destructive",
                    )}
                  >
                    Paper
                  </h3>
                  <EnhancedMultiSelector
                    isMounted={isMounted}
                    currentFilter={currentPaperTypeFilter}
                    setCurrentFilter={setCurrentPaperTypeFilter}
                    allAvailableOptions={availablePaperTypeFullInfo ?? []}
                    label="Paper"
                    onValuesChange={handlePaperTypeChange}
                    selectedValues={selectedPaperType}
                  />
                  {invalidInputs.paperType && (
                    <p className="text-destructive text-sm">Paper is required</p>
                  )}
                </div>
                <div className="flex w-full flex-col items-start justify-start gap-1" ref={yearRef}>
                  <h3
                    className={cn(
                      "w-max text-sm font-medium",
                      invalidInputs.year && "text-destructive",
                    )}
                  >
                    Year
                  </h3>
                  <MultiSelector
                    allAvailableOptions={availableYears ?? []}
                    label="Year"
                    onValuesChange={handleYearChange}
                    selectedValues={selectedYear}
                  />
                  {invalidInputs.year && (
                    <p className="text-destructive text-sm">Year is required</p>
                  )}
                </div>
                <div
                  className="flex w-full flex-col items-start justify-start gap-1"
                  ref={seasonRef}
                >
                  <h3
                    className={cn(
                      "w-max text-sm font-medium",
                      invalidInputs.season && "text-destructive",
                    )}
                  >
                    Season
                  </h3>
                  <MultiSelector
                    allAvailableOptions={availableSeasons ?? []}
                    label="Season"
                    onValuesChange={handleSeasonChange}
                    selectedValues={selectedSeason}
                  />
                  {invalidInputs.season && (
                    <p className="text-destructive text-sm">Season is required</p>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col items-center justify-center gap-3">
                <ButtonUltility
                  isMounted={isMounted}
                  revert={revert}
                  resetEverything={resetEverything}
                  setIsSidebarOpen={setIsAppSidebarOpen}
                >
                  <Button
                    className="bg-logo-main hover:bg-logo-main/90 w-full cursor-pointer text-white"
                    disabled={!isMounted || isTopicalDataFetching}
                    onClick={handleSearch}
                  >
                    {isTopicalDataFetching ? "Searching" : "Search"}
                    <ScanText />
                  </Button>
                  <ShareFilterButton isDisabled={isTopicalDataFetching} filterUrl={filterUrl} />
                </ButtonUltility>
              </div>
            </div>
            <SidebarSeparator />
            <CacheSetting />
            <LayoutSetting triggerClassName="flex w-full -mt-1 cursor-pointer items-center justify-start gap-2" />
            <VisualSetting />
          </SidebarContent>
        </ScrollArea>
        <SidebarRail disabled={isExportModeEnabled} />
      </Sidebar>
    );
  },
);

AppSidebar.displayName = "AppSidebar";

export default AppSidebar;
