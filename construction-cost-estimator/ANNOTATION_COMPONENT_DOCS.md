# AnnotationStage Component Documentation

## Overview

The `AnnotationStage` component is a Konva-based overlay that synchronizes with a PDF canvas to enable interactive annotations. It provides a complete solution for drawing, measuring, and labeling PDF content with a normalized coordinate system that remains consistent across different zoom levels and screen sizes.

## Component Location

- **Main Component**: `/src/components/AnnotationStage.tsx`
- **Demo/Example**: `/src/components/AnnotationDemo.tsx`

## Features

### Core Functionality
- **Synchronized Coordinate Space**: Automatically aligns with PDF canvas dimensions
- **Normalized Coordinates**: All positions stored as 0-1 range for resolution independence
- **Multiple Annotation Types**: Supports markers, labels, lines, and polygons
- **Interactive Editing**: Select, drag, and delete annotations
- **Event Handling**: Full mouse, touch, and keyboard support
- **Performance Optimized**: Efficient rendering with Konva

### Annotation Types

#### 1. Marker
- **Purpose**: Point markers for highlighting specific locations
- **Features**: Draggable circle with customizable color
- **Default Color**: #FF6B6B (red)

#### 2. Label
- **Purpose**: Text annotations with background
- **Features**: Draggable text with auto-sizing background box
- **Default Color**: #4ECDC4 (teal)

#### 3. Line
- **Purpose**: Measurements and connections
- **Features**: Draggable line with adjustable endpoints
- **Default Color**: #FFD93D (yellow)

#### 4. Polygon
- **Purpose**: Area measurements and regions
- **Features**: Draggable polygon with adjustable vertices
- **Default Color**: #A8E6CF (green)

## Props Interface

```typescript
interface AnnotationStageProps {
  canvasWidth: number;           // Width of PDF canvas in pixels
  canvasHeight: number;          // Height of PDF canvas in pixels
  annotations?: AnnotationData[]; // Array of annotation objects
  onAnnotationChange?: (annotations: AnnotationData[]) => void;
  onSelectionChange?: (selectedId: string | null) => void;
}

interface AnnotationData {
  id: string;                    // Unique identifier
  type: 'label' | 'marker' | 'line' | 'polygon';
  x: number;                     // Normalized X coordinate (0-1)
  y: number;                     // Normalized Y coordinate (0-1)
  width?: number;                // Optional width
  height?: number;               // Optional height
  points?: Array<{x: number, y: number}>; // For lines/polygons
  text?: string;                 // For labels
  color?: string;                // Hex color code
  selected?: boolean;            // Selection state
}
```

## Usage Example

### Basic Integration with PDFViewer

```typescript
import { useState, useCallback } from 'react';
import { PDFViewer } from './components/PDFViewer';
import { AnnotationStage, type AnnotationData } from './components/AnnotationStage';

function MyApp() {
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);

  const handlePageLoadComplete = useCallback((canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    setCanvasWidth(rect.width);
    setCanvasHeight(rect.height);
  }, []);

  const handleAnnotationChange = useCallback((updatedAnnotations: AnnotationData[]) => {
    setAnnotations(updatedAnnotations);
  }, []);

  return (
    <div className="relative inline-block">
      {/* PDF Layer */}
      <PDFViewer
        pdfUrl="/path/to/document.pdf"
        pageNumber={1}
        scale={1.5}
        onPageLoadComplete={handlePageLoadComplete}
      />

      {/* Annotation Overlay Layer */}
      {canvasWidth > 0 && canvasHeight > 0 && (
        <AnnotationStage
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          annotations={annotations}
          onAnnotationChange={handleAnnotationChange}
          onSelectionChange={(id) => console.log('Selected:', id)}
        />
      )}
    </div>
  );
}
```

### Adding Annotations Programmatically

```typescript
// Add a marker
const addMarker = () => {
  const newMarker: AnnotationData = {
    id: `marker-${Date.now()}`,
    type: 'marker',
    x: 0.5,  // Center horizontally (50%)
    y: 0.3,  // 30% from top
    color: '#FF6B6B',
  };
  setAnnotations([...annotations, newMarker]);
};

// Add a label
const addLabel = () => {
  const newLabel: AnnotationData = {
    id: `label-${Date.now()}`,
    type: 'label',
    x: 0.2,
    y: 0.2,
    text: 'Kitchen Area',
    color: '#4ECDC4',
  };
  setAnnotations([...annotations, newLabel]);
};

// Add a line measurement
const addLine = () => {
  const newLine: AnnotationData = {
    id: `line-${Date.now()}`,
    type: 'line',
    x: 0.1,
    y: 0.5,
    points: [
      { x: 0.1, y: 0.5 },
      { x: 0.4, y: 0.5 },
    ],
    color: '#FFD93D',
  };
  setAnnotations([...annotations, newLine]);
};

// Add a polygon
const addPolygon = () => {
  const newPolygon: AnnotationData = {
    id: `polygon-${Date.now()}`,
    type: 'polygon',
    x: 0.6,
    y: 0.6,
    points: [
      { x: 0.6, y: 0.6 },
      { x: 0.75, y: 0.65 },
      { x: 0.7, y: 0.8 },
      { x: 0.55, y: 0.75 },
    ],
    color: '#A8E6CF',
  };
  setAnnotations([...annotations, newPolygon]);
};
```

## User Interactions

### Mouse/Touch Events
- **Click**: Select an annotation
- **Drag**: Move annotation or adjust vertices/endpoints
- **Click on Stage Background**: Deselect all annotations
- **Right-Click**: Show delete confirmation for selected annotation

### Keyboard Events
- **Delete Key**: Remove selected annotation
- **Backspace Key**: Remove selected annotation (alternative)

### Visual Feedback
- **Selection**: Green border appears around selected shape
- **Hover**: Cursor changes to indicate draggability
- **Dragging**: Shape follows cursor/touch position

## Coordinate System

### Normalized Coordinates (0-1 Range)
All annotation positions are stored as normalized values:
- `x: 0.0` = Left edge of canvas
- `x: 0.5` = Horizontal center of canvas
- `x: 1.0` = Right edge of canvas
- `y: 0.0` = Top edge of canvas
- `y: 0.5` = Vertical center of canvas
- `y: 1.0` = Bottom edge of canvas

### Benefits
- **Resolution Independence**: Annotations scale with PDF zoom
- **Consistent Positioning**: Works across different screen sizes
- **Easy Storage**: Coordinates remain valid regardless of display size

### Conversion Functions
```typescript
// Normalize: Pixels → 0-1 range
const normalizeX = (pixelX: number, canvasWidth: number) => pixelX / canvasWidth;
const normalizeY = (pixelY: number, canvasHeight: number) => pixelY / canvasHeight;

// Denormalize: 0-1 range → Pixels
const pixelX = (normalizedX: number, canvasWidth: number) => normalizedX * canvasWidth;
const pixelY = (normalizedY: number, canvasHeight: number) => normalizedY * canvasHeight;
```

## Performance Considerations

### Optimization Strategies
1. **Efficient Rendering**: Konva uses canvas-based rendering for high performance
2. **Event Delegation**: Single stage-level event handlers
3. **Lazy Updates**: Only re-renders when annotations change
4. **Minimal Re-renders**: Uses React.memo and useCallback where appropriate

### Best Practices
- Limit to ~100-200 annotations per page for optimal performance
- Use debouncing for real-time updates during drag operations
- Consider virtualization for very large annotation sets
- Batch annotation updates when possible

## Edge Cases & Considerations

### 1. Canvas Not Ready
**Issue**: Canvas dimensions are 0 before PDF loads
**Solution**: Conditional rendering - only show AnnotationStage after dimensions are set

```typescript
{canvasWidth > 0 && canvasHeight > 0 && (
  <AnnotationStage ... />
)}
```

### 2. PDF Zoom Changes
**Issue**: Canvas dimensions change when user zooms
**Solution**: Update canvas dimensions via onPageLoadComplete callback

### 3. Touch Device Support
**Issue**: Mobile devices need touch event handling
**Solution**: Component includes both mouse and touch event handlers

### 4. Scroll Prevention
**Issue**: Touching annotation stage can trigger page scroll
**Solution**: Component prevents default behavior for wheel and touchmove events

### 5. Selection Conflicts
**Issue**: Clicking annotation vs. clicking stage background
**Solution**: Event propagation checks ensure proper selection/deselection

### 6. Coordinate Precision
**Issue**: Floating-point precision errors in normalized coordinates
**Solution**: Store as float, round only for display if needed

### 7. Deletion Confirmation
**Issue**: Accidental deletions via keyboard
**Solution**: Right-click shows confirmation dialog

## Styling & Customization

### Shape Colors
Default colors are defined but can be customized per annotation:
```typescript
const customAnnotation: AnnotationData = {
  id: 'custom-1',
  type: 'marker',
  x: 0.5,
  y: 0.5,
  color: '#FF00FF', // Custom magenta color
};
```

### Selection Highlight
Selected shapes show a green (#00FF00) border with increased stroke width.

### Z-Index Layering
The component uses `z-index: 10` to position above the PDF canvas.

## Data Persistence

### Export Annotations
```typescript
const exportAnnotations = () => {
  const dataStr = JSON.stringify(annotations, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'annotations.json';
  link.click();
  URL.revokeObjectURL(url);
};
```

### Import Annotations
```typescript
const importAnnotations = (jsonData: string) => {
  try {
    const imported: AnnotationData[] = JSON.parse(jsonData);
    setAnnotations(imported);
  } catch (error) {
    console.error('Invalid annotation data:', error);
  }
};
```

## Testing the Component

Run the demo to see the component in action:

```bash
npm run dev
```

Then import and use the `AnnotationDemo` component in your app.

## Future Enhancements

Potential improvements:
- [ ] Multi-select support (Ctrl+Click)
- [ ] Undo/redo functionality
- [ ] Copy/paste annotations
- [ ] Rotation support for shapes
- [ ] Custom shape types
- [ ] Measurement calculations (length, area)
- [ ] Text editing for labels (double-click to edit)
- [ ] Color picker integration
- [ ] Layer management (z-ordering)
- [ ] Annotation groups/templates

## Troubleshooting

### Annotations don't appear
- Verify canvas dimensions are > 0
- Check that annotations array contains valid data
- Ensure normalized coordinates are in 0-1 range

### Drag not working
- Confirm `onAnnotationChange` callback is provided
- Check browser console for errors
- Verify touch-action CSS is set appropriately

### Performance issues
- Reduce number of annotations
- Check for unnecessary re-renders
- Profile with React DevTools

## License

Part of the Construction Cost Estimator project.
