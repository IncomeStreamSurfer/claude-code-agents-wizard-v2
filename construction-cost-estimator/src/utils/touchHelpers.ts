/**
 * Touch Helper Utilities
 *
 * Provides utility functions for touch event handling, gesture recognition,
 * and touch position calculations.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Get the position of a touch event relative to an element
 * Handles coordinate transformation for proper positioning
 */
export function getTouchPosition(e: TouchEvent, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect();
  const touch = e.touches[0] || e.changedTouches[0];

  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

/**
 * Get multiple touch positions relative to an element
 */
export function getAllTouchPositions(e: TouchEvent, element: HTMLElement): Point[] {
  const rect = element.getBoundingClientRect();
  const positions: Point[] = [];

  for (let i = 0; i < e.touches.length; i++) {
    const touch = e.touches[i];
    positions.push({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  }

  return positions;
}

/**
 * Calculate the distance between two touch points
 */
export function getMultiTouchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;

  const touch1 = touches[0];
  const touch2 = touches[1];

  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the center point between multiple touches
 */
export function getMultiTouchCenter(touches: TouchList): Point {
  if (touches.length === 0) return { x: 0, y: 0 };

  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < touches.length; i++) {
    sumX += touches[i].clientX;
    sumY += touches[i].clientY;
  }

  return {
    x: sumX / touches.length,
    y: sumY / touches.length,
  };
}

/**
 * Calculate the center point between multiple touches relative to an element
 */
export function getMultiTouchCenterRelative(touches: TouchList, element: HTMLElement): Point {
  const center = getMultiTouchCenter(touches);
  const rect = element.getBoundingClientRect();

  return {
    x: center.x - rect.left,
    y: center.y - rect.top,
  };
}

/**
 * Check if a touch duration qualifies as a long press
 */
export function isLongPress(duration: number, threshold: number = 500): boolean {
  return duration >= threshold;
}

/**
 * Check if a touch movement qualifies as a tap (minimal movement)
 */
export function isTap(distance: number, threshold: number = 10): boolean {
  return distance <= threshold;
}

/**
 * Check if the current touch state is a pinch gesture (2 fingers)
 */
export function isPinch(touches: TouchList): boolean {
  return touches.length === 2;
}

/**
 * Check if the current touch state is a pan gesture (2+ fingers)
 */
export function isPan(touches: TouchList): boolean {
  return touches.length >= 2;
}

/**
 * Calculate the distance between two points
 */
export function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the angle between two points (in radians)
 */
export function getAngle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Calculate rotation angle between two sets of touch points
 */
export function getRotationAngle(touches: TouchList, previousTouches: Point[]): number {
  if (touches.length < 2 || previousTouches.length < 2) return 0;

  const currentAngle = getAngle(
    { x: touches[0].clientX, y: touches[0].clientY },
    { x: touches[1].clientX, y: touches[1].clientY }
  );

  const previousAngle = getAngle(previousTouches[0], previousTouches[1]);

  return currentAngle - previousAngle;
}

/**
 * Prevent default touch behavior (prevents zoom, scroll, etc.)
 */
export function preventDefaultTouchBehavior(e: TouchEvent): void {
  e.preventDefault();
}

/**
 * Check if touch events are supported
 */
export function isTouchSupported(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Check if multi-touch is supported
 */
export function isMultiTouchSupported(): boolean {
  return navigator.maxTouchPoints > 1 || (navigator as any).msMaxTouchPoints > 1;
}

/**
 * Debounce function for touch events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for touch events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Check if two touch events are from the same touch
 */
export function isSameTouch(touch1: Touch, touch2: Touch): boolean {
  return touch1.identifier === touch2.identifier;
}

/**
 * Get the velocity of a touch movement (pixels per millisecond)
 */
export function getTouchVelocity(
  startPos: Point,
  endPos: Point,
  duration: number
): Point {
  if (duration === 0) return { x: 0, y: 0 };

  return {
    x: (endPos.x - startPos.x) / duration,
    y: (endPos.y - startPos.y) / duration,
  };
}

/**
 * Check if a swipe gesture occurred
 */
export function isSwipe(
  startPos: Point,
  endPos: Point,
  duration: number,
  minDistance: number = 50,
  maxDuration: number = 300
): boolean {
  if (duration > maxDuration) return false;

  const distance = getDistance(startPos, endPos);
  return distance >= minDistance;
}

/**
 * Get swipe direction
 */
export function getSwipeDirection(
  startPos: Point,
  endPos: Point
): 'up' | 'down' | 'left' | 'right' | null {
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Require minimum movement
  if (absDx < 30 && absDy < 30) return null;

  // Determine primary direction
  if (absDx > absDy) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

/**
 * Convert touch event to a normalized point (0-1 range within element)
 */
export function getNormalizedTouchPosition(e: TouchEvent, element: HTMLElement): Point {
  const pos = getTouchPosition(e, element);
  const rect = element.getBoundingClientRect();

  return {
    x: pos.x / rect.width,
    y: pos.y / rect.height,
  };
}

/**
 * Add passive event listener (improves scroll performance)
 */
export function addPassiveEventListener(
  element: HTMLElement | Window,
  event: string,
  handler: EventListener
): void {
  element.addEventListener(event, handler, { passive: true });
}

/**
 * Remove passive event listener
 */
export function removePassiveEventListener(
  element: HTMLElement | Window,
  event: string,
  handler: EventListener
): void {
  element.removeEventListener(event, handler);
}
