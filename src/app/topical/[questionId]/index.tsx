"use client";
import {
  SelectedBookmark,
  SelectedFinishedQuestion,
  SelectedQuestion,
} from "@/features/topical/constants/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

  const {
    data: userFinishedQuestions,
    isFetching: isUserFinishedQuestionsFetching,
    isError: isUserFinishedQuestionsError,
  } = useQuery({
    queryKey: ["user_finished_questions"],
    queryFn: async () => {
      const response = await fetch("/api/topical/finished");
      const data: {
        data: SelectedFinishedQuestion[];
        error?: string;
      } = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }
      return data.data;
    },
    enabled:
      !!userSession?.data?.session &&
      !isUserSessionError &&
      !queryClient.getQueryData(["user_finished_questions"]),
  });

  const {
    data: bookmarks,
    isFetching: isBookmarksFetching,
    isError: isBookmarksError,
  } = useQuery({
    queryKey: ["all_user_bookmarks"],
    queryFn: async () => {
      const response = await fetch("/api/topical/bookmark", {
        method: "GET",
      });
      const data: {
        data: SelectedBookmark[];
        error?: string;
      } = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }

      return data.data;
    },
    enabled:
      !!userSession?.data?.session &&
      !isUserSessionError &&
      !queryClient.getQueryData(["all_user_bookmarks"]),
  });
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
          isBookmarksFetching={isBookmarksFetching}
          isBookmarkError={isBookmarksError}
          isBookmarkDisabled={isUserSessionPending}
          isValidSession={!!userSession?.data?.session}
          isInView={true}
          badgeClassName="!h-full"
          question={data}
        />
        <QuestionInspectFinishedCheckbox
          isFinishedQuestionFetching={isUserFinishedQuestionsFetching}
          isFinishedQuestionError={isUserFinishedQuestionsError}
          finishedQuestions={userFinishedQuestions ?? []}
          isValidSession={!!userSession?.data?.session}
          question={data}
          isFinishedQuestionDisabled={isUserSessionPending}
          className="!h-max"
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
