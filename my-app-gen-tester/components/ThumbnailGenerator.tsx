"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ThumbnailGeneratorProps {
  userId: string;
}

export default function ThumbnailGenerator({
  userId,
}: ThumbnailGeneratorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<Id<"thumbnailJobs"> | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex hooks
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const createJob = useMutation(api.thumbnails.createJob);
  const generateThumbnails = useAction(api.thumbnails.generateThumbnails);

  // Get current job status
  const currentJob = useQuery(
    api.thumbnails.getJob,
    currentJobId ? { jobId: currentJobId } : "skip"
  );

  // Get thumbnails for current job
  const thumbnails = useQuery(
    api.thumbnails.getJobThumbnails,
    currentJobId ? { jobId: currentJobId } : "skip"
  );

  // Get all user jobs (history)
  const userJobs = useQuery(api.thumbnails.getUserJobs, { userId });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCurrentJobId(null); // Reset current job when selecting new file
    }
  };

  const handleUploadAndGenerate = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      const { storageId } = await result.json();

      // Step 3: Create job
      const jobId = await createJob({
        userId,
        originalImageId: storageId,
      });

      setCurrentJobId(jobId);

      // Step 4: Start thumbnail generation (runs in background)
      generateThumbnails({
        jobId,
        originalImageId: storageId,
      });

      // Reset file selection
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const loadJob = (jobId: Id<"thumbnailJobs">) => {
    setCurrentJobId(jobId);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "processing":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "processing":
        return "⏳";
      case "failed":
        return "❌";
      default:
        return "📋";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left sidebar - History */}
      <div className="lg:col-span-1">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>📁</span> History
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {userJobs?.map((job) => (
              <button
                key={job._id}
                onClick={() => loadJob(job._id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  currentJobId === job._id
                    ? "bg-white/20 border-2 border-pink-500"
                    : "bg-white/5 hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{getStatusIcon(job.status)}</span>
                  <span className={`text-sm ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(job.createdAt).toLocaleString()}
                </div>
              </button>
            ))}
            {(!userJobs || userJobs.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">
                No uploads yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Upload section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>📤</span> Upload Image
          </h3>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* File input area */}
            <div className="flex-1">
              <label className="block">
                <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-gray-300">
                        Click to select an image or drag and drop
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Generate button */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleUploadAndGenerate}
                disabled={!selectedFile || isUploading}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🚀</span> Generate 10 Thumbnails
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status section */}
        {currentJob && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span>{getStatusIcon(currentJob.status)}</span>
                Generation Status
              </h3>
              <span className={`${getStatusColor(currentJob.status)} font-bold`}>
                {currentJob.status.charAt(0).toUpperCase() +
                  currentJob.status.slice(1)}
              </span>
            </div>

            {currentJob.status === "processing" && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <div className="animate-spin text-xl">🔄</div>
                  <span>
                    Generating thumbnails... ({thumbnails?.length || 0}/10)
                  </span>
                </div>
                <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-red-500 h-full transition-all duration-500"
                    style={{ width: `${((thumbnails?.length || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {currentJob.status === "failed" && currentJob.error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{currentJob.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Thumbnails grid */}
        {thumbnails && thumbnails.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span>🎨</span> Generated Thumbnails ({thumbnails.length}/10)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {thumbnails.map((thumbnail) => (
                <div
                  key={thumbnail._id}
                  className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-pink-500 transition-all"
                >
                  {thumbnail.url ? (
                    <>
                      <img
                        src={thumbnail.url}
                        alt={`Variation ${thumbnail.variation}`}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={thumbnail.url}
                          download={`thumbnail-${thumbnail.variation}.png`}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                          title="Download"
                        >
                          ⬇️
                        </a>
                        <a
                          href={thumbnail.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                          title="Open in new tab"
                        >
                          🔗
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-video flex items-center justify-center text-gray-500">
                      Loading...
                    </div>
                  )}
                  <div className="p-2 text-center">
                    <span className="text-white text-sm font-semibold">
                      Style {thumbnail.variation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
