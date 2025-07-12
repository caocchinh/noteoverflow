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

export const QuestionInspectFinishedCheckbox = ({
  finishedQuestions,
  questionId,
  isFinishedQuestionDisabled,
  isFinishedQuestionFetching,
  isFinishedQuestionError,
  className,
  isValidSession,
}: {
  finishedQuestions: Set<string> | null;
  questionId: string | undefined;
  isFinishedQuestionDisabled: boolean;
  isFinishedQuestionFetching: boolean;
  isFinishedQuestionError: boolean;
  className?: string;
  isValidSession: boolean;
}) => {
  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: ["user_finished_questions", questionId],
    }) > 0;

  const isFinished = finishedQuestions?.has(questionId ?? "");

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: ["user_finished_questions", questionId],
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

      // Only perform the remote update. Cache & UI updates happen in onSuccess.
      if (isRealFinished) {
        await removeFinishedQuestionAction({ questionId: realQuestionId });
      } else {
        await addFinishedQuestionAction({ questionId: realQuestionId });
      }
    },

    onSuccess: (
      _data,
      {
        realQuestionId,
        isRealFinished,
      }: { realQuestionId: string; isRealFinished: boolean }
    ) => {
      const old = queryClient.getQueryData<Set<string>>([
        "user_finished_questions",
      ]);

      if (old) {
        if (isRealFinished) {
          old.delete(realQuestionId);
        } else {
          old.add(realQuestionId);
        }
      }

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

  if (!questionId) {
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
      onClick={() => {
        if (isMutatingThisQuestion || isFinishedQuestionDisabled) {
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
          realQuestionId: questionId,
          isRealFinished: isFinished ?? false,
        });
      }}
    >
      <Switch
        className="border cursor-pointer border-dashed dark:data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-solid "
        id="completed-switch"
        checked={isFinished ?? false}
      />
      <Label
        className={cn(
          isFinished ? "text-green-600" : "text-muted-foreground",
          "cursor-pointer"
        )}
        htmlFor="completed-switch"
      >
        {isMutatingThisQuestion ? (
          <>Saving...</>
        ) : (
          <>Complete{isFinished && "d"}</>
        )}
      </Label>
    </div>
  );
};
