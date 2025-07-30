import { Minus, Plus, Search, Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { TOPICAL_DATA } from "@/constants/constants";
import { GlowEffect } from "../ui/glow-effect";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import { ValidCurriculum } from "@/constants/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { INVALID_INPUTS_DEFAULT } from "@/features/topical/constants/constants";
import { InvalidInputs } from "@/features/topical/constants/types";

const SearchPastPaper = () => {
  const [input, setInput] = useState("");
  const breakpoint = useIsMobile({ breakpoint: 735 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quickCodeError, setQuickCodeError] = useState<string | null>(null);
  const [quickCodeInput, setQuickCodeInput] = useState<string>("");
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<string>("CIE A-LEVEL");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPaperType, setSelectedPaperType] = useState<number>(NaN);
  const [selectedVariant, setSelectedVariant] = useState<number>(NaN);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(NaN);
  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[
      TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
    ]?.subject;
  }, [selectedCurriculum]);
  const [invalidInputs, setInvalidInputs] = useState<
    InvalidInputs & { variant: boolean }
  >({
    ...INVALID_INPUTS_DEFAULT,
    variant: false,
  });
  const currentYear = new Date().getFullYear();

  const validateQuickCode = ({ code }: { code: string }): string => {
    if (!code) return "";

    const regex = /^(\d{4})\/(\d{2})\/(F\/M|M\/J|O\/N)\/(\d{2})$/;

    const match = code.match(regex);
    if (!match)
      return "Correct format: [Subject Code]/[Paper Number]/[Season]/[Year]";
    const subjectCode = match[1];
    const subject = availableSubjects?.find((s) =>
      s.code.includes(subjectCode)
    );
    if (!subject) {
      return `Subject with code ${subjectCode} is not supported yet`;
    }

    // Validate the year doesn't exceed current year
    const yearDigits = match[4];
    const fullYear = parseInt(`20${yearDigits}`);
    if (fullYear > currentYear) {
      return `Year cannot exceed current year (${currentYear})`;
    }

    // Validate the year is 2009 or later
    if (fullYear < 2009) {
      return "Year must be 2009 or later";
    }

    return "";
  };

  const handleQuickCodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.toUpperCase();
    setQuickCodeInput(value);
    setQuickCodeError(validateQuickCode({ code: value }));
  };

  const handleQuickCodeSubmit = () => {
    if (quickCodeInput) {
      setQuickCodeError(validateQuickCode({ code: quickCodeInput }));
    }
  };

  useEffect(() => {
    if (
      !isNaN(selectedPaperType) &&
      selectedPaperType > 0 &&
      selectedPaperType < 10
    ) {
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    }
  }, [selectedPaperType]);

  useEffect(() => {
    if (
      !isNaN(selectedVariant) &&
      selectedVariant > 0 &&
      selectedVariant < 10
    ) {
      setInvalidInputs((prev) => ({ ...prev, variant: false }));
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (
      !isNaN(selectedYear) &&
      selectedYear > 2009 &&
      selectedYear <= currentYear
    ) {
      setInvalidInputs((prev) => ({ ...prev, year: false }));
    }
  }, [currentYear, selectedYear]);

  useEffect(() => {
    if (selectedSeason) {
      setInvalidInputs((prev) => ({ ...prev, season: false }));
    }
  }, [selectedSeason]);

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

  const validateManuaInputs = (): boolean => {
    const invalidInputs = {
      ...INVALID_INPUTS_DEFAULT,
      curriculum: !selectedCurriculum,
      subject: !selectedSubject,
      paperType:
        isNaN(selectedPaperType) ||
        selectedPaperType < 1 ||
        selectedPaperType > 9,
      variant:
        isNaN(selectedVariant) || selectedVariant < 1 || selectedVariant > 9,
      season: !selectedSeason,
      year:
        isNaN(selectedYear) ||
        selectedYear < 2009 ||
        selectedYear > currentYear,
    };
    setInvalidInputs(invalidInputs);
    return Object.values(invalidInputs).every((value) => value === false);
  };

  return (
    <>
      <div
        className="hidden h-10 w-full max-w-md items-center sm:flex"
        onClick={() => setIsDialogOpen(true)}
      >
        <Input
          className="h-full w-full max-w-md rounded-xl rounded-r-none border border-[var(--navbar-input-border)] bg-[var(--navbar-bg)] text-[var(--navbar-text)] placeholder:text-white/50 dark:bg-[var(--navbar-bg)]"
          placeholder={breakpoint ? "Search" : "Search past papers"}
          value={input}
          readOnly={true}
        />
        <Button className="h-full w-10 rounded-xl rounded-l-none border border-[var(--navbar-input-border)] bg-[var(--navbar-button-bg)] hover:cursor-pointer hover:bg-[var(--navbar-border)] lg:w-14">
          <SearchIcon className="text-[var(--navbar-text)]" />
        </Button>
      </div>
      <Button
        className="flex h-full w-9 items-center justify-center border border-[var(--navbar-border)] bg-transparent p-2 text-[var(--navbar-text)] hover:cursor-pointer hover:bg-[var(--navbar-border)] sm:hidden"
        onClick={() => setIsDialogOpen(true)}
      >
        <SearchIcon />
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="dark:bg-muted">
          <DialogHeader>
            <DialogTitle className="text-center">
              AS & A-Level Past Papers Search
            </DialogTitle>
            <DialogDescription className="sr-only">
              Search for past papers by subject, topic, year, and more.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(100dvh-150px)] pr-4" type="always">
            <div className="flex flex-col gap-3 items-start px-5 py-2 justify-center mb-5 h-full border-2  rounded-sm relative">
              <h4 className="text-sm text-logo-main">Quick Paper Code</h4>
              <div className="flex justify-center gap-2 w-full sm:flex-row flex-col">
                <Input
                  id="quick-code"
                  placeholder="e.g. 9702/42/M/J/20"
                  value={quickCodeInput}
                  onChange={handleQuickCodeInputChange}
                  className={`w-full text-center ${
                    quickCodeError ? "border-red-500" : ""
                  }`}
                />
                <div className="h-full relative">
                  <GlowEffect
                    colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                    mode="colorShift"
                    blur="soft"
                    duration={3}
                  />
                  <Button
                    onClick={handleQuickCodeSubmit}
                    className={`cursor-pointer h-full sm:w-auto w-full relative z-10 ${
                      !!quickCodeError || quickCodeInput === ""
                        ? "opacity-50"
                        : ""
                    }`}
                    disabled={!!quickCodeError || quickCodeInput === ""}
                  >
                    Find
                    <Search className="w-4 h-4 ml" />
                  </Button>
                </div>
              </div>
              {quickCodeError ? (
                <p className="text-xs text-red-500">{quickCodeError}</p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold">Enter code in format: </span>
                    [Subject Code]/[Paper Number]/[Season]/[Year]
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold">Tip:</span> Press enter twice to
                    access the marking scheme quickly
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold">Note:</span> Using quick search
                    will update the manual input fields
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-4 h-full border-2 px-5 py-3 rounded-sm relative">
              <div className="flex flex-col gap-2">
                <h4 className="text-sm text-logo-main">Manual Search</h4>
                <div className="flex flex-col gap-2">
                  <h5 className="text-xs font-semibold">Curriculum</h5>
                  <EnhancedSelect
                    data={TOPICAL_DATA.map((item) => ({
                      code: item.curriculum,
                      coverImage: item.coverImage,
                    }))}
                    label="Curriculum"
                    prerequisite=""
                    triggerClassName="w-full"
                    side="bottom"
                    popoverContentClassName="!w-[var(--radix-popover-trigger-width)]"
                    selectedValue={selectedCurriculum}
                    modal={true}
                    setSelectedValue={(value) => {
                      setSelectedCurriculum(value as ValidCurriculum);
                    }}
                  />
                  {invalidInputs.curriculum && (
                    <p className="text-xs text-red-500">
                      Curriculum is required
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h5 className="text-xs font-semibold">Subject</h5>
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
                  <p className="text-xs text-red-500">Subject is required</p>
                )}
              </div>
              <div className="flex flex-row gap-2 justify-between items-center">
                <div className="flex flex-col items-start justify-center gap-2 w-[45%] ">
                  <h5 className="text-xs font-semibold">Paper Type</h5>
                  <div className="flex flex-row items-center justify-center gap-2 w-full">
                    <Button
                      className="w-[35px] rounded-sm cursor-pointer"
                      variant="outline"
                      title="Decrease"
                      onClick={() =>
                        setSelectedPaperType(
                          selectedPaperType > 1 ? selectedPaperType - 1 : 9
                        )
                      }
                    >
                      <Minus />
                    </Button>
                    <Input
                      placeholder="e.g. 4"
                      max={9}
                      min={1}
                      value={selectedPaperType}
                      type="number"
                      className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
                      onChange={(e) =>
                        setSelectedPaperType(parseInt(e.target.value))
                      }
                    />
                    <Button
                      className="w-[35px] rounded-sm cursor-pointer"
                      variant="outline"
                      title="Increase"
                      onClick={() =>
                        setSelectedPaperType(
                          selectedPaperType < 9 ? selectedPaperType + 1 : 1
                        )
                      }
                    >
                      <Plus />
                    </Button>
                  </div>
                  {invalidInputs.paperType && (
                    <p className="text-xs text-red-500 text-center">
                      {selectedPaperType < 1 ||
                      selectedPaperType > 9 ||
                      isNaN(selectedPaperType)
                        ? "Paper type must be between 1 and 9"
                        : "Paper type is required"}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-start justify-center gap-2 w-[45%] ">
                  <h5 className="text-xs font-semibold">Variant</h5>
                  <div className="flex flex-row items-center justify-center gap-2 w-full  ">
                    <Button
                      className="w-[35px] rounded-sm cursor-pointer"
                      variant="outline"
                      title="Decrease"
                      onClick={() =>
                        setSelectedVariant(
                          selectedVariant > 1 ? selectedVariant - 1 : 9
                        )
                      }
                    >
                      <Minus />
                    </Button>
                    <Input
                      placeholder="e.g. 4"
                      value={selectedVariant}
                      type="number"
                      className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
                      max={9}
                      min={1}
                      onChange={(e) =>
                        setSelectedVariant(parseInt(e.target.value))
                      }
                    />
                    <Button
                      className="w-[35px] rounded-sm cursor-pointer"
                      variant="outline"
                      title="Increase"
                      onClick={() =>
                        setSelectedVariant(
                          selectedVariant < 9 ? selectedVariant + 1 : 1
                        )
                      }
                    >
                      <Plus />
                    </Button>
                  </div>
                  {invalidInputs.variant && (
                    <p className="text-xs text-red-500 text-center">
                      {selectedVariant < 1 ||
                      selectedVariant > 9 ||
                      isNaN(selectedVariant)
                        ? "Variant must be between 1 and 9"
                        : "Variant is required"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h5 className="text-xs font-semibold">Exam season</h5>
                <Select
                  value={selectedSeason}
                  onValueChange={(value) => setSelectedSeason(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select exam season" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[99999999] dark:bg-accent w-[var(--radix-select-trigger-width)]"
                    side="bottom"
                  >
                    <SelectItem value="Spring">
                      F/M - Febuary/March (Spring)
                    </SelectItem>
                    <SelectItem value="Summer">
                      M/J - May/June (Summer)
                    </SelectItem>
                    <SelectItem value="Winter">
                      O/N - October/November (Winter)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {invalidInputs.season && (
                  <p className="text-xs text-red-500">Season is required</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h5 className="text-xs font-semibold">Year</h5>
                <div className="flex flex-row items-center justify-center gap-2 w-full">
                  <Button
                    className="w-[35px] rounded-sm cursor-pointer"
                    variant="outline"
                    title="Decrease"
                    onClick={() =>
                      setSelectedYear(
                        selectedYear > 2009
                          ? selectedYear - 1
                          : new Date().getFullYear()
                      )
                    }
                  >
                    <Minus />
                  </Button>
                  <Input
                    placeholder="e.g. 2024"
                    max={currentYear}
                    min={2009}
                    defaultValue={new Date().getFullYear()}
                    value={selectedYear}
                    type="number"
                    className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  />
                  <Button
                    className="w-[35px] rounded-sm cursor-pointer"
                    variant="outline"
                    title="Increase"
                    onClick={() =>
                      setSelectedYear(
                        selectedYear < currentYear ? selectedYear + 1 : 2009
                      )
                    }
                  >
                    <Plus />
                  </Button>
                </div>
                {invalidInputs.year && (
                  <p className="text-xs text-red-500">
                    {selectedYear < 2009 ||
                    selectedYear > currentYear ||
                    isNaN(selectedYear)
                      ? "Year must be between 2009 and " + currentYear
                      : "Year is required"}
                  </p>
                )}
              </div>
              <Button
                className="w-full cursor-pointer"
                onClick={() => {
                  if (validateManuaInputs()) {
                    console.log("valid");
                  }
                }}
              >
                Find paper
              </Button>
            </div>
            <Button
              className="w-full cursor-pointer mt-2"
              variant="destructive"
              onClick={() => {
                setSelectedCurriculum("CIE A-LEVEL");
                setSelectedSubject("");
                setSelectedPaperType(NaN);
                setSelectedVariant(NaN);
                setSelectedSeason("");
                setQuickCodeInput("");
                setQuickCodeError(null);
                setSelectedYear(NaN);
              }}
            >
              Clear everything
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Powered by{" "}
              <a
                href="https://bestexamhelp.com"
                target="_blank"
                title="visit"
                className="text-green-700"
              >
                BestExamHelp.com
              </a>
            </p>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchPastPaper;
