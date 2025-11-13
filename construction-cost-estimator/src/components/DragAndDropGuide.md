# Drag-and-Drop & Inline Editing Guide

Complete documentation for the drag-and-drop and inline editing functionality in the Construction Cost Estimator.

## Overview

The drag-and-drop system allows users to:
- Move labels around the PDF canvas
- Edit label properties inline
- Use keyboard shortcuts for quick actions
- Access context menus for additional options
- Snap to grid for precise positioning

## Architecture

### Components

```
EditableAnnotationStage (Main wrapper)
├── DraggableLabelShape (Individual draggable labels)
├── LabelEditDialog (Edit properties dialog)
├── ContextMenu (Right-click menu)
└── SelectionIndicator (Visual selection box)
```

### Hooks

- **useDragHandling**: Manages drag events, grid snapping, and store updates
- **useContextMenu**: Manages context menu state and positioning

## Components

### 1. EditableAnnotationStage

**Path**: `/src/components/EditableAnnotationStage.tsx`

Main wrapper component that makes annotations editable and draggable.

#### Props

```typescript
interface EditableAnnotationStageProps {
  canvasWidth: number;          // Canvas width in pixels
  canvasHeight: number;         // Canvas height in pixels
  annotations?: AnnotationData[]; // Annotations to display
  onAnnotationChange?: (annotation: AnnotationData) => void;
  dragGridSize?: number;        // 0 = no snapping, 0.05 = 5% grid
  dragSensitivity?: number;     // Pixel distance before drag (default: 3)
  enableKeyboardShortcuts?: boolean; // Enable keyboard shortcuts
  enableContextMenu?: boolean;  // Enable right-click menu
  readOnly?: boolean;           // Prevent all edits
}
```

#### Usage

```tsx
import { EditableAnnotationStage } from '@/components/EditableAnnotationStage';

function MyComponent() {
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);

  return (
    <EditableAnnotationStage
      canvasWidth={800}
      canvasHeight={600}
      annotations={annotations}
      dragGridSize={0.05}        // 5% grid snapping
      dragSensitivity={3}        // 3px before drag
      enableKeyboardShortcuts={true}
      enableContextMenu={true}
      readOnly={false}
    />
  );
}
```

#### Features

- **Click to select**: Single click selects annotation
- **Double-click to edit**: Opens edit dialog
- **Drag to move**: Click and drag to reposition
- **Keyboard shortcuts**: Delete, Arrow keys, E, D, etc.
- **Right-click menu**: Quick actions
- **Selection indicator**: Green box around selected annotation

### 2. DraggableLabelShape

**Path**: `/src/components/DraggableLabelShape.tsx`

Enhanced label shape with drag support and visual feedback.

#### Props

```typescript
interface DraggableLabelShapeProps {
  annotation: AnnotationData;
  canvasWidth: number;
  canvasHeight: number;
  selected?: boolean;
  draggable?: boolean;
  onClick?: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  onDragStart?: (e: KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  opacity?: number;
}
```

#### Visual States

- **Normal**: Default appearance
- **Hover**: Reduced opacity (85%), cursor changes to "move"
- **Selected**: Green border (3px), bold text, drag handle indicator
- **Dragging**: Semi-transparent, shows position

### 3. LabelEditDialog

**Path**: `/src/components/LabelEditDialog.tsx`

Inline edit dialog for annotation properties.

#### Props

```typescript
interface LabelEditDialogProps {
  open: boolean;
  annotation: AnnotationData | null;
  labels?: LabelDefinition[];
  onClose: () => void;
  onSave?: (id: string, updates: Partial<AnnotationData>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (annotation: AnnotationData) => void;
}
```

#### Fields

- **Label Text**: Text content of the label
- **Category**: Select from predefined label categories
- **Color**: Color picker with presets
- **Unit Type**: Count, Linear Meters, or Square Meters
- **Notes**: Optional description

#### Actions

- **Save**: Apply changes (or press Enter)
- **Cancel**: Discard changes (or press Escape)
- **Delete**: Remove annotation
- **Duplicate**: Create a copy

### 4. ContextMenu

**Path**: `/src/components/ContextMenu.tsx`

Reusable right-click context menu.

#### Props

```typescript
interface ContextMenuProps {
  x: number;              // X position in pixels
  y: number;              // Y position in pixels
  visible: boolean;       // Show/hide menu
  actions: ContextMenuAction[]; // Menu items
  onClose: () => void;    // Close callback
}
```

#### Context Menu Actions

```typescript
interface ContextMenuAction {
  label: string;          // Display text
  icon?: string;          // Emoji or icon
  onClick: () => void;    // Action callback
  disabled?: boolean;     // Disabled state
  separator?: boolean;    // Render as separator
  danger?: boolean;       // Red/destructive style
}
```

#### Default Actions

- **Edit Label**: Open edit dialog
- **Change Color**: Cycle through colors
- **Duplicate**: Create a copy
- **Delete**: Remove annotation

### 5. useDragHandling Hook

**Path**: `/src/hooks/useDragHandling.ts`

Manages drag interactions with annotations.

#### Options

```typescript
interface DragHandlingOptions {
  canvasWidth: number;
  canvasHeight: number;
  gridSize?: number;          // Grid snapping size (0 = off)
  dragSensitivity?: number;   // Pixels before drag (default: 3)
  onUpdate?: (id: string, updates: Partial<AnnotationData>) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string, finalPosition: { x: number; y: number }) => void;
}
```

#### Return Value

```typescript
interface DragHandlingResult {
  handleDragStart: (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => void;
  handleDragMove: (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => void;
  handleDragEnd: (annotation: AnnotationData, e: KonvaEventObject<DragEvent>) => void;
  isDragging: boolean;
  dragPosition: { x: number; y: number } | null;
}
```

#### Features

- **Grid snapping**: Snap to normalized grid (0.05 = 5%)
- **Drag sensitivity**: Prevent accidental moves
- **Canvas bounds**: Constrain within canvas
- **Debounced updates**: Batch updates for performance (60fps)
- **Click detection**: Distinguish clicks from drags

## Keyboard Shortcuts

### Selection & Editing

| Shortcut | Action |
|----------|--------|
| **Click** | Select annotation |
| **Double-click** | Open edit dialog |
| **E** | Edit selected annotation |
| **Escape** | Cancel/deselect |

### Movement

| Shortcut | Action |
|----------|--------|
| **Arrow Keys** | Nudge position (0.5%) |
| **Shift + Arrow** | Large nudge (2%) |

### Actions

| Shortcut | Action |
|----------|--------|
| **Delete** or **Backspace** | Delete selected |
| **Ctrl/Cmd + D** | Duplicate selected |
| **Enter** | Save (in edit dialog) |
| **Escape** | Cancel (in edit dialog) |
| **Tab** | Next field (in edit dialog) |

### Context Menu

| Shortcut | Action |
|----------|--------|
| **Right-click** | Open context menu |

## Drag Behavior

### Drag Initiation

1. **Click and hold** on label (200ms delay optional)
2. **Visual feedback**: Cursor changes to "move", opacity reduces
3. **Track original position** for undo/cancel

### Dragging

1. **Smooth movement**: Label follows cursor
2. **Real-time updates**: Normalized coordinates update continuously
3. **Grid snapping** (optional): Snap to 0.05 grid steps
4. **Bounds constraint**: Keep within canvas
5. **Position display**: Show current x, y coordinates

### Drop/Release

1. **Update store**: Save new position
2. **Persist**: localStorage update
3. **Snap animation** (if enabled): Animate to grid position
4. **Confirmation**: Visual feedback (checkmark or toast)
5. **Keep selected**: Ready for further editing

## Grid Snapping

Enable grid snapping to align labels to a consistent grid:

```tsx
<EditableAnnotationStage
  dragGridSize={0.05}  // 5% grid (20x20 grid on canvas)
  // ...other props
/>
```

### Grid Sizes

- `0` - No snapping (free movement)
- `0.05` - 5% grid (20x20 cells)
- `0.1` - 10% grid (10x10 cells)
- `0.25` - 25% grid (4x4 cells)

## Coordinate System

All positions are stored in **normalized coordinates** (0-1 range):

- `x: 0` = Left edge
- `x: 1` = Right edge
- `y: 0` = Top edge
- `y: 1` = Bottom edge

This ensures annotations scale correctly with canvas size changes.

### Transformations

```typescript
// Normalize: pixels → 0-1
const normalized = pixel / canvasDimension;

// Denormalize: 0-1 → pixels
const pixels = normalized * canvasDimension;

// Grid snap
const snapped = Math.round(normalized / gridSize) * gridSize;
```

## Integration

### With Zustand Store

```tsx
import { useAppStore } from '@/store/useAppStore';

function MyComponent() {
  const updateAnnotation = useAppStore(state => state.updateAnnotation);
  const deleteAnnotation = useAppStore(state => state.deleteAnnotation);
  const selectAnnotation = useAppStore(state => state.selectAnnotation);

  return (
    <EditableAnnotationStage
      // EditableAnnotationStage automatically uses store
      // Or provide custom callbacks:
      onAnnotationChange={(annotation) => {
        updateAnnotation(annotation.id, annotation);
      }}
    />
  );
}
```

### With PDF Viewer

```tsx
import { PDFViewerWithZoom } from '@/components/PDFViewerWithZoom';
import { EditableAnnotationStage } from '@/components/EditableAnnotationStage';

function PDFEditor() {
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  return (
    <div className="relative">
      <PDFViewerWithZoom
        onCanvasReady={(width, height) => {
          setCanvasDimensions({ width, height });
        }}
      />
      <EditableAnnotationStage
        canvasWidth={canvasDimensions.width}
        canvasHeight={canvasDimensions.height}
      />
    </div>
  );
}
```

## Accessibility

### Keyboard Navigation

- Full keyboard support for all actions
- Tab navigation through dialog fields
- Enter/Escape shortcuts in dialogs
- Arrow keys for precise positioning

### Screen Readers

- ARIA labels on all interactive elements
- Role attributes on dialogs and menus
- Clear focus indicators
- Semantic HTML structure

### Visual Indicators

- High contrast selection borders (green #00FF00)
- Cursor changes (move, pointer, text)
- Hover states with opacity changes
- Clear visual feedback for all states

## Performance

### Optimizations

1. **Memoization**: Components memoized with `React.memo`
2. **Debouncing**: Store updates throttled to 60fps
3. **Event throttling**: Drag events use `requestAnimationFrame`
4. **Lazy loading**: Edit dialog loaded on demand
5. **Visibility filtering**: Only render visible annotations

### Best Practices

- Keep annotation count under 100 for smooth performance
- Use grid snapping to reduce update frequency
- Batch multiple updates when possible
- Avoid unnecessary re-renders with memoization

## Troubleshooting

### Labels not dragging

- Check `readOnly` prop is `false`
- Ensure `activeTool` is `null` in store
- Verify `draggable` prop is `true`

### Positions not saving

- Confirm `onAnnotationChange` callback is provided
- Check Zustand store actions are working
- Verify localStorage is enabled

### Grid snapping not working

- Ensure `dragGridSize` is > 0
- Check grid size is appropriate for canvas (0.05 recommended)
- Verify normalized coordinates are being used

### Keyboard shortcuts not working

- Check `enableKeyboardShortcuts` is `true`
- Ensure no input fields have focus
- Verify keyboard event listeners are attached

### Edit dialog not opening

- Confirm annotation has valid ID
- Check dialog state management
- Verify double-click handler is attached

## Examples

### Basic Usage

```tsx
import { EditableAnnotationStage } from '@/components/EditableAnnotationStage';

export function BasicExample() {
  return (
    <EditableAnnotationStage
      canvasWidth={800}
      canvasHeight={600}
    />
  );
}
```

### With Custom Callbacks

```tsx
export function CustomCallbackExample() {
  const handleChange = (annotation: AnnotationData) => {
    console.log('Annotation changed:', annotation);
  };

  return (
    <EditableAnnotationStage
      canvasWidth={800}
      canvasHeight={600}
      onAnnotationChange={handleChange}
    />
  );
}
```

### Read-only Mode

```tsx
export function ReadOnlyExample() {
  return (
    <EditableAnnotationStage
      canvasWidth={800}
      canvasHeight={600}
      readOnly={true}
    />
  );
}
```

### Grid Snapping Enabled

```tsx
export function GridSnappingExample() {
  return (
    <EditableAnnotationStage
      canvasWidth={800}
      canvasHeight={600}
      dragGridSize={0.05}
    />
  );
}
```

## Demo

See the complete demo at:

```tsx
import { EditableDragDemo } from '@/components/EditableDragDemo';

export default function DemoPage() {
  return <EditableDragDemo />;
}
```

## API Reference

### EditableAnnotationStage API

```typescript
<EditableAnnotationStage
  canvasWidth={number}
  canvasHeight={number}
  annotations={AnnotationData[]}
  onAnnotationChange={(annotation) => void}
  dragGridSize={number}           // default: 0
  dragSensitivity={number}        // default: 3
  enableKeyboardShortcuts={boolean} // default: true
  enableContextMenu={boolean}     // default: true
  readOnly={boolean}              // default: false
/>
```

### DraggableLabelShape API

```typescript
<DraggableLabelShape
  annotation={AnnotationData}
  canvasWidth={number}
  canvasHeight={number}
  selected={boolean}
  draggable={boolean}
  onClick={(id) => void}
  onDoubleClick={(id) => void}
  onDragStart={(e) => void}
  onDragMove={(e) => void}
  onDragEnd={(e) => void}
  opacity={number}
/>
```

### LabelEditDialog API

```typescript
<LabelEditDialog
  open={boolean}
  annotation={AnnotationData | null}
  labels={LabelDefinition[]}
  onClose={() => void}
  onSave={(id, updates) => void}
  onDelete={(id) => void}
  onDuplicate={(annotation) => void}
/>
```

### ContextMenu API

```typescript
<ContextMenu
  x={number}
  y={number}
  visible={boolean}
  actions={ContextMenuAction[]}
  onClose={() => void}
/>
```

## File Structure

```
src/
├── components/
│   ├── DraggableLabelShape.tsx      # Draggable label component
│   ├── EditableAnnotationStage.tsx  # Main editable wrapper
│   ├── LabelEditDialog.tsx          # Edit dialog
│   ├── ContextMenu.tsx              # Context menu
│   ├── EditableDragDemo.tsx         # Demo component
│   └── DragAndDropGuide.md          # This documentation
├── hooks/
│   └── useDragHandling.ts           # Drag event hook
└── store/
    └── useAppStore.ts               # Zustand store
```

## Next Steps

1. Integrate with PDF viewer component
2. Add undo/redo functionality
3. Implement magnetic snapping to nearby annotations
4. Add multi-select for batch operations
5. Support touch gestures for mobile
6. Add animation transitions
7. Implement collaborative editing

## Support

For issues or questions:
- Check the troubleshooting section
- Review the examples
- Inspect the demo component
- Check browser console for errors
- Verify Konva and React versions are compatible
