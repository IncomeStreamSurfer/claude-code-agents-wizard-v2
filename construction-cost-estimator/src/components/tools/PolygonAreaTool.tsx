import { useEffect, useCallback, useState } from 'react';
import { useToolContext } from './useToolContext';
import type { AnnotationData } from '../../types/store';

/**
 * Props for PolygonAreaTool component
 */
export interface PolygonAreaToolProps {
  /** Canvas dimensions for coordinate normalization */
  canvasWidth: number;
  canvasHeight: number;
  /** Callback when polygon measurement is complete */
  onPolygonMeasured?: (polygon: AnnotationData) => void;
  /** Polygon color */
  color?: string;
}

/**
 * PolygonAreaTool Component
 *
 * Allows users to measure areas by clicking to place polygon vertices.
 * Right-click or double-click to close the polygon and calculate area.
 *
 * Features:
 * - Click to place vertices
 * - Shows polygon outline in real-time
 * - Right-click or double-click to close polygon
 * - Calculates area using Shoelace formula
 * - Displays area label (e.g., "15.2 m²")
 * - Green color with transparency
 * - Allows vertex adjustment after placement
 *
 * Usage:
 * ```tsx
 * <PolygonAreaTool
 *   canvasWidth={800}
 *   canvasHeight={600}
 *   onPolygonMeasured={(polygon) => console.log('Polygon measured:', polygon)}
 * />
 * ```
 */
export function PolygonAreaTool({
  canvasWidth,
  canvasHeight,
  onPolygonMeasured,
  color = '#A8E6CF',
}: PolygonAreaToolProps) {
  const {
    activeTool,
    generateId,
    normalizeCoordinate,
    calculatePolygonArea,
    formatArea,
    canMeasure,
    createAnnotation,
    setActiveTool,
  } = useToolContext();

  const isActive = activeTool === 'polygon';

  // Polygon drawing state
  const [vertices, setVertices] = useState<{ x: number; y: number }[]>([]);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [previewArea, setPreviewArea] = useState<string>('');

  /**
   * Handle canvas click for vertex placement
   */
  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      if (!isActive) return;

      // Check for double-click
      if (event.detail === 2 && vertices.length >= 3) {
        // Double-click closes the polygon
        return; // Let handleDoubleClick handle it
      }

      // Warn if not calibrated (only on first vertex)
      if (vertices.length === 0 && !canMeasure()) {
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

      // Add vertex
      setVertices((prev) => [...prev, { x: normalizedX, y: normalizedY }]);
    },
    [isActive, vertices.length, canvasWidth, canvasHeight, normalizeCoordinate, canMeasure]
  );

  /**
   * Handle double-click to close polygon
   */
  const handleDoubleClick = useCallback(
    (event: MouseEvent) => {
      if (!isActive || vertices.length < 3) return;

      event.preventDefault();
      event.stopPropagation();

      // Calculate area
      const pixelArea = calculatePolygonArea(vertices, canvasWidth, canvasHeight);

      // Create polygon annotation
      const polygon = createAnnotation({
        id: generateId('polygon'),
        type: 'polygon' as const,
        x: vertices[0].x,
        y: vertices[0].y,
        width: 0,
        height: 0,
        color,
        points: vertices,
        polygonArea: pixelArea,
        text: formatArea(pixelArea),
        unit: 'square_meters',
      });

      // Reset state
      setVertices([]);
      setCurrentPoint(null);
      setPreviewArea('');

      // Notify parent
      if (onPolygonMeasured) {
        onPolygonMeasured(polygon);
      }
    },
    [
      isActive,
      vertices,
      canvasWidth,
      canvasHeight,
      calculatePolygonArea,
      formatArea,
      createAnnotation,
      generateId,
      color,
      onPolygonMeasured,
    ]
  );

  /**
   * Handle right-click to close polygon
   */
  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      if (!isActive || vertices.length < 3) return;

      event.preventDefault();
      event.stopPropagation();

      // Calculate area
      const pixelArea = calculatePolygonArea(vertices, canvasWidth, canvasHeight);

      // Create polygon annotation
      const polygon = createAnnotation({
        id: generateId('polygon'),
        type: 'polygon' as const,
        x: vertices[0].x,
        y: vertices[0].y,
        width: 0,
        height: 0,
        color,
        points: vertices,
        polygonArea: pixelArea,
        text: formatArea(pixelArea),
        unit: 'square_meters',
      });

      // Reset state
      setVertices([]);
      setCurrentPoint(null);
      setPreviewArea('');

      // Notify parent
      if (onPolygonMeasured) {
        onPolygonMeasured(polygon);
      }
    },
    [
      isActive,
      vertices,
      canvasWidth,
      canvasHeight,
      calculatePolygonArea,
      formatArea,
      createAnnotation,
      generateId,
      color,
      onPolygonMeasured,
    ]
  );

  /**
   * Handle mouse move for polygon preview
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isActive || vertices.length === 0) return;

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

      // Calculate preview area if at least 2 vertices
      if (vertices.length >= 2) {
        const previewVertices = [...vertices, { x: normalizedX, y: normalizedY }];
        const pixelArea = calculatePolygonArea(previewVertices, canvasWidth, canvasHeight);
        setPreviewArea(formatArea(pixelArea));
      }
    },
    [
      isActive,
      vertices,
      canvasWidth,
      canvasHeight,
      normalizeCoordinate,
      calculatePolygonArea,
      formatArea,
    ]
  );

  /**
   * Set up event listeners when tool is active
   */
  useEffect(() => {
    if (!isActive) return;

    // Add listeners
    document.addEventListener('click', handleCanvasClick);
    document.addEventListener('dblclick', handleDoubleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mousemove', handleMouseMove);

    // Set cursor style
    document.body.style.cursor = 'crosshair';

    return () => {
      document.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('dblclick', handleDoubleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
    };
  }, [isActive, handleCanvasClick, handleDoubleClick, handleContextMenu, handleMouseMove]);

  /**
   * Handle Escape key to cancel tool
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        if (vertices.length > 0) {
          // Clear current polygon
          setVertices([]);
          setCurrentPoint(null);
          setPreviewArea('');
        } else {
          // Exit tool
          setActiveTool(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, vertices.length, setActiveTool]);

  if (!isActive) return null;

  // Calculate polygon points for SVG
  const polygonPoints = vertices.map((v) => `${v.x * canvasWidth},${v.y * canvasHeight}`).join(' ');
  const previewPoints =
    currentPoint && vertices.length > 0
      ? [...vertices, currentPoint].map((v) => `${v.x * canvasWidth},${v.y * canvasHeight}`).join(' ')
      : polygonPoints;

  return (
    <>
      {/* Status indicator */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 opacity-50" />
          <span className="text-sm">
            {vertices.length === 0
              ? 'Click to place first vertex'
              : vertices.length < 3
              ? `Click to add vertex (${vertices.length} placed)`
              : `Right-click or double-click to close${previewArea ? ` · ${previewArea}` : ''}`}{' '}
            · Press ESC to {vertices.length > 0 ? 'clear' : 'cancel'}
          </span>
        </div>
      </div>

      {/* Polygon preview (SVG overlay) */}
      {vertices.length > 0 && (
        <svg
          className="fixed top-0 left-0 pointer-events-none z-40"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Preview polygon with current mouse position */}
          {currentPoint && vertices.length >= 2 && (
            <polygon
              points={previewPoints}
              fill={color}
              fillOpacity="0.2"
              stroke={color}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Draw edges */}
          {vertices.map((vertex, i) => {
            const nextVertex = vertices[(i + 1) % vertices.length];
            return (
              <line
                key={i}
                x1={vertex.x * canvasWidth}
                y1={vertex.y * canvasHeight}
                x2={i === vertices.length - 1 && currentPoint ? currentPoint.x * canvasWidth : nextVertex.x * canvasWidth}
                y2={i === vertices.length - 1 && currentPoint ? currentPoint.y * canvasHeight : nextVertex.y * canvasHeight}
                stroke={color}
                strokeWidth="2"
                strokeDasharray={i === vertices.length - 1 ? '5,5' : undefined}
              />
            );
          })}

          {/* Draw vertices */}
          {vertices.map((vertex, i) => (
            <circle
              key={i}
              cx={vertex.x * canvasWidth}
              cy={vertex.y * canvasHeight}
              r="4"
              fill={color}
            />
          ))}

          {/* Closing line to first vertex */}
          {vertices.length >= 3 && currentPoint && (
            <line
              x1={currentPoint.x * canvasWidth}
              y1={currentPoint.y * canvasHeight}
              x2={vertices[0].x * canvasWidth}
              y2={vertices[0].y * canvasHeight}
              stroke={color}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />
          )}
        </svg>
      )}
    </>
  );
}

/**
 * Hook to use polygon area tool programmatically
 */
export function usePolygonAreaTool() {
  const { activeTool, setActiveTool } = useToolContext();

  const startPolygonTool = useCallback(() => {
    setActiveTool('polygon');
  }, [setActiveTool]);

  const stopPolygonTool = useCallback(() => {
    if (activeTool === 'polygon') {
      setActiveTool(null);
    }
  }, [activeTool, setActiveTool]);

  return {
    isPolygonToolActive: activeTool === 'polygon',
    startPolygonTool,
    stopPolygonTool,
  };
}
