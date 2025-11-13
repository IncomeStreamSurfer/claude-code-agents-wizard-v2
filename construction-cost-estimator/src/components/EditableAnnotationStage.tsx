/**
 * EditableAnnotationStage Component
 *
 * Enhanced annotation layer with editing capabilities:
 * - Makes annotations editable and draggable
 * - Click to select
 * - Double-click or edit icon to open edit dialog
 * - Selection box around selected annotation
 * - Edit/delete buttons on selected annotation
 * - Keyboard support (Delete, Arrow keys, E, D, etc.)
 * - Prevents edits during other tool modes
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Group } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { DraggableLabelShape } from './DraggableLabelShape';
import { LabelEditDialog } from './LabelEditDialog';
import { ContextMenu, useContextMenu } from './ContextMenu';
import type { ContextMenuAction } from './ContextMenu';
import { useDragHandling } from '../hooks/useDragHandling';
import type { AnnotationData } from '../types/store';
import { useAppStore } from '../store/useAppStore';

/**
 * Props for EditableAnnotationStage component
 */
export interface EditableAnnotationStageProps {
  /** Canvas width in pixels */
  canvasWidth: number;

  /** Canvas height in pixels */
  canvasHeight: number;

  /** Annotations to display */
  annotations?: AnnotationData[];

  /** Callback when annotation changes */
  onAnnotationChange?: (annotation: AnnotationData) => void;

  /** Grid size for snapping (0 = no snapping, 0.05 = 5% snaps) */
  dragGridSize?: number;

  /** Pixel distance before registering drag */
  dragSensitivity?: number;

  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;

  /** Enable context menu */
  enableContextMenu?: boolean;

  /** Read-only mode (prevent edits) */
  readOnly?: boolean;
}

/**
 * Denormalize coordinate from 0-1 range to pixels
 */
const denormalizeCoordinate = (normalized: number, dimension: number): number => {
  return normalized * dimension;
};

/**
 * EditableAnnotationStage component
 *
 * Wraps annotation rendering with editing capabilities including drag-and-drop,
 * selection, keyboard shortcuts, and inline editing dialog.
 */
export function EditableAnnotationStage({
  canvasWidth,
  canvasHeight,
  annotations = [],
  onAnnotationChange,
  dragGridSize = 0,
  dragSensitivity = 3,
  enableKeyboardShortcuts = true,
  enableContextMenu = true,
  readOnly = false,
}: EditableAnnotationStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<AnnotationData | null>(null);

  const { menuState, showMenu, hideMenu } = useContextMenu();

  // Zustand store actions
  const updateAnnotation = useAppStore((state) => state.updateAnnotation);
  const deleteAnnotation = useAppStore((state) => state.deleteAnnotation);
  const addAnnotation = useAppStore((state) => state.addAnnotation);
  const selectAnnotation = useAppStore((state) => state.selectAnnotation);
  const selectedAnnotationId = useAppStore((state) => state.selectedAnnotationId);
  const activeTool = useAppStore((state) => state.activeTool);
  const labels = useAppStore((state) => state.labels);

  // Drag handling hook
  const dragHandling = useDragHandling({
    canvasWidth,
    canvasHeight,
    gridSize: dragGridSize,
    dragSensitivity,
    onUpdate: (id, updates) => {
      if (onAnnotationChange) {
        const annotation = annotations.find((a) => a.id === id);
        if (annotation) {
          onAnnotationChange({ ...annotation, ...updates });
        }
      } else {
        updateAnnotation(id, updates);
      }
    },
  });

  /**
   * Sync with store's selected annotation
   */
  useEffect(() => {
    setSelectedId(selectedAnnotationId);
  }, [selectedAnnotationId]);

  /**
   * Handle annotation selection
   */
  const handleSelect = useCallback(
    (id: string) => {
      if (readOnly) return;
      setSelectedId(id);
      selectAnnotation(id);
    },
    [readOnly, selectAnnotation]
  );

  /**
   * Handle double-click to edit
   */
  const handleDoubleClick = useCallback(
    (id: string) => {
      if (readOnly) return;
      const annotation = annotations.find((a) => a.id === id);
      if (annotation) {
        setEditingAnnotation(annotation);
        setEditDialogOpen(true);
      }
    },
    [readOnly, annotations]
  );

  /**
   * Handle stage click (deselect)
   */
  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.target === stageRef.current) {
        setSelectedId(null);
        selectAnnotation(null);
      }
    },
    [selectAnnotation]
  );

  /**
   * Handle context menu
   */
  const handleContextMenu = useCallback(
    (e: KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault();

      if (!enableContextMenu || readOnly) return;

      const annotation = annotations.find((a) => a.id === selectedId);
      if (!annotation) return;

      const stage = stageRef.current;
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      showMenu(pos.x, pos.y, annotation);
    },
    [enableContextMenu, readOnly, annotations, selectedId, showMenu]
  );

  /**
   * Get context menu actions
   */
  const getContextMenuActions = useCallback(
    (annotation: AnnotationData): ContextMenuAction[] => {
      return [
        {
          label: 'Edit Label',
          icon: '✏️',
          onClick: () => {
            setEditingAnnotation(annotation);
            setEditDialogOpen(true);
          },
        },
        {
          label: 'Change Color',
          icon: '🎨',
          onClick: () => {
            // Could open color picker dialog
            const colors = ['#4ECDC4', '#FF6B6B', '#FFD93D', '#A8E6CF', '#6BCF7F'];
            const currentIndex = colors.indexOf(annotation.color || '#4ECDC4');
            const nextColor = colors[(currentIndex + 1) % colors.length];
            updateAnnotation(annotation.id, { color: nextColor });
          },
        },
        {
          label: 'Duplicate',
          icon: '📋',
          onClick: () => {
            const duplicate: AnnotationData = {
              ...annotation,
              id: `annotation-${Date.now()}`,
              x: annotation.x + 0.05,
              y: annotation.y + 0.05,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            addAnnotation(duplicate);
          },
        },
        { separator: true, label: '', onClick: () => {} },
        {
          label: 'Delete',
          icon: '🗑️',
          danger: true,
          onClick: () => {
            const confirmed = window.confirm('Delete this annotation?');
            if (confirmed) {
              deleteAnnotation(annotation.id);
            }
          },
        },
      ];
    },
    [updateAnnotation, addAnnotation, deleteAnnotation]
  );

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!enableKeyboardShortcuts || readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const annotation = annotations.find((a) => a.id === selectedId);
      if (!annotation) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteAnnotation(annotation.id);
          setSelectedId(null);
          selectAnnotation(null);
          break;

        case 'e':
        case 'E':
          e.preventDefault();
          setEditingAnnotation(annotation);
          setEditDialogOpen(true);
          break;

        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const duplicate: AnnotationData = {
              ...annotation,
              id: `annotation-${Date.now()}`,
              x: annotation.x + 0.05,
              y: annotation.y + 0.05,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            addAnnotation(duplicate);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          updateAnnotation(annotation.id, {
            y: Math.max(0, annotation.y - (e.shiftKey ? 0.02 : 0.005)),
          });
          break;

        case 'ArrowDown':
          e.preventDefault();
          updateAnnotation(annotation.id, {
            y: Math.min(1, annotation.y + (e.shiftKey ? 0.02 : 0.005)),
          });
          break;

        case 'ArrowLeft':
          e.preventDefault();
          updateAnnotation(annotation.id, {
            x: Math.max(0, annotation.x - (e.shiftKey ? 0.02 : 0.005)),
          });
          break;

        case 'ArrowRight':
          e.preventDefault();
          updateAnnotation(annotation.id, {
            x: Math.min(1, annotation.x + (e.shiftKey ? 0.02 : 0.005)),
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enableKeyboardShortcuts,
    readOnly,
    selectedId,
    annotations,
    updateAnnotation,
    deleteAnnotation,
    addAnnotation,
    selectAnnotation,
  ]);

  /**
   * Get selected annotation
   */
  const selectedAnnotation = annotations.find((a) => a.id === selectedId);

  return (
    <>
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
        >
          <Layer>
            {annotations
              .filter((a) => a.type === 'label')
              .map((annotation) => (
                <DraggableLabelShape
                  key={annotation.id}
                  annotation={annotation}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  selected={annotation.id === selectedId}
                  draggable={!readOnly && activeTool === null}
                  onClick={handleSelect}
                  onDoubleClick={handleDoubleClick}
                  onDragStart={(e) => dragHandling.handleDragStart(annotation, e)}
                  onDragMove={(e) => dragHandling.handleDragMove(annotation, e)}
                  onDragEnd={(e) => dragHandling.handleDragEnd(annotation, e)}
                />
              ))}

            {/* Selection indicator */}
            {selectedAnnotation && !readOnly && (
              <SelectionIndicator
                annotation={selectedAnnotation}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Edit Dialog */}
      <LabelEditDialog
        open={editDialogOpen}
        annotation={editingAnnotation}
        labels={labels}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingAnnotation(null);
        }}
        onDuplicate={(duplicate) => {
          addAnnotation(duplicate);
        }}
      />

      {/* Context Menu */}
      {menuState.annotation && (
        <ContextMenu
          visible={menuState.visible}
          x={menuState.x}
          y={menuState.y}
          actions={getContextMenuActions(menuState.annotation)}
          onClose={hideMenu}
        />
      )}
    </>
  );
}

/**
 * SelectionIndicator component
 *
 * Shows a selection box with edit/delete buttons around selected annotation.
 */
interface SelectionIndicatorProps {
  annotation: AnnotationData;
  canvasWidth: number;
  canvasHeight: number;
}

function SelectionIndicator({ annotation, canvasWidth, canvasHeight }: SelectionIndicatorProps) {
  const x = denormalizeCoordinate(annotation.x, canvasWidth);
  const y = denormalizeCoordinate(annotation.y, canvasHeight);

  // Approximate text width/height
  const textWidth = (annotation.text || 'Label').length * 8 + 16;
  const textHeight = 28;

  return (
    <Group x={x - 4} y={y - 4}>
      {/* Selection box */}
      <Rect
        x={-4}
        y={-4}
        width={textWidth + 16}
        height={textHeight + 16}
        stroke="#00FF00"
        strokeWidth={2}
        dash={[4, 4]}
        listening={false}
      />

      {/* Corner indicators */}
      <Circle x={-4} y={-4} radius={3} fill="#00FF00" listening={false} />
      <Circle x={textWidth + 12} y={-4} radius={3} fill="#00FF00" listening={false} />
      <Circle x={-4} y={textHeight + 12} radius={3} fill="#00FF00" listening={false} />
      <Circle
        x={textWidth + 12}
        y={textHeight + 12}
        radius={3}
        fill="#00FF00"
        listening={false}
      />
    </Group>
  );
}
