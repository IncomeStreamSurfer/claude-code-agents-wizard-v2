'use client';

import { useState, useMemo } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { useProducts, useDeleteProduct, type ProductWithBrand } from '@/hooks/use-products';
import { ProductsHeader } from '@/components/products/products-header';
import { ProductCard } from '@/components/products/product-card';
import { ProductModal } from '@/components/products/product-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithBrand | null>(null);

  // Fetch products
  const { data: products, isLoading, error } = useProducts();
  const deleteProduct = useDeleteProduct();

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // Filter by brand
    if (selectedBrandId) {
      filtered = filtered.filter((p) => p.brand_id === selectedBrandId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.brand?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedBrandId, searchQuery]);

  // Handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleProductClick = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setModalOpen(true);
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setModalOpen(true);
    }
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to delete product:', error);
      // TODO: Show error toast
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <ProductsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBrandId={selectedBrandId}
          onBrandChange={setSelectedBrandId}
          onAddProduct={handleAddProduct}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        <ProductModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          product={editingProduct}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <ProductsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBrandId={selectedBrandId}
          onBrandChange={setSelectedBrandId}
          onAddProduct={handleAddProduct}
        />

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading your products. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>

        <ProductModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          product={editingProduct}
        />
      </div>
    );
  }

  // Empty state
  if (!filteredProducts || filteredProducts.length === 0) {
    const hasFilters = searchQuery.trim().length > 0 || selectedBrandId !== null;

    return (
      <div className="space-y-8">
        <ProductsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBrandId={selectedBrandId}
          onBrandChange={setSelectedBrandId}
          onAddProduct={handleAddProduct}
        />

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {hasFilters ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {hasFilters
              ? 'Try adjusting your filters or search query to find what you\'re looking for.'
              : 'Get started by adding your first product to the catalog.'}
          </p>
          {!hasFilters && (
            <Button onClick={handleAddProduct}>Add Your First Product</Button>
          )}
        </div>

        <ProductModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          product={editingProduct}
        />
      </div>
    );
  }

  // Products grid view
  return (
    <div className="space-y-8">
      <ProductsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBrandId={selectedBrandId}
        onBrandChange={setSelectedBrandId}
        onAddProduct={handleAddProduct}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleProductClick(product.id)}
            onEdit={() => handleEditProduct(product.id)}
            onDelete={() => handleDeleteProduct(product.id)}
          />
        ))}
      </div>

      <ProductModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        product={editingProduct}
      />
    </div>
  );
}
