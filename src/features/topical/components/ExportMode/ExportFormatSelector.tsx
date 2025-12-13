import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText } from "lucide-react";
import { forwardRef, memo, useImperativeHandle, useState } from "react";

export type ExportFormat = "pdf" | "docx";

export interface ExportFormatSelectorHandle {
  getFormat: () => ExportFormat;
}

const ExportFormatSelector = memo(
  forwardRef<ExportFormatSelectorHandle>((_, ref) => {
    const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");

    useImperativeHandle(ref, () => ({
      getFormat: () => exportFormat,
    }));

    return (
      <Tabs
        defaultValue="pdf"
        value={exportFormat}
        onValueChange={(v) => setExportFormat(v as ExportFormat)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pdf" className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="docx" className="cursor-pointer">
            <Copy className="w-4 h-4 mr-2" />
            Word
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  })
);

ExportFormatSelector.displayName = "ExportFormatSelector";

export default ExportFormatSelector;
