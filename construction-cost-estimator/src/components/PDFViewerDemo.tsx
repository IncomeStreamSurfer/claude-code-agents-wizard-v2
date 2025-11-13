import { useState } from 'react';
import { PDFViewer } from './PDFViewer';

/**
 * Demo component showing how to use the PDFViewer
 *
 * This component demonstrates:
 * - Loading a PDF from a URL
 * - Page navigation
 * - Scale/zoom controls
 * - Handling loading and error callbacks
 */
export function PDFViewerDemo() {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  const handlePageLoadComplete = (canvas: HTMLCanvasElement) => {
    console.log('Page loaded successfully', canvas);
    setCanvasRef(canvas);
  };

  const handleError = (error: Error) => {
    console.error('PDF Error:', error);
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    setPageNumber(pageNumber + 1);
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.25, 0.5));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPageNumber(1);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-4 max-w-4xl">
        <h2 className="text-2xl font-bold">PDFViewer Component Demo</h2>

        {/* File Upload Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Upload PDF File:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500">
            Or paste a PDF URL and press Enter
          </p>
          <input
            type="text"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://example.com/document.pdf"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Controls Section */}
        {pdfUrl && (
          <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={pageNumber <= 1}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              <span className="text-sm font-medium">
                Page {pageNumber}
              </span>
              <button
                onClick={handleNextPage}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Next
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="px-3 py-1 bg-gray-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Zoom Out
              </button>
              <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 3}
                className="px-3 py-1 bg-gray-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Zoom In
              </button>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {pdfUrl && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-100 overflow-auto">
            <PDFViewer
              pdfUrl={pdfUrl}
              pageNumber={pageNumber}
              scale={scale}
              onPageLoadComplete={handlePageLoadComplete}
              onError={handleError}
            />
          </div>
        )}

        {/* Canvas Info */}
        {canvasRef && (
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <p>Canvas Dimensions:</p>
            <p>Width: {canvasRef.width}px (Display: {canvasRef.style.width})</p>
            <p>Height: {canvasRef.height}px (Display: {canvasRef.style.height})</p>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">How to Use PDFViewer</h3>
          <pre className="text-xs bg-white p-4 rounded overflow-x-auto">
{`import { PDFViewer } from './PDFViewer';

function MyComponent() {
  const [pdfUrl, setPdfUrl] = useState('path/to/document.pdf');
  const [pageNumber, setPageNumber] = useState(1);

  const handlePageLoad = (canvas: HTMLCanvasElement) => {
    console.log('Page loaded!', canvas);
    // You can now overlay Konva annotations on this canvas
  };

  const handleError = (error: Error) => {
    console.error('PDF loading error:', error);
  };

  return (
    <PDFViewer
      pdfUrl={pdfUrl}
      pageNumber={pageNumber}
      scale={1.5} // Optional, default is 1.5
      onPageLoadComplete={handlePageLoad}
      onError={handleError}
    />
  );
}`}
          </pre>

          <div className="mt-4 text-sm">
            <p className="font-semibold mb-2">Props:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><code className="bg-white px-1 py-0.5 rounded">pdfUrl</code> - URL or path to the PDF file (required)</li>
              <li><code className="bg-white px-1 py-0.5 rounded">pageNumber</code> - Page number to display, 1-indexed (required)</li>
              <li><code className="bg-white px-1 py-0.5 rounded">scale</code> - Zoom level (default: 1.5, range: 0.5-3.0)</li>
              <li><code className="bg-white px-1 py-0.5 rounded">onPageLoadComplete</code> - Callback when page loads with canvas ref</li>
              <li><code className="bg-white px-1 py-0.5 rounded">onError</code> - Callback when an error occurs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
