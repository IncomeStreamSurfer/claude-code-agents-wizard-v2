# Nano Banana Pro - Quick Reference

## Installation

No installation needed - already implemented in `/src/lib/ai/`

## Environment Setup

```bash
# .env.local
NANO_BANANA_API_KEY=your_api_key_here
NANO_BANANA_API_URL=https://api.nanobanana.com/v1
```

## Basic Usage

```typescript
import { getNanoBananaClient } from '@/lib/ai';

const client = getNanoBananaClient();

// Start generation
const job = await client.generateImage({
  brand_id: 'brand_123',
  prompt: 'Professional product photography',
  output_formats: [
    { name: 'instagram', width: 1080, height: 1080 }
  ]
});

// Poll until complete
const result = await client.pollJobCompletion(job.job_id);

// Use images
result.images?.forEach(img => console.log(img.url));
```

## Common Parameters

```typescript
{
  brand_id: string;              // Required
  product_id?: string;           // Optional
  talent_id?: string;            // Optional
  prompt: string;                // Required
  negative_prompt?: string;      // Optional
  style_preset?: 'minimal' | 'bold' | 'lifestyle' | 'promotional';
  output_formats: Array<{        // Required, at least 1
    name: string;
    width: number;
    height: number;
  }>;
  variations?: number;           // 1-5, default 1
  seed?: number;                 // For reproducibility
}
```

## Error Handling

```typescript
import {
  ValidationError,
  RateLimitError,
  AuthenticationError
} from '@/lib/ai';

try {
  await client.generateImage(params);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors (400)
  } else if (error instanceof RateLimitError) {
    // Handle rate limits (429)
  } else if (error instanceof AuthenticationError) {
    // Handle auth errors (401)
  }
}
```

## Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `generateImage(params)` | Start image generation | `Promise<ImageGenerationJob>` |
| `getJobStatus(jobId)` | Check job status | `Promise<ImageGenerationJob>` |
| `cancelJob(jobId)` | Cancel a job | `Promise<{success, message}>` |
| `pollJobCompletion(jobId, interval?, maxAttempts?)` | Poll until complete | `Promise<ImageGenerationJob>` |

## Job Status Values

- `pending` - Job is queued
- `processing` - Generation in progress
- `completed` - Done, images available
- `failed` - Error occurred
- `cancelled` - Job was cancelled

## Common Formats

```typescript
// Instagram
{ name: 'instagram_square', width: 1080, height: 1080 }
{ name: 'instagram_story', width: 1080, height: 1920 }
{ name: 'instagram_landscape', width: 1080, height: 566 }

// Facebook
{ name: 'facebook_feed', width: 1200, height: 630 }
{ name: 'facebook_story', width: 1080, height: 1920 }

// Google Ads
{ name: 'google_display', width: 1200, height: 628 }
{ name: 'google_square', width: 1200, height: 1200 }

// Hero/Landing
{ name: 'hero_banner', width: 1920, height: 1080 }
{ name: 'hero_wide', width: 2560, height: 1440 }
```

## Manual Polling

```typescript
const job = await client.generateImage(params);

while (job.status === 'pending' || job.status === 'processing') {
  await new Promise(r => setTimeout(r, 2000)); // Wait 2s
  job = await client.getJobStatus(job.job_id);
}

if (job.status === 'completed') {
  console.log(job.images);
}
```

## Reproducible Generations

```typescript
// First generation
const job1 = await client.generateImage(params);
const result1 = await client.pollJobCompletion(job1.job_id);
const seed = result1.images?.[0]?.seed;

// Regenerate with same seed
const job2 = await client.generateImage({ ...params, seed });
const result2 = await client.pollJobCompletion(job2.job_id);

// Images will be identical
```

## Next.js API Route

```typescript
// app/api/generate/route.ts
import { getNanoBananaClient } from '@/lib/ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const client = getNanoBananaClient();

  try {
    const job = await client.generateImage(body);
    return NextResponse.json({ job_id: job.job_id });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

**"API key is required"**
→ Set `NANO_BANANA_API_KEY` in `.env.local`

**Timeout errors**
→ Increase `timeout` in config or use longer polling interval

**Rate limit errors**
→ Implement exponential backoff or job queue

**Validation errors**
→ Check all required fields and value ranges

## Files to Reference

- `README.md` - Quick start guide
- `INTEGRATION.md` - Full integration patterns
- `example.ts` - 6 complete examples
- `nano-banana.test.ts` - Validation tests

## Support

For implementation questions, see:
1. `INTEGRATION.md` for Next.js patterns
2. `example.ts` for usage examples
3. `types.ts` for all type definitions
