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
  onAnnotationsChanged?: (xfdf: string) => void;
}

export interface PdfViewerWrapperHandle {
  instance: WebViewerInstance | null;
  exportAnnotations: () => Promise<string | null>;
  deleteAllAnnotations: () => void;
}

const PdfViewerWrapper = forwardRef<
  PdfViewerWrapperHandle,
  PdfViewerWrapperProps
>(({ id, documentPath, author, initialXfdf, onAnnotationsChanged }, ref) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<WebViewerInstance | null>(null);

  useImperativeHandle(ref, () => ({
    instance: instanceRef.current,
    exportAnnotations: async () => {
      const instance = instanceRef.current;
      if (!instance) return null;
      return instance.Core.annotationManager.exportAnnotations();
    },
    deleteAllAnnotations: () => {
      const instance = instanceRef.current;
      if (!instance) {
        console.warn("deleteAllAnnotations: instance not ready");
        return;
      }
      setTimeout(() => {
        const { annotationManager } = instance.Core;
        const allAnnotations = annotationManager.getAnnotationsList();
        if (allAnnotations.length > 0) {
          annotationManager.deleteAnnotations(allAnnotations, { force: true });
        }
      }, 0);
    },
  }));

  useEffect(() => {
    if (!viewerRef.current) return;

    let mounted = true;
    let detachListeners: (() => void) | undefined;
    const isBlob = documentPath instanceof Blob;

    WebViewer(
      {
        path: "http://localhost:3000/lib/webviewer",
        licenseKey: process.env.NEXT_PUBLIC_APRYSE_LICENSE_KEY,
      },
      viewerRef.current
    ).then((instance) => {
      if (!mounted) return;
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
        instance.UI.loadDocument(documentPath, { filename: "document.pdf" });
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
        if (initialXfdf) {
          await annotationManager.importAnnotations(initialXfdf);
        } else {
          instance.UI.setFitMode(instance.UI.FitMode.FitWidth);
          const scrollView = documentViewer.getScrollViewElement();
          if (scrollView) {
            scrollView.scrollTop = 0;
          }
        }
      };

      const handleAnnotationChanged: AnnotationChangedHandler = () => {
        if (!onAnnotationsChanged) return;
        annotationManager.exportAnnotations().then((xfdf) => {
          if (!mounted) return;
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
      mounted = false;
      detachListeners?.();
      detachListeners = undefined;
      instanceRef.current = null;
    };
  }, [documentPath, author, initialXfdf, onAnnotationsChanged]);

  return (
    <div id={id} ref={viewerRef} style={{ height: "100%", width: "100%" }} />
  );
});

PdfViewerWrapper.displayName = "PdfViewerWrapper";

export default memo(PdfViewerWrapper);
