'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Video, Package, MessageSquare, Sparkles } from 'lucide-react';

export type VideoType = 'ugc' | 'product_demo' | 'testimonial' | 'dynamic';

interface VideoTypeInfo {
  name: string;
  description: string;
  icon: typeof Video;
}

const VIDEO_TYPES: Record<VideoType, VideoTypeInfo> = {
  ugc: {
    name: 'UGC Style',
    description: 'User-generated content style videos',
    icon: Video,
  },
  product_demo: {
    name: 'Product Demo',
    description: 'Showcase product features',
    icon: Package,
  },
  testimonial: {
    name: 'Testimonial',
    description: 'Customer testimonials',
    icon: MessageSquare,
  },
  dynamic: {
    name: 'Dynamic',
    description: 'Energetic promotional video',
    icon: Sparkles,
  },
};

interface VideoTypeSelectorProps {
  value: VideoType | null;
  onChange: (value: VideoType) => void;
}

export function VideoTypeSelector({ value, onChange }: VideoTypeSelectorProps) {
  const types = Object.entries(VIDEO_TYPES) as [VideoType, VideoTypeInfo][];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {types.map(([key, info]) => {
        const Icon = info.icon;
        return (
          <Card
            key={key}
            className={cn(
              'p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md',
              value === key && 'border-primary bg-primary/5 shadow-md'
            )}
            onClick={() => onChange(key)}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Icon className="h-6 w-6 text-primary" />
              <div className="font-semibold text-sm">{info.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {info.description}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
