'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Brand, TablesInsert, TablesUpdate } from '@/types/database';

// Extended type with product count
export type BrandWithCount = Brand & {
  product_count?: number;
};

// Fetch all brands
async function fetchBrands(): Promise<BrandWithCount[]> {
  const response = await fetch('/api/brands', {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch brands');
  }
  const result = await response.json();
  return result.data || result;
}

// Fetch single brand
async function fetchBrand(id: string): Promise<Brand> {
  const response = await fetch(`/api/brands/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch brand');
  }
  const result = await response.json();
  return result.data || result;
}

// Brand creation input type (org_id is added by the API)
type CreateBrandInput = Omit<TablesInsert<'brands'>, 'org_id'>;

// Create brand
async function createBrand(data: CreateBrandInput): Promise<Brand> {
  const response = await fetch('/api/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create brand');
  }
  const result = await response.json();
  return result.data || result;
}

// Update brand
async function updateBrand({ id, data }: { id: string; data: TablesUpdate<'brands'> }): Promise<Brand> {
  const response = await fetch(`/api/brands/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update brand');
  }
  const result = await response.json();
  return result.data || result;
}

// Delete brand
async function deleteBrand(id: string): Promise<void> {
  const response = await fetch(`/api/brands/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete brand');
  }
}

// Hook to fetch all brands
export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });
}

// Hook to fetch single brand
export function useBrand(id: string) {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => fetchBrand(id),
    enabled: !!id,
  });
}

// Hook to create brand
export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

// Hook to update brand
export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBrand,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands', variables.id] });
    },
  });
}

// Hook to delete brand
export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}
