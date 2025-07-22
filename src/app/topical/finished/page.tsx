/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { SelectedFinishedQuestion } from "@/features/topical/constants/types";
import { authClient } from "@/lib/auth/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const FinishedQuestionsPage = () => {
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
        data: SelectedFinishedQuestion;
        error?: string;
      } = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }
      return new Set(data.data);
    },
    enabled:
      !!userSession?.data?.session &&
      !isUserSessionError &&
      !queryClient.getQueryData(["user_finished_questions"]),
  });

  return <div></div>;
};

export default FinishedQuestionsPage;
