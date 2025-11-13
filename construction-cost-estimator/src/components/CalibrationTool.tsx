import { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import Konva from 'konva';
import { CalibrationDialog } from './CalibrationDialog';
import { useAppStore } from '../store/useAppStore';

/**
 * Point interface for calibration line
 */
interface Point {
  x: number;
  y: number;
}

export interface CalibrationData {
  referenceLength: number;
  pixelDistance: number;
  metersPerPixel: number;
  isCalibrated: boolean;
}

export interface CalibrationToolProps {
  /** Width of the canvas in pixels */
  canvasWidth: number;
  /** Height of the canvas in pixels */
  canvasHeight: number;
  /** Callback when calibration is complete */
  onCalibrationComplete?: (data: CalibrationData) => void;
  /** Whether the tool is currently active */
  isActive: boolean;
  /** Callback to deactivate the tool */
  onDeactivate?: () => void;
}

/**
 * Calculate Euclidean distance between two points
 */
const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * CalibrationTool Component
 *
 * Interactive tool for drawing a calibration line on the PDF and setting the scale.
 *
 * Features:
 * - Click-to-draw calibration line (start point → end point)
 * - Visual feedback with preview line
 * - Display pixel distance in real-time
 * - Opens dialog for real-world measurement input
 * - Stores calibration in Zustand store
 * - Supports clear and redraw
 *
 * Workflow:
 * 1. User activates calibration tool
 * 2. User clicks to set start point
 * 3. User moves mouse to preview line
 * 4. User clicks to set end point
 * 5. Dialog opens for real-world length input
 * 6. User confirms → calibration stored
 */
export function CalibrationTool({
  canvasWidth,
  canvasHeight,
  onCalibrationComplete,
  isActive,
  onDeactivate,
}: CalibrationToolProps) {
  // Drawing state
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pixelDistance, setPixelDistance] = useState<number>(0);

  // Zustand store
  const computeCalibration = useAppStore((state) => state.computeCalibration);

  /**
   * Reset drawing state
   */
  const resetDrawing = useCallback(() => {
    setStartPoint(null);
    setEndPoint(null);
    setCurrentPoint(null);
    setIsDrawing(false);
    setPixelDistance(0);
  }, []);

  /**
   * Handle stage click
   */
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isActive) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      if (!isDrawing) {
        // First click: set start point
        setStartPoint(pos);
        setIsDrawing(true);
      } else {
        // Second click: set end point and calculate distance
        setEndPoint(pos);
        setCurrentPoint(null);

        const distance = calculateDistance(startPoint!, pos);
        setPixelDistance(distance);

        // Show dialog if distance is valid
        if (distance >= 1) {
          setShowDialog(true);
        }
      }
    },
    [isActive, isDrawing, startPoint]
  );

  /**
   * Handle mouse move for preview
   */
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isActive || !isDrawing || endPoint) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (pos) {
        setCurrentPoint(pos);
      }
    },
    [isActive, isDrawing, endPoint]
  );

  /**
   * Handle calibration confirmation
   */
  const handleConfirm = useCallback(
    (lengthInMeters: number) => {
      if (pixelDistance === 0) return;

      // Compute and store calibration
      computeCalibration(lengthInMeters, pixelDistance);

      // Callback with data
      if (onCalibrationComplete) {
        const metersPerPixel = lengthInMeters / pixelDistance;
        onCalibrationComplete({
          referenceLength: lengthInMeters,
          pixelDistance,
          metersPerPixel,
          isCalibrated: true,
        });
      }

      // Reset and deactivate
      resetDrawing();
      if (onDeactivate) {
        onDeactivate();
      }
    },
    [pixelDistance, computeCalibration, onCalibrationComplete, resetDrawing, onDeactivate]
  );

  /**
   * Handle calibration cancellation
   */
  const handleCancel = useCallback(() => {
    resetDrawing();
  }, [resetDrawing]);

  /**
   * Handle Escape key to cancel
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        if (showDialog) {
          setShowDialog(false);
        }
        resetDrawing();
        if (onDeactivate) {
          onDeactivate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, showDialog, resetDrawing, onDeactivate]);

  /**
   * Reset when tool becomes inactive
   */
  useEffect(() => {
    if (!isActive) {
      resetDrawing();
      setShowDialog(false);
    }
  }, [isActive, resetDrawing]);

  /**
   * Get line points for rendering
   */
  const getLinePoints = (): number[] | null => {
    if (!startPoint) return null;

    const end = endPoint || currentPoint;
    if (!end) return null;

    return [startPoint.x, startPoint.y, end.x, end.y];
  };

  /**
   * Calculate current distance for display
   */
  const getCurrentDistance = (): number | null => {
    if (!startPoint) return null;

    const end = endPoint || currentPoint;
    if (!end) return null;

    return calculateDistance(startPoint, end);
  };

  const linePoints = getLinePoints();
  const currentDistance = getCurrentDistance();

  if (!isActive) return null;

  return (
    <>
      {/* Calibration Stage Overlay */}
      <div
        className="absolute top-0 left-0 pointer-events-auto"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          zIndex: 20,
          cursor: isDrawing && !endPoint ? 'crosshair' : 'default',
        }}
      >
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleStageClick}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            {/* Calibration Line */}
            {linePoints && (
              <>
                <Line
                  points={linePoints}
                  stroke={endPoint ? '#22c55e' : '#ef4444'}
                  strokeWidth={3}
                  lineCap="round"
                  dash={endPoint ? [] : [10, 5]}
                  shadowBlur={4}
                  shadowColor="rgba(0, 0, 0, 0.3)"
                />

                {/* Start Point */}
                <Circle
                  x={startPoint!.x}
                  y={startPoint!.y}
                  radius={6}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth={2}
                  shadowBlur={4}
                  shadowColor="rgba(0, 0, 0, 0.3)"
                />

                {/* End Point */}
                {endPoint && (
                  <Circle
                    x={endPoint.x}
                    y={endPoint.y}
                    radius={6}
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth={2}
                    shadowBlur={4}
                    shadowColor="rgba(0, 0, 0, 0.3)"
                  />
                )}
              </>
            )}
          </Layer>
        </Stage>

        {/* Instruction Overlay */}
        {isActive && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-black/80 text-white px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm">
              <div className="text-sm font-medium text-center">
                {!isDrawing && 'Click to set start point'}
                {isDrawing && !endPoint && 'Click to set end point'}
                {endPoint && 'Confirm the calibration'}
              </div>
              {currentDistance && (
                <div className="text-xs text-gray-300 text-center mt-1">
                  Distance: {Math.round(currentDistance)} pixels
                </div>
              )}
              <div className="text-xs text-gray-400 text-center mt-2">
                Press ESC to cancel
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calibration Dialog */}
      <CalibrationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        pixelDistance={pixelDistance}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
