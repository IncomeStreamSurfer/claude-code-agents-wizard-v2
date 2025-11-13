import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { AnnotationData } from '../../types/store';

/**
 * Shared hook for tool components
 * Provides common utilities for working with annotations and calibration
 */
export function useToolContext() {
  const calibrationData = useAppStore((state) => state.calibrationData);
  const activeTool = useAppStore((state) => state.activeTool);
  const currentPageNumber = useAppStore((state) => state.currentPageNumber);
  const addAnnotation = useAppStore((state) => state.addAnnotation);
  const setActiveTool = useAppStore((state) => state.setActiveTool);
  const selectedAnnotationId = useAppStore((state) => state.selectedAnnotationId);

  /**
   * Generate unique ID for annotations
   */
  const generateId = useCallback((type: string) => {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Normalize coordinates from pixels to 0-1 range
   */
  const normalizeCoordinate = useCallback(
    (pixel: number, dimension: number): number => {
      return pixel / dimension;
    },
    []
  );

  /**
   * Denormalize coordinates from 0-1 range to pixels
   */
  const denormalizeCoordinate = useCallback(
    (normalized: number, dimension: number): number => {
      return normalized * dimension;
    },
    []
  );

  /**
   * Calculate pixel distance between two normalized points
   */
  const calculatePixelDistance = useCallback(
    (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      canvasWidth: number,
      canvasHeight: number
    ): number => {
      const x1 = denormalizeCoordinate(p1.x, canvasWidth);
      const y1 = denormalizeCoordinate(p1.y, canvasHeight);
      const x2 = denormalizeCoordinate(p2.x, canvasWidth);
      const y2 = denormalizeCoordinate(p2.y, canvasHeight);

      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    [denormalizeCoordinate]
  );

  /**
   * Calculate polygon area using Shoelace formula
   * Points should be in normalized coordinates
   */
  const calculatePolygonArea = useCallback(
    (points: { x: number; y: number }[], canvasWidth: number, canvasHeight: number): number => {
      if (points.length < 3) return 0;

      // Convert to pixel coordinates first
      const pixelPoints = points.map((p) => ({
        x: denormalizeCoordinate(p.x, canvasWidth),
        y: denormalizeCoordinate(p.y, canvasHeight),
      }));

      let area = 0;
      for (let i = 0; i < pixelPoints.length; i++) {
        const j = (i + 1) % pixelPoints.length;
        area += pixelPoints[i].x * pixelPoints[j].y;
        area -= pixelPoints[j].x * pixelPoints[i].y;
      }

      return Math.abs(area / 2);
    },
    [denormalizeCoordinate]
  );

  /**
   * Convert pixel measurements to real-world meters
   */
  const pixelsToMeters = useCallback(
    (pixels: number): number => {
      if (!calibrationData.isCalibrated) return pixels;
      return pixels * calibrationData.metersPerPixel;
    },
    [calibrationData]
  );

  /**
   * Convert pixel area to square meters
   */
  const pixelsToSquareMeters = useCallback(
    (pixelArea: number): number => {
      if (!calibrationData.isCalibrated) return pixelArea;
      return pixelArea * Math.pow(calibrationData.metersPerPixel, 2);
    },
    [calibrationData]
  );

  /**
   * Format distance for display
   */
  const formatDistance = useCallback(
    (pixels: number): string => {
      if (!calibrationData.isCalibrated) {
        return `${pixels.toFixed(0)} px`;
      }
      const meters = pixelsToMeters(pixels);
      return `${meters.toFixed(2)} m`;
    },
    [calibrationData.isCalibrated, pixelsToMeters]
  );

  /**
   * Format area for display
   */
  const formatArea = useCallback(
    (pixelArea: number): string => {
      if (!calibrationData.isCalibrated) {
        return `${pixelArea.toFixed(0)} px²`;
      }
      const sqMeters = pixelsToSquareMeters(pixelArea);
      return `${sqMeters.toFixed(2)} m²`;
    },
    [calibrationData.isCalibrated, pixelsToSquareMeters]
  );

  /**
   * Check if measurements are allowed (calibration complete)
   */
  const canMeasure = useCallback((): boolean => {
    return calibrationData.isCalibrated;
  }, [calibrationData.isCalibrated]);

  /**
   * Add annotation with current page number
   */
  const createAnnotation = useCallback(
    (annotation: Omit<AnnotationData, 'pageNumber' | 'createdAt' | 'updatedAt'>) => {
      const fullAnnotation: AnnotationData = {
        ...annotation,
        pageNumber: currentPageNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as AnnotationData;

      addAnnotation(fullAnnotation);
      return fullAnnotation;
    },
    [currentPageNumber, addAnnotation]
  );

  return {
    // State
    calibrationData,
    activeTool,
    currentPageNumber,
    selectedAnnotationId,

    // Actions
    setActiveTool,
    createAnnotation,

    // Utilities
    generateId,
    normalizeCoordinate,
    denormalizeCoordinate,
    calculatePixelDistance,
    calculatePolygonArea,
    pixelsToMeters,
    pixelsToSquareMeters,
    formatDistance,
    formatArea,
    canMeasure,
  };
}
