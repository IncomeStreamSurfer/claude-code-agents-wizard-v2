import { action, mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Clickbait thumbnail style prompts for variety
const THUMBNAIL_STYLES = [
  "Create a shocking, attention-grabbing clickbait thumbnail. Add dramatic lighting, bold red/yellow colors, exaggerated facial expression arrows pointing at key elements, and a sense of urgency.",
  "Transform into a viral YouTube thumbnail style. Add explosive effects, zoom blur on background, bright contrasting colors, and make it look like something incredible is happening.",
  "Create an irresistible curiosity-gap thumbnail. Add mystery elements, question marks, blur/censor something intriguing, use dramatic shadows and spotlight effects.",
  "Make a high-energy reaction thumbnail. Add shocked emoji overlays, dramatic color grading, motion blur streaks, and intense visual excitement.",
  "Create a before/after transformation thumbnail. Split the image dramatically, add glowing arrows, use contrasting warm/cool color grading on each side.",
  "Design a controversial debate-style thumbnail. Add VS elements, lightning bolts, opposing color schemes (red vs blue), dramatic facial crops.",
  "Transform into a breaking news style thumbnail. Add urgent banner elements, red alert colors, timestamp effects, and newsflash aesthetics.",
  "Create a secret reveal thumbnail. Add lock/unlock icons, peek-through effects, redacted text bars, mysterious glow, and discovery elements.",
  "Make a countdown/list style thumbnail. Add bold numbers, colorful ranking elements, trophy/medal icons, and competitive visual hierarchy.",
  "Design an emotional story thumbnail. Add dramatic vignette, tear/sparkle effects, heartfelt color grading, and cinematic letterboxing.",
];

// Create a new thumbnail generation job
export const createJob = mutation({
  args: {
    userId: v.string(),
    originalImageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("thumbnailJobs", {
      userId: args.userId,
      originalImageId: args.originalImageId,
      status: "pending",
      createdAt: Date.now(),
    });
    return jobId;
  },
});

// Update job status
export const updateJobStatus = internalMutation({
  args: {
    jobId: v.id("thumbnailJobs"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      ...(args.error && { error: args.error }),
    });
  },
});

// Save a generated thumbnail
export const saveThumbnail = internalMutation({
  args: {
    jobId: v.id("thumbnailJobs"),
    originalImageId: v.id("_storage"),
    generatedImageId: v.id("_storage"),
    variation: v.number(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("thumbnails", {
      jobId: args.jobId,
      originalImageId: args.originalImageId,
      generatedImageId: args.generatedImageId,
      variation: args.variation,
      prompt: args.prompt,
      createdAt: Date.now(),
    });
  },
});

// Generate clickbait thumbnails using Gemini
export const generateThumbnails = action({
  args: {
    jobId: v.id("thumbnailJobs"),
    originalImageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.thumbnails.updateJobStatus, {
        jobId: args.jobId,
        status: "failed",
        error: "Missing GOOGLE_GENERATIVE_AI_API_KEY",
      });
      throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    }

    // Update status to processing
    await ctx.runMutation(internal.thumbnails.updateJobStatus, {
      jobId: args.jobId,
      status: "processing",
    });

    try {
      // Get the original image
      const imageUrl = await ctx.storage.getUrl(args.originalImageId);
      if (!imageUrl) {
        throw new Error("Original image not found");
      }

      // Download and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString("base64");

      // Determine mime type from URL or default to jpeg
      const mimeType = imageUrl.includes(".png") ? "image/png" : "image/jpeg";

      let successCount = 0;

      // Generate 10 thumbnail variations
      for (let i = 0; i < 10; i++) {
        const stylePrompt = THUMBNAIL_STYLES[i];
        const fullPrompt = `${stylePrompt}\n\nEdit the provided image to create this clickbait thumbnail. Keep the main subject recognizable but make it dramatically more eye-catching and click-worthy. Output only the edited image.`;

        try {
          // Call Gemini API using gemini-3-pro-image-preview (Nano Banana Pro)
          // This model supports image generation with responseModalities: ["TEXT", "IMAGE"]
          const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
            {
              method: "POST",
              headers: {
                "x-goog-api-key": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: fullPrompt },
                      {
                        inlineData: {
                          mimeType: mimeType,
                          data: base64Image,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  responseModalities: ["TEXT", "IMAGE"],
                },
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API error for variation ${i + 1}:`, errorText);
            continue;
          }

          const data = await response.json();

          // Find generated image in response
          const parts = data.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find(
            (part: { inlineData?: { data: string; mimeType: string } }) =>
              part.inlineData
          );

          if (imagePart?.inlineData?.data) {
            // Convert base64 to blob and store
            const binaryData = Buffer.from(imagePart.inlineData.data, "base64");
            const blob = new Blob([binaryData], {
              type: imagePart.inlineData.mimeType || "image/png",
            });

            const storageId = await ctx.storage.store(blob);

            // Save to database
            await ctx.runMutation(internal.thumbnails.saveThumbnail, {
              jobId: args.jobId,
              originalImageId: args.originalImageId,
              generatedImageId: storageId,
              variation: i + 1,
              prompt: stylePrompt,
            });

            successCount++;
            console.log(`Generated thumbnail variation ${i + 1}`);
          } else {
            console.error(`No image in response for variation ${i + 1}`);
          }
        } catch (varError) {
          console.error(`Error generating variation ${i + 1}:`, varError);
          // Continue to next variation even if one fails
        }
      }

      // Update final status
      if (successCount > 0) {
        await ctx.runMutation(internal.thumbnails.updateJobStatus, {
          jobId: args.jobId,
          status: "completed",
        });
        return { success: true, count: successCount };
      } else {
        await ctx.runMutation(internal.thumbnails.updateJobStatus, {
          jobId: args.jobId,
          status: "failed",
          error: "Failed to generate any thumbnails",
        });
        return { success: false, count: 0 };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(internal.thumbnails.updateJobStatus, {
        jobId: args.jobId,
        status: "failed",
        error: errorMessage,
      });
      throw error;
    }
  },
});

// Get job status
export const getJob = query({
  args: { jobId: v.id("thumbnailJobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// Get all jobs for a user
export const getUserJobs = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("thumbnailJobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Get original image URLs
    const jobsWithUrls = await Promise.all(
      jobs.map(async (job) => ({
        ...job,
        originalImageUrl: await ctx.storage.getUrl(job.originalImageId),
      }))
    );

    return jobsWithUrls;
  },
});

// Get thumbnails for a job
export const getJobThumbnails = query({
  args: { jobId: v.id("thumbnailJobs") },
  handler: async (ctx, args) => {
    const thumbnails = await ctx.db
      .query("thumbnails")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Get URLs for all thumbnails
    const thumbnailsWithUrls = await Promise.all(
      thumbnails.map(async (thumbnail) => ({
        ...thumbnail,
        url: await ctx.storage.getUrl(thumbnail.generatedImageId),
      }))
    );

    return thumbnailsWithUrls.sort((a, b) => a.variation - b.variation);
  },
});
