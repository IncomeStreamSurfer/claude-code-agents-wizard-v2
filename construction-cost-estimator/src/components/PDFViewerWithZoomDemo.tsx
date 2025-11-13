import { useState } from 'react';
import { PDFViewerWithZoom } from './PDFViewerWithZoom';
import type { AnnotationData } from './AnnotationStage';

/**
 * Demo component showing how to use PDFViewerWithZoom
 *
 * This component demonstrates:
 * - Loading a PDF with zoom and pan controls
 * - Managing annotations with zoom/pan
 * - Handling zoom and pan callbacks
 * - Keyboard shortcuts and mouse interactions
 */
export function PDFViewerWithZoomDemo() {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [annotations, setAnnotations] = useState<AnnotationData[]>([
    {
      id: '1',
      type: 'marker',
      x: 0.3,
      y: 0.3,
      color: '#FF6B6B',
    },
    {
      id: '2',
      type: 'label',
      x: 0.5,
      y: 0.5,
      text: 'Sample Label',
      color: '#4ECDC4',
    },
    {
      id: '3',
      type: 'line',
      x: 0.2,
      y: 0.7,
      points: [
        { x: 0.2, y: 0.7 },
        { x: 0.6, y: 0.7 },
      ],
      color: '#FFD93D',
    },
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPageNumber(1);
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    setPageNumber(pageNumber + 1);
  };

  const handleZoomChange = (zoom: number) => {
    console.log('Zoom changed to:', zoom);
  };

  const handlePanChange = (pan: { x: number; y: number }) => {
    console.log('Pan changed to:', pan);
  };

  const handleAnnotationChange = (newAnnotations: AnnotationData[]) => {
    setAnnotations(newAnnotations);
    console.log('Annotations updated:', newAnnotations);
  };

  const handleSelectionChange = (selectedId: string | null) => {
    console.log('Selection changed:', selectedId);
  };

  const handleError = (error: Error) => {
    console.error('PDF Error:', error);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          PDFViewerWithZoom Demo
        </h1>

        {/* File Upload Section */}
        <div className="flex flex-col gap-3 max-w-4xl">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Upload PDF File:
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="Or paste a PDF URL here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Page Navigation */}
          {pdfUrl && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousPage}
                disabled={pageNumber <= 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Previous Page
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
                Page {pageNumber}
              </span>
              <button
                onClick={handleNextPage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        {pdfUrl ? (
          <PDFViewerWithZoom
            pdfUrl={pdfUrl}
            pageNumber={pageNumber}
            scale={1.5}
            minZoom={0.5}
            maxZoom={3}
            annotations={annotations}
            onZoomChange={handleZoomChange}
            onPanChange={handlePanChange}
            onAnnotationChange={handleAnnotationChange}
            onSelectionChange={handleSelectionChange}
            onError={handleError}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md p-8">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No PDF Loaded
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF file or paste a URL to get started with the interactive
                zoom and pan viewer.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Features:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Zoom with mouse wheel (Ctrl/Cmd + scroll)</li>
                  <li>Pan with Space + drag or middle mouse button</li>
                  <li>Keyboard shortcuts for quick navigation</li>
                  <li>Interactive annotations that scale with zoom</li>
                  <li>Smooth zoom centered on cursor position</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              Usage Example (Click to expand)
            </summary>
            <div className="mt-3">
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`import { PDFViewerWithZoom } from './PDFViewerWithZoom';
import { AnnotationData } from './AnnotationStage';

function MyComponent() {
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);

  return (
    <PDFViewerWithZoom
      pdfUrl="/path/to/document.pdf"
      pageNumber={1}
      scale={1.5}
      minZoom={0.5}
      maxZoom={3}
      annotations={annotations}
      onZoomChange={(zoom) => console.log('Zoom:', zoom)}
      onPanChange={(pan) => console.log('Pan:', pan)}
      onAnnotationChange={setAnnotations}
      onSelectionChange={(id) => console.log('Selected:', id)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}`}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
