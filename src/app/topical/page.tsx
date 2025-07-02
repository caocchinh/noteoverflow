'use client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  BrushCleaning,
  FileClock,
  LayoutDashboard,
  ScanText,
  Settings,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import type { ValidCurriculum } from '@/constants/types';
import Dock from '@/features/topical/components/Dock';
import EnhancedMultiSelect from '@/features/topical/components/EnhancedMultiSelect';
import EnhancedSelect from '@/features/topical/components/EnhancedSelect';
import {
  INVALID_INPUTS_DEFAULT,
  LAST_SESSION_FILTERS_KEY,
  TOPICAL_DATA,
} from '@/features/topical/constants/constants';
import type { InvalidInputs } from '@/features/topical/constants/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
        className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
        disabled={!isMounted}
        onClick={search}
      >
        Search
        <ScanText />
      </Button>
      <Dialog
        onOpenChange={setIsResetConfirmationOpen}
        open={isResetConfirmationOpen}
      >
        <DialogTrigger asChild>
          <Button
            className="w-full cursor-pointer"
            disabled={!isMounted}
            variant="outline"
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
              <Button className="cursor-pointer" variant="outline">
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
        className="w-full cursor-pointer"
        onClick={() => {
          setIsSidebarOpen(false);
        }}
        variant={theme === 'dark' && isMounted ? 'destructive' : 'default'}
      >
        Close filter
        <X className="h-4 w-4" />
      </Button>
    </>
  );
};

const TopicalPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    ValidCurriculum | ''
  >('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
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
    setSelectedCurriculum('');
    setSelectedSubject('');
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
        name: 'curriculum',
        value: selectedCurriculum,
        ref: curriculumRef,
        isInvalid: !selectedCurriculum,
      },
      {
        name: 'subject',
        value: selectedSubject,
        ref: subjectRef,
        isInvalid: !selectedSubject,
      },
      {
        name: 'topic',
        value: selectedTopic,
        ref: topicRef,
        isInvalid: selectedTopic.length === 0,
      },
      {
        name: 'year',
        value: selectedYear,
        ref: yearRef,
        isInvalid: selectedYear.length === 0,
      },
      {
        name: 'paperType',
        value: selectedPaperType,
        ref: paperTypeRef,
        isInvalid: selectedPaperType.length === 0,
      },
      {
        name: 'season',
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
      behavior: 'smooth',
      block: 'center',
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
            if (parsedState.topic) {
              setSelectedTopic(parsedState.topic);
            }
            if (parsedState.paperType) {
              setSelectedPaperType(parsedState.paperType);
            }
            if (parsedState.year) {
              setSelectedYear(parsedState.year);
            }
            if (parsedState.season) {
              setSelectedSeason(parsedState.season);
            }
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <Intended behavior>
  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    setSelectedSubject('');
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
  }, [selectedCurriculum]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <Intended behavior>
  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
  }, [selectedSubject]);

  const search = () => {
    if (isValidInputs()) {
      return;
    }
  };

  return (
    <div className="pt-16">
      <SidebarProvider
        defaultOpen={true}
        defaultOpenMobile={true}
        onOpenChange={setIsSidebarOpen}
        onOpenChangeMobile={setIsSidebarOpen}
        open={isSidebarOpen}
        openMobile={isSidebarOpen}
      >
        <Sidebar key={sidebarKey} variant="floating">
          <SidebarHeader className="sr-only m-0 p-0 ">Filters</SidebarHeader>
          <SidebarContent className="flex w-full flex-col items-center justify-start gap-4 overflow-x-hidden p-4 pt-2">
            <div className="flex w-full flex-col items-center justify-start gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <AnimatePresence mode="wait">
                    {selectedSubject && selectedCurriculum ? (
                      <motion.div
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        key={selectedSubject}
                        transition={{
                          duration: 0.15,
                          ease: 'easeInOut',
                        }}
                      >
                        <Image
                          alt="cover"
                          className="self-center rounded-[2px]"
                          height={126}
                          src={
                            availableSubjects.find(
                              (item) => item.code === selectedSubject
                            )?.coverImage ?? ''
                          }
                          width={100}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        key={selectedSubject}
                        transition={{
                          duration: 0.15,
                          ease: 'easeInOut',
                        }}
                      >
                        <Image
                          alt="default subject"
                          className="self-center"
                          height={100}
                          src="/assets/pointing.png"
                          width={100}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex flex-col items-start justify-start gap-6">
                    <div
                      className="flex flex-col items-start justify-start gap-1"
                      ref={curriculumRef}
                    >
                      <h3
                        className={cn(
                          'w-max font-medium text-sm',
                          invalidInputs.curriculum && 'text-destructive'
                        )}
                      >
                        Curriculum
                      </h3>
                      <EnhancedSelect
                        data={TOPICAL_DATA.map((item) => ({
                          code: item.curriculum,
                          coverImage: item.coverImage,
                        }))}
                        label="Curriculum"
                        prerequisite=""
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
                      className="flex flex-col items-start justify-start gap-1"
                      ref={subjectRef}
                    >
                      <h3
                        className={cn(
                          'w-max font-medium text-sm',
                          invalidInputs.subject && 'text-destructive'
                        )}
                      >
                        Subject
                      </h3>
                      <EnhancedSelect
                        data={availableSubjects}
                        label="Subject"
                        prerequisite={selectedCurriculum ? '' : 'Curriculum'}
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
              <div className="flex flex-col items-center justify-center gap-4">
                <div
                  className="flex flex-col items-start justify-start gap-1"
                  ref={topicRef}
                >
                  <h3
                    className={cn(
                      'w-max font-medium text-sm',
                      invalidInputs.topic && 'text-destructive'
                    )}
                  >
                    Topic
                  </h3>
                  <EnhancedMultiSelect
                    data={availableTopics}
                    label="Topic"
                    onValuesChange={(values) =>
                      setSelectedTopic(values as string[])
                    }
                    prerequisite="Subject"
                    values={selectedTopic}
                  />
                  {invalidInputs.topic && (
                    <p className="text-destructive text-sm">
                      Topic is required
                    </p>
                  )}
                </div>
                <div
                  className="flex flex-col items-start justify-start gap-1"
                  ref={paperTypeRef}
                >
                  <h3
                    className={cn(
                      'w-max font-medium text-sm',
                      invalidInputs.paperType && 'text-destructive'
                    )}
                  >
                    Paper
                  </h3>
                  <EnhancedMultiSelect
                    data={availablePaperTypes?.map((item) => item.toString())}
                    label="Paper"
                    onValuesChange={(values) =>
                      setSelectedPaperType(values as string[])
                    }
                    prerequisite="Subject"
                    values={selectedPaperType}
                  />
                  {invalidInputs.paperType && (
                    <p className="text-destructive text-sm">
                      Paper is required
                    </p>
                  )}
                </div>
                <div
                  className="flex flex-col items-start justify-start gap-1"
                  ref={yearRef}
                >
                  <h3
                    className={cn(
                      'w-max font-medium text-sm',
                      invalidInputs.year && 'text-destructive'
                    )}
                  >
                    Year
                  </h3>
                  <EnhancedMultiSelect
                    data={availableYears?.map((item) => item.toString())}
                    label="Year"
                    onValuesChange={(values) =>
                      setSelectedYear(values as string[])
                    }
                    prerequisite="Subject"
                    values={selectedYear}
                  />
                  {invalidInputs.year && (
                    <p className="text-destructive text-sm">Year is required</p>
                  )}
                </div>
                <div
                  className="flex flex-col items-start justify-start gap-1"
                  ref={seasonRef}
                >
                  <h3
                    className={cn(
                      'w-max font-medium text-sm',
                      invalidInputs.season && 'text-destructive'
                    )}
                  >
                    Season
                  </h3>
                  <EnhancedMultiSelect
                    data={availableSeasons}
                    label="Season"
                    onValuesChange={(values) =>
                      setSelectedSeason(values as string[])
                    }
                    prerequisite="Subject"
                    values={selectedSeason}
                  />
                  {invalidInputs.season && (
                    <p className="text-destructive text-sm">
                      Season is required
                    </p>
                  )}
                </div>
              </div>
              <div className="flex w-[300px] flex-col items-center justify-center gap-4">
                <ButtonUltility
                  isMounted={isMounted}
                  isResetConfirmationOpen={isResetConfirmationOpen}
                  resetEverything={resetEverything}
                  search={search}
                  setIsResetConfirmationOpen={setIsResetConfirmationOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              </div>
            </div>
            <SidebarSeparator />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="flex w-full cursor-pointer items-center justify-start gap-2"
                  variant="secondary"
                >
                  <Settings />
                  Cache settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-[100005]">
                <Accordion
                  className="w-full"
                  collapsible
                  defaultValue="item-1"
                  type="single"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Product Information</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p>
                        Our flagship product combines cutting-edge technology
                        with sleek design. Built with premium materials, it
                        offers unparalleled performance and reliability.
                      </p>
                      <p>
                        Key features include advanced processing capabilities,
                        and an intuitive user interface designed for both
                        beginners and experts.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Shipping Details</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p>
                        We offer worldwide shipping through trusted courier
                        partners. Standard delivery takes 3-5 business days,
                        while express shipping ensures delivery within 1-2
                        business days.
                      </p>
                      <p>
                        All orders are carefully packaged and fully insured.
                        Track your shipment in real-time through our dedicated
                        tracking portal.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Return Policy</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <p>
                        We stand behind our products with a comprehensive 30-day
                        return policy. If you&apos;re not completely satisfied,
                        simply return the item in its original condition.
                      </p>
                      <p>
                        Our hassle-free return process includes free return
                        shipping and full refunds processed within 48 hours of
                        receiving the returned item.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </PopoverContent>
            </Popover>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="!relative flex flex-col items-center justify-start gap-6 p-4 pl-2 md:items-start">
          <div className="absolute left-2">
            <Button
              className="fixed flex cursor-pointer items-center gap-2 border"
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
              variant="outline"
            >
              Filters
              <SlidersHorizontal />
            </Button>
          </div>
          <div className="absolute left-0 flex w-full items-start justify-center">
            <div className="fixed bottom-1">
              <Dock
                baseItemSize={30}
                items={[
                  {
                    icon: <LayoutDashboard className="!text-white" size={18} />,
                    label: 'App',
                    onClick: () => {
                      return;
                    },
                  },
                  {
                    icon: <FileClock className="!text-white" size={18} />,
                    label: 'Recently viewed',
                    onClick: () => {
                      return;
                    },
                  },
                  {
                    icon: <Bookmark className="!text-white" size={18} />,
                    label: 'Bookmark',
                    onClick: () => {
                      return;
                    },
                  },
                ]}
                magnification={50}
                panelHeight={30}
              />
            </div>
          </div>

          <h1 className="w-full text-center font-bold text-2xl ">
            Topical questions
          </h1>
          <Image
            alt="default subject"
            className="self-center rounded-md"
            height={350}
            src="/assets/funny2.png"
            width={350}
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default TopicalPage;
