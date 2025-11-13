/**
 * DraggableLabelShape Component
 *
 * Enhanced label shape with:
 * - Draggable text and background box
 * - Visual feedback on hover and drag
 * - Grid snapping support
 * - Selection state visualization
 * - Move cursor on hover
 */

import { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { AnnotationData } from '../types/store';

/**
 * Props for DraggableLabelShape component
 */
export interface DraggableLabelShapeProps {
  /** Annotation data */
  annotation: AnnotationData;

  /** Canvas width in pixels */
  canvasWidth: number;

  /** Canvas height in pixels */
  canvasHeight: number;

  /** Whether the annotation is selected */
  selected?: boolean;

  /** Whether dragging is enabled */
  draggable?: boolean;

  /** Callback when annotation is clicked */
  onClick?: (id: string) => void;

  /** Callback when annotation is double-clicked */
  onDoubleClick?: (id: string) => void;

  /** Callback when drag starts */
  onDragStart?: (e: KonvaEventObject<DragEvent>) => void;

  /** Callback when dragging */
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;

  /** Callback when drag ends */
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;

  /** Base opacity (0-1) */
  opacity?: number;
}

/**
 * Denormalize coordinate from 0-1 range to pixels
 */
const denormalizeCoordinate = (normalized: number, dimension: number): number => {
  return normalized * dimension;
};

/**
 * DraggableLabelShape component
 *
 * Renders a label with text and background that can be dragged around the canvas.
 * Provides visual feedback for selection, hover, and drag states.
 */
export function DraggableLabelShape({
  annotation,
  canvasWidth,
  canvasHeight,
  selected = false,
  draggable = true,
  onClick,
  onDoubleClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  opacity = 1,
}: DraggableLabelShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Convert normalized coordinates to pixels
  const x = denormalizeCoordinate(annotation.x, canvasWidth);
  const y = denormalizeCoordinate(annotation.y, canvasHeight);

  const text = annotation.text || 'Label';
  const color = annotation.color || '#4ECDC4';
  const padding = 8;

  /**
   * Measure text dimensions when text changes
   */
  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.width());
      setTextHeight(textRef.current.height());
    }
  }, [text]);

  /**
   * Handle mouse enter
   */
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (groupRef.current && draggable) {
      const stage = groupRef.current.getStage();
      if (stage) {
        stage.container().style.cursor = 'move';
      }
    }
  };

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (groupRef.current) {
      const stage = groupRef.current.getStage();
      if (stage) {
        stage.container().style.cursor = 'default';
      }
    }
  };

  /**
   * Handle click
   */
  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onClick) {
      onClick(annotation.id);
    }
  };

  /**
   * Handle double click
   */
  const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onDoubleClick) {
      onDoubleClick(annotation.id);
    }
  };

  /**
   * Compute visual states
   */
  const finalOpacity = isHovering ? opacity * 0.85 : opacity;
  const strokeColor = selected ? '#00FF00' : isHovering ? '#FFFFFF' : '#000000';
  const strokeWidth = selected ? 3 : isHovering ? 2 : 1;
  const shadowBlur = selected ? 8 : isHovering ? 6 : 4;

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onTap={handleClick}
      onDblTap={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background rectangle */}
      <Rect
        x={-padding}
        y={-padding}
        width={textWidth + padding * 2}
        height={textHeight + padding * 2}
        fill={color}
        opacity={finalOpacity}
        cornerRadius={6}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        shadowColor="black"
        shadowBlur={shadowBlur}
        shadowOpacity={0.3}
        shadowOffsetX={2}
        shadowOffsetY={2}
      />

      {/* Text */}
      <Text
        ref={textRef}
        x={0}
        y={0}
        text={text}
        fontSize={14}
        fontFamily="Arial, sans-serif"
        fontStyle={selected ? 'bold' : 'normal'}
        fill="#FFFFFF"
        listening={false}
      />

      {/* Drag handle indicator (small grip icon when selected) */}
      {selected && (
        <Rect
          x={textWidth + padding * 2 - 8}
          y={-padding + 2}
          width={6}
          height={6}
          fill="#FFFFFF"
          opacity={0.7}
          cornerRadius={1}
          listening={false}
        />
      )}
    </Group>
  );
}
