import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BESTEXAMHELP_CURRICULUM_CODE_PREFIX,
  BESTEXAMHELP_DOMAIN,
  BESTEXAMHELP_SUBJECT_CODE,
  PAST_PAPER_NAVIGATOR_CACHE_KEY,
  TOPICAL_DATA,
} from "@/constants/constants";
import {
  PastPaperNavigatorCache,
  ValidCurriculum,
  ValidSeason,
} from "@/constants/types";
import { INVALID_INPUTS_DEFAULT } from "@/features/topical/constants/constants";
import { getShortSeason } from "@/lib/utils";

import ChromeExtensionBanner from "./ChromeExtensionBanner";
import QuickCodeSection from "./QuickCodeSection";
import ManualInputForm from "./ManualInputForm";
import PaperDetailsDialog from "./PaperDetailsDialog";
import { InvalidInputsWithVariant, PaperLinkType } from "./types";

const SearchPastPaper = memo(({ children }: { children?: React.ReactNode }) => {
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
        paperType: [],
        season: [],
      });
    }
    return subjects;
  }, [selectedCurriculum]);

  const [invalidInputs, setInvalidInputs] = useState<InvalidInputsWithVariant>({
    ...INVALID_INPUTS_DEFAULT,
    variant: false,
  });

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [isMounted, setIsMounted] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  const validateQuickCode = useCallback(
    ({ code }: { code: string }): string => {
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

      const yearDigits = match[4];
      const fullYear = parseInt(`20${yearDigits}`);
      if (fullYear > currentYear) {
        return `Year cannot exceed current year (${currentYear})`;
      }

      if (fullYear < 2010) {
        return "Year must be 2010 or later";
      }

      return "";
    },
    [availableSubjects, currentYear]
  );

  // Load cached state from localStorage
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

  const updateManualInputs = useCallback((): void => {
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
      case "F":
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
  }, [quickCodeInput, availableSubjects]);

  const handleQuickCodeInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setQuickCodeInput(value);
      setQuickCodeError(validateQuickCode({ code: value }));
    },
    [validateQuickCode]
  );

  const handleQuickCodeSubmit = useCallback(() => {
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
  }, [quickCodeInput, validateQuickCode, updateManualInputs]);

  // Validation effect hooks
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

  const validateManualInputs = useCallback((): boolean => {
    const paperType = parseInt(selectedPaperType);
    const variant = parseInt(selectedVariant);
    const year = parseInt(selectedYear);

    const newInvalidInputs = {
      ...INVALID_INPUTS_DEFAULT,
      curriculum: !selectedCurriculum,
      subject: !selectedSubject,
      paperType: isNaN(paperType) || paperType < 1 || paperType > 9,
      variant: isNaN(variant) || variant < 1 || variant > 9,
      season: !selectedSeason,
      year: isNaN(year) || year < 2010 || year > currentYear,
    };
    setInvalidInputs(newInvalidInputs);
    return Object.values(newInvalidInputs).every((value) => value === false);
  }, [
    selectedPaperType,
    selectedVariant,
    selectedYear,
    selectedCurriculum,
    selectedSubject,
    selectedSeason,
    currentYear,
  ]);

  const updateQuickCode = useCallback((): void => {
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
  }, [
    selectedSeason,
    selectedSubject,
    selectedPaperType,
    selectedVariant,
    selectedYear,
  ]);

  const parseLink = useCallback(
    ({ type }: { type: PaperLinkType }) => {
      const shortSeason = getShortSeason({
        season: selectedSeason as ValidSeason,
        verbose: false,
      });
      const paperType = parseInt(selectedPaperType);
      const variant = parseInt(selectedVariant);
      const year = parseInt(selectedYear);
      const subjectCode = selectedSubject.split("(")[1]?.slice(0, 4);

      let newPaperCode = `${subjectCode}-${shortSeason}${year
        .toString()
        .slice(2)}-${type}`;
      if (type === "ms" || type === "qp") {
        newPaperCode = `${newPaperCode}-${paperType}${variant}`;
      }
      if (newPaperCode === "9608-w15-qp-12") {
        return "https://pastpapers.co/cie/A-Level/Computer-Science-9608/2015/2015%20Nov/9608_w15_qp_12.pdf";
      }
      return `${BESTEXAMHELP_DOMAIN}/${
        BESTEXAMHELP_CURRICULUM_CODE_PREFIX[
          selectedCurriculum as ValidCurriculum
        ]
      }/${BESTEXAMHELP_SUBJECT_CODE[subjectCode]}/${year}/${newPaperCode}.php`;
    },
    [
      selectedSeason,
      selectedPaperType,
      selectedVariant,
      selectedYear,
      selectedSubject,
      selectedCurriculum,
    ]
  );

  const clearEverything = useCallback(() => {
    setSelectedCurriculum("CIE A-LEVEL");
    setSelectedSubject("");
    setSelectedPaperType("");
    setSelectedVariant("");
    setSelectedSeason("");
    setQuickCodeInput("");
    setQuickCodeError(null);
    setSelectedYear("");
  }, []);

  // Persist state to localStorage
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

  const [isMount, setIsMount] = useState(false);

  useEffect(() => {
    setIsMount(true);
  }, []);

  if (!isMount) return null;

  const handleFindPaper = () => {
    if (validateManualInputs()) {
      updateQuickCode();
      setIsInfoDialogOpen(true);
      setTimeout(() => {
        markingSchemeButtonRef.current?.focus();
      }, 0);
    }
  };

  return (
    <>
      {children ? (
        <div onClick={() => setIsDialogOpen(true)}>{children}</div>
      ) : (
        <>
          <div
            className="h-10 w-full max-w-md items-center flex"
            onClick={() => setIsDialogOpen(true)}
          >
            <Input
              className="h-full w-full max-w-md rounded-xl rounded-r-none border border-(--navbar-input-border) bg-(--navbar-bg) text-(--navbar-text) placeholder:text-white/50 dark:bg-(--navbar-bg)"
              placeholder={breakpoint ? "Search" : "Search past paper question"}
              value=""
              readOnly={true}
            />
            <Button className="h-full w-10 rounded-xl rounded-l-none border border-(--navbar-input-border) bg-(--navbar-button-bg) hover:cursor-pointer hover:bg-(--navbar-border) lg:w-14">
              <SearchIcon className="text-(--navbar-text)" />
            </Button>
          </div>
          <Button
            className="flex h-full w-9 items-center justify-center border border-(--navbar-border) bg-transparent p-2 text-(--navbar-text) hover:cursor-pointer hover:bg-(--navbar-border) sm:hidden"
            onClick={() => setIsDialogOpen(true)}
          >
            <SearchIcon />
          </Button>
        </>
      )}

      {/* Main Search Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="dark:bg-muted max-w-2xl">
          <DialogHeader className="space-y-3 pb-0!">
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
            <ChromeExtensionBanner />

            <QuickCodeSection
              value={quickCodeInput}
              error={quickCodeError}
              onChange={handleQuickCodeInputChange}
              onSubmit={handleQuickCodeSubmit}
            />

            <ManualInputForm
              selectedCurriculum={selectedCurriculum}
              setSelectedCurriculum={setSelectedCurriculum}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedPaperType={selectedPaperType}
              setSelectedPaperType={setSelectedPaperType}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
              selectedSeason={selectedSeason}
              setSelectedSeason={setSelectedSeason}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              invalidInputs={invalidInputs}
              currentYear={currentYear}
              onFindPaper={handleFindPaper}
              onClearEverything={clearEverything}
              onClose={() => setIsDialogOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Paper Details Dialog */}
      <PaperDetailsDialog
        isOpen={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
        selectedCurriculum={selectedCurriculum}
        selectedSubject={selectedSubject}
        selectedPaperType={selectedPaperType}
        selectedVariant={selectedVariant}
        selectedSeason={selectedSeason}
        selectedYear={selectedYear}
        quickCodeInput={quickCodeInput}
        parseLink={parseLink}
        onClearEverything={clearEverything}
        markingSchemeButtonRef={markingSchemeButtonRef}
      />
    </>
  );
});

SearchPastPaper.displayName = "SearchPastPaper";

export default SearchPastPaper;
