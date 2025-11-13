/**
 * Hook for Drag Event Management
 *
 * Provides drag event handlers with:
 * - Real-time position updates during drag
 * - Grid snapping functionality
 * - Debounced store updates for performance
 * - Click vs drag detection
 * - Canvas bounds constraints
 */

import { useCallback, useRef, useState } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { AnnotationData } from '../types/store';

export interface DragHandlingOptions {
  /** Canvas width in pixels */
  canvasWidth: number;

  /** Canvas height in pixels */
  canvasHeight: number;

  /** Grid size for snapping (0 = no snapping, 0.05 = 5% snaps) */
  gridSize?: number;

  /** Minimum pixel movement before registering as drag (prevents accidental moves) */
  dragSensitivity?: number;

  /** Callback when annotation position changes */
  onUpdate?: (id: string, updates: Partial<AnnotationData>) => void;

  /** Callback when drag starts */
  onDragStart?: (id: string) => void;

  /** Callback when drag ends */
  onDragEnd?: (id: string, finalPosition: { x: number; y: number }) => void;
}

export interface DragHandlingResult {
  /** Handle drag start event */
  handleDragStart: (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => void;

  /** Handle drag move event */
  handleDragMove: (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => void;

  /** Handle drag end event */
  handleDragEnd: (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => void;

  /** Check if currently dragging */
  isDragging: boolean;

  /** Current drag position (normalized) */
  dragPosition: { x: number; y: number } | null;
}

/**
 * Normalize coordinate from pixels to 0-1 range
 */
const normalizeCoordinate = (pixel: number, dimension: number): number => {
  return Math.max(0, Math.min(1, pixel / dimension));
};

/**
 * Snap coordinate to grid
 */
const snapToGrid = (value: number, gridSize: number): number => {
  if (gridSize === 0) return value;
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Clamp value to canvas bounds
 */
const clampToCanvas = (
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } => {
  return {
    x: Math.max(0, Math.min(canvasWidth, x)),
    y: Math.max(0, Math.min(canvasHeight, y)),
  };
};

/**
 * Hook for managing drag interactions with annotations
 */
export function useDragHandling(options: DragHandlingOptions): DragHandlingResult {
  const {
    canvasWidth,
    canvasHeight,
    gridSize = 0,
    dragSensitivity = 3,
    onUpdate,
    onDragStart,
    onDragEnd,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const originalPos = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(
    (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => {
      const node = e.target;

      // Store original position
      dragStartPos.current = { x: node.x(), y: node.y() };
      originalPos.current = { x: annotation.x, y: annotation.y };
      hasMoved.current = false;

      setIsDragging(true);

      if (onDragStart) {
        onDragStart(annotation.id);
      }
    },
    [onDragStart]
  );

  /**
   * Handle drag move with throttling
   */
  const handleDragMove = useCallback(
    (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => {
      const node = e.target;

      // Check if movement exceeds sensitivity threshold
      if (dragStartPos.current && !hasMoved.current) {
        const dx = Math.abs(node.x() - dragStartPos.current.x);
        const dy = Math.abs(node.y() - dragStartPos.current.y);

        if (dx < dragSensitivity && dy < dragSensitivity) {
          return; // Not enough movement yet
        }

        hasMoved.current = true;
      }

      // Clamp to canvas bounds
      const clamped = clampToCanvas(node.x(), node.y(), canvasWidth, canvasHeight);
      node.position(clamped);

      // Normalize coordinates
      let normalizedX = normalizeCoordinate(clamped.x, canvasWidth);
      let normalizedY = normalizeCoordinate(clamped.y, canvasHeight);

      // Apply grid snapping if enabled
      if (gridSize > 0) {
        normalizedX = snapToGrid(normalizedX, gridSize);
        normalizedY = snapToGrid(normalizedY, gridSize);
      }

      setDragPosition({ x: normalizedX, y: normalizedY });

      // Debounce store updates for performance
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        if (onUpdate) {
          onUpdate(annotation.id, {
            x: normalizedX,
            y: normalizedY,
          });
        }
      }, 16); // ~60fps
    },
    [canvasWidth, canvasHeight, gridSize, dragSensitivity, onUpdate]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(
    (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => {
      const node = e.target;

      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      // If didn't move enough, treat as click
      if (!hasMoved.current && dragStartPos.current) {
        node.position(dragStartPos.current);
        setIsDragging(false);
        setDragPosition(null);
        return;
      }

      // Clamp to canvas bounds
      const clamped = clampToCanvas(node.x(), node.y(), canvasWidth, canvasHeight);
      node.position(clamped);

      // Normalize final position
      let normalizedX = normalizeCoordinate(clamped.x, canvasWidth);
      let normalizedY = normalizeCoordinate(clamped.y, canvasHeight);

      // Apply grid snapping if enabled
      if (gridSize > 0) {
        normalizedX = snapToGrid(normalizedX, gridSize);
        normalizedY = snapToGrid(normalizedY, gridSize);

        // Snap visual position too
        const snappedX = normalizedX * canvasWidth;
        const snappedY = normalizedY * canvasHeight;
        node.position({ x: snappedX, y: snappedY });
      }

      const finalPosition = { x: normalizedX, y: normalizedY };

      // Update store with final position
      if (onUpdate) {
        onUpdate(annotation.id, finalPosition);
      }

      if (onDragEnd) {
        onDragEnd(annotation.id, finalPosition);
      }

      setIsDragging(false);
      setDragPosition(null);
      dragStartPos.current = null;
      originalPos.current = null;
      hasMoved.current = false;
    },
    [canvasWidth, canvasHeight, gridSize, onUpdate, onDragEnd]
  );

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    isDragging,
    dragPosition,
  };
}
