import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Circle, Line, Text, Rect } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';

/**
 * Interface for annotation data
 * All coordinates are normalized (0-1 range) relative to PDF dimensions
 */
export interface AnnotationData {
  id: string;
  type: 'label' | 'marker' | 'line' | 'polygon';
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  width?: number;
  height?: number;
  points?: Array<{ x: number; y: number }>; // normalized coordinates for polygons/lines
  text?: string;
  color?: string;
  selected?: boolean;
}

/**
 * Props interface for AnnotationStage component
 */
export interface AnnotationStageProps {
  canvasWidth: number;
  canvasHeight: number;
  annotations?: AnnotationData[];
  onAnnotationChange?: (annotations: AnnotationData[]) => void;
  onSelectionChange?: (selectedId: string | null) => void;
}

/**
 * Helper function to normalize coordinates from pixels to 0-1 range
 */
const normalizeCoordinate = (pixel: number, dimension: number): number => {
  return pixel / dimension;
};

/**
 * Helper function to denormalize coordinates from 0-1 range to pixels
 */
const denormalizeCoordinate = (normalized: number, dimension: number): number => {
  return normalized * dimension;
};

/**
 * MarkerShape Component - Renders a draggable circle marker
 */
interface MarkerShapeProps {
  annotation: AnnotationData;
  canvasWidth: number;
  canvasHeight: number;
  onUpdate: (id: string, updates: Partial<AnnotationData>) => void;
  onSelect: (id: string) => void;
}

function MarkerShape({ annotation, canvasWidth, canvasHeight, onUpdate, onSelect }: MarkerShapeProps) {
  const x = denormalizeCoordinate(annotation.x, canvasWidth);
  const y = denormalizeCoordinate(annotation.y, canvasHeight);
  const color = annotation.color || '#FF6B6B';

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const newX = normalizeCoordinate(node.x(), canvasWidth);
    const newY = normalizeCoordinate(node.y(), canvasHeight);
    onUpdate(annotation.id, { x: newX, y: newY });
  };

  return (
    <>
      <Circle
        x={x}
        y={y}
        radius={8}
        fill={color}
        stroke={annotation.selected ? '#00FF00' : '#000000'}
        strokeWidth={annotation.selected ? 3 : 1}
        draggable
        onDragEnd={handleDragEnd}
        onClick={() => onSelect(annotation.id)}
        onTap={() => onSelect(annotation.id)}
        shadowBlur={4}
        shadowOpacity={0.3}
      />
    </>
  );
}

/**
 * LabelShape Component - Renders a draggable text label with background
 */
interface LabelShapeProps {
  annotation: AnnotationData;
  canvasWidth: number;
  canvasHeight: number;
  onUpdate: (id: string, updates: Partial<AnnotationData>) => void;
  onSelect: (id: string) => void;
}

function LabelShape({ annotation, canvasWidth, canvasHeight, onUpdate, onSelect }: LabelShapeProps) {
  const x = denormalizeCoordinate(annotation.x, canvasWidth);
  const y = denormalizeCoordinate(annotation.y, canvasHeight);
  const text = annotation.text || 'Label';
  const color = annotation.color || '#4ECDC4';

  const textRef = useRef<Konva.Text>(null);
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.width());
      setTextHeight(textRef.current.height());
    }
  }, [text]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const newX = normalizeCoordinate(node.x(), canvasWidth);
    const newY = normalizeCoordinate(node.y(), canvasHeight);
    onUpdate(annotation.id, { x: newX, y: newY });
  };

  const padding = 6;

  return (
    <>
      {/* Background rectangle */}
      <Rect
        x={x - padding}
        y={y - padding}
        width={textWidth + padding * 2}
        height={textHeight + padding * 2}
        fill={color}
        opacity={0.8}
        cornerRadius={4}
        stroke={annotation.selected ? '#00FF00' : '#000000'}
        strokeWidth={annotation.selected ? 2 : 1}
        draggable
        onDragEnd={handleDragEnd}
        onClick={() => onSelect(annotation.id)}
        onTap={() => onSelect(annotation.id)}
        shadowBlur={4}
        shadowOpacity={0.3}
      />
      {/* Text */}
      <Text
        ref={textRef}
        x={x}
        y={y}
        text={text}
        fontSize={14}
        fontFamily="Arial"
        fill="#FFFFFF"
        listening={false}
      />
    </>
  );
}

/**
 * LineShape Component - Renders a draggable line with endpoints
 */
interface LineShapeProps {
  annotation: AnnotationData;
  canvasWidth: number;
  canvasHeight: number;
  onUpdate: (id: string, updates: Partial<AnnotationData>) => void;
  onSelect: (id: string) => void;
}

function LineShape({ annotation, canvasWidth, canvasHeight, onUpdate, onSelect }: LineShapeProps) {
  const points = annotation.points || [
    { x: annotation.x, y: annotation.y },
    { x: annotation.x + 0.1, y: annotation.y + 0.1 },
  ];

  const color = annotation.color || '#FFD93D';

  // Convert normalized points to pixel coordinates
  const pixelPoints = points.flatMap((p) => [
    denormalizeCoordinate(p.x, canvasWidth),
    denormalizeCoordinate(p.y, canvasHeight),
  ]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const deltaX = normalizeCoordinate(node.x(), canvasWidth);
    const deltaY = normalizeCoordinate(node.y(), canvasHeight);

    const newPoints = points.map((p) => ({
      x: p.x + deltaX,
      y: p.y + deltaY,
    }));

    onUpdate(annotation.id, { points: newPoints });

    // Reset position after updating points
    node.position({ x: 0, y: 0 });
  };

  const handleEndpointDrag = (index: number, e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const newX = normalizeCoordinate(node.x(), canvasWidth);
    const newY = normalizeCoordinate(node.y(), canvasHeight);

    const newPoints = [...points];
    newPoints[index] = { x: newX, y: newY };

    onUpdate(annotation.id, { points: newPoints });
  };

  return (
    <>
      {/* Line */}
      <Line
        points={pixelPoints}
        stroke={color}
        strokeWidth={annotation.selected ? 4 : 2}
        lineCap="round"
        lineJoin="round"
        draggable
        onDragEnd={handleDragEnd}
        onClick={() => onSelect(annotation.id)}
        onTap={() => onSelect(annotation.id)}
      />

      {/* Endpoints (only visible when selected) */}
      {annotation.selected &&
        points.map((point, index) => (
          <Circle
            key={`endpoint-${index}`}
            x={denormalizeCoordinate(point.x, canvasWidth)}
            y={denormalizeCoordinate(point.y, canvasHeight)}
            radius={6}
            fill="#FFFFFF"
            stroke={color}
            strokeWidth={2}
            draggable
            onDragEnd={(e) => handleEndpointDrag(index, e)}
          />
        ))}
    </>
  );
}

/**
 * PolygonShape Component - Renders a draggable polygon with vertices
 */
interface PolygonShapeProps {
  annotation: AnnotationData;
  canvasWidth: number;
  canvasHeight: number;
  onUpdate: (id: string, updates: Partial<AnnotationData>) => void;
  onSelect: (id: string) => void;
}

function PolygonShape({ annotation, canvasWidth, canvasHeight, onUpdate, onSelect }: PolygonShapeProps) {
  const points = annotation.points || [
    { x: annotation.x, y: annotation.y },
    { x: annotation.x + 0.05, y: annotation.y + 0.05 },
    { x: annotation.x + 0.1, y: annotation.y },
  ];

  const color = annotation.color || '#A8E6CF';

  // Convert normalized points to pixel coordinates
  const pixelPoints = points.flatMap((p) => [
    denormalizeCoordinate(p.x, canvasWidth),
    denormalizeCoordinate(p.y, canvasHeight),
  ]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const deltaX = normalizeCoordinate(node.x(), canvasWidth);
    const deltaY = normalizeCoordinate(node.y(), canvasHeight);

    const newPoints = points.map((p) => ({
      x: p.x + deltaX,
      y: p.y + deltaY,
    }));

    onUpdate(annotation.id, { points: newPoints });

    // Reset position after updating points
    node.position({ x: 0, y: 0 });
  };

  const handleVertexDrag = (index: number, e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const newX = normalizeCoordinate(node.x(), canvasWidth);
    const newY = normalizeCoordinate(node.y(), canvasHeight);

    const newPoints = [...points];
    newPoints[index] = { x: newX, y: newY };

    onUpdate(annotation.id, { points: newPoints });
  };

  return (
    <>
      {/* Polygon */}
      <Line
        points={pixelPoints}
        stroke={color}
        strokeWidth={annotation.selected ? 3 : 2}
        fill={color}
        opacity={0.3}
        closed
        lineCap="round"
        lineJoin="round"
        draggable
        onDragEnd={handleDragEnd}
        onClick={() => onSelect(annotation.id)}
        onTap={() => onSelect(annotation.id)}
      />

      {/* Vertices (only visible when selected) */}
      {annotation.selected &&
        points.map((point, index) => (
          <Circle
            key={`vertex-${index}`}
            x={denormalizeCoordinate(point.x, canvasWidth)}
            y={denormalizeCoordinate(point.y, canvasHeight)}
            radius={6}
            fill="#FFFFFF"
            stroke={color}
            strokeWidth={2}
            draggable
            onDragEnd={(e) => handleVertexDrag(index, e)}
          />
        ))}
    </>
  );
}

/**
 * AnnotationStage Component
 *
 * Konva overlay component that synchronizes with PDF canvas for annotations.
 * Positioned absolutely over the PDFViewer component to allow drawing, measuring, and labeling.
 *
 * Features:
 * - Synchronized coordinate space with PDF rendering
 * - Support for multiple annotation types (labels, markers, lines, polygons)
 * - Selectable, draggable, and deletable shapes
 * - Normalized coordinate system (0-1 range) for resolution independence
 * - Touch and mouse event handling
 * - Keyboard support (Delete key to remove selected shape)
 */
export function AnnotationStage({
  canvasWidth,
  canvasHeight,
  annotations = [],
  onAnnotationChange,
  onSelectionChange,
}: AnnotationStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /**
   * Handle shape selection
   */
  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onSelectionChange) {
      onSelectionChange(id);
    }

    // Update annotations to reflect selection
    if (onAnnotationChange) {
      const updatedAnnotations = annotations.map((ann) => ({
        ...ann,
        selected: ann.id === id,
      }));
      onAnnotationChange(updatedAnnotations);
    }
  };

  /**
   * Handle deselection (click on stage background)
   */
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Check if clicked on stage (not on a shape)
    if (e.target === stageRef.current) {
      setSelectedId(null);
      if (onSelectionChange) {
        onSelectionChange(null);
      }

      // Deselect all annotations
      if (onAnnotationChange) {
        const updatedAnnotations = annotations.map((ann) => ({
          ...ann,
          selected: false,
        }));
        onAnnotationChange(updatedAnnotations);
      }
    }
  };

  /**
   * Handle annotation updates (drag, etc.)
   */
  const handleUpdate = (id: string, updates: Partial<AnnotationData>) => {
    if (!onAnnotationChange) return;

    const updatedAnnotations = annotations.map((ann) =>
      ann.id === id ? { ...ann, ...updates } : ann
    );
    onAnnotationChange(updatedAnnotations);
  };

  /**
   * Handle keyboard events (Delete key to remove selected shape)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        if (onAnnotationChange) {
          const updatedAnnotations = annotations.filter((ann) => ann.id !== selectedId);
          onAnnotationChange(updatedAnnotations);
        }
        setSelectedId(null);
        if (onSelectionChange) {
          onSelectionChange(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, annotations, onAnnotationChange, onSelectionChange]);

  /**
   * Handle right-click context menu for deletion
   */
  const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();

    if (selectedId) {
      const confirmed = window.confirm('Delete selected annotation?');
      if (confirmed && onAnnotationChange) {
        const updatedAnnotations = annotations.filter((ann) => ann.id !== selectedId);
        onAnnotationChange(updatedAnnotations);
        setSelectedId(null);
        if (onSelectionChange) {
          onSelectionChange(null);
        }
      }
    }
  };

  /**
   * Prevent page scroll when interacting with stage
   */
  useEffect(() => {
    const stageContainer = stageRef.current?.container();
    if (!stageContainer) return;

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    stageContainer.addEventListener('wheel', preventScroll, { passive: false });
    stageContainer.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      stageContainer.removeEventListener('wheel', preventScroll);
      stageContainer.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div
      className="absolute top-0 left-0 pointer-events-auto"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        zIndex: 10,
      }}
    >
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onContextMenu={handleContextMenu}
        style={{ cursor: selectedId ? 'move' : 'default' }}
      >
        <Layer>
          {annotations.map((annotation) => {
            switch (annotation.type) {
              case 'marker':
                return (
                  <MarkerShape
                    key={annotation.id}
                    annotation={annotation}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onUpdate={handleUpdate}
                    onSelect={handleSelect}
                  />
                );
              case 'label':
                return (
                  <LabelShape
                    key={annotation.id}
                    annotation={annotation}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onUpdate={handleUpdate}
                    onSelect={handleSelect}
                  />
                );
              case 'line':
                return (
                  <LineShape
                    key={annotation.id}
                    annotation={annotation}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onUpdate={handleUpdate}
                    onSelect={handleSelect}
                  />
                );
              case 'polygon':
                return (
                  <PolygonShape
                    key={annotation.id}
                    annotation={annotation}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    onUpdate={handleUpdate}
                    onSelect={handleSelect}
                  />
                );
              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
}
