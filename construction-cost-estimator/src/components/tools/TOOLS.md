# Annotation Tools Documentation

## Overview

The annotation tools system provides interactive tools for marking up, measuring, and labeling PDF construction drawings. All tools integrate with the Zustand store and use normalized coordinates (0-1 range) for resolution independence.

## Architecture

```
AnnotationToolbar (UI)
    ↓
Tool Components (Logic)
    ↓
useToolContext (Shared utilities)
    ↓
Zustand Store (State)
    ↓
AnnotationStage (Konva rendering)
```

## Components

### 1. AnnotationToolbar

Main toolbar for selecting and managing annotation tools.

**Features:**
- Tool selection buttons with icons
- Active tool indicator (highlighted button with colored dot)
- Keyboard shortcuts (displayed in tooltips)
- Reset and Clear buttons
- Annotation count display

**Keyboard Shortcuts:**
- `V` - Select tool
- `M` - Marker tool
- `L` - Label tool
- `D` - Line/Distance tool
- `A` - Area/Polygon tool
- `Escape` - Cancel current tool

**Usage:**
```tsx
import { AnnotationToolbar } from './components/AnnotationToolbar';

<AnnotationToolbar
  onToolChange={(tool) => console.log('Tool changed:', tool)}
  showReset
  showClear
  onReset={() => console.log('Reset')}
  onClear={() => console.log('Clear')}
/>
```

### 2. MarkerTool

Place circular point markers on the PDF.

**Features:**
- Click to place marker
- Crosshair cursor during placement
- Default red color (#FF6B6B)
- Stores marker with unique ID and timestamp
- Shows marker count

**Usage:**
```tsx
import { MarkerTool } from './components/tools/MarkerTool';

<MarkerTool
  canvasWidth={800}
  canvasHeight={600}
  onMarkerPlaced={(marker) => console.log('Marker placed:', marker)}
  color="#FF6B6B"
/>
```

**Programmatic Usage:**
```tsx
import { useMarkerTool } from './components/tools/MarkerTool';

const { isMarkerToolActive, startMarkerTool, stopMarkerTool } = useMarkerTool();

// Start marker tool
startMarkerTool();

// Stop marker tool
stopMarkerTool();
```

### 3. LabelTool

Add text labels with categories and cost codes.

**Features:**
- Click to place label
- Dialog for text input and category selection
- Drag to reposition after placement
- Support for predefined label types
- Link to cost categories
- Color customization

**Usage:**
```tsx
import { LabelTool } from './components/tools/LabelTool';

<LabelTool
  canvasWidth={800}
  canvasHeight={600}
  onLabelPlaced={(label) => console.log('Label placed:', label)}
/>
```

**Label Dialog:**
- **Label Text:** Enter custom text
- **Label Type:** Select from predefined types (Windows, Doors, Walls, etc.)
- **Color:** Custom color picker (disabled if type is selected)
- **Preview:** Live preview of label appearance

### 4. LineMeasurementTool

Measure distances between two points.

**Features:**
- Click start point, click end point
- Shows pixel distance in real-time
- Calculates meters if calibrated
- Yellow color (#FFD93D)
- Displays length label on line
- Formula: pixels × metersPerPixel = meters

**Usage:**
```tsx
import { LineMeasurementTool } from './components/tools/LineMeasurementTool';

<LineMeasurementTool
  canvasWidth={800}
  canvasHeight={600}
  onLineMeasured={(line) => console.log('Line measured:', line)}
  color="#FFD93D"
/>
```

**Measurement Display:**
- Before calibration: "123 pixels"
- After calibration: "3.6 meters" or "3.6 m"

### 5. PolygonAreaTool

Measure areas by drawing polygons.

**Features:**
- Click to place vertices
- Right-click or double-click to close polygon
- Shows polygon outline in real-time
- Calculates area using Shoelace formula
- Green color with transparency (#A8E6CF)
- Displays area label (e.g., "15.2 m²")
- Allows vertex adjustment after placement

**Usage:**
```tsx
import { PolygonAreaTool } from './components/tools/PolygonAreaTool';

<PolygonAreaTool
  canvasWidth={800}
  canvasHeight={600}
  onPolygonMeasured={(polygon) => console.log('Polygon measured:', polygon)}
  color="#A8E6CF"
/>
```

**Workflow:**
1. Click to place first vertex
2. Click to add more vertices (minimum 3)
3. Right-click or double-click to close polygon
4. Area is calculated and displayed

**Shoelace Formula:**
```typescript
area = Math.abs(
  sum(x[i] * y[i+1] - x[i+1] * y[i]) / 2
)
```

### 6. AnnotationToolsPanel

Properties panel for editing selected annotations.

**Features:**
- Shows current annotation information
- Edit text in real-time
- Update category/type
- Assign/edit cost codes
- Change colors
- Quick delete button
- Duplicate annotation
- Display measurement data

**Usage:**
```tsx
import { AnnotationToolsPanel } from './components/AnnotationToolsPanel';

<AnnotationToolsPanel
  onAnnotationUpdated={() => console.log('Updated')}
  onAnnotationDeleted={() => console.log('Deleted')}
  showClose
  onClose={() => console.log('Closed')}
/>
```

**Floating Version:**
```tsx
import { AnnotationToolsPanelFloating } from './components/AnnotationToolsPanel';

<AnnotationToolsPanelFloating onClose={() => console.log('Closed')} />
```

## Shared Utilities

### useToolContext Hook

Provides common utilities for all tool components.

**Available Functions:**

#### State
- `calibrationData` - Current calibration settings
- `activeTool` - Currently active tool
- `currentPageNumber` - Current PDF page
- `selectedAnnotationId` - Selected annotation ID

#### Actions
- `setActiveTool(tool)` - Set active tool
- `createAnnotation(annotation)` - Add annotation to store

#### Coordinate Utilities
- `normalizeCoordinate(pixel, dimension)` - Convert pixels to 0-1 range
- `denormalizeCoordinate(normalized, dimension)` - Convert 0-1 to pixels
- `generateId(type)` - Generate unique ID

#### Measurement Utilities
- `calculatePixelDistance(p1, p2, width, height)` - Calculate distance between points
- `calculatePolygonArea(points, width, height)` - Calculate polygon area
- `pixelsToMeters(pixels)` - Convert pixels to meters
- `pixelsToSquareMeters(pixelArea)` - Convert pixel area to square meters
- `formatDistance(pixels)` - Format distance for display
- `formatArea(pixelArea)` - Format area for display
- `canMeasure()` - Check if calibration is complete

**Usage:**
```tsx
import { useToolContext } from './components/tools/useToolContext';

const {
  generateId,
  normalizeCoordinate,
  createAnnotation,
  formatDistance,
  canMeasure,
} = useToolContext();

// Check if measurements are allowed
if (canMeasure()) {
  const distance = calculatePixelDistance(p1, p2, width, height);
  const formatted = formatDistance(distance);
}
```

## Integration with Zustand Store

### Store Structure

```typescript
interface AppState {
  // Active tool
  activeTool: 'select' | 'marker' | 'label' | 'line' | 'polygon' | 'calibrate' | null;

  // Annotations by page
  annotations: Record<number, AnnotationData[]>;

  // Selected annotation
  selectedAnnotationId: string | null;

  // Calibration data
  calibrationData: {
    referenceLength: number;
    pixelDistance: number;
    metersPerPixel: number;
    isCalibrated: boolean;
  };

  // Label definitions
  labels: LabelDefinition[];

  // Cost items
  costItems: CostItem[];
}
```

### Store Actions

```typescript
// Set active tool
setActiveTool(tool: 'marker' | 'label' | 'line' | 'polygon' | null)

// Add annotation
addAnnotation(annotation: AnnotationData)

// Update annotation
updateAnnotation(id: string, updates: Partial<AnnotationData>)

// Delete annotation
deleteAnnotation(id: string)

// Select annotation
selectAnnotation(id: string | null)

// Clear annotations
clearAnnotations(pageNumber?: number)
```

### Usage Example

```tsx
import { useAppStore } from '../store/useAppStore';

const activeTool = useAppStore((state) => state.activeTool);
const setActiveTool = useAppStore((state) => state.setActiveTool);
const addAnnotation = useAppStore((state) => state.addAnnotation);
const calibrationData = useAppStore((state) => state.calibrationData);

// Set tool
setActiveTool('marker');

// Add annotation
addAnnotation({
  id: 'marker-123',
  type: 'marker',
  pageNumber: 1,
  x: 0.5,
  y: 0.5,
  color: '#FF6B6B',
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Check calibration
if (calibrationData.isCalibrated) {
  const meters = pixels * calibrationData.metersPerPixel;
}
```

## Coordinate System

All annotation tools use **normalized coordinates** (0-1 range) for resolution independence.

### Normalization

```typescript
// Pixel to normalized (0-1)
const normalized = pixel / dimension;

// Example
const x = 400; // pixel position
const canvasWidth = 800;
const normalizedX = x / canvasWidth; // 0.5
```

### Denormalization

```typescript
// Normalized to pixel
const pixel = normalized * dimension;

// Example
const normalizedX = 0.5;
const canvasWidth = 800;
const x = normalizedX * canvasWidth; // 400 pixels
```

### Benefits

1. **Resolution Independence:** Annotations scale with canvas size
2. **Zoom Support:** Coordinates remain consistent across zoom levels
3. **Page Transitions:** Annotations maintain relative positions
4. **Export/Import:** Portable across different display sizes

## Measurement Calculations

### Distance (Line Tool)

```typescript
// Euclidean distance formula
const dx = x2 - x1;
const dy = y2 - y1;
const pixelDistance = Math.sqrt(dx * dx + dy * dy);

// Convert to meters
const meters = pixelDistance * metersPerPixel;
```

### Area (Polygon Tool)

```typescript
// Shoelace formula
let area = 0;
for (let i = 0; i < points.length; i++) {
  const j = (i + 1) % points.length;
  area += points[i].x * points[j].y;
  area -= points[j].x * points[i].y;
}
area = Math.abs(area / 2);

// Convert to square meters
const sqMeters = area * (metersPerPixel * metersPerPixel);
```

## Cursor Feedback

Each tool sets a specific cursor style:

- **Marker tool:** `crosshair`
- **Label tool:** `text`
- **Line tool:** `crosshair` (with line preview)
- **Polygon tool:** `crosshair` (with vertex preview)
- **Default:** `pointer`

```typescript
// Set cursor
document.body.style.cursor = 'crosshair';

// Reset cursor
document.body.style.cursor = 'default';
```

## Error Handling

### Calibration Warning

Before taking measurements, check if calibration is complete:

```typescript
if (!canMeasure()) {
  alert('Please calibrate the drawing first to get accurate measurements.');
}
```

### Input Validation

Validate measurement inputs:

```typescript
// Check for valid polygon
if (points.length < 3) {
  console.error('Polygon must have at least 3 vertices');
  return;
}

// Check for zero-width line
if (distance < 0.001) {
  console.warn('Line distance is too small');
}
```

### Edge Cases

- **Zero-width lines:** Prevent creation if distance < threshold
- **Tiny polygons:** Warn if area < threshold
- **Duplicate IDs:** Use `generateId()` with timestamp and random suffix
- **Out of bounds:** Clamp coordinates to 0-1 range

## Best Practices

### 1. Always Use Normalized Coordinates

```typescript
// ✅ Good
const normalizedX = normalizeCoordinate(x, canvasWidth);
createAnnotation({ x: normalizedX, ... });

// ❌ Bad
createAnnotation({ x: x, ... }); // Raw pixels
```

### 2. Check Calibration Before Measuring

```typescript
// ✅ Good
if (canMeasure()) {
  const meters = pixelsToMeters(distance);
}

// ❌ Bad
const meters = distance * 0.01; // Hardcoded conversion
```

### 3. Clean Up Event Listeners

```typescript
// ✅ Good
useEffect(() => {
  document.addEventListener('click', handleClick);
  return () => {
    document.removeEventListener('click', handleClick);
  };
}, [handleClick]);
```

### 4. Use Zustand Store Actions

```typescript
// ✅ Good
const addAnnotation = useAppStore((state) => state.addAnnotation);
addAnnotation(annotation);

// ❌ Bad
// Directly mutating store state
```

### 5. Provide User Feedback

```typescript
// ✅ Good
<div className="fixed bottom-4 ...">
  Click to place marker · {markerCount} placed · Press ESC to cancel
</div>

// ❌ Bad
// Silent tool with no status indicator
```

## Common Patterns

### Creating an Annotation

```typescript
const annotation = createAnnotation({
  id: generateId('marker'),
  type: 'marker',
  x: normalizedX,
  y: normalizedY,
  color: '#FF6B6B',
});
```

### Measuring Distance

```typescript
const pixelDistance = calculatePixelDistance(
  startPoint,
  endPoint,
  canvasWidth,
  canvasHeight
);

const displayText = formatDistance(pixelDistance);
// "3.6 m" or "123 px"
```

### Measuring Area

```typescript
const pixelArea = calculatePolygonArea(
  vertices,
  canvasWidth,
  canvasHeight
);

const displayText = formatArea(pixelArea);
// "15.2 m²" or "1234 px²"
```

### Handling Tool Cancellation

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isActive) {
      // Reset tool state
      setStartPoint(null);

      // Exit tool if no work in progress
      if (!hasWorkInProgress) {
        setActiveTool(null);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isActive, hasWorkInProgress]);
```

## Troubleshooting

### Problem: Annotations don't appear

**Solution:** Check that:
1. AnnotationStage is rendered
2. Canvas dimensions are correct
3. Coordinates are normalized (0-1 range)
4. Annotations are added to correct page number

### Problem: Measurements are incorrect

**Solution:** Check that:
1. Calibration is complete (`isCalibrated === true`)
2. `metersPerPixel` is calculated correctly
3. Using denormalized coordinates for pixel calculations
4. Using normalized coordinates for storage

### Problem: Tool doesn't respond to clicks

**Solution:** Check that:
1. Tool is active (`activeTool === 'marker'`)
2. Canvas has class `annotation-canvas`
3. Event listeners are properly attached
4. No conflicting event handlers

### Problem: Cursor doesn't change

**Solution:** Check that:
1. Cursor style is set in `useEffect`
2. Cursor is reset in cleanup function
3. No conflicting CSS cursor properties

## Performance Optimization

### 1. Memoize Calculations

```typescript
const pixelDistance = useMemo(
  () => calculatePixelDistance(p1, p2, width, height),
  [p1, p2, width, height]
);
```

### 2. Debounce Mouse Move

```typescript
const debouncedMouseMove = useMemo(
  () => debounce(handleMouseMove, 16), // ~60fps
  [handleMouseMove]
);
```

### 3. Use Shallow Selectors

```typescript
// ✅ Good - only re-renders when activeTool changes
const activeTool = useAppStore((state) => state.activeTool);

// ❌ Bad - re-renders on any state change
const state = useAppStore();
const activeTool = state.activeTool;
```

## Testing

### Unit Tests

```typescript
describe('useToolContext', () => {
  it('should normalize coordinates', () => {
    const { normalizeCoordinate } = useToolContext();
    expect(normalizeCoordinate(400, 800)).toBe(0.5);
  });

  it('should calculate distance', () => {
    const { calculatePixelDistance } = useToolContext();
    const distance = calculatePixelDistance(
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      800,
      600
    );
    expect(distance).toBeCloseTo(500);
  });
});
```

### Integration Tests

```typescript
describe('MarkerTool', () => {
  it('should place marker on click', async () => {
    const { getByRole } = render(<MarkerTool {...props} />);
    const canvas = getByRole('canvas');

    fireEvent.click(canvas, { clientX: 400, clientY: 300 });

    expect(mockAddAnnotation).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'marker',
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );
  });
});
```

## Future Enhancements

### Planned Features

1. **Undo/Redo:** Track annotation history
2. **Snapping:** Snap to grid or other annotations
3. **Multi-select:** Select and manipulate multiple annotations
4. **Layers:** Organize annotations in layers
5. **Export:** Export annotations as JSON/PDF
6. **Templates:** Save and load annotation templates
7. **Collaboration:** Real-time collaborative annotations
8. **AI Assistance:** Auto-detect elements and suggest labels

## Resources

- [Konva Documentation](https://konvajs.org/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Shoelace Formula](https://en.wikipedia.org/wiki/Shoelace_formula)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the store integration docs
- Check the component examples
- Refer to the Konva documentation for rendering issues

---

**Last Updated:** 2025-11-13
**Version:** 1.0.0
