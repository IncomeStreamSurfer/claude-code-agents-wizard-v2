/**
 * Prompt Builder for AI Generation
 *
 * Constructs prompts from templates with variable substitution,
 * style modifiers, and reference image integration.
 *
 * Uses the 6-component structure:
 * 1. SUBJECT - Specific identification
 * 2. ACTION - What is happening
 * 3. ENVIRONMENT - Setting and context
 * 4. ART STYLE - Technical specifications
 * 5. LIGHTING - Explicit illumination description
 * 6. DETAILS - Mood and refinement
 */

import {
  ImageType,
  VideoType,
  IMAGE_TEMPLATES,
  VIDEO_TEMPLATES,
  QUALITY_MODIFIERS,
  UNIVERSAL_NEGATIVE_PROMPTS,
} from './templates';
import { StylePreset, ReferenceImage } from '../ai/types';
import type { Brand, Product, Talent } from '@/types/database';

// ============================================================================
// Types
// ============================================================================

export interface ImagePromptVariables {
  product_name?: string;
  product_description?: string;
  talent_description?: string;
  brand_style?: string;
  brand_color?: string;
  scene_description?: string;
  custom_modifiers?: string;
}

export interface VideoPromptVariables extends ImagePromptVariables {
  action_description?: string;
  duration_hint?: string;
}

export interface BuildImagePromptParams {
  type: ImageType;
  variables: ImagePromptVariables;
  style: StylePreset;
  includeQualityModifiers?: boolean;
  customAdditions?: string;
}

export interface BuildVideoPromptParams {
  type: VideoType;
  variables: VideoPromptVariables;
  style: StylePreset;
  includeQualityModifiers?: boolean;
  customAdditions?: string;
}

export interface PromptResult {
  prompt: string;
  negativePrompt: string;
  referenceImages?: ReferenceImage[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Substitute variables in template string
 */
function substituteVariables(template: string, variables: Record<string, string | undefined>): string {
  let result = template;

  // Replace all {variable_name} occurrences
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
  });

  // Remove any remaining unreplaced placeholders
  result = result.replace(/\{[^}]+\}/g, '');

  // Clean up extra spaces and empty lines
  result = result
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  return result;
}

/**
 * Extract brand style description from brand voice profile
 */
function extractBrandStyle(brand: Brand): string {
  const voiceProfile = brand.voice_profile as Record<string, string> | null;

  if (!voiceProfile) {
    return 'modern professional';
  }

  const traits: string[] = [];

  if (voiceProfile.tone) traits.push(voiceProfile.tone);
  if (voiceProfile.style) traits.push(voiceProfile.style);
  if (voiceProfile.personality) traits.push(voiceProfile.personality);

  return traits.length > 0 ? traits.join(', ') : 'modern professional';
}

/**
 * Extract primary brand color
 */
function extractBrandColor(brand: Brand): string {
  const colors = brand.colors as Record<string, string> | null;

  if (!colors) {
    return 'brand colors';
  }

  return colors.primary || colors.main || 'brand colors';
}

/**
 * Create detailed talent description from talent record
 * Following the SUBJECT component best practices
 */
function createTalentDescription(talent: Talent): string {
  const parts: string[] = [];

  // Start with name or generic descriptor
  if (talent.name) {
    parts.push(talent.name);
  }

  // Add demographic/appearance details from usage_rights if available
  const usage = talent.usage_rights as Record<string, string> | null;
  if (usage?.description) {
    parts.push(usage.description);
  }
  if (usage?.appearance) {
    parts.push(usage.appearance);
  }

  // Add any notes that might describe the person
  if (talent.notes) {
    parts.push(talent.notes);
  }

  return parts.length > 0 ? parts.join(', ') : 'professional model';
}

/**
 * Create detailed product description
 * Following the SUBJECT component best practices
 */
function createProductDescription(product: Product): string {
  const parts: string[] = [];

  // Product name
  parts.push(product.name);

  // Product description
  if (product.description) {
    parts.push(product.description);
  }

  // Add price point context if available
  if (product.price) {
    const priceRange = product.price > 500 ? 'premium luxury' :
                       product.price > 100 ? 'mid-range quality' : 'accessible';
    parts.push(`${priceRange} product`);
  }

  return parts.join(', ');
}

/**
 * Build reference images array from database entities
 */
function buildReferenceImages(
  brand?: Brand,
  product?: Product,
  talent?: Talent
): ReferenceImage[] {
  const referenceImages: ReferenceImage[] = [];

  // Add brand logo if available
  if (brand?.logo_url) {
    referenceImages.push({
      url: brand.logo_url,
      type: 'brand_logo',
      description: `${brand.name} brand logo for style reference`,
    });
  }

  // Add product images
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    // Use first 2 product images max
    const productImages = product.images.slice(0, 2);
    productImages.forEach((imageUrl, index) => {
      if (typeof imageUrl === 'string') {
        referenceImages.push({
          url: imageUrl,
          type: 'product',
          description: `${product.name} - product reference image ${index + 1}`,
        });
      }
    });
  }

  // Add processed product images if available (background removed, etc.)
  if (product?.processed_images) {
    const processed = product.processed_images as Record<string, string>;
    if (processed.background_removed) {
      referenceImages.push({
        url: processed.background_removed,
        type: 'product',
        description: `${product.name} - isolated product (background removed)`,
      });
    }
  }

  // Add talent reference images
  if (talent?.reference_images && Array.isArray(talent.reference_images)) {
    // Use first 2 talent images max
    const talentImages = talent.reference_images.slice(0, 2);
    talentImages.forEach((imageUrl, index) => {
      if (typeof imageUrl === 'string') {
        referenceImages.push({
          url: imageUrl,
          type: 'talent',
          description: `${talent.name} - talent/model reference image ${index + 1}`,
        });
      }
    });
  }

  return referenceImages;
}

// ============================================================================
// Prompt Builder Class
// ============================================================================

export class PromptBuilder {
  /**
   * Build image generation prompt from context
   */
  static buildImagePrompt(params: BuildImagePromptParams): PromptResult {
    const template = IMAGE_TEMPLATES[params.type];

    if (!template) {
      throw new Error(`Unknown image type: ${params.type}`);
    }

    // Select appropriate base template
    // Priority: withTalent > withProduct > base
    let baseTemplate = template.base;
    if (params.variables.talent_description && template.withTalent) {
      baseTemplate = template.withTalent;
    } else if (params.variables.product_name && template.withProduct) {
      baseTemplate = template.withProduct;
    }

    // Build base prompt with variables
    const basePrompt = substituteVariables(baseTemplate, params.variables as Record<string, string>);

    // Add style modifiers
    const styleModifier = substituteVariables(
      template.modifiers[params.style],
      params.variables as Record<string, string>
    );

    // Build final prompt
    const promptParts: string[] = [];

    // Add the structured prompt
    promptParts.push(basePrompt);

    // Add style section
    promptParts.push(`\n[STYLE MODIFIERS] ${styleModifier}`);

    // Add quality modifiers if requested
    if (params.includeQualityModifiers !== false) {
      promptParts.push(`\n[QUALITY] ${QUALITY_MODIFIERS.high_quality}, ${QUALITY_MODIFIERS.photorealistic}, ${QUALITY_MODIFIERS.commercial}`);
    }

    // Add custom additions
    if (params.customAdditions) {
      promptParts.push(`\n[ADDITIONAL INSTRUCTIONS] ${params.customAdditions}`);
    }

    // Add custom modifiers from variables
    if (params.variables.custom_modifiers) {
      promptParts.push(`\n[CUSTOM] ${params.variables.custom_modifiers}`);
    }

    const prompt = promptParts.join('');

    // Build negative prompt
    const styleNegative = template.negativePrompts[params.style];
    const negativePrompt = `${styleNegative}, ${UNIVERSAL_NEGATIVE_PROMPTS}`;

    return { prompt, negativePrompt };
  }

  /**
   * Build video generation prompt from context
   */
  static buildVideoPrompt(params: BuildVideoPromptParams): PromptResult {
    const template = VIDEO_TEMPLATES[params.type];

    if (!template) {
      throw new Error(`Unknown video type: ${params.type}`);
    }

    // Select appropriate base template
    let baseTemplate = template.base;
    if (params.variables.talent_description && template.withTalent) {
      baseTemplate = template.withTalent;
    } else if (params.variables.product_name && template.withProduct) {
      baseTemplate = template.withProduct;
    }

    // Build base prompt with variables
    const basePrompt = substituteVariables(baseTemplate, params.variables as Record<string, string>);

    // Add style modifiers
    const styleModifier = substituteVariables(
      template.modifiers[params.style],
      params.variables as Record<string, string>
    );

    // Build final prompt
    const promptParts: string[] = [];

    promptParts.push(basePrompt);
    promptParts.push(`\n[STYLE] ${styleModifier}`);

    // Add quality modifiers if requested
    if (params.includeQualityModifiers !== false) {
      promptParts.push(`\n[QUALITY] ${QUALITY_MODIFIERS.cinematic}, ${QUALITY_MODIFIERS.high_quality}`);
    }

    // Add action description if provided
    if (params.variables.action_description) {
      promptParts.push(`\n[SPECIFIC ACTION] ${params.variables.action_description}`);
    }

    // Add duration hint if provided
    if (params.variables.duration_hint) {
      promptParts.push(`\n[DURATION] ${params.variables.duration_hint}`);
    }

    // Add custom additions
    if (params.customAdditions) {
      promptParts.push(`\n[ADDITIONAL] ${params.customAdditions}`);
    }

    // Add custom modifiers from variables
    if (params.variables.custom_modifiers) {
      promptParts.push(`\n[CUSTOM] ${params.variables.custom_modifiers}`);
    }

    const prompt = promptParts.join('');

    // Build negative prompt
    const styleNegative = template.negativePrompts[params.style];
    const negativePrompt = `${styleNegative}, ${UNIVERSAL_NEGATIVE_PROMPTS}`;

    return { prompt, negativePrompt };
  }

  /**
   * Build image prompt from database context with reference images
   */
  static buildImagePromptFromContext(
    type: ImageType,
    style: StylePreset,
    brand: Brand,
    product?: Product,
    talent?: Talent,
    sceneDescription?: string,
    customAdditions?: string
  ): PromptResult {
    const variables: ImagePromptVariables = {
      brand_style: extractBrandStyle(brand),
      brand_color: extractBrandColor(brand),
    };

    if (product) {
      variables.product_name = product.name;
      variables.product_description = createProductDescription(product);
    }

    if (talent) {
      variables.talent_description = createTalentDescription(talent);
    }

    if (sceneDescription) {
      variables.scene_description = sceneDescription;
    }

    const result = this.buildImagePrompt({
      type,
      variables,
      style,
      customAdditions,
    });

    // Build reference images for multimodal generation
    const referenceImages = buildReferenceImages(brand, product, talent);

    return {
      ...result,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
    };
  }

  /**
   * Build video prompt from database context
   */
  static buildVideoPromptFromContext(
    type: VideoType,
    style: StylePreset,
    brand: Brand,
    product?: Product,
    talent?: Talent,
    actionDescription?: string,
    durationSeconds?: number,
    customAdditions?: string
  ): PromptResult {
    const variables: VideoPromptVariables = {
      brand_style: extractBrandStyle(brand),
      brand_color: extractBrandColor(brand),
    };

    if (product) {
      variables.product_name = product.name;
      variables.product_description = createProductDescription(product);
    }

    if (talent) {
      variables.talent_description = createTalentDescription(talent);
    }

    if (actionDescription) {
      variables.action_description = actionDescription;
    }

    if (durationSeconds) {
      if (durationSeconds <= 6) {
        variables.duration_hint = 'quick short format, 3-6 seconds, punchy impactful';
      } else if (durationSeconds <= 15) {
        variables.duration_hint = 'medium duration, 10-15 seconds, social media optimal';
      } else {
        variables.duration_hint = 'longer format, 20-30 seconds, detailed storytelling';
      }
    }

    const result = this.buildVideoPrompt({
      type,
      variables,
      style,
      customAdditions,
    });

    // Build reference images
    const referenceImages = buildReferenceImages(brand, product, talent);

    return {
      ...result,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
    };
  }

  /**
   * Build a comprehensive ad prompt with business context
   * Similar to n8n workflow structure
   */
  static buildAdPrompt(params: {
    brand: Brand;
    product?: Product;
    talent?: Talent;
    imageType: ImageType;
    style: StylePreset;
    targetAudience?: string;
    keyBenefits?: string;
    customInstructions?: string;
    aspectRatio?: string;
  }): PromptResult {
    const { brand, product, talent, imageType, style, targetAudience, keyBenefits, customInstructions, aspectRatio } = params;

    // Build business context section
    const businessContext: string[] = [];
    businessContext.push('# BUSINESS CONTEXT');
    businessContext.push(`**Brand:** ${brand.name}`);
    if (brand.industry) {
      businessContext.push(`**Industry:** ${brand.industry}`);
    }
    if (targetAudience) {
      businessContext.push(`**Target Audience:** ${targetAudience}`);
    } else if (brand.target_audience) {
      const ta = brand.target_audience as Record<string, string>;
      businessContext.push(`**Target Audience:** ${ta.description || 'General audience'}`);
    }
    businessContext.push(`**Brand Voice:** ${extractBrandStyle(brand)}`);
    if (keyBenefits) {
      businessContext.push(`**Key Benefits:** ${keyBenefits}`);
    }

    // Get the structured prompt
    const baseResult = this.buildImagePromptFromContext(
      imageType,
      style,
      brand,
      product,
      talent,
      undefined,
      customInstructions
    );

    // Combine business context with technical prompt
    const fullPrompt = [
      businessContext.join('\n'),
      '\n# VISUAL GENERATION INSTRUCTIONS',
      baseResult.prompt,
    ].join('\n\n');

    // Add aspect ratio if specified
    const finalPrompt = aspectRatio
      ? `${fullPrompt}\n\n[ASPECT RATIO] ${aspectRatio} composition required`
      : fullPrompt;

    return {
      prompt: finalPrompt,
      negativePrompt: baseResult.negativePrompt,
      referenceImages: baseResult.referenceImages,
    };
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Build a product hero shot prompt
 */
export function buildProductHeroPrompt(
  brand: Brand,
  product: Product,
  style: StylePreset = 'minimal',
  customAdditions?: string
): PromptResult {
  return PromptBuilder.buildImagePromptFromContext(
    'hero_shot',
    style,
    brand,
    product,
    undefined,
    undefined,
    customAdditions
  );
}

/**
 * Build a lifestyle image prompt
 */
export function buildLifestylePrompt(
  brand: Brand,
  product: Product,
  talent: Talent,
  style: StylePreset = 'lifestyle',
  sceneDescription?: string,
  customAdditions?: string
): PromptResult {
  return PromptBuilder.buildImagePromptFromContext(
    'lifestyle',
    style,
    brand,
    product,
    talent,
    sceneDescription,
    customAdditions
  );
}

/**
 * Build a UGC-style video prompt
 */
export function buildUGCVideoPrompt(
  brand: Brand,
  product: Product,
  talent: Talent,
  style: StylePreset = 'lifestyle',
  actionDescription?: string,
  customAdditions?: string
): PromptResult {
  return PromptBuilder.buildVideoPromptFromContext(
    'ugc',
    style,
    brand,
    product,
    talent,
    actionDescription,
    undefined,
    customAdditions
  );
}

/**
 * Build a product demo video prompt
 */
export function buildProductDemoPrompt(
  brand: Brand,
  product: Product,
  style: StylePreset = 'promotional',
  durationSeconds?: number,
  customAdditions?: string
): PromptResult {
  return PromptBuilder.buildVideoPromptFromContext(
    'product_demo',
    style,
    brand,
    product,
    undefined,
    undefined,
    durationSeconds,
    customAdditions
  );
}
