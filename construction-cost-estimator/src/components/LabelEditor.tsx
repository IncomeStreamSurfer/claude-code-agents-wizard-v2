import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';
import type { LabelDefinition } from '../types/store';

/**
 * Props for LabelEditor component
 */
export interface LabelEditorProps {
  /** Label to edit (null for creating new) */
  label: LabelDefinition | null;
  /** Callback when dialog is closed */
  onClose: () => void;
}

/**
 * Available categories
 */
const CATEGORIES = [
  'Openings',
  'Structure',
  'Surfaces',
  'MEP',
  'Circulation',
  'Other',
];

/**
 * Available unit types
 */
const UNIT_TYPES = [
  { value: 'count', label: 'Count' },
  { value: 'linear_meters', label: 'Linear Meters (m)' },
  { value: 'square_meters', label: 'Square Meters (m²)' },
];

/**
 * Common construction icons
 */
const COMMON_ICONS = [
  '📌', '🏗️', '🏢', '🏠', '🪟', '🚪', '🧱', '⬜', '⬛',
  '━', '⚡', '🚰', '🪜', '⛺', '🔨', '🔧', '⚙️', '📏',
  '📐', '🎨', '💡', '🔥', '❄️', '🌡️', '🔌', '🚿',
];

/**
 * Preset colors
 */
const PRESET_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow/orange
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#0EA5E9', // light blue
  '#EC4899', // pink
  '#78716C', // stone/gray
  '#14B8A6', // teal
  '#F43F5E', // rose
];

/**
 * LabelEditor Component
 *
 * Dialog for creating or editing label definitions.
 *
 * Features:
 * - Label name input
 * - Category dropdown
 * - Color picker with presets
 * - Icon selector
 * - Unit type dropdown
 * - Cost per unit input
 * - Description textarea
 * - Validation
 * - Save/Cancel buttons
 *
 * Usage:
 * ```tsx
 * <LabelEditor
 *   label={existingLabel} // or null for new
 *   onClose={() => setShowEditor(false)}
 * />
 * ```
 */
export function LabelEditor({ label, onClose }: LabelEditorProps) {
  const addLabel = useAppStore((state) => state.addLabel);
  const updateLabel = useAppStore((state) => state.updateLabel);

  const isEditing = label !== null;

  // Form state
  const [name, setName] = useState(label?.name || '');
  const [category, setCategory] = useState(label?.category || 'Other');
  const [color, setColor] = useState(label?.color || '#3B82F6');
  const [icon, setIcon] = useState(label?.icon || '📌');
  const [unit, setUnit] = useState<'count' | 'linear_meters' | 'square_meters'>(
    label?.unit || 'count'
  );
  const [costPerUnit, setCostPerUnit] = useState(label?.costPerUnit?.toString() || '');
  const [description, setDescription] = useState(label?.description || '');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate form inputs
   */
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Label name is required';
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (costPerUnit && isNaN(parseFloat(costPerUnit))) {
      newErrors.costPerUnit = 'Cost must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, category, color, costPerUnit]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    const labelData: Omit<LabelDefinition, 'id' | 'createdAt'> = {
      name: name.trim(),
      category,
      color,
      icon,
      unit,
      costPerUnit: costPerUnit ? parseFloat(costPerUnit) : undefined,
      description: description.trim() || undefined,
    };

    if (isEditing && label) {
      // Update existing label
      updateLabel(label.id, labelData);
    } else {
      // Create new label
      const newLabel: LabelDefinition = {
        id: `label-custom-${Date.now()}`,
        ...labelData,
        createdAt: new Date(),
      };
      addLabel(newLabel);
    }

    onClose();
  }, [
    validate,
    name,
    category,
    color,
    icon,
    unit,
    costPerUnit,
    description,
    isEditing,
    label,
    updateLabel,
    addLabel,
    onClose,
  ]);

  /**
   * Handle Enter key to submit
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Label' : 'Create New Label'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the label properties below.'
              : 'Define a new label for categorizing construction elements.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Label Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Label Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Windows, Doors, Walls"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            {errors.category && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.category}</span>
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="grid gap-2">
            <Label htmlFor="color">
              Color <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
            {/* Preset Colors */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
            {errors.color && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.color}</span>
              </div>
            )}
          </div>

          {/* Icon Selector */}
          <div className="grid gap-2">
            <Label htmlFor="icon">Icon</Label>
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 flex items-center justify-center text-2xl rounded border border-gray-300"
                style={{ backgroundColor: color }}
              >
                {icon}
              </div>
              <Input
                id="icon"
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="📌"
                className="flex-1"
                maxLength={2}
              />
            </div>
            {/* Common Icons */}
            <div className="flex flex-wrap gap-2">
              {COMMON_ICONS.map((commonIcon) => (
                <button
                  key={commonIcon}
                  type="button"
                  onClick={() => setIcon(commonIcon)}
                  className="w-10 h-10 flex items-center justify-center text-xl rounded border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  title={commonIcon}
                >
                  {commonIcon}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Type */}
          <div className="grid gap-2">
            <Label htmlFor="unit">
              Unit Type <span className="text-red-500">*</span>
            </Label>
            <Select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'count' | 'linear_meters' | 'square_meters')}
            >
              {UNIT_TYPES.map((unitType) => (
                <option key={unitType.value} value={unitType.value}>
                  {unitType.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Cost Per Unit */}
          <div className="grid gap-2">
            <Label htmlFor="costPerUnit">Cost Per Unit (Optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <Input
                id="costPerUnit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="flex-1"
              />
            </div>
            {errors.costPerUnit && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.costPerUnit}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              placeholder="Brief description of this label..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="grid gap-2">
            <Label>Preview</Label>
            <div className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {icon || '📌'}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{name || 'Label Name'}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{description || 'No description'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-white text-gray-600 rounded border">
                    {category}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-white text-gray-600 rounded border">
                    {UNIT_TYPES.find(u => u.value === unit)?.label}
                  </span>
                  {costPerUnit && (
                    <span className="text-xs text-gray-600">${costPerUnit}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Label'}
          </Button>
        </div>

        {/* Keyboard Hint */}
        <div className="text-xs text-gray-500 text-center">
          Press Cmd/Ctrl + Enter to save
        </div>
      </DialogContent>
    </Dialog>
  );
}
