import { useEffect, useCallback, useState } from 'react';
import { useToolContext } from './useToolContext';
import type { AnnotationData } from '../../types/store';

/**
 * Props for LineMeasurementTool component
 */
export interface LineMeasurementToolProps {
  /** Canvas dimensions for coordinate normalization */
  canvasWidth: number;
  canvasHeight: number;
  /** Callback when line measurement is complete */
  onLineMeasured?: (line: AnnotationData) => void;
  /** Line color */
  color?: string;
}

/**
 * LineMeasurementTool Component
 *
 * Allows users to measure distances by clicking start and end points.
 * Shows real-time distance in pixels, and calculates real-world distance if calibrated.
 *
 * Features:
 * - Click start point, click end point to draw line
 * - Shows pixel distance in real-time
 * - Calculates meters if calibration is set
 * - Displays length label on the line
 * - Yellow color for visibility
 *
 * Usage:
 * ```tsx
 * <LineMeasurementTool
 *   canvasWidth={800}
 *   canvasHeight={600}
 *   onLineMeasured={(line) => console.log('Line measured:', line)}
 * />
 * ```
 */
export function LineMeasurementTool({
  canvasWidth,
  canvasHeight,
  onLineMeasured,
  color = '#FFD93D',
}: LineMeasurementToolProps) {
  const {
    activeTool,
    generateId,
    normalizeCoordinate,
    calculatePixelDistance,
    formatDistance,
    canMeasure,
    createAnnotation,
    setActiveTool,
  } = useToolContext();

  const isActive = activeTool === 'line';

  // Line drawing state
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [previewDistance, setPreviewDistance] = useState<string>('');

  /**
   * Handle canvas click for line placement
   */
  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      if (!isActive) return;

      // Warn if not calibrated
      if (!canMeasure()) {
        alert('Please calibrate the drawing first to get accurate measurements.');
      }

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

      if (!startPoint) {
        // First click: set start point
        setStartPoint({ x: normalizedX, y: normalizedY });
      } else {
        // Second click: create line annotation
        const endPoint = { x: normalizedX, y: normalizedY };
        const pixelDistance = calculatePixelDistance(startPoint, endPoint, canvasWidth, canvasHeight);

        const line = createAnnotation({
          id: generateId('line'),
          type: 'line' as const,
          x: startPoint.x,
          y: startPoint.y,
          width: 0,
          height: 0,
          color,
          points: [startPoint, endPoint],
          lineLength: pixelDistance,
          text: formatDistance(pixelDistance),
          unit: 'linear_meters',
        });

        // Reset state
        setStartPoint(null);
        setCurrentPoint(null);
        setPreviewDistance('');

        // Notify parent
        if (onLineMeasured) {
          onLineMeasured(line);
        }
      }
    },
    [
      isActive,
      startPoint,
      canvasWidth,
      canvasHeight,
      normalizeCoordinate,
      calculatePixelDistance,
      formatDistance,
      canMeasure,
      createAnnotation,
      generateId,
      color,
      onLineMeasured,
    ]
  );

  /**
   * Handle mouse move for line preview
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isActive || !startPoint) return;

      // Get canvas element
      const canvas = document.querySelector('.annotation-canvas') as HTMLElement;
      if (!canvas) return;

      // Get mouse coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Normalize coordinates
      const normalizedX = normalizeCoordinate(x, canvasWidth);
      const normalizedY = normalizeCoordinate(y, canvasHeight);

      setCurrentPoint({ x: normalizedX, y: normalizedY });

      // Calculate preview distance
      const pixelDistance = calculatePixelDistance(
        startPoint,
        { x: normalizedX, y: normalizedY },
        canvasWidth,
        canvasHeight
      );
      setPreviewDistance(formatDistance(pixelDistance));
    },
    [
      isActive,
      startPoint,
      canvasWidth,
      canvasHeight,
      normalizeCoordinate,
      calculatePixelDistance,
      formatDistance,
    ]
  );

  /**
   * Set up event listeners when tool is active
   */
  useEffect(() => {
    if (!isActive) return;

    // Add listeners
    document.addEventListener('click', handleCanvasClick);
    document.addEventListener('mousemove', handleMouseMove);

    // Set cursor style
    document.body.style.cursor = 'crosshair';

    return () => {
      document.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
    };
  }, [isActive, handleCanvasClick, handleMouseMove]);

  /**
   * Handle Escape key to cancel tool
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        setStartPoint(null);
        setCurrentPoint(null);
        setPreviewDistance('');
        if (!startPoint) {
          setActiveTool(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, startPoint, setActiveTool]);

  if (!isActive) return null;

  return (
    <>
      {/* Status indicator */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-yellow-400" />
          <span className="text-sm">
            {!startPoint
              ? 'Click to set start point'
              : `Click to set end point${previewDistance ? ` · ${previewDistance}` : ''}`}{' '}
            · Press ESC to cancel
          </span>
        </div>
      </div>

      {/* Line preview (SVG overlay) */}
      {startPoint && currentPoint && (
        <svg
          className="fixed top-0 left-0 pointer-events-none z-40"
          style={{ width: '100%', height: '100%' }}
        >
          <line
            x1={startPoint.x * canvasWidth}
            y1={startPoint.y * canvasHeight}
            x2={currentPoint.x * canvasWidth}
            y2={currentPoint.y * canvasHeight}
            stroke={color}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <circle
            cx={startPoint.x * canvasWidth}
            cy={startPoint.y * canvasHeight}
            r="4"
            fill={color}
          />
        </svg>
      )}
    </>
  );
}

/**
 * Hook to use line measurement tool programmatically
 */
export function useLineMeasurementTool() {
  const { activeTool, setActiveTool } = useToolContext();

  const startLineTool = useCallback(() => {
    setActiveTool('line');
  }, [setActiveTool]);

  const stopLineTool = useCallback(() => {
    if (activeTool === 'line') {
      setActiveTool(null);
    }
  }, [activeTool, setActiveTool]);

  return {
    isLineToolActive: activeTool === 'line',
    startLineTool,
    stopLineTool,
  };
}
