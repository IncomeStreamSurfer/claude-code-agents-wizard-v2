'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GenerationJob, JobStatus } from '@/types/database';

// Filters for jobs list
export interface GenerationJobsFilters {
  type?: 'image' | 'video';
  status?: JobStatus;
}

// Extended job type with brand info
export type GenerationJobWithBrand = GenerationJob & {
  brands?: {
    name: string;
    logo_url: string | null;
  };
};

// Fetch all generation jobs with optional filters
async function fetchGenerationJobs(filters?: GenerationJobsFilters): Promise<GenerationJobWithBrand[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(`/api/generate/jobs?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch generation jobs');
  }

  const result = await response.json();
  return result.data || result;
}

// Fetch single generation job
async function fetchGenerationJob(id: string): Promise<GenerationJobWithBrand> {
  const response = await fetch(`/api/generate/jobs/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch generation job');
  }

  const result = await response.json();
  return result.data || result;
}

// Cancel a job
async function cancelJob(id: string): Promise<void> {
  const response = await fetch(`/api/generate/jobs/${id}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel job');
  }
}

// Hook to fetch all generation jobs
export function useGenerationJobs(filters?: GenerationJobsFilters) {
  return useQuery({
    queryKey: ['generation-jobs', filters],
    queryFn: () => fetchGenerationJobs(filters),
  });
}

// Hook to fetch single generation job with auto-refresh while processing
export function useGenerationJob(id: string) {
  return useQuery({
    queryKey: ['generation-jobs', id],
    queryFn: () => fetchGenerationJob(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 3 seconds while processing or queued
      if (data?.status === 'processing' || data?.status === 'queued') {
        return 3000;
      }
      // Stop polling when completed, failed, or cancelled
      return false;
    },
  });
}

// Hook to cancel a job
export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelJob,
    onSuccess: (_, jobId) => {
      // Invalidate both list and single job queries
      queryClient.invalidateQueries({ queryKey: ['generation-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['generation-jobs', jobId] });
    },
  });
}
