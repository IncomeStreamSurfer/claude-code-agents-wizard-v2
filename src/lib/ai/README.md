# AI Services Integration Library

This library provides clients for integrating with various AI services used by AdForge.

## Services

### Nano Banana Pro (Image Generation)

Client for generating product images, lifestyle shots, and promotional graphics.

```typescript
import { getNanoBananaClient } from '@/lib/ai';

const client = getNanoBananaClient();

// Generate images
const job = await client.generateImage({
  brand_id: 'brand-123',
  product_id: 'product-456',
  prompt: 'Professional product photo on white background',
  output_formats: [
    { name: 'instagram-square', width: 1080, height: 1080 },
    { name: 'facebook-feed', width: 1200, height: 630 },
  ],
  variations: 3,
});

// Poll for completion
const result = await client.pollJobCompletion(job.job_id);
console.log('Generated images:', result.images);
```

### VEO 3.1 (Video Generation)

Client for generating UGC videos, product demos, testimonials, and dynamic ads.

```typescript
import { getVeoClient } from '@/lib/ai';

const client = getVeoClient();

// Generate video
const job = await client.generateVideo({
  brand_id: 'brand-123',
  product_id: 'product-456',
  talent_id: 'talent-789',
  prompt: 'UGC style video showing product unboxing and first impressions',
  duration: 30, // seconds
  aspect_ratio: '9:16', // TikTok/Stories format
  style_preset: 'lifestyle',
});

// Poll for completion (videos take longer, so polling is configured accordingly)
const result = await client.pollJobCompletion(job.job_id);
console.log('Generated video:', result.video);
```

## Configuration

Required environment variables:

```env
# Nano Banana Pro
NANO_BANANA_API_KEY=your-api-key
NANO_BANANA_API_URL=https://api.nanobanana.pro/v1

# VEO 3.1
VEO_API_KEY=your-api-key
VEO_API_URL=https://api.veo.ai/v3.1

# OpenRouter (Claude Haiku 4.5)
OPENROUTER_API_KEY=your-api-key
OPENROUTER_API_URL=https://openrouter.ai/api/v1
```

## Error Handling

All clients use consistent error handling:

```typescript
import {
  AIServiceError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  JobNotFoundError,
} from '@/lib/ai';

try {
  const job = await client.generateVideo(params);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}ms`);
  } else if (error instanceof ValidationError) {
    console.log('Invalid parameters:', error.details);
  } else if (error instanceof AuthenticationError) {
    console.log('API key is invalid or expired');
  } else if (error instanceof JobNotFoundError) {
    console.log('Job not found');
  } else if (error instanceof AIServiceError) {
    console.log(`Service error: ${error.code}`, error.details);
  }
}
```

## Features

### Automatic Retries

Both clients automatically retry failed requests with exponential backoff:
- Network errors
- Timeout errors
- Server errors (500, 502, 503, 504)
- Rate limit errors (429)

### Polling Utilities

Built-in polling methods for long-running generation jobs:
- **Images**: Default 2s interval, 30 attempts max (1 minute total)
- **Videos**: Default 5s interval, 120 attempts max (10 minutes total)

### Debug Logging

Set `NODE_ENV=development` to enable detailed request/response logging.

## Architecture

```
/src/lib/ai/
├── types.ts           # Shared types and errors
├── nano-banana.ts     # Image generation client
├── veo.ts            # Video generation client
├── index.ts          # Public exports
└── README.md         # This file
```

Each client follows the same pattern:
1. Configuration with environment variables
2. Request wrapper with retry logic
3. Error handling with custom error types
4. Validation of request parameters
5. Singleton factory function for easy access
