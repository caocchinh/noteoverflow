import {
  ExternalLink,
  Minus,
  Plus,
  Search,
  X as XIcon,
  Search as SearchIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  BESTEXAMHELP_CURRICULUM_CODE_PREFIX,
  BESTEXAMHELP_DOMAIN,
  BESTEXAMHELP_SUBJECT_CODE,
  PAST_PAPER_NAVIGATOR_CACHE_KEY,
  TOPICAL_DATA,
} from "@/constants/constants";
import { GlowEffect } from "../ui/glow-effect";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import {
  PastPaperNavigatorCache,
  ValidCurriculum,
  ValidSeason,
} from "@/constants/types";
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
import { cn, getShortSeason } from "@/lib/utils";

const SearchPastPaper = () => {
  const breakpoint = useIsMobile({ breakpoint: 735 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quickCodeError, setQuickCodeError] = useState<string | null>(null);
  const [quickCodeInput, setQuickCodeInput] = useState<string>("");
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<string>("CIE A-LEVEL");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPaperType, setSelectedPaperType] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const markingSchemeButtonRef = useRef<HTMLAnchorElement | null>(null);
  const availableSubjects = useMemo(() => {
    let subjects =
      TOPICAL_DATA[
        TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
      ]?.subject;
    if (selectedCurriculum === "CIE A-LEVEL") {
      subjects = subjects?.filter((subject) => !subject.code.includes("9709"));
      subjects.unshift({
        code: "Mathematics (9709)",
        coverImage: "/assets/cover/Mathematics (9709).webp",
        topic: [],
        year: [],
        paperType: [1, 2, 3, 4, 5, 6, 7],
        season: [],
      });
    }
    return subjects;
  }, [selectedCurriculum]);
  const [invalidInputs, setInvalidInputs] = useState<
    InvalidInputs & { variant: boolean }
  >({
    ...INVALID_INPUTS_DEFAULT,
    variant: false,
  });
  const currentYear = new Date().getFullYear();
  const [isMounted, setIsMounted] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem(PAST_PAPER_NAVIGATOR_CACHE_KEY);
    if (savedState) {
      const parsedState: PastPaperNavigatorCache = JSON.parse(savedState);
      setSelectedCurriculum(parsedState.curriculum);
      setSelectedSubject(parsedState.subject);
      setSelectedPaperType(parsedState.paperType);
      setSelectedVariant(parsedState.variant);
      setSelectedYear(parsedState.year);
      setSelectedSeason(parsedState.season);
      setQuickCodeInput(parsedState.quickCode);
      setQuickCodeError(validateQuickCode({ code: parsedState.quickCode }));
    }

    setTimeout(() => {
      setIsMounted(true);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateManualInputs = (): void => {
    const extractedComponents = quickCodeInput.split("/");
    const subject = availableSubjects?.find((s) =>
      s.code.includes(extractedComponents[0])
    );

    setSelectedSubject(subject?.code ?? "");
    setSelectedPaperType(extractedComponents[1][0]);
    setSelectedVariant(extractedComponents[1][1]);
    setSelectedYear("20" + extractedComponents[4]);
    switch (extractedComponents[2]) {
      case "M":
        setSelectedSeason("Summer");
        break;
      case "J":
        setSelectedSeason("Spring");
        break;
      case "O":
        setSelectedSeason("Winter");
        break;
    }
    setInvalidInputs({
      ...INVALID_INPUTS_DEFAULT,
      variant: false,
    });
  };

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

    // Validate the year is 2010 or later
    if (fullYear < 2010) {
      return "Year must be 2010 or later";
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
      const error = validateQuickCode({ code: quickCodeInput });
      setQuickCodeError(error);
      if (!error) {
        updateManualInputs();
        setIsInfoDialogOpen(true);
        setTimeout(() => {
          markingSchemeButtonRef.current?.focus();
        }, 0);
      }
    }
  };

  useEffect(() => {
    const paperType = parseInt(selectedPaperType);
    if (!isNaN(paperType) && paperType > 0 && paperType < 10) {
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    }
  }, [selectedPaperType]);

  useEffect(() => {
    const variant = parseInt(selectedVariant);
    if (!isNaN(variant) && variant > 0 && variant < 10) {
      setInvalidInputs((prev) => ({ ...prev, variant: false }));
    }
  }, [selectedVariant]);

  useEffect(() => {
    const year = parseInt(selectedYear);
    if (!isNaN(year) && year >= 2010 && year <= currentYear) {
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
    const paperType = parseInt(selectedPaperType);
    const variant = parseInt(selectedVariant);
    const year = parseInt(selectedYear);

    const invalidInputs = {
      ...INVALID_INPUTS_DEFAULT,
      curriculum: !selectedCurriculum,
      subject: !selectedSubject,
      paperType: isNaN(paperType) || paperType < 1 || paperType > 9,
      variant: isNaN(variant) || variant < 1 || variant > 9,
      season: !selectedSeason,
      year: isNaN(year) || year < 2010 || year > currentYear,
    };
    setInvalidInputs(invalidInputs);
    return Object.values(invalidInputs).every((value) => value === false);
  };

  const updateQuickCode = (): void => {
    const shortSeason = getShortSeason({
      season: selectedSeason as ValidSeason,
      verbose: true,
    });
    setQuickCodeInput(
      `${selectedSubject
        .split("(")[1]
        .slice(
          0,
          4
        )}/${selectedPaperType}${selectedVariant}/${shortSeason}/${selectedYear.slice(
        2
      )}`
    );
    setQuickCodeError(null);
  };

  const parseLink = ({ type }: { type: "qp" | "ms" }) => {
    const shortSeason = getShortSeason({
      season: selectedSeason as ValidSeason,
      verbose: false,
    });
    const paperType = parseInt(selectedPaperType);
    const variant = parseInt(selectedVariant);
    const year = parseInt(selectedYear);
    const subjectCode = selectedSubject.split("(")[1]?.slice(0, 4);

    const newPaperCode = `${subjectCode}-${shortSeason}${year
      .toString()
      .slice(2)}-${type}-${paperType}${variant}`;
    if (newPaperCode === "9608-w15-qp-12") {
      return "https://pastpapers.co/cie/A-Level/Computer-Science-9608/2015/2015%20Nov/9608_w15_qp_12.pdf";
    }
    return `${BESTEXAMHELP_DOMAIN}/${
      BESTEXAMHELP_CURRICULUM_CODE_PREFIX[selectedCurriculum as ValidCurriculum]
    }/${BESTEXAMHELP_SUBJECT_CODE[subjectCode]}/${year}/${newPaperCode}.php`;
  };

  const clearEverything = () => {
    setSelectedCurriculum("CIE A-LEVEL");
    setSelectedSubject("");
    setSelectedPaperType("");
    setSelectedVariant("");
    setSelectedSeason("");
    setQuickCodeInput("");
    setQuickCodeError(null);
    setSelectedYear("");
  };

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        PAST_PAPER_NAVIGATOR_CACHE_KEY,
        JSON.stringify({
          curriculum: selectedCurriculum,
          subject: selectedSubject,
          paperType: selectedPaperType,
          variant: selectedVariant,
          year: selectedYear,
          season: selectedSeason,
          quickCode: quickCodeInput,
        })
      );
    }
  }, [
    isMounted,
    selectedCurriculum,
    selectedSubject,
    selectedPaperType,
    selectedVariant,
    selectedYear,
    selectedSeason,
    quickCodeInput,
  ]);

  return (
    <>
      <div
        className="hidden h-10 w-full max-w-md items-center sm:flex"
        onClick={() => setIsDialogOpen(true)}
      >
        <Input
          className="h-full w-full max-w-md rounded-xl rounded-r-none border border-[var(--navbar-input-border)] bg-[var(--navbar-bg)] text-[var(--navbar-text)] placeholder:text-white/50 dark:bg-[var(--navbar-bg)]"
          placeholder={breakpoint ? "Search" : "Search past papers"}
          value=""
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
        <DialogContent className="dark:bg-muted max-w-2xl">
          <DialogHeader className="space-y-3 !pb-0">
            <div className="relative">
              <DialogTitle className="relative text-center text-xl font-bold">
                AS & A-Level Past Papers Navigator
              </DialogTitle>
            </div>

            <DialogDescription className="sr-only">
              Search for past papers by subject, topic, year, and more.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(100dvh-150px)] pr-4" type="always">
            <div className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-accent/40 rounded-xl border border-border/50shadow-md">
              <div className="relative z-10 ">
                <div className="flex items-center gap-2 px-4 pt-2 pb-0 ">
                  <div className="absolute inset-0 bg-gradient-to-r from-logo-main/5 via-transparent to-logo-main/5" />
                  <h4 className="text-base font-semibold text-logo-main">
                    ⚡ Quick Paper Code
                  </h4>
                </div>

                <div className="flex justify-center px-4 py-2 gap-5 w-full sm:flex-row flex-col">
                  <div className="relative flex-1">
                    <Input
                      id="quick-code"
                      placeholder="e.g. 9702/42/M/J/20"
                      value={quickCodeInput}
                      onChange={handleQuickCodeInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickCodeSubmit();
                        }
                      }}
                      className={cn(
                        "w-full text-center font-mono text-sm bg-background/80 border-2 transition-all duration-200",
                        quickCodeError
                          ? "border-red-500 focus:border-red-600"
                          : "border-border/50 focus:border-logo-main/50"
                      )}
                    />
                  </div>

                  <div className="relative sm:w-auto w-full">
                    <GlowEffect
                      colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                      mode="colorShift"
                      blur="soft"
                      duration={3}
                    />
                    <Button
                      onClick={handleQuickCodeSubmit}
                      className={cn(
                        "cursor-pointer h-full sm:w-auto w-full relative z-10 font-semibold transition-all duration-200",
                        !!quickCodeError || quickCodeInput === ""
                          ? "opacity-50"
                          : "hover:scale-105"
                      )}
                      disabled={!!quickCodeError || quickCodeInput === ""}
                    >
                      Find Paper
                      <Search className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                <div className="px-4 py-2">
                  {quickCodeError ? (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {quickCodeError}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                        <div className="space-y-1">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <span className="font-semibold">Format:</span>{" "}
                            [Subject Code]/[Paper Number]/[Season]/[Year]
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            <span className="font-semibold">💡 Tip:</span> Press
                            Enter twice to access marking schemes quickly
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            <span className="font-semibold">📝 Note:</span>{" "}
                            Quick search updates manual input fields
                            automatically
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5 items-center justify-center overflow-hidden rounded-xl border border-border p-4 shadow-md mt-6">
              <h4 className="text-base self-start font-semibold text-logo-main">
                🎯 Manual Input
              </h4>
              <div className="relative w-full">
                <div className=" rounded-lg w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold mb-1 text-foreground">
                      📚 Curriculum
                    </span>
                  </div>
                  <EnhancedSelect
                    data={TOPICAL_DATA.map((item) => ({
                      code: item.curriculum,
                      coverImage: item.coverImage,
                    }))}
                    label="Curriculum"
                    prerequisite=""
                    triggerClassName="w-full "
                    side="bottom"
                    popoverContentClassName="!w-[var(--radix-popover-trigger-width)]"
                    selectedValue={selectedCurriculum}
                    modal={true}
                    setSelectedValue={(value) => {
                      setSelectedCurriculum(value as ValidCurriculum);
                    }}
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
                  triggerClassName="w-full "
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

              <div className="  w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    📄 Paper Details
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Paper Type
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        className="w-8 h-8 rounded-lg cursor-pointer "
                        variant="outline"
                        size="sm"
                        title="Decrease"
                        onClick={() => {
                          const current = parseInt(selectedPaperType) || 1;
                          setSelectedPaperType(
                            (current > 1 ? current - 1 : 9).toString()
                          );
                        }}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        placeholder="e.g. 4"
                        max={9}
                        min={1}
                        value={selectedPaperType}
                        type="number"
                        className="text-center font-mono font-semibold  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
                        onChange={(e) => setSelectedPaperType(e.target.value)}
                      />
                      <Button
                        className="w-8 h-8 rounded-lg cursor-pointer "
                        variant="outline"
                        size="sm"
                        title="Increase"
                        onClick={() => {
                          const current = parseInt(selectedPaperType) || 1;
                          setSelectedPaperType(
                            (current < 9 ? current + 1 : 1).toString()
                          );
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {invalidInputs.paperType && (
                      <div className="flex items-center mt-2 gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-md">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {parseInt(selectedPaperType) < 1 ||
                          parseInt(selectedPaperType) > 9 ||
                          isNaN(parseInt(selectedPaperType))
                            ? "Paper type must be between 1 and 9"
                            : "Paper type is required"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Variant
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        className="w-8 h-8 rounded-lg cursor-pointer "
                        variant="outline"
                        size="sm"
                        title="Decrease"
                        onClick={() => {
                          const current = parseInt(selectedVariant) || 1;
                          setSelectedVariant(
                            (current > 1 ? current - 1 : 9).toString()
                          );
                        }}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        placeholder="e.g. 2"
                        value={selectedVariant}
                        type="number"
                        className="text-center font-mono font-semibold  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
                        max={9}
                        min={1}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                      />
                      <Button
                        className="w-8 h-8 rounded-lg cursor-pointer "
                        variant="outline"
                        size="sm"
                        title="Increase"
                        onClick={() => {
                          const current = parseInt(selectedVariant) || 1;
                          setSelectedVariant(
                            (current < 9 ? current + 1 : 1).toString()
                          );
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {invalidInputs.variant && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 border mt-2 border-red-200 dark:border-red-800/30 rounded-md">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {parseInt(selectedVariant) < 1 ||
                          parseInt(selectedVariant) > 9 ||
                          isNaN(parseInt(selectedVariant))
                            ? "Variant must be between 1 and 9"
                            : "Variant is required"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className=" w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold mb-1 text-foreground">
                    🗓️ Exam Season
                  </span>
                </div>
                <Select
                  value={selectedSeason}
                  onValueChange={(value) => setSelectedSeason(value)}
                >
                  <SelectTrigger className="w-full ">
                    <SelectValue placeholder="Select exam season" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[99999999] dark:bg-accent w-[var(--radix-select-trigger-width)]"
                    side="bottom"
                  >
                    <SelectItem value="Spring">
                      🌱 F/M - February/March (Spring)
                    </SelectItem>
                    <SelectItem value="Summer">
                      ☀️ M/J - May/June (Summer)
                    </SelectItem>
                    <SelectItem value="Winter">
                      ❄️ O/N - October/November (Winter)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {invalidInputs.season && (
                  <div className="flex items-center mt-2 gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-md">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Season is required
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold mb-1 text-foreground">
                    📅 Year
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="w-8 h-8 rounded-lg cursor-pointer "
                    variant="outline"
                    size="sm"
                    title="Decrease"
                    onClick={() => {
                      const current = parseInt(selectedYear) || currentYear;
                      setSelectedYear(
                        (current > 2010 ? current - 1 : currentYear).toString()
                      );
                    }}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    placeholder={`e.g. ${currentYear}`}
                    max={currentYear}
                    min={2010}
                    value={selectedYear}
                    type="number"
                    className="text-center font-mono font-semibold  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  />
                  <Button
                    className="w-8 h-8 rounded-lg cursor-pointer "
                    variant="outline"
                    size="sm"
                    title="Increase"
                    onClick={() => {
                      const current = parseInt(selectedYear) || currentYear;
                      setSelectedYear(
                        (current < currentYear ? current + 1 : 2010).toString()
                      );
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                {invalidInputs.year && (
                  <div className="flex items-center mt-2 gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-md">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      {parseInt(selectedYear) < 2010 ||
                      parseInt(selectedYear) > currentYear ||
                      isNaN(parseInt(selectedYear))
                        ? "Year must be between 2010 and " + currentYear
                        : "Year is required"}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative pt-2 w-full">
                <Button
                  className="relative w-full cursor-pointer font-semibold bg-logo-main hover:bg-logo-main/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => {
                    if (validateManuaInputs()) {
                      updateQuickCode();
                      setIsInfoDialogOpen(true);
                      setTimeout(() => {
                        markingSchemeButtonRef.current?.focus();
                      }, 0);
                    }
                  }}
                >
                  Find Paper
                </Button>
              </div>

              <div className="relative pt-0 w-full">
                <Button
                  className="w-full cursor-pointer font-semibold  text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  variant="destructive"
                  onClick={clearEverything}
                >
                  Clear Everything
                  <Trash2 className="w-4 h-4 ml-2" />
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent
          className="dark:bg-muted z-[9999999] !max-w-[475px] w-[85%]"
          overlayClassName="z-[999999]"
        >
          <DialogHeader>
            <DialogTitle className="text-center">Paper details</DialogTitle>
            <DialogDescription className="sr-only">
              Check the paper details before visiting the paper
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="w-full h-[83dvh]" type="always">
            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background via-accent/30 to-accent/50 p-6 shadow-lg">
              <div className="relative z-10 grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Curriculum
                    </span>
                    <span className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border">
                      {selectedCurriculum}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Subject
                    </span>
                    <span
                      className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border truncate"
                      title={selectedSubject}
                    >
                      {selectedSubject}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Paper
                    </span>
                    <span className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border">
                      Paper {selectedPaperType} Variant {selectedVariant}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Year
                    </span>
                    <span className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border">
                      {selectedYear}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Exam Season
                  </span>
                  <span className="text-sm font-semibold text-foreground bg-accent/50 px-3 py-2 rounded-lg border">
                    {selectedSeason}{" "}
                    {selectedSeason === "Spring"
                      ? "(F/M)"
                      : selectedSeason === "Summer"
                      ? "(M/J)"
                      : "(O/N)"}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Paper code
                  </span>
                  <span
                    className="text-sm font-semibold cursor-pointer  text-foreground bg-accent/50 px-3 py-2 rounded-lg border"
                    title="Click to copy paper code"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(quickCodeInput);
                        toast.success("Paper code copied to clipboard!", {
                          description: `${quickCodeInput} is now in your clipboard`,
                          duration: 3000,
                        });
                      } catch {
                        toast.error("Failed to copy to clipboard", {
                          description:
                            "Please try selecting and copying manually",
                          duration: 3000,
                        });
                      }
                    }}
                  >
                    {quickCodeInput}
                  </span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-3 cursor-pointer" asChild>
              <a
                href={parseLink({ type: "ms" })}
                target="_blank"
                rel="noopener noreferrer"
                ref={markingSchemeButtonRef}
              >
                Open marking scheme <ExternalLink />
              </a>
            </Button>
            <Button className="w-full mt-3 cursor-pointer" asChild>
              <a
                href={parseLink({ type: "qp" })}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open question paper <ExternalLink />
              </a>
            </Button>
            <Button
              className="w-full mt-3 cursor-pointer"
              onClick={() => setIsInfoDialogOpen(false)}
            >
              Close <XIcon />
            </Button>
            <Button
              className="w-full mt-3 cursor-pointer"
              variant="destructive"
              onClick={() => {
                clearEverything();
                setIsInfoDialogOpen(false);
              }}
            >
              Clear Everything <Trash2 />
            </Button>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchPastPaper;
