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
} from "react";
import {
  Loader2,
  Edit3,
  Eye,
  Maximize,
  Shrink,
  Calculator,
  Brush,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  convertImageToPngBase64,
  extractPaperCode,
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
  Link,
  StyleSheet,
  Text,
  pdf,
} from "@react-pdf/renderer";
import { createRoot, Root } from "react-dom/client";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import type { PdfViewerWrapperHandle } from "./PdfViewerWrapper";
import { PDF_HEADER_LOGO_SRC } from "@/features/topical/constants/constants";

const PdfViewerWrapper = dynamic(() => import("./PdfViewerWrapper"), {
  ssr: false,
});

const initPdfElement = ({
  pdfBlob,
  viewerId,
  pdfViewerRef,
  pdfViewerElementRef,
  pdfViewerRootRef,
  author,
  fileName,
}: {
  pdfBlob: Blob;
  viewerId: string;
  pdfViewerRef: React.RefObject<PdfViewerWrapperHandle | null>;
  pdfViewerElementRef: React.RefObject<HTMLDivElement | null>;
  pdfViewerRootRef: React.RefObject<Root | null>;
  author: string | undefined;
  fileName: string;
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
        documentPath={pdfBlob}
        ref={pdfViewerRef}
        id={viewerId}
        author={author}
        fileName={fileName}
      />
    );
  }
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 5,
    paddingTop: 50,
    paddingBottom: 15,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingLeft: "18px",
    paddingRight: "18px",
    paddingTop: "5px",
    paddingBottom: "5px",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  branding: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 27,
    height: 27,
    objectFit: "contain",
    marginRight: "-2px",
  },
  headerText: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 9,
    color: "#475569",
    textDecoration: "none",
  },
  headerTagline: {
    fontSize: 10,
    color: "#475569",
    fontWeight: 500,
  },
  image: {
    width: "100%",
    marginBottom: 0,
  },
  pageNumber: {
    position: "absolute",
    bottom: 12,
    right: 14,
    fontSize: 8,
    color: "black",
  },
  paperCode: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "black",
  },
});

const MyDocument = ({
  images,
  headerLogo,
  paperCode,
}: {
  images: string[];
  headerLogo: string;
  paperCode: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.headerContent}>
          <View style={styles.branding}>
            <PdfImage src={headerLogo} style={styles.headerLogo} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>NoteOverflow</Text>
              <Link src="https://noteoverflow.com" style={styles.subtitle}>
                noteoverflow.com
              </Link>
            </View>
          </View>
          <Text style={styles.headerTagline}>AS & A-Level resources</Text>
        </View>
      </View>
      <View>
        {images.map((src, index) => (
          <PdfImage key={index} src={src} style={styles.image} />
        ))}
      </View>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
        fixed
      />
      <Text style={styles.paperCode} fixed>
        {paperCode}
      </Text>
    </Page>
  </Document>
);

const AnnotatableInspectImagesComponent = memo(
  ({
    imageSource,
    currentQuestionId,
    viewerId,
  }: {
    imageSource: string[] | undefined;
    currentQuestionId: string | undefined;
    viewerId: string;
  }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const pdfViewerRef = useRef<PdfViewerWrapperHandle>(null);
    const pdfViewerElementRef = useRef<HTMLDivElement | null>(null);
    const pdfViewerRootRef = useRef<Root | null>(null);
    const normalContainerRef = useRef<HTMLDivElement | null>(null);
    const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
    const { uiPreferences } = useTopicalApp();
    const { isSessionFetching, user } = useAuth();
    const { setIsCalculatorOpen, isCalculatorOpen } = useTopicalApp();
    const ultilityBarRef = useRef<HTMLDivElement | null>(null);

    const [key, setKey] = useState(0);

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

    const pdfBaseFileName = useMemo(() => {
      const sanitizedPaperCode = (paperCode || "").replace("/", "_");
      return `NoteOverflow_${sanitizedPaperCode}_Q${questionNumber || ""}`;
    }, [paperCode, questionNumber]);

    const downloadFileName = `${pdfBaseFileName}.pdf`;

    useEffect(() => {
      setIsFullscreen(false);
      setIsEditMode(false);
    }, [imageSource]);

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

    useEffect(() => {
      let active = true;

      const generatePdf = async () => {
        if (isEditMode && imageUrls.length > 0) {
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

            if (!active) return;

            const blob = await pdf(
              <MyDocument
                images={convertedImages}
                headerLogo={headerLogo || ""}
                paperCode={paperCode}
              />
            ).toBlob();
            if (!active) return;
            setPdfBlob(blob);
          } catch (error) {
            console.error("Error generating PDF:", error);
          }
        } else {
          setPdfBlob(null);
        }
      };

      generatePdf();

      return () => {
        active = false;
      };
    }, [isEditMode, imageUrls, currentQuestionId, paperCode]);

    useEffect(() => {
      if (
        !pdfBlob ||
        isSessionFetching ||
        pdfViewerRootRef.current ||
        pdfViewerElementRef.current ||
        !isEditMode
      )
        return;

      initPdfElement({
        pdfBlob,
        viewerId,
        pdfViewerRef,
        pdfViewerElementRef,
        pdfViewerRootRef,
        author: user?.name,
        fileName: pdfBaseFileName,
      });
      setKey((prev) => prev + 1);

      return () => {
        setTimeout(() => {
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
    }, [
      isSessionFetching,
      pdfBlob,
      user?.name,
      viewerId,
      imageSource,
      isEditMode,
      currentQuestionId,
      pdfBaseFileName,
    ]);

    if (!imageSource || imageSource.length === 0) {
      return (
        <p className="text-center text-red-600">Unable to fetch resource</p>
      );
    }
    return (
      <>
        <div className="flex flex-col w-full relative">
          <div
            className="flex items-center justify-end mb-2 mr-2 mt-2 gap-2"
            ref={ultilityBarRef}
          >
            <Button
              type="button"
              variant="outline"
              disabled={isSessionFetching}
              className="cursor-pointer gap-2 h-[26px]"
              title={isEditMode ? "Switch to view mode" : "Switch to edit mode"}
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
            {!isFullscreen && isEditMode && (
              <>
                <ClearAllButton
                  isSessionFetching={isSessionFetching}
                  pdfViewerRef={pdfViewerRef}
                />
                <DownloadPdfButton
                  isSessionFetching={isSessionFetching}
                  pdfBlob={pdfBlob}
                  fileName={downloadFileName}
                />
                <Button
                  className="cursor-pointer h-[26px]"
                  disabled={isSessionFetching}
                  variant="outline"
                  onClick={toggleFullscreen}
                  title="Enter Fullscreen"
                >
                  Fullscreen <Maximize className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col w-full items-center relative">
            {isEditMode ? (
              <>
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
                          isSessionFetching={isSessionFetching}
                          pdfViewerRef={pdfViewerRef}
                        />
                        <DownloadPdfButton
                          isSessionFetching={isSessionFetching}
                          pdfBlob={pdfBlob}
                          fileName={downloadFileName}
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
        {fullscreenContainerRef.current &&
          normalContainerRef.current &&
          createPortal(
            <div
              key={key}
              ref={(node) => {
                if (node && pdfViewerElementRef.current) {
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
);

AnnotatableInspectImagesComponent.displayName =
  "AnnotatableInspectImagesComponent";

// Export with memo and forwardRef
export const AnnotatableInspectImages = memo(AnnotatableInspectImagesComponent);

const ClearAllButton = memo(
  ({
    isSessionFetching,
    pdfViewerRef,
  }: {
    isSessionFetching: boolean;
    pdfViewerRef: RefObject<PdfViewerWrapperHandle | null>;
  }) => {
    return (
      <Button
        className="cursor-pointer h-[26px]"
        disabled={isSessionFetching}
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          pdfViewerRef.current?.deleteAllAnnotations();
        }}
        title="Clear all annotations"
      >
        <span>Clear all</span>
        <Brush className="h-4 w-4" />
      </Button>
    );
  }
);

ClearAllButton.displayName = "ClearAllButton";

const DownloadPdfButton = memo(
  ({
    pdfBlob,
    isSessionFetching,
    fileName,
  }: {
    pdfBlob: Blob | null;
    isSessionFetching: boolean;
    fileName: string;
  }) => {
    const handleDownload = useCallback(() => {
      if (!pdfBlob) return;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, [pdfBlob, fileName]);

    return (
      <Button
        className="cursor-pointer h-[26px]"
        disabled={!pdfBlob || isSessionFetching}
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDownload();
        }}
        title={pdfBlob ? "Download annotated PDF" : "Generating PDF"}
      >
        <span>Download</span>
        <Download className="h-4 w-4" />
      </Button>
    );
  }
);

DownloadPdfButton.displayName = "DownloadPdfButton";
