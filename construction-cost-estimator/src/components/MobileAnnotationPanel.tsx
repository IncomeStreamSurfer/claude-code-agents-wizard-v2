import React, { useState, useRef, useEffect } from 'react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import type { AnnotationData, LabelDefinition } from '../types/store';

interface MobileAnnotationPanelProps {
  annotation: AnnotationData | null;
  labels: LabelDefinition[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<AnnotationData>) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (annotation: AnnotationData) => void;
}

/**
 * MobileAnnotationPanel Component
 *
 * Bottom sheet that slides up from bottom for editing annotation properties
 * Optimized for mobile touch interaction
 */
export function MobileAnnotationPanel({
  annotation,
  labels,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: MobileAnnotationPanelProps) {
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null);
  const [localText, setLocalText] = useState(annotation?.text || '');
  const [localNotes, setLocalNotes] = useState(annotation?.notes || '');
  const panelRef = useRef<HTMLDivElement>(null);
  const haptic = useHapticFeedback();

  useEffect(() => {
    setLocalText(annotation?.text || '');
    setLocalNotes(annotation?.notes || '');
  }, [annotation]);

  if (!annotation || !isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
    setDragCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY === null) return;
    setDragCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (dragStartY === null || dragCurrentY === null) return;

    const dragDistance = dragCurrentY - dragStartY;

    // If dragged down more than 100px, close the panel
    if (dragDistance > 100) {
      haptic.tap();
      onClose();
    }

    setDragStartY(null);
    setDragCurrentY(null);
  };

  const handleColorChange = (color: string) => {
    haptic.select();
    onUpdate(annotation.id, { color });
  };

  const handleLabelChange = (labelId: string) => {
    haptic.select();
    onUpdate(annotation.id, { labelId });
  };

  const handleTextSave = () => {
    haptic.success();
    onUpdate(annotation.id, { text: localText, notes: localNotes });
  };

  const handleDelete = () => {
    haptic.warning();
    if (confirm('Delete this annotation?')) {
      onDelete(annotation.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    haptic.success();
    onDuplicate?.(annotation);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      haptic.tap();
      onClose();
    }
  };

  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
  ];

  const dragOffset = dragStartY !== null && dragCurrentY !== null ? Math.max(0, dragCurrentY - dragStartY) : 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleOverlayClick}
        style={{ touchAction: 'none' }}
      />

      {/* Bottom Sheet */}
      <div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col transition-transform"
        style={{
          transform: `translateY(${dragOffset}px)`,
          touchAction: 'none',
        }}
      >
        {/* Drag Handle */}
        <div
          className="py-3 flex justify-center cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 pb-6 overflow-y-auto flex-1">
          {/* Title */}
          <h2 className="text-xl font-bold mb-4">Edit Annotation</h2>

          {/* Text Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text
            </label>
            <input
              type="text"
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              onBlur={handleTextSave}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter annotation text"
              style={{ touchAction: 'manipulation' }}
            />
          </div>

          {/* Notes Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={handleTextSave}
              rows={3}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add notes..."
              style={{ touchAction: 'manipulation' }}
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`
                    w-full aspect-square rounded-lg
                    transition-all duration-200
                    ${
                      annotation.color === color
                        ? 'ring-4 ring-blue-500 ring-offset-2 scale-110'
                        : 'hover:scale-105 active:scale-95'
                    }
                  `}
                  style={{
                    backgroundColor: color,
                    minHeight: '44px',
                    touchAction: 'manipulation',
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Category/Label Selector */}
          {labels.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="space-y-2">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => handleLabelChange(label.id)}
                    className={`
                      w-full px-4 py-3 rounded-lg text-left
                      transition-all duration-200
                      ${
                        annotation.labelId === label.id
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                      }
                    `}
                    style={{ touchAction: 'manipulation', minHeight: '48px' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="font-medium">{label.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Measurement Info */}
          {annotation.quantity && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Measurement
              </div>
              <div className="text-lg font-bold text-blue-600">
                {annotation.quantity.toFixed(2)}{' '}
                {annotation.unit === 'linear_meters' && 'm'}
                {annotation.unit === 'square_meters' && 'm²'}
                {annotation.unit === 'count' && 'items'}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {onDuplicate && (
              <button
                onClick={handleDuplicate}
                className="
                  w-full py-3 px-4 rounded-lg
                  bg-blue-100 text-blue-700
                  hover:bg-blue-200 active:bg-blue-300
                  font-medium text-base
                  transition-all duration-200
                "
                style={{ touchAction: 'manipulation', minHeight: '48px' }}
              >
                Duplicate
              </button>
            )}

            <button
              onClick={handleDelete}
              className="
                w-full py-3 px-4 rounded-lg
                bg-red-100 text-red-700
                hover:bg-red-200 active:bg-red-300
                font-medium text-base
                transition-all duration-200
              "
              style={{ touchAction: 'manipulation', minHeight: '48px' }}
            >
              Delete
            </button>

            <button
              onClick={onClose}
              className="
                w-full py-3 px-4 rounded-lg
                bg-gray-100 text-gray-700
                hover:bg-gray-200 active:bg-gray-300
                font-medium text-base
                transition-all duration-200
              "
              style={{ touchAction: 'manipulation', minHeight: '48px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
