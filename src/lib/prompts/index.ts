/**
 * Prompt System - Public API
 *
 * Centralized exports for the prompt template and builder system.
 */

// Templates
export {
  IMAGE_TEMPLATES,
  VIDEO_TEMPLATES,
  QUALITY_MODIFIERS,
  UNIVERSAL_NEGATIVE_PROMPTS,
  type ImageType,
  type VideoType,
  type ImageTemplate,
  type VideoTemplate,
} from './templates';

// Builder
export {
  PromptBuilder,
  buildProductHeroPrompt,
  buildLifestylePrompt,
  buildUGCVideoPrompt,
  buildProductDemoPrompt,
  type ImagePromptVariables,
  type VideoPromptVariables,
  type BuildImagePromptParams,
  type BuildVideoPromptParams,
  type PromptResult,
} from './builder';

// Presets
export {
  OUTPUT_FORMAT_PRESETS,
  VIDEO_ASPECT_RATIOS,
  STYLE_PRESETS,
  IMAGE_TYPES,
  VIDEO_TYPES,
  PLATFORM_RECOMMENDATIONS,
  getRecommendedFormats,
  getOutputFormatPreset,
  getPlatformRecommendation,
  getFormatsByAspectRatio,
  requiresTalent,
  requiresProduct,
  type OutputFormatPreset,
  type VideoAspectRatioPreset,
  type StylePresetInfo,
  type ImageTypeInfo,
  type VideoTypeInfo,
  type PlatformRecommendation,
} from './presets';
