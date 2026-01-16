import { memo, useCallback, useMemo } from "react";
import { Trash2, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import { TOPICAL_DATA } from "@/constants/constants";
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
        TOPICAL_DATA[
          TOPICAL_DATA.findIndex(
            (item) => item.curriculum === selectedCurriculum
          )
        ]?.subject;
      if (selectedCurriculum === "CIE A-LEVEL") {
        subjects = subjects?.filter(
          (subject) => !subject.code.includes("9709")
        );
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
      []
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
      <div className="flex flex-col gap-5 items-center justify-center overflow-hidden rounded-xl border border-border p-4 shadow-md mt-6">
        <h4 className="text-base self-start font-semibold text-logo-main">
          🎯 Manual Input
        </h4>

        {/* Curriculum Select */}
        <div className="relative w-full">
          <div className="rounded-lg w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold mb-1 text-foreground">
                📚 Curriculum
              </span>
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
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Curriculum is required
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Subject Select */}
        <div className="w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold mb-1 text-foreground">
              🎓 Subject
            </span>
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
            <div className="flex items-center mt-2 gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-md">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                Subject is required
              </p>
            </div>
          )}
        </div>

        {/* Paper Details */}
        <div className="w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              📄 Paper Details
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <span className="text-xs font-semibold mb-1 text-foreground">
              📅 Year
            </span>
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
        <div className="relative pt-2 w-full">
          <Button
            className="relative w-full cursor-pointer font-semibold bg-logo-main hover:bg-logo-main/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            onClick={onFindPaper}
          >
            Find Paper
          </Button>
        </div>

        <div className="relative mt-[-10px] pt-0 w-full">
          <Button
            className="w-full cursor-pointer font-semibold text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
            variant="destructive"
            onClick={onClearEverything}
          >
            Clear Everything
            <Trash2 className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="relative mt-[-10px] pt-0 w-full">
          <Button
            className="w-full cursor-pointer font-semibold border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
            onClick={onClose}
          >
            Close
            <XIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
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
  }
);

ManualInputForm.displayName = "ManualInputForm";

export default ManualInputForm;
