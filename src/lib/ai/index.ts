/**
 * AI Services Integration Library
 *
 * Central export point for all AI service clients and types.
 */

// Nano Banana Pro (Image Generation)
export {
  NanoBananaClient,
  getNanoBananaClient,
  resetNanoBananaClient,
} from './nano-banana';

// VEO 3.1 (Video Generation)
export {
  VeoClient,
  getVeoClient,
  resetVeoClient,
} from './veo';

// OpenRouter (Claude Haiku 4.5 for insights)
export {
  OpenRouterClient,
  getOpenRouterClient,
  resetOpenRouterClient,
} from './openrouter';

// Jina AI (Research & Web Scraping)
export {
  JinaResearchClient,
  getJinaResearchClient,
  resetJinaResearchClient,
  buildResearchQueries,
  buildPrioritizedQueries,
} from './jina-research';

export type {
  ResearchInput,
  SearchCategory,
  ResearchResult,
  ResearchReport,
} from './jina-research';

// Types
export type {
  GenerateImageRequest,
  ImageGenerationJob,
  GeneratedImage,
  OutputFormat,
  StylePreset,
  JobStatus,
  NanoBananaErrorResponse,
  GenerateVideoRequest,
  VideoGenerationJob,
  GeneratedVideo,
  Message,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from './types';

// Errors
export {
  AIServiceError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  JobNotFoundError,
} from './types';
