/**
 * EditableDragDemo Component
 *
 * Demonstration of drag-and-drop and inline editing functionality.
 * Shows all features including:
 * - Drag-and-drop labels
 * - Click to select
 * - Double-click to edit
 * - Keyboard shortcuts
 * - Context menu
 * - Grid snapping
 */

import { useState } from 'react';
import { EditableAnnotationStage } from './EditableAnnotationStage';
import type { AnnotationData } from '../types/store';
import { Button } from './ui/button';

/**
 * Sample annotations for demo
 */
const SAMPLE_ANNOTATIONS: AnnotationData[] = [
  {
    id: 'label-1',
    pageNumber: 1,
    type: 'label',
    x: 0.2,
    y: 0.3,
    width: 100,
    height: 30,
    color: '#4ECDC4',
    text: 'Window',
    unit: 'count',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'label-2',
    pageNumber: 1,
    type: 'label',
    x: 0.5,
    y: 0.5,
    width: 100,
    height: 30,
    color: '#FF6B6B',
    text: 'Door',
    unit: 'count',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'label-3',
    pageNumber: 1,
    type: 'label',
    x: 0.7,
    y: 0.2,
    width: 120,
    height: 30,
    color: '#FFD93D',
    text: 'Wall Section',
    unit: 'linear_meters',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * EditableDragDemo component
 */
export function EditableDragDemo() {
  const [annotations, setAnnotations] = useState<AnnotationData[]>(SAMPLE_ANNOTATIONS);
  const [gridSnapping, setGridSnapping] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const canvasWidth = 800;
  const canvasHeight = 600;

  /**
   * Handle annotation updates
   */
  const handleAnnotationChange = (updated: AnnotationData) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === updated.id ? { ...ann, ...updated } : ann))
    );
  };

  /**
   * Add new label
   */
  const handleAddLabel = () => {
    const newLabel: AnnotationData = {
      id: `label-${Date.now()}`,
      pageNumber: 1,
      type: 'label',
      x: Math.random() * 0.6 + 0.2,
      y: Math.random() * 0.6 + 0.2,
      width: 100,
      height: 30,
      color: '#A8E6CF',
      text: 'New Label',
      unit: 'count',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAnnotations((prev) => [...prev, newLabel]);
  };

  /**
   * Clear all labels
   */
  const handleClear = () => {
    setAnnotations([]);
  };

  /**
   * Reset to sample data
   */
  const handleReset = () => {
    setAnnotations(SAMPLE_ANNOTATIONS);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Drag & Drop + Inline Editing Demo
        </h1>
        <p className="text-gray-600 text-sm">
          Try dragging labels, double-clicking to edit, or using keyboard shortcuts
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex gap-4 items-center">
        <Button onClick={handleAddLabel} variant="default">
          Add Label
        </Button>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
        <Button onClick={handleClear} variant="outline">
          Clear All
        </Button>

        <div className="flex-1" />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={gridSnapping}
            onChange={(e) => setGridSnapping(e.target.checked)}
            className="w-4 h-4"
          />
          Grid Snapping
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
            className="w-4 h-4"
          />
          Read-only Mode
        </label>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          <EditableAnnotationStage
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            annotations={annotations}
            onAnnotationChange={handleAnnotationChange}
            dragGridSize={gridSnapping ? 0.05 : 0}
            dragSensitivity={3}
            enableKeyboardShortcuts={true}
            enableContextMenu={true}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Help Panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-2">Click</kbd>
            Select label
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-2">Double-click</kbd>
            Edit label
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-2">Delete</kbd>
            Remove selected
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-2">E</kbd>
            Edit selected
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-2">Ctrl+D</kbd>
            Duplicate selected
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-2">Arrow Keys</kbd>
            Nudge position
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-2">Right-click</kbd>
            Context menu
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded mr-2">Drag</kbd>
            Move label
          </div>
        </div>
      </div>

      {/* Annotation List */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-2">
          Annotations ({annotations.length})
        </h3>
        <div className="space-y-2">
          {annotations.map((ann) => (
            <div
              key={ann.id}
              className="flex items-center gap-3 text-sm bg-white p-2 rounded border border-gray-200"
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: ann.color }}
              />
              <span className="font-medium">{ann.text}</span>
              <span className="text-gray-500">
                ({(ann.x * 100).toFixed(1)}%, {(ann.y * 100).toFixed(1)}%)
              </span>
              <span className="text-gray-400 text-xs">{ann.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
