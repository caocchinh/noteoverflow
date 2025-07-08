"use client";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "./BookmarkButton";
import Image from "next/image";
import { useIsMutating } from "@tanstack/react-query";
import { Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

const QuestionPreview = memo(
  ({
    bookmarks,
    questionId,
    imageSrc,
    topic,
    year,
    paperType,
    setIsQuestionViewOpen,
    season,
    isBookmarksFetching,
    isUserSessionPending,
    error,
    userSession,
  }: {
    bookmarks: Set<string> | null;
    questionId: string;
    imageSrc: string;
    topic: string;
    year: number;
    paperType: number;
    setIsQuestionViewOpen: (open: {
      isOpen: boolean;
      questionId: string;
    }) => void;
    season: string;
    isBookmarksFetching: boolean;
    isUserSessionPending: boolean;
    error: boolean;
    userSession: ReturnType<
      typeof import("@/lib/auth/auth-client").authClient.getSession
    > | null;
  }) => {
    const mutationKey = ["user_bookmarks", questionId];

    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: mutationKey,
      }) > 0;

    return (
      <div
        key={imageSrc}
        className={cn(
          "w-full h-full object-cover bg-white flex items-center justify-center group cursor-pointer hover:scale-[0.98] transition-all group duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-sm border dark:border-none border-black/50 min-h-[100px] relative overflow-hidden"
        )}
        onClick={() =>
          setIsQuestionViewOpen({ isOpen: true, questionId: questionId })
        }
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 group-hover:opacity-[37%]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-transparent opacity-0 group-hover:opacity-[100%] flex flex-wrap gap-2 items-center justify-center content-center p-2">
          <Badge className="h-max bg-white !text-black whitespace-pre-wrap text-center">
            {topic}
          </Badge>
          <Badge className="h-max bg-white !text-black text-center">
            {year}
          </Badge>
          <Badge className="h-max bg-white !text-black text-center">
            Paper {paperType}
          </Badge>
          <Badge className="h-max bg-white !text-black text-center">
            {season}
          </Badge>

          {!isMutatingThisQuestion && !error && (
            <BookmarkButton
              className="absolute bottom-1 right-1 h-7 w-7 md:flex hidden cursor-pointer"
              disabled={isUserSessionPending}
              bookmarks={bookmarks}
              questionId={questionId}
              isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
              isValidSession={!!userSession?.data?.session}
            />
          )}
        </div>
        {!isMutatingThisQuestion && !error && (
          <BookmarkButton
            className="absolute bottom-1 right-1 h-7 w-7 md:hidden flex cursor-pointer"
            bookmarks={bookmarks || new Set()}
            questionId={questionId}
            isValidSession={!!userSession?.data?.session}
            disabled={isUserSessionPending}
            isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
          />
        )}
        {isMutatingThisQuestion && !error && (
          <Badge className="absolute bottom-1 right-1 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-black">
            Saving
            <Loader2 className="animate-spin" />
          </Badge>
        )}
        {error && (
          <Badge className="absolute bottom-1 right-1 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-red-600">
            Unable to bookmark
            <TriangleAlert />
          </Badge>
        )}
        <Image
          className={cn("w-full h-full object-contain")}
          src={imageSrc}
          height={100}
          width={100}
          alt={imageSrc}
        />
      </div>
    );
  }
);

QuestionPreview.displayName = "QuestionPreview";
export default QuestionPreview;
