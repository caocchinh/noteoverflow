"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  INVALID_INPUTS_DEFAULT,
  TOPICAL_DATA,
} from "@/features/topical/constants/constants";
import { ValidCurriculum } from "@/constants/types";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import EnhancedMultiSelect from "@/features/topical/components/EnhancedMultiSelect";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BrushCleaning, ScanText, SlidersHorizontal, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { InvalidInputs } from "@/features/topical/constants/types";
import { LAST_SESSION_FILTERS_KEY } from "@/features/topical/constants/constants";

const ButtonUltility = ({
  isResetConfirmationOpen,
  setIsResetConfirmationOpen,
  resetEverything,
  setIsSidebarOpen,
  search,
  isMounted,
}: {
  isResetConfirmationOpen: boolean;
  setIsResetConfirmationOpen: (value: boolean) => void;
  resetEverything: () => void;
  setIsSidebarOpen: (value: boolean) => void;
  search: () => void;
  isMounted: boolean;
}) => {
  const { theme } = useTheme();

  return (
    <>
      <Button
        className="cursor-pointer w-full bg-logo-main text-white hover:bg-logo-main/90"
        onClick={search}
        disabled={!isMounted}
      >
        Search
        <ScanText />
      </Button>
      <Dialog
        open={isResetConfirmationOpen}
        onOpenChange={setIsResetConfirmationOpen}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="cursor-pointer w-full"
            disabled={!isMounted}
          >
            Clear
            <BrushCleaning />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clear all</DialogTitle>
            <DialogDescription>
              This will clear all the selected options and reset the form. Are
              you sure you want to clear?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer"
              onClick={() => {
                resetEverything();
                setIsResetConfirmationOpen(false);
              }}
            >
              Clear
              <BrushCleaning />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button
        className="cursor-pointer w-full"
        onClick={() => {
          setIsSidebarOpen(false);
        }}
        variant={theme === "dark" && isMounted ? "destructive" : "default"}
      >
        Close filter
        <X className="w-4 h-4" />
      </Button>
    </>
  );
};

const TopicalPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    ValidCurriculum | ""
  >("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [sidebarKey, setSidebarKey] = useState(0);
  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[
      TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
    ]?.subject;
  }, [selectedCurriculum]);
  const availableTopics = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.topic;
  }, [availableSubjects, selectedSubject]);
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const availableYears = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.year;
  }, [availableSubjects, selectedSubject]);
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
  const availablePaperTypes = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.paperType;
  }, [availableSubjects, selectedSubject]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const availableSeasons = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.season;
  }, [availableSubjects, selectedSubject]);
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  const isMobileDevice = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({
    ...INVALID_INPUTS_DEFAULT,
  });
  const curriculumRef = useRef<HTMLDivElement | null>(null);
  const subjectRef = useRef<HTMLDivElement | null>(null);
  const topicRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const paperTypeRef = useRef<HTMLDivElement | null>(null);
  const seasonRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const resetEverything = () => {
    setSelectedCurriculum("");
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    if (!isMobileDevice) {
      setSidebarKey((prev) => prev + 1);
    }
    setIsResetConfirmationOpen(false);
  };

  const isValidInputs = () => {
    const fieldsToValidate: {
      name: keyof InvalidInputs;
      value: string | string[];
      ref: React.RefObject<HTMLDivElement | null>;
      isInvalid: boolean;
    }[] = [
      {
        name: "curriculum",
        value: selectedCurriculum,
        ref: curriculumRef,
        isInvalid: !selectedCurriculum,
      },
      {
        name: "subject",
        value: selectedSubject,
        ref: subjectRef,
        isInvalid: !selectedSubject,
      },
      {
        name: "topic",
        value: selectedTopic,
        ref: topicRef,
        isInvalid: selectedTopic.length === 0,
      },
      {
        name: "year",
        value: selectedYear,
        ref: yearRef,
        isInvalid: selectedYear.length === 0,
      },
      {
        name: "paperType",
        value: selectedPaperType,
        ref: paperTypeRef,
        isInvalid: selectedPaperType.length === 0,
      },
      {
        name: "season",
        value: selectedSeason,
        ref: seasonRef,
        isInvalid: selectedSeason.length === 0,
      },
    ];

    const newInvalidInputsState: InvalidInputs = {
      ...INVALID_INPUTS_DEFAULT,
    };

    let isFormValid = true;
    let firstInvalidRef: React.RefObject<HTMLDivElement | null> | null = null;

    for (const field of fieldsToValidate) {
      if (field.isInvalid) {
        newInvalidInputsState[field.name] = true;
        if (isFormValid) {
          firstInvalidRef = field.ref;
        }
        isFormValid = false;
      }
    }
    setInvalidInputs(newInvalidInputsState);

    firstInvalidRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    return isFormValid;
  };

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

  useEffect(() => {
    if (selectedTopic.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, topic: false }));
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedPaperType.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    }
  }, [selectedPaperType]);

  useEffect(() => {
    if (selectedYear.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, year: false }));
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedSeason.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, season: false }));
    }
  }, [selectedSeason]);

  useEffect(() => {
    const savedState = localStorage.getItem(LAST_SESSION_FILTERS_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.curriculum) {
          setSelectedCurriculum(parsedState.curriculum);
          if (parsedState.subject) {
            setSelectedSubject(parsedState.subject);
            if (parsedState.topic) setSelectedTopic(parsedState.topic);
            if (parsedState.paperType)
              setSelectedPaperType(parsedState.paperType);
            if (parsedState.year) setSelectedYear(parsedState.year);
            if (parsedState.season) setSelectedSeason(parsedState.season);
          }
        }
      } catch {
        localStorage.removeItem(LAST_SESSION_FILTERS_KEY);
      }
    }

    setTimeout(() => {
      mountedRef.current = true;
      setIsMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    const stateToSave = {
      curriculum: selectedCurriculum,
      subject: selectedSubject,
      topic: selectedTopic,
      paperType: selectedPaperType,
      year: selectedYear,
      season: selectedSeason,
    };

    if (mountedRef.current) {
      localStorage.setItem(
        LAST_SESSION_FILTERS_KEY,
        JSON.stringify(stateToSave)
      );
    }
  }, [
    selectedCurriculum,
    selectedSubject,
    selectedTopic,
    selectedPaperType,
    selectedYear,
    selectedSeason,
  ]);

  useEffect(() => {
    if (!mountedRef.current) return;
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
  }, [selectedCurriculum]);

  useEffect(() => {
    if (!mountedRef.current) return;
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
  }, [selectedSubject]);

  const search = () => {
    if (isValidInputs()) return;
  };

  return (
    <div className="pt-16">
      <SidebarProvider
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        openMobile={isSidebarOpen}
        onOpenChangeMobile={setIsSidebarOpen}
        defaultOpen={true}
        defaultOpenMobile={true}
      >
        <Sidebar variant="floating" key={sidebarKey}>
          <SidebarHeader className="p-0 m-0 sr-only ">Filters</SidebarHeader>
          <SidebarContent className="p-4 w-full flex flex-col gap-4 items-center justify-start overflow-x-hidden pt-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  {selectedSubject && selectedCurriculum ? (
                    <motion.div
                      key={selectedSubject}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.15,
                        ease: "easeInOut",
                      }}
                    >
                      <Image
                        src={
                          availableSubjects!.find(
                            (item) => item.code === selectedSubject
                          )?.coverImage ?? ""
                        }
                        alt="cover"
                        className="self-center rounded-[2px]"
                        width={100}
                        height={126}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedSubject}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.15,
                        ease: "easeInOut",
                      }}
                    >
                      <Image
                        src="/assets/pointing.png"
                        alt="default subject"
                        width={100}
                        height={100}
                        className="self-center"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-start gap-6 flex-col justify-start">
                  <div
                    className="flex flex-col gap-1 items-start justify-start"
                    ref={curriculumRef}
                  >
                    <h3
                      className={cn(
                        "text-sm font-medium w-max",
                        invalidInputs.curriculum && "text-destructive"
                      )}
                    >
                      Curriculum
                    </h3>
                    <EnhancedSelect
                      label="Curriculum"
                      prerequisite=""
                      data={TOPICAL_DATA.map((item) => ({
                        code: item.curriculum,
                        coverImage: item.coverImage,
                      }))}
                      selectedValue={selectedCurriculum}
                      setSelectedValue={(value) => {
                        setSelectedCurriculum(value as ValidCurriculum);
                      }}
                    />
                    {invalidInputs.curriculum && (
                      <p className="text-destructive text-sm">
                        Curriculum is required
                      </p>
                    )}
                  </div>

                  <div
                    className="flex flex-col gap-1 items-start justify-start"
                    ref={subjectRef}
                  >
                    <h3
                      className={cn(
                        "text-sm font-medium w-max",
                        invalidInputs.subject && "text-destructive"
                      )}
                    >
                      Subject
                    </h3>
                    <EnhancedSelect
                      label="Subject"
                      prerequisite={!selectedCurriculum ? "Curriculum" : ""}
                      data={availableSubjects}
                      selectedValue={selectedSubject}
                      setSelectedValue={setSelectedSubject}
                    />
                    {invalidInputs.subject && (
                      <p className="text-destructive text-sm">
                        Subject is required
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col flex items-center justify-center gap-4">
              <div
                className="flex flex-col gap-1 items-start justify-start"
                ref={topicRef}
              >
                <h3
                  className={cn(
                    "text-sm font-medium w-max",
                    invalidInputs.topic && "text-destructive"
                  )}
                >
                  Topic
                </h3>
                <EnhancedMultiSelect
                  label="Topic"
                  values={selectedTopic}
                  onValuesChange={(values) =>
                    setSelectedTopic(values as string[])
                  }
                  prerequisite="Subject"
                  data={availableTopics}
                />
                {invalidInputs.topic && (
                  <p className="text-destructive text-sm">Topic is required</p>
                )}
              </div>
              <div
                className="flex flex-col gap-1 items-start justify-start"
                ref={paperTypeRef}
              >
                <h3
                  className={cn(
                    "text-sm font-medium w-max",
                    invalidInputs.paperType && "text-destructive"
                  )}
                >
                  Paper
                </h3>
                <EnhancedMultiSelect
                  label="Paper"
                  values={selectedPaperType}
                  onValuesChange={(values) =>
                    setSelectedPaperType(values as string[])
                  }
                  prerequisite="Subject"
                  data={availablePaperTypes?.map((item) => item.toString())}
                />
                {invalidInputs.paperType && (
                  <p className="text-destructive text-sm">Paper is required</p>
                )}
              </div>
              <div
                className="flex flex-col gap-1 items-start justify-start"
                ref={yearRef}
              >
                <h3
                  className={cn(
                    "text-sm font-medium w-max",
                    invalidInputs.year && "text-destructive"
                  )}
                >
                  Year
                </h3>
                <EnhancedMultiSelect
                  label="Year"
                  values={selectedYear}
                  onValuesChange={(values) =>
                    setSelectedYear(values as string[])
                  }
                  prerequisite="Subject"
                  data={availableYears?.map((item) => item.toString())}
                />
                {invalidInputs.year && (
                  <p className="text-destructive text-sm">Year is required</p>
                )}
              </div>
              <div
                className="flex flex-col gap-1 items-start justify-start"
                ref={seasonRef}
              >
                <h3
                  className={cn(
                    "text-sm font-medium w-max",
                    invalidInputs.season && "text-destructive"
                  )}
                >
                  Season
                </h3>
                <EnhancedMultiSelect
                  label="Season"
                  values={selectedSeason}
                  onValuesChange={(values) =>
                    setSelectedSeason(values as string[])
                  }
                  prerequisite="Subject"
                  data={availableSeasons}
                />
                {invalidInputs.season && (
                  <p className="text-destructive text-sm">Season is required</p>
                )}
              </div>
            </div>
            <div className="flex w-[300px] justify-center items-center flex-col gap-4">
              <ButtonUltility
                isResetConfirmationOpen={isResetConfirmationOpen}
                setIsResetConfirmationOpen={setIsResetConfirmationOpen}
                resetEverything={resetEverything}
                setIsSidebarOpen={setIsSidebarOpen}
                search={search}
                isMounted={isMounted}
              />
            </div>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="!relative p-4 pl-2 gap-6 flex items-center md:items-start justify-start flex-col">
          <div className="absolute left-2">
            <Button
              className="flex fixed items-center gap-2 border cursor-pointer"
              variant="outline"
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
            >
              Filters
              <SlidersHorizontal />
            </Button>
          </div>
          <h1 className="text-2xl font-bold w-full  text-center ">
            Topical questions
          </h1>
          <Image
            src="/assets/funny2.png"
            alt="default subject"
            width={350}
            height={350}
            className="self-center rounded-md"
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default TopicalPage;
