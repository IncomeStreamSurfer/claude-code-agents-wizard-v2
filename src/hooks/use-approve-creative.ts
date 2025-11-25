'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ApproveCreativeData {
  brand_id: string;
  type: 'image' | 'video';
  file_url: string;
  thumbnail_url?: string;
  name?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration_seconds?: number;
  file_size_bytes?: number;
  source?: 'generated' | 'uploaded' | 'stock';
  metadata?: Record<string, unknown>;
  tags?: string[];
  is_approved?: boolean;
}

interface Creative {
  id: string;
  brand_id: string;
  type: 'image' | 'video';
  file_url: string;
  created_at: string;
}

async function approveCreative(data: ApproveCreativeData): Promise<Creative> {
  const response = await fetch('/api/creatives', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve creative');
  }

  const result = await response.json();
  return result.data;
}

export function useApproveCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveCreative,
    onSuccess: () => {
      // Invalidate creatives list
      queryClient.invalidateQueries({ queryKey: ['creatives'] });

      // Show success message
      toast.success('Creative approved', {
        description: 'The asset has been saved to your creative library',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to approve creative', {
        description: error.message,
      });
    },
  });
}
