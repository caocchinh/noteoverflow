import MultiSelector from "@/features/topical/components/MultiSelector/MultiSelector";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import ButtonUltility from "@/features/topical/components/ButtonUltility";
import CacheSetting from "@/features/topical/components/CacheSetting";
import LayoutSetting from "@/features/topical/components/LayoutSetting";
import VisualSetting from "@/features/topical/components/VisualSetting";
import { RecentQuery } from "@/features/topical/components/RecentQuery";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ScanText, Send, FileText } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  useFilterState,
  useFilterValidation,
  useAvailableFilters,
} from "../hooks";
import {
  DEFAULT_CACHE,
  FILTERS_CACHE_KEY,
  INVALID_INPUTS_DEFAULT,
  UI_PREFERENCES_CACHE_KEY,
} from "../constants/constants";
import type {
  CIE_A_LEVEL_SUBDIVISION,
  ValidCurriculum,
} from "@/constants/types";
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
  syncFilterCacheToLocalStorage,
  validateSubcurriculumnDivision,
} from "@/features/topical/lib/utils";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { Button } from "@/components/ui/button";
import { QR } from "./QR";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import EnhancedMultiSelector from "./MultiSelector/EnhancedMultiSelector";
import CoursebookCover from "./CoursebookCover";
import Link from "next/link";
import { AppSidebarProps } from "../types/components";
import { FiltersCache, UiPreferencesCache } from "../types/preferences";

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
    const [isMounted, setIsMounted] = useState(false);
    const [currentTopicFilter, setCurrentTopicFilter] = useState<
      CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
    >(undefined);
    const [currentPaperTypeFilter, setCurrentPaperTypeFilter] = useState<
      CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
    >(undefined);

    const [sidebarKey, setSidebarKey] = useState(0);
    const isMobileDevice = useIsMobile();
    const { setIsAppSidebarOpen } = useTopicalApp();
    const isOverwriting = useRef(false);

    const {
      values: {
        selectedCurriculum,
        selectedSubject,
        selectedTopic,
        selectedYear,
        selectedPaperType,
        selectedSeason,
      },
      setters: {
        setSelectedCurriculum,
        setSelectedSubject,
        setSelectedTopic,
        setSelectedYear,
        setSelectedPaperType,
        setSelectedSeason,
      },
      handlers: {
        handleCurriculumChange,
        handleSubjectChange,
        handleTopicChange,
        handleYearChange,
        handlePaperTypeChange,
        handleSeasonChange,
        resetAllFilters,
      },
      refs: {
        curriculumRef,
        subjectRef,
        topicRef,
        yearRef,
        paperTypeRef,
        seasonRef,
      },
      invalidInputs,
      setInvalidInputs,
    } = useFilterState({
      onCurriculumChange: () => {
        setCurrentTopicFilter(undefined);
        setCurrentPaperTypeFilter(undefined);
      },
      onSubjectChange: () => {
        setCurrentTopicFilter(undefined);
        setCurrentPaperTypeFilter(undefined);
      },
    });

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

    const handleTransitionEnd = useCallback(
      (e: React.TransitionEvent) => {
        if (e.propertyName === "left") {
          appUltilityBarRef.current?.overflowScrollHandler?.();
        }
      },
      [appUltilityBarRef],
    );

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

    const revert = useCallback(() => {
      if (!currentQuery.curriculumId || !currentQuery.subjectId) {
        return;
      }
      isOverwriting.current = true;
      setSelectedCurriculum(currentQuery.curriculumId as ValidCurriculum);
      setSelectedSubject(currentQuery.subjectId);
      setSelectedTopic(currentQuery.topic);
      setSelectedYear(currentQuery.year);
      setSelectedPaperType(currentQuery.paperType);
      setSelectedSeason(currentQuery.season);
      setTimeout(() => {
        isOverwriting.current = false;
      }, 0);
    }, [
      currentQuery.curriculumId,
      currentQuery.paperType,
      currentQuery.season,
      currentQuery.subjectId,
      currentQuery.topic,
      currentQuery.year,
      setSelectedCurriculum,
      setSelectedPaperType,
      setSelectedSeason,
      setSelectedSubject,
      setSelectedTopic,
      setSelectedYear,
    ]);

    const resetEverything = useCallback(() => {
      isOverwriting.current = true;
      try {
        const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
        const stateToSave: FiltersCache = existingStateJSON
          ? JSON.parse(existingStateJSON)
          : { ...DEFAULT_CACHE };

        stateToSave.lastSessionCurriculum = "";
        stateToSave.lastSessionCurriculum = "";
        if (selectedCurriculum && selectedSubject) {
          stateToSave.filters = {
            ...stateToSave.filters,
            [selectedCurriculum]: {
              ...stateToSave.filters?.[selectedCurriculum],
              [selectedSubject]: {
                topic: [],
                paperType: [],
                year: [],
                season: [],
                paperTypeSubcurriculumnDivisionPreference: undefined,
                topicSubcurriculumnDivisionPreference: undefined,
              },
            },
          };
        }

        localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to access localStorage:", error);
      }

      resetAllFilters();
      if (!isMobileDevice) {
        setSidebarKey((prev) => prev + 1);
      }
      setTimeout(() => {
        isOverwriting.current = false;
      }, 0);
    }, [resetAllFilters, isMobileDevice, selectedCurriculum, selectedSubject]);

    useEffect(() => {
      if (mountedRef.current) {
        return;
      }
      let parsedQueryFromSearchParams;
      if (searchParams.queryKey) {
        try {
          parsedQueryFromSearchParams = JSON.parse(
            searchParams.queryKey as string,
          );
        } catch {
          parsedQueryFromSearchParams = undefined;
          setIsValidSearchParams(false);
        }
        if (
          !parsedQueryFromSearchParams ||
          !validateCurriculum(parsedQueryFromSearchParams.curriculumId) ||
          !validateSubject(
            parsedQueryFromSearchParams.curriculumId,
            parsedQueryFromSearchParams.subjectId,
          ) ||
          !validateFilterData({
            data: {
              topic: parsedQueryFromSearchParams.topic,
              paperType: parsedQueryFromSearchParams.paperType,
              year: parsedQueryFromSearchParams.year,
              season: parsedQueryFromSearchParams.season,
            },
            curriculumn: parsedQueryFromSearchParams.curriculumId,
            subject: parsedQueryFromSearchParams.subjectId,
          })
        ) {
          parsedQueryFromSearchParams = undefined;
          setIsValidSearchParams(false);
        } else {
          setIsValidSearchParams(true);
          setCurrentQuery(parsedQueryFromSearchParams);
          setIsSearchEnabled(true);
        }
      }

      const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
      const savedUiPreferences = localStorage.getItem(UI_PREFERENCES_CACHE_KEY);
      const parsedState: FiltersCache = savedState
        ? JSON.parse(savedState)
        : false;
      const parsedUiPreferences: UiPreferencesCache = savedUiPreferences
        ? JSON.parse(savedUiPreferences)
        : false;

      let subject: string | undefined;
      let curriculumn: string | undefined;

      if (savedState && savedUiPreferences && !parsedQueryFromSearchParams) {
        if (
          parsedUiPreferences.isSessionCacheEnabled &&
          parsedState.lastSessionCurriculum &&
          validateCurriculum(parsedState.lastSessionCurriculum)
        ) {
          setSelectedCurriculum(
            parsedState.lastSessionCurriculum as ValidCurriculum,
          );
          curriculumn = parsedState.lastSessionCurriculum;
          const isSubjectValid = validateSubject(
            parsedState.lastSessionCurriculum,
            parsedState.lastSessionSubject,
          );
          if (parsedState.lastSessionSubject && isSubjectValid) {
            setSelectedSubject(parsedState.lastSessionSubject);
            subject = parsedState.lastSessionSubject;
          }
          if (
            isSubjectValid &&
            validateFilterData({
              curriculumn: parsedState.lastSessionCurriculum,
              data: parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ],
              subject: parsedState.lastSessionSubject,
            })
          ) {
            setSelectedSubject(parsedState.lastSessionSubject);
            setSelectedTopic(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].topic,
            );
            setSelectedPaperType(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].paperType,
            );
            setSelectedYear(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].year,
            );
            setSelectedSeason(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].season,
            );
          }
        }
      } else if (parsedQueryFromSearchParams) {
        curriculumn = parsedQueryFromSearchParams.curriculumId;
        subject = parsedQueryFromSearchParams.subjectId;
        setSelectedCurriculum(
          parsedQueryFromSearchParams.curriculumId as ValidCurriculum,
        );
        setSelectedSubject(parsedQueryFromSearchParams.subjectId);
        setSelectedPaperType(parsedQueryFromSearchParams.paperType);
        setSelectedTopic(parsedQueryFromSearchParams.topic);
        setSelectedYear(parsedQueryFromSearchParams.year);
        setSelectedSeason(parsedQueryFromSearchParams.season);
        syncFilterCacheToLocalStorage({
          selectedCurriculum: parsedQueryFromSearchParams.curriculumId,
          selectedSubject: parsedQueryFromSearchParams.subjectId,
          selectedTopic: parsedQueryFromSearchParams.topic,
          selectedPaperType: parsedQueryFromSearchParams.paperType,
          selectedYear: parsedQueryFromSearchParams.year,
          selectedSeason: parsedQueryFromSearchParams.season,
        });
      }
      if (curriculumn && subject) {
        try {
          const savedPaperTypeSubcurriculumnDivision =
            parsedState.filters[curriculumn][subject]
              .paperTypeSubcurriculumnDivisionPreference;
          const savedTopicSubcurriculumnDivision =
            parsedState.filters[curriculumn][subject]
              .topicSubcurriculumnDivisionPreference;
          if (
            savedPaperTypeSubcurriculumnDivision &&
            validateSubcurriculumnDivision({
              value: savedPaperTypeSubcurriculumnDivision,
              type: "paperType",
              subject,
              curriculum: curriculumn,
            })
          ) {
            setCurrentPaperTypeFilter(savedPaperTypeSubcurriculumnDivision);
          } else {
            setCurrentPaperTypeFilter(undefined);
          }
          if (
            savedTopicSubcurriculumnDivision &&
            validateSubcurriculumnDivision({
              value: savedTopicSubcurriculumnDivision,
              type: "topic",
              subject,
              curriculum: curriculumn,
            })
          ) {
            setCurrentTopicFilter(savedTopicSubcurriculumnDivision);
          } else {
            setCurrentTopicFilter(undefined);
          }
        } catch {
          setCurrentTopicFilter(undefined);
          setCurrentPaperTypeFilter(undefined);
        }
      }

      setTimeout(() => {
        mountedRef.current = true;
        setIsMounted(true);
      }, 0);
    }, [
      mountedRef,
      searchParams,
      setCurrentQuery,
      setIsSearchEnabled,
      setIsValidSearchParams,
      setSelectedCurriculum,
      setSelectedPaperType,
      setSelectedSeason,
      setSelectedSubject,
      setSelectedTopic,
      setSelectedYear,
    ]);

    useEffect(() => {
      if (!mountedRef.current || isOverwriting.current) {
        return;
      }
      const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
      const savedUiPreferences = localStorage.getItem(UI_PREFERENCES_CACHE_KEY);

      if (savedState && savedUiPreferences) {
        try {
          const parsedState: FiltersCache = JSON.parse(savedState);
          const parsedUiPreferences: UiPreferencesCache =
            JSON.parse(savedUiPreferences);
          if (parsedUiPreferences.isPersistantCacheEnabled) {
            const isSubjectValid = validateSubject(
              selectedCurriculum,
              selectedSubject,
            );
            if (selectedSubject && isSubjectValid) {
              setSelectedSubject(selectedSubject);
            }
            try {
              const savedPaperTypeSubcurriculumnDivision =
                parsedState.filters[selectedCurriculum][selectedSubject]
                  .paperTypeSubcurriculumnDivisionPreference;
              const savedTopicSubcurriculumnDivision =
                parsedState.filters[selectedCurriculum][selectedSubject]
                  .topicSubcurriculumnDivisionPreference;
              if (
                savedPaperTypeSubcurriculumnDivision &&
                validateSubcurriculumnDivision({
                  value: savedPaperTypeSubcurriculumnDivision,
                  type: "paperType",
                  curriculum: selectedCurriculum,
                  subject: selectedSubject,
                })
              ) {
                setCurrentPaperTypeFilter(savedPaperTypeSubcurriculumnDivision);
              } else {
                setCurrentPaperTypeFilter(undefined);
              }
              if (
                savedTopicSubcurriculumnDivision &&
                validateSubcurriculumnDivision({
                  value: savedTopicSubcurriculumnDivision,
                  type: "topic",
                  curriculum: selectedCurriculum,
                  subject: selectedSubject,
                })
              ) {
                setCurrentTopicFilter(savedTopicSubcurriculumnDivision);
              } else {
                setCurrentTopicFilter(undefined);
              }
            } catch {
              setCurrentTopicFilter(undefined);
              setCurrentPaperTypeFilter(undefined);
            }
            if (
              isSubjectValid &&
              validateFilterData({
                data: parsedState.filters[selectedCurriculum][selectedSubject],
                curriculumn: selectedCurriculum,
                subject: selectedSubject,
              })
            ) {
              setSelectedTopic(
                parsedState.filters[selectedCurriculum][selectedSubject].topic,
              );
              setSelectedPaperType(
                parsedState.filters[selectedCurriculum][selectedSubject]
                  .paperType,
              );
              setSelectedYear(
                parsedState.filters[selectedCurriculum][selectedSubject].year,
              );
              setSelectedSeason(
                parsedState.filters[selectedCurriculum][selectedSubject].season,
              );
            } else {
              setSelectedTopic([]);
              setSelectedYear([]);
              setSelectedPaperType([]);
              setSelectedSeason([]);
            }
          } else {
            setSelectedTopic([]);
            setSelectedYear([]);
            setSelectedPaperType([]);
            setSelectedSeason([]);
            setCurrentTopicFilter(undefined);
            setCurrentPaperTypeFilter(undefined);
          }
        } catch {
          setSelectedTopic([]);
          setSelectedYear([]);
          setSelectedPaperType([]);
          setSelectedSeason([]);
          setCurrentTopicFilter(undefined);
          setCurrentPaperTypeFilter(undefined);
        }
      } else {
        setSelectedTopic([]);
        setSelectedYear([]);
        setSelectedPaperType([]);
        setSelectedSeason([]);
        setCurrentTopicFilter(undefined);
        setCurrentPaperTypeFilter(undefined);
      }

      setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubject]);

    useEffect(() => {
      if (!mountedRef.current || isOverwriting.current) {
        return;
      }
      setSelectedSubject("");
      setSelectedTopic([]);
      setSelectedYear([]);
      setSelectedPaperType([]);
      setSelectedSeason([]);
      setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
    }, [
      selectedCurriculum,
      isOverwriting,
      mountedRef,
      setSelectedSubject,
      setSelectedTopic,
      setSelectedYear,
      setSelectedPaperType,
      setSelectedSeason,
      setInvalidInputs,
    ]);

    useEffect(() => {
      if (!mountedRef.current) {
        return;
      }
      syncFilterCacheToLocalStorage({
        selectedCurriculum,
        selectedSubject,
        selectedTopic,
        selectedPaperType,
        selectedYear,
        selectedSeason,
        paperTypeSubcurriculumnDivisionPreference: currentPaperTypeFilter,
        topicSubcurriculumnDivisionPreference: currentTopicFilter,
      });
    }, [
      selectedCurriculum,
      selectedSubject,
      selectedTopic,
      selectedPaperType,
      selectedYear,
      selectedSeason,
      currentPaperTypeFilter,
      currentTopicFilter,
      mountedRef,
    ]);

    const handleSearch = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const query = {
          curriculumId: selectedCurriculum,
          subjectId: selectedSubject,
          topic: selectedTopic.toSorted(),
          paperType: selectedPaperType.toSorted(),
          year: selectedYear.toSorted(
            (a: string, b: string) => Number(b) - Number(a),
          ),
          season: selectedSeason.toSorted(),
        };
        const isSameQuery =
          JSON.stringify(currentQuery) == JSON.stringify(query);
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

    const handleCurriculumSelectChange = useCallback(
      (value: string | ((prev: string) => string)) => {
        handleCurriculumChange(value);
      },
      [handleCurriculumChange],
    );

    const handleSubjectSelectChange = handleSubjectChange;

    return (
      <Sidebar
        key={sidebarKey}
        variant="floating"
        onTransitionEnd={handleTransitionEnd}
      >
        <SidebarHeader className="sr-only m-0 p-0 ">Filters</SidebarHeader>
        <ScrollArea className="h-full" type="always">
          <SidebarContent className="flex w-full flex-col items-center justify-start gap-4 overflow-x-hidden p-4 pt-2">
            <Link
              href="/disclaimer"
              className="flex w-full items-center justify-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
              setSelectedCurriculum={setSelectedCurriculum}
              setSelectedSubject={setSelectedSubject}
              setSelectedTopic={setSelectedTopic}
              setSelectedYear={setSelectedYear}
              setSelectedPaperType={setSelectedPaperType}
              setSelectedSeason={setSelectedSeason}
              isOverwriting={isOverwriting}
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
                          "w-max font-medium text-sm",
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
                        setSelectedValue={handleCurriculumSelectChange}
                      />
                      {invalidInputs.curriculum && (
                        <p className="text-destructive text-sm">
                          Curriculum is required
                        </p>
                      )}
                    </div>

                    <div
                      className="flex flex-col items-start justify-start gap-1"
                      ref={subjectRef}
                    >
                      <h3
                        className={cn(
                          "w-max font-medium text-sm",
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
                        setSelectedValue={handleSubjectSelectChange}
                      />
                      {invalidInputs.subject && (
                        <p className="text-destructive text-sm">
                          Subject is required
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 w-full">
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
                    <p className="text-destructive text-sm">
                      Topic is required
                    </p>
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
                    <p className="text-destructive text-sm">
                      Paper is required
                    </p>
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
                    allAvailableOptions={availableSeasons ?? []}
                    label="Season"
                    onValuesChange={handleSeasonChange}
                    selectedValues={selectedSeason}
                  />
                  {invalidInputs.season && (
                    <p className="text-destructive text-sm">
                      Season is required
                    </p>
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
                    className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
                    disabled={!isMounted || isTopicalDataFetching}
                    onClick={handleSearch}
                  >
                    {isTopicalDataFetching ? "Searching" : "Search"}
                    <ScanText />
                  </Button>
                  <ShareFilterButton
                    isDisabled={isTopicalDataFetching}
                    filterUrl={filterUrl}
                  />
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

const StrictModeToggle = memo(() => {
  const { uiPreferences, setUiPreference } = useTopicalApp();

  const handleStrictModeToggle = useCallback(() => {
    setUiPreference("isStrictModeEnabled", (prev) => !prev);
  }, [setUiPreference]);

  return (
    <div className="w-full flex items-center justify-around rounded-md border border-muted-foreground/20 bg-muted p-2">
      <div className="w-[70%] flex items-start justify-center flex-col">
        <p className="text-sm font-semibold">Strict mode</p>
        <p className="text-xs text-muted-foreground">
          Questions containing unrelated topics will be excluded.
        </p>
      </div>
      <Switch
        checked={uiPreferences.isStrictModeEnabled}
        title="Toggle"
        className="hover:cursor-pointer"
        onCheckedChange={handleStrictModeToggle}
      />
    </div>
  );
});
StrictModeToggle.displayName = "StrictModeToggle";

const ShareFilterButton = memo(
  ({ isDisabled, filterUrl }: { isDisabled: boolean; filterUrl: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button
          className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
          disabled={isDisabled}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Share filter
          <Send />
        </Button>
        <QR url={filterUrl} isOpen={isOpen} setIsOpen={setIsOpen} />
      </>
    );
  },
);
ShareFilterButton.displayName = "ShareFilterButton";
