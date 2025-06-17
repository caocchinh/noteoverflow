"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Trash2,
  X,
  File,
  Check,
  FolderUp,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createCurriculum,
  isCurriculumExists,
  isSubjectExists,
  createSubject,
  uploadAnswer,
  uploadQuestion,
  isYearExists,
  createYear,
  isSeasonExists,
  createSeason,
  isPaperTypeExists,
  createPaperType,
  isTopicExists,
  createTopic,
  uploadQuestionImage,
} from "@/server/actions";
import { authClient } from "@/lib/auth/auth-client";

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
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [failedUploads, setFailedUploads] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [curriculum, setCurriculum] = useState<"A-LEVEL" | "IGCSE">("A-LEVEL");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      setSelectedFiles(new Set()); // Clear selections when new files are added
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
      setSelectedFiles(new Set()); // Clear selections when new files are added
      console.log("Dropped files:", fileArray);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    // Update selected files set
    const newSelectedFiles = new Set(selectedFiles);
    newSelectedFiles.delete(index);

    // Adjust indices for files after the removed one
    const adjustedSelectedFiles = new Set<number>();
    newSelectedFiles.forEach((idx) => {
      if (idx > index) {
        adjustedSelectedFiles.add(idx - 1);
      } else {
        adjustedSelectedFiles.add(idx);
      }
    });

    setSelectedFiles(adjustedSelectedFiles);
  };

  const handleSelectFile = (index: number) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (newSelectedFiles.has(index)) {
      newSelectedFiles.delete(index);
    } else {
      newSelectedFiles.add(index);
    }
    setSelectedFiles(newSelectedFiles);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((_, i) => i)));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedFiles.size === 0) return;

    const selectedIndices = Array.from(selectedFiles).sort((a, b) => b - a);
    const newFiles = [...files];

    selectedIndices.forEach((index) => {
      newFiles.splice(index, 1);
    });

    setFiles(newFiles);
    setSelectedFiles(new Set());
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    try {
      const subjectFullName = file.webkitRelativePath.split("/")[0];
      const questionNumber = file.webkitRelativePath
        .split("/")[7]
        .split("_")[0];
      const order = file.webkitRelativePath
        .split("/")[7]
        .split("_")[1]
        .split(".")[0];
      const contentType: "questions" | "answers" =
        file.webkitRelativePath.split("/")[1] as "questions" | "answers";

      const topic = file.webkitRelativePath.split("/")[2];
      const season: "Summer" | "Winter" | "Spring" =
        file.webkitRelativePath.split("/")[4] as "Summer" | "Winter" | "Spring";
      const paperCode = file.webkitRelativePath.split("/")[6];
      // const subjectName = file.webkitRelativePath.split("/")[0].split("(")[0];
      // const subjectCode = file.webkitRelativePath
      //   .split("/")[0]
      //   .split("(")[1]
      //   .split(")")[0];
      const paperVariant = parseInt(paperCode.split("_")[1]) % 10;
      const paperType = Math.floor(parseInt(paperCode.split("_")[1]) / 10);
      const year = file.webkitRelativePath.split("/")[3];

      let questionImageSrc = "";
      if (file.type.includes("text")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          questionImageSrc = content;
        };
        reader.readAsText(file);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "filename",
          `${subjectFullName}-${paperCode}-${contentType}-${questionNumber}-${order}`
        );
        formData.append("contentType", file.type);

        const response = await fetch("/api/r2", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }
        const result = await response.json();

        if (!result || !result.url) {
          throw new Error("Failed to upload file");
        }
        questionImageSrc = result.url;
      }

      const session = await authClient.getSession();
      if (!(await isCurriculumExists(curriculum))) {
        await createCurriculum({ name: curriculum });
      }
      if (!(await isSubjectExists(subjectFullName))) {
        await createSubject({
          id: subjectFullName,
          curriculumName: curriculum,
        });
      }
      if (!(await isYearExists(parseInt(year), subjectFullName))) {
        await createYear({
          year: parseInt(year),
          subjectId: subjectFullName,
        });
      }
      if (!(await isSeasonExists(season, subjectFullName))) {
        await createSeason({
          season: season,
          subjectId: subjectFullName,
        });
      }
      if (!(await isPaperTypeExists(paperType, subjectFullName))) {
        await createPaperType({
          paperType: paperType,
          subjectId: subjectFullName,
        });
      }
      if (!(await isTopicExists(topic, subjectFullName))) {
        await createTopic({
          topic: topic,
          subjectId: subjectFullName,
        });
      }
      if (contentType === "questions" && session?.data?.user) {
        await uploadQuestion({
          userId: session.data.user.id,
          year: parseInt(year),
          season: season,
          paperType: paperType,
          paperVariant: paperVariant,
          subjectId: subjectFullName,
          topic: topic,
          questionNumber: parseInt(questionNumber[1]),
          questionId: `${subjectFullName}-${paperCode}-questions-${questionNumber}-${order}`,
        });
        await uploadQuestionImage({
          questionId: `${subjectFullName}-${paperCode}-questions-${questionNumber}-${order}`,
          imageSrc: questionImageSrc,
          order: parseInt(order),
        });
      } else if (contentType === "answers" && session?.data?.user) {
        await uploadAnswer({
          questionId: `${subjectFullName}-${paperCode}-questions-${questionNumber}-${order}`,
          answerImageSrc: questionImageSrc,
          answerOrder: parseInt(order),
        });
      }
      return true;
    } catch (error) {
      console.error("Error uploading file:", error);
      return false;
    }
  };

  const handleUpload = async () => {
    if (isUploading || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setFailedUploads([]);

    const newFailedUploads: File[] = [];
    let completedUploads = 0;

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
      const success = await uploadFile(file);
      completedUploads++;
      const progress = Math.round((completedUploads / files.length) * 100);
      setUploadProgress(progress);

      if (!success) {
        newFailedUploads.push(file);
      }
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Legacy Upload</h1>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
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
        </div>

        <div
          className={`w-full p-8 mb-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 bg-white"
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
                isDragging ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <p className="text-lg mb-2 font-medium text-gray-700">
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

        {isUploading && (
          <div className="mb-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Upload Progress</h3>
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h3 className="text-xl font-semibold text-gray-800 mr-4">
                  Selected Files
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {files.length} files
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  <Upload size={16} className="mr-2" />
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>

                {selectedFiles.size > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveSelected}
                    disabled={isUploading}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Remove Selected ({selectedFiles.size})
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  disabled={isUploading}
                >
                  {selectedFiles.size === files.length ? (
                    <>
                      <X size={16} className="mr-2" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Select All
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-auto">
              <ul className="divide-y divide-gray-100">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className={`py-3 hover:bg-gray-50 transition-colors rounded px-2 ${
                      selectedFiles.has(index) ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(index)}
                          onChange={() => handleSelectFile(index)}
                          className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                          disabled={isUploading}
                        />
                      </div>
                      <div className="flex-shrink-0 mr-3">
                        <File className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {file.webkitRelativePath || "No path available"}
                        </p>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Remove file"
                          disabled={isUploading}
                        >
                          <X size={18} />
                        </Button>
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
                className="border-red-200 text-red-700 hover:bg-red-50"
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
