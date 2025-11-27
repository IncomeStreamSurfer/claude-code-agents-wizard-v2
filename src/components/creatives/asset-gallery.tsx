'use client';

import { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { AssetCard } from './asset-card';
import { AssetPreviewModal } from './asset-preview-modal';
import type { CreativeWithBrand } from '@/hooks/use-creatives';

interface AssetGalleryProps {
  creatives: CreativeWithBrand[];
}

export function AssetGallery({ creatives }: AssetGalleryProps) {
  const [selectedCreative, setSelectedCreative] = useState<CreativeWithBrand | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleCardClick = (creative: CreativeWithBrand) => {
    setSelectedCreative(creative);
    setPreviewOpen(true);
  };

  const handlePreviewClose = (open: boolean) => {
    setPreviewOpen(open);
    if (!open) {
      setSelectedCreative(null);
    }
  };

  if (creatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <FolderOpen className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No assets found</h3>
        <p className="text-muted-foreground max-w-md">
          No creative assets match your current filters. Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {creatives.map((creative) => (
          <AssetCard
            key={creative.id}
            creative={creative}
            onClick={() => handleCardClick(creative)}
          />
        ))}
      </div>

      <AssetPreviewModal
        creative={selectedCreative}
        open={previewOpen}
        onOpenChange={handlePreviewClose}
      />
    </>
  );
}
