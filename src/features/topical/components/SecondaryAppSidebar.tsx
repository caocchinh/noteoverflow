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
import { isValidInputs as isValidInputsUtils } from "@/features/topical/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  InvalidInputs,
  SecondaryAppSidebarProps,
  SubjectMetadata,
} from "../constants/types";
import { INVALID_INPUTS_DEFAULT } from "../constants/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SecondaryAppSidebar = ({
  subjectMetadata,
  currentFilter,
  setCurrentFilter,
  isSidebarOpen,
  setIsSidebarOpen,
  selectedCurriculumn,
  selectedSubject,
}: SecondaryAppSidebarProps) => {
  const [selectedTopic, setSelectedTopic] = useState<string[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<string[] | null>(null);
  const [selectedPaperType, setSelectedPaperType] = useState<string[] | null>(
    null
  );
  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({
    ...INVALID_INPUTS_DEFAULT,
  });
  const [selectedSeason, setSelectedSeason] = useState<string[] | null>(null);

  const topicRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const paperTypeRef = useRef<HTMLDivElement | null>(null);
  const seasonRef = useRef<HTMLDivElement | null>(null);

  // Refs to track selected values without triggering effects
  const selectedTopicRef = useRef<string[] | null>(null);
  const selectedYearRef = useRef<string[] | null>(null);
  const selectedPaperTypeRef = useRef<string[] | null>(null);
  const selectedSeasonRef = useRef<string[] | null>(null);

  const isValidInputs = useCallback(
    ({ scrollOnError = true }: { scrollOnError?: boolean }) => {
      return isValidInputsUtils({
        scrollOnError,
        topicRef: topicRef,
        yearRef: yearRef,
        paperTypeRef: paperTypeRef,
        seasonRef: seasonRef,
        selectedTopic: selectedTopic ?? [],
        selectedYear: selectedYear ?? [],
        selectedPaperType: selectedPaperType ?? [],
        selectedSeason: selectedSeason ?? [],
        setInvalidInputs: setInvalidInputs,
      });
    },
    [
      topicRef,
      yearRef,
      paperTypeRef,
      seasonRef,
      selectedTopic,
      selectedYear,
      selectedPaperType,
      selectedSeason,
      setInvalidInputs,
    ]
  );

  useEffect(() => {
    if (selectedTopic && selectedTopic.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, topic: false }));
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedPaperType && selectedPaperType.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    }
  }, [selectedPaperType]);

  useEffect(() => {
    if (selectedYear && selectedYear.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, year: false }));
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedSeason && selectedSeason.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, season: false }));
    }
  }, [selectedSeason]);

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
    setSelectedTopic(currentFilter?.topic ?? []);
    setSelectedYear(currentFilter?.year ?? []);
    setSelectedPaperType(currentFilter?.paperType ?? []);
    setSelectedSeason(currentFilter?.season ?? []);
  }, [
    currentFilter,
    setSelectedTopic,
    setSelectedYear,
    setSelectedPaperType,
    setSelectedSeason,
  ]);

  const handleResetEverything = useCallback(() => {
    setSelectedPaperType([]);
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
  }, [
    setSelectedPaperType,
    setSelectedTopic,
    setSelectedYear,
    setSelectedSeason,
    setInvalidInputs,
  ]);

  useEffect(() => {
    // When subjectMetadata changes, filter selections to keep only available options
    if (!subjectMetadata) return;

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
          subjectMetadata.topic!.includes(topic)
        ) ?? [];
      const newTopics =
        filteredTopics.length > 0 ? filteredTopics : subjectMetadata.topic;
      if (
        JSON.stringify(newTopics) !== JSON.stringify(selectedTopicRef.current)
      ) {
        setSelectedTopic(newTopics);
        didUpdate = true;
      }
      updatedFilter.topic = newTopics;
    }

    // Filter years
    if (subjectMetadata.year) {
      const filteredYears =
        selectedYearRef.current?.filter((year) =>
          subjectMetadata.year!.includes(year)
        ) ?? [];
      const newYears =
        filteredYears.length > 0 ? filteredYears : subjectMetadata.year;
      if (
        JSON.stringify(newYears) !== JSON.stringify(selectedYearRef.current)
      ) {
        setSelectedYear(newYears);
        didUpdate = true;
      }
      updatedFilter.year = newYears;
    }

    // Filter paperTypes
    if (subjectMetadata.paperType) {
      const filteredPaperTypes =
        selectedPaperTypeRef.current?.filter((paperType) =>
          subjectMetadata.paperType!.includes(paperType)
        ) ?? [];
      const newPaperTypes =
        filteredPaperTypes.length > 0
          ? filteredPaperTypes
          : subjectMetadata.paperType;
      if (
        JSON.stringify(newPaperTypes) !==
        JSON.stringify(selectedPaperTypeRef.current)
      ) {
        setSelectedPaperType(newPaperTypes);
        didUpdate = true;
      }
      updatedFilter.paperType = newPaperTypes;
    }

    // Filter seasons
    if (subjectMetadata.season) {
      const filteredSeasons =
        selectedSeasonRef.current?.filter((season) =>
          subjectMetadata.season!.includes(season)
        ) ?? [];
      const newSeasons =
        filteredSeasons.length > 0 ? filteredSeasons : subjectMetadata.season;
      if (
        JSON.stringify(newSeasons) !== JSON.stringify(selectedSeasonRef.current)
      ) {
        setSelectedSeason(newSeasons);
        didUpdate = true;
      }
      updatedFilter.season = newSeasons;
    }

    // Update filter if anything changed
    if (didUpdate) {
      setCurrentFilter(updatedFilter);
    }
  }, [subjectMetadata, setCurrentFilter]);

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
    if (isValidInputs({ scrollOnError: true }) && !isSameQuery) {
      setCurrentFilter({
        ...filter,
      });
      // Update URL parameters without page reload
    } else if (isSameQuery) {
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
    isValidInputs,
    setCurrentFilter,
    setIsSidebarOpen,
  ]);

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SheetContent
        className="z-[100006] overflow-hidden  py-2"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <ScrollArea className="h-full" type="always">
          <SheetHeader className="sr-only">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex w-full flex-col items-center justify-start gap-4">
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
              <MultiSelector
                allAvailableOptions={subjectMetadata?.topic ?? []}
                label="Topic"
                onValuesChange={useCallback(
                  (values) => setSelectedTopic(values as string[]),
                  []
                )}
                selectedValues={selectedTopic ?? []}
              />
              {invalidInputs.topic && (
                <p className="text-destructive text-sm">Topic is required</p>
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
              <MultiSelector
                allAvailableOptions={subjectMetadata?.paperType ?? []}
                label="Paper"
                onValuesChange={useCallback(
                  (values) => setSelectedPaperType(values as string[]),
                  []
                )}
                selectedValues={selectedPaperType ?? []}
              />
              {invalidInputs.paperType && (
                <p className="text-destructive text-sm">Paper is required</p>
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
                allAvailableOptions={subjectMetadata?.year ?? []}
                label="Year"
                onValuesChange={useCallback(
                  (values) => setSelectedYear(values as string[]),
                  []
                )}
                selectedValues={selectedYear ?? []}
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
                allAvailableOptions={subjectMetadata?.season ?? []}
                label="Season"
                onValuesChange={useCallback(
                  (values) => setSelectedSeason(values as string[]),
                  []
                )}
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

            <LayoutSetting />
            <VisualSetting />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default SecondaryAppSidebar;
