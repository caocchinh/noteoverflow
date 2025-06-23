"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, RefreshCw, FolderUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uploadImage } from "@/features/admin/content/lib/utils";
import {
  FAILED_TO_UPLOAD_IMAGE,
  INTERNAL_SERVER_ERROR,
} from "@/constants/constants";
import { legacyUploadAction } from "@/features/admin/legacy/server/actions";
import { ValidContentType } from "@/constants/types";
import { ValidSeason } from "@/constants/types";
import { parseQuestionId } from "@/lib/utils";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import {
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Add type declaration for directory input
declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

const LegacyUploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [failedUploads, setFailedUploads] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [curriculum, setCurriculum] = useState<"A-LEVEL" | "IGCSE">("A-LEVEL");
  const [subjectCode, setSubjectCode] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      console.log("Selected files:", fileArray);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files);
      setFiles(fileArray);
      console.log("Dropped files:", fileArray);
    }
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    const subjectFullName = file.webkitRelativePath.split("/")[0];
    const questionNumber = file.webkitRelativePath.split("/")[7].split("_")[0];
    const order = file.webkitRelativePath
      .split("/")[7]
      .split("_")[1]
      .split(".")[0];
    const contentType: ValidContentType = file.webkitRelativePath.split(
      "/"
    )[1] as ValidContentType;

    const topic = file.webkitRelativePath.split("/")[2].toUpperCase();
    const season: ValidSeason = file.webkitRelativePath.split(
      "/"
    )[4] as ValidSeason;
    const paperCode = file.webkitRelativePath.split("/")[6];

    const paperVariant = parseInt(paperCode.split("_")[1]) % 10;
    const paperType = Math.floor(parseInt(paperCode.split("_")[1]) / 10);
    const year = file.webkitRelativePath.split("/")[3];

    let imageSrc = "";

    if (file.type.includes("text")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        imageSrc = content;
      };
      reader.readAsText(file);
    } else {
      const { success, data, error } = await uploadImage({
        file,
        subjectFullName,
        paperCode,
        contentType,
        questionNumber,
        order: parseInt(order),
      });
      if (!success) {
        if (error === INTERNAL_SERVER_ERROR) {
          toast.error(INTERNAL_SERVER_ERROR);
        } else {
          toast.error(FAILED_TO_UPLOAD_IMAGE);
        }
        return false;
      }
      imageSrc = data!.imageSrc;
    }

    const questionId = parseQuestionId({
      subject: subjectFullName,
      paperCode,
      questionNumber: questionNumber.slice(1),
    });

    const { success, error } = await legacyUploadAction({
      curriculum,
      subjectFullName,
      year,
      season,
      paperType,
      paperVariant,
      topic,
      questionId,
      questionNumber,
      contentType,
      imageSrc,
      order: parseInt(order),
    });

    if (!success) {
      if (error === INTERNAL_SERVER_ERROR) {
        toast.error(INTERNAL_SERVER_ERROR);
      } else {
        toast.error(FAILED_TO_UPLOAD_IMAGE);
      }
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (isUploading || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setFailedUploads([]);

    const newFailedUploads: File[] = [];
    let completedUploads = 0;
    setSubjectCode(files[0].webkitRelativePath.split("/")[0]);

    // Sort files so that "questions" come before "answers"
    const sortedFiles = [...files].sort((a, b) => {
      const aType = a.webkitRelativePath.split("/")[1];
      const bType = b.webkitRelativePath.split("/")[1];

      if (aType === "questions" && bType === "answers") return -1;
      if (aType === "answers" && bType === "questions") return 1;
      return 0;
    });

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      try {
        const success = await uploadFile(file);
        if (!success) {
          newFailedUploads.push(file);
        }
      } catch {
        newFailedUploads.push(file);
      }
      completedUploads++;
      const progress = Math.round((completedUploads / files.length) * 100);
      setUploadProgress(progress);
    }

    setIsUploading(false);
    setFailedUploads(newFailedUploads);

    if (newFailedUploads.length === 0) {
      toast.success("All files uploaded successfully");
    } else {
      toast.error(`${newFailedUploads.length} file(s) failed to upload`, {
        description: "Check the failed uploads section to retry",
      });
    }
    setFiles([]);
  };

  const handleRetryFailed = async () => {
    if (failedUploads.length === 0) return;

    // Add failed uploads back to files list if they aren't already there
    const currentFilePaths = new Set(
      files.map((file) => file.webkitRelativePath)
    );
    const filesToAdd = failedUploads.filter(
      (file) => !currentFilePaths.has(file.webkitRelativePath)
    );

    if (filesToAdd.length > 0) {
      setFiles([...files, ...filesToAdd]);
    }

    // Reset failed uploads list
    setFailedUploads([]);

    // Start upload process
    await handleUpload();
  };

  // Add useEffect to prevent navigation during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
      }
    };

    if (isUploading) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isUploading]);

  return (
    <div className="w-full min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Legacy Upload
        </h1>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Settings</h3>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground-muted">
              Curriculum
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-36">
                  {curriculum} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCurriculum("A-LEVEL")}>
                  A-LEVEL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurriculum("IGCSE")}>
                  IGCSE
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className={`w-full p-8 mb-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all
            ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary bg-card"
            }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ minHeight: "200px" }}
        >
          <div className="flex flex-col items-center text-center">
            <FolderUp
              className={`w-16 h-16 mb-4 ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <p className="text-lg mb-2 font-medium text-foreground">
              Drag & drop your directory here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Or select files using the button below
            </p>

            <label className="relative cursor-pointer">
              <Button>
                <Upload className="mr-2" size={18} />
                Select Directory
              </Button>
              <input
                type="file"
                webkitdirectory=""
                directory=""
                accept="image/png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <AlertDialog open={isUploading}>
          <AlertDialogContent>
            <AlertDialogTitle>Upload Progress</AlertDialogTitle>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Subject: {subjectCode}</p>
                <p className="text-sm font-medium">Curriculum: {curriculum}</p>
              </div>
              <div className="w-full bg-muted rounded-full">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {files.length > 0 && (
          <div className="bg-card rounded-xl shadow-md p-6 border border-border mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center flex-wrap gap-1">
                <h3 className="text-xl font-semibold text-foreground mr-4">
                  Selected Files
                </h3>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {files.length} files
                </span>
              </div>

              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={handleUpload}
                disabled={isUploading}
              >
                <Upload size={16} className="mr-2" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>

            <div className="max-h-96 overflow-auto">
              <ul className="divide-y divide-gray-100">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="py-3 hover:bg-muted transition-colors rounded px-2"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <File className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {file.webkitRelativePath || "No path available"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {failedUploads.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-red-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h3 className="text-xl font-semibold text-red-800 mr-4">
                  Failed Uploads
                </h3>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {failedUploads.length} files
                </span>
              </div>

              <Button
                onClick={handleRetryFailed}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-500 dark:hover:bg-red-500/10 hover:text-red-500"
              >
                <RefreshCw size={16} className="mr-2" />
                Retry All
              </Button>
            </div>

            <div className="max-h-64 overflow-auto">
              <ul className="divide-y divide-red-100">
                {failedUploads.map((file, index) => (
                  <li
                    key={index}
                    className="py-3 hover:bg-red-50 transition-colors rounded px-2"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <File className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-red-500 truncate mt-1">
                          {file.webkitRelativePath || "No path available"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegacyUploadPage;
