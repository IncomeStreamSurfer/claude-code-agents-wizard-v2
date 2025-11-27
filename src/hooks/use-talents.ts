'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Talent, TablesInsert, TablesUpdate } from '@/types/database';

// Extended type with brand info
export type TalentWithBrand = Talent & {
  brand?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
};

// Fetch all talents
async function fetchTalents(): Promise<TalentWithBrand[]> {
  const response = await fetch('/api/talents');
  if (!response.ok) {
    throw new Error('Failed to fetch talents');
  }
  const result = await response.json();
  return result.data || result;
}

// Fetch single talent
async function fetchTalent(id: string): Promise<Talent> {
  const response = await fetch(`/api/talents/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch talent');
  }
  const result = await response.json();
  return result.data || result;
}

// Create talent
async function createTalent(data: TablesInsert<'talents'>): Promise<Talent> {
  const response = await fetch('/api/talents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create talent');
  }
  const result = await response.json();
  return result.data || result;
}

// Update talent
async function updateTalent({ id, data }: { id: string; data: TablesUpdate<'talents'> }): Promise<Talent> {
  const response = await fetch(`/api/talents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update talent');
  }
  const result = await response.json();
  return result.data || result;
}

// Delete talent
async function deleteTalent(id: string): Promise<void> {
  const response = await fetch(`/api/talents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete talent');
  }
}

// Hook to fetch all talents
export function useTalents() {
  return useQuery({
    queryKey: ['talents'],
    queryFn: fetchTalents,
  });
}

// Hook to fetch single talent
export function useTalent(id: string) {
  return useQuery({
    queryKey: ['talents', id],
    queryFn: () => fetchTalent(id),
    enabled: !!id,
  });
}

// Hook to create talent
export function useCreateTalent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTalent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talents'] });
    },
  });
}

// Hook to update talent
export function useUpdateTalent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTalent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['talents'] });
      queryClient.invalidateQueries({ queryKey: ['talents', variables.id] });
    },
  });
}

// Hook to delete talent
export function useDeleteTalent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTalent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talents'] });
    },
  });
}
