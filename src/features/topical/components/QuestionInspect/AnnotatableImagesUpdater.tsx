import { memo, useEffect, useMemo } from "react";
import { AnnotatableInspectImages } from "./AnnotatableInspectImages/AnnotatableInspectImages";
import {
  AnnotatableImagesUpdaterProps,
  SavedActivitiesResponse,
  SelectedAnnotation,
} from "../../constants/types";
import { saveAnnotationsAction } from "@/features/topical/server/actions";
import { useAuth } from "@/context/AuthContext";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

const AnnotatableImagesUpdater = memo(
  ({
    isMounted,
    imageSource,
    elementRef,
    elementRootRef,
    questionId,
    typeOfView,
    isHavingUnsafeChangesRef,
    componentRef,
    setIsAnnotationGuardDialogOpen,
    isAnnotationGuardDialogOpen,
  }: AnnotatableImagesUpdaterProps) => {
    const {
      setIsCalculatorOpen,
      isCalculatorOpen,
      savedActivitiesIsLoading: isSavedActivitiesLoading,
      savedActivitiesIsError: isSavedActivitiesError,
      uiPreferences,
      annotationsData,
    } = useTopicalApp();
    const { isSessionFetching, user } = useAuth();
    const queryClient = useQueryClient();

    const { mutate: onSaveAnnotations, isPending: isSavingAnnotations } =
      useMutation({
        mutationKey: [
          "user_saved_activities",
          "annotations",
          questionId,
          typeOfView,
        ],
        mutationFn: async (data: {
          questionId: string;
          questionXfdf?: string;
          answerXfdf?: string;
        }) => {
          const result = await saveAnnotationsAction(data);
          if (result.error) {
            throw new Error(result.error);
          }
          return result;
        },
        onSuccess: (_data, variables) => {
          queryClient.setQueryData<SavedActivitiesResponse>(
            ["user_saved_activities"],
            (prev) => {
              if (!prev) return prev;
              const nextAnnotations = prev.annotations
                ? [...prev.annotations]
                : [];
              const existingIndex = nextAnnotations.findIndex(
                (a) => a.questionId === variables.questionId
              );

              const newAnnotation: SelectedAnnotation = {
                questionId: variables.questionId,
                questionXfdf:
                  variables.questionXfdf ??
                  (existingIndex !== -1
                    ? nextAnnotations[existingIndex].questionXfdf
                    : ""),
                answerXfdf:
                  variables.answerXfdf ??
                  (existingIndex !== -1
                    ? nextAnnotations[existingIndex].answerXfdf
                    : ""),
                updatedAt: new Date(),
              };

              if (existingIndex !== -1) {
                nextAnnotations[existingIndex] = newAnnotation;
              } else {
                nextAnnotations.push(newAnnotation);
              }

              return {
                ...prev,
                annotations: nextAnnotations,
              };
            }
          );
        },
        retry: false,
      });

    const annotationsMutationState = useMutationState({
      filters: {
        mutationKey: ["user_saved_activities", "annotations"],
        predicate: (mutation) =>
          mutation.state.status === "success" ||
          mutation.state.status === "error",
      },
    });

    useEffect(() => {
      if (
        !isHavingUnsafeChangesRef.current["answer"] &&
        !isHavingUnsafeChangesRef.current["question"]
      ) {
        setIsAnnotationGuardDialogOpen(false);
      }
    }, [
      annotationsMutationState,
      isHavingUnsafeChangesRef,
      setIsAnnotationGuardDialogOpen,
    ]);

    const currentQuestionAnnotationData = useMemo(() => {
      return annotationsData?.find(
        (annotation) => annotation.questionId === questionId
      );
    }, [annotationsData, questionId]);

    const initialXfdf = useMemo(() => {
      if (!currentQuestionAnnotationData) {
        return null;
      }
      if (typeOfView == "answer") {
        return currentQuestionAnnotationData.answerXfdf;
      } else {
        return currentQuestionAnnotationData.questionXfdf;
      }
    }, [currentQuestionAnnotationData, typeOfView]);

    useEffect(() => {
      if (!isMounted || !imageSource) return;

      // Call initAnnotableImagesElement every time to update props
      // The function creates the root only if it doesn't exist,
      // then always calls render() with the updated component

      if (!elementRootRef.current && elementRef.current) {
        elementRootRef.current = createRoot(elementRef.current);
      }

      if (elementRootRef.current) {
        elementRootRef.current.render(
          <AnnotatableInspectImages
            ref={componentRef}
            isSavedActivitiesLoading={isSavedActivitiesLoading}
            isSavedActivitiesError={isSavedActivitiesError}
            initialXfdf={initialXfdf}
            typeOfView={typeOfView}
            imageSource={imageSource}
            isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
            currentQuestionId={questionId}
            isSessionFetching={isSessionFetching}
            userName={user?.name}
            setIsCalculatorOpen={setIsCalculatorOpen}
            isCalculatorOpen={isCalculatorOpen}
            imageTheme={uiPreferences?.imageTheme}
            onSaveAnnotations={onSaveAnnotations}
            isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
            isSavingAnnotations={isSavingAnnotations}
          />
        );
      }
    }, [
      isMounted,
      imageSource,
      elementRef,
      elementRootRef,
      questionId,
      isSessionFetching,
      setIsCalculatorOpen,
      isCalculatorOpen,
      typeOfView,
      initialXfdf,
      componentRef,
      user?.name,
      uiPreferences?.imageTheme,
      isSavedActivitiesLoading,
      isSavedActivitiesError,
      onSaveAnnotations,
      isHavingUnsafeChangesRef,
      setIsAnnotationGuardDialogOpen,
      isAnnotationGuardDialogOpen,
      isSavingAnnotations,
    ]);

    return null;
  }
);

AnnotatableImagesUpdater.displayName = "AnnotatableImagesUpdater";

export default AnnotatableImagesUpdater;
