# PDFViewer Component

A React component that renders PDF pages using PDF.js on an HTML canvas element. This component serves as the foundation for the annotation layer in the Construction Cost Estimator application.

## Features

- ✅ Load and render PDF files using PDF.js
- ✅ High-DPI rendering (2x device pixel ratio) for crisp display
- ✅ Loading and error state handling
- ✅ Dynamic page navigation
- ✅ Scalable zoom levels (0.5x to 3x)
- ✅ Canvas reference callback for overlay components
- ✅ TypeScript support with full type definitions
- ✅ Tailwind CSS styling
- ✅ Automatic cleanup on unmount

## Installation

The required dependency (`pdfjs-dist`) is already installed in the project:

```json
"dependencies": {
  "pdfjs-dist": "^5.4.394"
}
```

## Usage

### Basic Example

```tsx
import { useState } from 'react';
import { PDFViewer } from './components/PDFViewer';

function App() {
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <PDFViewer
      pdfUrl="/path/to/document.pdf"
      pageNumber={pageNumber}
      scale={1.5}
    />
  );
}
```

### Complete Example with Controls

```tsx
import { useState } from 'react';
import { PDFViewer } from './components/PDFViewer';

function PDFViewerPage() {
  const [pdfUrl, setPdfUrl] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);

  const handlePageLoad = (canvas: HTMLCanvasElement) => {
    console.log('Page loaded:', {
      width: canvas.width,
      height: canvas.height,
      displayWidth: canvas.style.width,
      displayHeight: canvas.style.height,
    });
  };

  const handleError = (error: Error) => {
    console.error('PDF Error:', error.message);
    alert(`Failed to load PDF: ${error.message}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPageNumber(1);
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
        <>
          <div>
            <button onClick={() => setPageNumber(p => Math.max(1, p - 1))}>
              Previous
            </button>
            <span>Page {pageNumber}</span>
            <button onClick={() => setPageNumber(p => p + 1)}>
              Next
            </button>
          </div>

          <PDFViewer
            pdfUrl={pdfUrl}
            pageNumber={pageNumber}
            scale={scale}
            onPageLoadComplete={handlePageLoad}
            onError={handleError}
          />
        </>
      )}
    </div>
  );
}
```

## Props API

### `PDFViewerProps`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `pdfUrl` | `string` | Yes | - | URL or path to the PDF file. Can be a local path, remote URL, or blob URL from `URL.createObjectURL()` |
| `pageNumber` | `number` | Yes | - | Page number to display (1-indexed). First page is 1, not 0. |
| `scale` | `number` | No | `1.5` | Zoom/scale factor for rendering. Typical range: 0.5 to 3.0. |
| `onPageLoadComplete` | `(canvas: HTMLCanvasElement) => void` | No | - | Callback fired when page finishes loading. Receives canvas element reference. |
| `onError` | `(error: Error) => void` | No | - | Callback fired when an error occurs during PDF loading or rendering. |

## Component States

The component handles three distinct states:

### 1. Loading State
- Displays a spinner overlay with "Loading PDF..." message
- Shown during initial PDF load and page rendering
- Uses Tailwind CSS for styling

### 2. Loaded State
- Renders the PDF page on canvas
- Canvas is sized correctly with high-DPI rendering
- Fires `onPageLoadComplete` callback with canvas reference

### 3. Error State
- Displays error message overlay
- Shows user-friendly error icon and message
- Fires `onError` callback with error details

## Canvas Rendering Details

### High-DPI Rendering

The component automatically detects the device pixel ratio and renders at 2x resolution for crisp display on retina screens:

```tsx
const devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = Math.floor(viewport.width * devicePixelRatio);
canvas.height = Math.floor(viewport.height * devicePixelRatio);
```

### Canvas Dimensions

- **Canvas internal size**: `width * devicePixelRatio` x `height * devicePixelRatio` (actual pixels)
- **Canvas display size**: `width` x `height` (CSS pixels)
- This ensures sharp rendering on high-DPI displays

### Scale Factor

The `scale` prop controls the zoom level:
- `1.0` = 100% (actual size)
- `1.5` = 150% (default, good for reading)
- `2.0` = 200% (double size)
- `0.5` = 50% (thumbnail view)

## Integration with Konva (Annotation Layer)

The PDFViewer is designed to work seamlessly with Konva for annotations:

```tsx
import { Stage, Layer, Rect } from 'react-konva';
import { PDFViewer } from './components/PDFViewer';

function AnnotatablePDF() {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  return (
    <div style={{ position: 'relative' }}>
      {/* PDF Canvas Layer */}
      <PDFViewer
        pdfUrl="/document.pdf"
        pageNumber={1}
        scale={1.5}
        onPageLoadComplete={setCanvasRef}
      />

      {/* Konva Annotation Layer (positioned over PDF) */}
      {canvasRef && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: canvasRef.style.width,
          height: canvasRef.style.height,
        }}>
          <Stage
            width={canvasRef.width / window.devicePixelRatio}
            height={canvasRef.height / window.devicePixelRatio}
          >
            <Layer>
              <Rect
                x={100}
                y={100}
                width={200}
                height={100}
                fill="rgba(255, 0, 0, 0.3)"
                stroke="red"
                strokeWidth={2}
              />
            </Layer>
          </Stage>
        </div>
      )}
    </div>
  );
}
```

## Testing

### Test with Local PDF File

1. Upload a PDF file using the file input in `PDFViewerDemo` component
2. The component will create a blob URL and load the PDF
3. Navigate between pages and test zoom controls

### Test with Remote PDF URL

```tsx
<PDFViewer
  pdfUrl="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
  pageNumber={1}
  scale={1.5}
/>
```

### Common Test PDFs

- Mozilla PDF.js Test PDF: `https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf`
- W3C Sample: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`

## Performance Considerations

### Memory Management
- PDF document is loaded once and cached in component state
- Changing pages re-renders without re-downloading the PDF
- Component automatically cleans up on unmount

### Optimization Tips
1. **Avoid re-rendering**: Memoize callbacks with `useCallback`
2. **Lazy loading**: Only load PDFs when needed
3. **Scale appropriately**: Higher scales = more memory/processing
4. **Cleanup blob URLs**: Remember to revoke blob URLs when done:
   ```tsx
   useEffect(() => {
     return () => {
       if (pdfUrl.startsWith('blob:')) {
         URL.revokeObjectURL(pdfUrl);
       }
     };
   }, [pdfUrl]);
   ```

## Troubleshooting

### PDF.js Worker Issues

If you see worker-related errors, ensure the worker is properly configured:

```tsx
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
```

### CORS Issues

If loading remote PDFs fails with CORS errors:
1. Ensure the server serves PDFs with proper CORS headers
2. Use a proxy server for cross-origin PDFs
3. Load PDFs via file upload instead

### Canvas Not Rendering

If the canvas appears blank:
1. Check browser console for errors
2. Verify the PDF URL is valid and accessible
3. Ensure the page number is valid (1-indexed)
4. Check if `onError` callback is being called

## File Structure

```
src/components/
├── PDFViewer.tsx           # Main component
├── PDFViewer.README.md     # This documentation
└── PDFViewerDemo.tsx       # Demo/example component
```

## TypeScript Types

The component exports the following types:

```tsx
export interface PDFViewerProps {
  pdfUrl: string;
  pageNumber: number;
  scale?: number;
  onPageLoadComplete?: (canvas: HTMLCanvasElement) => void;
  onError?: (error: Error) => void;
}
```

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Supported (may have performance limitations)

## Dependencies

- `react`: ^19.2.0
- `pdfjs-dist`: ^5.4.394
- `tailwindcss`: ^3.4.18

## License

Part of the Construction Cost Estimator project.
