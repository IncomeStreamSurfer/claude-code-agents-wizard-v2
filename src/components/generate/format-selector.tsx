'use client';

import { OUTPUT_FORMAT_PRESETS, type OutputFormatPreset } from '@/lib/prompts/presets';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormatSelectorProps {
  value: string[]; // Array of format keys
  onChange: (value: string[]) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  // Popular formats to show
  const popularFormats = [
    'instagram_square',
    'instagram_story',
    'facebook_feed',
    'instagram_portrait',
    'landscape_hd',
  ];

  const formats = popularFormats.map(key => ({
    key,
    ...OUTPUT_FORMAT_PRESETS[key],
  }));

  const handleToggle = (formatKey: string) => {
    if (value.includes(formatKey)) {
      onChange(value.filter(k => k !== formatKey));
    } else {
      onChange([...value, formatKey]);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Output Formats</Label>
      <div className="space-y-2">
        {formats.map((format) => (
          <div key={format.key} className="flex items-center space-x-2">
            <Checkbox
              id={format.key}
              checked={value.includes(format.key)}
              onCheckedChange={() => handleToggle(format.key)}
            />
            <label
              htmlFor={format.key}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {format.aspectRatio} ({format.width}x{format.height}) - {format.name}
              {format.description && (
                <span className="text-muted-foreground ml-1">
                  ({format.description})
                </span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
