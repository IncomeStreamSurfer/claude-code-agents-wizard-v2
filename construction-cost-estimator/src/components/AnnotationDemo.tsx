import { useState, useRef, useCallback } from 'react';
import { PDFViewer } from './PDFViewer';
import { AnnotationStage, type AnnotationData } from './AnnotationStage';

/**
 * AnnotationDemo Component
 *
 * Demonstrates how to integrate the AnnotationStage component with PDFViewer.
 * This example shows:
 * - Proper overlay positioning
 * - Canvas dimension synchronization
 * - Annotation data management
 * - Tool selection for creating different annotation types
 * - Real-time updates and persistence
 */
export function AnnotationDemo() {
  // PDF state
  const [pdfUrl] = useState('/sample-plan.pdf'); // Replace with your PDF URL
  const [pageNumber] = useState(1);
  const [scale] = useState(1.5);

  // Canvas dimensions state (set by PDFViewer callback)
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  // Annotations state
  const [annotations, setAnnotations] = useState<AnnotationData[]>([
    {
      id: 'demo-marker-1',
      type: 'marker',
      x: 0.5,
      y: 0.3,
      color: '#FF6B6B',
    },
    {
      id: 'demo-label-1',
      type: 'label',
      x: 0.2,
      y: 0.2,
      text: 'Kitchen',
      color: '#4ECDC4',
    },
    {
      id: 'demo-line-1',
      type: 'line',
      x: 0.1,
      y: 0.5,
      points: [
        { x: 0.1, y: 0.5 },
        { x: 0.4, y: 0.5 },
      ],
      color: '#FFD93D',
    },
    {
      id: 'demo-polygon-1',
      type: 'polygon',
      x: 0.6,
      y: 0.6,
      points: [
        { x: 0.6, y: 0.6 },
        { x: 0.75, y: 0.65 },
        { x: 0.7, y: 0.8 },
        { x: 0.55, y: 0.75 },
      ],
      color: '#A8E6CF',
    },
  ]);

  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'marker' | 'label' | 'line' | 'polygon'>('select');

  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Callback when PDF page loads - captures canvas dimensions
   */
  const handlePageLoadComplete = useCallback((canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    setCanvasWidth(rect.width);
    setCanvasHeight(rect.height);
    console.log('Canvas dimensions:', { width: rect.width, height: rect.height });
  }, []);

  /**
   * Handle annotation changes from AnnotationStage
   */
  const handleAnnotationChange = useCallback((updatedAnnotations: AnnotationData[]) => {
    setAnnotations(updatedAnnotations);
    console.log('Annotations updated:', updatedAnnotations);
  }, []);

  /**
   * Handle selection changes from AnnotationStage
   */
  const handleSelectionChange = useCallback((selectedId: string | null) => {
    setSelectedAnnotationId(selectedId);
    console.log('Selected annotation:', selectedId);
  }, []);

  /**
   * Add a new annotation based on active tool
   */
  const handleAddAnnotation = () => {
    const newId = `annotation-${Date.now()}`;
    let newAnnotation: AnnotationData;

    // Place new annotations in the center of the canvas
    const centerX = 0.5;
    const centerY = 0.5;

    switch (activeTool) {
      case 'marker':
        newAnnotation = {
          id: newId,
          type: 'marker',
          x: centerX,
          y: centerY,
          color: '#FF6B6B',
        };
        break;
      case 'label':
        newAnnotation = {
          id: newId,
          type: 'label',
          x: centerX,
          y: centerY,
          text: 'New Label',
          color: '#4ECDC4',
        };
        break;
      case 'line':
        newAnnotation = {
          id: newId,
          type: 'line',
          x: centerX - 0.1,
          y: centerY,
          points: [
            { x: centerX - 0.1, y: centerY },
            { x: centerX + 0.1, y: centerY },
          ],
          color: '#FFD93D',
        };
        break;
      case 'polygon':
        newAnnotation = {
          id: newId,
          type: 'polygon',
          x: centerX,
          y: centerY,
          points: [
            { x: centerX - 0.05, y: centerY - 0.05 },
            { x: centerX + 0.05, y: centerY - 0.05 },
            { x: centerX + 0.05, y: centerY + 0.05 },
            { x: centerX - 0.05, y: centerY + 0.05 },
          ],
          color: '#A8E6CF',
        };
        break;
      default:
        return;
    }

    setAnnotations([...annotations, newAnnotation]);
  };

  /**
   * Delete selected annotation
   */
  const handleDeleteSelected = () => {
    if (selectedAnnotationId) {
      const updatedAnnotations = annotations.filter((ann) => ann.id !== selectedAnnotationId);
      setAnnotations(updatedAnnotations);
      setSelectedAnnotationId(null);
    }
  };

  /**
   * Clear all annotations
   */
  const handleClearAll = () => {
    if (window.confirm('Delete all annotations?')) {
      setAnnotations([]);
      setSelectedAnnotationId(null);
    }
  };

  /**
   * Export annotations as JSON
   */
  const handleExport = () => {
    const dataStr = JSON.stringify(annotations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'annotations.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">PDF Annotation Demo</h1>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Tool Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTool('select')}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTool === 'select'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Select
              </button>
              <button
                onClick={() => setActiveTool('marker')}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTool === 'marker'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Marker
              </button>
              <button
                onClick={() => setActiveTool('label')}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTool === 'label'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Label
              </button>
              <button
                onClick={() => setActiveTool('line')}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTool === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setActiveTool('polygon')}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTool === 'polygon'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Polygon
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleAddAnnotation}
                disabled={activeTool === 'select'}
                className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add {activeTool !== 'select' ? activeTool : ''}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={!selectedAnnotationId}
                className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={handleClearAll}
                disabled={annotations.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleExport}
                disabled={annotations.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Instructions:</strong> Select a tool and click "Add" to create annotations.
              Drag shapes to move them. Click to select. Press Delete or right-click to remove.
              {canvasWidth === 0 && ' (Waiting for PDF to load...)'}
            </p>
          </div>
        </div>

        {/* PDF Viewer with Annotation Overlay */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div
            ref={containerRef}
            className="relative inline-block"
            style={{ touchAction: 'none' }}
          >
            {/* PDF Canvas Layer */}
            <PDFViewer
              pdfUrl={pdfUrl}
              pageNumber={pageNumber}
              scale={scale}
              onPageLoadComplete={handlePageLoadComplete}
              onError={(error) => console.error('PDF Error:', error)}
            />

            {/* Annotation Overlay Layer */}
            {canvasWidth > 0 && canvasHeight > 0 && (
              <AnnotationStage
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                annotations={annotations}
                onAnnotationChange={handleAnnotationChange}
                onSelectionChange={handleSelectionChange}
              />
            )}
          </div>
        </div>

        {/* Annotation Data Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Annotation Data ({annotations.length} items)
          </h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(annotations, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
