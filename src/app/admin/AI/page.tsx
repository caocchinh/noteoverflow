/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { api } from "@/lib/eden";

interface SearchResult {
  questionId: string;
  score: number;
  type: string;
  question: any;
}

export default function VisualSearchTestPage() {
  const [activeTab, setActiveTab] = useState<"image" | "text" | "index">(
    "image"
  );
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  // Image Search State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Text Search State
  const [textQuery, setTextQuery] = useState("");

  // Filter State
  const [filterSubject, setFilterSubject] = useState("");
  const [filterCurriculum, setFilterCurriculum] = useState("");

  // Indexing State
  const [indexing, setIndexing] = useState(false);
  const [indexParams, setIndexParams] = useState({ offset: 0, limit: 10 });
  const [indexResult, setIndexResult] = useState<any>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Content = base64String.split(",")[1];
        setSelectedImage(base64Content);
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFilters = () => {
    const filters: { subject?: string; curriculum?: string } = {};
    if (filterSubject.trim()) filters.subject = filterSubject.trim();
    if (filterCurriculum.trim()) filters.curriculum = filterCurriculum.trim();
    return Object.keys(filters).length > 0 ? filters : undefined;
  };

  const handleImageSearch = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setExtractedText(null);

    try {
      const { data, error } = await api["visual-search"].search.post({
        imageBase64: selectedImage,
        filter: getFilters(),
      });

      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error || "Search failed");
      }

      setResults(data.results);
      if (data.extractedText) setExtractedText(data.extractedText);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = async () => {
    if (!textQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setExtractedText(null);

    try {
      const { data, error } = await api["visual-search"].text.post({
        query: textQuery,
        filter: getFilters(),
      });

      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error || "Search failed");
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIndexQuestions = async () => {
    setIndexing(true);
    setError(null);
    setIndexResult(null);

    try {
      const { data, error } = await api.admin["visual-search"].index.get({
        query: {
          offset: indexParams.offset,
          limit: indexParams.limit,
        },
      });

      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error || "Indexing failed");
      }

      setIndexResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIndexing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8">Visual Search Admin Test</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("image")}
          className={`pb-2 px-4 transition-colors ${
            activeTab === "image"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Image Search
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`pb-2 px-4 transition-colors ${
            activeTab === "text"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Text Search
        </button>
        <button
          onClick={() => setActiveTab("index")}
          className={`pb-2 px-4 transition-colors ${
            activeTab === "index"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Indexing
        </button>
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 max-w-lg">
        {/* Common Filters (Only for Search Tabs) */}
        {activeTab !== "index" && (
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Filters (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">
                  Subject
                </label>
                <input
                  type="text"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  placeholder="e.g. Math"
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">
                  Curriculum
                </label>
                <input
                  type="text"
                  value={filterCurriculum}
                  onChange={(e) => setFilterCurriculum(e.target.value)}
                  placeholder="e.g. Cambridge"
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "image" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 rounded border border-gray-200"
                />
              </div>
            )}

            <button
              onClick={handleImageSearch}
              disabled={!selectedImage || loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Searching..." : "Search by Image"}
            </button>
          </div>
        ) : activeTab === "text" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Search Query
              </label>
              <input
                type="text"
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                placeholder="Enter text here..."
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={handleTextSearch}
              disabled={!textQuery.trim() || loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Searching..." : "Search by Text"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Offset</label>
                <input
                  type="number"
                  value={indexParams.offset}
                  onChange={(e) =>
                    setIndexParams((p) => ({
                      ...p,
                      offset: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Limit</label>
                <input
                  type="number"
                  value={indexParams.limit}
                  onChange={(e) =>
                    setIndexParams((p) => ({
                      ...p,
                      limit: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleIndexQuestions}
              disabled={indexing}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {indexing ? "Indexing..." : "Start Indexing"}
            </button>

            {indexResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 text-sm">
                <p className="font-semibold mb-2">{indexResult.message}</p>
                {indexResult.progress && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-100 p-2 rounded">
                      <div className="text-xl font-bold text-green-700">
                        {indexResult.progress.indexed}
                      </div>
                      <div className="text-xs text-green-800">Indexed</div>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded">
                      <div className="text-xl font-bold text-yellow-700">
                        {indexResult.progress.skipped}
                      </div>
                      <div className="text-xs text-yellow-800">Skipped</div>
                    </div>
                    <div className="bg-red-100 p-2 rounded">
                      <div className="text-xl font-bold text-red-700">
                        {indexResult.progress.failed}
                      </div>
                      <div className="text-xs text-red-800">Failed</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded mb-8 border border-red-200">
          {error}
        </div>
      )}

      {/* Extracted Text Debug */}
      {extractedText && (
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
            OCR Extracted Text
          </h3>
          <div className="bg-gray-50 p-4 rounded text-sm font-mono whitespace-pre-wrap border border-gray-200">
            {extractedText}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Results
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {results.length} found
            </span>
          </h2>
          {results.length === 0 ? (
            <p className="text-gray-500 italic">No matches found.</p>
          ) : (
            <div className="grid gap-6">
              {results.map((result) => (
                <div
                  key={result.questionId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            result.type === "question"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {result.type} match
                        </span>
                        <span className="text-sm text-gray-500 font-mono">
                          ID: {result.questionId}
                        </span>
                      </div>
                      <h3 className="font-medium">
                        {result.question?.season} {result.question?.year} -
                        paper {result.question?.paperType}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Score</div>
                      <div className="font-mono font-bold text-lg text-blue-600">
                        {result.score.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {/* Display Question Images */}
                    {result.question?.questionImages?.map(
                      (img: string, idx: number) => (
                        <div
                          key={`q-${idx}`}
                          className="shrink-0 relative group"
                        >
                          <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-1 rounded-br">
                            Q
                          </div>
                          <img
                            src={img}
                            alt={`Question ${idx + 1}`}
                            className="h-32 rounded border border-gray-200"
                          />
                        </div>
                      )
                    )}
                    {/* Display Answer Images */}
                    {result.question?.answers?.map(
                      (img: string, idx: number) => (
                        <div
                          key={`a-${idx}`}
                          className="shrink-0 relative group"
                        >
                          <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-1 rounded-br">
                            A
                          </div>
                          {/\.(webp|png|jpg|jpeg|gif|bmp|svg)$/i.test(img) ? (
                            <img
                              src={img}
                              alt={`Answer ${idx + 1}`}
                              className="h-32 rounded border border-gray-200 opacity-90"
                            />
                          ) : (
                            <div className="h-32 w-48 p-2 text-xs overflow-y-auto bg-gray-50 border border-gray-200 rounded">
                              {img}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
