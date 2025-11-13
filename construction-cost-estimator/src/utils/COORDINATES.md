# Coordinate Normalization System

## Overview

The coordinate normalization system ensures annotations render correctly at different zoom levels and canvas sizes. All annotations are stored in a normalized coordinate space (0-1 range) independent of the PDF's actual dimensions.

## Architecture

### Three Coordinate Spaces

1. **Normalized Space (0-1)**
   - All annotations stored in this space
   - x = 0 (left edge) to x = 1 (right edge)
   - y = 0 (top edge) to y = 1 (bottom edge)
   - Resolution independent
   - Persists across canvas resizes

2. **Canvas Space (pixels)**
   - Coordinates relative to canvas dimensions
   - Used for rendering on specific canvas size
   - Example: 800x600 canvas has pixels from (0,0) to (800,600)

3. **Screen Space (pixels)**
   - Coordinates after zoom/pan transforms
   - What the user sees and interacts with
   - Used for mouse/touch event handling

### Transform Pipeline

```
User clicks screen → Screen coords → Reverse zoom/pan → Canvas coords → Normalize → Store

Render annotation → Normalized coords → Denormalize → Canvas coords → Apply zoom/pan → Screen coords
```

## Core Modules

### 1. `coordinates.ts`

Basic coordinate transformations without zoom/pan.

**Key Functions:**

- `toNormalizedCoordinates(x, y, canvasWidth, canvasHeight)` - Canvas → Normalized
- `toCanvasCoordinates(x, y, canvasWidth, canvasHeight)` - Normalized → Canvas
- `normalizeDistance(pixels, canvasWidth)` - Distance in pixels → normalized
- `denormalizeDistance(normalized, canvasWidth)` - Distance normalized → pixels
- `normalizePoints(points, canvasWidth, canvasHeight)` - Array of points
- `denormalizePoints(points, canvasWidth, canvasHeight)` - Array of points
- `getBoundingBox(annotation)` - Calculate annotation bounds
- `calculateNormalizedDistance(p1, p2)` - Distance between points
- `calculateNormalizedArea(points)` - Polygon area

**Example:**

```typescript
import { toNormalizedCoordinates, toCanvasCoordinates } from '@/utils/coordinates';

// User clicks at pixel (400, 300) on 800x600 canvas
const normalized = toNormalizedCoordinates(400, 300, 800, 600);
// Result: { x: 0.5, y: 0.5 }

// Store annotation with normalized coords
const annotation = {
  id: 'marker-1',
  type: 'marker',
  x: normalized.x,  // 0.5
  y: normalized.y,  // 0.5
};

// Later, render on 1200x900 canvas
const canvas = toCanvasCoordinates(annotation.x, annotation.y, 1200, 900);
// Result: { x: 600, y: 450 } - still at center!
```

### 2. `zoomCoordinates.ts`

Zoom and pan aware coordinate transformations.

**Key Functions:**

- `applyZoomTransform(x, y, zoom, panX, panY)` - Canvas → Screen with zoom/pan
- `reverseZoomTransform(screenX, screenY, zoom, panX, panY)` - Screen → Canvas
- `eventToNormalizedCoordinates(event, canvasElement, ...)` - Event → Normalized
- `getVisibleBounds(canvasWidth, canvasHeight, zoom, panX, panY)` - Visible region
- `filterVisibleAnnotations(annotations, ...)` - Performance optimization
- `getEffectiveStrokeWidth(baseWidth, zoom, scaleWithZoom)` - Visual consistency
- `getZoomToFitAnnotation(annotation, ...)` - Auto-zoom to annotation
- `getPanToCenterAnnotation(annotation, ...)` - Auto-center annotation

**Example:**

```typescript
import {
  eventToNormalizedCoordinates,
  filterVisibleAnnotations
} from '@/utils/zoomCoordinates';

// Handle mouse click with zoom and pan
const handleClick = (e: MouseEvent) => {
  const normalized = eventToNormalizedCoordinates(
    e,
    canvasRef.current,
    800, 600,     // canvas dimensions
    1.5,          // 150% zoom
    -200, -100    // pan offset
  );

  if (normalized) {
    // Create annotation at normalized coords
    addAnnotation({ x: normalized.x, y: normalized.y, ... });
  }
};

// Only render visible annotations (performance)
const visible = filterVisibleAnnotations(
  allAnnotations,
  800, 600,
  currentZoom,
  currentPan.x,
  currentPan.y
);
```

### 3. `useCoordinateSystem.ts`

React hook for convenient coordinate system usage.

**Example:**

```typescript
import { useCoordinateSystem } from '@/hooks/useCoordinateSystem';

function AnnotationCanvas() {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const coordSystem = useCoordinateSystem({
    canvasWidth: 800,
    canvasHeight: 600,
    zoom,
    panX: pan.x,
    panY: pan.y,
  });

  const handleClick = (e: MouseEvent) => {
    const normalized = coordSystem.eventToNormalized(e, canvasRef.current);
    if (normalized) {
      addAnnotation({ x: normalized.x, y: normalized.y, ... });
    }
  };

  // Only render visible annotations
  const visibleAnnotations = coordSystem.getVisibleAnnotations(allAnnotations);

  // Calculate real-world measurement
  const realLength = coordSystem.calculateDistance(
    annotation.points[0],
    annotation.points[1],
    true  // in pixels
  ) * metersPerPixel;

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
    />
  );
}
```

## Common Use Cases

### 1. Creating an Annotation from Mouse Click

```typescript
const handleMouseClick = (e: MouseEvent) => {
  // Get normalized coordinates from click event
  const normalized = coordSystem.eventToNormalized(e, canvasRef.current);

  if (!normalized) return;

  // Create annotation with normalized coords
  const newAnnotation: AnnotationData = {
    id: generateId(),
    type: 'marker',
    x: normalized.x,
    y: normalized.y,
    color: '#FF6B6B',
  };

  // Store in state/database
  addAnnotation(newAnnotation);
};
```

### 2. Rendering Annotations

```typescript
function renderAnnotation(annotation: AnnotationData, ctx: CanvasRenderingContext2D) {
  // Convert normalized to canvas coordinates
  const canvas = coordSystem.toCanvas(annotation.x, annotation.y);

  // Draw marker at canvas coordinates
  ctx.beginPath();
  ctx.arc(canvas.x, canvas.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = annotation.color || '#FF6B6B';
  ctx.fill();
}

// Render all visible annotations (performance optimized)
const visible = coordSystem.getVisibleAnnotations(annotations);
visible.forEach(ann => renderAnnotation(ann, ctx));
```

### 3. Drawing Lines with Multiple Points

```typescript
const handleLineDrawing = (e: MouseEvent) => {
  const normalized = coordSystem.eventToNormalized(e, canvasRef.current);

  if (!normalized) return;

  // Add point to current line
  const newPoints = [...currentLine.points, normalized];

  updateAnnotation(currentLine.id, { points: newPoints });
};

function renderLine(annotation: AnnotationData, ctx: CanvasRenderingContext2D) {
  if (!annotation.points || annotation.points.length < 2) return;

  // Convert all normalized points to canvas coordinates
  const canvasPoints = coordSystem.denormalizePoints(annotation.points);

  ctx.beginPath();
  ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
  canvasPoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = annotation.color || '#FFD93D';
  ctx.lineWidth = 2;
  ctx.stroke();
}
```

### 4. Measuring Real-World Distances

```typescript
function calculateRealDistance(
  annotation: AnnotationData,
  calibration: CalibrationData
): number {
  if (!annotation.points || annotation.points.length < 2) return 0;

  const p1 = annotation.points[0];
  const p2 = annotation.points[1];

  // Calculate distance in pixels
  const pixelDistance = coordSystem.calculateDistance(p1, p2, true);

  // Convert to real-world units using calibration
  const realDistance = pixelDistance * calibration.metersPerPixel;

  return realDistance;
}
```

### 5. Calculating Polygon Areas

```typescript
function calculateRealArea(
  annotation: AnnotationData,
  calibration: CalibrationData
): number {
  if (!annotation.points || annotation.points.length < 3) return 0;

  // Calculate area in normalized space
  const normalizedArea = coordSystem.calculateArea(annotation.points);

  // Convert to canvas space area
  const canvasArea = normalizedArea * canvasWidth * canvasHeight;

  // Convert to real-world units
  const realArea = canvasArea * (calibration.metersPerPixel ** 2);

  return realArea;
}
```

### 6. Zoom to Fit Annotation

```typescript
function zoomToAnnotation(annotation: AnnotationData) {
  // Calculate zoom level to fit annotation with 10% padding
  const targetZoom = coordSystem.getZoomToFit(annotation, 0.1);

  // Calculate pan to center annotation
  const targetPan = coordSystem.getPanToCenter(annotation);

  // Apply with animation
  animateZoomPan(targetZoom, targetPan);
}
```

### 7. Hit Testing (Clicking on Annotations)

```typescript
function findAnnotationAtPoint(
  screenX: number,
  screenY: number
): AnnotationData | null {
  // Convert screen coordinates to normalized
  const normalized = coordSystem.reverseZoom(screenX, screenY);
  const normalizedCoords = coordSystem.toNormalized(normalized.x, normalized.y);

  // Check which annotation contains this point
  for (const annotation of annotations) {
    const bbox = coordSystem.getBoundingBox(annotation);

    if (isPointInBoundingBox(normalizedCoords, bbox)) {
      return annotation;
    }
  }

  return null;
}
```

### 8. Performance Optimization with Visibility Culling

```typescript
function render() {
  // Only render annotations visible in current viewport
  const visibleAnnotations = coordSystem.getVisibleAnnotations(allAnnotations);

  console.log(`Rendering ${visibleAnnotations.length} of ${allAnnotations.length} annotations`);

  visibleAnnotations.forEach(annotation => {
    renderAnnotation(annotation, ctx);
  });
}
```

## Integration with Zustand Store

### Store Structure

```typescript
interface AppState {
  // Annotations in normalized coordinates
  annotations: Record<number, AnnotationData[]>;

  // Current zoom/pan state
  currentZoom: number;
  currentPan: { x: number; y: number };

  // Actions
  addAnnotation: (annotation: AnnotationData) => void;
  updateAnnotation: (id: string, updates: Partial<AnnotationData>) => void;
}
```

### Store Actions

```typescript
// Always store in normalized coordinates
addAnnotation: (annotation) => {
  // Annotation already has normalized coordinates from eventToNormalized
  set((state) => ({
    annotations: {
      ...state.annotations,
      [state.currentPageNumber]: [
        ...(state.annotations[state.currentPageNumber] || []),
        annotation
      ]
    }
  }));
}
```

## Integration with AnnotationStage

### Using in Konva Component

```typescript
import { useCoordinateSystem } from '@/hooks/useCoordinateSystem';

function AnnotationStage({ canvasWidth, canvasHeight, annotations }) {
  const coordSystem = useCoordinateSystem({
    canvasWidth,
    canvasHeight,
    zoom: 1.0,  // Konva handles zoom via stage.scale()
    panX: 0,
    panY: 0,
  });

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {annotations.map(annotation => {
          // Convert normalized to canvas coordinates for Konva
          const pos = coordSystem.toCanvas(annotation.x, annotation.y);

          return (
            <Circle
              key={annotation.id}
              x={pos.x}
              y={pos.y}
              radius={8}
              fill={annotation.color}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
```

## Testing Scenarios

### Scenario 1: Canvas Resize

```typescript
// Place marker at center of 800x600 canvas
const marker = {
  id: 'marker-1',
  type: 'marker',
  x: 0.5,
  y: 0.5,
};

// Render on 800x600
let canvas = toCanvasCoordinates(marker.x, marker.y, 800, 600);
// Result: { x: 400, y: 300 } ✓ Center

// Resize to 1200x900
canvas = toCanvasCoordinates(marker.x, marker.y, 1200, 900);
// Result: { x: 600, y: 450 } ✓ Still at center
```

### Scenario 2: Zoom

```typescript
// Marker at (0.25, 0.25) on 800x600 canvas
const marker = { x: 0.25, y: 0.25 };

// At 100% zoom
let canvas = toCanvasCoordinates(marker.x, marker.y, 800, 600);
// Result: { x: 200, y: 150 }

// At 200% zoom (CSS transform: scale(2))
// Normalized coordinates unchanged: (0.25, 0.25) ✓
// Canvas coordinates unchanged: (200, 150) ✓
// Visual position scaled by CSS: (400, 300) ✓
```

### Scenario 3: Pan

```typescript
// Marker at (0.5, 0.5)
const marker = { x: 0.5, y: 0.5 };

// No pan
let screen = applyZoomTransform(400, 300, 1.0, 0, 0);
// Result: { x: 400, y: 300 }

// Pan right by 100px
screen = applyZoomTransform(400, 300, 1.0, 100, 0);
// Result: { x: 500, y: 300 } ✓
```

### Scenario 4: Calibration

```typescript
// Line from (0.2, 0.5) to (0.5, 0.5) on 800px wide canvas
const line = {
  points: [
    { x: 0.2, y: 0.5 },
    { x: 0.5, y: 0.5 }
  ]
};

// Normalized distance
const normalizedDist = 0.5 - 0.2; // 0.3

// Canvas distance
const canvasDist = normalizedDist * 800; // 240 pixels

// With calibration: 0.03 meters per pixel
const realDist = canvasDist * 0.03; // 7.2 meters ✓
```

## Error Handling

### Zero Canvas Dimensions

```typescript
// Handled gracefully
const normalized = toNormalizedCoordinates(100, 100, 0, 0);
// Returns: { x: 0, y: 0 } with console warning
```

### Out of Range Coordinates

```typescript
// Clamped to [0, 1]
const normalized = toNormalizedCoordinates(1000, 700, 800, 600);
// Returns: { x: 1, y: 1 } with console warning
```

### Invalid Zoom Level

```typescript
// Clamped to reasonable bounds
const zoom = clampZoom(15.0); // Too large
// Returns: 10.0 (max zoom)

const zoom = clampZoom(0.05); // Too small
// Returns: 0.1 (min zoom)
```

## Performance Considerations

### 1. Memoization

The `useCoordinateSystem` hook memoizes all transformation functions:

```typescript
// Functions only recreate when dependencies change
const toNormalized = useCallback(
  (x, y) => toNormalizedCoordinates(x, y, canvasWidth, canvasHeight),
  [canvasWidth, canvasHeight]
);
```

### 2. Visibility Culling

Filter annotations before rendering:

```typescript
// Don't render off-screen annotations
const visible = filterVisibleAnnotations(
  annotations,
  canvasWidth, canvasHeight,
  zoom, panX, panY
);

// Only render visible ones
visible.forEach(ann => render(ann));
```

### 3. Avoid Frequent Conversions

Cache converted coordinates when possible:

```typescript
// Bad: Convert on every render
annotations.forEach(ann => {
  const pos = toCanvasCoordinates(ann.x, ann.y, width, height);
  render(pos);
});

// Good: Convert once, reuse
const canvasPositions = annotations.map(ann =>
  toCanvasCoordinates(ann.x, ann.y, width, height)
);
canvasPositions.forEach(pos => render(pos));
```

## Troubleshooting

### Annotations Don't Scale with Canvas Resize

**Problem:** Annotations stored in pixel coordinates instead of normalized.

**Solution:** Always convert to normalized before storing:

```typescript
// Wrong
const annotation = { x: 400, y: 300 }; // Pixel coordinates

// Right
const normalized = coordSystem.toNormalized(400, 300);
const annotation = { x: normalized.x, y: normalized.y }; // 0-1 range
```

### Annotations Move When Zooming

**Problem:** Applying zoom to normalized coordinates instead of canvas coordinates.

**Solution:** Keep normalized coordinates unchanged, only transform canvas coordinates:

```typescript
// Wrong
const zoomed = { x: annotation.x * zoom, y: annotation.y * zoom };

// Right
const canvas = coordSystem.toCanvas(annotation.x, annotation.y);
const screen = coordSystem.applyZoom(canvas.x, canvas.y);
```

### Mouse Clicks Don't Work at High Zoom

**Problem:** Not reversing zoom/pan transform for event coordinates.

**Solution:** Use `eventToNormalizedCoordinates`:

```typescript
// Wrong
const normalized = coordSystem.toNormalized(e.clientX, e.clientY);

// Right
const normalized = coordSystem.eventToNormalized(e, canvasRef.current);
```

### Measurements Incorrect After Resize

**Problem:** Using canvas dimensions at time of creation for calibration.

**Solution:** Store normalized distances, convert using current canvas size:

```typescript
// Store normalized distance
annotation.normalizedLength = 0.125;

// Calculate real distance with current canvas size
const pixelLength = annotation.normalizedLength * currentCanvasWidth;
const realLength = pixelLength * metersPerPixel;
```

## Best Practices

1. **Always store in normalized coordinates** - Never store pixel coordinates in the database or state.

2. **Convert at render time** - Convert from normalized to canvas coordinates only when rendering.

3. **Use the hook** - Prefer `useCoordinateSystem` hook over direct function calls for memoization.

4. **Validate coordinates** - Check coordinates are in [0, 1] range before storing.

5. **Handle edge cases** - Zero dimensions, extreme zoom levels, etc.

6. **Optimize visibility** - Use `filterVisibleAnnotations` for large annotation sets.

7. **Cache conversions** - Don't convert the same coordinates multiple times per frame.

8. **Document coordinate space** - Add comments indicating which space coordinates are in.

## API Reference Summary

### coordinates.ts

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `toNormalizedCoordinates` | Canvas x, y | Normalized point | Canvas → Normalized |
| `toCanvasCoordinates` | Normalized x, y | Canvas point | Normalized → Canvas |
| `normalizeDistance` | Pixel distance | Normalized distance | Distance Canvas → Normalized |
| `denormalizeDistance` | Normalized distance | Pixel distance | Distance Normalized → Canvas |
| `normalizePoints` | Canvas points array | Normalized points | Array Canvas → Normalized |
| `denormalizePoints` | Normalized points | Canvas points | Array Normalized → Canvas |
| `getBoundingBox` | Annotation | BoundingBox | Calculate annotation bounds |
| `calculateNormalizedDistance` | 2 points | Distance | Point-to-point distance |
| `calculateNormalizedArea` | Points array | Area | Polygon area |

### zoomCoordinates.ts

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `applyZoomTransform` | Canvas x, y, zoom, pan | Screen point | Canvas → Screen |
| `reverseZoomTransform` | Screen x, y, zoom, pan | Canvas point | Screen → Canvas |
| `eventToNormalizedCoordinates` | Event, element, state | Normalized point | Event → Normalized |
| `getVisibleBounds` | Canvas size, zoom, pan | BoundingBox | Calculate viewport |
| `filterVisibleAnnotations` | Annotations, state | Visible annotations | Filter by viewport |
| `getEffectiveStrokeWidth` | Base width, zoom | Adjusted width | Visual consistency |
| `getZoomToFitAnnotation` | Annotation | Zoom level | Auto-fit zoom |
| `getPanToCenterAnnotation` | Annotation | Pan offset | Auto-center pan |

### useCoordinateSystem.ts

| Hook | Returns | Purpose |
|------|---------|---------|
| `useCoordinateSystem` | API object | Main coordinate system hook |
| `useCanvasDimensions` | {width, height} | Track canvas size |
| `useZoomPan` | Zoom/pan state | Manage zoom/pan |

## Summary

The coordinate normalization system provides a robust foundation for annotation rendering:

- **Normalized storage** ensures annotations work at any canvas size
- **Zoom/pan transforms** enable smooth navigation
- **Performance optimization** with visibility culling
- **Type-safe API** with comprehensive error handling
- **React integration** via convenient hooks

By following this system, annotations remain stable, accurate, and performant across all user interactions.
