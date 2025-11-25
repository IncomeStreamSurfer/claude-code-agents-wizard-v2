'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type VideoDuration = 15 | 30 | 60;

interface DurationSelectorProps {
  value: VideoDuration | null;
  onChange: (value: VideoDuration) => void;
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  const durations: VideoDuration[] = [15, 30, 60];

  return (
    <div className="space-y-2">
      <Label>Duration</Label>
      <div className="flex gap-4">
        {durations.map((duration) => (
          <label
            key={duration}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="radio"
              name="duration"
              value={duration}
              checked={value === duration}
              onChange={() => onChange(duration)}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-2 focus:ring-primary"
            />
            <span className={cn(
              'text-sm',
              value === duration ? 'font-semibold text-primary' : 'text-muted-foreground'
            )}>
              {duration}s
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
