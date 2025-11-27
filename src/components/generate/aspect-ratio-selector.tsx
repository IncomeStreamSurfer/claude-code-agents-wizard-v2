'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Square, Smartphone, Monitor } from 'lucide-react';

export type AspectRatio = '1:1' | '9:16' | '16:9';

interface AspectRatioInfo {
  label: string;
  description: string;
  icon: typeof Square;
}

const ASPECT_RATIOS: Record<AspectRatio, AspectRatioInfo> = {
  '1:1': {
    label: 'Square',
    description: 'Instagram feed',
    icon: Square,
  },
  '9:16': {
    label: 'Vertical',
    description: 'Stories, Reels',
    icon: Smartphone,
  },
  '16:9': {
    label: 'Horizontal',
    description: 'YouTube, Facebook',
    icon: Monitor,
  },
};

interface AspectRatioSelectorProps {
  value: AspectRatio | null;
  onChange: (value: AspectRatio) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const ratios = Object.entries(ASPECT_RATIOS) as [AspectRatio, AspectRatioInfo][];

  return (
    <div className="space-y-2">
      <Label>Aspect Ratio</Label>
      <div className="grid grid-cols-3 gap-3">
        {ratios.map(([key, info]) => {
          const Icon = info.icon;
          return (
            <label
              key={key}
              className={cn(
                'flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary',
                value === key
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200'
              )}
            >
              <input
                type="radio"
                name="aspect-ratio"
                value={key}
                checked={value === key}
                onChange={() => onChange(key)}
                className="sr-only"
              />
              <Icon className={cn(
                'h-5 w-5 mb-1',
                value === key ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-xs font-medium',
                value === key ? 'text-primary' : 'text-foreground'
              )}>
                {key} {info.label}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {info.description}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
