'use client';

import { IMAGE_TYPES, type ImageTypeInfo } from '@/lib/prompts/presets';
import type { ImageType } from '@/lib/prompts/templates';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImageTypeSelectorProps {
  value: ImageType | null;
  onChange: (value: ImageType) => void;
}

export function ImageTypeSelector({ value, onChange }: ImageTypeSelectorProps) {
  const types = Object.entries(IMAGE_TYPES) as [ImageType, ImageTypeInfo][];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {types.map(([key, info]) => (
        <Card
          key={key}
          className={cn(
            'p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md',
            value === key && 'border-primary bg-primary/5 shadow-md'
          )}
          onClick={() => onChange(key)}
        >
          <div className="text-center space-y-1">
            <div className="font-semibold text-sm">{info.name}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {info.description}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
