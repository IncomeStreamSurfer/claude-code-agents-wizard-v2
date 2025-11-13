import { useEffect, useCallback, useState } from 'react';
import { useToolContext } from './useToolContext';
import type { AnnotationData } from '../../types/store';

/**
 * Props for MarkerTool component
 */
export interface MarkerToolProps {
  /** Canvas dimensions for coordinate normalization */
  canvasWidth: number;
  canvasHeight: number;
  /** Callback when marker is placed */
  onMarkerPlaced?: (marker: AnnotationData) => void;
  /** Default marker color */
  color?: string;
}

/**
 * MarkerTool Component
 *
 * Allows users to click on the canvas to place circular point markers.
 * Markers are stored with normalized coordinates and displayed on the PDF.
 *
 * Features:
 * - Click to place marker
 * - Crosshair cursor during placement
 * - Stores marker with unique ID, timestamp, and normalized coordinates
 * - Shows marker count in toolbar
 *
 * Usage:
 * ```tsx
 * <MarkerTool
 *   canvasWidth={800}
 *   canvasHeight={600}
 *   onMarkerPlaced={(marker) => console.log('Marker placed:', marker)}
 * />
 * ```
 */
export function MarkerTool({
  canvasWidth,
  canvasHeight,
  onMarkerPlaced,
  color = '#FF6B6B',
}: MarkerToolProps) {
  const {
    activeTool,
    generateId,
    normalizeCoordinate,
    createAnnotation,
    setActiveTool,
  } = useToolContext();

  const [markerCount, setMarkerCount] = useState(0);
  const isActive = activeTool === 'marker';

  /**
   * Handle canvas click to place marker
   */
  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      if (!isActive) return;

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

      // Create marker annotation
      const marker = createAnnotation({
        id: generateId('marker'),
        type: 'marker' as const,
        x: normalizedX,
        y: normalizedY,
        width: 16, // marker diameter in pixels
        height: 16,
        color,
      });

      setMarkerCount((prev) => prev + 1);

      // Notify parent
      if (onMarkerPlaced) {
        onMarkerPlaced(marker);
      }
    },
    [
      isActive,
      canvasWidth,
      canvasHeight,
      normalizeCoordinate,
      createAnnotation,
      generateId,
      color,
      onMarkerPlaced,
    ]
  );

  /**
   * Set up click listener when tool is active
   */
  useEffect(() => {
    if (!isActive) return;

    // Add click listener to document
    document.addEventListener('click', handleCanvasClick);

    // Set cursor style
    document.body.style.cursor = 'crosshair';

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
      if (e.key === 'Escape' && isActive) {
        setActiveTool(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, setActiveTool]);

  // This component doesn't render anything visible
  // It only handles the tool interaction logic
  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-sm">
          Click to place marker · {markerCount} placed · Press ESC to cancel
        </span>
      </div>
    </div>
  );
}

/**
 * Hook to use marker tool programmatically
 */
export function useMarkerTool() {
  const { activeTool, setActiveTool } = useToolContext();

  const startMarkerTool = useCallback(() => {
    setActiveTool('marker');
  }, [setActiveTool]);

  const stopMarkerTool = useCallback(() => {
    if (activeTool === 'marker') {
      setActiveTool(null);
    }
  }, [activeTool, setActiveTool]);

  return {
    isMarkerToolActive: activeTool === 'marker',
    startMarkerTool,
    stopMarkerTool,
  };
}
