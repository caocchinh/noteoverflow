/* eslint-disable @next/next/no-img-element */
"use client";
import {
  memo,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  RefObject,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Loader2,
  Edit3,
  Eye,
  Maximize,
  Shrink,
  Calculator,
  Download,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  convertImageToPngBase64,
  extractPaperCode,
  extractQuestionNumber,
  extractSeasonFromPaperCode,
  extractYearFromPaperCode,
  parsePastPaperUrl,
  handleDownloadPdf,
} from "@/features/topical/lib/utils";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "@/features/topical/components/QuestionInspect/AnnotatableInspectImages/react-photo-view.css";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { createRoot, Root } from "react-dom/client";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { PDF_HEADER_LOGO_SRC } from "@/features/topical/constants/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuestionPdfTemplate from "./QuestionPdfTemplate";
import DownloadWithAnnotationsButton from "./DownloadWithAnnotationsButton";
import DownloadOrginalButton from "./DownloadOrginalButton";
import ClearAllButton from "./ClearAllButton";
import { saveAnnotationsAction } from "@/features/topical/server/actions";
import { toast } from "sonner";
import {
  PdfViewerWrapperHandle,
  AnnotatableInspectImageProps,
  InnitPdfProps,
  AnnotatableInspectImagesHandle,
} from "@/features/topical/constants/types";

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

const DownloadQuestionButton = memo(
  ({
    onGeneratePdf,
    pdfBaseFileName,
  }: {
    onGeneratePdf: () => Promise<Blob | null>;
    pdfBaseFileName: string;
  }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = useCallback(async () => {
      setIsGenerating(true);
      try {
        const blob = await onGeneratePdf();
        handleDownloadPdf(blob, pdfBaseFileName);
      } finally {
        setIsGenerating(false);
      }
    }, [onGeneratePdf, pdfBaseFileName]);

    return (
      <Button
        className="cursor-pointer h-[26px]"
        variant="outline"
        onClick={handleDownload}
        disabled={isGenerating}
        title="Download question"
      >
        {isGenerating ? (
          <>
            <span className="hidden sm:block">Generating</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            <span className="hidden sm:block">Download</span>
            <Download className="h-4 w-4" />
          </>
        )}
      </Button>
    );
  }
);

DownloadQuestionButton.displayName = "DownloadQuestionButton";

const AnnotatableInspectImagesComponent = memo(
  forwardRef<AnnotatableInspectImagesHandle, AnnotatableInspectImageProps>(
    (
      {
        imageSource,
        currentQuestionId,
        isSessionFetching,
        userName,
        typeOfView,
        setIsCalculatorOpen,
        isCalculatorOpen,
        imageTheme,
        initialXfdf,
        isSavedActivitiesLoading,
        isSavedActivitiesError,
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

      const pdfViewerRef = useRef<PdfViewerWrapperHandle>(null);
      const pdfViewerElementRef = useRef<HTMLDivElement | null>(null);
      const pdfViewerRootRef = useRef<Root | null>(null);
      const normalContainerRef = useRef<HTMLDivElement | null>(null);
      const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
      const ultilityBarRef = useRef<HTMLDivElement | null>(null);

      // Auto-save state
      const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

      const paperCode = useMemo(
        () =>
          extractPaperCode({
            questionId: currentQuestionId || "",
          }),
        [currentQuestionId]
      );

      const questionNumber = useMemo(
        () =>
          extractQuestionNumber({
            questionId: currentQuestionId || "",
          }),
        [currentQuestionId]
      );

      const questionLink = useMemo(() => {
        if (!currentQuestionId || !paperCode) return "";

        const season = extractSeasonFromPaperCode({ paperCode });
        const year = extractYearFromPaperCode({ paperCode });

        if (!season || !year) return "";

        return parsePastPaperUrl({
          questionId: currentQuestionId,
          year,
          season,
          type: "qp", // question paper
        });
      }, [currentQuestionId, paperCode]);

      const pdfBaseFileName = useMemo(() => {
        const sanitizedPaperCode = (paperCode || "").replace("/", "_");
        return `NoteOverflow_${sanitizedPaperCode}_Q${questionNumber || ""}`;
      }, [paperCode, questionNumber]);

      const downloadFileName = `${pdfBaseFileName}.pdf`;

      useEffect(() => {
        if (isEditMode) {
          ultilityBarRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }, [isEditMode]);

      const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
      }, []);

      // Filter only image URLs
      const imageUrls = useMemo(
        () => imageSource?.filter((item) => item.includes("http")) || [],
        [imageSource]
      );
      const textItems = useMemo(
        () => imageSource?.filter((item) => !item.includes("http")) || [],
        [imageSource]
      );

      const generatePdfBlob = useCallback(async () => {
        if (imageUrls.length > 0) {
          try {
            const headerLogoPromise = convertImageToPngBase64(
              PDF_HEADER_LOGO_SRC
            ).catch((error) => {
              console.error("Failed to load header logo", error);
              return null;
            });

            const [convertedImages, headerLogo] = await Promise.all([
              Promise.all(
                imageUrls.map((imgUrl) => convertImageToPngBase64(imgUrl))
              ),
              headerLogoPromise,
            ]);

            return await pdf(
              <QuestionPdfTemplate
                images={convertedImages}
                headerLogo={headerLogo || ""}
                paperCode={paperCode}
                questionLink={questionLink}
                questionNumber={questionNumber.toString()}
              />
            ).toBlob();
          } catch (error) {
            console.error("Error generating PDF:", error);
          }
        } else {
          return null;
        }
        return null;
      }, [imageUrls, paperCode, questionNumber, questionLink]);

      useEffect(() => {
        let isActive = true;

        const generate = async () => {
          if (isActive && !pdfBlob && isEditMode) {
            const blob = await generatePdfBlob();
            setPdfBlob(blob);
          }
        };

        setTimeout(generate, 0);

        return () => {
          isActive = false;
        };
      }, [generatePdfBlob, isEditMode, pdfBlob]);

      // Handle annotations changed callback
      const handleAnnotationsChanged = useCallback((xfdf: string) => {
        setCurrentXfdf(xfdf);
      }, []);

      // Debounced auto-save effect
      useEffect(() => {
        if (
          !currentXfdf ||
          !currentQuestionId ||
          !isEditMode ||
          !isMounted ||
          !isPdfViewerLoaded
        )
          return;

        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        autoSaveTimeoutRef.current = setTimeout(async () => {
          try {
            const result = await saveAnnotationsAction({
              questionId: currentQuestionId,
              ...(typeOfView === "question"
                ? { questionXfdf: currentXfdf || undefined }
                : { answerXfdf: currentXfdf || undefined }),
            });

            if (result.success) {
              toast.success("Annotations saved", { duration: 2000 });
            } else {
              toast.error("Failed to save annotations");
            }
          } catch (error) {
            console.error("Error saving annotations:", error);
            toast.error("Failed to save annotations");
          }
        }, 5000);

        return () => {
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
          }
        };
      }, [
        currentXfdf,
        currentQuestionId,
        isEditMode,
        isMounted,
        isPdfViewerLoaded,
        typeOfView,
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
      }, [imageSource]);

      if (!imageSource || imageSource.length === 0) {
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
                <DownloadQuestionButton
                  onGeneratePdf={generatePdfBlob}
                  pdfBaseFileName={pdfBaseFileName}
                />
              )}
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
                        <Eye className="h-4 w-4" />
                        View Mode
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4" />
                        Edit Mode
                      </>
                    )}
                  </>
                )}
              </Button>
              {!isFullscreen && isEditMode && (
                <>
                  <ClearAllButton
                    pdfViewerRef={pdfViewerRef}
                    isPdfViewerLoaded={isPdfViewerLoaded}
                    isSessionFetching={isSessionFetching}
                  />
                  <DownloadPdfButton
                    pdfBlob={pdfBlob}
                    fileName={downloadFileName}
                    pdfViewerRef={pdfViewerRef}
                    isPdfViewerLoaded={isPdfViewerLoaded}
                    isSessionFetching={isSessionFetching}
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
                <div
                  ref={normalContainerRef}
                  className="w-full relative h-[72dvh]"
                >
                  {!pdfBlob && (
                    <div className="flex items-center justify-center gap-1">
                      <span className="ml-2">Generating PDF</span>
                      <Loader2 className="animate-spin h-6 w-6" />
                    </div>
                  )}
                </div>
                {createPortal(
                  <div
                    className={cn(
                      "fixed inset-0 z-[999998] bg-white flex flex-col h-[100dvh] w-[100vw]",
                      isFullscreen ? "block" : "hidden"
                    )}
                  >
                    <div className="flex items-center h-[40px] justify-between py-1 px-2 border-b border-gray-700 bg-gray-700 shrink-0">
                      <span className="text-sm font-medium text-gray-300">
                        NoteOverflow Inspector
                      </span>
                      <div className="flex items-center gap-1">
                        <ClearAllButton
                          pdfViewerRef={pdfViewerRef}
                          isPdfViewerLoaded={isPdfViewerLoaded}
                          isSessionFetching={isSessionFetching}
                        />
                        <DownloadPdfButton
                          pdfBlob={pdfBlob}
                          fileName={downloadFileName}
                          pdfViewerRef={pdfViewerRef}
                          isPdfViewerLoaded={isPdfViewerLoaded}
                          isSessionFetching={isSessionFetching}
                        />
                        <Button
                          className="relative z-[99998] dark:text-white text-white !hover:text-black cursor-pointer"
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                          title="Calculator"
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>

                        <Button
                          className="relative z-[999999] dark:text-white text-white !hover:text-black cursor-pointer"
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
                      className="h-[calc(100dvh-30px)] w-full"
                    ></div>
                  </div>,
                  document.body
                )}
              </div>
              <div
                className={cn(
                  "w-full h-full flex items-center justify-center flex-col",
                  !isEditMode
                    ? ""
                    : "absolute top-[999999px] left-[999999px] z-[-999999]"
                )}
              >
                <PhotoProvider>
                  {imageUrls.map((item) => (
                    <PhotoView
                      key={`${item}${currentQuestionId}${
                        currentQuestionId &&
                        extractQuestionNumber({
                          questionId: currentQuestionId,
                        })
                      }`}
                      src={item}
                    >
                      <img
                        className={cn(
                          "w-full h-full object-contain relative z-2 !max-w-[750px] cursor-pointer",
                          imageTheme === "dark" && "!invert"
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
              <div
                key={key}
                ref={(node) => {
                  if (
                    node &&
                    pdfViewerElementRef.current &&
                    pdfViewerElementRef.current.parentNode !== node
                  ) {
                    node.appendChild(pdfViewerElementRef.current);
                  }
                }}
                className="w-full h-full"
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

// Export with memo and forwardRef
export const AnnotatableInspectImages = memo(AnnotatableInspectImagesComponent);

const DownloadPdfButton = memo(
  ({
    pdfBlob,
    fileName,
    pdfViewerRef,
    isPdfViewerLoaded,
    isSessionFetching,
  }: {
    pdfBlob: Blob | null;
    fileName: string;
    pdfViewerRef: RefObject<PdfViewerWrapperHandle | null>;
    isPdfViewerLoaded: boolean;
    isSessionFetching: boolean;
  }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="cursor-pointer h-[26px]"
            disabled={!pdfBlob || isSessionFetching}
            variant="outline"
          >
            <span className="hidden sm:block">Download</span>
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[999998] flex flex-col dark:bg-accent p-2 gap-2">
          <DownloadOrginalButton
            pdfBlob={pdfBlob}
            fileName={fileName}
            isSessionFetching={isSessionFetching}
          />
          <DownloadWithAnnotationsButton
            fileName={fileName}
            isPdfViewerLoaded={isPdfViewerLoaded}
            pdfViewerRef={pdfViewerRef}
            isSessionFetching={isSessionFetching}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

DownloadPdfButton.displayName = "DownloadPdfButton";
