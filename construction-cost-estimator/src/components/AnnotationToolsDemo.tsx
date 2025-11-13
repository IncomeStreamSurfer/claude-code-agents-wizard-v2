import { useState } from 'react';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AnnotationToolsPanel } from './AnnotationToolsPanel';
import { MarkerTool, LabelTool, LineMeasurementTool, PolygonAreaTool } from './tools';
import { useAppStore } from '../store/useAppStore';

/**
 * AnnotationToolsDemo Component
 *
 * Comprehensive demo of the annotation tools system.
 * Shows how to integrate all tools with the PDF viewer and Zustand store.
 *
 * Features:
 * - Tool selection toolbar
 * - All annotation tools (marker, label, line, polygon)
 * - Properties panel for editing
 * - Canvas with annotation rendering
 * - Full integration with Zustand store
 *
 * Usage:
 * ```tsx
 * import { AnnotationToolsDemo } from './components/AnnotationToolsDemo';
 *
 * <AnnotationToolsDemo />
 * ```
 */
export function AnnotationToolsDemo() {
  const [canvasWidth] = useState(800);
  const [canvasHeight] = useState(600);

  const activeTool = useAppStore((state) => state.activeTool);
  const annotations = useAppStore((state) => state.annotations[state.currentPageNumber] || []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Annotation Tools Demo
          </h1>
          <p className="text-gray-600">
            Interactive demo of the PDF annotation and measurement tools.
            Select a tool from the toolbar below and interact with the canvas.
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <AnnotationToolbar
            showReset
            showClear
            onToolChange={(tool) => console.log('Tool changed:', tool)}
            onReset={() => console.log('Reset')}
            onClear={() => console.log('Clear')}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Canvas Area
              </h2>

              {/* Canvas with annotation overlay */}
              <div className="relative border-2 border-gray-300 rounded bg-gray-50">
                {/* Placeholder canvas */}
                <div
                  className="annotation-canvas bg-white"
                  style={{
                    width: `${canvasWidth}px`,
                    height: `${canvasHeight}px`,
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                  }}
                >
                  {/* Instructions */}
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium mb-2">
                        {activeTool
                          ? `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Tool Active`
                          : 'Select a tool from the toolbar'}
                      </p>
                      <p className="text-sm">
                        {activeTool === 'marker' && 'Click to place markers'}
                        {activeTool === 'label' && 'Click to add labels'}
                        {activeTool === 'line' && 'Click start and end points to measure distance'}
                        {activeTool === 'polygon' && 'Click to add vertices, right-click to close'}
                        {!activeTool && 'Use keyboard shortcuts: M (marker), L (label), D (distance), A (area)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tool overlays */}
                {activeTool === 'marker' && (
                  <MarkerTool
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onMarkerPlaced={(marker) => console.log('Marker placed:', marker)}
                  />
                )}

                {activeTool === 'label' && (
                  <LabelTool
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onLabelPlaced={(label) => console.log('Label placed:', label)}
                  />
                )}

                {activeTool === 'line' && (
                  <LineMeasurementTool
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onLineMeasured={(line) => console.log('Line measured:', line)}
                  />
                )}

                {activeTool === 'polygon' && (
                  <PolygonAreaTool
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onPolygonMeasured={(polygon) => console.log('Polygon measured:', polygon)}
                  />
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-blue-900">Total</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {annotations.length}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-red-900">Markers</div>
                  <div className="text-2xl font-bold text-red-700">
                    {annotations.filter((a) => a.type === 'marker').length}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-yellow-900">Lines</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {annotations.filter((a) => a.type === 'line').length}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-green-900">Polygons</div>
                  <div className="text-2xl font-bold text-green-700">
                    {annotations.filter((a) => a.type === 'polygon').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Properties
              </h2>
              <AnnotationToolsPanel
                onAnnotationUpdated={() => console.log('Annotation updated')}
                onAnnotationDeleted={() => console.log('Annotation deleted')}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Instructions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keyboard Shortcuts */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Keyboard Shortcuts</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">V</kbd> - Select tool</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">M</kbd> - Marker tool</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">L</kbd> - Label tool</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">D</kbd> - Distance tool</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">A</kbd> - Area tool</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Escape</kbd> - Cancel/Exit tool</li>
              </ul>
            </div>

            {/* Tool Descriptions */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tools</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <strong className="text-red-600">Marker:</strong> Click to place point markers
                </li>
                <li>
                  <strong className="text-blue-600">Label:</strong> Click to add text labels with categories
                </li>
                <li>
                  <strong className="text-yellow-600">Line:</strong> Click start and end to measure distance
                </li>
                <li>
                  <strong className="text-green-600">Polygon:</strong> Click vertices, right-click to close
                </li>
              </ul>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Tips</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Calibrate the drawing first for accurate measurements</li>
              <li>• Click on annotations to select and edit them</li>
              <li>• Use the properties panel to change colors and categories</li>
              <li>• Press Escape to cancel the current tool operation</li>
              <li>• Delete annotations with the Delete key or properties panel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal demo for testing individual tools
 */
export function AnnotationToolsMinimalDemo() {
  const [canvasWidth] = useState(600);
  const [canvasHeight] = useState(400);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Annotation Tools - Minimal Demo</h1>

        <AnnotationToolbar showReset showClear />

        <div
          className="annotation-canvas bg-white border-2 border-gray-300"
          style={{ width: canvasWidth, height: canvasHeight }}
        />

        <AnnotationToolsPanel />

        {/* Hidden tool components - they activate based on store state */}
        <MarkerTool canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
        <LabelTool canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
        <LineMeasurementTool canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
        <PolygonAreaTool canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
      </div>
    </div>
  );
}
