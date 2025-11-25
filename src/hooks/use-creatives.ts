'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Creative, CreativeType, CreativeSource } from '@/types/database';

export type CreativeWithBrand = Creative & {
  brands?: {
    id: string;
    name: string;
    org_id: string;
  };
};

export interface CreativesFilters {
  brandId?: string;
  type?: CreativeType;
  source?: CreativeSource;
  search?: string;
}

// Fetch all creatives with optional filters
async function fetchCreatives(filters?: CreativesFilters): Promise<CreativeWithBrand[]> {
  const params = new URLSearchParams();

  if (filters?.brandId) params.append('brand_id', filters.brandId);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.source) params.append('source', filters.source);
  if (filters?.search) params.append('search', filters.search);

  const response = await fetch(`/api/creatives?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch creatives');
  }
  const result = await response.json();
  return result.data || result;
}

// Update creative approval status
async function updateCreativeApproval({
  id,
  isApproved,
}: {
  id: string;
  isApproved: boolean;
}): Promise<Creative> {
  const response = await fetch(`/api/creatives/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_approved: isApproved }),
  });
  if (!response.ok) {
    throw new Error('Failed to update creative approval');
  }
  const result = await response.json();
  return result.data || result;
}

// Delete a creative
async function deleteCreative(id: string): Promise<void> {
  const response = await fetch(`/api/creatives/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete creative');
  }
}

// Hook to fetch creatives with filters
export function useCreatives(filters?: CreativesFilters) {
  return useQuery({
    queryKey: ['creatives', filters],
    queryFn: () => fetchCreatives(filters),
  });
}

// Hook to approve/reject creative
export function useUpdateCreativeApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCreativeApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatives'] });
    },
  });
}

// Hook to delete creative
export function useDeleteCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCreative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatives'] });
    },
  });
}
