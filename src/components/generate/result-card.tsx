'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Download, Maximize2, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ResultImage {
  url: string;
  width: number;
  height: number;
  format: string;
  variation?: string;
}

interface ResultCardProps {
  image: ResultImage;
  index: number;
  isApproved: boolean;
  isSelected: boolean;
  onApprove: () => void;
  onReject: () => void;
  onToggleSelect: () => void;
  onPreview: () => void;
  isPending?: boolean;
}

export function ResultCard({
  image,
  index,
  isApproved,
  isSelected,
  onApprove,
  onReject,
  onToggleSelect,
  onPreview,
  isPending = false,
}: ResultCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);

    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${index + 1}.${image.format || 'png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all',
        isSelected && 'ring-2 ring-primary',
        isApproved && 'ring-2 ring-green-500'
      )}
    >
      {/* Select checkbox */}
      <div
        className="absolute top-3 left-3 z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
      >
        <div
          className={cn(
            'h-5 w-5 rounded border-2 flex items-center justify-center transition-all',
            isSelected
              ? 'bg-primary border-primary'
              : 'bg-background/90 border-muted-foreground/50 backdrop-blur'
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      </div>

      {/* Approved badge */}
      {isApproved && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="gap-1 bg-green-600 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        </div>
      )}

      {/* Image */}
      <div
        className="relative aspect-square bg-muted overflow-hidden cursor-pointer"
        onClick={onPreview}
      >
        <img
          src={image.url}
          alt={`Generated result ${index + 1}`}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />

        {/* Preview overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>

      {/* Info and actions */}
      <div className="p-4 space-y-3">
        {/* Dimensions and format */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {image.width} × {image.height}
          </span>
          <span className="uppercase">{image.format || 'PNG'}</span>
        </div>

        {/* Variation name */}
        {image.variation && (
          <div className="text-sm font-medium">
            {image.variation}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isApproved ? (
            <>
              <Button
                size="sm"
                className="flex-1 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                disabled={isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                disabled={isPending}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
