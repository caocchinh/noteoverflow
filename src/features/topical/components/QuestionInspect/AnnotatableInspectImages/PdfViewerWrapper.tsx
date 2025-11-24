import { memo, forwardRef } from "react";
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  ThumbnailView,
  Annotation,
  Inject,
} from "@syncfusion/ej2-react-pdfviewer";

interface PdfViewerWrapperProps {
  id: string;
  documentPath: string;
  author: string | undefined;
}

const PdfViewerWrapper = forwardRef<PdfViewerComponent, PdfViewerWrapperProps>(
  ({ id, documentPath, author }, ref) => {
    return (
      <PdfViewerComponent
        ref={ref}
        id={id}
        documentPath={documentPath}
        resourceUrl="http://localhost:3000/ej2-pdfviewer-lib"
        enableToolbar={true}
        enableNavigationToolbar={true}
        enableAnnotationToolbar={true}
        enableDownload={true}
        enableBookmark={false}
        isAnnotationToolbarOpen={true}
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
          author: author || "Guest",
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
    );
  }
);

PdfViewerWrapper.displayName = "PdfViewerWrapper";

export default memo(PdfViewerWrapper);
