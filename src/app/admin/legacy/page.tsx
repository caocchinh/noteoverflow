"use client";
import { useState } from "react";

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
            <svg
              className={`w-16 h-16 mb-4 ${
                isDragging ? "text-blue-500" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg mb-2 font-medium text-gray-700">
              Drag & drop your directory here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Or select files using the button below
            </p>

            <label className="relative cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow transition-colors">
              <span>Select Directory</span>
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
                  <button
                    onClick={handleRemoveSelected}
                    className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove Selected ({selectedFiles.size})
                  </button>
                )}

                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  {selectedFiles.size === files.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
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
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
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
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Remove file"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
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
