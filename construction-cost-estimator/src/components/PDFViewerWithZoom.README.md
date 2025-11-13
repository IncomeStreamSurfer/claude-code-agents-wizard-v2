# PDFViewerWithZoom Component

A comprehensive PDF viewer component with interactive zoom and pan functionality, built with React, PDF.js, and Konva.

## Features

### Zoom Functionality
- **Mouse Wheel Zoom**: Hold Ctrl/Cmd and scroll to zoom in/out
- **Zoom Buttons**: UI controls for zoom in (+), zoom out (-), and reset
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + +` or `Ctrl/Cmd + =` - Zoom in
  - `Ctrl/Cmd + -` - Zoom out
  - `Ctrl/Cmd + 0` - Reset zoom to 100%
- **Zoom Range**: Configurable min (default 0.5x) to max (default 3x)
- **Zoom Step**: 0.1x (10%) increment per action
- **Cursor-Centered Zoom**: Zoom centered on mouse cursor position (pinch-zoom behavior)
- **Smooth Transitions**: GPU-accelerated CSS transforms for smooth zoom animations

### Pan Functionality
- **Space + Drag**: Hold Space key and drag with left mouse button
- **Middle Mouse Button**: Drag with middle mouse button
- **Arrow Keys**: Use arrow keys to pan in any direction
- **Constrained Panning**: PDF stays visible, prevents over-panning
- **Visual Feedback**: Cursor changes to hand icon during pan mode
- **Smooth Panning**: CSS transitions for smooth pan animations

### Annotation Support
- **Coordinate Normalization**: Annotations scale properly with zoom/pan
- **Synchronized Overlay**: Konva annotation layer stays perfectly aligned with PDF
- **Interactive Annotations**: Full support for markers, labels, lines, and polygons
- **Selection Management**: Handle annotation selection while zooming/panning

### UI/UX
- **Toolbar Controls**: Semi-transparent overlay with zoom controls
- **Zoom Percentage Display**: Real-time zoom level indicator
- **Pan Mode Indicator**: Visual indicator when Space key is held
- **Keyboard Shortcuts Help**: Built-in shortcuts reference panel
- **Responsive Design**: Works on any screen size

## Installation

The component is part of the construction-cost-estimator project and uses these dependencies:

```json
{
  "pdfjs-dist": "^5.4.394",
  "konva": "^10.0.8",
  "react-konva": "^19.2.0",
  "lucide-react": "^0.553.0"
}
```

## Basic Usage

```tsx
import { PDFViewerWithZoom } from './components/PDFViewerWithZoom';
import { AnnotationData } from './components/AnnotationStage';

function MyApp() {
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PDFViewerWithZoom
        pdfUrl="/path/to/document.pdf"
        pageNumber={1}
        scale={1.5}
        annotations={annotations}
        onAnnotationChange={setAnnotations}
      />
    </div>
  );
}
```

## Props

### PDFViewerWithZoomProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pdfUrl` | `string` | required | URL or path to the PDF file |
| `pageNumber` | `number` | required | Page number to display (1-indexed) |
| `scale` | `number` | `1.5` | Initial scale for PDFViewer (1-3) |
| `minZoom` | `number` | `0.5` | Minimum zoom level |
| `maxZoom` | `number` | `3` | Maximum zoom level |
| `annotations` | `AnnotationData[]` | `[]` | Array of annotations to display |
| `onZoomChange` | `(zoom: number) => void` | optional | Callback when zoom level changes |
| `onPanChange` | `(pan: {x: number, y: number}) => void` | optional | Callback when pan position changes |
| `onAnnotationChange` | `(annotations: AnnotationData[]) => void` | optional | Callback when annotations change |
| `onSelectionChange` | `(selectedId: string \| null) => void` | optional | Callback when selection changes |
| `onError` | `(error: Error) => void` | optional | Callback when an error occurs |

## Advanced Usage

### With State Management

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components/PDFViewerWithZoom';

function AdvancedPDFViewer() {
  const [pdfUrl, setPdfUrl] = useState('/document.pdf');
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    console.log('Zoom changed to:', newZoom);
  };

  const handlePanChange = (newPan: { x: number; y: number }) => {
    setPan(newPan);
    console.log('Pan position:', newPan);
  };

  return (
    <PDFViewerWithZoom
      pdfUrl={pdfUrl}
      pageNumber={pageNumber}
      scale={1.5}
      minZoom={0.5}
      maxZoom={3}
      annotations={annotations}
      onZoomChange={handleZoomChange}
      onPanChange={handlePanChange}
      onAnnotationChange={setAnnotations}
    />
  );
}
```

### With Custom Zoom Limits

```tsx
<PDFViewerWithZoom
  pdfUrl="/blueprint.pdf"
  pageNumber={1}
  minZoom={0.25}  // Allow more zoom out
  maxZoom={5}     // Allow more zoom in
  scale={2}       // Start at 2x scale
/>
```

### With File Upload

```tsx
function PDFUploader() {
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
      />
      {pdfUrl && (
        <PDFViewerWithZoom
          pdfUrl={pdfUrl}
          pageNumber={1}
        />
      )}
    </div>
  );
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Scroll` | Zoom in/out centered on cursor |
| `Ctrl/Cmd + +` or `=` | Zoom in by 10% |
| `Ctrl/Cmd + -` | Zoom out by 10% |
| `Ctrl/Cmd + 0` | Reset zoom to 100% |
| `Space + Drag` | Pan the document |
| `Arrow Keys` | Pan in any direction (50px steps) |
| `Delete` or `Backspace` | Delete selected annotation |

## Mouse Interactions

| Action | Result |
|--------|--------|
| `Ctrl/Cmd + Mouse Wheel` | Zoom in/out |
| `Space + Left Drag` | Pan document |
| `Middle Mouse Drag` | Pan document |
| `Left Click` | Select annotation |
| `Right Click` | Context menu (when annotation selected) |

## Component Architecture

```
PDFViewerWithZoom
├── Zoom Toolbar (overlay)
│   ├── Zoom Out Button
│   ├── Zoom Percentage Display
│   ├── Zoom In Button
│   ├── Reset Zoom Button
│   └── Pan Mode Indicator
├── PDF Container (scrollable, with zoom/pan transforms)
│   ├── PDFViewer (renders PDF using PDF.js)
│   └── AnnotationStage (Konva overlay for annotations)
└── Keyboard Shortcuts Help (overlay)
```

## Coordinate System

The component uses a normalized coordinate system (0-1 range) for annotations:

- **Normalized Coordinates**: Annotations store positions as 0-1 values relative to PDF dimensions
- **Denormalized for Display**: Coordinates are converted to pixels based on current zoom and canvas size
- **Zoom Independence**: Annotations scale correctly with zoom level
- **Pan Independence**: Annotations move correctly with pan operations

Example:
```tsx
const annotation: AnnotationData = {
  id: '1',
  type: 'marker',
  x: 0.5,  // 50% from left edge
  y: 0.3,  // 30% from top edge
  color: '#FF6B6B',
};
```

## Performance Considerations

### Optimizations
- **CSS Transform**: Uses GPU-accelerated `transform: scale()` and `translate()` instead of re-rendering
- **Debounced Events**: Mouse wheel events are naturally debounced by browser
- **Constrained State Updates**: Pan is constrained to prevent unnecessary re-renders
- **Memoized Callbacks**: Uses `useCallback` to prevent unnecessary re-renders
- **Efficient DOM Updates**: Minimal DOM manipulation, mostly CSS changes

### Best Practices
1. **Use Callbacks Wisely**: Only provide callbacks you actually need
2. **Batch Updates**: If adding multiple annotations, batch them in a single state update
3. **Lazy Loading**: Consider lazy loading PDF pages for large documents
4. **Memory Management**: Clean up object URLs when switching PDFs

```tsx
// Clean up object URLs
useEffect(() => {
  return () => {
    if (pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }
  };
}, [pdfUrl]);
```

## Styling Customization

The component uses Tailwind CSS for styling. You can customize the appearance:

### Toolbar Styling
```tsx
// The toolbar has these default classes:
// "bg-black/10 backdrop-blur-sm rounded-lg p-2 shadow-lg"

// You can wrap the component and override with your own styles
<div className="custom-pdf-viewer">
  <PDFViewerWithZoom {...props} />
</div>
```

### Container Styling
```tsx
// The container fills its parent, so style the parent:
<div style={{ width: '800px', height: '600px', border: '1px solid #ccc' }}>
  <PDFViewerWithZoom {...props} />
</div>
```

## Accessibility

The component includes accessibility features:

- **Aria Labels**: All buttons have descriptive aria-label attributes
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Management**: Proper focus handling for toolbar controls
- **Screen Reader Support**: Zoom percentage and pan mode are announced
- **High Contrast**: Works with high contrast modes

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (Note: Cmd key for macOS shortcuts)
- **Mobile**: Touch support for pan, pinch-zoom gesture (future enhancement)

## Troubleshooting

### PDF Not Loading
- Check that `pdfUrl` is valid and accessible
- Check browser console for CORS errors
- Verify PDF.js worker is loading correctly

### Zoom/Pan Not Working
- Ensure container has defined dimensions (not 0x0)
- Check that keyboard shortcuts aren't conflicting with browser defaults
- Verify event listeners are attaching (check browser dev tools)

### Annotations Not Appearing
- Ensure `canvasWidth` and `canvasHeight` are > 0
- Check that annotations have valid normalized coordinates (0-1 range)
- Verify AnnotationStage is receiving correct props

### Performance Issues
- Reduce number of annotations on screen
- Lower the PDF scale if rendering is slow
- Consider implementing virtual scrolling for multi-page PDFs

## Future Enhancements

Potential improvements for future versions:

1. **Touch Gestures**: Pinch-to-zoom on mobile devices
2. **Momentum Panning**: Inertial scrolling after pan gesture
3. **Zoom to Selection**: Zoom to fit selected annotation
4. **Multi-Page View**: Display multiple pages with scroll
5. **Thumbnail Navigation**: Page thumbnails sidebar
6. **Annotation Tools**: Built-in drawing and measurement tools
7. **PDF Caching**: Cache rendered pages at different zoom levels
8. **Minimap**: Small overview map showing current viewport

## License

Part of the construction-cost-estimator project.

## Related Components

- `PDFViewer`: Base PDF rendering component
- `AnnotationStage`: Konva-based annotation overlay
- `PDFViewerDemo`: Simple demo without zoom/pan
- `PDFViewerWithZoomDemo`: Full-featured demo with zoom/pan

## Support

For issues, questions, or contributions, please refer to the main project repository.
