import { useCallback, useEffect, useState } from 'react';

/**
 * Haptic Feedback Hook
 *
 * Provides haptic feedback functions using the Vibration API.
 * Gracefully falls back when the API is not supported.
 */

interface HapticFeedbackOptions {
  enabled?: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
}

interface HapticFeedback {
  tap: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
  select: () => void;
  longPress: () => void;
  impact: (intensity?: 'light' | 'medium' | 'heavy') => void;
  isSupported: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Check if the Vibration API is supported
 */
function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger vibration with pattern
 */
function vibrate(pattern: number | number[]): boolean {
  if (!isVibrationSupported()) return false;

  try {
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    console.warn('Vibration API error:', error);
    return false;
  }
}

/**
 * Get vibration duration based on intensity
 */
function getIntensityDuration(intensity: 'light' | 'medium' | 'heavy'): number {
  switch (intensity) {
    case 'light':
      return 10;
    case 'medium':
      return 20;
    case 'heavy':
      return 40;
    default:
      return 20;
  }
}

/**
 * Custom hook for haptic feedback
 */
export function useHapticFeedback(
  options: HapticFeedbackOptions = {}
): HapticFeedback {
  const [isEnabled, setIsEnabled] = useState(options.enabled ?? true);
  const [isSupported] = useState(isVibrationSupported());

  // Stop any ongoing vibration when component unmounts
  useEffect(() => {
    return () => {
      if (isSupported) {
        navigator.vibrate(0);
      }
    };
  }, [isSupported]);

  /**
   * Light tap feedback (10ms)
   */
  const tap = useCallback(() => {
    if (!isEnabled || !isSupported) return;
    vibrate(10);
  }, [isEnabled, isSupported]);

  /**
   * Success feedback (short-long pattern)
   */
  const success = useCallback(() => {
    if (!isEnabled || !isSupported) return;
    vibrate([10, 50, 20]);
  }, [isEnabled, isSupported]);

  /**
   * Warning feedback (double tap)
   */
  const warning = useCallback(() => {
    if (!isEnabled || !isSupported) return;
    vibrate([15, 30, 15]);
  }, [isEnabled, isSupported]);

  /**
   * Error feedback (triple tap)
   */
  const error = useCallback(() => {
    if (!isEnabled || !isSupported) return;
    vibrate([20, 30, 20, 30, 20]);
  }, [isEnabled, isSupported]);

  /**
   * Selection feedback (medium tap)
   */
  const select = useCallback(() => {
    if (!isEnabled || !isSupported) return;
    vibrate(20);
  }, [isEnabled, isSupported]);

  /**
   * Long press feedback (longer vibration)
   */
  const longPress = useCallback(() => {
    if (!isEnabled || !isSupported) return;
    vibrate(40);
  }, [isEnabled, isSupported]);

  /**
   * Impact feedback with customizable intensity
   */
  const impact = useCallback(
    (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
      if (!isEnabled || !isSupported) return;
      const duration = getIntensityDuration(intensity);
      vibrate(duration);
    },
    [isEnabled, isSupported]
  );

  return {
    tap,
    success,
    warning,
    error,
    select,
    longPress,
    impact,
    isSupported,
    isEnabled,
    setEnabled: setIsEnabled,
  };
}

/**
 * Haptic feedback patterns for common interactions
 */
export const HapticPatterns = {
  TAP: 10,
  SELECT: 20,
  LONG_PRESS: 40,
  SUCCESS: [10, 50, 20],
  WARNING: [15, 30, 15],
  ERROR: [20, 30, 20, 30, 20],
  DOUBLE_TAP: [10, 30, 10],
  DRAG_START: 15,
  DRAG_END: 20,
  ZOOM_START: 15,
  ZOOM_END: 15,
} as const;

/**
 * Play a custom haptic pattern
 */
export function playHapticPattern(pattern: number | number[]): void {
  vibrate(pattern);
}

/**
 * Stop any ongoing haptic feedback
 */
export function stopHapticFeedback(): void {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
}
