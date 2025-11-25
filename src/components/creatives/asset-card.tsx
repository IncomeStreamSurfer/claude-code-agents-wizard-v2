'use client';

import { Image, Video, PlayCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { CreativeWithBrand } from '@/hooks/use-creatives';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  creative: CreativeWithBrand;
  onClick: () => void;
}

export function AssetCard({ creative, onClick }: AssetCardProps) {
  const isVideo = creative.type === 'video';
  const thumbnailUrl = creative.thumbnail_url || creative.file_url;

  // Get status badge info
  const getStatusBadge = () => {
    if (creative.is_approved === true) {
      return { label: 'Approved', variant: 'default' as const, icon: CheckCircle };
    }
    if (creative.is_approved === false) {
      return { label: 'Rejected', variant: 'destructive' as const, icon: XCircle };
    }
    return { label: 'Draft', variant: 'secondary' as const, icon: Clock };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  // Get type badge info
  const TypeIcon = isVideo ? Video : Image;

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={creative.name || 'Creative asset'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Video play overlay */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur">
            <TypeIcon className="h-3 w-3" />
            {creative.type}
          </Badge>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <Badge variant={statusBadge.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusBadge.label}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-1">
          {creative.name || 'Untitled'}
        </h3>

        {/* Brand name */}
        {creative.brands && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {creative.brands.name}
          </p>
        )}

        {/* Source/Model badge */}
        {creative.source === 'generated' && creative.metadata && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {(creative.metadata as any).model_used === 'nano_banana_pro' && 'Nano Banana Pro'}
              {(creative.metadata as any).model_used === 'veo_3_1' && 'VEO 3.1'}
              {!(creative.metadata as any).model_used && 'AI Generated'}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
