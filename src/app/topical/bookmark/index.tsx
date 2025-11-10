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
  SubjectMetadata,
} from "@/features/topical/constants/types";
import {
  computeBookmarksMetadata,
  truncateListName,
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
import { Globe, Lock, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionInspect from "@/features/topical/components/QuestionInspect";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import { ListFolder } from "@/features/topical/components/ListFolder";
import NavigateToTopicalApp from "@/features/topical/components/NavigateToTopicalApp";
import Image from "next/image";
import {
  CURRICULUM_COVER_IMAGE,
  SUBJECT_COVER_IMAGE,
} from "@/constants/constants";
import SecondaryAppSidebar from "@/features/topical/components/SecondaryAppSidebar";
import SecondaryAppUltilityBar from "@/features/topical/components/SecondaryAppUltilityBar";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";

const BookmarkClient = ({ BETTER_AUTH_URL }: { BETTER_AUTH_URL: string }) => {
  const queryClient = useQueryClient();
  const { data: userSession, isPending: isUserSessionPending } = useQuery({
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

  const { savedActivitiesData, savedActivitiesIsFetching, uiPreferences } =
    useTopicalApp();

  const userFinishedQuestions = useMemo(() => {
    return savedActivitiesData?.finishedQuestions;
  }, [savedActivitiesData?.finishedQuestions]);
  const bookmarks = useMemo(() => {
    return savedActivitiesData?.bookmarks;
  }, [savedActivitiesData?.bookmarks]);
  const metadata = useMemo(() => {
    if (!bookmarks) return null;
    return computeBookmarksMetadata(bookmarks);
  }, [bookmarks]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chosenList, setChosenList] = useState<{
    id: string;
    visibility: "public" | "private";
    listName: string;
  } | null>(null);

  const curriculumnMetadata = useMemo(() => {
    if (
      !chosenList ||
      !metadata ||
      !metadata[chosenList.visibility] ||
      !metadata[chosenList.visibility][chosenList.id]
    )
      return null;
    return metadata[chosenList.visibility][chosenList.id].curricula;
  }, [chosenList, metadata]);

  const questionUnderThatBookmarkList = useMemo(() => {
    if (!chosenList) return null;
    return bookmarks?.find((bookmark) => bookmark.id === chosenList.id)
      ?.userBookmarks;
  }, [chosenList, bookmarks]);
  const [selectedCurriculumn, setSelectedCurriculum] =
    useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);
  const subjectMetadata = useMemo(() => {
    return computeSubjectMetadata(
      questionUnderThatBookmarkList || [],
      selectedCurriculumn,
      selectedSubject
    );
  }, [selectedCurriculumn, selectedSubject, questionUnderThatBookmarkList]);

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

  const topicalData = useMemo(() => {
    return filterQuestionsByCriteria(
      questionUnderThatBookmarkList,
      currentFilter,
      selectedCurriculumn,
      selectedSubject
    );
  }, [
    currentFilter,
    questionUnderThatBookmarkList,
    selectedCurriculumn,
    selectedSubject,
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
      setDisplayedData(chunkedData[0] ?? 0);
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
      !chosenList ||
      !selectedCurriculumn ||
      !selectedSubject ||
      !currentFilter ||
      !fullPartitionedData ||
      !displayedData ||
      displayedData.length === 0
    );
  }, [
    chosenList,
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
                  setChosenList(null);
                  setSelectedCurriculum(null);
                  setSelecteSubject(null);
                }}
              >
                {chosenList ? (
                  <>
                    {chosenList.visibility === "public" ? (
                      <Globe size={13} />
                    ) : (
                      <Lock size={13} />
                    )}
                    {truncateListName({ listName: chosenList.listName })}
                  </>
                ) : (
                  "List"
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              {chosenList && (
                <>
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
                </>
              )}
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

        {metadata && !chosenList && userSession?.data?.session && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <h1 className="font-semibold text-2xl">Choose your list</h1>
            <div className="flex flex-col flex-wrap gap-5 items-center justify-center w-full ">
              {metadata?.private &&
                Object.keys(metadata.private).length > 0 && (
                  <div className="flex flex-col gap-2 w-full items-start justify-center">
                    <h2 className="font text-lg text-logo-main">Private</h2>
                    <div className="flex flex-row flex-wrap gap-5 items-center justify-start w-full ">
                      {Object.keys(metadata.private).map((listId) => (
                        <ListFolder
                          BETTER_AUTH_URL={BETTER_AUTH_URL}
                          listId={listId}
                          listName={metadata.private[listId].listName}
                          visibility="private"
                          key={listId}
                          metadata={metadata}
                          setChosenList={setChosenList}
                        />
                      ))}
                    </div>
                  </div>
                )}
              {metadata?.public && Object.keys(metadata.public).length > 0 && (
                <div className="flex flex-col gap-2 w-full items-start justify-center">
                  <h2 className="font text-lg text-logo-main">Public</h2>
                  <div className="flex flex-row flex-wrap gap-5 items-center justify-start w-full ">
                    {Object.keys(metadata.public).map((listId) => (
                      <ListFolder
                        listName={metadata.public[listId].listName}
                        BETTER_AUTH_URL={BETTER_AUTH_URL}
                        listId={listId}
                        visibility="public"
                        metadata={metadata}
                        key={listId}
                        setChosenList={setChosenList}
                      />
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(metadata?.private || {}).length === 0 &&
                Object.keys(metadata?.public || {}).length === 0 &&
                !savedActivitiesIsFetching &&
                !isUserSessionPending &&
                userSession?.data?.session && (
                  <div className="flex flex-col gap-4 items-center justify-center w-full">
                    <p className="text-sm text-muted-foreground">
                      No lists found. Search for questions and add them to a new
                      list!
                    </p>
                    <NavigateToTopicalApp>
                      Search for questions
                    </NavigateToTopicalApp>
                  </div>
                )}
            </div>
          </div>
        )}
        {Object.keys(metadata?.private || {}).length === 0 &&
          Object.keys(metadata?.public || {}).length === 0 &&
          !savedActivitiesIsFetching &&
          !isUserSessionPending &&
          !userSession?.data?.session && (
            <p className="text-sm  text-red-500">
              You are not signed in. Please sign to create a list!
            </p>
          )}
        {(savedActivitiesIsFetching || isUserSessionPending) && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <Loader2 className="animate-spin" />
          </div>
        )}

        <ScrollToTopButton
          isScrollingAndShouldShowScrollButton={
            isScrollingAndShouldShowScrollButton && displayedData.length > 0
          }
          scrollAreaRef={scrollAreaRef}
        />
        {curriculumnMetadata && !selectedCurriculumn && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <h1 className="font-semibold text-2xl">Choose your curriculumn</h1>
            <div className="flex flex-row flex-wrap gap-5 items-center justify-center w-full">
              {Object.keys(curriculumnMetadata).length === 0 && (
                <div className="flex flex-col gap-4 items-center justify-center w-full">
                  <p className="text-sm text-muted-foreground">
                    No curriculums found. Search for questions and add them to a
                    this list!
                  </p>
                  <NavigateToTopicalApp>
                    Search for questions{" "}
                  </NavigateToTopicalApp>
                </div>
              )}
              {Object.keys(curriculumnMetadata).map((curriculum) => (
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
        {curriculumnMetadata && selectedCurriculumn && !selectedSubject && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <h1 className="font-semibold text-2xl">Choose your subject</h1>
            {Object.keys(curriculumnMetadata).length > 0 ? (
              <ScrollArea
                className="h-[60dvh] px-4 w-full [&_.bg-border]:bg-logo-main "
                type="always"
              >
                <div className="flex flex-row flex-wrap gap-8 items-start justify-center w-full  ">
                  {curriculumnMetadata?.[selectedCurriculumn]?.subjects?.map(
                    (subject) => (
                      <div
                        key={subject}
                        className="flex flex-col items-center  justify-center gap-1 cursor-pointer w-[150px]"
                        onClick={() => {
                          setSelecteSubject(subject);
                        }}
                      >
                        <Image
                          width={150}
                          height={200}
                          loading="lazy"
                          title={subject}
                          className=" object-cover rounded-[1px] "
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
                    )
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col gap-4 items-center justify-center w-full">
                <p className="text-sm text-muted-foreground">
                  No subjects found. Search for questions and add them to a this
                  list!
                </p>
                <NavigateToTopicalApp>
                  Search for questions{" "}
                </NavigateToTopicalApp>
              </div>
            )}
          </div>
        )}
        {!isQuestionViewDisabled && (
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
                      isUserSessionPending={isUserSessionPending}
                      userFinishedQuestions={userFinishedQuestions ?? []}
                      isValidSession={isValidSession}
                      key={`${question.id}-${imageSrc}`}
                      imageSrc={imageSrc}
                      listId={chosenList?.id}
                      onQuestionClick={() => {
                        setIsQuestionInspectOpen({
                          isOpen: true,
                          questionId: question.id,
                        });
                      }}
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
        {displayedData?.length === 0 && selectedSubject && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <p className="text-sm text-muted-foreground">
              No questions found. Search for questions and add them to this
              list!
            </p>
            <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
          </div>
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

      {Array.isArray(questionUnderThatBookmarkList) &&
        questionUnderThatBookmarkList.length > 0 && (
          <QuestionInspect
            sortParameters={sortParameters}
            setSortParameters={setSortParameters}
            isOpen={isQuestionInspectOpen}
            setIsOpen={setIsQuestionInspectOpen}
            partitionedTopicalData={fullPartitionedData}
            bookmarks={bookmarks ?? []}
            BETTER_AUTH_URL={BETTER_AUTH_URL}
            isValidSession={isValidSession}
            isUserSessionPending={isUserSessionPending}
            listId={chosenList?.id}
            isInspectSidebarOpen={isInspectSidebarOpen}
            setIsInspectSidebarOpen={setIsInspectSidebarOpen}
            userFinishedQuestions={userFinishedQuestions ?? []}
          />
        )}
    </>
  );
};

export default BookmarkClient;
