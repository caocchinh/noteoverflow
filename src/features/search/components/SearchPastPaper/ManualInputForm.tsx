import { Button } from "@/components/ui/button";
import { TOPICAL_DATA } from "@/constants/constants";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import { Trash2, X as XIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import NumberInputWithControls from "./NumberInputWithControls";
import SeasonSelect from "./SeasonSelect";
import { ManualInputFormProps, SubjectOption } from "./types";

const ManualInputForm = memo(
  ({
    selectedCurriculum,
    setSelectedCurriculum,
    selectedSubject,
    setSelectedSubject,
    selectedPaperType,
    setSelectedPaperType,
    selectedVariant,
    setSelectedVariant,
    selectedSeason,
    setSelectedSeason,
    selectedYear,
    setSelectedYear,
    invalidInputs,
    currentYear,
    onFindPaper,
    onClearEverything,
    onClose,
  }: ManualInputFormProps) => {
    const availableSubjects: SubjectOption[] | undefined = useMemo(() => {
      let subjects =
        TOPICAL_DATA[TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)]
          ?.subject;
      if (selectedCurriculum === "CIE A-LEVEL") {
        subjects = subjects?.filter((subject) => !subject.code.includes("9709"));
        subjects?.unshift({
          code: "Mathematics (9709)",
          coverImage: "/assets/cover/Mathematics (9709).webp",
          topic: [],
          year: [],
          paperType: [],
          season: [],
        });
      }
      return subjects;
    }, [selectedCurriculum]);

    const curriculumData = useMemo(
      () =>
        TOPICAL_DATA.map((item) => ({
          code: item.curriculum,
          coverImage: item.coverImage,
        })),
      [],
    );

    const getPaperTypeError = useCallback(() => {
      if (!invalidInputs.paperType) return null;
      const val = parseInt(selectedPaperType);
      if (isNaN(val) || val < 1 || val > 9) {
        return "Paper type must be between 1 and 9";
      }
      return "Paper type is required";
    }, [invalidInputs.paperType, selectedPaperType]);

    const getVariantError = useCallback(() => {
      if (!invalidInputs.variant) return null;
      const val = parseInt(selectedVariant);
      if (isNaN(val) || val < 1 || val > 9) {
        return "Variant must be between 1 and 9";
      }
      return "Variant is required";
    }, [invalidInputs.variant, selectedVariant]);

    const getYearError = useCallback(() => {
      if (!invalidInputs.year) return null;
      const val = parseInt(selectedYear);
      if (isNaN(val) || val < 2010 || val > currentYear) {
        return `Year must be between 2010 and ${currentYear}`;
      }
      return "Year is required";
    }, [invalidInputs.year, selectedYear, currentYear]);

    return (
      <div className="border-border mt-6 flex flex-col items-center justify-center gap-5 overflow-hidden rounded-xl border p-4 shadow-md">
        <h4 className="text-logo-main self-start text-base font-semibold">🎯 Manual Input</h4>

        {/* Curriculum Select */}
        <div className="relative w-full">
          <div className="w-full rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-foreground mb-1 text-xs font-semibold">📚 Curriculum</span>
            </div>
            <EnhancedSelect
              data={curriculumData}
              label="Curriculum"
              prerequisite=""
              triggerClassName="w-full"
              side="bottom"
              popoverContentClassName="!w-[var(--radix-popover-trigger-width)]"
              selectedValue={selectedCurriculum}
              modal={true}
              setSelectedValue={setSelectedCurriculum}
            />
            {invalidInputs.curriculum && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-800/30 dark:bg-red-950/20">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  Curriculum is required
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Subject Select */}
        <div className="w-full">
          <div className="flex items-center gap-2">
            <span className="text-foreground mb-1 text-xs font-semibold">🎓 Subject</span>
          </div>
          <EnhancedSelect
            data={availableSubjects}
            label="Subject"
            modal={true}
            popoverContentClassName="!w-[var(--radix-popover-trigger-width)]"
            side="bottom"
            triggerClassName="w-full"
            prerequisite={selectedCurriculum ? "" : "Curriculum"}
            selectedValue={selectedSubject}
            setSelectedValue={setSelectedSubject}
          />
          {invalidInputs.subject && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-800/30 dark:bg-red-950/20">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                Subject is required
              </p>
            </div>
          )}
        </div>

        {/* Paper Details */}
        <div className="w-full">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-xs font-semibold">📄 Paper Details</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberInputWithControls
              value={selectedPaperType}
              onChange={setSelectedPaperType}
              min={1}
              max={9}
              placeholder="e.g. 4"
              label="Paper Type"
              error={getPaperTypeError()}
            />
            <NumberInputWithControls
              value={selectedVariant}
              onChange={setSelectedVariant}
              min={1}
              max={9}
              placeholder="e.g. 2"
              label="Variant"
              error={getVariantError()}
            />
          </div>
        </div>

        {/* Season Select */}
        <SeasonSelect
          value={selectedSeason}
          onChange={setSelectedSeason}
          error={invalidInputs.season}
        />

        {/* Year Input */}
        <div className="w-full">
          <div className="flex items-center gap-2">
            <span className="text-foreground mb-1 text-xs font-semibold">📅 Year</span>
          </div>
          <NumberInputWithControls
            value={selectedYear}
            onChange={setSelectedYear}
            min={2010}
            max={currentYear}
            placeholder={`e.g. ${currentYear}`}
            error={getYearError()}
          />
        </div>

        {/* Action Buttons */}
        <div className="relative w-full pt-2">
          <Button
            className="bg-logo-main hover:bg-logo-main/90 relative w-full cursor-pointer border-0 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            onClick={onFindPaper}
          >
            Find Paper
          </Button>
        </div>

        <div className="relative mt-[-10px] w-full pt-0">
          <Button
            className="w-full cursor-pointer border-0 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
            variant="destructive"
            onClick={onClearEverything}
          >
            Clear Everything
            <Trash2 className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="relative mt-[-10px] w-full pt-0">
          <Button
            className="w-full cursor-pointer border-0 font-semibold shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
            onClick={onClose}
          >
            Close
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-muted-foreground text-xs">
            ⚡ Powered by{" "}
            <a
              href="https://bestexamhelp.com"
              target="_blank"
              title="Visit BestExamHelp.com"
              className="text-logo-main hover:text-logo-main/80 font-semibold transition-colors duration-200"
            >
              BestExamHelp.com
            </a>
          </p>
        </div>
      </div>
    );
  },
);

ManualInputForm.displayName = "ManualInputForm";

export default ManualInputForm;
