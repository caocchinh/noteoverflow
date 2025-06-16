"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, X, File, Check, FolderUp } from "lucide-react";

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
      // If all are selected, deselect all
      setSelectedFiles(new Set());
    } else {
      // Otherwise, select all
      setSelectedFiles(new Set(files.map((_, i) => i)));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedFiles.size === 0) return;

    const selectedIndices = Array.from(selectedFiles).sort((a, b) => b - a); // Sort in descending order
    const newFiles = [...files];

    // Remove files in descending order to avoid index shifting problems
    selectedIndices.forEach((index) => {
      newFiles.splice(index, 1);
    });

    setFiles(newFiles);
    setSelectedFiles(new Set());
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Legacy Upload</h1>

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

        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
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
                {selectedFiles.size > 0 && (
                  <Button variant="destructive" onClick={handleRemoveSelected}>
                    <Trash2 size={16} />
                    Remove Selected ({selectedFiles.size})
                  </Button>
                )}

                <Button variant="outline" onClick={handleSelectAll}>
                  {selectedFiles.size === files.length ? (
                    <>
                      <X size={16} className="mr-1" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-1" />
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
      </div>
    </div>
  );
};

export default LegacyUploadPage;
