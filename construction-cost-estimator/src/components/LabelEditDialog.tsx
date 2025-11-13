/**
 * LabelEditDialog Component
 *
 * Inline edit dialog for annotation properties with:
 * - Quick edit form for clicked annotation
 * - Label text, category, color, unit type, cost inputs
 * - Keyboard shortcuts (Enter to save, Escape to cancel, Tab for navigation)
 * - Quick actions: Delete, Duplicate
 * - Positioned near the label (popup style)
 */

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import type { AnnotationData, LabelDefinition } from '../types/store';
import { useAppStore } from '../store/useAppStore';

/**
 * Props for LabelEditDialog component
 */
export interface LabelEditDialogProps {
  /** Whether dialog is open */
  open: boolean;

  /** Annotation to edit */
  annotation: AnnotationData | null;

  /** Available labels */
  labels?: LabelDefinition[];

  /** Callback when dialog closes */
  onClose: () => void;

  /** Callback when annotation is saved */
  onSave?: (id: string, updates: Partial<AnnotationData>) => void;

  /** Callback when annotation is deleted */
  onDelete?: (id: string) => void;

  /** Callback when annotation is duplicated */
  onDuplicate?: (annotation: AnnotationData) => void;
}

/**
 * Color presets for quick selection
 */
const COLOR_PRESETS = [
  { name: 'Teal', value: '#4ECDC4' },
  { name: 'Red', value: '#FF6B6B' },
  { name: 'Yellow', value: '#FFD93D' },
  { name: 'Green', value: '#A8E6CF' },
  { name: 'Blue', value: '#6BCF7F' },
  { name: 'Purple', value: '#A78BFA' },
  { name: 'Orange', value: '#FB923C' },
  { name: 'Pink', value: '#F472B6' },
];

/**
 * LabelEditDialog component
 *
 * Provides an inline editing interface for annotation properties.
 */
export function LabelEditDialog({
  open,
  annotation,
  labels = [],
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: LabelEditDialogProps) {
  const updateAnnotation = useAppStore((state) => state.updateAnnotation);
  const deleteAnnotation = useAppStore((state) => state.deleteAnnotation);

  const [formData, setFormData] = useState({
    text: '',
    color: '#4ECDC4',
    labelId: '',
    unit: 'count' as 'count' | 'linear_meters' | 'square_meters',
    notes: '',
  });

  const textInputRef = useRef<HTMLInputElement>(null);

  /**
   * Initialize form data when annotation changes
   */
  useEffect(() => {
    if (annotation && open) {
      setFormData({
        text: annotation.text || '',
        color: annotation.color || '#4ECDC4',
        labelId: annotation.labelId || '',
        unit: annotation.unit || 'count',
        notes: annotation.notes || '',
      });

      // Auto-focus text field after a short delay
      setTimeout(() => {
        textInputRef.current?.focus();
        textInputRef.current?.select();
      }, 100);
    }
  }, [annotation, open]);

  /**
   * Handle form submission
   */
  const handleSave = () => {
    if (!annotation) return;

    const updates: Partial<AnnotationData> = {
      text: formData.text,
      color: formData.color,
      labelId: formData.labelId || undefined,
      unit: formData.unit,
      notes: formData.notes,
    };

    if (onSave) {
      onSave(annotation.id, updates);
    } else {
      updateAnnotation(annotation.id, updates);
    }

    onClose();
  };

  /**
   * Handle delete action
   */
  const handleDelete = () => {
    if (!annotation) return;

    const confirmed = window.confirm('Are you sure you want to delete this annotation?');
    if (confirmed) {
      if (onDelete) {
        onDelete(annotation.id);
      } else {
        deleteAnnotation(annotation.id);
      }
      onClose();
    }
  };

  /**
   * Handle duplicate action
   */
  const handleDuplicate = () => {
    if (!annotation) return;

    const duplicate: AnnotationData = {
      ...annotation,
      id: `annotation-${Date.now()}`,
      x: annotation.x + 0.05, // Offset slightly
      y: annotation.y + 0.05,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (onDuplicate) {
      onDuplicate(duplicate);
    }

    onClose();
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!annotation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Edit Label</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Text field */}
          <div className="grid gap-2">
            <Label htmlFor="text">Label Text</Label>
            <Input
              ref={textInputRef}
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Enter label text"
              autoComplete="off"
            />
          </div>

          {/* Category/Label dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={formData.labelId}
              onChange={(e) => setFormData({ ...formData, labelId: e.target.value })}
            >
              <option value="">None</option>
              {labels.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Color picker */}
          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-20 h-10 p-1 cursor-pointer"
              />
              <div className="flex gap-1 flex-wrap">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: preset.value })}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                    aria-label={`Select ${preset.name} color`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Unit type selector */}
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit Type</Label>
            <Select
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'count' | 'linear_meters' | 'square_meters' })}
            >
              <option value="count">Count</option>
              <option value="linear_meters">Linear Meters</option>
              <option value="square_meters">Square Meters</option>
            </Select>
          </div>

          {/* Notes field */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes (optional)"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDuplicate}
                className="text-blue-600"
              >
                Duplicate
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogFooter>

        {/* Keyboard shortcuts hint */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> to save,{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> to cancel
        </div>
      </DialogContent>
    </Dialog>
  );
}
