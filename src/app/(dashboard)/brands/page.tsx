'use client';

import { useState, useMemo } from 'react';
import { Palette, AlertCircle } from 'lucide-react';
import { useBrands, useDeleteBrand } from '@/hooks/use-brands';
import type { Brand } from '@/types/database';
import { BrandsHeader, type ViewMode } from '@/components/brands/brands-header';
import { BrandCard } from '@/components/brands/brand-card';
import { BrandListItem } from '@/components/brands/brand-list-item';
import { BrandModal } from '@/components/brands/brand-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Fetch brands
  const { data: brands, isLoading, error } = useBrands();
  const deleteBrand = useDeleteBrand();

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    if (!brands) return [];
    if (!searchQuery.trim()) return brands;

    const query = searchQuery.toLowerCase();
    return brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(query) ||
        brand.industry?.toLowerCase().includes(query) ||
        brand.website_url?.toLowerCase().includes(query)
    );
  }, [brands, searchQuery]);

  // Handlers
  const handleAddBrand = () => {
    setEditingBrand(null);
    setModalOpen(true);
  };

  const handleBrandClick = (brandId: string) => {
    const brand = brands?.find((b) => b.id === brandId);
    if (brand) {
      setEditingBrand(brand);
      setModalOpen(true);
    }
  };

  const handleEditBrand = (brandId: string) => {
    const brand = brands?.find((b) => b.id === brandId);
    if (brand) {
      setEditingBrand(brand);
      setModalOpen(true);
    }
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingBrand(null);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBrand.mutateAsync(brandId);
    } catch (error) {
      console.error('Failed to delete brand:', error);
      // TODO: Show error toast
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <BrandsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddBrand={handleAddBrand}
        />

        {/* Loading skeleton */}
        {viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        )}

        <BrandModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          brand={editingBrand}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <BrandsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddBrand={handleAddBrand}
        />

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load brands</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading your brands. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>

        <BrandModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          brand={editingBrand}
        />
      </div>
    );
  }

  // Empty state
  if (!filteredBrands || filteredBrands.length === 0) {
    const hasSearchQuery = searchQuery.trim().length > 0;

    return (
      <div className="space-y-8">
        <BrandsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddBrand={handleAddBrand}
        />

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Palette className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {hasSearchQuery ? 'No brands found' : 'No brands yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {hasSearchQuery
              ? 'Try adjusting your search query to find what you\'re looking for.'
              : 'Get started by creating your first brand identity and guidelines.'}
          </p>
          {!hasSearchQuery && (
            <Button onClick={handleAddBrand}>Create Your First Brand</Button>
          )}
        </div>

        <BrandModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          brand={editingBrand}
        />
      </div>
    );
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="space-y-8">
        <BrandsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddBrand={handleAddBrand}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onClick={() => handleBrandClick(brand.id)}
              onEdit={() => handleEditBrand(brand.id)}
              onDelete={() => handleDeleteBrand(brand.id)}
            />
          ))}
        </div>

        <BrandModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          brand={editingBrand}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-8">
      <BrandsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddBrand={handleAddBrand}
      />

      <div className="space-y-3">
        {filteredBrands.map((brand) => (
          <BrandListItem
            key={brand.id}
            brand={brand}
            onClick={() => handleBrandClick(brand.id)}
            onEdit={() => handleEditBrand(brand.id)}
            onDelete={() => handleDeleteBrand(brand.id)}
          />
        ))}
      </div>

      <BrandModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        brand={editingBrand}
      />
    </div>
  );
}
