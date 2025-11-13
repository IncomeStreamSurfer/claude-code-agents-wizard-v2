import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// Using the CDN worker for simplicity and compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Props interface for PDFViewer component
 */
export interface PDFViewerProps {
  /** URL or path to the PDF file */
  pdfUrl: string;
  /** Page number to display (1-indexed) */
  pageNumber: number;
  /** Scale factor for rendering (default 1.5) */
  scale?: number;
  /** Callback when page finishes loading with canvas reference */
  onPageLoadComplete?: (canvas: HTMLCanvasElement) => void;
  /** Callback when an error occurs during loading */
  onError?: (error: Error) => void;
}

/**
 * PDFViewer Component
 *
 * Renders PDF pages using PDF.js on an HTML canvas element.
 * This component serves as the foundation for the annotation layer,
 * providing the canvas that will be overlaid with Konva annotations.
 *
 * Features:
 * - Loads and renders PDF files using PDF.js
 * - Supports high-DPI rendering (2x device pixel ratio)
 * - Handles loading and error states
 * - Provides canvas reference for overlay components
 * - Supports dynamic scaling and page navigation
 */
export function PDFViewer({
  pdfUrl,
  pageNumber,
  scale = 1.5,
  onPageLoadComplete,
  onError,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  /**
   * Load the PDF document
   * This effect runs once when the component mounts or when pdfUrl changes
   */
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        if (isMounted) {
          setPdfDoc(pdf);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF';
          setError(errorMessage);
          if (onError) {
            onError(err instanceof Error ? err : new Error(errorMessage));
          }
        }
      }
    };

    loadPdf();

    // Cleanup function to cancel loading if component unmounts
    return () => {
      isMounted = false;
    };
  }, [pdfUrl, onError]);

  /**
   * Render the specified page
   * This effect runs when the page number, scale, or PDF document changes
   */
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) {
      return;
    }

    let isMounted = true;

    const renderPage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the page
        const page = await pdfDoc.getPage(pageNumber);

        if (!isMounted || !canvasRef.current) {
          return;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Failed to get canvas context');
        }

        // Calculate viewport with desired scale
        const viewport = page.getViewport({ scale });

        // Set up high-DPI rendering (2x device pixel ratio)
        const devicePixelRatio = window.devicePixelRatio || 1;
        const outputScale = devicePixelRatio;

        // Set canvas size for high-DPI display
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);

        // Set display size (CSS pixels)
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Scale the context to match the device pixel ratio
        context.scale(outputScale, outputScale);

        // Render the page
        const renderContext = {
          canvas: canvas,
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        if (isMounted) {
          setLoading(false);

          // Notify parent component that page is loaded
          if (onPageLoadComplete && canvasRef.current) {
            onPageLoadComplete(canvasRef.current);
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to render page';
          setError(errorMessage);
          setLoading(false);
          if (onError) {
            onError(err instanceof Error ? err : new Error(errorMessage));
          }
        }
      }
    };

    renderPage();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageNumber, scale, onPageLoadComplete, onError]);

  return (
    <div className="relative inline-block">
      {/* Canvas element for PDF rendering */}
      <canvas
        ref={canvasRef}
        className="block max-w-full h-auto"
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Error message overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Error Loading PDF
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
