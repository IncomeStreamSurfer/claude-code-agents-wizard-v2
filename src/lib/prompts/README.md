# Prompt Template System

A comprehensive prompt engineering system for AI-powered image and video generation in AdForge.

## Overview

This system provides:

- **Templates**: Pre-built prompt templates for different content types and styles
- **Builder**: Type-safe prompt construction with variable substitution
- **Presets**: Common output formats, styles, and platform recommendations

## Quick Start

```typescript
import { buildProductHeroPrompt } from '@/lib/prompts';

const { prompt, negativePrompt } = buildProductHeroPrompt(
  brand,
  product,
  'minimal'
);

// Use with Nano Banana API
const job = await nanoBananaClient.generateImage({
  brand_id: brand.id,
  product_id: product.id,
  prompt,
  negative_prompt: negativePrompt,
  style_preset: 'minimal',
  output_formats: [OUTPUT_FORMAT_PRESETS.instagram_square],
});
```

## Image Types

### 1. Hero Shot
Product as the hero with professional studio look.

```typescript
import { buildProductHeroPrompt } from '@/lib/prompts';

const result = buildProductHeroPrompt(brand, product, 'minimal');
```

**Best for**: Landing pages, product launches, e-commerce

### 2. Lifestyle
Product in real-world use with authentic context.

```typescript
import { buildLifestylePrompt } from '@/lib/prompts';

const result = buildLifestylePrompt(
  brand,
  product,
  talent,
  'lifestyle',
  'morning coffee routine'
);
```

**Best for**: Social media, brand storytelling, engagement

### 3. Product Only
Isolated product shot on clean background.

```typescript
import { PromptBuilder } from '@/lib/prompts';

const result = PromptBuilder.buildImagePromptFromContext(
  'product_only',
  'minimal',
  brand,
  product
);
```

**Best for**: E-commerce, catalogs, comparison ads

### 4. UGC Style
User-generated content aesthetic for authenticity.

```typescript
import { PromptBuilder } from '@/lib/prompts';

const result = PromptBuilder.buildImagePromptFromContext(
  'ugc_style',
  'lifestyle',
  brand,
  product,
  talent
);
```

**Best for**: Social proof, TikTok, Instagram, influencer content

## Video Types

### 1. UGC
User-generated content style video.

```typescript
import { buildUGCVideoPrompt } from '@/lib/prompts';

const result = buildUGCVideoPrompt(
  brand,
  product,
  talent,
  'lifestyle',
  'unboxing and first impressions'
);
```

**Best for**: TikTok, Reels, influencer campaigns

### 2. Product Demo
Clear demonstration of features and benefits.

```typescript
import { buildProductDemoPrompt } from '@/lib/prompts';

const result = buildProductDemoPrompt(
  brand,
  product,
  'promotional',
  15, // seconds
  'highlighting key features'
);
```

**Best for**: Product launches, how-to content

### 3. Testimonial
Customer sharing their experience.

```typescript
import { PromptBuilder } from '@/lib/prompts';

const result = PromptBuilder.buildVideoPromptFromContext(
  'testimonial',
  'lifestyle',
  brand,
  product,
  talent,
  'sharing 30-day results'
);
```

**Best for**: Trust building, social proof, conversion

### 4. Dynamic
Fast-paced energetic promotional content.

```typescript
import { PromptBuilder } from '@/lib/prompts';

const result = PromptBuilder.buildVideoPromptFromContext(
  'dynamic',
  'bold',
  brand,
  product,
  undefined,
  'rapid product showcase with transitions',
  6 // seconds
);
```

**Best for**: Performance ads, sales campaigns

## Style Presets

### Minimal
Clean, simple, professional aesthetic.

- White backgrounds
- Soft lighting
- Clean composition
- **Best for**: Product photography, e-commerce, tech

### Bold
High contrast, vibrant, eye-catching.

- Dramatic lighting
- Saturated colors
- Dynamic angles
- **Best for**: Sales campaigns, youth marketing, fashion

### Lifestyle
Natural, authentic, relatable.

- Natural lighting
- Real settings
- Genuine moments
- **Best for**: Brand building, social media, community

### Promotional
Professional, polished, commercial quality.

- Studio quality
- Commercial polish
- Conversion-focused
- **Best for**: Advertising, performance marketing

## Output Format Presets

Common ad sizes for all platforms:

```typescript
import { OUTPUT_FORMAT_PRESETS, getRecommendedFormats } from '@/lib/prompts';

// Get all Meta formats
const metaFormats = getRecommendedFormats('meta');

// Use specific format
const format = OUTPUT_FORMAT_PRESETS.instagram_square;
// { name: 'Instagram Square', width: 1080, height: 1080, aspectRatio: '1:1' }
```

### Instagram
- `instagram_square` - 1080x1080 (1:1)
- `instagram_portrait` - 1080x1350 (4:5)
- `instagram_story` - 1080x1920 (9:16)

### Facebook
- `facebook_feed` - 1200x630 (1.91:1)
- `facebook_square` - 1080x1080 (1:1)
- `facebook_story` - 1080x1920 (9:16)

### TikTok
- `tiktok_video` - 1080x1920 (9:16)

### Google Display
- `google_leaderboard` - 728x90
- `google_medium_rectangle` - 300x250
- `google_large_rectangle` - 336x280
- `google_skyscraper` - 160x600
- `google_half_page` - 300x600

### LinkedIn
- `linkedin_feed` - 1200x627 (1.91:1)
- `linkedin_square` - 1080x1080 (1:1)

### Pinterest
- `pinterest_standard` - 1000x1500 (2:3)
- `pinterest_square` - 1080x1080 (1:1)

## Platform Recommendations

Get recommended content types and styles per platform:

```typescript
import { getPlatformRecommendation } from '@/lib/prompts';

const metaRec = getPlatformRecommendation('meta');
// {
//   platform: 'meta',
//   preferredFormats: ['instagram_square', 'instagram_story'],
//   preferredStyles: ['lifestyle', 'minimal'],
//   preferredImageTypes: ['lifestyle', 'ugc_style'],
//   preferredVideoTypes: ['ugc', 'dynamic'],
//   notes: 'Meta platforms favor authentic, social content'
// }
```

## Advanced Usage

### Custom Variables

```typescript
import { PromptBuilder } from '@/lib/prompts';

const result = PromptBuilder.buildImagePrompt({
  type: 'hero_shot',
  style: 'bold',
  variables: {
    product_name: 'Wireless Headphones',
    product_description: 'Noise-cancelling over-ear',
    brand_style: 'modern tech',
    brand_color: '#0066CC',
    custom_modifiers: 'floating in space, cosmic background',
  },
  customAdditions: 'sci-fi aesthetic, futuristic lighting',
  includeQualityModifiers: true,
});
```

### Manual Template Selection

```typescript
import { IMAGE_TEMPLATES, QUALITY_MODIFIERS } from '@/lib/prompts';

const template = IMAGE_TEMPLATES.hero_shot;
const basePrompt = template.base;
const styleModifier = template.modifiers.minimal;
const negativePrompt = template.negativePrompts.minimal;

// Build your own prompt
const customPrompt = `${basePrompt}, ${styleModifier}, ${QUALITY_MODIFIERS.high_quality}`;
```

### Checking Requirements

```typescript
import { requiresTalent, requiresProduct } from '@/lib/prompts';

if (requiresTalent('ugc_style')) {
  // Show talent selector in UI
}

if (requiresProduct('hero_shot')) {
  // Show product selector in UI
}
```

## Integration with Generation Queue

```typescript
import { buildProductHeroPrompt, OUTPUT_FORMAT_PRESETS } from '@/lib/prompts';
import { getNanoBananaClient } from '@/lib/ai/nano-banana';

async function generateProductImage(brand, product) {
  // 1. Build prompt
  const { prompt, negativePrompt } = buildProductHeroPrompt(
    brand,
    product,
    'minimal'
  );

  // 2. Generate image
  const client = getNanoBananaClient();
  const job = await client.generateImage({
    brand_id: brand.id,
    product_id: product.id,
    prompt,
    negative_prompt: negativePrompt,
    style_preset: 'minimal',
    output_formats: [
      OUTPUT_FORMAT_PRESETS.instagram_square,
      OUTPUT_FORMAT_PRESETS.facebook_feed,
    ],
    variations: 3,
  });

  // 3. Poll for completion
  const result = await client.pollJobCompletion(job.job_id);

  return result.images;
}
```

## API Reference

### PromptBuilder

#### `buildImagePrompt(params: BuildImagePromptParams): PromptResult`

Build image prompt from parameters.

#### `buildVideoPrompt(params: BuildVideoPromptParams): PromptResult`

Build video prompt from parameters.

#### `buildImagePromptFromContext(...): PromptResult`

Build image prompt from database entities (Brand, Product, Talent).

#### `buildVideoPromptFromContext(...): PromptResult`

Build video prompt from database entities.

### Convenience Functions

#### `buildProductHeroPrompt(brand, product, style?, custom?): PromptResult`

Quick hero shot generation.

#### `buildLifestylePrompt(brand, product, talent, style?, scene?, custom?): PromptResult`

Quick lifestyle image generation.

#### `buildUGCVideoPrompt(brand, product, talent, style?, action?, custom?): PromptResult`

Quick UGC video generation.

#### `buildProductDemoPrompt(brand, product, style?, duration?, custom?): PromptResult`

Quick product demo video generation.

### Preset Helpers

#### `getRecommendedFormats(platform: string): OutputFormatPreset[]`

Get all formats for a platform.

#### `getOutputFormatPreset(name: string): OutputFormatPreset | undefined`

Get specific format preset.

#### `getPlatformRecommendation(platform: string): PlatformRecommendation | undefined`

Get platform-specific content recommendations.

#### `getFormatsByAspectRatio(ratio: string): OutputFormatPreset[]`

Get all formats with specific aspect ratio.

#### `requiresTalent(type: ImageType | VideoType): boolean`

Check if content type requires talent.

#### `requiresProduct(type: ImageType | VideoType): boolean`

Check if content type requires product.

## Examples

See `examples.ts` for comprehensive usage examples including:

- Simple product hero shot
- Lifestyle image with talent
- UGC-style video
- Advanced prompt building
- Multi-platform campaigns
- Product demo videos
- Custom variables
- Video with multiple variables

## Best Practices

1. **Always use negative prompts** - They significantly improve quality
2. **Match style to platform** - Use platform recommendations
3. **Be specific with variables** - More context = better results
4. **Test variations** - Generate 3-5 variations per prompt
5. **Combine templates** - Use custom additions for unique needs
6. **Consider aspect ratio** - Different platforms need different formats
7. **Use quality modifiers** - Enable for production content
8. **Brand consistency** - Always pass brand context for style alignment

## File Structure

```
/src/lib/prompts/
├── templates.ts      # Prompt templates for image/video types
├── builder.ts        # PromptBuilder class and convenience functions
├── presets.ts        # Output formats, styles, platform recommendations
├── index.ts          # Public API exports
├── examples.ts       # Usage examples
└── README.md         # This file
```
