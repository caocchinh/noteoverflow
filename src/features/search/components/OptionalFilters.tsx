import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ValidCurriculum } from "@/constants/types";
import { Filter, Save, Search, X } from "lucide-react";
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
import EnhancedSelect from "../../topical/components/EnhancedSelect";
import EnhancedMultiSelector from "../../topical/components/MultiSelector/EnhancedMultiSelector";
import MultiSelector from "../../topical/components/MultiSelector/MultiSelector";
import { useAvailableFilters, useFilterState } from "../../topical/hooks";
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
        filterState: {
          selectedCurriculum,
          selectedSubject,
          selectedYear,
          selectedPaperType,
          selectedSeason,
          currentPaperTypeFilter,
        },
        setters: { setCurrentPaperTypeFilter },
        handlers: {
          handleCurriculumChange,
          handleSubjectChange,
          handlePaperTypeChange,
          handleYearChange,
          handleSeasonChange,
          resetEverything,
        },
        refs: { curriculumRef, subjectRef, yearRef, paperTypeRef, seasonRef },
      } = useFilterState({});

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
      const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
      const [isSheetOpen, setIsSheetOpen] = useState(false);

      // Count active filters
      const activeFilterCount =
        (selectedSubject ? 1 : 0) +
        (selectedYear.length > 0 ? 1 : 0) +
        (selectedSeason.length > 0 ? 1 : 0) +
        (selectedPaperType.length > 0 ? 1 : 0);

      const handleClearAll = useCallback(() => {
        resetEverything();
        setCurrentPaperTypeFilter(undefined);
      }, [resetEverything, setCurrentPaperTypeFilter]);

      const handleApplyFilters = useCallback(() => {
        const newFilter: OptionalSearchFilter = {};

        if (selectedCurriculum) newFilter.curriculum = selectedCurriculum;
        if (selectedSubject) newFilter.subject = selectedSubject;
        if (selectedYear.length > 0) newFilter.year = selectedYear;
        if (selectedSeason.length > 0) newFilter.season = selectedSeason;
        if (selectedPaperType.length > 0) newFilter.paperType = selectedPaperType;

        const finalFilter = Object.keys(newFilter).length > 0 ? newFilter : null;
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
        ({ _currentFilter }: { _currentFilter: OptionalSearchFilter | null }) => {
          if (_currentFilter) {
            if (_currentFilter.curriculum) {
              handleCurriculumChange(_currentFilter.curriculum as ValidCurriculum);
            }
            if (_currentFilter.subject) {
              handleSubjectChange(_currentFilter.subject);
            }
            if (_currentFilter.year) {
              handleYearChange(_currentFilter.year);
            }
            if (_currentFilter.paperType) {
              handlePaperTypeChange(_currentFilter.paperType);
            }
            if (_currentFilter.season) {
              handleSeasonChange(_currentFilter.season);
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
              className="bg-logo-main! h-12 w-full cursor-pointer gap-2 rounded-full px-8 text-base text-white! transition-all"
            >
              <Search className="h-4 w-4" />
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
                    className="border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 h-10 cursor-pointer gap-2 rounded-sm px-4 transition-all"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Optional Filters</span>
                    {activeFilterCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 min-w-5 rounded-full px-1 text-[10px] font-bold"
                      >
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={handleClearAll} className="cursor-pointer">
                  Clear all filter
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <SheetContent
              onOpenAutoFocus={(event) => event.preventDefault()}
              className="bg-sidebar gap-0"
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
                    <Label className="text-muted-foreground/80 mb-1 ml-1 text-xs font-bold tracking-widest uppercase">
                      Curriculum
                    </Label>
                    <EnhancedSelect
                      data={availableCurriculum}
                      label="Curriculum"
                      prerequisite=""
                      selectedValue={selectedCurriculum}
                      setSelectedValue={(value) => handleCurriculumChange(value as ValidCurriculum)}
                      triggerClassName="w-full h-11 bg-background/60 hover:bg-background hover:border-primary/50 transition-all rounded-xl"
                      modal={true}
                    />
                  </div>

                  <div className="py-2" ref={subjectRef}>
                    <Label className="text-muted-foreground/80 mb-1 ml-1 text-xs font-bold tracking-widest uppercase">
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
                    <Label className="text-muted-foreground/80 mb-1 ml-1 text-xs font-bold tracking-widest uppercase">
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
                    <Label className="text-muted-foreground/80 mb-1 ml-1 text-xs font-bold tracking-widest uppercase">
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
                    <Label className="text-muted-foreground/80 mb-1 ml-1 text-xs font-bold tracking-widest uppercase">
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
              <SheetFooter className="flex flex-row gap-3 border-t px-4 py-4">
                <Button
                  onClick={handleCloseSheet}
                  className="bg-logo-main hover:bg-logo-main/90 flex-1 cursor-pointer gap-2 text-white!"
                  disabled={isSearching}
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="flex-1 cursor-pointer gap-2"
                  disabled={activeFilterCount === 0}
                >
                  <X className="h-4 w-4" />
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
