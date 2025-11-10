"use client";
import {
  SelectedPublickBookmark,
  SubjectMetadata,
  SortParameters,
  QuestionInspectOpenState,
} from "@/features/topical/constants/types";
import { useMemo, useRef, useState } from "react";
import { useIsMutating, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  computeSubjectMetadata,
  filterQuestionsByCriteria,
  computeCurriculumSubjectMapping,
} from "@/features/topical/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth/auth-client";
import { ValidCurriculum } from "@/constants/types";
import NavigateToTopicalApp from "@/features/topical/components/NavigateToTopicalApp";
import SecondaryAppSidebar from "@/features/topical/components/SecondaryAppSidebar";
import Image from "next/image";
import {
  CURRICULUM_COVER_IMAGE,
  SUBJECT_COVER_IMAGE,
} from "@/constants/constants";
import SecondaryAppUltilityBar from "@/features/topical/components/SecondaryAppUltilityBar";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { Loader2 } from "lucide-react";
import SecondaryMainContent from "@/features/topical/components/SecondaryMainContent";
import { DEFAULT_SORT_OPTIONS } from "@/features/topical/constants/constants";

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
  const queryClient = useQueryClient();
  const [isQuestionInspectOpen, setIsQuestionInspectOpen] =
    useState<QuestionInspectOpenState>({
      isOpen: false,
      questionId: "",
    });
  const { data: userSession, isPending: isUserSessionPending } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await authClient.getSession(),
    enabled: !queryClient.getQueryData(["user"]),
  });
  const isValidSession = !!userSession?.data?.session;

  const { bookmarksData: bookmarks, savedActivitiesIsFetching } =
    useTopicalApp();

  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: ["user_saved_activities", "bookmarks"],
    }) > 0;

  // Fetch bookmark data only if user is not the owner
  const { data: fetchedBookmarkData, isLoading: isFetchedBookmarkLoading } =
    useQuery({
      queryKey: ["bookmark", bookmarkId],
      queryFn: async () => {
        const response = await fetch(`/api/topical/bookmark/${bookmarkId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookmark");
        }
        return response.json();
      },
      enabled: !isOwnerOfTheList && !!bookmarkId,
    });

  // Get bookmark data based on ownership
  const bookmarkData = useMemo((): SelectedPublickBookmark[] => {
    if (isOwnerOfTheList) {
      // User is owner, find the specific bookmark from their saved activities
      return (
        bookmarks?.find((bookmark) => bookmark.id === bookmarkId)
          ?.userBookmarks ?? []
      );
    } else {
      // User is not owner, use fetched data
      return Array.isArray(fetchedBookmarkData) ? fetchedBookmarkData : [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOwnerOfTheList,
    bookmarks,
    bookmarkId,
    fetchedBookmarkData,
    isMutatingThisQuestion,
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const metadata = useMemo(() => {
    return bookmarkData ? computeCurriculumSubjectMapping(bookmarkData) : {};
  }, [bookmarkData]);
  const [selectedCurriculumn, setSelectedCurriculum] =
    useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: DEFAULT_SORT_OPTIONS,
  });

  const subjectMetadata = useMemo(() => {
    return computeSubjectMetadata(
      bookmarkData || [],
      selectedCurriculumn,
      selectedSubject
    );
  }, [bookmarkData, selectedCurriculumn, selectedSubject]);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const [currentFilter, setCurrentFilter] = useState<SubjectMetadata | null>(
    null
  );

  const topicalData = useMemo(() => {
    return filterQuestionsByCriteria(
      bookmarkData,
      currentFilter,
      selectedCurriculumn,
      selectedSubject
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
        isUserSessionPending ||
        isFetchedBookmarkLoading) && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {!isUserSessionPending &&
        !isFetchedBookmarkLoading &&
        !savedActivitiesIsFetching && (
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
        )}
    </>
  );

  // Breadcrumb content
  const breadcrumbContent = (
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
        isSidebarOpen={isSidebarOpen}
        sortParameters={sortParameters}
        setSortParameters={setSortParameters}
        setIsQuestionInspectOpen={setIsQuestionInspectOpen}
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {metadata && !selectedCurriculumn && Object.keys(metadata).length > 0 && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 className="font-semibold text-2xl">Choose your curriculumn</h1>
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
    </>
  );

  return (
    <>
      <SecondaryMainContent
        topicalData={topicalData}
        isQuestionViewDisabled={isQuestionViewDisabled}
        BETTER_AUTH_URL={BETTER_AUTH_URL}
        isValidSession={isValidSession}
        isUserSessionPending={isUserSessionPending}
        listId={isOwnerOfTheList ? listId : undefined}
        preContent={preContent}
        breadcrumbContent={breadcrumbContent}
        mainContent={mainContent}
        isQuestionInspectOpen={isQuestionInspectOpen}
        setIsQuestionInspectOpen={setIsQuestionInspectOpen}
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
