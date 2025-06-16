"use client";
import { useState } from "react";

// Add type declaration for directory input
declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

const AdminPageClient = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      console.log("Selected files:", fileArray);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <input
        type="file"
        webkitdirectory=""
        directory=""
        accept="image/png"
        onChange={handleFileChange}
        className="mb-4"
      />

      {files.length > 0 && (
        <div className="max-h-96 overflow-auto w-3/4 p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-semibold mb-2">
            Selected Files ({files.length})
          </h3>
          <ul className="list-disc pl-5">
            {files.map((file, index) => (
              <li key={index} className="mb-2">
                <div>
                  <strong>Name:</strong> {file.name}
                </div>
                <div>
                  <strong>Path:</strong> {file.webkitRelativePath}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminPageClient;
