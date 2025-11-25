# Nano Banana Integration Guide

## Quick Integration for AdForge

### 1. Environment Setup

Ensure these variables are in your `.env.local`:

```bash
NANO_BANANA_API_KEY=your_api_key_here
NANO_BANANA_API_URL=https://api.nanobanana.com/v1
```

### 2. Using in Next.js API Routes

```typescript
// src/app/api/generate/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getNanoBananaClient } from '@/lib/ai';
import { AIServiceError, ValidationError } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const { brand_id, product_id, prompt, output_formats } = body;

    if (!brand_id || !prompt || !output_formats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate image
    const client = getNanoBananaClient();
    const job = await client.generateImage({
      brand_id,
      product_id,
      prompt,
      output_formats,
      style_preset: body.style_preset || 'minimal',
      variations: body.variations || 1,
    });

    return NextResponse.json({
      success: true,
      job_id: job.job_id,
      status: job.status,
    });

  } catch (error) {
    console.error('Image generation error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 400 }
      );
    }

    if (error instanceof AIServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Checking Job Status

```typescript
// src/app/api/generate/image/[jobId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getNanoBananaClient } from '@/lib/ai';
import { JobNotFoundError, AIServiceError } from '@/lib/ai';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const client = getNanoBananaClient();
    const job = await client.getJobStatus(params.jobId);

    return NextResponse.json(job);

  } catch (error) {
    if (error instanceof JobNotFoundError) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (error instanceof AIServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Using in Server Actions

```typescript
// src/app/actions/generate-image.ts
'use server';

import { getNanoBananaClient } from '@/lib/ai';
import { GenerateImageRequest } from '@/lib/ai';

export async function generateProductImage(
  brandId: string,
  productId: string,
  prompt: string
) {
  const client = getNanoBananaClient();

  const request: GenerateImageRequest = {
    brand_id: brandId,
    product_id: productId,
    prompt,
    output_formats: [
      { name: 'instagram_square', width: 1080, height: 1080 },
      { name: 'instagram_story', width: 1080, height: 1920 },
    ],
    style_preset: 'minimal',
    variations: 2,
  };

  try {
    const job = await client.generateImage(request);

    // Poll for completion
    const completed = await client.pollJobCompletion(job.job_id);

    return {
      success: true,
      images: completed.images,
    };
  } catch (error) {
    console.error('Generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### 5. Using in React Components (via Server Action)

```typescript
// src/components/creative/image-generator.tsx
'use client';

import { useState } from 'react';
import { generateProductImage } from '@/app/actions/generate-image';
import { GeneratedImage } from '@/lib/ai';

export function ImageGenerator({ brandId, productId }: Props) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateProductImage(brandId, productId, prompt);

      if (result.success && result.images) {
        setImages(result.images);
      } else {
        setError(result.error || 'Generation failed');
      }
    } catch (err) {
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* UI here */}
      {loading && <p>Generating images...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {images.map((img, i) => (
        <img key={i} src={img.url} alt={img.format.name} />
      ))}
    </div>
  );
}
```

### 6. Polling Pattern (Client-Side)

```typescript
// src/hooks/use-image-generation.ts
import { useState, useCallback } from 'react';

export function useImageGeneration() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [images, setImages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startGeneration = useCallback(async (params: any) => {
    try {
      // Start job
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setJobId(data.job_id);
      setStatus('pending');

      // Poll for completion
      pollJobStatus(data.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation');
      setStatus('error');
    }
  }, []);

  const pollJobStatus = async (id: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setError('Generation timeout');
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`/api/generate/image/${id}`);
        const job = await response.json();

        setStatus(job.status);

        if (job.status === 'completed') {
          setImages(job.images || []);
        } else if (job.status === 'failed') {
          setError(job.error || 'Generation failed');
        } else if (job.status === 'pending' || job.status === 'processing') {
          attempts++;
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (err) {
        setError('Failed to check status');
        setStatus('error');
      }
    };

    poll();
  };

  return {
    startGeneration,
    jobId,
    status,
    images,
    error,
    isLoading: status === 'pending' || status === 'processing',
  };
}
```

## Error Handling Best Practices

### 1. Always Catch Specific Errors

```typescript
try {
  await client.generateImage(params);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors (400)
    console.log('Invalid input:', error.details);
  } else if (error instanceof RateLimitError) {
    // Handle rate limiting (429)
    console.log('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof AuthenticationError) {
    // Handle auth errors (401)
    console.log('Invalid API key');
  } else if (error instanceof JobNotFoundError) {
    // Handle 404
    console.log('Job not found');
  } else if (error instanceof AIServiceError) {
    // Handle other AI service errors
    console.log('Service error:', error.code);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

### 2. Implement Retry Logic for Rate Limits

```typescript
async function generateWithRetry(params: GenerateImageRequest, maxRetries = 3) {
  const client = getNanoBananaClient();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.generateImage(params);
    } catch (error) {
      if (error instanceof RateLimitError && attempt < maxRetries) {
        const delay = error.retryAfter || 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### 3. Log Errors for Monitoring

```typescript
import { AIServiceError } from '@/lib/ai';

function logError(error: unknown, context: Record<string, any>) {
  if (error instanceof AIServiceError) {
    console.error('AI Service Error', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      context,
    });

    // Send to monitoring service (e.g., Sentry)
    // Sentry.captureException(error, { extra: context });
  }
}
```

## Database Integration

### Store Generation Jobs

```sql
-- Migration for storing generation jobs
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  brand_id UUID REFERENCES brands(id) NOT NULL,
  product_id UUID REFERENCES products(id),
  talent_id UUID REFERENCES talents(id),

  job_id TEXT NOT NULL UNIQUE, -- Nano Banana job ID
  job_type TEXT NOT NULL, -- 'image' or 'video'
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'

  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  style_preset TEXT,

  output_formats JSONB NOT NULL,
  generated_assets JSONB, -- URLs to generated images

  error_message TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generation_jobs_org ON generation_jobs(org_id);
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_generation_jobs_job_id ON generation_jobs(job_id);
```

### Save Job to Database

```typescript
async function saveGenerationJob(job: ImageGenerationJob, params: GenerateImageRequest) {
  const { data, error } = await supabase
    .from('generation_jobs')
    .insert({
      job_id: job.job_id,
      job_type: 'image',
      status: job.status,
      brand_id: params.brand_id,
      product_id: params.product_id,
      talent_id: params.talent_id,
      prompt: params.prompt,
      negative_prompt: params.negative_prompt,
      style_preset: params.style_preset,
      output_formats: params.output_formats,
      metadata: job.metadata,
    });

  if (error) {
    console.error('Failed to save job:', error);
  }
}
```

## Testing

See `nano-banana.test.ts` for comprehensive test examples.

Run tests:
```bash
npm test src/lib/ai/nano-banana.test.ts
```

## Troubleshooting

### Issue: "NANO_BANANA_API_KEY environment variable is not set"

**Solution**: Add the API key to your `.env.local` file:
```bash
NANO_BANANA_API_KEY=your_actual_api_key
```

### Issue: Timeout errors

**Solution**: Increase timeout in client configuration:
```typescript
const client = new NanoBananaClient({
  apiKey: process.env.NANO_BANANA_API_KEY!,
  apiUrl: process.env.NANO_BANANA_API_URL!,
  timeout: 60000, // 60 seconds
});
```

### Issue: Rate limiting

**Solution**: Implement a queue system or increase delay between requests.

## Next Steps

1. Implement VEO 3.1 client for video generation (similar pattern)
2. Add OpenRouter client for Claude Haiku 4.5 insights
3. Build generation queue system for managing multiple jobs
4. Implement webhook handlers for async job completion
5. Add caching layer for repeated generations with same seed
