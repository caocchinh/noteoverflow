import {
  memo,
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";

interface PdfViewerWrapperProps {
  id: string;
  documentPath: string | Blob;
  author: string | undefined;
}

export interface PdfViewerWrapperHandle {
  instance: WebViewerInstance | null;
}

const PdfViewerWrapper = forwardRef<
  PdfViewerWrapperHandle,
  PdfViewerWrapperProps
>(({ id, documentPath, author }, ref) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<WebViewerInstance | null>(null);

  useImperativeHandle(ref, () => ({
    instance: instanceRef.current,
  }));

  useEffect(() => {
    if (!viewerRef.current) return;

    const isBlob = documentPath instanceof Blob;

    WebViewer(
      {
        path: "http://localhost:3000/lib/webviewer",
        ...(isBlob ? {} : { initialDoc: documentPath }),
        licenseKey: process.env.NEXT_PUBLIC_APRYSE_LICENSE_KEY,
      },
      viewerRef.current
    ).then((instance) => {
      instanceRef.current = instance;

      const { documentViewer, annotationManager } = instance.Core;

      // Set annotation author
      annotationManager.setCurrentUser(author || "Guest");

      // Configure toolbar
      instance.UI.setToolbarGroup("toolbarGroup-Annotate");

      // Disable text markup annotations if needed
      instance.UI.disableElements([
        "highlightToolGroupButton",
        "underlineToolGroupButton",
        "strikeoutToolGroupButton",
        "squigglyToolGroupButton",
      ]);

      // If documentPath is a Blob, load it using loadDocument
      if (isBlob) {
        console.log("Loading PDF from Blob...");
        instance.UI.loadDocument(documentPath, { filename: "document.pdf" });
      }

      // Configure measurement tools with cm units
      documentViewer.addEventListener("documentLoaded", () => {
        const pageInfo = documentViewer.getDocument().getPageInfo(1);
        const scale = pageInfo.width / 21; // A4 width in cm

        // Set default scale for measurement tools
        const measurementScale = [
          [scale, "cm"],
          [1, "cm"],
        ];

        // Apply scale to measurement annotation tools
        const toolsToUpdate = [
          "AnnotationCreateDistanceMeasurement",
          "AnnotationCreatePerimeterMeasurement",
          "AnnotationCreateAreaMeasurement",
        ];

        toolsToUpdate.forEach((toolName) => {
          const tool = instance.Core.documentViewer.getTool(toolName);
          if (tool && typeof tool.setStyles === "function") {
            tool.setStyles({
              Scale: measurementScale,
              Precision: 0.01,
            });
          }
        });
      });

      // Enable download
      instance.UI.enableFeatures([instance.UI.Feature.Download]);
    });

    return () => {
      instanceRef.current = null;
    };
  }, [documentPath, author]);

  return (
    <div id={id} ref={viewerRef} style={{ height: "100%", width: "100%" }} />
  );
});

PdfViewerWrapper.displayName = "PdfViewerWrapper";

export default memo(PdfViewerWrapper);
