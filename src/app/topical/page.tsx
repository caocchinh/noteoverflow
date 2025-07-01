"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOPICAL_DATA } from "@/features/topical/constants/constants";
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
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";

const ButtonUltility = ({
  isResetConfirmationOpen,
  setIsResetConfirmationOpen,
  resetEverything,
  setIsSidebarOpen,
  search,
}: {
  isResetConfirmationOpen: boolean;
  setIsResetConfirmationOpen: (value: boolean) => void;
  resetEverything: () => void;
  setIsSidebarOpen: (value: boolean) => void;
  search: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <>
      <Button
        className="cursor-pointer w-full bg-logo-main text-white hover:bg-logo-main/90"
        onClick={search}
      >
        Search
        <ScanText />
      </Button>
      <Dialog
        open={isResetConfirmationOpen}
        onOpenChange={setIsResetConfirmationOpen}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer w-full">
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
        variant={theme === "dark" ? "destructive" : "default"}
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

  const search = () => {
    console.log(
      selectedCurriculum,
      selectedSubject,
      selectedTopic,
      selectedYear,
      selectedPaperType,
      selectedSeason
    );
  };

  useEffect(() => {
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
  }, [selectedCurriculum]);

  useEffect(() => {
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
  }, [selectedSubject]);

  return (
    <div className="pt-16">
      <SidebarProvider
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        openMobile={isSidebarOpen}
        onOpenChangeMobile={setIsSidebarOpen}
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
                        height={100}
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
                  <EnhancedSelect
                    label="Subject"
                    prerequisite={!selectedCurriculum ? "Curriculum" : ""}
                    data={availableSubjects}
                    selectedValue={selectedSubject}
                    setSelectedValue={setSelectedSubject}
                  />
                </div>
              </div>
            </div>
            <div className="flex-col flex items-center justify-center gap-4">
              <EnhancedMultiSelect
                label="Topic"
                values={selectedTopic}
                onValuesChange={(values) =>
                  setSelectedTopic(values as string[])
                }
                prerequisite="Subject"
                data={availableTopics}
              />
              <EnhancedMultiSelect
                label="Paper"
                values={selectedPaperType}
                onValuesChange={(values) =>
                  setSelectedPaperType(values as string[])
                }
                prerequisite="Subject"
                data={availablePaperTypes?.map((item) => item.toString())}
              />
              <EnhancedMultiSelect
                label="Year"
                values={selectedYear}
                onValuesChange={(values) => setSelectedYear(values as string[])}
                prerequisite="Subject"
                data={availableYears?.map((item) => item.toString())}
              />

              <EnhancedMultiSelect
                label="Season"
                values={selectedSeason}
                onValuesChange={(values) =>
                  setSelectedSeason(values as string[])
                }
                prerequisite="Subject"
                data={availableSeasons}
              />
            </div>
            <div className="flex w-[300px] justify-center items-center flex-col gap-4">
              <ButtonUltility
                isResetConfirmationOpen={isResetConfirmationOpen}
                setIsResetConfirmationOpen={setIsResetConfirmationOpen}
                resetEverything={resetEverything}
                setIsSidebarOpen={setIsSidebarOpen}
                search={search}
              />
            </div>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="relative p-4  pl-2 gap-6 flex items-center md:items-start justify-start flex-col">
          <div className="absolute">
            <SidebarTrigger className="flex fixed top-[73px] items-center gap-2 border cursor-pointer">
              Filters
              <SlidersHorizontal />
            </SidebarTrigger>
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
