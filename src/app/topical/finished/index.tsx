"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CURRICULUM_COVER_IMAGE, SUBJECT_COVER_IMAGE } from "@/constants/constants";
import { ValidCurriculum } from "@/constants/types";
import { useAuth } from "@/context/AuthContext";
import NavigateToTopicalApp from "@/features/topical/components/NavigateToTopicalApp";
import SecondaryAppSidebar from "@/features/topical/components/SecondaryAppSidebar";
import SecondaryAppUltilityBar from "@/features/topical/components/SecondaryAppUltilityBar";
import SecondaryMainContent from "@/features/topical/components/SecondaryMainContent";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import {
  computeFinishedQuestionsMetadata,
  computeSubjectMetadata,
  filterQuestionsByCriteria,
} from "@/features/topical/lib/utils";
import { BreadcrumbContentProps, QuestionInspectRef } from "@/features/topical/types/components";
import { SubjectMetadata } from "@/features/topical/types/models";
import { useMutationState } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

const FinishedQuestionsClient = ({ BETTER_AUTH_URL }: { BETTER_AUTH_URL: string }) => {
  const { isSessionPending, isAuthenticated } = useAuth();
  const settledFinishedQuestionMutations = useMutationState({
    filters: {
      mutationKey: ["user_saved_activities", "finished_questions"],
      predicate: (mutation) =>
        mutation.state.status === "success" || mutation.state.status === "error",
    },
  });

  const { finishedQuestionsData: userFinishedQuestions, savedActivitiesIsFetching } =
    useTopicalApp();
  const metadata = useMemo(() => {
    if (!userFinishedQuestions) {
      return null;
    }
    return computeFinishedQuestionsMetadata(userFinishedQuestions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFinishedQuestions, settledFinishedQuestionMutations]);
  const questionInspectRef = useRef<QuestionInspectRef | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCurriculumn, setSelectedCurriculum] = useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<SubjectMetadata | null>(null);
  const subjectMetadata = useMemo(() => {
    return computeSubjectMetadata(
      userFinishedQuestions || [],
      selectedCurriculumn,
      selectedSubject,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userFinishedQuestions,
    selectedCurriculumn,
    selectedSubject,
    settledFinishedQuestionMutations,
  ]);

  const topicalData = useMemo(() => {
    return filterQuestionsByCriteria(
      userFinishedQuestions,
      currentFilter,
      selectedCurriculumn,
      selectedSubject,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userFinishedQuestions,
    settledFinishedQuestionMutations,
    currentFilter,
    selectedCurriculumn,
    selectedSubject,
  ]);

  const isQuestionViewDisabled = useMemo(() => {
    return (
      !selectedCurriculumn ||
      !selectedSubject ||
      !currentFilter ||
      !topicalData ||
      topicalData.length === 0
    );
  }, [selectedCurriculumn, selectedSubject, currentFilter, topicalData]);

  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);

  // Before breadcrumb content
  const preContent = (
    <>
      {(savedActivitiesIsFetching || isSessionPending) && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {!isAuthenticated && !isSessionPending && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <p className="text-center text-sm text-red-500">
            You are not signed in. Please sign to view your finished questions!
          </p>
        </div>
      )}
    </>
  );

  // Breadcrumb content
  const breadcrumbContent = ({
    sortParameters,
    setSortParameters,
    fullPartitionedData,
    currentChunkIndex,
    setCurrentChunkIndex,
    isExportModeEnabled,
    scrollAreaRef,
  }: BreadcrumbContentProps) => (
    <div
      className="mb-2 flex w-full flex-row flex-wrap items-center justify-between gap-2 sm:w-[95%]"
      ref={sideBarInsetRef}
    >
      <div>
        {" "}
        <Breadcrumb className="mr-0 flex w-max max-w-full sm:mr-6">
          <BreadcrumbList>
            <BreadcrumbItem
              className="cursor-pointer"
              onClick={() => {
                setSelectedCurriculum(null);
                setSelecteSubject(null);
              }}
            >
              Curriculum
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {selectedCurriculumn && (
              <>
                <BreadcrumbItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSelecteSubject(null);
                  }}
                >
                  Subject
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {selectedSubject && (
              <BreadcrumbItem className="cursor-pointer">
                {selectedCurriculumn + " " + selectedSubject}
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <SecondaryAppUltilityBar
        isFilteredDisabled={!selectedSubject}
        setIsSidebarOpen={setIsSidebarOpen}
        isQuestionViewDisabled={isQuestionViewDisabled}
        sideBarInsetRef={sideBarInsetRef}
        isSidebarOpen={isSidebarOpen}
        sortParameters={sortParameters}
        setIsQuestionInspectOpen={questionInspectRef.current?.setIsInspectOpen}
        setSortParameters={setSortParameters}
        fullPartitionedData={fullPartitionedData}
        currentChunkIndex={currentChunkIndex}
        isExportModeEnabled={isExportModeEnabled}
        setCurrentChunkIndex={setCurrentChunkIndex}
        scrollAreaRef={scrollAreaRef}
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {metadata && !selectedCurriculumn && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">Choose your curriculumn</h1>
          {Object.keys(metadata || {}).length > 0 ? (
            <div className="flex w-full flex-row flex-wrap items-center justify-center gap-5">
              {Object.keys(metadata || {}).map((curriculum) => (
                <div
                  key={curriculum}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setSelectedCurriculum(curriculum as ValidCurriculum);
                  }}
                  title={curriculum}
                >
                  <Image
                    width={182}
                    height={80}
                    loading="lazy"
                    className="border-foreground h-20! rounded-sm border bg-white object-cover p-2"
                    alt="Curriculum cover image"
                    src={CURRICULUM_COVER_IMAGE[curriculum as keyof typeof CURRICULUM_COVER_IMAGE]}
                  />
                  <p>{curriculum}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground text-center text-sm">
                No curriculums found. Search for questions and add them to your finished questions!
              </p>
              <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
            </div>
          )}
        </div>
      )}

      {metadata && selectedCurriculumn && !selectedSubject && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">Choose your subject</h1>
          {Object.keys(metadata).length > 0 ? (
            <ScrollArea className="[&_.bg-border]:bg-logo-main h-[60dvh] w-full px-4" type="always">
              <div className="flex w-full flex-row flex-wrap items-start justify-center gap-8">
                {metadata?.[selectedCurriculumn]?.subjects?.map((subject) => (
                  <div
                    key={subject}
                    className="flex w-[150px] cursor-pointer flex-col items-center justify-center gap-1"
                    onClick={() => {
                      setSelecteSubject(subject);
                    }}
                  >
                    <Image
                      width={150}
                      height={200}
                      loading="lazy"
                      title={subject}
                      className="h-[200px]! w-40 rounded-[3px] object-cover"
                      alt="Curriculum cover image"
                      src={
                        SUBJECT_COVER_IMAGE[
                          selectedCurriculumn as keyof typeof SUBJECT_COVER_IMAGE
                        ][subject]
                      }
                    />
                    <p className="text-muted-foreground px-1 text-center text-sm">{subject}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground text-center text-sm">
                No subjects found. Search for questions and add them to your finished questions!
              </p>
              <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
            </div>
          )}
        </div>
      )}

      {selectedSubject && topicalData && topicalData.length === 0 && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-center text-sm">
            No questions found. Search for questions and add them to your finished questions! Or
            change your filters.
          </p>
          <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
        </div>
      )}
    </>
  );

  return (
    <>
      <SecondaryMainContent
        topicalData={topicalData}
        isQuestionViewDisabled={isQuestionViewDisabled}
        BETTER_AUTH_URL={BETTER_AUTH_URL}
        preContent={preContent}
        questionInspectRef={questionInspectRef}
        breadcrumbContent={breadcrumbContent}
        mainContent={mainContent}
      />
      <SecondaryAppSidebar
        subjectMetadata={subjectMetadata}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        selectedCurriculumn={selectedCurriculumn}
        selectedSubject={selectedSubject}
      />
    </>
  );
};

export default FinishedQuestionsClient;
