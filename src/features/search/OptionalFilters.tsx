import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CIE_A_LEVEL_SUBDIVISION, ValidCurriculum } from "@/constants/types";
import {
  PAPER_TYPE_FILTER_SEARCH_PAGE_KEY,
  TOPICAL_DATA,
} from "@/constants/constants";
import { validateSubcurriculumnDivision } from "../topical/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import EnhancedSelect from "../topical/components/EnhancedSelect";
import MultiSelector from "../topical/components/MultiSelector/MultiSelector";
import EnhancedMultiSelector from "../topical/components/MultiSelector/EnhancedMultiSelector";

export type OptionalSearchFilter = {
  subject?: string;
  curriculum?: string;
  year?: string[];
  season?: string[];
  paperType?: string[];
};

interface OptionalFiltersProps {
  currentFilter: OptionalSearchFilter | null;
  setCurrentFilter: React.Dispatch<
    React.SetStateAction<OptionalSearchFilter | null>
  >;
  searchButtonPortalRef: React.RefObject<HTMLDivElement | null>;
  onSearch: () => void;
  loading: boolean;
  hasResults: boolean;
}

type PaperTypeFilterSearchPageCache = {
  [curriculum: string]: {
    [subject: string]: CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined;
  };
};

const OptionalFilters = ({
  currentFilter,
  setCurrentFilter,
  searchButtonPortalRef,
  onSearch,
  loading,
  hasResults,
}: OptionalFiltersProps) => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<ValidCurriculum>(
    (currentFilter?.curriculum as ValidCurriculum) || "CIE A-LEVEL"
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    currentFilter?.subject || ""
  );
  const [selectedYear, setSelectedYear] = useState<string[]>(
    currentFilter?.year || []
  );
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>(
    currentFilter?.paperType || []
  );
  const [selectedSeason, setSelectedSeason] = useState<string[]>(
    currentFilter?.season || []
  );
  const [currentPaperTypeFilter, setCurrentPaperTypeFilter] = useState<
    CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
  >(undefined);
  const [isMounted, setIsMounted] = useState(false);

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

  const subjectPrerequisite = useMemo(() => {
    return selectedCurriculum ? "" : "Curriculum";
  }, [selectedCurriculum]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSubject) count++;
    if (selectedYear.length > 0) count++;
    if (selectedSeason.length > 0) count++;
    if (selectedPaperType.length > 0) count++;
    return count;
  }, [selectedSubject, selectedYear, selectedSeason, selectedPaperType]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    setCurrentPaperTypeFilter(undefined);
  }, [selectedSubject, isMounted]);

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

  const handleApplyFilters = useCallback(() => {
    const newFilter: OptionalSearchFilter = {};

    if (selectedCurriculum) newFilter.curriculum = selectedCurriculum;
    if (selectedSubject) newFilter.subject = selectedSubject;
    if (selectedYear.length > 0) newFilter.year = selectedYear;
    if (selectedSeason.length > 0) newFilter.season = selectedSeason;
    if (selectedPaperType.length > 0) newFilter.paperType = selectedPaperType;

    setCurrentFilter(Object.keys(newFilter).length > 0 ? newFilter : null);
    onSearch();
  }, [
    selectedCurriculum,
    selectedSubject,
    selectedYear,
    selectedSeason,
    selectedPaperType,
    setCurrentFilter,
    onSearch,
  ]);

  // Render search button through portal
  const searchButton =
    isMounted && searchButtonPortalRef.current
      ? createPortal(
          <Button
            onClick={handleApplyFilters}
            disabled={loading}
            size="lg"
            className="rounded-full px-8 w-full bg-logo-main! cursor-pointer text-white! h-12 gap-2 transition-all text-base"
          >
            <Search className="w-4 h-4" />
            {loading ? "Searching..." : "Search Questions"}
          </Button>,
          searchButtonPortalRef.current
        )
      : null;

  return (
    <>
      {searchButton}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 h-10 px-4 rounded-full border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 transition-all",
              !hasResults && "w-[180px]"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Config Filters</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Search Filters</SheetTitle>
            <SheetDescription>
              Configure your search parameters to find specific questions.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-6">
            <div className="flex flex-col gap-6 pb-6">
              <div className="space-y-2" ref={curriculumRef}>
                <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1">
                  Curriculum
                </Label>
                <div className="relative">
                  <EnhancedSelect
                    data={availableCurriculum}
                    label="Curriculum"
                    prerequisite=""
                    selectedValue={selectedCurriculum}
                    setSelectedValue={useCallback((value) => {
                      setSelectedCurriculum(value as ValidCurriculum);
                    }, [])}
                    triggerClassName="w-full h-11 bg-background/60 hover:bg-background hover:border-primary/50 transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2" ref={subjectRef}>
                <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1">
                  Subject
                </Label>
                <EnhancedSelect
                  data={availableSubjects}
                  label="Subject"
                  prerequisite={subjectPrerequisite}
                  selectedValue={selectedSubject}
                  setSelectedValue={useCallback(setSelectedSubject, [
                    setSelectedSubject,
                  ])}
                  triggerClassName="w-full h-11 bg-background/60 hover:bg-background hover:border-primary/50 transition-all rounded-xl"
                />
              </div>

              <div className="space-y-2" ref={yearRef}>
                <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1">
                  Year
                </Label>
                <div className="w-full [&_button]:w-full [&_button]:h-11 [&_button]:bg-background/60 [&_button]:hover:bg-background [&_button]:hover:border-primary/50 [&_button]:rounded-xl [&_button]:transition-all">
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
              </div>

              <div className="space-y-2" ref={seasonRef}>
                <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1">
                  Season
                </Label>
                <div className="w-full [&_button]:w-full [&_button]:h-11 [&_button]:bg-background/60 [&_button]:hover:bg-background [&_button]:hover:border-primary/50 [&_button]:rounded-xl [&_button]:transition-all">
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
              </div>

              <div className="space-y-2" ref={paperTypeRef}>
                <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1">
                  Paper
                </Label>
                <div className="w-full [&_button]:w-full [&_button]:h-11 [&_button]:bg-background/60 [&_button]:hover:bg-background [&_button]:hover:border-primary/50 [&_button]:rounded-xl [&_button]:transition-all">
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
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default OptionalFilters;
