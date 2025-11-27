/**
 * Example usage of Nano Banana Pro API client
 *
 * This file demonstrates how to use the NanoBananaClient for image generation.
 * Not meant to be imported - for reference only.
 */

import { getNanoBananaClient } from './nano-banana';
import {
  GenerateImageRequest,
  AIServiceError,
  RateLimitError,
  ValidationError,
} from './types';

// ============================================================================
// Example 1: Basic Image Generation
// ============================================================================

async function basicExample() {
  const client = getNanoBananaClient();

  try {
    // Start generation job
    const job = await client.generateImage({
      brand_id: 'brand_abc123',
      product_id: 'prod_xyz789',
      prompt: 'Professional product photography of sneakers on white background, studio lighting, high quality',
      negative_prompt: 'blurry, low quality, distorted, watermark',
      style_preset: 'minimal',
      output_formats: [
        { name: 'instagram_square', width: 1080, height: 1080 },
      ],
      variations: 1,
    });

    console.log('Job started:', job.job_id);
    console.log('Status:', job.status);

    // Poll for completion (polls every 2s, max 30 attempts = 60s timeout)
    const completed = await client.pollJobCompletion(job.job_id);

    console.log('Generation complete!');
    completed.images?.forEach((img, i) => {
      console.log(`Image ${i + 1}: ${img.url}`);
      console.log(`  Format: ${img.format.name}`);
      console.log(`  Size: ${img.format.width}x${img.format.height}`);
      console.log(`  Seed: ${img.seed}`);
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Invalid parameters:', error.message);
      console.error('Details:', error.details);
    } else if (error instanceof AIServiceError) {
      console.error('AI service error:', error.code, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// ============================================================================
// Example 2: Multiple Variations with Different Formats
// ============================================================================

async function multipleVariationsExample() {
  const client = getNanoBananaClient();

  const request: GenerateImageRequest = {
    brand_id: 'brand_abc123',
    product_id: 'prod_xyz789',
    talent_id: 'talent_model_001',
    prompt: 'Fashion model wearing product in urban lifestyle setting, golden hour lighting, professional photography',
    negative_prompt: 'cartoon, anime, illustration, low quality',
    style_preset: 'lifestyle',
    output_formats: [
      { name: 'instagram_square', width: 1080, height: 1080 },
      { name: 'instagram_story', width: 1080, height: 1920 },
      { name: 'facebook_feed', width: 1200, height: 630 },
      { name: 'google_display', width: 1200, height: 628 },
    ],
    variations: 3, // Generate 3 variations
  };

  try {
    const job = await client.generateImage(request);

    console.log('Generating 3 variations across 4 formats...');
    console.log('Total images to generate:', 3 * 4);

    const completed = await client.pollJobCompletion(job.job_id, 3000, 60); // Poll every 3s, 3min timeout

    console.log(`Generated ${completed.images?.length || 0} images`);
  } catch (error) {
    console.error('Generation failed:', error);
  }
}

// ============================================================================
// Example 3: Manual Job Status Checking
// ============================================================================

async function manualPollingExample() {
  const client = getNanoBananaClient();

  try {
    const job = await client.generateImage({
      brand_id: 'brand_abc123',
      prompt: 'Product hero image',
      output_formats: [{ name: 'hero', width: 1920, height: 1080 }],
    });

    const jobId = job.job_id;

    // Check status manually
    let status = await client.getJobStatus(jobId);
    console.log('Initial status:', status.status);

    // Poll manually with custom logic
    while (status.status === 'pending' || status.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      status = await client.getJobStatus(jobId);
      console.log('Status:', status.status);
    }

    if (status.status === 'completed') {
      console.log('Success! Images:', status.images);
    } else if (status.status === 'failed') {
      console.error('Generation failed:', status.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Example 4: Error Handling and Retries
// ============================================================================

async function errorHandlingExample() {
  const client = getNanoBananaClient();

  try {
    const job = await client.generateImage({
      brand_id: 'brand_abc123',
      prompt: 'Test image',
      output_formats: [{ name: 'test', width: 1024, height: 1024 }],
    });

    const completed = await client.pollJobCompletion(job.job_id);
    console.log('Success!', completed);

  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded');
      if (error.retryAfter) {
        console.log(`Retry after ${error.retryAfter}ms`);
        // Could implement queue system to retry later
      }
    } else if (error instanceof ValidationError) {
      console.error('Invalid request:', error.message);
      console.error('Validation details:', error.details);
    } else if (error instanceof AIServiceError) {
      console.error('AI Service Error:', {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      });

      // Log for monitoring
      // await logErrorToMonitoring(error);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// ============================================================================
// Example 5: Cancelling a Job
// ============================================================================

async function cancelJobExample() {
  const client = getNanoBananaClient();

  try {
    const job = await client.generateImage({
      brand_id: 'brand_abc123',
      prompt: 'Long running generation',
      output_formats: [{ name: 'test', width: 2048, height: 2048 }],
      variations: 5,
    });

    console.log('Job started:', job.job_id);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Cancel the job
    const result = await client.cancelJob(job.job_id);
    console.log('Cancelled:', result.message);

    // Verify cancellation
    const status = await client.getJobStatus(job.job_id);
    console.log('Final status:', status.status); // Should be 'cancelled'

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Example 6: Using Seeds for Reproducibility
// ============================================================================

async function reproducibleGenerationExample() {
  const client = getNanoBananaClient();

  const baseParams: GenerateImageRequest = {
    brand_id: 'brand_abc123',
    prompt: 'Minimalist product photography',
    output_formats: [{ name: 'hero', width: 1920, height: 1080 }],
    style_preset: 'minimal',
  };

  try {
    // Generate first image
    const job1 = await client.generateImage(baseParams);
    const result1 = await client.pollJobCompletion(job1.job_id);
    const seed = result1.images?.[0]?.seed;

    console.log('First generation seed:', seed);

    // Regenerate with same seed for identical result
    if (seed) {
      const job2 = await client.generateImage({
        ...baseParams,
        seed, // Use same seed
      });
      const result2 = await client.pollJobCompletion(job2.job_id);

      console.log('Second generation seed:', result2.images?.[0]?.seed);
      console.log('Seeds match:', seed === result2.images?.[0]?.seed);
      // Images should be identical
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Export examples (not meant to be used in production)
export {
  basicExample,
  multipleVariationsExample,
  manualPollingExample,
  errorHandlingExample,
  cancelJobExample,
  reproducibleGenerationExample,
};
