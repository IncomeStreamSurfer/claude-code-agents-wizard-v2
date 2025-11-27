/**
 * Nano Banana Pro API Client (Powered by Google Gemini 3 Pro Image)
 *
 * Uses Google Gemini 3 Pro Image (gemini-3-pro-image-preview) for professional
 * image generation with advanced features:
 * - High-resolution output: 1K, 2K, and 4K visuals
 * - Advanced text rendering for infographics, menus, diagrams, marketing assets
 * - Up to 14 reference images (6 objects + 5 humans for character consistency)
 * - Thinking mode for complex prompts with intermediate reasoning
 * - Proper imageConfig for aspect ratio and resolution control
 * - Base64 image output
 * - Error handling with retries
 * - Type safety
 */

import { GoogleGenAI, Part } from '@google/genai';
import {
  GenerateImageRequest,
  ImageGenerationJob,
  GeneratedImage,
  AIServiceError,
  ValidationError,
  JobStatus,
  ReferenceImage,
} from './types';

// ============================================================================
// Configuration
// ============================================================================

interface NanoBananaConfig {
  apiKey: string;
  maxRetries?: number;
  retryDelay?: number;
  debug?: boolean;
}

const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  debug: process.env.NODE_ENV === 'development',
};

// Model to use for image generation
// 'gemini-3-pro-image-preview' - Latest with advanced features (up to 14 reference images, 4K, thinking mode)
// 'gemini-2.5-flash-image' - Fallback production ready model
const GEMINI_MODEL = 'gemini-3-pro-image-preview';

// Image resolution options for Gemini 3 Pro
type ImageResolution = '1K' | '2K' | '4K';

// Maximum reference images allowed by Gemini 3 Pro
const MAX_REFERENCE_IMAGES = 14;
const MAX_OBJECT_IMAGES = 6;
const MAX_HUMAN_IMAGES = 5;

// ============================================================================
// Nano Banana Client (Gemini-powered)
// ============================================================================

export class NanoBananaClient {
  private config: Required<Omit<NanoBananaConfig, 'apiKey'>> & { apiKey: string };
  private ai: GoogleGenAI;

  constructor(config: NanoBananaConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.validateConfig();
    this.ai = new GoogleGenAI({ apiKey: this.config.apiKey });
  }

  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('Gemini API key is required');
    }
  }

  private log(message: string, data?: unknown): void {
    if (this.config.debug) {
      console.log(`[NanoBanana/Gemini] ${message}`, data || '');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Map our output format to Gemini aspect ratio
   */
  private getAspectRatio(width: number, height: number): string {
    const ratio = width / height;

    // Common aspect ratios
    if (Math.abs(ratio - 1) < 0.1) return '1:1';
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 3/4) < 0.1) return '3:4';
    if (Math.abs(ratio - 3/2) < 0.1) return '3:2';
    if (Math.abs(ratio - 2/3) < 0.1) return '2:3';

    // Default based on orientation
    if (ratio > 1) return '16:9';
    if (ratio < 1) return '9:16';
    return '1:1';
  }

  /**
   * Get human-readable aspect ratio description for prompt engineering
   */
  private getAspectDescription(aspectRatio: string): string {
    const descriptions: Record<string, string> = {
      '1:1': 'Square format for Instagram feed and Facebook',
      '16:9': 'Horizontal/landscape for feed posts and desktop',
      '9:16': 'Vertical/portrait for Instagram Stories, Reels, TikTok',
      '4:3': 'Standard horizontal format',
      '3:4': 'Vertical format for Pinterest',
      '4:5': 'Vertical format for Instagram portrait',
      '5:4': 'Slightly horizontal format',
      '3:2': 'Classic photo ratio horizontal',
      '2:3': 'Classic photo ratio vertical',
    };
    return descriptions[aspectRatio] || 'Custom aspect ratio';
  }

  /**
   * Determine optimal image resolution based on requested dimensions
   * Gemini 3 Pro supports: 1K, 2K, 4K
   */
  private getImageResolution(width: number, height: number): ImageResolution {
    const maxDimension = Math.max(width, height);

    // 4K for large professional outputs (3840+)
    if (maxDimension >= 3840) return '4K';
    // 2K for mid-range (1920-3839)
    if (maxDimension >= 1920) return '2K';
    // 1K for smaller outputs
    return '1K';
  }

  /**
   * Organize reference images by type for optimal Gemini 3 Pro usage
   * - Up to 6 object images (products, brand logos)
   * - Up to 5 human images (talent/models)
   * - Total max 14 images
   */
  private organizeReferenceImages(images: ReferenceImage[]): ReferenceImage[] {
    const objectImages = images.filter(img =>
      img.type === 'product' || img.type === 'brand_logo' || img.type === 'style_reference'
    );
    const humanImages = images.filter(img => img.type === 'talent');

    // Limit to Gemini 3 Pro maximums
    const limitedObjects = objectImages.slice(0, MAX_OBJECT_IMAGES);
    const limitedHumans = humanImages.slice(0, MAX_HUMAN_IMAGES);

    // Combine respecting total limit
    const combined = [...limitedObjects, ...limitedHumans];
    return combined.slice(0, MAX_REFERENCE_IMAGES);
  }

  /**
   * Validate image generation request
   */
  private validateGenerateRequest(params: GenerateImageRequest): void {
    if (!params.brand_id) {
      throw new ValidationError('brand_id is required');
    }
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new ValidationError('prompt is required and cannot be empty');
    }
    if (!params.output_formats || params.output_formats.length === 0) {
      throw new ValidationError('At least one output format is required');
    }
    if (params.variations && (params.variations < 1 || params.variations > 4)) {
      throw new ValidationError('variations must be between 1 and 4');
    }
  }

  /**
   * Convert a URL to base64 for Gemini multimodal input
   */
  private async urlToBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
    try {
      // Handle data URLs
      if (url.startsWith('data:')) {
        const match = url.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          return { mimeType: match[1], base64: match[2] };
        }
        return null;
      }

      // Fetch external URL
      const response = await fetch(url);
      if (!response.ok) {
        this.log(`Failed to fetch image: ${url}`, { status: response.status });
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      return { base64, mimeType: contentType };
    } catch (error) {
      this.log(`Error converting URL to base64: ${url}`, error);
      return null;
    }
  }

  /**
   * Build multimodal content parts for Gemini (text + images)
   */
  private async buildMultimodalContent(
    prompt: string,
    referenceImages?: ReferenceImage[]
  ): Promise<Part[]> {
    const parts: Part[] = [];

    // Add reference images first (product, talent, etc.)
    if (referenceImages && referenceImages.length > 0) {
      for (const refImage of referenceImages) {
        const imageData = await this.urlToBase64(refImage.url);
        if (imageData) {
          // Add context about what this image is
          if (refImage.description) {
            parts.push({ text: `[${refImage.type.toUpperCase()} IMAGE: ${refImage.description}]` });
          } else {
            parts.push({ text: `[${refImage.type.toUpperCase()} REFERENCE IMAGE]` });
          }

          parts.push({
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.base64,
            },
          });
        }
      }
    }

    // Add the main prompt text
    parts.push({ text: prompt });

    return parts;
  }

  /**
   * Generate a single image with Gemini 3 Pro Image
   *
   * Uses the advanced Gemini 3 Pro Image API with:
   * - responseModalities: ['TEXT', 'IMAGE'] for image output
   * - imageConfig: { aspectRatio, imageSize } for proper sizing
   * - Up to 14 reference images for character/product consistency
   */
  private async generateSingleImage(
    prompt: string,
    aspectRatio: string,
    resolution: ImageResolution,
    referenceImages?: ReferenceImage[],
    retryCount = 0
  ): Promise<{ base64: string; mimeType: string }> {
    try {
      // Organize reference images to respect Gemini 3 Pro limits
      const organizedImages = referenceImages
        ? this.organizeReferenceImages(referenceImages)
        : undefined;

      this.log(`Generating image with Gemini 3 Pro Image`, {
        aspectRatio,
        resolution,
        prompt: prompt.substring(0, 100),
        hasReferenceImages: organizedImages && organizedImages.length > 0,
        referenceImageCount: organizedImages?.length || 0,
        referenceTypes: organizedImages?.map(img => img.type) || [],
      });

      // Build multimodal content (prompt text + reference images)
      const contents = await this.buildMultimodalContent(prompt, organizedImages);

      // Gemini 3 Pro Image API configuration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: contents,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: resolution,
          },
        },
      } as any); // Type assertion needed as SDK types may not include all config options

      this.log('Response received', {
        hasCandidates: !!response.candidates,
        candidateCount: response.candidates?.length || 0,
        firstCandidateParts: response.candidates?.[0]?.content?.parts?.length || 0,
      });

      // Extract image from response - may include text (thinking) and image parts
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          // Log each part type for debugging
          this.log('Found part', {
            hasText: !!part.text,
            hasInlineData: !!part.inlineData,
            inlineDataMime: part.inlineData?.mimeType,
          });

          // Gemini 3 Pro may return thinking text before the image - skip text parts
          if (part.inlineData) {
            this.log('Image generated successfully', { resolution, aspectRatio });
            return {
              base64: part.inlineData.data || '',
              mimeType: part.inlineData.mimeType || 'image/png',
            };
          }
        }
      }

      // Log the full response for debugging
      this.log('No image found in response', {
        response: JSON.stringify(response, null, 2).substring(0, 1000)
      });

      throw new AIServiceError(
        'No image in response',
        'NO_IMAGE_GENERATED',
        undefined,
        { response }
      );

    } catch (error) {
      this.log('Generation error', error);

      // Retry on transient errors
      if (retryCount < this.config.maxRetries) {
        const isRetryable = error instanceof Error && (
          error.message.includes('500') ||
          error.message.includes('503') ||
          error.message.includes('timeout') ||
          error.message.includes('UNAVAILABLE')
        );

        if (isRetryable) {
          await this.delay(this.config.retryDelay * (retryCount + 1));
          return this.generateSingleImage(prompt, aspectRatio, resolution, referenceImages, retryCount + 1);
        }
      }

      if (error instanceof AIServiceError) {
        throw error;
      }

      throw new AIServiceError(
        error instanceof Error ? error.message : 'Image generation failed',
        'GENERATION_FAILED',
        undefined,
        { originalError: error }
      );
    }
  }

  // ==========================================================================
  // Public API Methods
  // ==========================================================================

  /**
   * Start an image generation job
   *
   * Uses Gemini 3 Pro Image with:
   * - Automatic resolution selection based on output format (1K, 2K, 4K)
   * - Proper aspect ratio from imageConfig
   * - Up to 14 reference images for consistency
   *
   * Note: Gemini API is synchronous, so we generate immediately and return
   * a completed job with results.
   */
  async generateImage(params: GenerateImageRequest): Promise<ImageGenerationJob> {
    this.validateGenerateRequest(params);

    const jobId = `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date().toISOString();
    const variations = params.variations || 1;

    this.log('Starting image generation job', {
      jobId,
      variations,
      formats: params.output_formats.length,
      hasReferenceImages: params.reference_images && params.reference_images.length > 0,
      referenceImageCount: params.reference_images?.length || 0,
    });

    try {
      const generatedImages: GeneratedImage[] = [];
      const seed = params.seed || Math.floor(Math.random() * 1000000);

      // Generate images for each output format and variation
      for (let varIndex = 0; varIndex < variations; varIndex++) {
        for (const format of params.output_formats) {
          const aspectRatio = params.aspect_ratio || this.getAspectRatio(format.width, format.height);
          const resolution = this.getImageResolution(format.width, format.height);

          // Enhance prompt with aspect ratio specification and style
          // Note: aspectRatio is now handled by imageConfig, but we keep this for prompt context
          let enhancedPrompt = params.prompt;

          // Add aspect ratio description to prompt for better composition understanding
          const aspectDescription = this.getAspectDescription(aspectRatio);
          enhancedPrompt = `${enhancedPrompt}\n\n[COMPOSITION: ${aspectRatio} ${aspectDescription} composition]`;

          if (variations > 1) {
            enhancedPrompt = `${enhancedPrompt}\n\n[VARIATION ${varIndex + 1} of ${variations}]`;
          }

          const result = await this.generateSingleImage(
            enhancedPrompt,
            aspectRatio,
            resolution,
            params.reference_images
          );

          // Create data URL from base64
          const dataUrl = `data:${result.mimeType};base64,${result.base64}`;

          generatedImages.push({
            url: dataUrl,
            format: format,
            seed: seed + varIndex,
            variation_index: varIndex,
          });
        }
      }

      const job: ImageGenerationJob = {
        job_id: jobId,
        status: 'completed',
        created_at: startTime,
        updated_at: new Date().toISOString(),
        images: generatedImages,
        metadata: {
          prompt: params.prompt,
          style_preset: params.style_preset || 'minimal',
          model_version: GEMINI_MODEL,
        },
      };

      this.log('Job completed', { jobId, imageCount: generatedImages.length });
      return job;

    } catch (error) {
      this.log('Job failed', { jobId, error });

      const job: ImageGenerationJob = {
        job_id: jobId,
        status: 'failed',
        created_at: startTime,
        updated_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          prompt: params.prompt,
          style_preset: params.style_preset || 'minimal',
          model_version: GEMINI_MODEL,
        },
      };

      return job;
    }
  }

  /**
   * Get job status
   *
   * Note: Since Gemini is synchronous, jobs are either not found
   * or already completed. This is maintained for API compatibility.
   */
  async getJobStatus(jobId: string): Promise<ImageGenerationJob> {
    if (!jobId || jobId.trim().length === 0) {
      throw new ValidationError('jobId is required');
    }

    // Since Gemini is synchronous, we can't actually retrieve past jobs
    // The job data should be stored in the database instead
    throw new AIServiceError(
      'Job lookup not supported - use database to retrieve job status',
      'NOT_SUPPORTED',
      404,
      { jobId }
    );
  }

  /**
   * Cancel a job
   *
   * Note: Since Gemini is synchronous, cancellation is not supported.
   */
  async cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
    if (!jobId || jobId.trim().length === 0) {
      throw new ValidationError('jobId is required');
    }

    // Gemini API is synchronous, cancellation not applicable
    return {
      success: false,
      message: 'Cancellation not supported - Gemini generates synchronously',
    };
  }

  /**
   * Poll for job completion
   *
   * Note: Since Gemini is synchronous, this immediately returns the job.
   * Kept for API compatibility with async generation systems.
   */
  async pollJobCompletion(
    jobId: string,
    _interval = 2000,
    _maxAttempts = 30
  ): Promise<ImageGenerationJob> {
    return this.getJobStatus(jobId);
  }
}

// ============================================================================
// Factory function for creating client instance
// ============================================================================

let clientInstance: NanoBananaClient | null = null;

/**
 * Get or create Nano Banana (Gemini) client instance
 */
export function getNanoBananaClient(): NanoBananaClient {
  if (!clientInstance) {
    // Support both NANO_BANANA_API_KEY and GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY || process.env.NANO_BANANA_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or NANO_BANANA_API_KEY environment variable is not set');
    }

    clientInstance = new NanoBananaClient({
      apiKey,
    });
  }

  return clientInstance;
}

/**
 * Reset client instance (useful for testing)
 */
export function resetNanoBananaClient(): void {
  clientInstance = null;
}
