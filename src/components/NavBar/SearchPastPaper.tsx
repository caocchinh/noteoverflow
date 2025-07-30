import { Minus, Plus, Search, Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
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
  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[
      TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
    ]?.subject;
  }, [selectedCurriculum]);

  const validateQuickCode = ({ code }: { code: string }): string => {
    if (!code) return "";

    const regex = /^(\d{4})\/(\d{2})\/(F\/M|M\/J|O\/N)\/(\d{2})$/;
    if (!regex.test(code)) {
      return "Invalid format. Correct: [Subject Code]/[Paper Number]/[Season]/[Year]";
    }

    const match = code.match(regex);
    if (!match)
      return "Invalid format. Correct: [Subject Code]/[Paper Number]/[Season]/[Year]";
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
    const currentYear = new Date().getFullYear();
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              AS & A-Level Past Papers Search
            </DialogTitle>
            <DialogDescription className="sr-only">
              Search for past papers by subject, topic, year, and more.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 items-start px-5 justify-center mb-5 h-full border-2  rounded-sm relative">
            <h4 className="text-sm text-logo-main">Quick Paper Code</h4>
            <div className="flex justify-center gap-2 w-full">
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
                  className={`cursor-pointer h-full relative z-10 ${
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
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchPastPaper;
