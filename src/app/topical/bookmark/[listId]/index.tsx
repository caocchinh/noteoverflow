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
  computeCurriculumSubjectMapping,
  computeSubjectMetadata,
  filterQuestionsByCriteria,
} from "@/features/topical/lib/utils";
import { BreadcrumbContentProps, QuestionInspectRef } from "@/features/topical/types/components";
import { SelectedPublickBookmark, SubjectMetadata } from "@/features/topical/types/models";
import { api } from "@/lib/eden";
import { useMutationState, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

export const BookmarkView = ({
  BETTER_AUTH_URL,
  listId,
  bookmarkId,
  isOwnerOfTheList,
  ownerInfo,
}: {
  BETTER_AUTH_URL: string;
  listId: string;
  bookmarkId: string;
  isOwnerOfTheList: boolean;
  ownerInfo: {
    ownerName: string;
    ownerId: string;
    listName: string;
    ownerAvatar: string;
  };
}) => {
  const { isSessionPending } = useAuth();
  const { bookmarksData: bookmarks, savedActivitiesIsFetching } = useTopicalApp();
  const questionInspectRef = useRef<QuestionInspectRef | null>(null);
  const settledBookmarksMutations = useMutationState({
    filters: {
      mutationKey: ["user_saved_activities", "bookmarks"],
      predicate: (mutation) =>
        mutation.state.status === "success" || mutation.state.status === "error",
    },
  });

  // Fetch bookmark data only if user is not the owner
  const { data: fetchedBookmarkData, isPending: isFetchedBookmarkPending } = useQuery({
    queryKey: ["bookmark", bookmarkId],
    queryFn: async () => {
      const { data, error } = await api.topical.bookmark({ bookmarkId: bookmarkId }).get();
      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error);
      }
      return data;
    },
    enabled: !isOwnerOfTheList && !!bookmarkId,
  });

  // Get bookmark data based on ownership
  const bookmarkData = useMemo((): SelectedPublickBookmark[] => {
    if (isOwnerOfTheList) {
      // User is owner, find the specific bookmark from their saved activities
      return bookmarks?.find((bookmark) => bookmark.id === bookmarkId)?.userBookmarks ?? [];
    } else {
      // User is not owner, use fetched data
      return Array.isArray(fetchedBookmarkData) ? fetchedBookmarkData : [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwnerOfTheList, bookmarks, bookmarkId, fetchedBookmarkData, settledBookmarksMutations]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const metadata = useMemo(() => {
    return bookmarkData ? computeCurriculumSubjectMapping(bookmarkData) : {};
  }, [bookmarkData]);
  const [selectedCurriculumn, setSelectedCurriculum] = useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);

  const subjectMetadata = useMemo(() => {
    return computeSubjectMetadata(bookmarkData || [], selectedCurriculumn, selectedSubject);
  }, [bookmarkData, selectedCurriculumn, selectedSubject]);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const [currentFilter, setCurrentFilter] = useState<SubjectMetadata | null>(null);

  const topicalData = useMemo(() => {
    return filterQuestionsByCriteria(
      bookmarkData,
      currentFilter,
      selectedCurriculumn,
      selectedSubject,
    );
  }, [currentFilter, bookmarkData, selectedCurriculumn, selectedSubject]);

  const isQuestionViewDisabled = useMemo(() => {
    return (
      !selectedCurriculumn ||
      !selectedSubject ||
      !currentFilter ||
      !topicalData ||
      topicalData.length === 0
    );
  }, [selectedCurriculumn, selectedSubject, currentFilter, topicalData]);

  // Before breadcrumb content
  const preContent = (
    <>
      {(savedActivitiesIsFetching ||
        isSessionPending ||
        (isFetchedBookmarkPending && !isOwnerOfTheList)) && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {!isSessionPending &&
        !(isFetchedBookmarkPending && !isOwnerOfTheList) &&
        !savedActivitiesIsFetching && (
          <div className="mb-1 flex w-full flex-row items-center justify-start gap-1">
            <Image
              src={ownerInfo.ownerAvatar}
              alt="owner avatar"
              width={25}
              height={25}
              loading="lazy"
              className="rounded-full"
            />
            <p className="text-logo-main text-sm">
              {ownerInfo.ownerName}&apos;s list - {ownerInfo.listName}
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
    scrollAreaRef,
    isExportModeEnabled,
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
        isExportModeEnabled={isExportModeEnabled}
        sortParameters={sortParameters}
        setIsQuestionInspectOpen={questionInspectRef.current?.setIsInspectOpen}
        setSortParameters={setSortParameters}
        fullPartitionedData={fullPartitionedData}
        currentChunkIndex={currentChunkIndex}
        setCurrentChunkIndex={setCurrentChunkIndex}
        scrollAreaRef={scrollAreaRef}
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {metadata && !selectedCurriculumn && Object.keys(metadata).length > 0 && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">Choose your curriculumn</h1>
          <div className="flex w-full flex-row flex-wrap items-center justify-center gap-5">
            {Object.keys(metadata).map((curriculum) => (
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
      {Object.keys(metadata).length === 0 &&
        !(isFetchedBookmarkPending && !isOwnerOfTheList) &&
        !isSessionPending &&
        !savedActivitiesIsFetching &&
        !selectedSubject &&
        !selectedCurriculumn && (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground text-center text-sm">
              Nothing found in this bookmark list!
            </p>
            <NavigateToTopicalApp>Search for questions </NavigateToTopicalApp>
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

      {metadata && selectedCurriculumn && !selectedSubject && Object.keys(metadata).length > 0 && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">Choose your subject</h1>
          <ScrollArea className="[&_.bg-border]:bg-logo-main h-[60dvh] w-full px-4" type="always">
            <div className="flex w-full flex-row flex-wrap items-start justify-center gap-8">
              {metadata[selectedCurriculumn]?.map((subject) => (
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
                      SUBJECT_COVER_IMAGE[selectedCurriculumn as keyof typeof SUBJECT_COVER_IMAGE][
                        subject
                      ]
                    }
                  />
                  <p className="text-muted-foreground px-1 text-center text-sm">{subject}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {metadata && selectedCurriculumn && !selectedSubject && Object.keys(metadata).length == 0 && (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-center text-sm">
            No subjects found. Search for questions and add them to a this list!
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
        listId={isOwnerOfTheList ? listId : undefined}
        preContent={preContent}
        breadcrumbContent={breadcrumbContent}
        mainContent={mainContent}
        questionInspectRef={questionInspectRef}
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
