/* eslint-disable @next/next/no-img-element */
"use client";
import {
  memo,
  useState,
  useEffect,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import {
  Loader2,
  Edit3,
  Eye,
  Maximize,
  Shrink,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  convertImageToPngBase64,
  extractQuestionNumber,
} from "@/features/topical/lib/utils";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "@/features/topical/components/QuestionInspect/AnnotatableInspectImages/react-photo-view.css";
import { Button } from "@/components/ui/button";
import {
  Document,
  Page,
  Image as PdfImage,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { PdfViewerComponent } from "@syncfusion/ej2-react-pdfviewer";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-react-pdfviewer/styles/material.css";
import { createRoot, Root } from "react-dom/client";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import PdfViewerWrapper from "./PdfViewerWrapper";

const initPdfElement = ({
  pdfUrl,
  viewerId,
  pdfViewerRef,
  pdfViewerElementRef,
  pdfViewerRootRef,
  author,
}: {
  pdfUrl: string;
  viewerId: string;
  pdfViewerRef: React.RefObject<PdfViewerComponent | null>;
  pdfViewerElementRef: React.RefObject<HTMLDivElement | null>;
  pdfViewerRootRef: React.RefObject<Root | null>;
  author: string | undefined;
}) => {
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
        documentPath={pdfUrl}
        ref={pdfViewerRef}
        id={viewerId}
        author={author}
      />
    );
  }
};

const PdfViewer = memo(
  ({
    pdfViewerRef,
    pdfUrl,
    viewerId,
    pdfViewerElementRef,
    pdfViewerRootRef,
  }: {
    pdfViewerRef: React.RefObject<PdfViewerComponent | null>;
    pdfUrl: string;
    viewerId: string;
    pdfViewerElementRef: React.RefObject<HTMLDivElement | null>;
    pdfViewerRootRef: React.RefObject<Root | null>;
  }) => {
    const { user } = useAuth();
    useEffect(() => {
      initPdfElement({
        pdfUrl,
        viewerId,
        pdfViewerRef,
        pdfViewerElementRef,
        pdfViewerRootRef,
        author: user?.name,
      });
    }, [
      pdfUrl,
      viewerId,
      pdfViewerRef,
      pdfViewerElementRef,
      pdfViewerRootRef,
      user?.name,
    ]);

    return null;
  }
);

PdfViewer.displayName = "PdfViewer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 10,
  },
  image: {
    width: "100%",
    marginBottom: 10,
  },
});

const MyDocument = ({ images }: { images: string[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        {images.map((src, index) => (
          <PdfImage key={index} src={src} style={styles.image} />
        ))}
      </View>
    </Page>
  </Document>
);

const AnnotatableInspectImagesComponent = forwardRef(
  (
    {
      imageSource,
      currentQuestionId,
      viewerId,
    }: {
      imageSource: string[] | undefined;
      currentQuestionId: string | undefined;
      viewerId: string;
    },
    ref
  ) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const pdfViewerRef = useRef<PdfViewerComponent>(null);
    const pdfViewerElementRef = useRef<HTMLDivElement | null>(null);
    const pdfViewerRootRef = useRef<Root | null>(null);
    const { uiPreferences } = useTopicalApp();
    const { isSessionFetching } = useAuth();
    const { setIsCalculatorOpen, isCalculatorOpen } = useTopicalApp();

    const updatePdfViewerSize = useCallback(() => {
      if (pdfViewerRef.current && isEditMode) {
        pdfViewerRef.current.updateViewerContainer();
      }
    }, [isEditMode]);
    const normalContainerRef = useRef<HTMLDivElement | null>(null);
    const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);

    const toggleFullscreen = useCallback(() => {
      setIsFullscreen((prev) => !prev);
      setTimeout(() => {
        updatePdfViewerSize();
      }, 0);
    }, [updatePdfViewerSize]);

    useImperativeHandle(
      ref,
      () => ({
        updatePdfViewerSize,
      }),
      [updatePdfViewerSize]
    );

    // Filter only image URLs
    const imageUrls = useMemo(
      () => imageSource?.filter((item) => item.includes("http")) || [],
      [imageSource]
    );
    const textItems = useMemo(
      () => imageSource?.filter((item) => !item.includes("http")) || [],
      [imageSource]
    );

    useEffect(() => {
      let active = true;
      let url: string | null = null;

      const generatePdf = async () => {
        if (isEditMode && imageUrls.length > 0) {
          try {
            console.log("Generating PDF...");
            const convertedImages = await Promise.all(
              imageUrls.map((imgUrl) => convertImageToPngBase64(imgUrl))
            );

            if (!active) return;

            const blob = await pdf(
              <MyDocument images={convertedImages} />
            ).toBlob();
            if (!active) return;
            url = URL.createObjectURL(blob);
            console.log("PDF Generated:", url);
            setPdfUrl(url);
          } catch (error) {
            console.error("Error generating PDF:", error);
          }
        } else {
          setPdfUrl(null);
        }
      };

      generatePdf();

      return () => {
        active = false;
        if (url) {
          console.log("Revoking PDF URL:", url);
          URL.revokeObjectURL(url);
        }
      };
    }, [isEditMode, imageUrls]);

    useEffect(() => {
      if (pdfUrl && pdfViewerRef.current) {
        const timer = setTimeout(() => {
          pdfViewerRef.current?.toolbar.showAnnotationToolbar(true);
          pdfViewerRef.current?.toolbar.showToolbar(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [pdfUrl]);

    // Move pdf editor between containers when fullscreen state changes
    useEffect(() => {
      if (
        pdfViewerElementRef.current &&
        fullscreenContainerRef.current &&
        normalContainerRef.current &&
        isEditMode &&
        pdfUrl
      ) {
        const targetContainer = isFullscreen
          ? fullscreenContainerRef.current
          : normalContainerRef.current;

        if (
          targetContainer &&
          pdfViewerElementRef.current.parentElement !== targetContainer
        ) {
          targetContainer.appendChild(pdfViewerElementRef.current);
        }
      }
    }, [isFullscreen, isEditMode, pdfUrl]);

    if (!imageSource || imageSource.length === 0) {
      return (
        <p className="text-center text-red-600">Unable to fetch resource</p>
      );
    }
    return (
      <div className="flex flex-col w-full relative">
        <div className="flex items-center justify-end pb-2 mr-2">
          <Button
            type="button"
            variant={isEditMode ? "default" : "outline"}
            disabled={isSessionFetching}
            className="cursor-pointer gap-2"
            onClick={() => setIsEditMode(!isEditMode)}
          >
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
          </Button>
        </div>
        {!isFullscreen && (
          <Button
            className="absolute top-2 right-14 z-[999] bg-white/80 hover:bg-white text-black border border-gray-200 shadow-sm"
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            title="Enter Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        )}

        <div className="flex flex-col w-full items-center relative">
          {isEditMode ? (
            <>
              <div ref={normalContainerRef} className="w-full relative ">
                {pdfUrl ? (
                  <div className="flex-1 relative h-full w-full overflow-hidden"></div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin h-8 w-8" />
                    <span className="ml-2">Generating PDF...</span>
                  </div>
                )}
                {!isFullscreen && pdfUrl && (
                  <PdfViewer
                    pdfViewerRef={pdfViewerRef}
                    pdfUrl={pdfUrl}
                    viewerId={viewerId}
                    pdfViewerElementRef={pdfViewerElementRef}
                    pdfViewerRootRef={pdfViewerRootRef}
                  />
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
                  <div ref={fullscreenContainerRef} className="h-full w-full">
                    {pdfUrl && isFullscreen && (
                      <PdfViewer
                        pdfViewerRef={pdfViewerRef}
                        pdfUrl={pdfUrl}
                        viewerId={viewerId}
                        pdfViewerElementRef={pdfViewerElementRef}
                        pdfViewerRootRef={pdfViewerRootRef}
                      />
                    )}
                  </div>
                </div>,
                document.body
              )}
            </>
          ) : (
            <>
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
                        uiPreferences.imageTheme === "dark" && "!invert"
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
            </>
          )}

          {textItems.map((item, index) => (
            <p key={`text-${index}`}>{item}</p>
          ))}
        </div>
      </div>
    );
  }
);

AnnotatableInspectImagesComponent.displayName =
  "AnnotatableInspectImagesComponent";

// Export with memo and forwardRef
export const AnnotatableInspectImages = memo(AnnotatableInspectImagesComponent);
