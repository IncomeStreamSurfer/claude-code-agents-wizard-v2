import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a short-lived upload URL for client file uploads.
 * URL expires in 1 hour - should be fetched shortly before upload.
 *
 * This mutation controls who can upload files to the storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Save uploaded file metadata and create a thumbnail generation job.
 * This is called after the file has been uploaded to Convex storage.
 *
 * Returns the jobId which can be used to track generation progress.
 */
export const saveUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Create a new thumbnail generation job
    const jobId = await ctx.db.insert("thumbnailJobs", {
      userId: args.userId,
      originalImageId: args.storageId,
      status: "pending",
      createdAt: Date.now(),
    });

    return jobId;
  },
});

/**
 * Get the URL for a stored file.
 * Returns null if the file doesn't exist or has been deleted.
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get metadata about a stored file from the _storage system table.
 * Includes contentType, size, and sha256 hash.
 */
export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});
