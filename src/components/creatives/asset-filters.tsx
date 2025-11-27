'use client';

import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CreativeType, CreativeSource } from '@/types/database';
import type { Brand } from '@/types/database';

interface AssetFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedBrand?: string;
  selectedType?: CreativeType;
  selectedSource?: CreativeSource;
  onBrandChange: (brandId?: string) => void;
  onTypeChange: (type?: CreativeType) => void;
  onSourceChange: (source?: CreativeSource) => void;
  brands?: Brand[];
}

export function AssetFilters({
  search,
  onSearchChange,
  selectedBrand,
  selectedType,
  selectedSource,
  onBrandChange,
  onTypeChange,
  onSourceChange,
  brands = [],
}: AssetFiltersProps) {
  const hasActiveFilters = selectedBrand || selectedType || selectedSource;

  const clearAllFilters = () => {
    onBrandChange(undefined);
    onTypeChange(undefined);
    onSourceChange(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or prompt..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Brand filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedBrand ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBrandChange(undefined)}
            className="gap-2"
          >
            <Filter className="h-3 w-3" />
            All Brands
          </Button>
          {brands.map((brand) => (
            <Button
              key={brand.id}
              variant={selectedBrand === brand.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onBrandChange(brand.id)}
            >
              {brand.name}
            </Button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!selectedType ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange(undefined)}
          >
            All Types
          </Button>
          <Button
            variant={selectedType === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange('image')}
          >
            Images
          </Button>
          <Button
            variant={selectedType === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange('video')}
          >
            Videos
          </Button>
          <Button
            variant={selectedType === 'carousel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange('carousel')}
          >
            Carousels
          </Button>
        </div>

        {/* Source filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!selectedSource ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSourceChange(undefined)}
          >
            All Sources
          </Button>
          <Button
            variant={selectedSource === 'generated' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSourceChange('generated')}
          >
            AI Generated
          </Button>
          <Button
            variant={selectedSource === 'uploaded' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSourceChange('uploaded')}
          >
            Uploaded
          </Button>
        </div>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2 text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex gap-2 flex-wrap">
          {selectedBrand && (
            <Badge variant="secondary" className="gap-1">
              Brand: {brands.find(b => b.id === selectedBrand)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onBrandChange(undefined)}
              />
            </Badge>
          )}
          {selectedType && (
            <Badge variant="secondary" className="gap-1">
              Type: {selectedType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onTypeChange(undefined)}
              />
            </Badge>
          )}
          {selectedSource && (
            <Badge variant="secondary" className="gap-1">
              Source: {selectedSource}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSourceChange(undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
