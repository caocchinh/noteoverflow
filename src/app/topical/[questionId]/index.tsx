"use client";
import {
  SavedActivitiesResponse,
  SelectedQuestion,
} from "@/features/topical/constants/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { ShareFilter } from "@/features/topical/components/ShareFilter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import { BookmarkButton } from "@/features/topical/components/BookmarkButton";
import { QuestionInspectFinishedCheckbox } from "@/features/topical/components/QuestionInspectFinishedCheckbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionInformation } from "@/features/topical/components/QuestionInformation";
import { InspectImages } from "@/features/topical/components/InspectImages";
import { BestExamHelpUltility } from "@/features/topical/components/BestExamHelpUltility";

export const QuestionView = ({
  data,
  BETTER_AUTH_URL,
}: {
  data: SelectedQuestion;
  BETTER_AUTH_URL: string;
}) => {
  const [currentView, setCurrentView] = useState<"question" | "answer">(
    "question"
  );
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

  return (
    <div className="flex flex-col h-screen pt-16 px-4 relative">
      <div className="flex items-center justify-start w-full gap-4 flex-wrap mb-3 ">
        <div className="flex items-center w-max justify-center gap-2 p-[3px] bg-input/80 rounded-md  ">
          <Button
            onClick={() => setCurrentView("question")}
            className={cn(
              "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
              currentView === "question" &&
                "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 "
            )}
          >
            Question
          </Button>
          <Button
            onClick={() => setCurrentView("answer")}
            className={cn(
              "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
              currentView === "answer" &&
                "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 "
            )}
          >
            Answer
          </Button>
        </div>
        <BookmarkButton
          bookmarks={bookmarks ?? []}
          isSavedActivitiesFetching={isSavedActivitiesFetching}
          isSavedActivitiesError={isSavedActivitiesError}
          isBookmarkDisabled={isUserSessionPending}
          isValidSession={isValidSession}
          isInView={true}
          badgeClassName="!h-full"
          question={data}
        />
        <QuestionInspectFinishedCheckbox
          isValidSession={isValidSession}
          question={data}
          className="!h-max"
          finishedQuestions={userFinishedQuestions ?? []}
          isUserSessionPending={isUserSessionPending}
          isSavedActivitiesFetching={isSavedActivitiesFetching}
          isSavedActivitiesError={isSavedActivitiesError}
        />
        <BestExamHelpUltility question={data} />
        <ShareFilter
          isDisabled={false}
          url={`${BETTER_AUTH_URL}/topical/${encodeURIComponent(data.id)}`}
          type="question"
        />
      </div>
      <div
        className={cn(currentView === "question" ? "block w-full" : "hidden")}
      >
        <ScrollArea
          className="h-[76dvh]  w-full [&_.bg-border]:bg-transparent"
          type="always"
        >
          <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
            <QuestionInformation
              question={data}
              showCurriculumn={true}
              showSubject={true}
            />
          </div>
          <InspectImages
            imageSource={data?.questionImages ?? []}
            currentQuestionId={data?.id}
            imageTheme={"light"}
          />
        </ScrollArea>
      </div>
      <div className={cn(currentView === "answer" ? "block w-full" : "hidden")}>
        <ScrollArea
          className="h-[76dvh] w-full [&_.bg-border]:bg-transparent"
          type="always"
        >
          <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
            <QuestionInformation
              question={data}
              showCurriculumn={true}
              showSubject={true}
            />
          </div>
          <InspectImages
            imageSource={data?.answers ?? []}
            currentQuestionId={data?.id}
            imageTheme={"light"}
          />
        </ScrollArea>
      </div>
    </div>
  );
};
