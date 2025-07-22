"use client";

import { SelectedFinishedQuestion } from "@/features/topical/constants/types";
import {
  extractCurriculumCode,
  extractSubjectCode,
} from "@/features/topical/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

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
  const metadata = useMemo(() => {
    const tempMetadata: {
      subject: Set<string>;
      curriculum: Set<string>;
    } = {
      subject: new Set<string>(),
      curriculum: new Set<string>(),
    };
    userFinishedQuestions?.forEach((question) => {
      tempMetadata.curriculum.add(
        extractCurriculumCode({ questionId: question.question.id })
      );
      tempMetadata.subject.add(
        extractSubjectCode({ questionId: question.question.id })
      );
    });
    return tempMetadata;
  }, [userFinishedQuestions]);

  console.log(metadata);

  return (
    <div>
      <div>Finished questions</div>
    </div>
  );
};

export default FinishedQuestionsPage;
