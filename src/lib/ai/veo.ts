/**
 * VEO 3.1 API Client
 *
 * Handles video generation requests to VEO 3.1 API with:
 * - Authentication
 * - Error handling with retries
 * - Request/response logging
 * - Type safety
 * - Longer timeouts suitable for video generation
 */

import {
  GenerateVideoRequest,
  VideoGenerationJob,
  AIServiceError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  JobNotFoundError,
} from './types';

// ============================================================================
// Configuration
// ============================================================================

interface VeoConfig {
  apiKey: string;
  apiUrl: string;
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  timeout?: number; // milliseconds
  debug?: boolean;
}

const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 120000, // 120 seconds (videos take longer than images)
  debug: process.env.NODE_ENV === 'development',
};

// ============================================================================
// VEO Error Response Type
// ============================================================================

interface VeoErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// VEO Client
// ============================================================================

export class VeoClient {
  private config: Required<VeoConfig>;

  constructor(config: VeoConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('VEO API key is required');
    }
    if (!this.config.apiUrl) {
      throw new Error('VEO API URL is required');
    }
  }

  /**
   * Log debug messages
   */
  private log(message: string, data?: unknown): void {
    if (this.config.debug) {
      console.log(`[VEO] ${message}`, data || '');
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;

    this.log(`Request to ${endpoint}`, {
      method: options.method || 'GET',
      retryCount,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        await this.handleErrorResponse(response, endpoint, options, retryCount);
      }

      const data = await response.json() as T;
      this.log(`Response from ${endpoint}`, data);
      return data;

    } catch (error) {
      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        this.log(`Request timeout for ${endpoint}`);

        if (retryCount < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * (retryCount + 1));
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        throw new AIServiceError(
          'Request timeout',
          'TIMEOUT',
          undefined,
          { endpoint }
        );
      }

      // Handle network errors
      if (error instanceof Error) {
        this.log(`Network error for ${endpoint}:`, error.message);

        if (retryCount < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * (retryCount + 1));
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        throw new AIServiceError(
          `Network error: ${error.message}`,
          'NETWORK_ERROR',
          undefined,
          { endpoint, originalError: error.message }
        );
      }

      throw error;
    }
  }

  /**
   * Handle error responses from API
   */
  private async handleErrorResponse(
    response: Response,
    endpoint: string,
    options: RequestInit,
    retryCount: number
  ): Promise<never> {
    let errorData: VeoErrorResponse | undefined;

    try {
      errorData = await response.json() as VeoErrorResponse;
    } catch {
      // Response body is not JSON
    }

    const errorMessage = errorData?.error?.message || response.statusText;
    const errorCode = errorData?.error?.code || `HTTP_${response.status}`;

    this.log(`Error response from ${endpoint}`, {
      status: response.status,
      errorCode,
      errorMessage,
    });

    // Handle specific status codes
    switch (response.status) {
      case 401:
        throw new AuthenticationError(errorMessage);

      case 400:
        throw new ValidationError(errorMessage, errorData?.error?.details);

      case 404:
        // Extract job ID from endpoint if this is a job status request
        const jobIdMatch = endpoint.match(/\/jobs\/([^/]+)/);
        if (jobIdMatch) {
          throw new JobNotFoundError(jobIdMatch[1]);
        }
        throw new AIServiceError(errorMessage, errorCode, 404);

      case 429:
        // Rate limit - check for Retry-After header
        const retryAfter = response.headers.get('Retry-After');
        const retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : undefined;

        // Retry if we haven't exhausted retries
        if (retryCount < this.config.maxRetries) {
          const delay = retryAfterMs || this.config.retryDelay * (retryCount + 1);
          this.log(`Rate limited, retrying after ${delay}ms`);
          await this.delay(delay);
          throw new Error('RETRY'); // Signal to retry
        }

        throw new RateLimitError(errorMessage, retryAfterMs);

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - retry if possible
        if (retryCount < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * (retryCount + 1));
          throw new Error('RETRY'); // Signal to retry
        }
        throw new AIServiceError(errorMessage, errorCode, response.status);

      default:
        throw new AIServiceError(errorMessage, errorCode, response.status, errorData?.error?.details);
    }
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate video generation request
   */
  private validateGenerateRequest(params: GenerateVideoRequest): void {
    if (!params.brand_id) {
      throw new ValidationError('brand_id is required');
    }
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new ValidationError('prompt is required and cannot be empty');
    }
    if (!params.duration || params.duration <= 0) {
      throw new ValidationError('duration must be a positive number');
    }
    if (params.duration > 300) {
      throw new ValidationError('duration cannot exceed 300 seconds (5 minutes)');
    }
    if (!params.aspect_ratio) {
      throw new ValidationError('aspect_ratio is required');
    }

    const validAspectRatios = ['16:9', '9:16', '1:1', '4:5'];
    if (!validAspectRatios.includes(params.aspect_ratio)) {
      throw new ValidationError(
        `aspect_ratio must be one of: ${validAspectRatios.join(', ')}`,
        { provided: params.aspect_ratio }
      );
    }

    // Validate reference images if provided
    if (params.reference_images && params.reference_images.length > 5) {
      throw new ValidationError('Cannot provide more than 5 reference images');
    }
  }

  // ==========================================================================
  // Public API Methods
  // ==========================================================================

  /**
   * Start a video generation job
   */
  async generateVideo(params: GenerateVideoRequest): Promise<VideoGenerationJob> {
    this.validateGenerateRequest(params);

    const response = await this.request<VideoGenerationJob>('/generate/video', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    return response;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<VideoGenerationJob> {
    if (!jobId || jobId.trim().length === 0) {
      throw new ValidationError('jobId is required');
    }

    const response = await this.request<VideoGenerationJob>(`/jobs/${jobId}`);
    return response;
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
    if (!jobId || jobId.trim().length === 0) {
      throw new ValidationError('jobId is required');
    }

    const response = await this.request<{ success: boolean; message: string }>(
      `/jobs/${jobId}/cancel`,
      {
        method: 'POST',
      }
    );

    return response;
  }

  /**
   * Poll for job completion
   *
   * Videos take significantly longer to generate than images,
   * so default polling is configured with longer intervals and timeout.
   *
   * @param jobId - Job ID to poll
   * @param interval - Polling interval in milliseconds (default: 5000 - 5 seconds)
   * @param maxAttempts - Maximum polling attempts (default: 120, which is 10 minutes at 5s intervals)
   * @returns Promise that resolves when job is complete or fails
   */
  async pollJobCompletion(
    jobId: string,
    interval = 5000,
    maxAttempts = 120
  ): Promise<VideoGenerationJob> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getJobStatus(jobId);

      if (job.status === 'completed') {
        return job;
      }

      if (job.status === 'failed') {
        throw new AIServiceError(
          job.error || 'Job failed',
          'JOB_FAILED',
          undefined,
          { jobId }
        );
      }

      if (job.status === 'cancelled') {
        throw new AIServiceError(
          'Job was cancelled',
          'JOB_CANCELLED',
          undefined,
          { jobId }
        );
      }

      attempts++;
      await this.delay(interval);
    }

    throw new AIServiceError(
      'Job polling timeout',
      'POLLING_TIMEOUT',
      undefined,
      { jobId, attempts }
    );
  }
}

// ============================================================================
// Factory function for creating client instance
// ============================================================================

let clientInstance: VeoClient | null = null;

/**
 * Get or create VEO client instance
 */
export function getVeoClient(): VeoClient {
  if (!clientInstance) {
    const apiKey = process.env.VEO_API_KEY;
    const apiUrl = process.env.VEO_API_URL;

    if (!apiKey) {
      throw new Error('VEO_API_KEY environment variable is not set');
    }
    if (!apiUrl) {
      throw new Error('VEO_API_URL environment variable is not set');
    }

    clientInstance = new VeoClient({
      apiKey,
      apiUrl,
    });
  }

  return clientInstance;
}

/**
 * Reset client instance (useful for testing)
 */
export function resetVeoClient(): void {
  clientInstance = null;
}
