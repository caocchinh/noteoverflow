/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import "@/features/topical/components/react-photo-view.css";
import { generateSingleQuestionPdfBlob } from "@/features/topical/lib/generatePdfBlob";
import {
  extractPaperCode,
  extractQuestionNumber,
  splitContent,
} from "@/features/topical/lib/utils";
import {
  AnnotatableInspectImageProps,
  AnnotatableInspectImagesHandle,
  InnitPdfProps,
  PdfViewerWrapperHandle,
} from "@/features/topical/types/components";
import { cn } from "@/lib/utils";
import { Calculator, Edit3, Eye, Loader2, Maximize, Shrink, TriangleAlert } from "lucide-react";
import dynamic from "next/dynamic";
import {
  forwardRef,
  memo,
  RefObject,
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { createRoot, Root } from "react-dom/client";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { toast } from "sonner";
import Loader from "../../Loader/Loader";
import ClearAllButton from "./ClearAllButton";
import SaveAnnotationsButton from "./SaveAnnotationsButton";

const PdfViewerWrapper = dynamic(() => import("./PdfViewerWrapper"), {
  ssr: false,
});

const initPdfElement = ({
  pdfBlob,
  pdfViewerRef,
  pdfViewerElementRef,
  pdfViewerRootRef,
  onDocumentLoaded,
  onUnmount,
  author,
  fileName,
  initialXfdf,
  onAnnotationsChanged,
}: InnitPdfProps) => {
  if (!pdfViewerElementRef.current) {
    pdfViewerElementRef.current = document.createElement("div");
    pdfViewerElementRef.current.className = "w-full h-full";
  }

  if (!pdfViewerRootRef.current && pdfViewerElementRef.current) {
    pdfViewerRootRef.current = createRoot(pdfViewerElementRef.current);
  }

  if (pdfViewerRootRef.current) {
    pdfViewerRootRef.current.render(
      <PdfViewerWrapper
        documentPath={pdfBlob}
        ref={pdfViewerRef}
        onDocumentLoaded={onDocumentLoaded}
        author={author}
        fileName={fileName}
        onUnmount={onUnmount}
        initialXfdf={initialXfdf}
        onAnnotationsChanged={onAnnotationsChanged}
      />,
    );
  }
};

const PdfPortalContent = memo(
  ({
    portalKey,
    pdfViewerElementRef,
  }: {
    portalKey: number;
    pdfViewerElementRef: RefObject<HTMLDivElement | null>;
  }) => {
    const attachPdfViewer = useCallback(
      (node: HTMLDivElement | null) => {
        if (
          node &&
          pdfViewerElementRef.current &&
          pdfViewerElementRef.current.parentNode !== node
        ) {
          node.appendChild(pdfViewerElementRef.current);
        }
      },
      [pdfViewerElementRef],
    );

    return <div key={portalKey} ref={attachPdfViewer} className="h-full w-full" />;
  },
);

PdfPortalContent.displayName = "PdfPortalContent";

const AnnotatableInspectImagesComponent = memo(
  forwardRef<AnnotatableInspectImagesHandle, AnnotatableInspectImageProps>(
    (
      {
        question,
        isSessionFetching,
        userName,
        typeOfView,
        setIsCalculatorOpen,
        isCalculatorOpen,
        imageTheme,
        initialXfdf,
        isSavedActivitiesLoading,
        isSavedActivitiesError,
        onSaveAnnotations,
        isHavingUnsafeChangesRef,
        isAnnotationGuardDialogOpen,
        isSavingAnnotations,
        isAuthenticated,
      },
      ref,
    ) => {
      const [isEditMode, setIsEditMode] = useState(false);

      useImperativeHandle(
        ref,
        () => ({
          isEditMode,
        }),
        [isEditMode],
      );
      const [isFullscreen, setIsFullscreen] = useState(false);
      const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
      const [isPdfViewerLoaded, setIsPdfViewerLoaded] = useState(false);
      const [key, setKey] = useState(0);
      const [isMounted, setIsMounted] = useState(false);
      const [currentXfdf, setCurrentXfdf] = useState<string | null>(null);
      const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
      const [normalContainer, setNormalContainer] = useState<HTMLDivElement | null>(null);
      const [fullscreenContainer, setFullscreenContainer] = useState<HTMLDivElement | null>(null);

      const latestXfdfRef = useRef(currentXfdf);
      const pdfViewerRef = useRef<PdfViewerWrapperHandle>(null);
      const pdfViewerElementRef = useRef<HTMLDivElement | null>(null);
      const pdfViewerRootRef = useRef<Root | null>(null);
      const normalContainerRef = useRef<HTMLDivElement | null>(null);
      const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
      const ultilityBarRef = useRef<HTMLDivElement | null>(null);
      const isAuthenticatedRef = useRef(isAuthenticated);

      // Auto-save state
      const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

      const paperCode = useMemo(() => {
        if (!question) return "";
        return extractPaperCode({
          questionId: question.id || "",
        });
      }, [question]);

      const questionNumber = useMemo(() => {
        if (!question) return "";
        return extractQuestionNumber({
          questionId: question.id || "",
        });
      }, [question]);

      const pdfBaseFileName = useMemo(() => {
        const sanitizedPaperCode = (paperCode || "").replace("/", "_");
        return `NoteOverflow_${sanitizedPaperCode}_Q${questionNumber || ""}`;
      }, [paperCode, questionNumber]);

      useEffect(() => {
        latestXfdfRef.current = currentXfdf;
      }, [currentXfdf]);

      useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
      }, [isAuthenticated]);

      const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
      }, []);

      // Filter only image URLs
      const { images: imageUrls, text: textItems } = useMemo(() => {
        if (!question) return { images: [], text: [] };
        const items = typeOfView === "question" ? question.questionImages : question.answers;
        return splitContent(items);
      }, [question, typeOfView]);

      const generatePdfBlob = useCallback(
        async ({
          typeOfContent,
        }: {
          typeOfContent: "question" | "answer" | "question-with-answers";
        }) => {
          if (!question) return null;
          return generateSingleQuestionPdfBlob({
            question,
            typeOfContent,
          });
        },
        [question],
      );

      useEffect(() => {
        let isActive = true;

        const generate = async () => {
          if (isActive && !pdfBlob && isEditMode) {
            const blob = await generatePdfBlob({ typeOfContent: typeOfView });
            setPdfBlob(blob);
          }
        };

        setTimeout(generate, 0);

        return () => {
          isActive = false;
        };
      }, [generatePdfBlob, isEditMode, pdfBlob, typeOfView]);

      // Handle annotations changed callback
      const handleAnnotationsChanged = useCallback(
        (xfdf: string) => {
          if (isAuthenticatedRef.current) {
            isHavingUnsafeChangesRef.current[typeOfView] = true;
            isHavingUnsafeChangesRef.current.questionId = question?.id || "";
            setHasUnsavedChanges(true);
          }
          setCurrentXfdf(xfdf);
        },
        [isHavingUnsafeChangesRef, question, typeOfView],
      );

      const handleSave = useCallback(() => {
        if (!isAuthenticatedRef.current) {
          toast.error("Please login to save annotations!");
          return;
        }
        if (!question) return;

        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        if (currentXfdf && question.id) {
          const xfdfBeingSaved = currentXfdf;
          onSaveAnnotations(
            {
              questionId: question.id,
              ...(typeOfView === "question"
                ? { questionXfdf: xfdfBeingSaved || undefined }
                : { answerXfdf: xfdfBeingSaved || undefined }),
            },
            {
              onSuccess: () => {
                if (latestXfdfRef.current === xfdfBeingSaved) {
                  isHavingUnsafeChangesRef.current[typeOfView] = false;
                  setHasUnsavedChanges(false);
                }
              },
            },
          );
        }
      }, [currentXfdf, isHavingUnsafeChangesRef, onSaveAnnotations, question, typeOfView]);

      // Debounced auto-save effect
      useEffect(() => {
        if (
          !isHavingUnsafeChangesRef.current[typeOfView] ||
          !currentXfdf ||
          !question ||
          !isMounted ||
          !isPdfViewerLoaded ||
          !isAuthenticatedRef.current ||
          isSessionFetching
        )
          return;

        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        autoSaveTimeoutRef.current = setTimeout(() => {
          handleSave();
        }, 6769);

        return () => {
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
          }
        };
      }, [
        currentXfdf,
        isMounted,
        isPdfViewerLoaded,
        typeOfView,
        handleSave,
        isHavingUnsafeChangesRef,
        isSessionFetching,
        question,
      ]);

      useEffect(() => {
        if (
          !isHavingUnsafeChangesRef.current[typeOfView] ||
          !question ||
          !isMounted ||
          !isAnnotationGuardDialogOpen ||
          isSavingAnnotations ||
          !isAuthenticatedRef.current ||
          isSessionFetching
        ) {
          return;
        }

        handleSave();
      }, [
        isAnnotationGuardDialogOpen,
        isHavingUnsafeChangesRef,
        typeOfView,
        isSavingAnnotations,
        isMounted,
        handleSave,
        isSessionFetching,
        question,
      ]);

      const onPdfViewerMount = useEffectEvent(() => {
        setKey((prev) => prev + 1);
      });

      useEffect(() => {
        if (
          !pdfBlob ||
          isSessionFetching ||
          !isEditMode ||
          !isMounted ||
          pdfViewerRootRef.current ||
          pdfViewerElementRef.current
        )
          return;
        initPdfElement({
          pdfBlob,
          pdfViewerRef,
          pdfViewerElementRef,
          pdfViewerRootRef,
          author: userName,
          fileName: pdfBaseFileName,
          initialXfdf,
          onDocumentLoaded: () => {
            setIsPdfViewerLoaded(true);
          },
          onUnmount: () => {
            setIsPdfViewerLoaded(false);
          },
          onAnnotationsChanged: handleAnnotationsChanged,
        });
        onPdfViewerMount();
      }, [
        isEditMode,
        isMounted,
        isSessionFetching,
        pdfBaseFileName,
        pdfBlob,
        userName,
        handleAnnotationsChanged,
        initialXfdf,
      ]);

      const onQuestionChange = useEffectEvent(() => {
        setIsFullscreen(false);
        setIsEditMode(false);
        setPdfBlob(null);
        setTimeout(() => {
          setIsMounted(true);
        }, 0);
      });

      useEffect(() => {
        onQuestionChange();
        return () => {
          setTimeout(() => {
            setIsMounted(false);
            if (pdfViewerRootRef.current) {
              pdfViewerRootRef.current.unmount();
              pdfViewerRootRef.current = null;
            }
            if (pdfViewerElementRef.current) {
              pdfViewerElementRef.current.remove();
              pdfViewerElementRef.current = null;
            }
          }, 0);
        };
      }, [question]);

      if (!question || (!question.questionImages && !question.answers)) {
        return <p className="mt-2 text-center text-red-600">Unable to fetch resource</p>;
      }
      return (
        <>
          <div className="relative flex w-full flex-col overflow-hidden">
            <div
              className="mb-2 flex flex-wrap items-center justify-end gap-2"
              ref={ultilityBarRef}
            >
              {imageUrls.length > 0 && (
                <Button
                  type="button"
                  variant={
                    !isSavedActivitiesLoading && isSavedActivitiesError ? "destructive" : "outline"
                  }
                  disabled={isSessionFetching || isSavedActivitiesLoading || isSavedActivitiesError}
                  className="h-[26px] cursor-pointer gap-2"
                  title={isEditMode ? "Switch to view mode" : "Switch to edit mode"}
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {!isSavedActivitiesLoading && isSavedActivitiesError ? (
                    <>
                      <TriangleAlert /> Error{" "}
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          View Mode
                          <Eye className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Edit Mode
                          <Edit3 className="h-4 w-4" />
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}
              {!isFullscreen && isEditMode && (
                <>
                  <SaveAnnotationsButton
                    onSave={handleSave}
                    isSaving={isSavingAnnotations}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isDisabled={isSessionFetching || !isPdfViewerLoaded}
                    isUserNotAuthenticated={!isAuthenticated && !isSessionFetching}
                  />
                  <ClearAllButton
                    pdfViewerRef={pdfViewerRef}
                    isPdfViewerLoaded={isPdfViewerLoaded}
                    isSessionFetching={isSessionFetching}
                  />

                  <Button
                    className="h-[26px] cursor-pointer"
                    disabled={isSessionFetching}
                    variant="outline"
                    onClick={toggleFullscreen}
                    title="Enter Fullscreen"
                  >
                    <span className="hidden sm:block">Fullscreen</span>{" "}
                    <Maximize className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="relative flex w-full flex-col items-center">
              <div
                className={cn(
                  !isEditMode ? "absolute top-[999999px] left-[999999px] z-[-999999]" : "",
                  "h-full w-full",
                )}
              >
                <NotFullScreenContainer
                  onRefChange={(node) => {
                    normalContainerRef.current = node;
                    setNormalContainer(node);
                  }}
                  pdfBlob={pdfBlob}
                  isPdfViewerLoaded={isPdfViewerLoaded}
                />
                {createPortal(
                  <div
                    className={cn(
                      "fixed inset-0 z-999998 flex h-dvh w-screen flex-col bg-white",
                      isFullscreen ? "block" : "hidden",
                    )}
                    data-pdf-viewer
                  >
                    <div className="flex h-[40px] shrink-0 items-center justify-between border-b border-gray-700 bg-gray-700 px-2 py-1">
                      <span className="p-1 text-[13px] font-medium text-gray-300">
                        NoteOverflow Inspector
                      </span>
                      <div className="flex items-center gap-2">
                        <SaveAnnotationsButton
                          onSave={handleSave}
                          isSaving={isSavingAnnotations}
                          hasUnsavedChanges={hasUnsavedChanges}
                          isUserNotAuthenticated={!isAuthenticated && !isSessionFetching}
                          isDisabled={isSessionFetching || !isPdfViewerLoaded}
                        />
                        <ClearAllButton
                          pdfViewerRef={pdfViewerRef}
                          isPdfViewerLoaded={isPdfViewerLoaded}
                          isSessionFetching={isSessionFetching}
                        />

                        <Button
                          className="!hover:text-black relative z-99998 cursor-pointer text-white dark:text-white"
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                          title="Calculator"
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>

                        <Button
                          className="!hover:text-black relative z-999999 cursor-pointer text-white dark:text-white"
                          variant="ghost"
                          size="icon"
                          onClick={toggleFullscreen}
                          title="Exit Fullscreen"
                        >
                          <Shrink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div
                      ref={(node) => {
                        fullscreenContainerRef.current = node;
                        setFullscreenContainer(node);
                      }}
                      className="relative h-[calc(100dvh-30px)] w-full"
                    >
                      {!isPdfViewerLoaded && (
                        <LoadingMessage
                          message={!pdfBlob ? "Generating PDF" : "Initializing PDF viewer"}
                        />
                      )}
                    </div>
                  </div>,
                  document.body,
                )}
              </div>
              <div
                className={cn(
                  "relative flex h-full min-h-[100px] w-full flex-col items-center justify-start",
                  !isEditMode ? "" : "absolute top-[999999px] left-[999999px] z-[-999999]",
                )}
              >
                <PhotoProvider>
                  {imageUrls.map((item) => (
                    <PhotoView
                      key={`${item}${question.id}${
                        question.id &&
                        extractQuestionNumber({
                          questionId: question.id,
                        })
                      }`}
                      src={item}
                    >
                      <img
                        className={cn(
                          "relative z-2 h-full w-full max-w-[750px]! cursor-pointer object-contain",
                          imageTheme === "dark" && "invert!",
                        )}
                        src={item}
                        alt="Question image"
                        loading="lazy"
                      />
                    </PhotoView>
                  ))}
                </PhotoProvider>
                {!isEditMode && imageUrls.length > 0 && (
                  <Loader2 className="text-red absolute top-0 left-1/2 z-1 h-4 w-4 -translate-x-1/2 animate-spin" />
                )}
                {textItems.map((item, index) => (
                  <p key={`text-${index}`}>{item}</p>
                ))}
                {textItems.length === 0 && imageUrls.length === 0 && (
                  <p className="text-red-500">Error fetching resources</p>
                )}
              </div>
            </div>
          </div>
          {fullscreenContainer &&
            normalContainer &&
            createPortal(
              <PdfPortalContent portalKey={key} pdfViewerElementRef={pdfViewerElementRef} />,
              isFullscreen ? fullscreenContainer : normalContainer,
            )}
        </>
      );
    },
  ),
);

AnnotatableInspectImagesComponent.displayName = "AnnotatableInspectImagesComponent";

export const AnnotatableInspectImages = memo(AnnotatableInspectImagesComponent);

const LoadingMessage = memo(({ message }: { message: string }) => {
  return (
    <div className="text-logo-main! absolute top-2 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center gap-1">
      <span className="ml-2 text-center">{message}</span>
      <Loader />
    </div>
  );
});

LoadingMessage.displayName = "LoadingMessage";

const NotFullScreenContainer = memo(
  ({
    onRefChange,
    pdfBlob,
    isPdfViewerLoaded,
  }: {
    onRefChange: (node: HTMLDivElement | null) => void;
    pdfBlob: Blob | null;
    isPdfViewerLoaded: boolean;
  }) => {
    return (
      <div ref={onRefChange} className="relative h-[67dvh] w-full">
        {!isPdfViewerLoaded && (
          <LoadingMessage message={pdfBlob ? "Initializing PDF viewer" : "Generating PDF"} />
        )}
      </div>
    );
  },
);

NotFullScreenContainer.displayName = "NotFullScreenContainer";
