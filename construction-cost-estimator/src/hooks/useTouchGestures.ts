import { useCallback, useEffect, useRef, useState } from 'react';
import type { Point } from '../utils/touchHelpers';
import {
  getTouchPosition,
  getMultiTouchDistance,
  getMultiTouchCenterRelative,
  getDistance,
  getSwipeDirection,
  throttle,
  isTap as checkIsTap,
} from '../utils/touchHelpers';

/**
 * Touch state interface
 */
export interface TouchState {
  isTouching: boolean;
  startPosition: Point;
  currentPosition: Point;
  previousPosition: Point;
  startTime: number;
  touchCount: number;
  isLongPress: boolean;
  isPinch: boolean;
  isPan: boolean;
  isDragging: boolean;
  initialDistance: number;
  currentDistance: number;
  initialZoom: number;
  centerPoint: Point;
}

/**
 * Touch gesture callbacks
 */
interface TouchGestureCallbacks {
  onTap?: (position: Point) => void;
  onDoubleTap?: (position: Point) => void;
  onLongPress?: (position: Point) => void;
  onDragStart?: (position: Point) => void;
  onDrag?: (position: Point, delta: Point) => void;
  onDragEnd?: (position: Point) => void;
  onPinchStart?: (scale: number, center: Point) => void;
  onPinch?: (scale: number, center: Point) => void;
  onPinchEnd?: (scale: number, center: Point) => void;
  onPanStart?: (position: Point) => void;
  onPan?: (delta: Point, center: Point) => void;
  onPanEnd?: (position: Point) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', startPos: Point, endPos: Point) => void;
}

/**
 * Touch gesture configuration
 */
interface TouchGestureConfig {
  longPressDelay?: number;
  tapThreshold?: number;
  doubleTapDelay?: number;
  swipeMinDistance?: number;
  swipeMaxDuration?: number;
  dragThreshold?: number;
  preventDefaultOnTouch?: boolean;
  enablePinch?: boolean;
  enablePan?: boolean;
}

const DEFAULT_CONFIG: Required<TouchGestureConfig> = {
  longPressDelay: 500,
  tapThreshold: 10,
  doubleTapDelay: 300,
  swipeMinDistance: 50,
  swipeMaxDuration: 300,
  dragThreshold: 5,
  preventDefaultOnTouch: true,
  enablePinch: true,
  enablePan: true,
};

/**
 * Custom hook for touch gesture recognition
 */
export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: TouchGestureCallbacks = {},
  config: TouchGestureConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [state, setState] = useState<TouchState>({
    isTouching: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    startTime: 0,
    touchCount: 0,
    isLongPress: false,
    isPinch: false,
    isPan: false,
    isDragging: false,
    initialDistance: 0,
    currentDistance: 0,
    initialZoom: 1,
    centerPoint: { x: 0, y: 0 },
  });

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const previousTouchesRef = useRef<Point[]>([]);
  const hasDraggedRef = useRef<boolean>(false);

  /**
   * Clear long press timer
   */
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!elementRef.current) return;

      if (finalConfig.preventDefaultOnTouch) {
        e.preventDefault();
      }

      const element = elementRef.current;
      const touchCount = e.touches.length;
      const startTime = Date.now();

      if (touchCount === 1) {
        // Single touch
        const position = getTouchPosition(e, element);

        setState((prev) => ({
          ...prev,
          isTouching: true,
          startPosition: position,
          currentPosition: position,
          previousPosition: position,
          startTime,
          touchCount,
          isDragging: false,
          isLongPress: false,
          isPinch: false,
          isPan: false,
        }));

        hasDraggedRef.current = false;

        // Start long press timer
        clearLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, isLongPress: true }));
          callbacks.onLongPress?.(position);
        }, finalConfig.longPressDelay);
      } else if (touchCount === 2 && finalConfig.enablePinch) {
        // Two finger touch - pinch or pan
        clearLongPressTimer();

        const distance = getMultiTouchDistance(e.touches);
        const center = getMultiTouchCenterRelative(e.touches, element);

        setState((prev) => ({
          ...prev,
          isTouching: true,
          touchCount,
          startTime,
          isPinch: true,
          isPan: finalConfig.enablePan,
          initialDistance: distance,
          currentDistance: distance,
          centerPoint: center,
          startPosition: center,
          currentPosition: center,
        }));

        callbacks.onPinchStart?.(1, center);
        if (finalConfig.enablePan) {
          callbacks.onPanStart?.(center);
        }

        // Store initial touch positions
        previousTouchesRef.current = [
          { x: e.touches[0].clientX, y: e.touches[0].clientY },
          { x: e.touches[1].clientX, y: e.touches[1].clientY },
        ];
      }
    },
    [elementRef, callbacks, finalConfig, clearLongPressTimer]
  );

  /**
   * Handle touch move (throttled for performance)
   */
  const handleTouchMove = useCallback(
    throttle((e: TouchEvent) => {
      if (!elementRef.current || !state.isTouching) return;

      if (finalConfig.preventDefaultOnTouch) {
        e.preventDefault();
      }

      const element = elementRef.current;
      const touchCount = e.touches.length;

      if (touchCount === 1) {
        // Single touch - drag
        const position = getTouchPosition(e, element);
        const distance = getDistance(state.startPosition, position);

        // Check if drag threshold exceeded
        if (!state.isDragging && distance > finalConfig.dragThreshold) {
          clearLongPressTimer();
          setState((prev) => ({ ...prev, isDragging: true }));
          callbacks.onDragStart?.(state.startPosition);
          hasDraggedRef.current = true;
        }

        if (state.isDragging) {
          const delta = {
            x: position.x - state.previousPosition.x,
            y: position.y - state.previousPosition.y,
          };
          callbacks.onDrag?.(position, delta);
        }

        setState((prev) => ({
          ...prev,
          currentPosition: position,
          previousPosition: position,
        }));
      } else if (touchCount === 2 && state.isPinch) {
        // Two finger touch - pinch/pan
        const distance = getMultiTouchDistance(e.touches);
        const center = getMultiTouchCenterRelative(e.touches, element);
        const scale = distance / state.initialDistance;

        setState((prev) => ({
          ...prev,
          currentDistance: distance,
          centerPoint: center,
          currentPosition: center,
        }));

        callbacks.onPinch?.(scale, center);

        if (state.isPan && finalConfig.enablePan) {
          const delta = {
            x: center.x - state.previousPosition.x,
            y: center.y - state.previousPosition.y,
          };
          callbacks.onPan?.(delta, center);
        }

        setState((prev) => ({
          ...prev,
          previousPosition: center,
        }));
      }
    }, 16), // ~60fps
    [
      elementRef,
      state,
      callbacks,
      finalConfig,
      clearLongPressTimer,
    ]
  );

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!elementRef.current) return;

      if (finalConfig.preventDefaultOnTouch) {
        e.preventDefault();
      }

      const element = elementRef.current;
      const endTime = Date.now();

      clearLongPressTimer();

      // Handle single touch gestures
      if (state.touchCount === 1 && e.changedTouches.length === 1) {
        const endPosition = getTouchPosition(e, element);
        const distance = getDistance(state.startPosition, endPosition);

        if (state.isDragging) {
          // Drag ended
          callbacks.onDragEnd?.(endPosition);
        } else if (checkIsTap(distance, finalConfig.tapThreshold)) {
          // Check for double tap
          const timeSinceLastTap = endTime - lastTapTimeRef.current;
          if (timeSinceLastTap < finalConfig.doubleTapDelay) {
            callbacks.onDoubleTap?.(endPosition);
            lastTapTimeRef.current = 0; // Reset to prevent triple tap
          } else {
            callbacks.onTap?.(endPosition);
            lastTapTimeRef.current = endTime;
          }
        } else {
          // Check for swipe
          const direction = getSwipeDirection(state.startPosition, endPosition);
          if (direction) {
            callbacks.onSwipe?.(direction, state.startPosition, endPosition);
          }
        }
      } else if (state.isPinch) {
        // Pinch/pan ended
        const scale = state.currentDistance / state.initialDistance;
        callbacks.onPinchEnd?.(scale, state.centerPoint);

        if (state.isPan) {
          callbacks.onPanEnd?.(state.centerPoint);
        }
      }

      // Reset state
      setState({
        isTouching: false,
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        previousPosition: { x: 0, y: 0 },
        startTime: 0,
        touchCount: 0,
        isLongPress: false,
        isPinch: false,
        isPan: false,
        isDragging: false,
        initialDistance: 0,
        currentDistance: 0,
        initialZoom: 1,
        centerPoint: { x: 0, y: 0 },
      });

      hasDraggedRef.current = false;
      previousTouchesRef.current = [];
    },
    [
      elementRef,
      state,
      callbacks,
      finalConfig,
      clearLongPressTimer,
    ]
  );

  /**
   * Handle touch cancel
   */
  const handleTouchCancel = useCallback(() => {
    clearLongPressTimer();
    setState({
      isTouching: false,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      previousPosition: { x: 0, y: 0 },
      startTime: 0,
      touchCount: 0,
      isLongPress: false,
      isPinch: false,
      isPan: false,
      isDragging: false,
      initialDistance: 0,
      currentDistance: 0,
      initialZoom: 1,
      centerPoint: { x: 0, y: 0 },
    });
  }, [clearLongPressTimer]);

  /**
   * Attach event listeners
   */
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      clearLongPressTimer();
    };
  }, [
    elementRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    clearLongPressTimer,
  ]);

  return {
    state,
    isTap: !state.isDragging && !state.isLongPress,
    isLongPress: state.isLongPress,
    isDrag: state.isDragging,
    isPinch: state.isPinch,
    isPan: state.isPan,
  };
}
