'use client';

import { STYLE_PRESETS } from '@/lib/prompts/presets';
import type { StylePreset } from '@/lib/ai/types';
import { Label } from '@/components/ui/label';

interface StylePresetSelectorProps {
  value: StylePreset | null;
  onChange: (value: StylePreset) => void;
}

export function StylePresetSelector({ value, onChange }: StylePresetSelectorProps) {
  const presets = Object.entries(STYLE_PRESETS) as [StylePreset, typeof STYLE_PRESETS[StylePreset]][];

  return (
    <div className="space-y-2">
      <Label htmlFor="style-preset">Style Preset</Label>
      <select
        id="style-preset"
        value={value || ''}
        onChange={(e) => onChange(e.target.value as StylePreset)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select a style...</option>
        {presets.map(([key, info]) => (
          <option key={key} value={key}>
            {info.name} - {info.description}
          </option>
        ))}
      </select>

      {value && STYLE_PRESETS[value] && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            <span className="font-medium">Best for:</span>{' '}
            {STYLE_PRESETS[value].bestFor.join(', ')}
          </div>
          <div>
            <span className="font-medium">Example:</span>{' '}
            {STYLE_PRESETS[value].example}
          </div>
        </div>
      )}
    </div>
  );
}
