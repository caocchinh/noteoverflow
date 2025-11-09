"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionInspect from "@/features/topical/components/QuestionInspect";
import {
  COLUMN_BREAKPOINTS,
  MANSONRY_GUTTER_BREAKPOINTS,
  DEFAULT_SORT_OPTIONS,
  INFINITE_SCROLL_CHUNK_SIZE,
} from "@/features/topical/constants/constants";
import {
  SelectedQuestion,
  SelectedPublickBookmark,
  SortParameters,
  QuestionInspectOpenState,
  SavedActivitiesResponse,
  SubjectMetadata,
} from "@/features/topical/constants/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  computeSubjectMetadata,
  filterQuestionsByCriteria,
  chunkQuestionsData,
  computeCurriculumSubjectMapping,
} from "@/features/topical/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { authClient } from "@/lib/auth/auth-client";
import { ValidCurriculum } from "@/constants/types";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
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

export const BookmarkView = ({
  data,
  BETTER_AUTH_URL,
  listId,
  ownerInfo,
}: {
  data: SelectedPublickBookmark[];
  BETTER_AUTH_URL: string;
  listId: string;
  ownerInfo: {
    ownerName: string;
    ownerId: string;
    listName: string;
    ownerAvatar: string;
  };
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
  const isValidSession = !!userSession?.data?.session;
  const [isQuestionInspectOpen, setIsQuestionInspectOpen] =
    useState<QuestionInspectOpenState>({
      isOpen: false,
      questionId: "",
    });

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
  const isSavedActivitiesFetching = isUserSavedActivitiesFetching;
  const isSavedActivitiesError = isUserSavedActivitiesError;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const metadata = useMemo(() => {
    return data ? computeCurriculumSubjectMapping(data) : {};
  }, [data]);
  const [selectedCurriculumn, setSelectedCurriculum] =
    useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);

  const subjectMetadata = useMemo(() => {
    return computeSubjectMetadata(
      data || [],
      selectedCurriculumn,
      selectedSubject
    );
  }, [data, selectedCurriculumn, selectedSubject]);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<SubjectMetadata | null>(
    null
  );
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

  const topicalData = useMemo(() => {
    return filterQuestionsByCriteria(
      data,
      currentFilter,
      selectedCurriculumn,
      selectedSubject
    );
  }, [currentFilter, data, selectedCurriculumn, selectedSubject]);

  useEffect(() => {
    if (topicalData) {
      const chunkSize =
        uiPreferences.layoutStyle === "pagination"
          ? uiPreferences.numberOfQuestionsPerPage
          : INFINITE_SCROLL_CHUNK_SIZE;
      const sortedData: SelectedPublickBookmark[] = topicalData.toSorted(
        (a: SelectedPublickBookmark, b: SelectedPublickBookmark) => {
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
    sortParameters?.sortBy,
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
        <div className="flex flex-row items-center justify-start w-full gap-1 mb-1">
          <Image
            src={ownerInfo.ownerAvatar}
            alt="owner avatar"
            width={25}
            height={25}
            loading="lazy"
            className="rounded-full"
          />
          <p className="text-sm text-logo-main">
            {ownerInfo.ownerName}&apos;s list - {ownerInfo.listName}
          </p>
        </div>
        {metadata &&
          !selectedCurriculumn &&
          Object.keys(metadata).length > 0 && (
            <div className="flex flex-col gap-4 items-center justify-center w-full">
              <h1 className="font-semibold text-2xl">
                Choose your curriculumn
              </h1>
              <div className="flex flex-row flex-wrap gap-5 items-center justify-center w-full  ">
                {Object.keys(metadata).map((curriculum) => (
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
            </div>
          )}

        {Object.keys(metadata).length === 0 && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <p className="text-sm text-muted-foreground">
              Nothing found in this bookmark list!
            </p>
            <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
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
            <ScrollArea
              className="h-[60dvh] px-4 w-full [&_.bg-border]:bg-logo-main "
              type="always"
            >
              <div className="flex flex-row flex-wrap gap-8 items-start justify-center w-full  ">
                {metadata[selectedCurriculumn]?.map((subject) => (
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
          </div>
        )}

        {displayedData?.length > 0 && (
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
                {displayedData?.map((question) =>
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
                      listId={
                        ownerInfo.ownerId === userSession?.data?.user?.id
                          ? listId
                          : undefined
                      }
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
      {Array.isArray(data) && data.length > 0 && (
        <QuestionInspect
          sortParameters={sortParameters}
          setSortParameters={setSortParameters}
          BETTER_AUTH_URL={BETTER_AUTH_URL}
          isOpen={isQuestionInspectOpen}
          setIsOpen={setIsQuestionInspectOpen}
          partitionedTopicalData={fullPartitionedData}
          bookmarks={bookmarks ?? []}
          isValidSession={isValidSession}
          isSavedActivitiesFetching={isSavedActivitiesFetching}
          isUserSessionPending={isUserSessionPending}
          isSavedActivitiesError={isSavedActivitiesError}
          isInspectSidebarOpen={isInspectSidebarOpen}
          setIsInspectSidebarOpen={setIsInspectSidebarOpen}
          userFinishedQuestions={userFinishedQuestions ?? []}
          listId={
            ownerInfo.ownerId === userSession?.data?.user?.id
              ? listId
              : undefined
          }
        />
      )}
    </>
  );
};
