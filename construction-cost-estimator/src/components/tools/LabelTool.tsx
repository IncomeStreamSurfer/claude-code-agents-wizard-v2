import { useEffect, useCallback, useState } from 'react';
import { useToolContext } from './useToolContext';
import { useAppStore } from '../../store/useAppStore';
import type { AnnotationData } from '../../types/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

/**
 * Props for LabelTool component
 */
export interface LabelToolProps {
  /** Canvas dimensions for coordinate normalization */
  canvasWidth: number;
  canvasHeight: number;
  /** Callback when label is placed */
  onLabelPlaced?: (label: AnnotationData) => void;
}

/**
 * LabelTool Component
 *
 * Allows users to click on the canvas to place text labels.
 * Shows a dialog to input label text and select category/type.
 *
 * Features:
 * - Click to place label
 * - Dialog for text input and category selection
 * - Draggable after placement
 * - Links to cost categories
 * - Supports predefined label types from store
 *
 * Usage:
 * ```tsx
 * <LabelTool
 *   canvasWidth={800}
 *   canvasHeight={600}
 *   onLabelPlaced={(label) => console.log('Label placed:', label)}
 * />
 * ```
 */
export function LabelTool({ canvasWidth, canvasHeight, onLabelPlaced }: LabelToolProps) {
  const {
    activeTool,
    generateId,
    normalizeCoordinate,
    createAnnotation,
    setActiveTool,
  } = useToolContext();

  const labels = useAppStore((state) => state.labels);
  const isActive = activeTool === 'label';

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [labelText, setLabelText] = useState('');
  const [selectedLabelType, setSelectedLabelType] = useState<string>('');
  const [customColor, setCustomColor] = useState('#4ECDC4');

  /**
   * Handle canvas click to initiate label placement
   */
  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      if (!isActive || showDialog) return;

      // Get canvas element
      const canvas = event.target as HTMLElement;
      if (!canvas || !canvas.classList.contains('annotation-canvas')) return;

      // Get click coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Normalize coordinates
      const normalizedX = normalizeCoordinate(x, canvasWidth);
      const normalizedY = normalizeCoordinate(y, canvasHeight);

      // Store pending position and show dialog
      setPendingPosition({ x: normalizedX, y: normalizedY });
      setShowDialog(true);
    },
    [isActive, showDialog, canvasWidth, canvasHeight, normalizeCoordinate]
  );

  /**
   * Handle label creation from dialog
   */
  const handleCreateLabel = useCallback(() => {
    if (!pendingPosition || !labelText.trim()) return;

    // Get label definition if selected
    const labelDef = selectedLabelType ? labels.find((l) => l.id === selectedLabelType) : null;

    // Create label annotation
    const label = createAnnotation({
      id: generateId('label'),
      type: 'label' as const,
      x: pendingPosition.x,
      y: pendingPosition.y,
      width: 0, // Will be calculated by rendering
      height: 0,
      text: labelText,
      color: labelDef?.color || customColor,
      labelId: selectedLabelType || undefined,
    });

    // Reset dialog state
    setShowDialog(false);
    setPendingPosition(null);
    setLabelText('');
    setSelectedLabelType('');

    // Notify parent
    if (onLabelPlaced) {
      onLabelPlaced(label);
    }
  }, [
    pendingPosition,
    labelText,
    selectedLabelType,
    labels,
    customColor,
    createAnnotation,
    generateId,
    onLabelPlaced,
  ]);

  /**
   * Handle dialog cancel
   */
  const handleCancelDialog = useCallback(() => {
    setShowDialog(false);
    setPendingPosition(null);
    setLabelText('');
    setSelectedLabelType('');
  }, []);

  /**
   * Set up click listener when tool is active
   */
  useEffect(() => {
    if (!isActive) return;

    // Add click listener to document
    document.addEventListener('click', handleCanvasClick);

    // Set cursor style
    document.body.style.cursor = 'text';

    return () => {
      document.removeEventListener('click', handleCanvasClick);
      document.body.style.cursor = 'default';
    };
  }, [isActive, handleCanvasClick]);

  /**
   * Handle Escape key to cancel tool
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive && !showDialog) {
        setActiveTool(null);
      } else if (e.key === 'Escape' && showDialog) {
        handleCancelDialog();
      } else if (e.key === 'Enter' && showDialog) {
        e.preventDefault();
        handleCreateLabel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, showDialog, setActiveTool, handleCancelDialog, handleCreateLabel]);

  // Update color when label type changes
  useEffect(() => {
    if (selectedLabelType) {
      const labelDef = labels.find((l) => l.id === selectedLabelType);
      if (labelDef) {
        setCustomColor(labelDef.color);
      }
    }
  }, [selectedLabelType, labels]);

  return (
    <>
      {/* Status indicator when tool is active */}
      {isActive && !showDialog && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span className="text-sm">Click to place label · Press ESC to cancel</span>
          </div>
        </div>
      )}

      {/* Label input dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Label</DialogTitle>
            <DialogDescription>
              Enter label text and select a category. Labels help organize and cost your annotations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Label text input */}
            <div className="grid gap-2">
              <Label htmlFor="label-text">Label Text</Label>
              <Input
                id="label-text"
                placeholder="Enter label text..."
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                autoFocus
              />
            </div>

            {/* Label type selector */}
            <div className="grid gap-2">
              <Label htmlFor="label-type">Label Type (Optional)</Label>
              <Select id="label-type" value={selectedLabelType} onChange={(e) => setSelectedLabelType(e.target.value)}>
                <option value="">None (Custom)</option>
                {labels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.icon && `${label.icon} `}
                    {label.name} ({label.category})
                  </option>
                ))}
              </Select>
            </div>

            {/* Color picker */}
            {!selectedLabelType && (
              <div className="grid gap-2">
                <Label htmlFor="label-color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="label-color"
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">{customColor}</span>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="grid gap-2">
              <Label>Preview</Label>
              <div
                className="inline-flex items-center px-3 py-1.5 rounded text-white text-sm font-medium"
                style={{ backgroundColor: selectedLabelType ? labels.find((l) => l.id === selectedLabelType)?.color : customColor }}
              >
                {labelText || 'Label preview'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelDialog}>
              Cancel
            </Button>
            <Button onClick={handleCreateLabel} disabled={!labelText.trim()}>
              Create Label
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Hook to use label tool programmatically
 */
export function useLabelTool() {
  const { activeTool, setActiveTool } = useToolContext();

  const startLabelTool = useCallback(() => {
    setActiveTool('label');
  }, [setActiveTool]);

  const stopLabelTool = useCallback(() => {
    if (activeTool === 'label') {
      setActiveTool(null);
    }
  }, [activeTool, setActiveTool]);

  return {
    isLabelToolActive: activeTool === 'label',
    startLabelTool,
    stopLabelTool,
  };
}
