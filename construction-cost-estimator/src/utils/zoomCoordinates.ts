/**
 * Zoom-Aware Coordinate System
 *
 * This module handles coordinate transformations when zoom and pan are applied.
 * It enables proper rendering and interaction with annotations at any zoom level.
 *
 * Transform Pipeline:
 * 1. Normalized coords [0,1] -> Canvas coords [pixels]
 * 2. Apply zoom transform: scale(zoom)
 * 3. Apply pan offset: translate(panX, panY)
 *
 * For mouse events, reverse the pipeline to get normalized coords from screen position.
 */

import type { AnnotationData } from '../types/store';
import type { Point, BoundingBox } from './coordinates';
import { getBoundingBox, doBoundingBoxesIntersect, toCanvasCoordinates, toNormalizedCoordinates } from './coordinates';

/**
 * Apply zoom and pan transforms to canvas coordinates
 *
 * This transforms canvas pixel coordinates to screen coordinates after
 * applying zoom and pan transformations.
 *
 * @param x - X coordinate in canvas pixels
 * @param y - Y coordinate in canvas pixels
 * @param zoom - Zoom level (1.0 = 100%)
 * @param panX - Pan offset X in pixels
 * @param panY - Pan offset Y in pixels
 * @returns Screen coordinates after zoom/pan transform
 *
 * @example
 * // Canvas point at (400, 300) with 150% zoom and pan of (50, 0)
 * const screen = applyZoomTransform(400, 300, 1.5, 50, 0);
 * // Result: { x: 650, y: 450 } (scaled by 1.5 and offset by 50)
 */
export function applyZoomTransform(
  x: number,
  y: number,
  zoom: number,
  panX: number,
  panY: number
): Point {
  // First scale by zoom
  const scaledX = x * zoom;
  const scaledY = y * zoom;

  // Then apply pan offset
  return {
    x: scaledX + panX,
    y: scaledY + panY,
  };
}

/**
 * Reverse zoom and pan transforms to get canvas coordinates from screen position
 *
 * This is used for mouse/touch events to convert screen coordinates back to
 * canvas pixel coordinates.
 *
 * @param screenX - X coordinate on screen (after zoom/pan)
 * @param screenY - Y coordinate on screen (after zoom/pan)
 * @param zoom - Zoom level (1.0 = 100%)
 * @param panX - Pan offset X in pixels
 * @param panY - Pan offset Y in pixels
 * @returns Canvas coordinates before zoom/pan transform
 *
 * @example
 * // User clicks at screen position (650, 450) with 150% zoom and pan of (50, 0)
 * const canvas = reverseZoomTransform(650, 450, 1.5, 50, 0);
 * // Result: { x: 400, y: 300 } (original canvas coordinates)
 */
export function reverseZoomTransform(
  screenX: number,
  screenY: number,
  zoom: number,
  panX: number,
  panY: number
): Point {
  if (zoom === 0) {
    console.warn('Zoom level is zero, returning (0, 0)');
    return { x: 0, y: 0 };
  }

  // Remove pan offset first
  const unpannedX = screenX - panX;
  const unpannedY = screenY - panY;

  // Then unscale by zoom
  return {
    x: unpannedX / zoom,
    y: unpannedY / zoom,
  };
}

/**
 * Get visible bounds of the canvas in normalized coordinates
 *
 * Returns the portion of the normalized coordinate space [0,1] that is
 * currently visible in the viewport considering zoom and pan.
 *
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param zoom - Zoom level (1.0 = 100%)
 * @param panX - Pan offset X in pixels
 * @param panY - Pan offset Y in pixels
 * @returns Visible bounds in normalized coordinates
 *
 * @example
 * // Zoomed to 200% and panned right
 * const visible = getVisibleBounds(800, 600, 2.0, -400, 0);
 * // Returns the normalized rect of what's currently visible
 */
export function getVisibleBounds(
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  panX: number,
  panY: number
): BoundingBox {
  if (canvasWidth === 0 || canvasHeight === 0 || zoom === 0) {
    console.warn('Invalid dimensions or zoom, returning empty bounds');
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // The viewport shows a portion of the zoomed canvas
  // Calculate which part of the original canvas is visible

  // Top-left corner of visible area in screen coordinates
  const screenTopLeft = { x: 0, y: 0 };

  // Bottom-right corner of visible area in screen coordinates
  const screenBottomRight = { x: canvasWidth, y: canvasHeight };

  // Convert to canvas coordinates
  const canvasTopLeft = reverseZoomTransform(
    screenTopLeft.x,
    screenTopLeft.y,
    zoom,
    panX,
    panY
  );

  const canvasBottomRight = reverseZoomTransform(
    screenBottomRight.x,
    screenBottomRight.y,
    zoom,
    panX,
    panY
  );

  // Convert to normalized coordinates
  const normalizedTopLeft = toNormalizedCoordinates(
    canvasTopLeft.x,
    canvasTopLeft.y,
    canvasWidth,
    canvasHeight
  );

  const normalizedBottomRight = toNormalizedCoordinates(
    canvasBottomRight.x,
    canvasBottomRight.y,
    canvasWidth,
    canvasHeight
  );

  // Clamp to valid range [0, 1]
  const x = Math.max(0, Math.min(1, normalizedTopLeft.x));
  const y = Math.max(0, Math.min(1, normalizedTopLeft.y));
  const maxX = Math.max(0, Math.min(1, normalizedBottomRight.x));
  const maxY = Math.max(0, Math.min(1, normalizedBottomRight.y));

  return {
    x,
    y,
    width: maxX - x,
    height: maxY - y,
  };
}

/**
 * Filter annotations by visibility in current viewport
 *
 * Returns only annotations that are at least partially visible in the
 * current viewport considering zoom and pan. This is useful for performance
 * optimization to avoid rendering off-screen annotations.
 *
 * @param annotations - Array of all annotations
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param zoom - Zoom level (1.0 = 100%)
 * @param panX - Pan offset X in pixels
 * @param panY - Pan offset Y in pixels
 * @returns Array of visible annotations
 *
 * @example
 * // Filter annotations for current viewport
 * const visible = filterVisibleAnnotations(
 *   allAnnotations,
 *   800, 600,
 *   2.0, -200, -100
 * );
 * // Returns only annotations in the visible area
 */
export function filterVisibleAnnotations(
  annotations: AnnotationData[],
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  panX: number,
  panY: number
): AnnotationData[] {
  const visibleBounds = getVisibleBounds(canvasWidth, canvasHeight, zoom, panX, panY);

  return annotations.filter((annotation) => {
    const annotationBounds = getBoundingBox(annotation);
    return doBoundingBoxesIntersect(annotationBounds, visibleBounds);
  });
}

/**
 * Convert mouse/touch event to normalized coordinates
 *
 * This is the main function to use for handling user input events.
 * It takes screen coordinates from a mouse/touch event and converts them
 * to normalized coordinates [0,1] accounting for zoom and pan.
 *
 * @param event - Mouse or touch event
 * @param canvasElement - The canvas/stage DOM element
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param zoom - Current zoom level
 * @param panX - Current pan offset X
 * @param panY - Current pan offset Y
 * @returns Normalized coordinates [0,1]
 *
 * @example
 * // In a mouse event handler
 * const handleMouseClick = (e: MouseEvent) => {
 *   const normalized = eventToNormalizedCoordinates(
 *     e,
 *     canvasRef.current,
 *     800, 600,
 *     currentZoom,
 *     currentPan.x,
 *     currentPan.y
 *   );
 *   // Use normalized coordinates to create annotation
 * };
 */
export function eventToNormalizedCoordinates(
  event: MouseEvent | TouchEvent,
  canvasElement: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  panX: number,
  panY: number
): Point | null {
  if (!canvasElement) {
    console.warn('Canvas element is null');
    return null;
  }

  const rect = canvasElement.getBoundingClientRect();

  // Get screen coordinates relative to canvas element
  let screenX: number;
  let screenY: number;

  if ('touches' in event && event.touches.length > 0) {
    // Touch event
    screenX = event.touches[0].clientX - rect.left;
    screenY = event.touches[0].clientY - rect.top;
  } else if ('clientX' in event) {
    // Mouse event
    screenX = event.clientX - rect.left;
    screenY = event.clientY - rect.top;
  } else {
    console.warn('Unrecognized event type');
    return null;
  }

  // Convert screen coordinates to canvas coordinates (reverse zoom/pan)
  const canvasCoords = reverseZoomTransform(screenX, screenY, zoom, panX, panY);

  // Convert to normalized coordinates
  return toNormalizedCoordinates(
    canvasCoords.x,
    canvasCoords.y,
    canvasWidth,
    canvasHeight
  );
}

/**
 * Calculate effective stroke width for rendering at current zoom
 *
 * Adjusts stroke width so it appears consistent at different zoom levels.
 * Can be configured to either scale with zoom or stay constant.
 *
 * @param baseWidth - Base stroke width at 100% zoom
 * @param zoom - Current zoom level
 * @param scaleWithZoom - Whether to scale with zoom (default: false)
 * @returns Adjusted stroke width
 *
 * @example
 * // Keep stroke width constant at all zoom levels
 * const width = getEffectiveStrokeWidth(2, 1.5, false);
 * // Result: ~1.33 (smaller to compensate for zoom)
 *
 * // Scale stroke width with zoom
 * const width = getEffectiveStrokeWidth(2, 1.5, true);
 * // Result: 2 (unchanged, CSS transform will scale it)
 */
export function getEffectiveStrokeWidth(
  baseWidth: number,
  zoom: number,
  scaleWithZoom: boolean = false
): number {
  if (zoom === 0) {
    console.warn('Zoom level is zero, returning base width');
    return baseWidth;
  }

  if (scaleWithZoom) {
    // Stroke scales with zoom (via CSS transform)
    return baseWidth;
  } else {
    // Stroke stays constant (compensate for zoom)
    return baseWidth / zoom;
  }
}

/**
 * Calculate effective font size for rendering at current zoom
 *
 * Similar to stroke width, adjusts font size for consistent appearance.
 *
 * @param baseFontSize - Base font size at 100% zoom
 * @param zoom - Current zoom level
 * @param scaleWithZoom - Whether to scale with zoom (default: true)
 * @returns Adjusted font size
 */
export function getEffectiveFontSize(
  baseFontSize: number,
  zoom: number,
  scaleWithZoom: boolean = true
): number {
  if (zoom === 0) {
    console.warn('Zoom level is zero, returning base font size');
    return baseFontSize;
  }

  if (scaleWithZoom) {
    // Font scales with zoom (via CSS transform)
    return baseFontSize;
  } else {
    // Font stays constant (compensate for zoom)
    return baseFontSize / zoom;
  }
}

/**
 * Calculate zoom level to fit annotation in viewport
 *
 * Useful for "zoom to fit" functionality.
 *
 * @param annotation - Annotation to fit
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param padding - Padding around annotation (normalized, default 0.1)
 * @returns Zoom level to fit annotation
 */
export function getZoomToFitAnnotation(
  annotation: AnnotationData,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 0.1
): number {
  const bbox = getBoundingBox(annotation);

  if (bbox.width === 0 || bbox.height === 0) {
    return 1.0; // Can't zoom to a point
  }

  // Add padding
  const paddedWidth = bbox.width + padding * 2;
  const paddedHeight = bbox.height + padding * 2;

  // Calculate zoom needed to fit width and height
  const zoomX = 1 / paddedWidth;
  const zoomY = 1 / paddedHeight;

  // Use smaller zoom to ensure entire annotation fits
  return Math.min(zoomX, zoomY);
}

/**
 * Calculate pan offset to center annotation in viewport
 *
 * @param annotation - Annotation to center
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param zoom - Current zoom level
 * @returns Pan offset {x, y} to center annotation
 */
export function getPanToCenterAnnotation(
  annotation: AnnotationData,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number
): Point {
  const bbox = getBoundingBox(annotation);

  // Center of annotation in normalized coords
  const centerNormalized = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
  };

  // Convert to canvas coords
  const centerCanvas = toCanvasCoordinates(
    centerNormalized.x,
    centerNormalized.y,
    canvasWidth,
    canvasHeight
  );

  // Center of viewport in canvas coords
  const viewportCenter = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
  };

  // Calculate pan needed to center annotation
  // After zoom, we need: centerCanvas * zoom + pan = viewportCenter
  return {
    x: viewportCenter.x - centerCanvas.x * zoom,
    y: viewportCenter.y - centerCanvas.y * zoom,
  };
}

/**
 * Clamp zoom level to reasonable bounds
 *
 * @param zoom - Desired zoom level
 * @param minZoom - Minimum zoom (default 0.1)
 * @param maxZoom - Maximum zoom (default 10.0)
 * @returns Clamped zoom level
 */
export function clampZoom(
  zoom: number,
  minZoom: number = 0.1,
  maxZoom: number = 10.0
): number {
  return Math.max(minZoom, Math.min(maxZoom, zoom));
}

/**
 * Clamp pan offset to prevent panning too far away
 *
 * @param pan - Desired pan offset
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param zoom - Current zoom level
 * @returns Clamped pan offset
 */
export function clampPan(
  pan: Point,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number
): Point {
  // Allow panning up to one canvas dimension away from origin
  const maxPanX = canvasWidth * zoom;
  const maxPanY = canvasHeight * zoom;

  return {
    x: Math.max(-maxPanX, Math.min(maxPanX, pan.x)),
    y: Math.max(-maxPanY, Math.min(maxPanY, pan.y)),
  };
}
