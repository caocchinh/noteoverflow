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
import { Loader2, Edit3, Eye } from "lucide-react";
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
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  ThumbnailView,
  Annotation,
  Inject,
} from "@syncfusion/ej2-react-pdfviewer";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-react-pdfviewer/styles/material.css";
import { useAuth } from "@/context/AuthContext";

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

// Define the ref type for the component
export interface AnnotatableInspectImagesHandle {
  updatePdfViewerSize: () => void;
}

const AnnotatableInspectImagesComponent = forwardRef<
  AnnotatableInspectImagesHandle,
  {
    imageSource: string[] | undefined;
    currentQuestionId: string | undefined;
    viewerId: string;
  }
>(({ imageSource, currentQuestionId, viewerId }, ref) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const pdfViewerRef = useRef<PdfViewerComponent>(null);
  const { uiPreferences } = useTopicalApp();
  const { user } = useAuth();

  // Extract resize logic into a reusable function
  const updatePdfViewerSize = useCallback(() => {
    if (pdfViewerRef.current && isEditMode) {
      // Update viewer container dimensions without remounting
      pdfViewerRef.current.updateViewerContainer();
    }
  }, [isEditMode]);

  // Expose the function to parent components via ref
  useImperativeHandle(ref, () => ({
    updatePdfViewerSize,
  }));

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

  // Automatically open the annotation toolbar when PDF is loaded
  useEffect(() => {
    if (pdfUrl && pdfViewerRef.current) {
      // Small delay to ensure the viewer is fully initialized
      const timer = setTimeout(() => {
        // Access the toolbar property to show the annotation toolbar
        pdfViewerRef.current?.toolbar.showAnnotationToolbar(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pdfUrl]);

  // Handle window resize to update PDF viewer dimensions without losing state
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize to avoid excessive updates
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updatePdfViewerSize();
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [isEditMode]);

  if (!imageSource || imageSource.length === 0) {
    return <p className="text-center text-red-600">Unable to fetch resource</p>;
  }
  return (
    <div className="flex flex-col w-full relative">
      {/* Edit Mode Toggle */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {isEditMode ? "Edit Mode" : "View Mode"}
          </p>
          {isEditMode && (
            <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
              Draw on images to annotate
            </span>
          )}
        </div>
        <Button
          type="button"
          variant={isEditMode ? "default" : "outline"}
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

      {/* Loading indicator */}
      {!isEditMode && imageUrls.length > 0 && (
        <Loader2 className="animate-spin absolute left-1/2 -translate-x-1/2 z-0 top-0" />
      )}

      {/* Image Display */}
      <div className="flex flex-col w-full items-center">
        {isEditMode ? (
          // Edit Mode: Show Syncfusion PDF Viewer
          <div className="h-[800px] w-full relative">
            {pdfUrl ? (
              <>
                {/* <div className="absolute top-0 right-0 z-50 bg-white p-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open PDF Blob
                    </a>
                  </div> */}
                <PdfViewerComponent
                  ref={pdfViewerRef}
                  id={viewerId}
                  documentPath={pdfUrl}
                  resourceUrl="http://localhost:3000/ej2-pdfviewer-lib"
                  enableToolbar={true}
                  enableNavigationToolbar={true}
                  enableAnnotationToolbar={true}
                  enableDownload={true}
                  enableBookmark={false}
                  enableThumbnail={true}
                  toolbarSettings={{
                    showTooltip: true,
                    toolbarItems: [
                      "PageNavigationTool",
                      "MagnificationTool",
                      "PanTool",
                      "DownloadOption",
                      "UndoRedoTool",
                      "AnnotationEditTool",
                    ],
                  }}
                  enableTextMarkupAnnotation={false}
                  annotationSettings={{
                    author: user?.name || "Guest",
                  }}
                  arrowSettings={{
                    lineHeadStartStyle: "None",
                    lineHeadEndStyle: "Open",
                  }}
                  measurementSettings={{
                    conversionUnit: "cm",
                    displayUnit: "cm",
                    scaleRatio: 1,
                  }}
                  style={{ height: "100%" }}
                >
                  <Inject
                    services={[
                      Toolbar,
                      Magnification,
                      Navigation,
                      ThumbnailView,
                      Annotation,
                    ]}
                  />
                </PdfViewerComponent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-8 w-8" />
                <span className="ml-2">Generating PDF...</span>
              </div>
            )}
          </div>
        ) : (
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
        )}

        {textItems.map((item, index) => (
          <p key={`text-${index}`}>{item}</p>
        ))}
      </div>
    </div>
  );
});

AnnotatableInspectImagesComponent.displayName =
  "AnnotatableInspectImagesComponent";

// Export with memo and forwardRef
export const AnnotatableInspectImages = memo(AnnotatableInspectImagesComponent);
