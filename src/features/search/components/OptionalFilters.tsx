import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ValidCurriculum } from "@/constants/types";
import {
  useAvailableFilters,
  useFilterState,
  usePaperTypePersistence,
} from "../../topical/hooks";
import { Button } from "@/components/ui/button";
import { Filter, Save, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import EnhancedSelect from "../../topical/components/EnhancedSelect";
import MultiSelector from "../../topical/components/MultiSelector/MultiSelector";
import EnhancedMultiSelector from "../../topical/components/MultiSelector/EnhancedMultiSelector";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { OptionalFiltersProps, OptionalSearchFilter } from "../constants/type";

export interface OptionalFiltersHandle {
  applyFilters: () => void;
}

const OptionalFilters = memo(
  forwardRef<OptionalFiltersHandle, OptionalFiltersProps>(
    (
      {
        currentFilter,
        setCurrentFilter,
        searchButtonPortalRef,
        onSearch,
        isSearching,
        isInputValid,
      },
      ref,
    ) => {
      const {
        values: {
          selectedCurriculum,
          selectedSubject,
          selectedYear,
          selectedPaperType,
          selectedSeason,
        },
        setters: {
          setSelectedCurriculum,
          setSelectedSubject,
          setSelectedPaperType,
          setSelectedYear,
          setSelectedSeason,
        },
        handlers: {
          handleCurriculumChange,
          handleSubjectChange,
          handlePaperTypeChange,
          handleYearChange,
          handleSeasonChange,
          resetAllFilters,
        },
        refs: { curriculumRef, subjectRef, yearRef, paperTypeRef, seasonRef },
      } = useFilterState({
        initialCurriculum:
          (currentFilter?.curriculum as ValidCurriculum) || "CIE A-LEVEL",
        initialSubject: currentFilter?.subject || "",
        initialYear: currentFilter?.year || [],
        initialPaperType: currentFilter?.paperType || [],
        initialSeason: currentFilter?.season || [],
        onCurriculumChange: () => setCurrentPaperTypeFilter(undefined),
        onSubjectChange: () => setCurrentPaperTypeFilter(undefined),
      });

      const { currentPaperTypeFilter, setCurrentPaperTypeFilter } =
        usePaperTypePersistence({
          selectedCurriculum,
          selectedSubject,
        });

      const {
        availableCurriculum,
        availableSubjects,
        availableYears,
        availablePaperTypeFullInfo,
        availableSeasons,
        subjectPrerequisite,
      } = useAvailableFilters({
        selectedCurriculum,
        selectedSubject,
      });

      const isMountedRef = useRef(false);
      const [portalContainer, setPortalContainer] =
        useState<HTMLElement | null>(null);
      const [isSheetOpen, setIsSheetOpen] = useState(false);

      // Count active filters
      const activeFilterCount =
        (selectedSubject ? 1 : 0) +
        (selectedYear.length > 0 ? 1 : 0) +
        (selectedSeason.length > 0 ? 1 : 0) +
        (selectedPaperType.length > 0 ? 1 : 0);

      const handleClearAll = useCallback(() => {
        resetAllFilters();
        setCurrentPaperTypeFilter(undefined);
      }, [resetAllFilters, setCurrentPaperTypeFilter]);

      const handleApplyFilters = useCallback(() => {
        const newFilter: OptionalSearchFilter = {};

        if (selectedCurriculum) newFilter.curriculum = selectedCurriculum;
        if (selectedSubject) newFilter.subject = selectedSubject;
        if (selectedYear.length > 0) newFilter.year = selectedYear;
        if (selectedSeason.length > 0) newFilter.season = selectedSeason;
        if (selectedPaperType.length > 0)
          newFilter.paperType = selectedPaperType;

        const finalFilter =
          Object.keys(newFilter).length > 0 ? newFilter : null;
        setCurrentFilter(finalFilter);
        onSearch({ filter: finalFilter });
      }, [
        selectedCurriculum,
        selectedSubject,
        selectedYear,
        selectedSeason,
        selectedPaperType,
        setCurrentFilter,
        onSearch,
      ]);

      const handleCloseSheet = useCallback(() => setIsSheetOpen(false), []);

      useImperativeHandle(
        ref,
        () => ({
          applyFilters: handleApplyFilters,
        }),
        [handleApplyFilters],
      );

      const onMount = useEffectEvent(
        ({
          _currentFilter,
        }: {
          _currentFilter: OptionalSearchFilter | null;
        }) => {
          if (_currentFilter) {
            if (_currentFilter.curriculum) {
              setSelectedCurriculum(
                _currentFilter.curriculum as ValidCurriculum,
              );
            }
            if (_currentFilter.subject) {
              setSelectedSubject(_currentFilter.subject);
            }
            if (_currentFilter.year) {
              setSelectedYear(_currentFilter.year);
            }
            if (_currentFilter.paperType) {
              setSelectedPaperType(_currentFilter.paperType);
            }
            if (_currentFilter.season) {
              setSelectedSeason(_currentFilter.season);
            }
          }
          setTimeout(() => {
            if (isMountedRef.current) return;
            isMountedRef.current = true;
            setPortalContainer(searchButtonPortalRef.current);
          }, 0);
        },
      );

      // Sync internal state with currentFilter
      useEffect(() => {
        if (currentFilter && !isMountedRef.current) {
          onMount({ _currentFilter: currentFilter });
        }
      }, [currentFilter]);

      // Render search button through portal
      const searchButton = portalContainer
        ? createPortal(
            <Button
              onClick={handleApplyFilters}
              disabled={isSearching || !isInputValid}
              size="lg"
              className="rounded-full px-8 w-full bg-logo-main! cursor-pointer text-white! h-12 gap-2 transition-all text-base"
            >
              <Search className="w-4 h-4" />
              {isSearching ? "Searching..." : "Search Questions"}
            </Button>,
            portalContainer,
          )
        : null;

      return (
        <>
          {searchButton}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <ContextMenu>
              <ContextMenuTrigger>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isSearching}
                    size="sm"
                    className="gap-2 h-10 px-4 rounded-sm cursor-pointer border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Optional Filters</span>
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
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={handleClearAll}
                  className="cursor-pointer"
                >
                  Clear all filter
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <SheetContent
              onOpenAutoFocus={(event) => event.preventDefault()}
              className="gap-0 bg-sidebar"
            >
              <SheetHeader className="pb-0">
                <SheetTitle>Search Filters</SheetTitle>
                <SheetDescription>
                  Configure your search parameters for better results.
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100dvh-9rem)] p-4">
                <div className="flex flex-col gap-4">
                  <div className="" ref={curriculumRef}>
                    <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 mb-1">
                      Curriculum
                    </Label>
                    <EnhancedSelect
                      data={availableCurriculum}
                      label="Curriculum"
                      prerequisite=""
                      selectedValue={selectedCurriculum}
                      setSelectedValue={handleCurriculumChange}
                      triggerClassName="w-full h-11 bg-background/60 hover:bg-background hover:border-primary/50 transition-all rounded-xl"
                      modal={true}
                    />
                  </div>

                  <div className="py-2" ref={subjectRef}>
                    <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 mb-1">
                      Subject
                    </Label>
                    <EnhancedSelect
                      data={availableSubjects}
                      label="Subject"
                      prerequisite={subjectPrerequisite}
                      selectedValue={selectedSubject}
                      setSelectedValue={handleSubjectChange}
                      triggerClassName="w-full h-11 bg-background/60 hover:bg-background hover:border-primary/50 transition-all rounded-xl"
                      modal={true}
                    />
                  </div>

                  <div className="py-2" ref={paperTypeRef}>
                    <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 mb-1">
                      Paper
                    </Label>
                    <EnhancedMultiSelector
                      isMounted={!!portalContainer}
                      currentFilter={currentPaperTypeFilter}
                      setCurrentFilter={setCurrentPaperTypeFilter}
                      allAvailableOptions={availablePaperTypeFullInfo ?? []}
                      label="Paper"
                      onValuesChange={handlePaperTypeChange}
                      selectedValues={selectedPaperType}
                    />
                  </div>

                  <div className="py-2" ref={yearRef}>
                    <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 mb-1">
                      Year
                    </Label>
                    <MultiSelector
                      allAvailableOptions={availableYears ?? []}
                      label="Year"
                      onValuesChange={handleYearChange}
                      selectedValues={selectedYear}
                    />
                  </div>

                  <div className="py-2" ref={seasonRef}>
                    <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 mb-1">
                      Season
                    </Label>
                    <MultiSelector
                      allAvailableOptions={availableSeasons ?? []}
                      label="Season"
                      onValuesChange={handleSeasonChange}
                      selectedValues={selectedSeason}
                    />
                  </div>
                </div>
              </ScrollArea>
              <SheetFooter className="flex flex-row gap-3 px-4 py-4 border-t">
                <Button
                  onClick={handleCloseSheet}
                  className="flex-1 gap-2 bg-logo-main text-white! hover:bg-logo-main/90 cursor-pointer"
                  disabled={isSearching}
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="flex-1 gap-2 cursor-pointer"
                  disabled={activeFilterCount === 0}
                >
                  <X className="w-4 h-4" />
                  Clear All
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </>
      );
    },
  ),
);

OptionalFilters.displayName = "OptionalFilters";

export default OptionalFilters;
