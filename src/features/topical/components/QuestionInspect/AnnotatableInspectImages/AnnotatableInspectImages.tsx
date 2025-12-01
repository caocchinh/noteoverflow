/* eslint-disable @next/next/no-img-element */
"use client";
import {
  memo,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  RefObject,
} from "react";
import {
  Loader2,
  Edit3,
  Eye,
  Maximize,
  Shrink,
  Calculator,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  convertImageToPngBase64,
  extractPaperCode,
  extractQuestionNumber,
  generatePastPaperLinks,
  splitContent,
} from "@/features/topical/lib/utils";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "@/features/topical/components/QuestionInspect/AnnotatableInspectImages/react-photo-view.css";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { createRoot, Root } from "react-dom/client";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { PDF_HEADER_LOGO_SRC } from "@/features/topical/constants/constants";
import ClearAllButton from "./ClearAllButton";
import {
  PdfViewerWrapperHandle,
  AnnotatableInspectImageProps,
  InnitPdfProps,
  AnnotatableInspectImagesHandle,
} from "@/features/topical/constants/types";
import Loader from "../../Loader/Loader";
import SaveAnnotationsButton from "./SaveAnnotationsButton";
import { toast } from "sonner";
import NonEditModeDownloadMenu from "./NonEditModeDownloadMenu";
import SingleQuestionPdfTemplate from "./SingleQuestionPdfTemplate";
import EditModeDownloadMenu from "./EditModeDownloadMenu";

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
      />
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
      [pdfViewerElementRef]
    );

    return (
      <div key={portalKey} ref={attachPdfViewer} className="w-full h-full" />
    );
  }
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
      ref
    ) => {
      const [isEditMode, setIsEditMode] = useState(false);

      useImperativeHandle(
        ref,
        () => ({
          isEditMode,
        }),
        [isEditMode]
      );
      const [isFullscreen, setIsFullscreen] = useState(false);
      const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
      const [isPdfViewerLoaded, setIsPdfViewerLoaded] = useState(false);
      const [key, setKey] = useState(0);
      const [isMounted, setIsMounted] = useState(false);
      const [currentXfdf, setCurrentXfdf] = useState<string | null>(null);

      const latestXfdfRef = useRef(currentXfdf);
      latestXfdfRef.current = currentXfdf;
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

      const pastPaperLinks = useMemo(() => {
        if (!question || !paperCode) {
          return { questionLink: "", answerLink: "" };
        }

        return generatePastPaperLinks({
          questionId: question.id,
          paperCode,
        });
      }, [question, paperCode]);

      const questionLink = pastPaperLinks.questionLink;
      const answerLink = pastPaperLinks.answerLink;

      const pdfBaseFileName = useMemo(() => {
        const sanitizedPaperCode = (paperCode || "").replace("/", "_");
        return `NoteOverflow_${sanitizedPaperCode}_Q${questionNumber || ""}`;
      }, [paperCode, questionNumber]);

      useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
      }, [isAuthenticated]);

      const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
      }, []);

      // Filter only image URLs
      const { images: imageUrls, text: textItems } = useMemo(() => {
        if (!question) return { images: [], text: [] };
        const items =
          typeOfView === "question"
            ? question.questionImages
            : question.answers;
        return splitContent(items);
      }, [question, typeOfView]);

      const generatePdfBlob = useCallback(
        async ({
          typeOfContent,
        }: {
          typeOfContent: "question" | "answer" | "question-with-answers";
        }) => {
          if (!question) return null;
          const questionItem: {
            images: string[];
            text: string[];
          } = {
            images: [],
            text: [],
          };
          const answerItem: {
            images: string[];
            text: string[];
          } = {
            images: [],
            text: [],
          };

          if (
            typeOfContent === "question" ||
            typeOfContent === "question-with-answers"
          ) {
            const { images, text } = splitContent(question.questionImages);
            questionItem.images.push(...images);
            questionItem.text.push(...text);
          }
          if (
            typeOfContent === "answer" ||
            typeOfContent === "question-with-answers"
          ) {
            const { images, text } = splitContent(question.answers);
            answerItem.images.push(...images);
            answerItem.text.push(...text);
          }

          try {
            const headerLogoPromise = convertImageToPngBase64(
              PDF_HEADER_LOGO_SRC
            ).catch((error) => {
              console.error("Failed to load header logo", error);
              return null;
            });

            const [convertedQuestionImages, convertedAnswerImages, headerLogo] =
              await Promise.all([
                Promise.all(
                  questionItem.images.map((imgUrl) =>
                    convertImageToPngBase64(imgUrl)
                  )
                ),
                Promise.all(
                  answerItem.images.map((imgUrl) =>
                    convertImageToPngBase64(imgUrl)
                  )
                ),
                headerLogoPromise,
              ]);

            // Update the items with converted images
            questionItem.images = convertedQuestionImages;
            answerItem.images = convertedAnswerImages;

            return await pdf(
              <SingleQuestionPdfTemplate
                answerLink={answerLink}
                questionItem={questionItem}
                answerItem={answerItem}
                headerLogo={headerLogo || ""}
                paperCode={paperCode}
                questionLink={questionLink}
                questionNumber={questionNumber.toString()}
              />
            ).toBlob();
          } catch (error) {
            console.error("Error generating PDF:", error);
          }
          return null;
        },
        [answerLink, paperCode, question, questionLink, questionNumber]
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
          }
          setCurrentXfdf(xfdf);
        },
        [isHavingUnsafeChangesRef, question, typeOfView]
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
                }
              },
            }
          );
        }
      }, [
        currentXfdf,
        isHavingUnsafeChangesRef,
        onSaveAnnotations,
        question,
        typeOfView,
      ]);

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
        setKey((prev) => prev + 1);
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

      useEffect(() => {
        setIsFullscreen(false);
        setIsEditMode(false);
        setPdfBlob(null);
        setTimeout(() => {
          setIsMounted(true);
        }, 0);
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
        return (
          <p className="text-center text-red-600 mt-2">
            Unable to fetch resource
          </p>
        );
      }
      return (
        <>
          <div className="flex flex-col w-full relative overflow-hidden">
            <div
              className="flex items-center justify-end mb-2 gap-2 flex-wrap"
              ref={ultilityBarRef}
            >
              {!isEditMode && (
                <NonEditModeDownloadMenu
                  pdfBaseFileName={pdfBaseFileName}
                  generatePdfBlob={generatePdfBlob}
                />
              )}
              {imageUrls.length > 0 && (
                <Button
                  type="button"
                  variant={
                    !isSavedActivitiesLoading && isSavedActivitiesError
                      ? "destructive"
                      : "outline"
                  }
                  disabled={
                    isSessionFetching ||
                    isSavedActivitiesLoading ||
                    isSavedActivitiesError
                  }
                  className="cursor-pointer gap-2 h-[26px]"
                  title={
                    isEditMode ? "Switch to view mode" : "Switch to edit mode"
                  }
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
                    hasUnsavedChanges={
                      isHavingUnsafeChangesRef.current[typeOfView]
                    }
                    isDisabled={isSessionFetching || !isPdfViewerLoaded}
                    isUserNotAuthenticated={
                      !isAuthenticated && !isSessionFetching
                    }
                  />
                  <ClearAllButton
                    pdfViewerRef={pdfViewerRef}
                    isPdfViewerLoaded={isPdfViewerLoaded}
                    isSessionFetching={isSessionFetching}
                  />
                  <EditModeDownloadMenu
                    pdfBlob={pdfBlob}
                    pdfViewerRef={pdfViewerRef}
                    isPdfViewerLoaded={isPdfViewerLoaded}
                    isSessionFetching={isSessionFetching}
                    generatePdfBlob={generatePdfBlob}
                    pdfBaseFileName={pdfBaseFileName}
                    typeOfView={typeOfView}
                  />
                  <Button
                    className="cursor-pointer h-[26px]"
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

            <div className="flex flex-col w-full items-center relative">
              <div
                className={cn(
                  !isEditMode
                    ? "absolute top-[999999px] left-[999999px] z-[-999999]"
                    : "",
                  "w-full h-full"
                )}
              >
                <NotFullScreenContainer
                  normalContainerRef={normalContainerRef}
                  pdfBlob={pdfBlob}
                  isPdfViewerLoaded={isPdfViewerLoaded}
                />
                {createPortal(
                  <div
                    className={cn(
                      "fixed inset-0 z-999998 bg-white flex flex-col h-dvh w-screen",
                      isFullscreen ? "block" : "hidden"
                    )}
                    data-pdf-viewer
                  >
                    <div className="flex items-center h-[40px] justify-between py-1 px-2 border-b border-gray-700 bg-gray-700 shrink-0">
                      <span className="text-[13px] font-medium text-gray-300 p-1">
                        NoteOverflow Inspector
                      </span>
                      <div className="flex items-center gap-2">
                        <SaveAnnotationsButton
                          onSave={handleSave}
                          isSaving={isSavingAnnotations}
                          hasUnsavedChanges={
                            isHavingUnsafeChangesRef.current[typeOfView]
                          }
                          isUserNotAuthenticated={
                            !isAuthenticated && !isSessionFetching
                          }
                          isDisabled={isSessionFetching || !isPdfViewerLoaded}
                        />
                        <ClearAllButton
                          pdfViewerRef={pdfViewerRef}
                          isPdfViewerLoaded={isPdfViewerLoaded}
                          isSessionFetching={isSessionFetching}
                        />
                        <EditModeDownloadMenu
                          pdfBlob={pdfBlob}
                          pdfViewerRef={pdfViewerRef}
                          isPdfViewerLoaded={isPdfViewerLoaded}
                          isSessionFetching={isSessionFetching}
                          generatePdfBlob={generatePdfBlob}
                          pdfBaseFileName={pdfBaseFileName}
                          typeOfView={typeOfView}
                        />
                        <Button
                          className="relative z-99998 dark:text-white text-white !hover:text-black cursor-pointer"
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                          title="Calculator"
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>

                        <Button
                          className="relative z-999999 dark:text-white text-white !hover:text-black cursor-pointer"
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
                      ref={fullscreenContainerRef}
                      className="h-[calc(100dvh-30px)] w-full relative"
                    >
                      {!isPdfViewerLoaded && (
                        <LoadingMessage
                          message={
                            !pdfBlob
                              ? "Generating PDF"
                              : "Initializing PDF viewer"
                          }
                        />
                      )}
                    </div>
                  </div>,
                  document.body
                )}
              </div>
              <div
                className={cn(
                  "w-full h-full flex items-center relative justify-center flex-col",
                  !isEditMode
                    ? ""
                    : "absolute top-[999999px] left-[999999px] z-[-999999]"
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
                          "w-full h-full object-contain relative z-2 max-w-[750px]! cursor-pointer",
                          imageTheme === "dark" && "invert!"
                        )}
                        src={item}
                        alt="Question image"
                        loading="lazy"
                      />
                    </PhotoView>
                  ))}
                </PhotoProvider>
                {!isEditMode && imageUrls.length > 0 && (
                  <Loader2 className="animate-spin absolute left-1/2 -translate-x-1/2 z-0 top-0" />
                )}
              </div>

              {textItems.map((item, index) => (
                <p key={`text-${index}`}>{item}</p>
              ))}
            </div>
          </div>
          {fullscreenContainerRef.current &&
            normalContainerRef.current &&
            createPortal(
              <PdfPortalContent
                portalKey={key}
                pdfViewerElementRef={pdfViewerElementRef}
              />,
              isFullscreen
                ? fullscreenContainerRef.current
                : normalContainerRef.current
            )}
        </>
      );
    }
  )
);

AnnotatableInspectImagesComponent.displayName =
  "AnnotatableInspectImagesComponent";

export const AnnotatableInspectImages = memo(AnnotatableInspectImagesComponent);

const LoadingMessage = memo(({ message }: { message: string }) => {
  return (
    <div className="flex items-center justify-center flex-col gap-1 absolute top-2 left-1/2 -translate-x-1/2 text-logo-main!">
      <span className="ml-2 text-center">{message}</span>
      <Loader />
    </div>
  );
});

LoadingMessage.displayName = "LoadingMessage";

const NotFullScreenContainer = memo(
  ({
    normalContainerRef,
    pdfBlob,
    isPdfViewerLoaded,
  }: {
    normalContainerRef: RefObject<HTMLDivElement | null>;
    pdfBlob: Blob | null;
    isPdfViewerLoaded: boolean;
  }) => {
    return (
      <div ref={normalContainerRef} className="w-full relative h-[67dvh]">
        {!isPdfViewerLoaded && (
          <LoadingMessage
            message={pdfBlob ? "Initializing PDF viewer" : "Generating PDF"}
          />
        )}
      </div>
    );
  }
);

NotFullScreenContainer.displayName = "NotFullScreenContainer";
