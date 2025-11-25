import {
  memo,
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";

type AnnotationManager = WebViewerInstance["Core"]["annotationManager"];
type AnnotationChangedHandler = Parameters<
  AnnotationManager["addEventListener"]
>[1];

interface PdfViewerWrapperProps {
  id: string;
  documentPath: string | Blob;
  author: string | undefined;
  initialXfdf?: string | null;
  fileName: string;
  onAnnotationsChanged?: (xfdf: string) => void;
  onDocumentLoaded?: () => void;
  onUnmount?: () => void;
}

export interface PdfViewerWrapperHandle {
  instance: WebViewerInstance | null;
  exportAnnotations: () => Promise<string | null>;
  exportPdfWithAnnotations: () => Promise<Blob | null>;
  deleteAllAnnotations: () => void;
}

const PdfViewerWrapper = forwardRef<
  PdfViewerWrapperHandle,
  PdfViewerWrapperProps
>(
  (
    {
      id,
      documentPath,
      author,
      initialXfdf,
      onAnnotationsChanged,
      fileName,
      onDocumentLoaded,
      onUnmount,
    },
    ref
  ) => {
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<WebViewerInstance | null>(null);
    const isMountedRef = useRef(false);

    useImperativeHandle(
      ref,
      () => ({
        instance: instanceRef.current,
        exportAnnotations: async () => {
          const instance = instanceRef.current;
          if (!instance) return null;
          return instance.Core.annotationManager.exportAnnotations();
        },
        exportPdfWithAnnotations: async () => {
          const instance = instanceRef.current;
          if (!instance) return null;

          const { documentViewer, annotationManager } = instance.Core;
          const doc = documentViewer.getDocument();
          if (!doc) return null;

          const xfdfString = await annotationManager.exportAnnotations();
          const data = await doc.getFileData({ xfdfString });
          const arr = new Uint8Array(data);
          return new Blob([arr], { type: "application/pdf" });
        },
        deleteAllAnnotations: () => {
          const instance = instanceRef.current;
          if (!instance) {
            return;
          }
          setTimeout(() => {
            const { annotationManager } = instance.Core;
            const allAnnotations = annotationManager.getAnnotationsList();
            if (allAnnotations.length > 0) {
              annotationManager.deleteAnnotations(allAnnotations, {
                force: true,
              });
            }
          }, 0);
        },
      }),
      []
    );

    useEffect(() => {
      if (!viewerRef.current || isMountedRef.current) return;

      let detachListeners: (() => void) | undefined;
      const isBlob = documentPath instanceof Blob;

      WebViewer(
        {
          path: "http://localhost:3000/lib/webviewer",
          licenseKey: process.env.NEXT_PUBLIC_APRYSE_LICENSE_KEY,
        },
        viewerRef.current
      ).then((instance) => {
        isMountedRef.current = true;
        instanceRef.current = instance;

        const { documentViewer, annotationManager } = instance.Core;

        instance.UI.disableElements([
          "stickyToolButton",
          "highlightToolButton",
          "underlineToolButton",
          "strikeoutToolButton",
          "squigglyToolButton",
          "markReplaceTextToolButton",
          "markInsertTextToolButton",
        ]);

        annotationManager.setCurrentUser(author || "Guest");

        if (isBlob) {
          instance.UI.loadDocument(documentPath, { filename: fileName });
        }

        const { Tools } = instance.Core;
        interface CreateToolWithDelay {
          setCreateDelay: (delay: number) => void;
        }
        const freeHandTool = documentViewer.getTool(
          Tools.ToolNames.FREEHAND
        ) as unknown as CreateToolWithDelay;
        if (freeHandTool) {
          freeHandTool.setCreateDelay(0);
        }

        const freeHandHighlightTool = documentViewer.getTool(
          Tools.ToolNames.FREEHAND_HIGHLIGHT
        ) as unknown as CreateToolWithDelay;
        if (freeHandHighlightTool && freeHandHighlightTool.setCreateDelay) {
          freeHandHighlightTool.setCreateDelay(0);
        }

        const handleDocumentLoaded = async () => {
          if (!isMountedRef.current) return;
          if (initialXfdf) {
            await annotationManager.importAnnotations(initialXfdf);
          } else {
            instance.UI.setFitMode(instance.UI.FitMode.FitWidth);
            const scrollView = documentViewer.getScrollViewElement();
            if (scrollView) {
              scrollView.scrollTop = 0;
            }
          }
          onDocumentLoaded?.();
        };

        const handleAnnotationChanged: AnnotationChangedHandler = () => {
          if (!isMountedRef.current) return;
          if (!onAnnotationsChanged) return;
          annotationManager.exportAnnotations().then((xfdf) => {
            if (!isMountedRef.current) return;
            onAnnotationsChanged(xfdf);
          });
        };

        documentViewer.addEventListener("documentLoaded", handleDocumentLoaded);
        annotationManager.addEventListener(
          "annotationChanged",
          handleAnnotationChanged
        );

        detachListeners = () => {
          documentViewer.removeEventListener(
            "documentLoaded",
            handleDocumentLoaded
          );
          annotationManager.removeEventListener(
            "annotationChanged",
            handleAnnotationChanged
          );
        };
      });

      return () => {
        isMountedRef.current = false;
        detachListeners?.();
        detachListeners = undefined;
        instanceRef.current = null;
        onUnmount?.();
      };
    }, [
      documentPath,
      author,
      initialXfdf,
      onAnnotationsChanged,
      fileName,
      onDocumentLoaded,
      onUnmount,
    ]);

    return (
      <div id={id} ref={viewerRef} style={{ height: "100%", width: "100%" }} />
    );
  }
);

PdfViewerWrapper.displayName = "PdfViewerWrapper";

export default memo(PdfViewerWrapper);
