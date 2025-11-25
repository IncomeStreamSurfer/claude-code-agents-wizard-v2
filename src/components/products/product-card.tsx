'use client';

import { MoreVertical, Edit, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { ProductWithBrand } from '@/hooks/use-products';

interface ProductCardProps {
  product: ProductWithBrand;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, onClick, onEdit, onDelete }: ProductCardProps) {
  const primaryImage = product.images?.[0];
  const hasMultipleImages = (product.images?.length || 0) > 1;

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return null;
    const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          {hasMultipleImages && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            >
              +{(product.images?.length || 1) - 1}
            </Badge>
          )}
          {!product.is_active && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
            >
              Inactive
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          {product.sku && (
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          )}
          {product.brand && (
            <p className="text-sm text-muted-foreground">{product.brand.name}</p>
          )}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {product.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          {product.price && (
            <p className="font-semibold text-lg">
              {formatPrice(product.price, product.currency)}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
