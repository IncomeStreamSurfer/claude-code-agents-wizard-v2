'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BrandWithCount } from '@/hooks/use-brands';

interface BrandCardProps {
  brand: BrandWithCount;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BrandCard({ brand, onClick, onEdit, onDelete }: BrandCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            {brand.logo_url && !imageError ? (
              <img
                src={brand.logo_url}
                alt={`${brand.name} logo`}
                className="h-12 w-12 rounded-lg object-cover border"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border">
                <span className="text-lg font-bold text-primary">
                  {brand.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Brand Name */}
        <div>
          <h3 className="font-semibold text-lg truncate">{brand.name}</h3>
          {brand.industry && (
            <p className="text-xs text-muted-foreground mt-0.5">{brand.industry}</p>
          )}
        </div>

        {/* Description */}
        {brand.website_url && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {brand.website_url}
          </p>
        )}

        {/* Footer Info */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Badge variant="secondary" className="text-xs">
            <Package className="h-3 w-3" />
            {brand.product_count ?? 0} products
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
