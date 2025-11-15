"use client";

import { ValidCurriculum } from "@/constants/types";
import {
  QuestionInspectRef,
  SubjectMetadata,
  BreadcrumbContentProps,
} from "@/features/topical/constants/types";
import {
  computeFinishedQuestionsMetadata,
  computeSubjectMetadata,
  filterQuestionsByCriteria,
} from "@/features/topical/lib/utils";
import { useMutationState } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loader2 } from "lucide-react";
import NavigateToTopicalApp from "@/features/topical/components/NavigateToTopicalApp";
import SecondaryAppSidebar from "@/features/topical/components/SecondaryAppSidebar";
import SecondaryMainContent from "@/features/topical/components/SecondaryMainContent";
import Image from "next/image";
import {
  CURRICULUM_COVER_IMAGE,
  SUBJECT_COVER_IMAGE,
} from "@/constants/constants";
import SecondaryAppUltilityBar from "@/features/topical/components/SecondaryAppUltilityBar";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";

const FinishedQuestionsClient = ({
  BETTER_AUTH_URL,
}: {
  BETTER_AUTH_URL: string;
}) => {
  const { isSessionPending, isAuthenticated } = useAuth();
  const settledFinishedQuestionMutations = useMutationState({
    filters: {
      mutationKey: ["user_saved_activities", "finished_questions"],
      predicate: (mutation) =>
        mutation.state.status === "success" ||
        mutation.state.status === "error",
    },
  });

  const {
    finishedQuestionsData: userFinishedQuestions,
    savedActivitiesIsFetching,
  } = useTopicalApp();
  const metadata = useMemo(() => {
    if (!userFinishedQuestions) {
      return null;
    }
    return computeFinishedQuestionsMetadata(userFinishedQuestions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFinishedQuestions, settledFinishedQuestionMutations]);
  const questionInspectRef = useRef<QuestionInspectRef | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCurriculumn, setSelectedCurriculum] =
    useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<SubjectMetadata | null>(
    null
  );
  const subjectMetadata = useMemo(() => {
    return computeSubjectMetadata(
      userFinishedQuestions || [],
      selectedCurriculumn,
      selectedSubject
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
      selectedSubject
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
        <div className="flex flex-col gap-4 items-center justify-center w-full ">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {!isAuthenticated && !isSessionPending && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <p className="text-sm text-red-500 text-center">
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
    setDisplayedData,
    scrollAreaRef,
  }: BreadcrumbContentProps) => (
    <div
      className="flex flex-row items-center justify-between w-full sm:w-[95%] mb-2 flex-wrap gap-2"
      ref={sideBarInsetRef}
    >
      <div>
        {" "}
        <Breadcrumb className="flex mr-0 sm:mr-6 max-w-full w-max">
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
        setIsSidebarOpen={setIsSidebarOpen}
        isQuestionViewDisabled={isQuestionViewDisabled}
        sideBarInsetRef={sideBarInsetRef}
        isSidebarOpen={isSidebarOpen}
        sortParameters={sortParameters}
        setIsQuestionInspectOpen={questionInspectRef.current?.setIsInspectOpen}
        setSortParameters={setSortParameters}
        fullPartitionedData={fullPartitionedData}
        currentChunkIndex={currentChunkIndex}
        setCurrentChunkIndex={setCurrentChunkIndex}
        setDisplayedData={setDisplayedData}
        scrollAreaRef={scrollAreaRef}
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {metadata && !selectedCurriculumn && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 className="font-semibold text-2xl">Choose your curriculumn</h1>
          {Object.keys(metadata || {}).length > 0 ? (
            <div className="flex flex-row flex-wrap gap-5 items-center justify-center w-full  ">
              {Object.keys(metadata || {}).map((curriculum) => (
                <div
                  key={curriculum}
                  className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                  onClick={() => {
                    setSelectedCurriculum(curriculum as ValidCurriculum);
                  }}
                  title={curriculum}
                >
                  <Image
                    width={182}
                    height={80}
                    loading="lazy"
                    className="!h-20 object-cover border border-foreground p-2 rounded-sm bg-white "
                    alt="Curriculum cover image"
                    src={
                      CURRICULUM_COVER_IMAGE[
                        curriculum as keyof typeof CURRICULUM_COVER_IMAGE
                      ]
                    }
                  />
                  <p>{curriculum}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center w-full">
              <p className="text-sm text-muted-foreground text-center">
                No curriculums found. Search for questions and add them to your
                finished questions!
              </p>
              <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
            </div>
          )}
        </div>
      )}

      {metadata && selectedCurriculumn && !selectedSubject && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 className="font-semibold text-2xl">Choose your subject</h1>
          {Object.keys(metadata).length > 0 ? (
            <ScrollArea
              className="h-[60dvh] px-4 w-full [&_.bg-border]:bg-logo-main "
              type="always"
            >
              <div className="flex flex-row flex-wrap gap-8 items-start justify-center w-full  ">
                {metadata?.[selectedCurriculumn]?.subjects?.map((subject) => (
                  <div
                    key={subject}
                    className="flex flex-col items-center justify-center gap-1 cursor-pointer w-[150px]"
                    onClick={() => {
                      setSelecteSubject(subject);
                    }}
                  >
                    <Image
                      width={150}
                      height={200}
                      loading="lazy"
                      title={subject}
                      className="!h-[200px] w-40 object-cover rounded-[1px] "
                      alt="Curriculum cover image"
                      src={
                        SUBJECT_COVER_IMAGE[
                          selectedCurriculumn as keyof typeof SUBJECT_COVER_IMAGE
                        ][subject]
                      }
                    />
                    <p className="text-sm text-muted-foreground text-center px-1">
                      {subject}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center w-full">
              <p className="text-sm text-muted-foreground text-center">
                No subjects found. Search for questions and add them to your
                finished questions!
              </p>
              <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
            </div>
          )}
        </div>
      )}

      {selectedSubject && topicalData && topicalData.length === 0 && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <p className="text-sm text-muted-foreground text-center">
            No questions found. Search for questions and add them to your
            finished questions!
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
