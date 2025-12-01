"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
  useState,
  memo,
} from "react";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";
import { PdfViewerWrapperHandle } from "@/features/topical/constants/types";

type AnnotationManager = WebViewerInstance["Core"]["annotationManager"];
type AnnotationChangedHandler = Parameters<
  AnnotationManager["addEventListener"]
>[1];

interface PdfViewerWrapperProps {
  documentPath: string | Blob;
  author: string | undefined;
  initialXfdf?: string | null;
  fileName: string;
  onAnnotationsChanged?: (xfdf: string) => void;
  onDocumentLoaded?: () => void;
  onUnmount?: () => void;
}

const PdfViewerWrapper = memo(
  forwardRef<PdfViewerWrapperHandle, PdfViewerWrapperProps>(
    (
      {
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
      const isInitalXfdfLoaded = useRef(false);
      const [instance, setInstance] = useState<WebViewerInstance | null>(null);

      // Keep refs for callbacks to access latest values without triggering effects
      const callbacksRef = useRef({
        onAnnotationsChanged,
        onDocumentLoaded,
        onUnmount,
      });

      useEffect(() => {
        callbacksRef.current = {
          onAnnotationsChanged,
          onDocumentLoaded,
          onUnmount,
        };
      }, [onAnnotationsChanged, onDocumentLoaded, onUnmount]);

      useImperativeHandle(
        ref,
        () => ({
          instance: instance,
          exportAnnotations: async () => {
            if (!instance) return null;
            return instance.Core.annotationManager.exportAnnotations();
          },
          exportPdfWithAnnotations: async () => {
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
        [instance]
      );

      // Initialize WebViewer
      useEffect(() => {
        if (!viewerRef.current) return;

        let isMounted = true;

        let viewerInstance: WebViewerInstance | null = null;

        WebViewer(
          {
            path: `${
              typeof window === "undefined" ? "" : window.location.origin
            }/lib/webviewer`,
            licenseKey: process.env.NEXT_PUBLIC_APRYSE_LICENSE_KEY,
          },
          viewerRef.current
        ).then((inst) => {
          if (!isMounted) return;

          viewerInstance = inst;
          setInstance(inst);

          const { documentViewer, Tools } = inst.Core;

          inst.UI.disableElements([
            "stickyToolButton",
            "highlightToolButton",
            "underlineToolButton",
            "strikeoutToolButton",
            "squigglyToolButton",
            "markReplaceTextToolButton",
            "markInsertTextToolButton",
          ]);

          // Tool setup
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
        });

        return () => {
          isMounted = false;
          setInstance(null);
          callbacksRef.current.onUnmount?.();
          isInitalXfdfLoaded.current = false;
          if (viewerInstance) {
            viewerInstance.UI.dispose();
          }
        };
      }, []);

      // Handle Author Update
      useEffect(() => {
        if (!instance) return;
        instance.Core.annotationManager.setCurrentUser(author || "Guest");
      }, [instance, author]);

      // Handle Document Loaded Listener
      useEffect(() => {
        if (!instance || isInitalXfdfLoaded.current) return;
        const { documentViewer, annotationManager } = instance.Core;

        const handleDocumentLoaded = async () => {
          if (isInitalXfdfLoaded.current) return;
          instance.UI.setZoomLevel(1.41);
          const scrollView = documentViewer.getScrollViewElement();
          if (scrollView) {
            scrollView.scrollTop = 0;
          }
          if (initialXfdf) {
            await annotationManager.importAnnotations(initialXfdf);
          }
          isInitalXfdfLoaded.current = true;
          callbacksRef.current.onDocumentLoaded?.();
        };

        documentViewer.addEventListener("documentLoaded", handleDocumentLoaded);
        return () => {
          if (!isInitalXfdfLoaded.current) {
            documentViewer.removeEventListener(
              "documentLoaded",
              handleDocumentLoaded
            );
          }
        };
      }, [instance, initialXfdf]);

      // Handle Document Load
      useEffect(() => {
        if (!instance) return;
        const isBlob = documentPath instanceof Blob;
        if (isBlob) {
          instance.UI.loadDocument(documentPath, { filename: fileName });
        }
      }, [instance, documentPath, fileName]);

      // Handle Annotation Changed Listener
      useEffect(() => {
        if (!instance) return;
        const { annotationManager } = instance.Core;

        const handleAnnotationChanged: AnnotationChangedHandler = (
          annotations,
          action,
          info
        ) => {
          if (info?.imported) return;
          const onAnnotationsChanged =
            callbacksRef.current.onAnnotationsChanged;
          if (!onAnnotationsChanged) return;
          annotationManager.exportAnnotations().then((xfdf) => {
            onAnnotationsChanged(xfdf);
          });
        };

        annotationManager.addEventListener(
          "annotationChanged",
          handleAnnotationChanged
        );

        return () => {
          annotationManager.removeEventListener(
            "annotationChanged",
            handleAnnotationChanged
          );
        };
      }, [instance]);

      return <div ref={viewerRef} style={{ height: "100%", width: "100%" }} />;
    }
  )
);

PdfViewerWrapper.displayName = "PdfViewerWrapper";

export default PdfViewerWrapper;
