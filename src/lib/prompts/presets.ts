/**
 * Presets for Image and Video Generation
 *
 * Common presets for output formats, styles, and generation types
 * used throughout the UI.
 */

import { StylePreset, OutputFormat } from '../ai/types';
import { ImageType, VideoType } from './templates';

// ============================================================================
// Output Format Presets (Ad Sizes)
// ============================================================================

export interface OutputFormatPreset extends OutputFormat {
  description: string;
  platform?: string;
  aspectRatio: string;
}

export const OUTPUT_FORMAT_PRESETS: Record<string, OutputFormatPreset> = {
  // Instagram
  instagram_square: {
    name: 'Instagram Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Instagram feed post',
    platform: 'meta',
  },
  instagram_portrait: {
    name: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: 'Instagram feed portrait',
    platform: 'meta',
  },
  instagram_story: {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Instagram Stories & Reels',
    platform: 'meta',
  },

  // Facebook
  facebook_feed: {
    name: 'Facebook Feed',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    description: 'Facebook feed post',
    platform: 'meta',
  },
  facebook_square: {
    name: 'Facebook Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Facebook square post',
    platform: 'meta',
  },
  facebook_story: {
    name: 'Facebook Story',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Facebook Stories',
    platform: 'meta',
  },

  // TikTok
  tiktok_video: {
    name: 'TikTok Video',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'TikTok vertical video',
    platform: 'tiktok',
  },

  // Google Display
  google_leaderboard: {
    name: 'Leaderboard',
    width: 728,
    height: 90,
    aspectRatio: '8.09:1',
    description: 'Google Display leaderboard',
    platform: 'google',
  },
  google_medium_rectangle: {
    name: 'Medium Rectangle',
    width: 300,
    height: 250,
    aspectRatio: '1.2:1',
    description: 'Google Display medium rectangle',
    platform: 'google',
  },
  google_large_rectangle: {
    name: 'Large Rectangle',
    width: 336,
    height: 280,
    aspectRatio: '1.2:1',
    description: 'Google Display large rectangle',
    platform: 'google',
  },
  google_skyscraper: {
    name: 'Wide Skyscraper',
    width: 160,
    height: 600,
    aspectRatio: '0.27:1',
    description: 'Google Display wide skyscraper',
    platform: 'google',
  },
  google_half_page: {
    name: 'Half Page',
    width: 300,
    height: 600,
    aspectRatio: '0.5:1',
    description: 'Google Display half page',
    platform: 'google',
  },

  // LinkedIn
  linkedin_feed: {
    name: 'LinkedIn Feed',
    width: 1200,
    height: 627,
    aspectRatio: '1.91:1',
    description: 'LinkedIn feed post',
    platform: 'linkedin',
  },
  linkedin_square: {
    name: 'LinkedIn Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'LinkedIn square post',
    platform: 'linkedin',
  },

  // Pinterest
  pinterest_standard: {
    name: 'Pinterest Standard',
    width: 1000,
    height: 1500,
    aspectRatio: '2:3',
    description: 'Pinterest standard pin',
    platform: 'pinterest',
  },
  pinterest_square: {
    name: 'Pinterest Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Pinterest square pin',
    platform: 'pinterest',
  },

  // Twitter/X
  twitter_feed: {
    name: 'Twitter Feed',
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
    description: 'Twitter feed post',
    platform: 'programmatic',
  },
  twitter_square: {
    name: 'Twitter Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Twitter square post',
    platform: 'programmatic',
  },

  // Universal
  landscape_hd: {
    name: 'Landscape HD',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'Standard HD landscape',
  },
  portrait_hd: {
    name: 'Portrait HD',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Standard HD portrait',
  },
  square_hd: {
    name: 'Square HD',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Standard HD square',
  },
};

// ============================================================================
// Video Aspect Ratios
// ============================================================================

export interface VideoAspectRatioPreset {
  name: string;
  ratio: '16:9' | '9:16' | '1:1' | '4:5';
  description: string;
  platforms: string[];
}

export const VIDEO_ASPECT_RATIOS: Record<string, VideoAspectRatioPreset> = {
  landscape: {
    name: 'Landscape',
    ratio: '16:9',
    description: 'Standard landscape video',
    platforms: ['google', 'linkedin', 'programmatic'],
  },
  portrait: {
    name: 'Vertical',
    ratio: '9:16',
    description: 'Vertical mobile video',
    platforms: ['meta', 'tiktok'],
  },
  square: {
    name: 'Square',
    ratio: '1:1',
    description: 'Square video for feeds',
    platforms: ['meta', 'linkedin'],
  },
  portrait_4_5: {
    name: 'Portrait 4:5',
    ratio: '4:5',
    description: 'Portrait for Instagram feed',
    platforms: ['meta'],
  },
};

// ============================================================================
// Style Preset Descriptions
// ============================================================================

export interface StylePresetInfo {
  name: string;
  description: string;
  bestFor: string[];
  example: string;
}

export const STYLE_PRESETS: Record<StylePreset, StylePresetInfo> = {
  minimal: {
    name: 'Minimal',
    description: 'Clean, simple, professional',
    bestFor: ['Product photography', 'Hero shots', 'E-commerce', 'Tech products'],
    example: 'White background, soft lighting, clean composition',
  },
  bold: {
    name: 'Bold',
    description: 'High contrast, vibrant, eye-catching',
    bestFor: ['Sales campaigns', 'Launch promotions', 'Youth marketing', 'Fashion'],
    example: 'Dramatic lighting, saturated colors, dynamic angles',
  },
  lifestyle: {
    name: 'Lifestyle',
    description: 'Natural, authentic, relatable',
    bestFor: ['Brand building', 'Social media', 'Testimonials', 'Community'],
    example: 'Natural lighting, real settings, genuine moments',
  },
  promotional: {
    name: 'Promotional',
    description: 'Professional, polished, commercial',
    bestFor: ['Advertising', 'Campaigns', 'Performance marketing', 'Sales'],
    example: 'Studio quality, commercial polish, conversion-focused',
  },
};

// ============================================================================
// Image Type Descriptions
// ============================================================================

export interface ImageTypeInfo {
  name: string;
  description: string;
  bestFor: string[];
  requiresTalent: boolean;
  requiresProduct: boolean;
}

export const IMAGE_TYPES: Record<ImageType, ImageTypeInfo> = {
  hero_shot: {
    name: 'Hero Shot',
    description: 'Product as the hero with professional studio look',
    bestFor: ['Landing pages', 'Product launches', 'Feature highlights', 'E-commerce'],
    requiresTalent: false,
    requiresProduct: false, // Made optional to allow brand-only generation
  },
  lifestyle: {
    name: 'Lifestyle',
    description: 'Product in real-world use with authentic context',
    bestFor: ['Social media', 'Brand storytelling', 'Engagement', 'Community building'],
    requiresTalent: true,
    requiresProduct: true,
  },
  product_only: {
    name: 'Product Only',
    description: 'Isolated product shot on clean background',
    bestFor: ['E-commerce', 'Product catalogs', 'Comparison ads', 'Feature callouts'],
    requiresTalent: false,
    requiresProduct: true,
  },
  ugc_style: {
    name: 'UGC Style',
    description: 'User-generated content aesthetic for authenticity',
    bestFor: ['Social proof', 'TikTok', 'Instagram', 'Influencer-style content'],
    requiresTalent: true,
    requiresProduct: true,
  },
};

// ============================================================================
// Video Type Descriptions
// ============================================================================

export interface VideoTypeInfo {
  name: string;
  description: string;
  bestFor: string[];
  requiresTalent: boolean;
  requiresProduct: boolean;
  recommendedDuration: string;
}

export const VIDEO_TYPES: Record<VideoType, VideoTypeInfo> = {
  ugc: {
    name: 'UGC',
    description: 'User-generated content style for authenticity',
    bestFor: ['Social proof', 'TikTok', 'Reels', 'Influencer campaigns'],
    requiresTalent: true,
    requiresProduct: true,
    recommendedDuration: '6-15 seconds',
  },
  product_demo: {
    name: 'Product Demo',
    description: 'Clear demonstration of product features and benefits',
    bestFor: ['Product launches', 'Feature highlights', 'How-to content', 'E-commerce'],
    requiresTalent: false,
    requiresProduct: true,
    recommendedDuration: '15-30 seconds',
  },
  testimonial: {
    name: 'Testimonial',
    description: 'Customer testimonial sharing their experience',
    bestFor: ['Trust building', 'Social proof', 'Case studies', 'Conversion'],
    requiresTalent: true,
    requiresProduct: false,
    recommendedDuration: '15-30 seconds',
  },
  dynamic: {
    name: 'Dynamic',
    description: 'Fast-paced energetic promotional content',
    bestFor: ['Performance ads', 'Sales campaigns', 'Launch promotions', 'Limited offers'],
    requiresTalent: false,
    requiresProduct: true,
    recommendedDuration: '6-15 seconds',
  },
};

// ============================================================================
// Platform-Specific Recommendations
// ============================================================================

export interface PlatformRecommendation {
  platform: string;
  preferredFormats: string[];
  preferredStyles: StylePreset[];
  preferredImageTypes: ImageType[];
  preferredVideoTypes: VideoType[];
  notes: string;
}

export const PLATFORM_RECOMMENDATIONS: PlatformRecommendation[] = [
  {
    platform: 'meta',
    preferredFormats: ['instagram_square', 'instagram_story', 'facebook_feed'],
    preferredStyles: ['lifestyle', 'minimal'],
    preferredImageTypes: ['lifestyle', 'ugc_style'],
    preferredVideoTypes: ['ugc', 'dynamic'],
    notes: 'Meta platforms favor authentic, social content',
  },
  {
    platform: 'tiktok',
    preferredFormats: ['tiktok_video'],
    preferredStyles: ['lifestyle', 'bold'],
    preferredImageTypes: ['ugc_style', 'lifestyle'],
    preferredVideoTypes: ['ugc', 'dynamic'],
    notes: 'TikTok requires vertical video with UGC feel',
  },
  {
    platform: 'google',
    preferredFormats: ['google_medium_rectangle', 'google_leaderboard'],
    preferredStyles: ['promotional', 'minimal'],
    preferredImageTypes: ['hero_shot', 'product_only'],
    preferredVideoTypes: ['product_demo', 'dynamic'],
    notes: 'Google Display works best with clear product focus',
  },
  {
    platform: 'linkedin',
    preferredFormats: ['linkedin_feed', 'linkedin_square'],
    preferredStyles: ['minimal', 'promotional'],
    preferredImageTypes: ['hero_shot', 'lifestyle'],
    preferredVideoTypes: ['testimonial', 'product_demo'],
    notes: 'LinkedIn favors professional, business-focused content',
  },
  {
    platform: 'pinterest',
    preferredFormats: ['pinterest_standard', 'pinterest_square'],
    preferredStyles: ['lifestyle', 'minimal'],
    preferredImageTypes: ['lifestyle', 'hero_shot'],
    preferredVideoTypes: ['product_demo', 'dynamic'],
    notes: 'Pinterest works best with vertical, inspirational content',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get recommended output formats for a platform
 */
export function getRecommendedFormats(platform: string): OutputFormatPreset[] {
  return Object.values(OUTPUT_FORMAT_PRESETS).filter(
    format => format.platform === platform || !format.platform
  );
}

/**
 * Get preset by name
 */
export function getOutputFormatPreset(name: string): OutputFormatPreset | undefined {
  return OUTPUT_FORMAT_PRESETS[name];
}

/**
 * Get platform recommendations
 */
export function getPlatformRecommendation(platform: string): PlatformRecommendation | undefined {
  return PLATFORM_RECOMMENDATIONS.find(rec => rec.platform === platform);
}

/**
 * Get all presets for a specific aspect ratio
 */
export function getFormatsByAspectRatio(aspectRatio: string): OutputFormatPreset[] {
  return Object.values(OUTPUT_FORMAT_PRESETS).filter(
    format => format.aspectRatio === aspectRatio
  );
}

/**
 * Check if image type requires talent
 */
export function requiresTalent(type: ImageType | VideoType): boolean {
  const typeInfo = IMAGE_TYPES[type as ImageType] || VIDEO_TYPES[type as VideoType];
  return typeInfo?.requiresTalent || false;
}

/**
 * Check if image/video type requires product
 */
export function requiresProduct(type: ImageType | VideoType): boolean {
  const typeInfo = IMAGE_TYPES[type as ImageType] || VIDEO_TYPES[type as VideoType];
  return typeInfo?.requiresProduct || false;
}
