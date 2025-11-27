'use client';

import { useState } from 'react';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type ViewMode = 'grid' | 'list';

interface BrandsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddBrand: () => void;
}

export function BrandsHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddBrand,
}: BrandsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold">Brands</h1>
        <p className="text-muted-foreground mt-1">
          Manage your brand identities and guidelines
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Toggle and Add Button */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none border-l"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Brand Button */}
          <Button onClick={onAddBrand}>
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        </div>
      </div>
    </div>
  );
}
