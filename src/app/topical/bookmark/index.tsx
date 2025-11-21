"use client";

import { ValidCurriculum } from "@/constants/types";
import {
  QuestionInspectRef,
  SubjectMetadata,
  BreadcrumbContentProps,
} from "@/features/topical/constants/types";
import {
  computeBookmarksMetadata,
  truncateListName,
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
import { Globe, Lock, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import SecondaryMainContent from "@/features/topical/components/SecondaryMainContent";
import { useAuth } from "@/context/AuthContext";

const BookmarkClient = ({ BETTER_AUTH_URL }: { BETTER_AUTH_URL: string }) => {
  const { isSessionPending, isAuthenticated } = useAuth();

  const { bookmarksData: bookmarks, savedActivitiesIsFetching } =
    useTopicalApp();

  const settledBookmarksMutations = useMutationState({
    filters: {
      mutationKey: ["user_saved_activities", "bookmarks"],
      predicate: (mutation) =>
        mutation.state.status === "success" ||
        mutation.state.status === "error",
    },
  });

  const metadata = useMemo(() => {
    if (!bookmarks) return null;
    return computeBookmarksMetadata(bookmarks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks, settledBookmarksMutations]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenList, bookmarks, settledBookmarksMutations]);
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
  const questionInspectRef = useRef<QuestionInspectRef | null>(null);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const [currentFilter, setCurrentFilter] = useState<SubjectMetadata | null>(
    null
  );
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

  const isQuestionViewDisabled = useMemo(() => {
    return (
      !chosenList ||
      !selectedCurriculumn ||
      !selectedSubject ||
      !currentFilter ||
      !topicalData ||
      topicalData.length === 0
    );
  }, [
    chosenList,
    selectedCurriculumn,
    selectedSubject,
    currentFilter,
    topicalData,
  ]);

  // Before breadcrumb content
  const preContent = (
    <>
      {(savedActivitiesIsFetching || isSessionPending) && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {Object.keys(metadata?.private || {}).length === 0 &&
        Object.keys(metadata?.public || {}).length === 0 &&
        !savedActivitiesIsFetching &&
        !isAuthenticated &&
        !isSessionPending && (
          <p className="text-sm  text-red-500 text-center">
            You are not signed in. Please sign to create a list!
          </p>
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
  }: BreadcrumbContentProps) =>
    chosenList ? (
      <div
        className="flex flex-row items-center justify-between w-full sm:w-[95%] mb-2 flex-wrap gap-2"
        ref={sideBarInsetRef}
      >
        <div>
          <Breadcrumb className="flex mr-0 sm:mr-6 max-w-full w-max">
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
        </div>
        <SecondaryAppUltilityBar
          isFilteredDisabled={!selectedSubject}
          sortParameters={sortParameters}
          setSortParameters={setSortParameters}
          setIsSidebarOpen={setIsSidebarOpen}
          isQuestionViewDisabled={isQuestionViewDisabled}
          sideBarInsetRef={sideBarInsetRef}
          isSidebarOpen={isSidebarOpen}
          setIsQuestionInspectOpen={
            questionInspectRef.current?.setIsInspectOpen
          }
          fullPartitionedData={fullPartitionedData}
          currentChunkIndex={currentChunkIndex}
          setCurrentChunkIndex={setCurrentChunkIndex}
          setDisplayedData={setDisplayedData}
          scrollAreaRef={scrollAreaRef}
        />
      </div>
    ) : null;

  // Main content
  const mainContent = (
    <>
      {metadata && !chosenList && isAuthenticated && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 className="font-semibold text-2xl">Choose your list</h1>
          <div className="flex flex-col flex-wrap gap-5 items-center justify-center w-full ">
            {metadata?.private && Object.keys(metadata.private).length > 0 && (
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
              isAuthenticated &&
              !isSessionPending && (
                <div className="flex flex-col gap-4 items-center justify-center w-full">
                  <p className="text-sm text-muted-foreground text-center">
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

      {curriculumnMetadata && !selectedCurriculumn && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 className="font-semibold text-2xl">Choose your curriculumn</h1>
          <div className="flex flex-row flex-wrap gap-5 items-center justify-center w-full">
            {Object.keys(curriculumnMetadata).length === 0 && (
              <div className="flex flex-col gap-4 items-center justify-center w-full">
                <p className="text-sm text-muted-foreground text-center">
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
              <p className="text-sm text-muted-foreground text-center">
                No subjects found. Search for questions and add them to a this
                list!
              </p>
              <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
            </div>
          )}
        </div>
      )}

      {topicalData?.length === 0 && selectedSubject && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <p className="text-sm text-muted-foreground text-center">
            No questions found. Search for questions and add them to this list!
            Or change your filters.
          </p>
          <NavigateToTopicalApp>Search for questions</NavigateToTopicalApp>
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
        listId={chosenList?.id}
        questionInspectRef={questionInspectRef}
        preContent={preContent}
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

export default BookmarkClient;
