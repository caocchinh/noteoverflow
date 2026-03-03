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
import { ListFolder } from "@/features/topical/components/ListFolder";
import NavigateToTopicalApp from "@/features/topical/components/NavigateToTopicalApp";
import SecondaryAppSidebar from "@/features/topical/components/SecondaryAppSidebar";
import SecondaryAppUltilityBar from "@/features/topical/components/SecondaryAppUltilityBar";
import SecondaryMainContent from "@/features/topical/components/SecondaryMainContent";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { truncateListName } from "@/features/topical/lib/utils";
import { BreadcrumbContentProps, QuestionInspectRef } from "@/features/topical/types/components";
import { SubjectMetadata } from "@/features/topical/types/models";
import { api } from "@/lib/eden";
import type { BookmarkListMetadataResponse } from "@/server/api/getBookmarkListMetadata";
import { useQuery } from "@tanstack/react-query";
import { Globe, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

const BookmarkClient = ({ BETTER_AUTH_URL }: { BETTER_AUTH_URL: string }) => {
  const { isSessionPending, isAuthenticated } = useAuth();
  const { bookmarksData: bookmarkLists, savedActivitiesIsFetching } = useTopicalApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chosenList, setChosenList] = useState<{
    id: string;
    visibility: "public" | "private";
    listName: string;
  } | null>(null);
  const [selectedCurriculumn, setSelectedCurriculum] = useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<SubjectMetadata | null>(null);
  const questionInspectRef = useRef<QuestionInspectRef | null>(null);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);

  // Fetch list metadata when a list is selected (lazy loading)
  const {
    data: listMetadata,
    isLoading: isMetadataLoading,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["bookmark-list-metadata", chosenList?.id],
    queryFn: async () => {
      if (!chosenList?.id) return null;
      const { data, error } = await api.topical["bookmark-list"]({
        listId: chosenList.id,
      }).metadata.get();
      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error);
      }
      return data as BookmarkListMetadataResponse;
    },
    enabled: !!chosenList?.id,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in garbage collection for 1 hour
  });

  // Fetch filtered questions when curriculum + subject are selected
  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = useQuery({
    queryKey: ["bookmark-questions", chosenList?.id, selectedCurriculumn, selectedSubject],
    queryFn: async () => {
      if (!chosenList?.id || !selectedCurriculumn || !selectedSubject) return null;
      const { data, error } = await api.topical["bookmark-list"]({
        listId: chosenList.id,
      }).questions.get({
        query: {
          curriculum: selectedCurriculumn,
          subject: selectedSubject,
        },
      });
      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error);
      }
      return data;
    },
    enabled: !!chosenList?.id && !!selectedCurriculumn && !!selectedSubject,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Derive subject metadata from fetched questions
  const subjectMetadata = useMemo((): SubjectMetadata | null => {
    if (!questionsData?.questions || questionsData.questions.length === 0) return null;

    const temp: SubjectMetadata = {
      topic: [],
      year: [],
      paperType: [],
      season: [],
    };

    questionsData.questions.forEach(({ question }) => {
      question.topics.forEach((topic) => {
        if (topic && !temp.topic.includes(topic)) {
          temp.topic.push(topic);
        }
      });
      if (!temp.year.includes(question.year.toString())) {
        temp.year.push(question.year.toString());
      }
      if (!temp.paperType.includes(question.paperType.toString())) {
        temp.paperType.push(question.paperType.toString());
      }
      if (!temp.season.includes(question.season)) {
        temp.season.push(question.season);
      }
    });

    return temp;
  }, [questionsData]);

  // Filter displayed questions based on current filter
  const topicalData = useMemo(() => {
    if (!questionsData?.questions || !currentFilter) return [];

    return questionsData.questions.filter(({ question }) => {
      if (!currentFilter.paperType.includes(question.paperType.toString())) return false;
      if (!currentFilter.year.includes(question.year.toString())) return false;
      if (!currentFilter.season.includes(question.season)) return false;
      const hasTopicOverlap = question.topics.some(
        (topic) => topic && currentFilter.topic.includes(topic),
      );
      if (!hasTopicOverlap) return false;
      return true;
    });
  }, [questionsData, currentFilter]);

  const isQuestionViewDisabled = useMemo(() => {
    return (
      !chosenList ||
      !selectedCurriculumn ||
      !selectedSubject ||
      !currentFilter ||
      !topicalData ||
      topicalData.length === 0
    );
  }, [chosenList, selectedCurriculumn, selectedSubject, currentFilter, topicalData]);

  // Build simple metadata from bookmark lists for initial list view
  const listsMetadata = useMemo(() => {
    if (!bookmarkLists) return null;
    const metadata: {
      public: Record<string, { listName: string }>;
      private: Record<string, { listName: string }>;
    } = { public: {}, private: {} };

    bookmarkLists.forEach((list) => {
      const visibility = list.visibility as "public" | "private";
      metadata[visibility][list.id] = { listName: list.listName };
    });

    return metadata;
  }, [bookmarkLists]);

  // Before breadcrumb content
  const preContent = (
    <>
      {(savedActivitiesIsFetching ||
        isSessionPending ||
        isMetadataLoading ||
        isQuestionsLoading) && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {!savedActivitiesIsFetching &&
        !isAuthenticated &&
        !isSessionPending &&
        bookmarkLists?.length === 0 && (
          <p className="text-center text-sm text-red-500">
            You are not signed in. Please sign to create a list!
          </p>
        )}

      {(isMetadataError || isQuestionsError) && (
        <p className="text-center text-sm text-red-500">Error loading data. Please try again.</p>
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
    scrollAreaRef,
    isExportModeEnabled,
  }: BreadcrumbContentProps) =>
    chosenList ? (
      <div
        className="mb-2 flex w-full flex-row flex-wrap items-center justify-between gap-2 sm:w-[95%]"
        ref={sideBarInsetRef}
      >
        <div>
          <Breadcrumb className="mr-0 flex w-max max-w-full sm:mr-6">
            <BreadcrumbList>
              <BreadcrumbItem
                className="cursor-pointer"
                onClick={() => {
                  setChosenList(null);
                  setSelectedCurriculum(null);
                  setSelecteSubject(null);
                  setCurrentFilter(null);
                }}
              >
                {chosenList ? (
                  <>
                    {chosenList.visibility === "public" ? <Globe size={13} /> : <Lock size={13} />}
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
                      setCurrentFilter(null);
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
                      setCurrentFilter(null);
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
          setIsQuestionInspectOpen={questionInspectRef.current?.setIsInspectOpen}
          isExportModeEnabled={isExportModeEnabled}
          fullPartitionedData={fullPartitionedData}
          currentChunkIndex={currentChunkIndex}
          setCurrentChunkIndex={setCurrentChunkIndex}
          scrollAreaRef={scrollAreaRef}
        />
      </div>
    ) : null;

  // Main content
  const mainContent = (
    <>
      {/* List selection view */}
      {listsMetadata && !chosenList && isAuthenticated && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">Choose your list</h1>
          <div className="flex w-full flex-col flex-wrap items-center justify-center gap-5">
            {Object.keys(listsMetadata.private).length > 0 && (
              <div className="flex w-full flex-col items-start justify-center gap-2">
                <h2 className="font text-logo-main text-lg">Private</h2>
                <div className="flex w-full flex-row flex-wrap items-center justify-start gap-5">
                  {Object.keys(listsMetadata.private).map((listId) => (
                    <ListFolder
                      BETTER_AUTH_URL={BETTER_AUTH_URL}
                      listId={listId}
                      listName={listsMetadata.private[listId].listName}
                      visibility="private"
                      key={listId}
                      metadata={null}
                      setChosenList={setChosenList}
                    />
                  ))}
                </div>
              </div>
            )}
            {Object.keys(listsMetadata.public).length > 0 && (
              <div className="flex w-full flex-col items-start justify-center gap-2">
                <h2 className="font text-logo-main text-lg">Public</h2>
                <div className="flex w-full flex-row flex-wrap items-center justify-start gap-5">
                  {Object.keys(listsMetadata.public).map((listId) => (
                    <ListFolder
                      listName={listsMetadata.public[listId].listName}
                      BETTER_AUTH_URL={BETTER_AUTH_URL}
                      listId={listId}
                      visibility="public"
                      metadata={null}
                      key={listId}
                      setChosenList={setChosenList}
                    />
                  ))}
                </div>
              </div>
            )}
            {Object.keys(listsMetadata.private).length === 0 &&
              Object.keys(listsMetadata.public).length === 0 &&
              !savedActivitiesIsFetching &&
              isAuthenticated &&
              !isSessionPending && (
                <div className="flex w-full flex-col items-center justify-center gap-4">
                  <p className="text-muted-foreground text-center text-sm">
                    No lists found. Search for questions and add them to a new list!
                  </p>
                  <NavigateToTopicalApp>Search for questions</NavigateToTopicalApp>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Curriculum selection view - uses lazy-loaded metadata */}
      {listMetadata && !selectedCurriculumn && chosenList && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">Choose your curriculumn</h1>
          <div className="flex w-full flex-row flex-wrap items-center justify-center gap-5">
            {Object.keys(listMetadata.curricula).length === 0 && (
              <div className="flex w-full flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground text-center text-sm">
                  No curriculums found. Search for questions and add them to this list!
                </p>
                <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
              </div>
            )}
            {Object.keys(listMetadata.curricula).map((curriculum) => (
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
        </div>
      )}

      {/* Subject selection view */}
      {listMetadata &&
        selectedCurriculumn &&
        !selectedSubject &&
        listMetadata.curricula[selectedCurriculumn] && (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-semibold">Choose your subject</h1>
            {listMetadata.curricula[selectedCurriculumn].subjects.length > 0 ? (
              <ScrollArea
                className="[&_.bg-border]:bg-logo-main h-[60dvh] w-full px-4"
                type="always"
              >
                <div className="flex w-full flex-row flex-wrap items-start justify-center gap-8">
                  {listMetadata.curricula[selectedCurriculumn].subjects.map((subject) => (
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
                        className="rounded-[3px] object-cover"
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
                  No subjects found. Search for questions and add them to this list!
                </p>
                <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
              </div>
            )}
          </div>
        )}

      {topicalData?.length === 0 && selectedSubject && !isQuestionsLoading && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-center text-sm">
            No questions found. Search for questions and add them to this list! Or change your
            filters.
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
