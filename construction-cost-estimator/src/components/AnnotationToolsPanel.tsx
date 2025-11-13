import { useState, useEffect } from 'react';
import { Trash2, Copy, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { useAppStore, useSelectedAnnotation } from '../store/useAppStore';

/**
 * Props for AnnotationToolsPanel component
 */
export interface AnnotationToolsPanelProps {
  /** Callback when annotation is updated */
  onAnnotationUpdated?: () => void;
  /** Callback when annotation is deleted */
  onAnnotationDeleted?: () => void;
  /** Show close button */
  showClose?: boolean;
  /** Callback when panel is closed */
  onClose?: () => void;
}

/**
 * AnnotationToolsPanel Component
 *
 * Properties panel for editing selected annotations.
 * Shows and allows editing of annotation properties like text, color, category, etc.
 *
 * Features:
 * - Shows current annotation information
 * - Edit text labels in real-time
 * - Update category/type selection
 * - Assign/edit cost codes
 * - Change colors
 * - Quick delete button
 * - Duplicate annotation
 * - Apply changes to all similar items (bulk update)
 *
 * Usage:
 * ```tsx
 * <AnnotationToolsPanel
 *   onAnnotationUpdated={() => console.log('Annotation updated')}
 *   onAnnotationDeleted={() => console.log('Annotation deleted')}
 *   showClose
 * />
 * ```
 */
export function AnnotationToolsPanel({
  onAnnotationUpdated,
  onAnnotationDeleted,
  showClose = false,
  onClose,
}: AnnotationToolsPanelProps) {
  const selectedAnnotation = useSelectedAnnotation();
  const labels = useAppStore((state) => state.labels);
  const updateAnnotation = useAppStore((state) => state.updateAnnotation);
  const deleteAnnotation = useAppStore((state) => state.deleteAnnotation);
  const selectAnnotation = useAppStore((state) => state.selectAnnotation);
  const addAnnotation = useAppStore((state) => state.addAnnotation);

  // Local state for editing
  const [editedText, setEditedText] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [editedLabelId, setEditedLabelId] = useState('');

  // Update local state when selection changes
  useEffect(() => {
    if (selectedAnnotation) {
      setEditedText(selectedAnnotation.text || '');
      setEditedColor(selectedAnnotation.color || '#4ECDC4');
      setEditedLabelId(selectedAnnotation.labelId || '');
    }
  }, [selectedAnnotation]);

  /**
   * Handle text update
   */
  const handleTextChange = (newText: string) => {
    setEditedText(newText);
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation.id, { text: newText });
      if (onAnnotationUpdated) {
        onAnnotationUpdated();
      }
    }
  };

  /**
   * Handle color update
   */
  const handleColorChange = (newColor: string) => {
    setEditedColor(newColor);
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation.id, { color: newColor });
      if (onAnnotationUpdated) {
        onAnnotationUpdated();
      }
    }
  };

  /**
   * Handle label type update
   */
  const handleLabelIdChange = (newLabelId: string) => {
    setEditedLabelId(newLabelId);
    if (selectedAnnotation) {
      const label = labels.find((l) => l.id === newLabelId);
      updateAnnotation(selectedAnnotation.id, {
        labelId: newLabelId || undefined,
        color: label?.color || editedColor,
      });
      if (label?.color) {
        setEditedColor(label.color);
      }
      if (onAnnotationUpdated) {
        onAnnotationUpdated();
      }
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    if (!selectedAnnotation) return;

    const confirmed = window.confirm('Are you sure you want to delete this annotation?');
    if (confirmed) {
      deleteAnnotation(selectedAnnotation.id);
      if (onAnnotationDeleted) {
        onAnnotationDeleted();
      }
    }
  };

  /**
   * Handle duplicate
   */
  const handleDuplicate = () => {
    if (!selectedAnnotation) return;

    // Create a duplicate with slight offset
    const duplicate = {
      ...selectedAnnotation,
      id: `${selectedAnnotation.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: selectedAnnotation.x + 0.02, // Offset by 2%
      y: selectedAnnotation.y + 0.02,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addAnnotation(duplicate);
    selectAnnotation(duplicate.id);
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    selectAnnotation(null);
    if (onClose) {
      onClose();
    }
  };

  // Don't render if no annotation is selected
  if (!selectedAnnotation) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-500">
        Select an annotation to view and edit its properties
      </div>
    );
  }

  // Get associated label if exists
  const associatedLabel = editedLabelId ? labels.find((l) => l.id === editedLabelId) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-gray-900">
            {selectedAnnotation.type.charAt(0).toUpperCase() + selectedAnnotation.type.slice(1)} Properties
          </h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
            {selectedAnnotation.type}
          </span>
        </div>
        {showClose && (
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4">
        {/* Text field (for labels and measurements) */}
        {(selectedAnnotation.type === 'label' || selectedAnnotation.text) && (
          <div className="space-y-2">
            <Label htmlFor="annotation-text" className="text-xs font-medium text-gray-700">
              {selectedAnnotation.type === 'label' ? 'Label Text' : 'Measurement'}
            </Label>
            <Input
              id="annotation-text"
              value={editedText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter text..."
              className="text-sm"
              disabled={selectedAnnotation.type !== 'label'}
            />
          </div>
        )}

        {/* Label type selector (for labels) */}
        {selectedAnnotation.type === 'label' && (
          <div className="space-y-2">
            <Label htmlFor="label-type" className="text-xs font-medium text-gray-700">
              Label Type
            </Label>
            <Select id="label-type" value={editedLabelId} onChange={(e) => handleLabelIdChange(e.target.value)}>
              <option value="">None (Custom)</option>
              {labels.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.icon && `${label.icon} `}
                  {label.name} (${label.costPerUnit}/{label.unit})
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Cost information (if label is associated) */}
        {associatedLabel && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
            <div className="text-xs font-medium text-blue-900">Cost Information</div>
            <div className="text-sm text-blue-800">
              <div>Category: {associatedLabel.category}</div>
              <div>Unit: {associatedLabel.unit.replace('_', ' ')}</div>
              <div>Cost per unit: ${associatedLabel.costPerUnit}</div>
              {selectedAnnotation.quantity && (
                <div className="font-semibold mt-1">
                  Quantity: {selectedAnnotation.quantity.toFixed(2)} {associatedLabel.unit.replace('_', ' ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Measurement info (for lines and polygons) */}
        {selectedAnnotation.type === 'line' && selectedAnnotation.lineLength && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-1">
            <div className="text-xs font-medium text-yellow-900">Line Measurement</div>
            <div className="text-sm text-yellow-800">
              Length: {selectedAnnotation.text || `${selectedAnnotation.lineLength.toFixed(2)} px`}
            </div>
          </div>
        )}

        {selectedAnnotation.type === 'polygon' && selectedAnnotation.polygonArea && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-1">
            <div className="text-xs font-medium text-green-900">Area Measurement</div>
            <div className="text-sm text-green-800">
              Area: {selectedAnnotation.text || `${selectedAnnotation.polygonArea.toFixed(2)} px²`}
            </div>
            {selectedAnnotation.points && (
              <div className="text-xs text-green-700">
                {selectedAnnotation.points.length} vertices
              </div>
            )}
          </div>
        )}

        {/* Color picker */}
        <div className="space-y-2">
          <Label htmlFor="annotation-color" className="text-xs font-medium text-gray-700">
            Color
          </Label>
          <div className="flex items-center gap-2">
            <input
              id="annotation-color"
              type="color"
              value={editedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-10 rounded border cursor-pointer"
              disabled={!!editedLabelId}
            />
            <span className="text-sm text-gray-600">{editedColor}</span>
            {editedLabelId && (
              <span className="text-xs text-gray-500">(Set by label type)</span>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-600">
          <div>ID: {selectedAnnotation.id.slice(0, 20)}...</div>
          <div>Page: {selectedAnnotation.pageNumber}</div>
          {selectedAnnotation.createdAt && (
            <div>Created: {new Date(selectedAnnotation.createdAt).toLocaleString()}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-3 border-t border-gray-200 bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          title="Duplicate annotation"
          className="flex-1"
        >
          <Copy className="w-3 h-3 mr-1" />
          Duplicate
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          title="Delete annotation"
          className="flex-1"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}

/**
 * Floating version of AnnotationToolsPanel that appears near the selected annotation
 */
export function AnnotationToolsPanelFloating({ onClose }: { onClose?: () => void }) {
  const selectedAnnotation = useSelectedAnnotation();

  if (!selectedAnnotation) return null;

  return (
    <div className="fixed right-4 top-20 w-80 z-50 animate-in slide-in-from-right">
      <AnnotationToolsPanel showClose onClose={onClose} />
    </div>
  );
}
