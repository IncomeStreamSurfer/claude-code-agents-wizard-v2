# PDFViewerWithZoom - Usage Examples

## Quick Start

### Basic Implementation

The simplest way to use PDFViewerWithZoom:

```tsx
import { PDFViewerWithZoom } from './components';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PDFViewerWithZoom
        pdfUrl="/sample.pdf"
        pageNumber={1}
      />
    </div>
  );
}
```

## Common Use Cases

### 1. File Upload with Zoom Controls

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components';

function PDFUploadViewer() {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pageNumber, setPageNumber] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-white border-b">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-2"
        />
        <div className="flex gap-2">
          <button onClick={() => setPageNumber(p => Math.max(1, p - 1))}>
            Previous
          </button>
          <span>Page {pageNumber}</span>
          <button onClick={() => setPageNumber(p => p + 1)}>
            Next
          </button>
        </div>
      </div>
      <div className="flex-1">
        {pdfUrl && (
          <PDFViewerWithZoom
            pdfUrl={pdfUrl}
            pageNumber={pageNumber}
            scale={1.5}
          />
        )}
      </div>
    </div>
  );
}
```

### 2. With Annotations and State Management

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components';
import type { AnnotationData } from './components';

function AnnotatedPDFViewer() {
  const [annotations, setAnnotations] = useState<AnnotationData[]>([
    {
      id: '1',
      type: 'marker',
      x: 0.5,
      y: 0.5,
      color: '#FF6B6B',
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addAnnotation = () => {
    const newAnnotation: AnnotationData = {
      id: Date.now().toString(),
      type: 'label',
      x: Math.random(),
      y: Math.random(),
      text: 'New Label',
      color: '#4ECDC4',
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setAnnotations(annotations.filter(a => a.id !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div className="h-screen flex">
      <div className="w-64 p-4 bg-gray-100 border-r">
        <h3 className="font-bold mb-4">Annotations</h3>
        <button
          onClick={addAnnotation}
          className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Label
        </button>
        <button
          onClick={deleteSelected}
          disabled={!selectedId}
          className="w-full px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Delete Selected
        </button>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Total: {annotations.length} annotations
          </p>
          {selectedId && (
            <p className="text-sm text-blue-600">
              Selected: {selectedId}
            </p>
          )}
        </div>
      </div>
      <div className="flex-1">
        <PDFViewerWithZoom
          pdfUrl="/document.pdf"
          pageNumber={1}
          annotations={annotations}
          onAnnotationChange={setAnnotations}
          onSelectionChange={setSelectedId}
        />
      </div>
    </div>
  );
}
```

### 3. Construction Blueprint Viewer

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components';
import type { AnnotationData } from './components';

interface Measurement {
  id: string;
  label: string;
  length: number;
  unit: string;
}

function BlueprintViewer() {
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [zoom, setZoom] = useState(1);

  const addMeasurement = (annotation: AnnotationData) => {
    // Calculate length from line annotation
    if (annotation.type === 'line' && annotation.points) {
      const [p1, p2] = annotation.points;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy) * 100; // Example conversion

      const measurement: Measurement = {
        id: annotation.id,
        label: annotation.text || 'Measurement',
        length: Math.round(length * 10) / 10,
        unit: 'ft',
      };

      setMeasurements([...measurements, measurement]);
    }
  };

  return (
    <div className="h-screen flex">
      <div className="w-80 p-4 bg-white border-r overflow-auto">
        <h3 className="font-bold text-lg mb-4">Measurements</h3>

        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">Current Zoom</div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        <div className="space-y-2">
          {measurements.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-gray-50 rounded border border-gray-200"
            >
              <div className="font-medium">{m.label}</div>
              <div className="text-lg text-blue-600">
                {m.length} {m.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <PDFViewerWithZoom
          pdfUrl="/blueprint.pdf"
          pageNumber={1}
          scale={2}
          minZoom={0.5}
          maxZoom={5}
          annotations={annotations}
          onAnnotationChange={(newAnnotations) => {
            setAnnotations(newAnnotations);
            // Check if new line was added
            const newLine = newAnnotations.find(
              a => a.type === 'line' && !measurements.find(m => m.id === a.id)
            );
            if (newLine) {
              addMeasurement(newLine);
            }
          }}
          onZoomChange={setZoom}
        />
      </div>
    </div>
  );
}
```

### 4. Multi-Page Document Viewer

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components';

function MultiPageViewer() {
  const [pdfUrl] = useState('/document.pdf');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageAnnotations, setPageAnnotations] = useState<
    Record<number, AnnotationData[]>
  >({});

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const currentAnnotations = pageAnnotations[currentPage] || [];

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>

          <div className="text-center">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => handlePageChange(parseInt(e.target.value))}
              className="w-20 px-2 py-1 border rounded text-center"
              min={1}
              max={totalPages}
            />
            <span className="mx-2">of {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1">
        <PDFViewerWithZoom
          pdfUrl={pdfUrl}
          pageNumber={currentPage}
          annotations={currentAnnotations}
          onAnnotationChange={(newAnnotations) => {
            setPageAnnotations({
              ...pageAnnotations,
              [currentPage]: newAnnotations,
            });
          }}
        />
      </div>
    </div>
  );
}
```

### 5. With Custom Zoom Controls

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components';

function CustomControlsViewer() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const presetZooms = [0.5, 0.75, 1, 1.5, 2, 2.5, 3];

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">Preset Zoom:</span>
          {presetZooms.map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`px-3 py-1 rounded ${
                zoom === z
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {Math.round(z * 100)}%
            </button>
          ))}
        </div>

        <div className="mt-2 text-sm text-gray-600">
          Pan: X={Math.round(pan.x)}, Y={Math.round(pan.y)}
        </div>
      </div>

      <div className="flex-1">
        <PDFViewerWithZoom
          pdfUrl="/document.pdf"
          pageNumber={1}
          onZoomChange={setZoom}
          onPanChange={setPan}
        />
      </div>
    </div>
  );
}
```

## Integration with Zustand (State Management)

```tsx
import { create } from 'zustand';
import { PDFViewerWithZoom } from './components';
import type { AnnotationData } from './components';

interface PDFStore {
  pdfUrl: string;
  pageNumber: number;
  annotations: AnnotationData[];
  zoom: number;
  pan: { x: number; y: number };
  setPdfUrl: (url: string) => void;
  setPageNumber: (page: number) => void;
  setAnnotations: (annotations: AnnotationData[]) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
}

const usePDFStore = create<PDFStore>((set) => ({
  pdfUrl: '',
  pageNumber: 1,
  annotations: [],
  zoom: 1,
  pan: { x: 0, y: 0 },
  setPdfUrl: (url) => set({ pdfUrl: url, pageNumber: 1 }),
  setPageNumber: (page) => set({ pageNumber: page }),
  setAnnotations: (annotations) => set({ annotations }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
}));

function ZustandPDFViewer() {
  const {
    pdfUrl,
    pageNumber,
    annotations,
    setAnnotations,
    setZoom,
    setPan,
  } = usePDFStore();

  return (
    <div className="h-screen">
      {pdfUrl && (
        <PDFViewerWithZoom
          pdfUrl={pdfUrl}
          pageNumber={pageNumber}
          annotations={annotations}
          onAnnotationChange={setAnnotations}
          onZoomChange={setZoom}
          onPanChange={setPan}
        />
      )}
    </div>
  );
}
```

## Performance Tips

### 1. Memoize Callbacks

```tsx
import { useCallback, useState } from 'react';
import { PDFViewerWithZoom } from './components';
import type { AnnotationData } from './components';

function OptimizedViewer() {
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);

  const handleAnnotationChange = useCallback((newAnnotations: AnnotationData[]) => {
    setAnnotations(newAnnotations);
    // Persist to backend, etc.
  }, []);

  return (
    <PDFViewerWithZoom
      pdfUrl="/document.pdf"
      pageNumber={1}
      annotations={annotations}
      onAnnotationChange={handleAnnotationChange}
    />
  );
}
```

### 2. Clean Up Object URLs

```tsx
import { useEffect, useState } from 'react';
import { PDFViewerWithZoom } from './components';

function CleanURLViewer() {
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  };

  // Clean up blob URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <PDFViewerWithZoom
      pdfUrl={pdfUrl}
      pageNumber={1}
    />
  );
}
```

## Error Handling

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components';

function ErrorHandlingViewer() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: Error) => {
    console.error('PDF Error:', err);
    setError(err.message);
  };

  return (
    <div className="h-screen flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          <strong>Error: </strong>
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex-1">
        <PDFViewerWithZoom
          pdfUrl="/document.pdf"
          pageNumber={1}
          onError={handleError}
        />
      </div>
    </div>
  );
}
```

## Testing

Example test setup with React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { PDFViewerWithZoom } from './components';

describe('PDFViewerWithZoom', () => {
  it('renders zoom controls', () => {
    render(
      <PDFViewerWithZoom
        pdfUrl="/test.pdf"
        pageNumber={1}
      />
    );

    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset zoom')).toBeInTheDocument();
  });
});
```

## Next Steps

1. Check out the [README](./PDFViewerWithZoom.README.md) for complete documentation
2. Run the demo: `npm run dev` and navigate to the PDFViewerWithZoomDemo
3. Explore the [AnnotationStage](./AnnotationStage.tsx) for annotation features
4. Review keyboard shortcuts in the component UI

## Questions?

For issues or questions, refer to the main project documentation or check the component source code with detailed inline comments.
