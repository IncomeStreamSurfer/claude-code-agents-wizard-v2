'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Package, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BrandWithCount } from '@/hooks/use-brands';

interface BrandListItemProps {
  brand: BrandWithCount;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BrandListItem({ brand, onClick, onEdit, onDelete }: BrandListItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-primary/50 bg-card"
      onClick={onClick}
    >
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Name and Industry */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base truncate">{brand.name}</h3>
              {brand.industry && (
                <Badge variant="outline" className="text-xs">
                  {brand.industry}
                </Badge>
              )}
            </div>

            {/* Website URL */}
            {brand.website_url && (
              <a
                href={brand.website_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 w-fit"
              >
                {brand.website_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Product Count */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge variant="secondary" className="text-xs">
              <Package className="h-3 w-3" />
              {brand.product_count ?? 0} products
            </Badge>

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
        </div>
      </div>
    </div>
  );
}
