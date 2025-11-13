import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFViewer } from './PDFViewer';
import { AnnotationStage } from './AnnotationStage';
import type { AnnotationData } from './AnnotationStage';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

/**
 * Props interface for PDFViewerWithZoom component
 */
export interface PDFViewerWithZoomProps {
  /** URL or path to the PDF file */
  pdfUrl: string;
  /** Page number to display (1-indexed) */
  pageNumber: number;
  /** Initial scale for PDFViewer (1-3, default 1.5) */
  scale?: number;
  /** Minimum zoom level (default 0.5) */
  minZoom?: number;
  /** Maximum zoom level (default 3) */
  maxZoom?: number;
  /** Annotations to display */
  annotations?: AnnotationData[];
  /** Callback when zoom level changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback when pan position changes */
  onPanChange?: (pan: { x: number; y: number }) => void;
  /** Callback when annotations change */
  onAnnotationChange?: (annotations: AnnotationData[]) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selectedId: string | null) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when PDF page loads and canvas is ready */
  onPageLoadComplete?: (canvas: HTMLCanvasElement) => void;
}

/**
 * PDFViewerWithZoom Component
 *
 * A comprehensive PDF viewer with zoom and pan functionality.
 * Wraps PDFViewer and AnnotationStage components with interactive controls.
 *
 * Features:
 * - Zoom with mouse wheel (Ctrl/Cmd + scroll)
 * - Zoom buttons (+ / - / Reset)
 * - Keyboard shortcuts (Ctrl/Cmd +/-, Ctrl/Cmd 0)
 * - Pan with mouse drag (Space + drag or middle mouse button)
 * - Pan with arrow keys
 * - Zoom centered on mouse cursor
 * - Smooth transitions using CSS transform
 * - Constrained panning (PDF stays visible)
 * - Coordinate normalization for annotations
 */
export function PDFViewerWithZoom({
  pdfUrl,
  pageNumber,
  scale = 1.5,
  minZoom = 0.5,
  maxZoom = 3,
  annotations = [],
  onZoomChange,
  onPanChange,
  onAnnotationChange,
  onSelectionChange,
  onError,
  onPageLoadComplete,
}: PDFViewerWithZoomProps) {
  // Zoom and pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas dimensions (from PDF rendering)
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [canvasHeight, setCanvasHeight] = useState<number>(0);

  // Pan mode state
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [panMode, setPanMode] = useState<boolean>(false); // Space key held

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  /**
   * Constrain pan to keep PDF visible
   */
  const constrainPan = useCallback(
    (newPan: { x: number; y: number }): { x: number; y: number } => {
      if (!containerRef.current || !contentRef.current) return newPan;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const contentWidth = canvasWidth * zoom;
      const contentHeight = canvasHeight * zoom;

      // Calculate max pan values to keep content visible
      const maxPanX = Math.max(0, (contentWidth - containerWidth) / 2);
      const maxPanY = Math.max(0, (contentHeight - containerHeight) / 2);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, newPan.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newPan.y)),
      };
    },
    [canvasWidth, canvasHeight, zoom]
  );

  /**
   * Handle zoom change with optional center point
   */
  const handleZoomChange = useCallback(
    (newZoom: number, centerX?: number, centerY?: number) => {
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

      if (clampedZoom === zoom) return;

      // If center point provided, zoom centered on that point
      if (centerX !== undefined && centerY !== undefined && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = centerX - rect.left;
        const offsetY = centerY - rect.top;

        // Calculate the point in content space
        const contentX = (offsetX - rect.width / 2 - pan.x) / zoom;
        const contentY = (offsetY - rect.height / 2 - pan.y) / zoom;

        // Calculate new pan to keep the same point under cursor
        const newPan = {
          x: offsetX - rect.width / 2 - contentX * clampedZoom,
          y: offsetY - rect.height / 2 - contentY * clampedZoom,
        };

        setPan(constrainPan(newPan));
      }

      setZoom(clampedZoom);
      if (onZoomChange) {
        onZoomChange(clampedZoom);
      }
    },
    [zoom, minZoom, maxZoom, pan, constrainPan, onZoomChange]
  );

  /**
   * Zoom in by step
   */
  const zoomIn = useCallback(() => {
    handleZoomChange(zoom + 0.1);
  }, [zoom, handleZoomChange]);

  /**
   * Zoom out by step
   */
  const zoomOut = useCallback(() => {
    handleZoomChange(zoom - 0.1);
  }, [zoom, handleZoomChange]);

  /**
   * Reset zoom to fit
   */
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (onZoomChange) {
      onZoomChange(1);
    }
    if (onPanChange) {
      onPanChange({ x: 0, y: 0 });
    }
  }, [onZoomChange, onPanChange]);

  /**
   * Handle mouse wheel for zoom
   */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Only zoom with Ctrl/Cmd key
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoomChange(zoom + delta, e.clientX, e.clientY);
      }
    },
    [zoom, handleZoomChange]
  );

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Space key for pan mode
      if (e.code === 'Space' && !panMode) {
        e.preventDefault();
        setPanMode(true);
        return;
      }

      // Zoom shortcuts (Ctrl/Cmd + / -)
      if (e.ctrlKey || e.metaKey) {
        if (e.code === 'Equal' || e.code === 'NumpadAdd') {
          e.preventDefault();
          zoomIn();
        } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
          e.preventDefault();
          zoomOut();
        } else if (e.code === 'Digit0' || e.code === 'Numpad0') {
          e.preventDefault();
          resetZoom();
        }
      }

      // Arrow keys for panning
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const panStep = 50;
        let newPan = { ...pan };

        switch (e.code) {
          case 'ArrowLeft':
            e.preventDefault();
            newPan.x += panStep;
            break;
          case 'ArrowRight':
            e.preventDefault();
            newPan.x -= panStep;
            break;
          case 'ArrowUp':
            e.preventDefault();
            newPan.y += panStep;
            break;
          case 'ArrowDown':
            e.preventDefault();
            newPan.y -= panStep;
            break;
          default:
            return;
        }

        setPan(constrainPan(newPan));
        if (onPanChange) {
          onPanChange(newPan);
        }
      }
    },
    [panMode, zoom, pan, zoomIn, zoomOut, resetZoom, constrainPan, onPanChange]
  );

  /**
   * Handle key up for pan mode
   */
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setPanMode(false);
    }
  }, []);

  /**
   * Handle mouse down for panning
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Pan with middle mouse button or space + left click
      if (e.button === 1 || (e.button === 0 && panMode)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [panMode, pan]
  );

  /**
   * Handle mouse move for panning and tracking cursor
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (isPanning && panStart) {
        const newPan = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        };
        setPan(constrainPan(newPan));
      }
    },
    [isPanning, panStart, constrainPan]
  );

  /**
   * Handle mouse up to stop panning
   */
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      if (onPanChange) {
        onPanChange(pan);
      }
    }
  }, [isPanning, pan, onPanChange]);

  /**
   * Handle PDF page load to get canvas dimensions
   */
  const handlePageLoadComplete = useCallback((canvas: HTMLCanvasElement) => {
    const width = parseFloat(canvas.style.width) || canvas.width;
    const height = parseFloat(canvas.style.height) || canvas.height;
    setCanvasWidth(width);
    setCanvasHeight(height);

    // Call external callback if provided
    if (onPageLoadComplete) {
      onPageLoadComplete(canvas);
    }
  }, [onPageLoadComplete]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Wheel event for zoom
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Keyboard events
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleWheel, handleKeyDown, handleKeyUp]);

  /**
   * Prevent context menu on middle mouse button
   */
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
    }
  }, [isPanning]);

  // Calculate cursor style
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    if (panMode) return 'grab';
    return 'default';
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Zoom Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/10 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        {/* Zoom Out Button */}
        <button
          onClick={zoomOut}
          disabled={zoom <= minZoom}
          className="p-2 bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-md shadow-sm transition-colors"
          aria-label="Zoom out"
          title="Zoom out (Ctrl/Cmd + -)"
        >
          <ZoomOut className="w-4 h-4 text-gray-700" />
        </button>

        {/* Zoom Percentage Display */}
        <div className="px-3 py-2 bg-white rounded-md shadow-sm min-w-[70px] text-center">
          <span className="text-sm font-medium text-gray-700">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Zoom In Button */}
        <button
          onClick={zoomIn}
          disabled={zoom >= maxZoom}
          className="p-2 bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-md shadow-sm transition-colors"
          aria-label="Zoom in"
          title="Zoom in (Ctrl/Cmd + +)"
        >
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </button>

        {/* Reset Zoom Button */}
        <button
          onClick={resetZoom}
          className="p-2 bg-white hover:bg-gray-100 rounded-md shadow-sm transition-colors"
          aria-label="Reset zoom"
          title="Reset zoom (Ctrl/Cmd + 0)"
        >
          <Maximize2 className="w-4 h-4 text-gray-700" />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300" />

        {/* Pan Mode Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-md shadow-sm transition-colors ${
            panMode ? 'bg-blue-100' : 'bg-white'
          }`}
          title="Hold Space to pan"
        >
          <Move className={`w-4 h-4 ${panMode ? 'text-blue-600' : 'text-gray-500'}`} />
          <span className={`text-xs font-medium ${panMode ? 'text-blue-600' : 'text-gray-500'}`}>
            {panMode ? 'Pan Mode' : 'Space to Pan'}
          </span>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-gray-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{ cursor: getCursorStyle() }}
      >
        <div
          ref={contentRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <div
            className="relative"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            {/* PDF Viewer */}
            <PDFViewer
              pdfUrl={pdfUrl}
              pageNumber={pageNumber}
              scale={scale}
              onPageLoadComplete={handlePageLoadComplete}
              onError={onError}
            />

            {/* Annotation Stage Overlay */}
            {canvasWidth > 0 && canvasHeight > 0 && (
              <AnnotationStage
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                annotations={annotations}
                onAnnotationChange={onAnnotationChange}
                onSelectionChange={onSelectionChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 right-4 z-20 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-xs">
        <div className="font-semibold mb-2">Keyboard Shortcuts</div>
        <div className="space-y-1 text-gray-200">
          <div><kbd className="bg-white/20 px-1.5 py-0.5 rounded">Ctrl/Cmd + Scroll</kbd> Zoom</div>
          <div><kbd className="bg-white/20 px-1.5 py-0.5 rounded">Ctrl/Cmd + +/-</kbd> Zoom in/out</div>
          <div><kbd className="bg-white/20 px-1.5 py-0.5 rounded">Ctrl/Cmd + 0</kbd> Reset zoom</div>
          <div><kbd className="bg-white/20 px-1.5 py-0.5 rounded">Space + Drag</kbd> Pan</div>
          <div><kbd className="bg-white/20 px-1.5 py-0.5 rounded">Arrow Keys</kbd> Pan</div>
        </div>
      </div>
    </div>
  );
}
