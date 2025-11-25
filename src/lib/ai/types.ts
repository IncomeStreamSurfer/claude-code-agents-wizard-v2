/**
 * Common types for AI service integrations
 */

// ============================================================================
// Nano Banana Pro Types (Image Generation)
// ============================================================================

export type StylePreset = 'minimal' | 'bold' | 'lifestyle' | 'promotional';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface OutputFormat {
  name: string;
  width: number;
  height: number;
}

export interface ReferenceImage {
  url: string;
  type: 'product' | 'talent' | 'brand_logo' | 'style_reference';
  description?: string;
}

export interface GenerateImageRequest {
  brand_id: string;
  product_id?: string;
  talent_id?: string;
  prompt: string;
  negative_prompt?: string;
  style_preset?: StylePreset;
  output_formats: OutputFormat[];
  variations?: number; // 1-5, default 1
  seed?: number; // For reproducibility
  reference_images?: ReferenceImage[]; // Product/talent/brand images to include in prompt
  aspect_ratio?: string; // e.g., '1:1', '16:9', '9:16'
}

export interface GeneratedImage {
  url: string;
  format: OutputFormat;
  seed: number;
  variation_index: number;
}

export interface ImageGenerationJob {
  job_id: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  images?: GeneratedImage[];
  error?: string;
  metadata: {
    prompt: string;
    style_preset: StylePreset;
    model_version: string;
  };
}

export interface NanoBananaErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// VEO 3.1 Types (Video Generation)
// ============================================================================

export interface GenerateVideoRequest {
  brand_id: string;
  product_id?: string;
  talent_id?: string;
  prompt: string;
  duration: number; // seconds
  aspect_ratio: '16:9' | '9:16' | '1:1' | '4:5';
  style_preset?: StylePreset;
  reference_images?: string[]; // URLs to reference images
  seed?: number;
}

export interface GeneratedVideo {
  url: string;
  thumbnail_url: string;
  duration: number;
  aspect_ratio: string;
  seed: number;
}

export interface VideoGenerationJob {
  job_id: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  video?: GeneratedVideo;
  error?: string;
  metadata: {
    prompt: string;
    style_preset?: StylePreset;
    model_version: string;
  };
}

// ============================================================================
// OpenRouter Types (Claude Haiku 4.5 for insights)
// ============================================================================

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string; // 'anthropic/claude-haiku-4.5'
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// Common Error Types
// ============================================================================

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class RateLimitError extends AIServiceError {
  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends AIServiceError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_FAILED', 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends AIServiceError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class JobNotFoundError extends AIServiceError {
  constructor(jobId: string) {
    super(`Job ${jobId} not found`, 'JOB_NOT_FOUND', 404);
    this.name = 'JobNotFoundError';
  }
}
