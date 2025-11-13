import { useRef, useEffect, useState } from 'react';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import type { Point } from '../utils/touchHelpers';

interface TouchAnnotationCanvasProps {
  children: React.ReactNode;
  width: number;
  height: number;
  enablePinchZoom?: boolean;
  enableTwoFingerPan?: boolean;
  enableHapticFeedback?: boolean;
  touchDelay?: number;
  tapThreshold?: number;
  currentZoom?: number;
  currentPan?: { x: number; y: number };
  activeTool?: 'select' | 'marker' | 'label' | 'line' | 'polygon' | 'calibrate' | null;
  onZoomChange?: (zoom: number, center: Point) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
  onTap?: (position: Point) => void;
  onLongPress?: (position: Point) => void;
  onAnnotationPlace?: (position: Point) => void;
  onAnnotationDrag?: (position: Point, delta: Point) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  className?: string;
}

/**
 * TouchAnnotationCanvas Component
 *
 * Wraps annotation canvas with comprehensive touch gesture support
 * Handles tap, drag, pinch-zoom, pan, and long-press gestures
 */
export function TouchAnnotationCanvas({
  children,
  width,
  height,
  enablePinchZoom = true,
  enableTwoFingerPan = true,
  enableHapticFeedback: enableHaptic = true,
  touchDelay = 500,
  tapThreshold = 10,
  currentZoom = 1,
  currentPan = { x: 0, y: 0 },
  activeTool = 'select',
  onZoomChange,
  onPanChange,
  onTap,
  onLongPress,
  onAnnotationPlace,
  onAnnotationDrag,
  onSwipe,
  className = '',
}: TouchAnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [localZoom, setLocalZoom] = useState(currentZoom);
  const [localPan, setLocalPan] = useState(currentPan);
  const haptic = useHapticFeedback({ enabled: enableHaptic });

  // Update local state when props change
  useEffect(() => {
    setLocalZoom(currentZoom);
  }, [currentZoom]);

  useEffect(() => {
    setLocalPan(currentPan);
  }, [currentPan]);

  // Handle tap gesture
  const handleTap = (position: Point) => {
    haptic.tap();

    if (activeTool === 'select') {
      onTap?.(position);
    } else if (activeTool === 'marker' || activeTool === 'label') {
      haptic.success();
      onAnnotationPlace?.(position);
    }
  };

  // Handle double tap - toggle zoom
  const handleDoubleTap = (position: Point) => {
    haptic.impact('medium');

    const newZoom = localZoom > 1 ? 1 : 2;
    setLocalZoom(newZoom);
    onZoomChange?.(newZoom, position);
  };

  // Handle long press - context menu
  const handleLongPress = (position: Point) => {
    haptic.longPress();
    onLongPress?.(position);
  };

  // Handle drag start
  const handleDragStart = (_position: Point) => {
    if (activeTool === 'select' || activeTool === null) {
      haptic.impact('light');
    }
  };

  // Handle drag
  const handleDrag = (position: Point, delta: Point) => {
    if (activeTool === 'select' || activeTool === null) {
      onAnnotationDrag?.(position, delta);
    } else if (activeTool === 'line' || activeTool === 'polygon') {
      // Drawing gesture - handled by the tool
      onAnnotationDrag?.(position, delta);
    }
  };

  // Handle drag end
  const handleDragEnd = (_position: Point) => {
    if (activeTool !== 'select' && activeTool !== null) {
      haptic.success();
    }
  };

  // Handle pinch start
  const handlePinchStart = (_scale: number, _center: Point) => {
    if (!enablePinchZoom) return;
    haptic.impact('light');
  };

  // Handle pinch gesture - zoom
  const handlePinch = (scale: number, center: Point) => {
    if (!enablePinchZoom) return;

    const newZoom = Math.max(0.5, Math.min(5, currentZoom * scale));
    setLocalZoom(newZoom);
    onZoomChange?.(newZoom, center);
  };

  // Handle pinch end
  const handlePinchEnd = (_scale: number, _center: Point) => {
    if (!enablePinchZoom) return;
    haptic.impact('light');
  };

  // Handle pan start
  const handlePanStart = (_position: Point) => {
    if (!enableTwoFingerPan) return;
    haptic.impact('light');
  };

  // Handle pan gesture - move viewport
  const handlePan = (delta: Point, _center: Point) => {
    if (!enableTwoFingerPan) return;

    const newPan = {
      x: localPan.x + delta.x,
      y: localPan.y + delta.y,
    };

    setLocalPan(newPan);
    onPanChange?.(newPan);
  };

  // Handle pan end
  const handlePanEnd = (_position: Point) => {
    if (!enableTwoFingerPan) return;
    haptic.impact('light');
  };

  // Handle swipe gesture
  const handleSwipe = (
    direction: 'up' | 'down' | 'left' | 'right',
    _startPos: Point,
    _endPos: Point
  ) => {
    haptic.impact('medium');
    onSwipe?.(direction);
  };

  // Initialize touch gestures
  const { state, isLongPress, isDrag, isPinch, isPan } = useTouchGestures(
    containerRef,
    {
      onTap: handleTap,
      onDoubleTap: handleDoubleTap,
      onLongPress: handleLongPress,
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      onPinchStart: handlePinchStart,
      onPinch: handlePinch,
      onPinchEnd: handlePinchEnd,
      onPanStart: handlePanStart,
      onPan: handlePan,
      onPanEnd: handlePanEnd,
      onSwipe: handleSwipe,
    },
    {
      longPressDelay: touchDelay,
      tapThreshold,
      enablePinch: enablePinchZoom,
      enablePan: enableTwoFingerPan,
      preventDefaultOnTouch: true,
    }
  );

  // Add visual feedback for touch state
  const getTouchStateClass = () => {
    if (isPinch) return 'cursor-zoom-in';
    if (isPan) return 'cursor-move';
    if (isDrag) return 'cursor-grabbing';
    if (state.isTouching) return 'cursor-grab';
    return 'cursor-default';
  };

  return (
    <div
      ref={containerRef}
      className={`touch-annotation-canvas relative ${getTouchStateClass()} ${className}`}
      style={{
        width,
        height,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Touch indicator overlay (optional visual feedback) */}
      {state.isTouching && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: state.currentPosition.x - 20,
            top: state.currentPosition.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            transition: 'all 0.1s ease-out',
          }}
        />
      )}

      {/* Long press indicator */}
      {isLongPress && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: state.startPosition.x - 30,
            top: state.startPosition.y - 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '3px solid rgba(239, 68, 68, 0.7)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            animation: 'pulse 1s infinite',
          }}
        />
      )}

      {/* Pinch zoom indicator */}
      {isPinch && (
        <div
          className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 pointer-events-none"
          style={{ fontSize: '14px', fontWeight: 'bold' }}
        >
          Zoom: {Math.round(localZoom * 100)}%
        </div>
      )}

      {/* Pan indicator */}
      {isPan && !isPinch && (
        <div
          className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 pointer-events-none"
          style={{ fontSize: '14px', fontWeight: 'bold' }}
        >
          Pan Mode
        </div>
      )}

      {/* Main canvas content */}
      <div
        style={{
          transform: `translate(${localPan.x}px, ${localPan.y}px) scale(${localZoom})`,
          transformOrigin: '0 0',
          transition: state.isTouching ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for managing touch annotation state
 */
export function useTouchAnnotationState() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(5, prev * 1.2));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev / 1.2));
  };

  const fitToScreen = (canvasWidth: number, canvasHeight: number, containerWidth: number, containerHeight: number) => {
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    setZoom(scale);
    setPan({ x: 0, y: 0 });
  };

  return {
    zoom,
    pan,
    selectedAnnotationId,
    setZoom,
    setPan,
    setSelectedAnnotationId,
    resetView,
    zoomIn,
    zoomOut,
    fitToScreen,
  };
}
