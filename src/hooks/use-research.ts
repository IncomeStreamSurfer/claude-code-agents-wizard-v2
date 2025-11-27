'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface ResearchInput {
  productName: string;
  businessType: string;
  businessDescription: string;
  targetAudience: string;
  brand_id?: string;
  usePrioritized?: boolean;
  analyzeWithAI?: boolean;
}

export interface ResearchResultItem {
  category: string;
  query: string;
  data: string;
  success: boolean;
  error?: string;
}

export interface ResearchResponse {
  id: string;
  status: 'completed' | 'failed';
  results: ResearchResultItem[];
  analysis?: string;
  adCopySuggestions?: string;
  timestamp: string;
  searchCount: number;
  successCount: number;
}

export interface StoredResearchReport {
  id: string;
  brand_id: string;
  type: string;
  title: string | null;
  data: {
    input: {
      productName: string;
      businessType: string;
      businessDescription: string;
      targetAudience: string;
    };
    results: ResearchResultItem[];
    analysis: string | null;
    adCopySuggestions: string | null;
    searchCount: number;
    successCount: number;
  };
  created_at: string | null;
  generated_at: string | null;
  brands?: {
    id: string;
    name: string;
  };
}

// ============================================================================
// API Functions
// ============================================================================

async function runResearch(input: ResearchInput): Promise<ResearchResponse> {
  const response = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to run research');
  }

  return response.json();
}

async function fetchResearchHistory(brandId?: string): Promise<StoredResearchReport[]> {
  const params = new URLSearchParams();
  if (brandId) params.append('brand_id', brandId);

  const response = await fetch(`/api/research?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch research history');
  }

  const result = await response.json();
  return result.data || [];
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to run market research
 */
export function useRunResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runResearch,
    onSuccess: () => {
      // Invalidate research history cache
      queryClient.invalidateQueries({ queryKey: ['research-history'] });
    },
  });
}

/**
 * Hook to fetch research history
 */
export function useResearchHistory(brandId?: string) {
  return useQuery({
    queryKey: ['research-history', brandId],
    queryFn: () => fetchResearchHistory(brandId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
