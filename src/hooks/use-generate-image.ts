'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StylePreset, OutputFormat } from '@/lib/ai/types';
import type { ImageType } from '@/lib/prompts/templates';

// Request type matching the API
interface GenerateImageRequest {
  brand_id: string;
  product_id?: string;
  talent_id?: string;
  image_type: ImageType;
  custom_prompt?: string;
  style_preset: StylePreset;
  output_formats: OutputFormat[];
  variations?: number;
}

// Response type from API (synchronous Gemini response)
interface GeneratedImageResult {
  url: string;
  format: OutputFormat;
  variation_index: number;
}

interface GenerateImageResponse {
  job_id: string;
  status: 'completed' | 'failed';
  images?: GeneratedImageResult[];
  error?: string;
}

// Generate image
async function generateImage(data: GenerateImageRequest): Promise<GenerateImageResponse> {
  const response = await fetch('/api/generate/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to generate image');
  }

  return result;
}

// Hook to generate image
export function useGenerateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateImage,
    onSuccess: () => {
      // Invalidate jobs list when a new job is created
      queryClient.invalidateQueries({ queryKey: ['generation-jobs'] });
      // Also invalidate creatives since new images may be generated
      queryClient.invalidateQueries({ queryKey: ['creatives'] });
    },
  });
}

export type { GenerateImageRequest, GenerateImageResponse, GeneratedImageResult };
