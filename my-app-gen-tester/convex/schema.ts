import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User thumbnail generation jobs
  thumbnailJobs: defineTable({
    userId: v.string(),
    originalImageId: v.id("_storage"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Generated thumbnail variations
  thumbnails: defineTable({
    jobId: v.id("thumbnailJobs"),
    originalImageId: v.id("_storage"),
    generatedImageId: v.id("_storage"),
    variation: v.number(),
    prompt: v.string(),
    createdAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_original", ["originalImageId"]),
});
