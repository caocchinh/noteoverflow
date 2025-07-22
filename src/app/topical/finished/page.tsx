/* eslint-disable @next/next/no-img-element */
"use client";

import { ValidCurriculum } from "@/constants/types";
import {
  CURRICULUM_COVER_IMAGE,
  SUBJECT_COVER_IMAGE,
} from "@/features/topical/constants/constants";
import { SelectedFinishedQuestion } from "@/features/topical/constants/types";
import {
  extractCurriculumCode,
  extractSubjectCode,
} from "@/features/topical/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      return data.data;
    },
    enabled:
      !!userSession?.data?.session &&
      !isUserSessionError &&
      !queryClient.getQueryData(["user_finished_questions"]),
  });
  const metadata = useMemo(() => {
    const tempMetadata: Record<Partial<ValidCurriculum>, Set<string>> = {};
    userFinishedQuestions?.forEach((question) => {
      const extractedCurriculumn = extractCurriculumCode({
        questionId: question.question.id,
      });
      if (extractedCurriculumn) {
        if (!tempMetadata[extractedCurriculumn]) {
          tempMetadata[extractedCurriculumn] = new Set();
        }
        tempMetadata[extractedCurriculumn].add(
          extractSubjectCode({ questionId: question.question.id })
        );
      }
    });

    return Object.entries(tempMetadata).map(([curriculum, subjects]) => ({
      [curriculum]: Array.from(subjects),
    }))[0];
  }, [userFinishedQuestions]);
  const [selectedCurriculumn, setSelectedCurriculum] =
    useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);

  useEffect(() => {}, []);

  return (
    <div className="pt-16 relative z-[10] flex flex-col w-full items-center justify-center p-4">
      <div className="flex flex-row items-center justify-between w-[95%]">
        <Breadcrumb className="self-end">
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

      {(isUserFinishedQuestionsFetching || isUserSessionPending) && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {metadata && !selectedCurriculumn && (
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
                <img
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
      {metadata && selectedCurriculumn && !selectedSubject && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 className="font-semibold text-2xl">Choose your subject</h1>
          <div className="flex flex-row flex-wrap gap-5 items-center justify-center w-full  ">
            {metadata[selectedCurriculumn].map((subject) => (
              <div
                key={subject}
                className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                onClick={() => {
                  setSelecteSubject(subject);
                }}
              >
                <img
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
                <p>{subject}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinishedQuestionsPage;
