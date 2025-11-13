import { AnimatePresence, motion } from "framer-motion";
import MultiSelector from "@/features/topical/components/MultiSelector/MultiSelector";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import ButtonUltility from "@/features/topical/components/ButtonUltility";
import CacheSetting from "@/features/topical/components/CacheSetting";
import LayoutSetting from "@/features/topical/components/LayoutSetting";
import VisualSetting from "@/features/topical/components/VisualSetting";
import { RecentQuery } from "@/features/topical/components/RecentQuery";
import { TOPICAL_DATA } from "@/constants/constants";
import { default as NextImage } from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { BookMarked, CalendarOff, ScanText, Send } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiltersCache,
  InvalidInputs,
  AppSidebarProps,
  UiPreferencesCache,
} from "../constants/types";
import {
  DEFAULT_CACHE,
  FILTERS_CACHE_KEY,
  INVALID_INPUTS_DEFAULT,
  UI_PREFERENCES_CACHE_KEY,
} from "../constants/constants";
import type {
  CIE_A_LEVEL_SUBDIVISION,
  TopicalSubject,
  ValidCurriculum,
} from "@/constants/types";
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
  syncFilterCacheToLocalStorage,
  isValidInputs as isValidInputsUtils,
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

const AppSidebar = memo(
  ({
    currentQuery,
    setCurrentQuery,
    setIsSearchEnabled,
    filterUrl,
    mountedRef,
    searchParams,
    setIsValidSearchParams,
    isTopicalDataFetching,
    appUltilityBarRef,
    recentQueryRef,
  }: AppSidebarProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] =
      useState<ValidCurriculum>("CIE A-LEVEL");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string[]>([]);
    const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
    const [currentTopicFilter, setCurrentTopicFilter] = useState<
      CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
    >(undefined);
    const [currentPaperTypeFilter, setCurrentPaperTypeFilter] = useState<
      CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
    >(undefined);

    const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({
      ...INVALID_INPUTS_DEFAULT,
    });
    const [sidebarKey, setSidebarKey] = useState(0);
    const isMobileDevice = useIsMobile();
    const { setIsAppSidebarOpen } = useTopicalApp();
    const curriculumRef = useRef<HTMLDivElement | null>(null);
    const subjectRef = useRef<HTMLDivElement | null>(null);
    const topicRef = useRef<HTMLDivElement | null>(null);
    const yearRef = useRef<HTMLDivElement | null>(null);
    const paperTypeRef = useRef<HTMLDivElement | null>(null);
    const seasonRef = useRef<HTMLDivElement | null>(null);
    const isOverwriting = useRef(false);

    const handleTransitionEnd = useCallback(
      (e: React.TransitionEvent) => {
        if (e.propertyName === "left") {
          appUltilityBarRef.current?.overflowScrollHandler?.();
        }
      },
      [appUltilityBarRef]
    );

    const availableSubjects = useMemo(() => {
      return TOPICAL_DATA[
        TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
      ]?.subject;
    }, [selectedCurriculum]);

    const subjectSyllabus = TOPICAL_DATA.find(
      (item) => item.curriculum === selectedCurriculum
    )?.subject.find((sub) => sub.code === selectedSubject)?.syllabusLink;

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
      return availableSubjects?.find((item) => item.code === selectedSubject)
        ?.year;
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

    // Memoized props to prevent unnecessary re-renders
    const curriculumData = useMemo(() => {
      return TOPICAL_DATA.map((item) => ({
        code: item.curriculum,
        coverImage: item.coverImage,
      }));
    }, []);

    const subjectPrerequisite = useMemo(() => {
      return selectedCurriculum ? "" : "Curriculum";
    }, [selectedCurriculum]);

    const yearData = useMemo(() => {
      return availableYears?.map((item) => item.toString());
    }, [availableYears]);

    const revert = () => {
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
    };

    const resetEverything = () => {
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

      setSelectedCurriculum("CIE A-LEVEL");
      setSelectedSubject("");
      setSelectedTopic([]);
      setSelectedYear([]);
      setSelectedPaperType([]);
      setSelectedSeason([]);
      if (!isMobileDevice) {
        setSidebarKey((prev) => prev + 1);
      }
      setTimeout(() => {
        isOverwriting.current = false;
      }, 0);
    };

    const isValidInputs = useCallback(
      ({ scrollOnError = true }: { scrollOnError?: boolean }) => {
        return isValidInputsUtils({
          scrollOnError,
          curriculumRef: curriculumRef,
          subjectRef: subjectRef,
          topicRef: topicRef,
          yearRef: yearRef,
          paperTypeRef: paperTypeRef,
          seasonRef: seasonRef,
          selectedCurriculum: selectedCurriculum,
          selectedSubject: selectedSubject,
          selectedTopic: selectedTopic,
          selectedYear: selectedYear,
          selectedPaperType: selectedPaperType,
          selectedSeason: selectedSeason,
          setInvalidInputs: setInvalidInputs,
        });
      },
      [
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
      ]
    );

    useEffect(() => {
      if (selectedCurriculum) {
        setInvalidInputs((prev) => ({ ...prev, curriculum: false }));
      }
    }, [selectedCurriculum]);

    useEffect(() => {
      if (selectedSubject) {
        setInvalidInputs((prev) => ({ ...prev, subject: false }));
      }
    }, [selectedSubject]);

    useEffect(() => {
      if (selectedTopic.length > 0) {
        setInvalidInputs((prev) => ({ ...prev, topic: false }));
      }
    }, [selectedTopic]);

    useEffect(() => {
      if (selectedPaperType.length > 0) {
        setInvalidInputs((prev) => ({ ...prev, paperType: false }));
      }
    }, [selectedPaperType]);

    useEffect(() => {
      if (selectedYear.length > 0) {
        setInvalidInputs((prev) => ({ ...prev, year: false }));
      }
    }, [selectedYear]);

    useEffect(() => {
      if (selectedSeason.length > 0) {
        setInvalidInputs((prev) => ({ ...prev, season: false }));
      }
    }, [selectedSeason]);

    useEffect(() => {
      if (mountedRef.current) {
        return;
      }
      let parsedQueryFromSearchParams;
      if (searchParams.queryKey) {
        try {
          parsedQueryFromSearchParams = JSON.parse(
            searchParams.queryKey as string
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
            parsedQueryFromSearchParams.subjectId
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
            parsedState.lastSessionCurriculum as ValidCurriculum
          );
          curriculumn = parsedState.lastSessionCurriculum;
          const isSubjectValid = validateSubject(
            parsedState.lastSessionCurriculum,
            parsedState.lastSessionSubject
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
              ].topic
            );
            setSelectedPaperType(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].paperType
            );
            setSelectedYear(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].year
            );
            setSelectedSeason(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].season
            );
          }
        }
      } else if (parsedQueryFromSearchParams) {
        curriculumn = parsedQueryFromSearchParams.curriculumId;
        subject = parsedQueryFromSearchParams.subjectId;
        setSelectedCurriculum(
          parsedQueryFromSearchParams.curriculumId as ValidCurriculum
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
            validateSubcurriculumnDivision(savedPaperTypeSubcurriculumnDivision)
          ) {
            setCurrentPaperTypeFilter(savedPaperTypeSubcurriculumnDivision);
          }
          if (
            savedTopicSubcurriculumnDivision &&
            validateSubcurriculumnDivision(savedTopicSubcurriculumnDivision)
          ) {
            setCurrentTopicFilter(savedTopicSubcurriculumnDivision);
          }
        } catch {}
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
              selectedSubject
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
                validateSubcurriculumnDivision(
                  savedPaperTypeSubcurriculumnDivision
                )
              ) {
                setCurrentPaperTypeFilter(savedPaperTypeSubcurriculumnDivision);
              }
              if (
                savedTopicSubcurriculumnDivision &&
                validateSubcurriculumnDivision(savedTopicSubcurriculumnDivision)
              ) {
                setCurrentTopicFilter(savedTopicSubcurriculumnDivision);
              }
            } catch {}
            if (
              isSubjectValid &&
              validateFilterData({
                data: parsedState.filters[selectedCurriculum][selectedSubject],
                curriculumn: selectedCurriculum,
                subject: selectedSubject,
              })
            ) {
              setSelectedTopic(
                parsedState.filters[selectedCurriculum][selectedSubject].topic
              );
              setSelectedPaperType(
                parsedState.filters[selectedCurriculum][selectedSubject]
                  .paperType
              );
              setSelectedYear(
                parsedState.filters[selectedCurriculum][selectedSubject].year
              );
              setSelectedSeason(
                parsedState.filters[selectedCurriculum][selectedSubject].season
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
          }
        } catch {
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
    }, [selectedCurriculum, isOverwriting, mountedRef]);

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
          year: selectedYear.toSorted((a, b) => Number(b) - Number(a)),
          season: selectedSeason.toSorted(),
        };
        const isSameQuery =
          JSON.stringify(currentQuery) == JSON.stringify(query);
        if (isValidInputs({ scrollOnError: true }) && !isSameQuery) {
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
        isValidInputs,
        setIsSearchEnabled,
        setCurrentQuery,
        isMobileDevice,
        setIsAppSidebarOpen,
      ]
    );

    return (
      <Sidebar
        key={sidebarKey}
        variant="floating"
        onTransitionEnd={handleTransitionEnd}
      >
        <SidebarHeader className="sr-only m-0 p-0 ">Filters</SidebarHeader>
        <ScrollArea className="h-full" type="always">
          <SidebarContent className="flex w-full flex-col items-center justify-start gap-4 overflow-x-hidden p-4 pt-2">
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
                          invalidInputs.curriculum && "text-destructive"
                        )}
                      >
                        Curriculum
                      </h3>
                      <EnhancedSelect
                        data={curriculumData}
                        label="Curriculum"
                        prerequisite=""
                        selectedValue={selectedCurriculum}
                        setSelectedValue={useCallback((value) => {
                          setSelectedCurriculum(value as ValidCurriculum);
                        }, [])}
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
                          invalidInputs.subject && "text-destructive"
                        )}
                      >
                        Subject
                      </h3>
                      <EnhancedSelect
                        data={availableSubjects}
                        label="Subject"
                        prerequisite={subjectPrerequisite}
                        selectedValue={selectedSubject}
                        setSelectedValue={useCallback(setSelectedSubject, [
                          setSelectedSubject,
                        ])}
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
              <div className="flex flex-col items-center justify-center gap-4">
                <div
                  className="flex flex-col items-start justify-start gap-1"
                  ref={topicRef}
                >
                  <h3
                    className={cn(
                      "w-max font-medium text-sm",
                      invalidInputs.topic && "text-destructive"
                    )}
                  >
                    Topic
                  </h3>
                  <EnhancedMultiSelector
                    currentFilter={currentTopicFilter}
                    setCurrentFilter={setCurrentTopicFilter}
                    allAvailableOptions={availableTopicsFullInfo ?? []}
                    label="Topic"
                    onValuesChange={useCallback(
                      (values) => setSelectedTopic(values as string[]),
                      []
                    )}
                    selectedValues={selectedTopic}
                  />
                  {invalidInputs.topic && (
                    <p className="text-destructive text-sm">
                      Topic is required
                    </p>
                  )}
                </div>
                <div
                  className="flex flex-col items-start justify-start gap-1"
                  ref={paperTypeRef}
                >
                  <h3
                    className={cn(
                      "w-max font-medium text-sm",
                      invalidInputs.paperType && "text-destructive"
                    )}
                  >
                    Paper
                  </h3>
                  <EnhancedMultiSelector
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
                  {invalidInputs.paperType && (
                    <p className="text-destructive text-sm">
                      Paper is required
                    </p>
                  )}
                </div>
                <div
                  className="flex flex-col items-start justify-start gap-1"
                  ref={yearRef}
                >
                  <h3
                    className={cn(
                      "w-max font-medium text-sm",
                      invalidInputs.year && "text-destructive"
                    )}
                  >
                    Year
                  </h3>
                  <MultiSelector
                    allAvailableOptions={yearData ?? []}
                    label="Year"
                    onValuesChange={useCallback(
                      (values) => setSelectedYear(values as string[]),
                      []
                    )}
                    selectedValues={selectedYear}
                  />
                  {invalidInputs.year && (
                    <p className="text-destructive text-sm">Year is required</p>
                  )}
                </div>
                <div
                  className="flex flex-col items-start justify-start gap-1"
                  ref={seasonRef}
                >
                  <h3
                    className={cn(
                      "w-max font-medium text-sm",
                      invalidInputs.season && "text-destructive"
                    )}
                  >
                    Season
                  </h3>
                  <MultiSelector
                    allAvailableOptions={availableSeasons ?? []}
                    label="Season"
                    onValuesChange={useCallback(
                      (values) => setSelectedSeason(values as string[]),
                      []
                    )}
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
            <LayoutSetting />
            <VisualSetting />
          </SidebarContent>
        </ScrollArea>
        <SidebarRail />
      </Sidebar>
    );
  }
);

AppSidebar.displayName = "AppSidebar";

export default AppSidebar;

const CoursebookCover = memo(
  ({
    selectedSubject,
    selectedCurriculum,
    availableSubjects,
    subjectSyllabus,
  }: {
    selectedSubject: string;
    selectedCurriculum: ValidCurriculum;
    availableSubjects: TopicalSubject[];
    subjectSyllabus: string | undefined;
  }) => {
    return (
      <AnimatePresence mode="wait">
        {selectedSubject && selectedCurriculum ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            key={selectedSubject}
            transition={{
              duration: 0.15,
              ease: "easeInOut",
            }}
            className="flex flex-col gap-2"
          >
            <NextImage
              alt="cover"
              className="self-center rounded-[2px]"
              height={126}
              src={
                availableSubjects.find((item) => item.code === selectedSubject)
                  ?.coverImage ?? ""
              }
              width={100}
            />
            {subjectSyllabus ? (
              <a
                className="w-full flex items-center text-sm justify-center rounded-md border border-muted-foreground/20 bg-muted p-1 gap-1 flex-row"
                href={subjectSyllabus}
                target="_blank"
                title="Open syllabus"
                rel="noreferrer"
              >
                Syllabus
                <BookMarked size={15} />
              </a>
            ) : (
              <div className="w-full flex items-center text-sm justify-center rounded-md border border-muted-foreground/20 bg-muted p-1 gap-1 flex-row">
                Outdated
                <CalendarOff size={15} />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            key={selectedSubject}
            transition={{
              duration: 0.15,
              ease: "easeInOut",
            }}
          >
            <NextImage
              alt="default subject"
              className="self-center"
              height={100}
              src="/assets/pointing.webp"
              width={100}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
CoursebookCover.displayName = "CoursebookCover";

const StrictModeToggle = memo(() => {
  const { uiPreferences, setUiPreference } = useTopicalApp();
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
        onCheckedChange={useCallback(() => {
          setUiPreference("isStrictModeEnabled", (prev) => !prev);
        }, [setUiPreference])}
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
  }
);
ShareFilterButton.displayName = "ShareFilterButton";
