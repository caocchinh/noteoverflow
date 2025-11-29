import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addFinishedQuestionAction,
  removeFinishedQuestionAction,
} from "../../server/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  SavedActivitiesResponse,
  SelectedQuestion,
} from "../../constants/types";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { useAuth } from "@/context/AuthContext";
import { memo } from "react";

export const QuestionInspectFinishedCheckbox = memo(
  ({
    question,
    className,
  }: {
    question: SelectedQuestion;
    className?: string;
  }) => {
    const { finishedQuestionsData: userFinishedQuestions } = useTopicalApp();
    const { isSessionPending, isAuthenticated } = useAuth();
    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: [
          "user_saved_activities",
          "finished_questions",
          question.id,
        ],
      }) > 0;

    const isFinished =
      userFinishedQuestions?.some((item) => item.question.id === question.id) ??
      false;

    const queryClient = useQueryClient();
    const { savedActivitiesIsFetching, savedActivitiesIsError } =
      useTopicalApp();
    const { mutate } = useMutation({
      mutationKey: ["user_saved_activities", "finished_questions", question.id],
      mutationFn: async ({
        currentQuestionId,
        isCurrentlyFinished,
      }: {
        currentQuestionId: string;
        isCurrentlyFinished: boolean;
      }) => {
        if (!currentQuestionId) {
          throw new Error(
            "No question id provided for finished question mutation"
          );
        }
        if (isCurrentlyFinished) {
          const result = await removeFinishedQuestionAction({
            questionId: currentQuestionId,
          });
          if (result.error) {
            throw new Error(result.error);
          }
        } else {
          const result = await addFinishedQuestionAction({
            questionId: currentQuestionId,
          });
          if (result.error) {
            throw new Error(result.error);
          }
        }
      },

      onSuccess: async (
        _data,
        {
          currentQuestionId,
          isCurrentlyFinished,
        }: { currentQuestionId: string; isCurrentlyFinished: boolean }
      ) => {
        // Optimistically update the cache
        queryClient.setQueryData<SavedActivitiesResponse>(
          ["user_saved_activities"],
          (prev) => {
            if (!prev) {
              return prev;
            }
            const next = prev.finishedQuestions ?? [];
            if (isCurrentlyFinished) {
              next.splice(
                next.findIndex(
                  (item) => item.question.id === currentQuestionId
                ),
                1
              );
            } else {
              next.push({
                question: {
                  year: question.year,
                  id: currentQuestionId,
                  paperType: question.paperType,
                  season: question.season,
                  questionImages: question.questionImages,
                  answers: question.answers,
                  topics: question.topics,
                },
                updatedAt: new Date(),
              });
            }
            return {
              ...prev,
              finishedQuestions: next,
            };
          }
        );

        toast.success(
          isCurrentlyFinished
            ? "Question removed from finished questions list."
            : "Question added to finished questions list.",
          {
            duration: 2000,
          }
        );
      },

      onError: (error) => {
        toast.error(
          "Failed to update finished questions list: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      },
      retry: false,
    });

    if (!question.id) {
      return null;
    }

    return (
      <div
        className={cn(
          "border h-full flex items-center justify-center gap-1 p-2 rounded-md cursor-pointer",
          (isMutatingThisQuestion ||
            isSessionPending ||
            savedActivitiesIsFetching) &&
            "pointer-events-none",
          isFinished ? "border-green-600" : "border-muted-foreground",
          className
        )}
        title="Add to finished question"
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName === "LABEL") {
            return;
          }
          if (
            isMutatingThisQuestion ||
            isSessionPending ||
            savedActivitiesIsFetching
          ) {
            return;
          }
          if (!isAuthenticated) {
            toast.error("Please sign in to save finished questions.");
            return;
          }
          if (savedActivitiesIsError) {
            toast.error(
              "Failed to update finished questions list. Please refresh the page."
            );
            return;
          }
          mutate({
            currentQuestionId: question.id,
            isCurrentlyFinished: isFinished,
          });
        }}
      >
        {savedActivitiesIsFetching ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Switch
            className="border cursor-pointer border-dashed data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-solid "
            id="completed-switch"
            checked={isFinished}
          />
        )}
        <Label
          className={cn(
            isFinished ? "text-green-600" : "text-muted-foreground",
            "cursor-pointer"
          )}
          htmlFor="completed-switch"
        >
          {isMutatingThisQuestion ? (
            <>Saving...</>
          ) : savedActivitiesIsFetching ? (
            <>Loading</>
          ) : (
            <>Complete{isFinished && "d"}</>
          )}
        </Label>
      </div>
    );
  }
);

QuestionInspectFinishedCheckbox.displayName = "QuestionInspectFinishedCheckbox";
