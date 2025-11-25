# Prompt System Architecture

## System Overview

The prompt template system is a three-layer architecture:

1. **Templates Layer** - Pre-built prompt templates with style modifiers
2. **Builder Layer** - Type-safe prompt construction with variable substitution
3. **Presets Layer** - Output formats and platform recommendations

## Component Relationships

```
UI Components
    ↓
Convenience Functions (buildProductHeroPrompt, etc.)
    ↓
PromptBuilder Class
    ↓
Templates + Variables → Prompt Result
    ↓
AI Service APIs (Nano Banana, VEO)
```

## Data Flow - Image Generation

```
1. User Input:
   - Image Type: hero_shot
   - Style: minimal
   - Product: Wireless Earbuds
   - Brand: TechCo

2. Function Call:
   buildProductHeroPrompt(brand, product, 'minimal')

3. Internal Process:
   - Extract brand.voice_profile → "modern, professional"
   - Extract brand.colors.primary → "#0066CC"
   - Create variables: { product_name, brand_style, brand_color }
   - Select IMAGE_TEMPLATES.hero_shot
   - Apply modifiers.minimal
   - Add quality modifiers
   - Build negative prompt

4. Output:
   {
     prompt: "Professional product photography of Wireless Earbuds...",
     negativePrompt: "clutter, busy background, harsh shadows..."
   }

5. API Integration:
   nanoBananaClient.generateImage({ prompt, negative_prompt, ... })
```

## Template Selection Logic

### Image Templates

```typescript
// If talent is provided:
template.withTalent → "featuring {talent_description} with {product_name}"

// If product description is provided:
template.withProduct → "showcasing {product_name}, {product_description}"

// Default:
template.base → "Professional photography of {product_name}"
```

### Style Application

Each template has 4 style modifiers:
- `minimal` - Clean, simple, professional
- `bold` - High contrast, dramatic
- `lifestyle` - Natural, authentic
- `promotional` - Polished, commercial

Style modifier is appended to base prompt.

## Variable Substitution

```typescript
// Template with placeholders
"Product photography of {product_name}, {brand_style} aesthetic"

// Variables object
{
  product_name: "Coffee Mug",
  brand_style: "artisanal, handcrafted"
}

// Result after substitution
"Product photography of Coffee Mug, artisanal, handcrafted aesthetic"

// Unreplaced placeholders are removed
"{undefined_var}" → "" (empty string)
```

## Platform Recommendations

```typescript
// Input: Platform name
getPlatformRecommendation('meta')

// Output: Recommendations
{
  platform: 'meta',
  preferredFormats: ['instagram_square', 'instagram_story'],
  preferredStyles: ['lifestyle', 'minimal'],
  preferredImageTypes: ['lifestyle', 'ugc_style'],
  preferredVideoTypes: ['ugc', 'dynamic'],
  notes: 'Meta platforms favor authentic, social content'
}
```

## Extensibility

### Adding New Image Type

1. Update `ImageType` in `templates.ts`
2. Add template to `IMAGE_TEMPLATES`
3. Add info to `IMAGE_TYPES` in `presets.ts`

### Adding New Style

1. Update `StylePreset` in `ai/types.ts`
2. Add modifiers to all templates
3. Add negative prompts to all templates
4. Add info to `STYLE_PRESETS`

### Adding New Platform

1. Add formats to `OUTPUT_FORMAT_PRESETS`
2. Add recommendation to `PLATFORM_RECOMMENDATIONS`

## Integration Points

### With Nano Banana API

```typescript
import { buildProductHeroPrompt, OUTPUT_FORMAT_PRESETS } from '@/lib/prompts';

const { prompt, negativePrompt } = buildProductHeroPrompt(brand, product, 'minimal');

await nanoBananaClient.generateImage({
  brand_id: brand.id,
  prompt,
  negative_prompt: negativePrompt,
  output_formats: [OUTPUT_FORMAT_PRESETS.instagram_square],
});
```

### With VEO API

```typescript
import { buildUGCVideoPrompt } from '@/lib/prompts';

const { prompt } = buildUGCVideoPrompt(brand, product, talent, 'lifestyle');

await veoClient.generateVideo({
  brand_id: brand.id,
  prompt,
  aspect_ratio: '9:16',
});
```

### With UI Components

```typescript
import { IMAGE_TYPES, requiresTalent, getRecommendedFormats } from '@/lib/prompts';

// Check requirements
if (requiresTalent(selectedType)) {
  // Show talent selector
}

// Get type info for display
const typeInfo = IMAGE_TYPES[selectedType];
console.log(typeInfo.description); // "Product as the hero..."
console.log(typeInfo.bestFor); // ["Landing pages", ...]

// Get platform formats
const formats = getRecommendedFormats('meta');
// Returns all Meta formats
```

## Type Safety

All functions are fully typed:

```typescript
// Type-safe image types
type ImageType = 'hero_shot' | 'lifestyle' | 'product_only' | 'ugc_style';

// Type-safe styles
type StylePreset = 'minimal' | 'bold' | 'lifestyle' | 'promotional';

// Type-safe results
interface PromptResult {
  prompt: string;
  negativePrompt: string;
}
```

## Performance

- Templates are static constants (zero runtime cost)
- Variable substitution is simple string replacement
- No external dependencies
- Small bundle size
- Tree-shakeable exports

## Testing

Unit tests cover:
- Template completeness
- Variable substitution
- Style application
- Helper functions
- Type safety

## Best Practices

1. Always use negative prompts
2. Match style to platform
3. Include quality modifiers for production
4. Test with variations
5. Use convenience functions for common cases
6. Leverage platform recommendations
