"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOPICAL_DATA } from "@/features/topical/constants/constants";
import { ValidCurriculum } from "@/constants/types";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import EnhancedMultiSelect from "@/features/topical/components/EnhancedMultiSelect";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BrushCleaning, ScanText } from "lucide-react";
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

const TopicalPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    ValidCurriculum | ""
  >("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

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
  // const [cachedData, setCachedData] = useReducer(
  //   (state: any, action: any) => {
  //     return { ...state, ...action };
  //   },
  //   {
  //     curriculum: "",
  //   }
  // );

  const resetEverything = () => {
    setSelectedCurriculum("");
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
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
    <div className="pt-19 min-h-[169vh] p-6">
      <h1 className="text-3xl font-bold text-center md:text-left">
        Topical Questions
      </h1>
      <div className="mt-6 gap-6 flex items-center md:items-start justify-center flex-col md:flex-row">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <AnimatePresence mode="wait">
              {selectedSubject && (
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
                    className="self-center"
                    width={100}
                    height={100}
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
                prerequisite="Curriculum"
                data={availableSubjects}
                selectedValue={selectedSubject}
                setSelectedValue={setSelectedSubject}
              />
            </div>
          </div>

          <Dialog
            open={isResetConfirmationOpen}
            onOpenChange={setIsResetConfirmationOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                Clear
                <BrushCleaning />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Clear all</DialogTitle>
                <DialogDescription>
                  This will clear all the selected options and reset the form.
                  Are you sure you want to clear?
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
          <Button className="cursor-pointer">
            Search
            <ScanText />
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedMultiSelect
            label="Topic"
            values={selectedTopic}
            onValuesChange={(values) => setSelectedTopic(values as string[])}
            loop={true}
            prerequisite="Subject"
            data={availableTopics}
          />
          <EnhancedMultiSelect
            label="Year"
            values={selectedYear}
            onValuesChange={(values) => setSelectedYear(values as string[])}
            loop={true}
            prerequisite="Subject"
            data={availableYears}
          />
          <EnhancedMultiSelect
            label="Paper"
            values={selectedPaperType}
            onValuesChange={(values) =>
              setSelectedPaperType(values as string[])
            }
            loop={true}
            dropDownHeight="h-[190px]"
            prerequisite="Subject"
            data={availablePaperTypes}
          />
          <EnhancedMultiSelect
            label="Season"
            values={selectedSeason}
            onValuesChange={(values) => setSelectedSeason(values as string[])}
            loop={true}
            dropDownHeight="h-[190px]"
            prerequisite="Subject"
            data={availableSeasons}
          />
        </div>
      </div>
    </div>
  );
};

export default TopicalPage;
