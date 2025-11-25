/**
 * Prompt System Tests
 *
 * Unit tests for the prompt template system.
 */

import { describe, it, expect } from '@jest/globals';
import {
  PromptBuilder,
  buildProductHeroPrompt,
  buildLifestylePrompt,
  IMAGE_TEMPLATES,
  VIDEO_TEMPLATES,
  OUTPUT_FORMAT_PRESETS,
  getRecommendedFormats,
  getPlatformRecommendation,
  requiresTalent,
  requiresProduct,
} from './index';
import type { Brand, Product, Talent } from '@/types/database';

// ============================================================================
// Mock Data
// ============================================================================

const mockBrand: Brand = {
  id: 'brand-123',
  org_id: 'org-123',
  name: 'Test Brand',
  voice_profile: {
    tone: 'professional',
    style: 'modern',
    personality: 'innovative',
  },
  colors: {
    primary: '#0066CC',
    secondary: '#FF6B35',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  industry: 'technology',
  logo_url: null,
  fonts: null,
  target_audience: null,
  website_url: null,
};

const mockProduct: Product = {
  id: 'product-123',
  brand_id: 'brand-123',
  name: 'Test Product',
  description: 'A wonderful test product',
  price: 99.99,
  currency: 'USD',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  images: [],
  sku: 'TEST-001',
  is_active: true,
  metadata: null,
  variants: null,
  processed_images: null,
  feed_product_id: null,
  feed_source: null,
};

const mockTalent: Talent = {
  id: 'talent-123',
  brand_id: 'brand-123',
  name: 'Test Talent',
  notes: 'Professional model, 30s',
  reference_images: ['talent1.jpg'],
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  approved_platforms: null,
  expires_at: null,
  face_encoding: null,
  usage_rights: null,
};

// ============================================================================
// Template Tests
// ============================================================================

describe('Prompt Templates', () => {
  it('should have all image templates', () => {
    expect(IMAGE_TEMPLATES.hero_shot).toBeDefined();
    expect(IMAGE_TEMPLATES.lifestyle).toBeDefined();
    expect(IMAGE_TEMPLATES.product_only).toBeDefined();
    expect(IMAGE_TEMPLATES.ugc_style).toBeDefined();
  });

  it('should have all video templates', () => {
    expect(VIDEO_TEMPLATES.ugc).toBeDefined();
    expect(VIDEO_TEMPLATES.product_demo).toBeDefined();
    expect(VIDEO_TEMPLATES.testimonial).toBeDefined();
    expect(VIDEO_TEMPLATES.dynamic).toBeDefined();
  });

  it('should have modifiers for all styles', () => {
    const template = IMAGE_TEMPLATES.hero_shot;
    expect(template.modifiers.minimal).toBeDefined();
    expect(template.modifiers.bold).toBeDefined();
    expect(template.modifiers.lifestyle).toBeDefined();
    expect(template.modifiers.promotional).toBeDefined();
  });

  it('should have negative prompts for all styles', () => {
    const template = IMAGE_TEMPLATES.hero_shot;
    expect(template.negativePrompts.minimal).toBeDefined();
    expect(template.negativePrompts.bold).toBeDefined();
    expect(template.negativePrompts.lifestyle).toBeDefined();
    expect(template.negativePrompts.promotional).toBeDefined();
  });
});

// ============================================================================
// Builder Tests
// ============================================================================

describe('PromptBuilder', () => {
  describe('buildImagePrompt', () => {
    it('should build basic image prompt', () => {
      const result = PromptBuilder.buildImagePrompt({
        type: 'hero_shot',
        style: 'minimal',
        variables: {
          product_name: 'Test Product',
          brand_style: 'modern',
        },
      });

      expect(result.prompt).toContain('Test Product');
      expect(result.prompt).toContain('modern');
      expect(result.negativePrompt).toBeDefined();
      expect(result.negativePrompt.length).toBeGreaterThan(0);
    });

    it('should substitute all variables', () => {
      const result = PromptBuilder.buildImagePrompt({
        type: 'hero_shot',
        style: 'minimal',
        variables: {
          product_name: 'Wireless Earbuds',
          product_description: 'Premium audio',
          brand_style: 'tech-forward',
          brand_color: '#0066CC',
        },
      });

      expect(result.prompt).toContain('Wireless Earbuds');
      expect(result.prompt).not.toContain('{product_name}');
      expect(result.prompt).not.toContain('{brand_style}');
    });

    it('should add custom modifiers', () => {
      const result = PromptBuilder.buildImagePrompt({
        type: 'hero_shot',
        style: 'minimal',
        variables: {
          product_name: 'Test',
          custom_modifiers: 'floating in space',
        },
      });

      expect(result.prompt).toContain('floating in space');
    });

    it('should add custom additions', () => {
      const result = PromptBuilder.buildImagePrompt({
        type: 'hero_shot',
        style: 'minimal',
        variables: {
          product_name: 'Test',
        },
        customAdditions: 'sci-fi aesthetic',
      });

      expect(result.prompt).toContain('sci-fi aesthetic');
    });

    it('should include quality modifiers by default', () => {
      const result = PromptBuilder.buildImagePrompt({
        type: 'hero_shot',
        style: 'minimal',
        variables: {
          product_name: 'Test',
        },
      });

      expect(result.prompt).toContain('8k resolution');
      expect(result.prompt).toContain('photorealistic');
    });

    it('should exclude quality modifiers when requested', () => {
      const result = PromptBuilder.buildImagePrompt({
        type: 'hero_shot',
        style: 'minimal',
        variables: {
          product_name: 'Test',
        },
        includeQualityModifiers: false,
      });

      expect(result.prompt).not.toContain('8k resolution');
      expect(result.prompt).not.toContain('photorealistic');
    });
  });

  describe('buildImagePromptFromContext', () => {
    it('should build prompt from brand and product', () => {
      const result = PromptBuilder.buildImagePromptFromContext(
        'hero_shot',
        'minimal',
        mockBrand,
        mockProduct
      );

      expect(result.prompt).toContain(mockProduct.name);
      expect(result.prompt).toContain('professional');
      expect(result.negativePrompt).toBeDefined();
    });

    it('should include talent when provided', () => {
      const result = PromptBuilder.buildImagePromptFromContext(
        'lifestyle',
        'lifestyle',
        mockBrand,
        mockProduct,
        mockTalent
      );

      expect(result.prompt).toContain(mockTalent.name);
    });

    it('should include scene description', () => {
      const result = PromptBuilder.buildImagePromptFromContext(
        'lifestyle',
        'lifestyle',
        mockBrand,
        mockProduct,
        mockTalent,
        'morning coffee routine'
      );

      expect(result.prompt).toBeDefined();
    });
  });

  describe('buildVideoPrompt', () => {
    it('should build basic video prompt', () => {
      const result = PromptBuilder.buildVideoPrompt({
        type: 'ugc',
        style: 'lifestyle',
        variables: {
          product_name: 'Test Product',
          brand_style: 'authentic',
        },
      });

      expect(result.prompt).toContain('Test Product');
      expect(result.prompt).toContain('authentic');
      expect(result.negativePrompt).toBeDefined();
    });

    it('should add action description', () => {
      const result = PromptBuilder.buildVideoPrompt({
        type: 'ugc',
        style: 'lifestyle',
        variables: {
          product_name: 'Test',
          action_description: 'unboxing and first impressions',
        },
      });

      expect(result.prompt).toContain('unboxing and first impressions');
    });

    it('should add duration hint', () => {
      const result = PromptBuilder.buildVideoPrompt({
        type: 'product_demo',
        style: 'minimal',
        variables: {
          product_name: 'Test',
          duration_hint: 'quick short format',
        },
      });

      expect(result.prompt).toContain('quick short format');
    });
  });

  describe('buildVideoPromptFromContext', () => {
    it('should build prompt from brand and product', () => {
      const result = PromptBuilder.buildVideoPromptFromContext(
        'product_demo',
        'promotional',
        mockBrand,
        mockProduct
      );

      expect(result.prompt).toContain(mockProduct.name);
      expect(result.negativePrompt).toBeDefined();
    });

    it('should convert duration to hint', () => {
      const shortResult = PromptBuilder.buildVideoPromptFromContext(
        'ugc',
        'lifestyle',
        mockBrand,
        mockProduct,
        undefined,
        undefined,
        6
      );
      expect(shortResult.prompt).toContain('quick short format');

      const mediumResult = PromptBuilder.buildVideoPromptFromContext(
        'ugc',
        'lifestyle',
        mockBrand,
        mockProduct,
        undefined,
        undefined,
        15
      );
      expect(mediumResult.prompt).toContain('medium duration');

      const longResult = PromptBuilder.buildVideoPromptFromContext(
        'ugc',
        'lifestyle',
        mockBrand,
        mockProduct,
        undefined,
        undefined,
        30
      );
      expect(longResult.prompt).toContain('longer format');
    });
  });
});

// ============================================================================
// Convenience Function Tests
// ============================================================================

describe('Convenience Functions', () => {
  it('buildProductHeroPrompt should work', () => {
    const result = buildProductHeroPrompt(mockBrand, mockProduct, 'minimal');

    expect(result.prompt).toContain(mockProduct.name);
    expect(result.negativePrompt).toBeDefined();
  });

  it('buildLifestylePrompt should work', () => {
    const result = buildLifestylePrompt(
      mockBrand,
      mockProduct,
      mockTalent,
      'lifestyle'
    );

    expect(result.prompt).toContain(mockProduct.name);
    expect(result.prompt).toContain(mockTalent.name);
    expect(result.negativePrompt).toBeDefined();
  });
});

// ============================================================================
// Preset Tests
// ============================================================================

describe('Output Format Presets', () => {
  it('should have Instagram presets', () => {
    expect(OUTPUT_FORMAT_PRESETS.instagram_square).toBeDefined();
    expect(OUTPUT_FORMAT_PRESETS.instagram_story).toBeDefined();
    expect(OUTPUT_FORMAT_PRESETS.instagram_portrait).toBeDefined();
  });

  it('should have correct dimensions', () => {
    const square = OUTPUT_FORMAT_PRESETS.instagram_square;
    expect(square.width).toBe(1080);
    expect(square.height).toBe(1080);
    expect(square.aspectRatio).toBe('1:1');
  });

  it('should have platform tags', () => {
    const story = OUTPUT_FORMAT_PRESETS.instagram_story;
    expect(story.platform).toBe('meta');
  });
});

describe('Preset Helper Functions', () => {
  it('getRecommendedFormats should filter by platform', () => {
    const metaFormats = getRecommendedFormats('meta');
    expect(metaFormats.length).toBeGreaterThan(0);
    expect(metaFormats.every(f => f.platform === 'meta' || !f.platform)).toBe(true);
  });

  it('getPlatformRecommendation should return recommendations', () => {
    const metaRec = getPlatformRecommendation('meta');
    expect(metaRec).toBeDefined();
    expect(metaRec?.platform).toBe('meta');
    expect(metaRec?.preferredFormats).toBeDefined();
    expect(metaRec?.preferredStyles).toBeDefined();
  });

  it('requiresTalent should return correct values', () => {
    expect(requiresTalent('ugc_style')).toBe(true);
    expect(requiresTalent('lifestyle')).toBe(true);
    expect(requiresTalent('hero_shot')).toBe(false);
    expect(requiresTalent('product_only')).toBe(false);
  });

  it('requiresProduct should return correct values', () => {
    expect(requiresProduct('hero_shot')).toBe(true);
    expect(requiresProduct('lifestyle')).toBe(true);
    expect(requiresProduct('product_only')).toBe(true);
    expect(requiresProduct('testimonial')).toBe(false);
  });
});
