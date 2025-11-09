"use client";

import { ValidCurriculum } from "@/constants/types";
import {
  INFINITE_SCROLL_CHUNK_SIZE,
  COLUMN_BREAKPOINTS,
  MANSONRY_GUTTER_BREAKPOINTS,
  DEFAULT_SORT_OPTIONS,
} from "@/features/topical/constants/constants";
import {
  SelectedFinishedQuestion,
  SelectedQuestion,
  SortParameters,
  QuestionInspectOpenState,
  SavedActivitiesResponse,
  SubjectMetadata,
} from "@/features/topical/constants/types";
import {
  computeFinishedQuestionsMetadata,
  computeSubjectMetadata,
  filterQuestionsByCriteria,
  chunkQuestionsData,
} from "@/features/topical/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionInspect from "@/features/topical/components/QuestionInspect";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import NavigateToTopicalApp from "@/features/topical/components/NavigateToTopicalApp";
import SecondaryAppSidebar from "@/features/topical/components/SecondaryAppSidebar";
import Image from "next/image";
import {
  CURRICULUM_COVER_IMAGE,
  SUBJECT_COVER_IMAGE,
} from "@/constants/constants";
import SecondaryAppUltilityBar from "@/features/topical/components/SecondaryAppUltilityBar";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";

const FinishedQuestionsClient = ({
  BETTER_AUTH_URL,
}: {
  BETTER_AUTH_URL: string;
}) => {
  const queryClient = useQueryClient();
  const {
    data: userSession,
    isError: isUserSessionError,
    isPending: isUserSessionPending,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await authClient.getSession(),
    enabled: !queryClient.getQueryData(["user"]),
  });
  const [isQuestionInspectOpen, setIsQuestionInspectOpen] =
    useState<QuestionInspectOpenState>({
      isOpen: false,
      questionId: "",
    });

  const isValidSession = !!userSession?.data?.session;

  const {
    data: userSavedActivities,
    isFetching: isUserSavedActivitiesFetching,
    isError: isUserSavedActivitiesError,
  } = useQuery({
    queryKey: ["user_saved_activities"],
    queryFn: async () => {
      const response = await fetch("/api/topical/saved-activities", {
        method: "GET",
      });
      const data: SavedActivitiesResponse = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }

      return data;
    },
    enabled:
      isValidSession &&
      !isUserSessionError &&
      !queryClient.getQueryData(["user_saved_activities"]),
  });

  const userFinishedQuestions = useMemo(() => {
    return userSavedActivities?.finishedQuestions;
  }, [userSavedActivities]);
  const bookmarks = useMemo(() => {
    return userSavedActivities?.bookmarks;
  }, [userSavedActivities]);
  const metadata = useMemo(() => {
    if (!userFinishedQuestions) return null;
    return computeFinishedQuestionsMetadata(userFinishedQuestions);
  }, [userFinishedQuestions]);

  const isSavedActivitiesFetching = isUserSavedActivitiesFetching;
  const isSavedActivitiesError = isUserSavedActivitiesError;

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
  }, [selectedCurriculumn, selectedSubject, userFinishedQuestions]);
  const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
  const [fullPartitionedData, setFullPartitionedData] = useState<
    SelectedQuestion[][] | undefined
  >(undefined);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [displayedData, setDisplayedData] = useState<SelectedQuestion[]>([]);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: DEFAULT_SORT_OPTIONS,
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { uiPreferences } = useTopicalApp();

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [currentFilter]);

  const topicalData = useMemo(() => {
    return filterQuestionsByCriteria(
      userFinishedQuestions,
      currentFilter,
      selectedCurriculumn,
      selectedSubject
    );
  }, [
    currentFilter,
    selectedCurriculumn,
    selectedSubject,
    userFinishedQuestions,
  ]);

  useEffect(() => {
    if (topicalData) {
      const chunkSize =
        uiPreferences.layoutStyle === "pagination"
          ? uiPreferences.numberOfQuestionsPerPage
          : INFINITE_SCROLL_CHUNK_SIZE;
      const sortedData: SelectedFinishedQuestion[] = topicalData.toSorted(
        (a: SelectedFinishedQuestion, b: SelectedFinishedQuestion) => {
          const aIndex = new Date(a.updatedAt).getTime();
          const bIndex = new Date(b.updatedAt).getTime();
          return sortParameters.sortBy === "descending"
            ? bIndex - aIndex
            : aIndex - bIndex;
        }
      );
      const chunkedData = chunkQuestionsData(
        sortedData,
        chunkSize,
        (item) => item.question
      );

      setFullPartitionedData(chunkedData);
      setDisplayedData(chunkedData[0]);
      setCurrentChunkIndex(0);
      scrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [
    topicalData,
    uiPreferences.numberOfColumns,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
    sortParameters.sortBy,
  ]);

  const isQuestionViewDisabled = useMemo(() => {
    return (
      !selectedCurriculumn ||
      !selectedSubject ||
      !currentFilter ||
      !fullPartitionedData ||
      !displayedData ||
      displayedData.length === 0
    );
  }, [
    selectedCurriculumn,
    selectedSubject,
    currentFilter,
    fullPartitionedData,
    displayedData,
  ]);

  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div className="pt-16 relative z-[10] flex flex-col w-full items-center justify-start p-4 overflow-hidde h-screen">
        <div
          className="flex flex-row items-center justify-between w-full sm:w-[95%] mb-4 flex-wrap gap-2"
          ref={sideBarInsetRef}
        >
          <Breadcrumb className="self-end mr-0 sm:mr-6 max-w-full w-max">
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

          <SecondaryAppUltilityBar
            setIsSidebarOpen={setIsSidebarOpen}
            isQuestionViewDisabled={isQuestionViewDisabled}
            sideBarInsetRef={sideBarInsetRef}
            fullPartitionedData={fullPartitionedData}
            currentChunkIndex={currentChunkIndex}
            setCurrentChunkIndex={setCurrentChunkIndex}
            setDisplayedData={setDisplayedData}
            scrollAreaRef={scrollAreaRef}
            sortParameters={sortParameters}
            setSortParameters={setSortParameters}
            setIsQuestionInspectOpen={setIsQuestionInspectOpen}
            isSidebarOpen={isSidebarOpen}
          />
        </div>

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
                <p className="text-sm text-muted-foreground">
                  No curriculums found. Search for questions and add them to
                  your finished questions!
                </p>
                <NavigateToTopicalApp>
                  Search for questions{" "}
                </NavigateToTopicalApp>
              </div>
            )}
          </div>
        )}

        {(isSavedActivitiesFetching || isUserSessionPending) && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {!isUserSessionPending && !userSession?.data?.session && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <p className="text-sm text-red-500">
              You are not signed in. Please sign to view your finished
              questions!
            </p>
          </div>
        )}

        <ScrollToTopButton
          isScrollingAndShouldShowScrollButton={
            isScrollingAndShouldShowScrollButton && displayedData.length > 0
          }
          scrollAreaRef={scrollAreaRef}
        />
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
                <p className="text-sm text-muted-foreground">
                  No subjects found. Search for questions and add them to your
                  finished questions!
                </p>
                <NavigateToTopicalApp>
                  Search for questions{" "}
                </NavigateToTopicalApp>
              </div>
            )}
          </div>
        )}

        {metadata && selectedCurriculumn && selectedSubject && (
          <>
            {displayedData?.length > 0 ? (
              <ScrollArea
                viewportRef={scrollAreaRef}
                className=" h-[70dvh] lg:h-[78dvh] px-4 w-full [&_.bg-border]:bg-logo-main overflow-auto"
                type="always"
                viewPortOnScrollEnd={() => {
                  if (scrollAreaRef.current?.scrollTop === 0) {
                    setIsScrollingAndShouldShowScrollButton(false);
                  } else {
                    setIsScrollingAndShouldShowScrollButton(true);
                  }
                }}
              >
                <p> {topicalData.length} items</p>
                <ResponsiveMasonry
                  columnsCountBreakPoints={
                    COLUMN_BREAKPOINTS[
                      uiPreferences.numberOfColumns as keyof typeof COLUMN_BREAKPOINTS
                    ]
                  }
                  // @ts-expect-error - gutterBreakPoints is not typed by the library
                  gutterBreakPoints={MANSONRY_GUTTER_BREAKPOINTS}
                >
                  <Masonry>
                    {displayedData.map((question) =>
                      question?.questionImages.map((imageSrc: string) => (
                        <QuestionPreview
                          bookmarks={bookmarks ?? []}
                          question={question}
                          onQuestionClick={() => {
                            setIsQuestionInspectOpen({
                              isOpen: true,
                              questionId: question.id,
                            });
                          }}
                          isUserSessionPending={isUserSessionPending}
                          userFinishedQuestions={userFinishedQuestions ?? []}
                          isSavedActivitiesError={isSavedActivitiesError}
                          isValidSession={isValidSession}
                          key={`${question.id}-${imageSrc}`}
                          isSavedActivitiesFetching={isSavedActivitiesFetching}
                          imageSrc={imageSrc}
                        />
                      ))
                    )}
                  </Masonry>
                </ResponsiveMasonry>

                {uiPreferences.layoutStyle === "infinite" && (
                  <InfiniteScroll
                    next={() => {
                      if (fullPartitionedData) {
                        setCurrentChunkIndex(currentChunkIndex + 1);
                        setDisplayedData([
                          ...displayedData,
                          ...(fullPartitionedData[currentChunkIndex + 1] ?? []),
                        ]);
                      }
                    }}
                    hasMore={
                      !!fullPartitionedData &&
                      currentChunkIndex < fullPartitionedData.length - 1
                    }
                    isLoading={!fullPartitionedData}
                  />
                )}
              </ScrollArea>
            ) : (
              <div className="flex flex-col gap-4 items-center justify-center w-full">
                <p className="text-sm text-muted-foreground">
                  No questions found. Search for questions and add them to your
                  finished questions!
                </p>
                <NavigateToTopicalApp>
                  Search for questions{" "}
                </NavigateToTopicalApp>
              </div>
            )}
          </>
        )}
      </div>
      <SecondaryAppSidebar
        subjectMetadata={subjectMetadata}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        selectedCurriculumn={selectedCurriculumn}
        selectedSubject={selectedSubject}
      />
      {Array.isArray(userFinishedQuestions) &&
        userFinishedQuestions.length > 0 && (
          <QuestionInspect
            sortParameters={sortParameters}
            setSortParameters={setSortParameters}
            isOpen={isQuestionInspectOpen}
            setIsOpen={setIsQuestionInspectOpen}
            partitionedTopicalData={fullPartitionedData}
            bookmarks={bookmarks ?? []}
            BETTER_AUTH_URL={BETTER_AUTH_URL}
            isValidSession={isValidSession}
            isSavedActivitiesFetching={isSavedActivitiesFetching}
            isUserSessionPending={isUserSessionPending}
            isSavedActivitiesError={isSavedActivitiesError}
            isInspectSidebarOpen={isInspectSidebarOpen}
            setIsInspectSidebarOpen={setIsInspectSidebarOpen}
            userFinishedQuestions={userFinishedQuestions ?? []}
          />
        )}
    </>
  );
};

export default FinishedQuestionsClient;
