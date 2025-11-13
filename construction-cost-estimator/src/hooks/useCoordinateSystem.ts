/**
 * React Hook for Coordinate System Management
 *
 * This hook provides a convenient interface for working with the coordinate
 * normalization system in React components. It memoizes transformation functions
 * and provides utilities for common operations.
 */

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { AnnotationData } from '../types/store';
import type { Point } from '../utils/coordinates';
import {
  toNormalizedCoordinates,
  toCanvasCoordinates,
  normalizeDistance,
  denormalizeDistance,
  scaleAnnotationForZoom,
  normalizePoints,
  denormalizePoints,
  getBoundingBox,
  calculateNormalizedDistance,
  calculateCanvasDistance,
  calculateNormalizedArea,
} from '../utils/coordinates';
import {
  applyZoomTransform,
  reverseZoomTransform,
  getVisibleBounds,
  filterVisibleAnnotations,
  eventToNormalizedCoordinates,
  getEffectiveStrokeWidth,
  getEffectiveFontSize,
  getZoomToFitAnnotation,
  getPanToCenterAnnotation,
  clampZoom,
  clampPan,
} from '../utils/zoomCoordinates';

/**
 * Props for useCoordinateSystem hook
 */
export interface CoordinateSystemProps {
  /** Canvas width in pixels */
  canvasWidth: number;

  /** Canvas height in pixels */
  canvasHeight: number;

  /** Current zoom level (1.0 = 100%) */
  zoom: number;

  /** Pan offset X in pixels */
  panX: number;

  /** Pan offset Y in pixels */
  panY: number;
}

/**
 * Return type for useCoordinateSystem hook
 */
export interface CoordinateSystemAPI {
  // Basic transformations
  toNormalized: (x: number, y: number) => Point;
  toCanvas: (x: number, y: number) => Point;
  normalizeDistance: (pixels: number) => number;
  denormalizeDistance: (normalized: number) => number;

  // Point array transformations
  normalizePoints: (points: Point[]) => Point[];
  denormalizePoints: (points: Point[]) => Point[];

  // Zoom/pan transformations
  applyZoom: (x: number, y: number) => Point;
  reverseZoom: (x: number, y: number) => Point;

  // Annotation operations
  scaleForZoom: (annotation: AnnotationData) => AnnotationData;
  getBoundingBox: (annotation: AnnotationData) => ReturnType<typeof getBoundingBox>;
  getVisibleAnnotations: (annotations: AnnotationData[]) => AnnotationData[];

  // Event handling
  eventToNormalized: (
    event: MouseEvent | TouchEvent,
    canvasElement: HTMLElement
  ) => Point | null;

  // Distance/area calculations
  calculateDistance: (p1: Point, p2: Point, inPixels?: boolean) => number;
  calculateArea: (points: Point[]) => number;

  // Visual properties
  getStrokeWidth: (baseWidth: number, scaleWithZoom?: boolean) => number;
  getFontSize: (baseFontSize: number, scaleWithZoom?: boolean) => number;

  // Viewport utilities
  visibleBounds: ReturnType<typeof getVisibleBounds>;
  getZoomToFit: (annotation: AnnotationData, padding?: number) => number;
  getPanToCenter: (annotation: AnnotationData) => Point;

  // Bounds utilities
  clampZoom: (zoom: number, minZoom?: number, maxZoom?: number) => number;
  clampPan: (pan: Point) => Point;

  // Current state
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Custom hook for coordinate system management
 *
 * Provides memoized transformation functions and utilities for working with
 * normalized coordinates, zoom, and pan.
 *
 * @param props - Coordinate system configuration
 * @returns API object with transformation functions and utilities
 *
 * @example
 * ```tsx
 * function AnnotationCanvas() {
 *   const [zoom, setZoom] = useState(1.0);
 *   const [pan, setPan] = useState({ x: 0, y: 0 });
 *
 *   const coordSystem = useCoordinateSystem({
 *     canvasWidth: 800,
 *     canvasHeight: 600,
 *     zoom,
 *     panX: pan.x,
 *     panY: pan.y,
 *   });
 *
 *   const handleClick = (e: MouseEvent) => {
 *     const normalized = coordSystem.eventToNormalized(e, canvasRef.current);
 *     if (normalized) {
 *       // Create annotation at normalized coords
 *       addAnnotation({ x: normalized.x, y: normalized.y, ... });
 *     }
 *   };
 *
 *   const visibleAnnotations = coordSystem.getVisibleAnnotations(allAnnotations);
 *
 *   return <canvas ref={canvasRef} onClick={handleClick} />;
 * }
 * ```
 */
export function useCoordinateSystem(props: CoordinateSystemProps): CoordinateSystemAPI {
  const { canvasWidth, canvasHeight, zoom, panX, panY } = props;

  // Memoize visible bounds calculation
  const visibleBounds = useMemo(
    () => getVisibleBounds(canvasWidth, canvasHeight, zoom, panX, panY),
    [canvasWidth, canvasHeight, zoom, panX, panY]
  );

  // Basic transformation functions
  const toNormalized = useCallback(
    (x: number, y: number) => toNormalizedCoordinates(x, y, canvasWidth, canvasHeight),
    [canvasWidth, canvasHeight]
  );

  const toCanvas = useCallback(
    (x: number, y: number) => toCanvasCoordinates(x, y, canvasWidth, canvasHeight),
    [canvasWidth, canvasHeight]
  );

  const normalizeDistanceCallback = useCallback(
    (pixels: number) => normalizeDistance(pixels, canvasWidth),
    [canvasWidth]
  );

  const denormalizeDistanceCallback = useCallback(
    (normalized: number) => denormalizeDistance(normalized, canvasWidth),
    [canvasWidth]
  );

  // Point array transformations
  const normalizePointsCallback = useCallback(
    (points: Point[]) => normalizePoints(points, canvasWidth, canvasHeight),
    [canvasWidth, canvasHeight]
  );

  const denormalizePointsCallback = useCallback(
    (points: Point[]) => denormalizePoints(points, canvasWidth, canvasHeight),
    [canvasWidth, canvasHeight]
  );

  // Zoom/pan transformations
  const applyZoom = useCallback(
    (x: number, y: number) => applyZoomTransform(x, y, zoom, panX, panY),
    [zoom, panX, panY]
  );

  const reverseZoom = useCallback(
    (x: number, y: number) => reverseZoomTransform(x, y, zoom, panX, panY),
    [zoom, panX, panY]
  );

  // Annotation operations
  const scaleForZoom = useCallback(
    (annotation: AnnotationData) => scaleAnnotationForZoom(annotation, zoom),
    [zoom]
  );

  const getBoundingBoxCallback = useCallback(
    (annotation: AnnotationData) => getBoundingBox(annotation),
    []
  );

  const getVisibleAnnotations = useCallback(
    (annotations: AnnotationData[]) =>
      filterVisibleAnnotations(annotations, canvasWidth, canvasHeight, zoom, panX, panY),
    [canvasWidth, canvasHeight, zoom, panX, panY]
  );

  // Event handling
  const eventToNormalized = useCallback(
    (event: MouseEvent | TouchEvent, canvasElement: HTMLElement) =>
      eventToNormalizedCoordinates(
        event,
        canvasElement,
        canvasWidth,
        canvasHeight,
        zoom,
        panX,
        panY
      ),
    [canvasWidth, canvasHeight, zoom, panX, panY]
  );

  // Distance/area calculations
  const calculateDistance = useCallback(
    (p1: Point, p2: Point, inPixels: boolean = false) => {
      if (inPixels) {
        // Convert to canvas coords and calculate
        const c1 = toCanvas(p1.x, p1.y);
        const c2 = toCanvas(p2.x, p2.y);
        return calculateCanvasDistance(c1, c2);
      } else {
        // Calculate in normalized space
        return calculateNormalizedDistance(p1, p2);
      }
    },
    [toCanvas]
  );

  const calculateArea = useCallback((points: Point[]) => {
    return calculateNormalizedArea(points);
  }, []);

  // Visual properties
  const getStrokeWidth = useCallback(
    (baseWidth: number, scaleWithZoom: boolean = false) =>
      getEffectiveStrokeWidth(baseWidth, zoom, scaleWithZoom),
    [zoom]
  );

  const getFontSize = useCallback(
    (baseFontSize: number, scaleWithZoom: boolean = true) =>
      getEffectiveFontSize(baseFontSize, zoom, scaleWithZoom),
    [zoom]
  );

  // Viewport utilities
  const getZoomToFit = useCallback(
    (annotation: AnnotationData, padding: number = 0.1) =>
      getZoomToFitAnnotation(annotation, canvasWidth, canvasHeight, padding),
    [canvasWidth, canvasHeight]
  );

  const getPanToCenter = useCallback(
    (annotation: AnnotationData) =>
      getPanToCenterAnnotation(annotation, canvasWidth, canvasHeight, zoom),
    [canvasWidth, canvasHeight, zoom]
  );

  // Bounds utilities
  const clampZoomCallback = useCallback(
    (zoom: number, minZoom?: number, maxZoom?: number) =>
      clampZoom(zoom, minZoom, maxZoom),
    []
  );

  const clampPanCallback = useCallback(
    (pan: Point) => clampPan(pan, canvasWidth, canvasHeight, zoom),
    [canvasWidth, canvasHeight, zoom]
  );

  return {
    // Basic transformations
    toNormalized,
    toCanvas,
    normalizeDistance: normalizeDistanceCallback,
    denormalizeDistance: denormalizeDistanceCallback,

    // Point array transformations
    normalizePoints: normalizePointsCallback,
    denormalizePoints: denormalizePointsCallback,

    // Zoom/pan transformations
    applyZoom,
    reverseZoom,

    // Annotation operations
    scaleForZoom,
    getBoundingBox: getBoundingBoxCallback,
    getVisibleAnnotations,

    // Event handling
    eventToNormalized,

    // Distance/area calculations
    calculateDistance,
    calculateArea,

    // Visual properties
    getStrokeWidth,
    getFontSize,

    // Viewport utilities
    visibleBounds,
    getZoomToFit,
    getPanToCenter,

    // Bounds utilities
    clampZoom: clampZoomCallback,
    clampPan: clampPanCallback,

    // Current state
    canvasWidth,
    canvasHeight,
    zoom,
    panX,
    panY,
  };
}

/**
 * Hook for tracking canvas dimensions
 *
 * Useful for getting canvas size from a ref.
 *
 * @param canvasRef - Ref to canvas element
 * @returns Current canvas dimensions
 *
 * @example
 * ```tsx
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * const { width, height } = useCanvasDimensions(canvasRef);
 * ```
 */
export function useCanvasDimensions(
  canvasRef: RefObject<HTMLElement>
): { width: number; height: number } {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setDimensions({
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();

    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [canvasRef]);

  return dimensions;
}

/**
 * Hook for managing zoom and pan state with constraints
 *
 * Provides state management for zoom/pan with automatic clamping.
 *
 * @param initialZoom - Initial zoom level (default: 1.0)
 * @param initialPan - Initial pan offset (default: {x: 0, y: 0})
 * @returns Zoom/pan state and setters
 *
 * @example
 * ```tsx
 * const { zoom, pan, setZoom, setPan, resetView } = useZoomPan();
 *
 * <button onClick={() => setZoom(zoom * 1.2)}>Zoom In</button>
 * <button onClick={resetView}>Reset</button>
 * ```
 */
export function useZoomPan(
  initialZoom: number = 1.0,
  initialPan: Point = { x: 0, y: 0 }
) {
  const [zoom, setZoomState] = useState(initialZoom);
  const [pan, setPanState] = useState(initialPan);

  const setZoom = useCallback(
    (newZoom: number) => {
      setZoomState(clampZoom(newZoom));
    },
    []
  );

  const setPan = useCallback(
    (newPan: Point) => {
      setPanState(newPan);
    },
    []
  );

  const resetView = useCallback(() => {
    setZoomState(initialZoom);
    setPanState(initialPan);
  }, [initialZoom, initialPan]);

  const zoomIn = useCallback(() => {
    setZoom(zoom * 1.2);
  }, [zoom, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(zoom / 1.2);
  }, [zoom, setZoom]);

  return {
    zoom,
    pan,
    setZoom,
    setPan,
    resetView,
    zoomIn,
    zoomOut,
  };
}
