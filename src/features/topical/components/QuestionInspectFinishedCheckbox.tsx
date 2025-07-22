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
} from "../server/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { SelectedFinishedQuestion, SelectedQuestion } from "../constants/types";

export const QuestionInspectFinishedCheckbox = ({
  finishedQuestions,
  question,
  isFinishedQuestionDisabled,
  isFinishedQuestionFetching,
  isFinishedQuestionError,
  className,
  isValidSession,
}: {
  finishedQuestions: SelectedFinishedQuestion[] | null;
  question: SelectedQuestion;
  isFinishedQuestionDisabled: boolean;
  isFinishedQuestionFetching: boolean;
  isFinishedQuestionError: boolean;
  className?: string;
  isValidSession: boolean;
}) => {
  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: ["user_finished_questions", question.id],
    }) > 0;

  const isFinished = finishedQuestions?.some(
    (item) => item.question.id === question.id
  );

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: ["user_finished_questions", question.id],
    mutationFn: async ({
      realQuestionId,
      isRealFinished,
    }: {
      realQuestionId: string;
      isRealFinished: boolean;
    }) => {
      if (!realQuestionId) {
        throw new Error(
          "No question id provided for finished question mutation"
        );
      }
      if (isRealFinished) {
        await removeFinishedQuestionAction({ questionId: realQuestionId });
      } else {
        await addFinishedQuestionAction({ questionId: realQuestionId });
      }
    },

    onSuccess: async (
      _data,
      {
        realQuestionId,
        isRealFinished,
      }: { realQuestionId: string; isRealFinished: boolean }
    ) => {
      queryClient.setQueryData<SelectedFinishedQuestion[]>(
        ["user_finished_questions"],
        (prev) => {
          const next = prev ?? [];
          if (isRealFinished) {
            next.splice(
              next.findIndex((item) => item.question.id === realQuestionId),
              1
            );
          } else {
            next.push({
              question: {
                year: question.year,
                id: realQuestionId,
                paperType: question.paperType,
                season: question.season,
                questionImages: question.questionImages,
                answers: question.answers,
                questionTopics: question.questionTopics,
              },
              updatedAt: new Date(),
            });
          }
          return next;
        }
      );

      toast.success(
        isRealFinished
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
        "border-1 h-full flex items-center justify-center gap-1 p-2 rounded-md cursor-pointer",
        (isMutatingThisQuestion ||
          isFinishedQuestionDisabled ||
          isFinishedQuestionFetching) &&
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
          isFinishedQuestionDisabled ||
          isFinishedQuestionFetching
        ) {
          return;
        }
        if (!isValidSession) {
          toast.error("Please sign in to save finished questions.");
          return;
        }
        if (isFinishedQuestionError) {
          toast.error(
            "Failed to update finished questions list. Please refresh the page."
          );
          return;
        }
        mutate({
          realQuestionId: question.id,
          isRealFinished: isFinished ?? false,
        });
      }}
    >
      {isFinishedQuestionFetching ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : (
        <Switch
          className="border cursor-pointer border-dashed data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-solid "
          id="completed-switch"
          checked={isFinished ?? false}
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
        ) : isFinishedQuestionFetching ? (
          <>Loading</>
        ) : (
          <>Complete{isFinished && "d"}</>
        )}
      </Label>
    </div>
  );
};
