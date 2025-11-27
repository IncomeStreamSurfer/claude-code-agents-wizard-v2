/**
 * Prompt System Usage Examples
 *
 * This file demonstrates how to use the prompt template system
 * for AI image and video generation.
 */

import { PromptBuilder } from './builder';
import type { Brand, Product, Talent } from '@/types/database';
import {
  buildProductHeroPrompt,
  buildLifestylePrompt,
  buildUGCVideoPrompt,
  buildProductDemoPrompt,
} from './builder';
import {
  OUTPUT_FORMAT_PRESETS,
  getRecommendedFormats,
  getPlatformRecommendation,
  requiresTalent,
} from './presets';

// ============================================================================
// Example 1: Simple Product Hero Shot
// ============================================================================

export function exampleProductHeroShot() {
  const brand: Brand = {
    id: '123',
    org_id: 'org-123',
    name: 'TechCo',
    voice_profile: {
      tone: 'modern',
      style: 'professional',
      personality: 'innovative',
    },
    colors: {
      primary: '#0066CC',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    industry: null,
    logo_url: null,
    fonts: null,
    target_audience: null,
    website_url: null,
  };

  const product: Product = {
    id: 'prod-123',
    brand_id: '123',
    name: 'Wireless Earbuds Pro',
    description: 'Premium noise-cancelling wireless earbuds',
    price: 199.99,
    currency: 'USD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [],
    sku: null,
    is_active: true,
    metadata: null,
    variants: null,
    processed_images: null,
    feed_product_id: null,
    feed_source: null,
  };

  // Generate prompt for minimal style hero shot
  const { prompt, negativePrompt } = buildProductHeroPrompt(
    brand,
    product,
    'minimal'
  );

  console.log('Prompt:', prompt);
  console.log('Negative:', negativePrompt);

  // Output:
  // Prompt: Professional product photography of Wireless Earbuds Pro, hero shot composition, modern, professional, innovative aesthetic, clean white background, soft diffused studio lighting, minimalist composition, clean edges, professional product photography, crisp details, shadow-free, 8k resolution, highly detailed, sharp focus, professional quality, photorealistic, lifelike, ultra realistic, true to life, commercial photography quality, advertising grade, professional production
  // Negative: clutter, busy background, harsh shadows, distortion, low quality, blurry, noise, artifacts, color cast, low quality, blurry, pixelated, distorted, artifacts, watermark, text overlay, poor composition, amateur, unprofessional
}

// ============================================================================
// Example 2: Lifestyle Image with Talent
// ============================================================================

export function exampleLifestyleWithTalent() {
  const brand: Brand = {
    id: '123',
    org_id: 'org-123',
    name: 'ActiveWear',
    voice_profile: {
      tone: 'energetic',
      style: 'bold',
    },
    colors: {
      primary: '#FF6B35',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    industry: null,
    logo_url: null,
    fonts: null,
    target_audience: null,
    website_url: null,
  };

  const product: Product = {
    id: 'prod-456',
    brand_id: '123',
    name: 'Performance Yoga Mat',
    description: 'Ultra-grip eco-friendly yoga mat',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: null,
    currency: null,
    images: [],
    sku: null,
    is_active: true,
    metadata: null,
    variants: null,
    processed_images: null,
    feed_product_id: null,
    feed_source: null,
  };

  const talent: Talent = {
    id: 'talent-789',
    brand_id: '123',
    name: 'Sarah',
    notes: 'Fitness instructor, 30s, energetic presence',
    reference_images: ['image1.jpg'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    approved_platforms: null,
    expires_at: null,
    face_encoding: null,
    usage_rights: null,
  };

  const { prompt, negativePrompt } = buildLifestylePrompt(
    brand,
    product,
    talent,
    'lifestyle',
    'outdoor yoga session at sunrise'
  );

  console.log('Prompt:', prompt);
  console.log('Negative:', negativePrompt);
}

// ============================================================================
// Example 3: UGC-Style Video
// ============================================================================

export function exampleUGCVideo() {
  const brand: Brand = {
    id: '123',
    org_id: 'org-123',
    name: 'BeautyBrand',
    voice_profile: {
      tone: 'friendly',
      style: 'authentic',
    },
    colors: {
      primary: '#FFB6C1',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    industry: null,
    logo_url: null,
    fonts: null,
    target_audience: null,
    website_url: null,
  };

  const product: Product = {
    id: 'prod-999',
    brand_id: '123',
    name: 'Glow Serum',
    description: 'Vitamin C brightening serum',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: null,
    currency: null,
    images: [],
    sku: null,
    is_active: true,
    metadata: null,
    variants: null,
    processed_images: null,
    feed_product_id: null,
    feed_source: null,
  };

  const talent: Talent = {
    id: 'talent-888',
    brand_id: '123',
    name: 'Emma',
    notes: 'Beauty enthusiast, 20s, natural style',
    reference_images: ['image1.jpg'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    approved_platforms: null,
    expires_at: null,
    face_encoding: null,
    usage_rights: null,
  };

  const { prompt, negativePrompt } = buildUGCVideoPrompt(
    brand,
    product,
    talent,
    'lifestyle',
    'applying serum during morning skincare routine'
  );

  console.log('Prompt:', prompt);
  console.log('Negative:', negativePrompt);
}

// ============================================================================
// Example 4: Advanced - Manual Prompt Building
// ============================================================================

export function exampleAdvancedPromptBuilding() {
  const brand: Brand = {
    id: '123',
    org_id: 'org-123',
    name: 'LuxuryWatch',
    voice_profile: {
      tone: 'sophisticated',
      style: 'elegant',
      personality: 'premium',
    },
    colors: {
      primary: '#1a1a1a',
      accent: '#D4AF37',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    industry: null,
    logo_url: null,
    fonts: null,
    target_audience: null,
    website_url: null,
  };

  const product: Product = {
    id: 'prod-001',
    brand_id: '123',
    name: 'Chronograph Elite',
    description: 'Swiss automatic chronograph with sapphire crystal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: null,
    currency: null,
    images: [],
    sku: null,
    is_active: true,
    metadata: null,
    variants: null,
    processed_images: null,
    feed_product_id: null,
    feed_source: null,
  };

  // Build with custom modifiers
  const { prompt, negativePrompt } = PromptBuilder.buildImagePromptFromContext(
    'hero_shot',
    'bold',
    brand,
    product,
    undefined,
    undefined,
    'luxury setting with marble surface, dramatic rim lighting, macro lens detail'
  );

  console.log('Prompt:', prompt);
  console.log('Negative:', negativePrompt);
}

// ============================================================================
// Example 5: Using Presets for Multi-Platform Campaign
// ============================================================================

export function exampleMultiPlatformCampaign() {
  // Get recommended formats for Instagram
  const metaFormats = getRecommendedFormats('meta');
  console.log('Meta formats:', metaFormats.map(f => f.name));

  // Get specific preset
  const instagramStory = OUTPUT_FORMAT_PRESETS.instagram_story;
  console.log('Instagram Story:', instagramStory);

  // Get platform-specific recommendations
  const metaRecommendations = getPlatformRecommendation('meta');
  console.log('Meta recommendations:', metaRecommendations);

  // Check if image type requires talent
  const needsTalent = requiresTalent('ugc_style');
  console.log('UGC style needs talent:', needsTalent);
}

// ============================================================================
// Example 6: Product Demo Video
// ============================================================================

export function exampleProductDemo() {
  const brand: Brand = {
    id: '123',
    org_id: 'org-123',
    name: 'SmartHome',
    voice_profile: {
      tone: 'innovative',
      style: 'modern',
    },
    colors: {
      primary: '#00C9FF',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    industry: null,
    logo_url: null,
    fonts: null,
    target_audience: null,
    website_url: null,
  };

  const product: Product = {
    id: 'prod-777',
    brand_id: '123',
    name: 'Smart Thermostat X1',
    description: 'AI-powered climate control',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: null,
    currency: null,
    images: [],
    sku: null,
    is_active: true,
    metadata: null,
    variants: null,
    processed_images: null,
    feed_product_id: null,
    feed_source: null,
  };

  const { prompt, negativePrompt } = buildProductDemoPrompt(
    brand,
    product,
    'minimal',
    15, // 15 seconds
    'showing touch screen interface and voice control features'
  );

  console.log('Prompt:', prompt);
  console.log('Negative:', negativePrompt);
}

// ============================================================================
// Example 7: Custom Variables
// ============================================================================

export function exampleCustomVariables() {
  const result = PromptBuilder.buildImagePrompt({
    type: 'product_only',
    style: 'minimal',
    variables: {
      product_name: 'Premium Coffee Beans',
      product_description: 'Single-origin Ethiopian coffee',
      brand_style: 'artisanal, craft',
      brand_color: '#6F4E37',
      custom_modifiers: 'scattered coffee beans, burlap texture, warm coffee tones',
    },
    customAdditions: 'magazine editorial style, food photography',
  });

  console.log('Prompt:', result.prompt);
  console.log('Negative:', result.negativePrompt);
}

// ============================================================================
// Example 8: Video with Multiple Variables
// ============================================================================

export function exampleVideoWithVariables() {
  const result = PromptBuilder.buildVideoPrompt({
    type: 'dynamic',
    style: 'bold',
    variables: {
      product_name: 'Energy Drink X',
      product_description: 'Zero sugar energy boost',
      brand_style: 'extreme, high-energy',
      brand_color: 'electric blue',
      action_description: 'can spinning with liquid splash effects',
      duration_hint: 'quick short format',
    },
    customAdditions: 'fast cuts, slow-motion liquid, intense energy vibe',
  });

  console.log('Prompt:', result.prompt);
  console.log('Negative:', result.negativePrompt);
}
