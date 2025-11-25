'use client';

import { useMutation } from '@tanstack/react-query';

export type VideoType = 'ugc' | 'product_demo' | 'testimonial' | 'dynamic';
export type VideoDuration = 15 | 30 | 60;
export type AspectRatio = '1:1' | '9:16' | '16:9';
export type MusicMood = 'upbeat' | 'calm' | 'energetic' | 'professional';

interface GenerateVideoRequest {
  brand_id: string;
  video_type: VideoType;
  product_id?: string;
  talent_id?: string;
  script?: string;
  scene_description?: string;
  style_preset?: string;
  duration: VideoDuration;
  aspect_ratio: AspectRatio;
  music_mood?: MusicMood;
  include_captions?: boolean;
}

interface GenerateVideoResponse {
  success: boolean;
  job_id: string;
  message?: string;
}

async function generateVideo(data: GenerateVideoRequest): Promise<GenerateVideoResponse> {
  const response = await fetch('/api/generate/video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to generate video' }));
    throw new Error(error.message || 'Failed to generate video');
  }

  return response.json();
}

export function useGenerateVideo() {
  return useMutation({
    mutationFn: generateVideo,
  });
}
