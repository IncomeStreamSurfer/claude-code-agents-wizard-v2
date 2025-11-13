# Store Integration Guide

This guide shows how to integrate the Zustand store with your existing components.

## Quick Start

### 1. Import the Store

```typescript
import { useAppStore } from './store/useAppStore';
```

### 2. Use in Components

```typescript
function MyComponent() {
  // Select specific state
  const zoom = useAppStore(state => state.currentZoom);

  // Select actions
  const setZoom = useAppStore(state => state.setZoom);

  // Use in your component
  return <button onClick={() => setZoom(zoom + 0.1)}>Zoom In</button>;
}
```

## Integration with Existing Components

### PDFViewerWithZoom Component

If you have a PDF viewer component, integrate the store like this:

```typescript
import { useAppStore, useCurrentPageAnnotations } from './store/useAppStore';

function PDFViewerWithZoom({ pdfDocument }: { pdfDocument: any }) {
  // Get state from store
  const currentPage = useAppStore(state => state.currentPageNumber);
  const zoom = useAppStore(state => state.currentZoom);
  const pan = useAppStore(state => state.currentPan);
  const annotations = useCurrentPageAnnotations();

  // Get actions from store
  const { setZoom, setPan, setCurrentPage } = useAppStore();

  // Render PDF with store state
  return (
    <div>
      <PDFCanvas
        page={currentPage}
        zoom={zoom}
        pan={pan}
        onZoomChange={setZoom}
        onPanChange={setPan}
      />

      <AnnotationLayer annotations={annotations} />
    </div>
  );
}
```

### Toolbar Component

Create a toolbar that controls the active tool:

```typescript
import { useAppStore } from './store/useAppStore';

function Toolbar() {
  const activeTool = useAppStore(state => state.activeTool);
  const setActiveTool = useAppStore(state => state.setActiveTool);

  return (
    <div className="toolbar">
      <button
        className={activeTool === 'select' ? 'active' : ''}
        onClick={() => setActiveTool('select')}
      >
        Select
      </button>

      <button
        className={activeTool === 'line' ? 'active' : ''}
        onClick={() => setActiveTool('line')}
      >
        Measure Line
      </button>

      <button
        className={activeTool === 'polygon' ? 'active' : ''}
        onClick={() => setActiveTool('polygon')}
      >
        Measure Area
      </button>
    </div>
  );
}
```

### Annotation Canvas Integration

When user draws annotations, add them to the store:

```typescript
import { useAppStore } from './store/useAppStore';
import { AnnotationData } from './types/store';
import { generateAnnotationId } from './store/storeHelpers';

function AnnotationCanvas() {
  const currentPage = useAppStore(state => state.currentPageNumber);
  const activeTool = useAppStore(state => state.activeTool);
  const selectedLabelId = useAppStore(state => state.selectedLabelId);
  const addAnnotation = useAppStore(state => state.addAnnotation);

  const handleCanvasClick = (x: number, y: number) => {
    if (activeTool === 'marker') {
      // Create a marker annotation
      const annotation: AnnotationData = {
        id: generateAnnotationId(),
        pageNumber: currentPage,
        type: 'rectangle',
        x: x - 10, // Center the marker
        y: y - 10,
        width: 20,
        height: 20,
        color: '#3B82F6',
        labelId: selectedLabelId || undefined,
        unit: 'count',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addAnnotation(annotation);
    }
  };

  return (
    <canvas onClick={(e) => handleCanvasClick(e.clientX, e.clientY)} />
  );
}
```

### Sidebar Components

Create sidebar components for labels, annotations, and cost summary:

```typescript
// LabelsSidebar.tsx
import { useAppStore } from './store/useAppStore';

export function LabelsSidebar() {
  const labels = useAppStore(state => state.labels);
  const selectedLabelId = useAppStore(state => state.selectedLabelId);
  const selectLabel = useAppStore(state => state.selectLabel);

  return (
    <aside className="labels-sidebar">
      <h2>Labels</h2>
      {labels.map(label => (
        <button
          key={label.id}
          className={selectedLabelId === label.id ? 'selected' : ''}
          style={{ borderLeftColor: label.color }}
          onClick={() => selectLabel(label.id)}
        >
          <span>{label.icon} {label.name}</span>
          <span>${label.costPerUnit}/{label.unit}</span>
        </button>
      ))}
    </aside>
  );
}

// AnnotationsSidebar.tsx
import { useCurrentPageAnnotations } from './store/useAppStore';

export function AnnotationsSidebar() {
  const annotations = useCurrentPageAnnotations();
  const selectAnnotation = useAppStore(state => state.selectAnnotation);
  const deleteAnnotation = useAppStore(state => state.deleteAnnotation);

  return (
    <aside className="annotations-sidebar">
      <h2>Annotations</h2>
      <ul>
        {annotations.map(annotation => (
          <li key={annotation.id}>
            <button onClick={() => selectAnnotation(annotation.id)}>
              {annotation.type} - {annotation.labelId}
            </button>
            <button onClick={() => deleteAnnotation(annotation.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// CostSummarySidebar.tsx
import { useAppStore } from './store/useAppStore';

export function CostSummarySidebar() {
  const costItems = useAppStore(state => state.costItems);
  const getTotalCost = useAppStore(state => state.getTotalCost);

  const total = getTotalCost();

  return (
    <aside className="cost-sidebar">
      <h2>Cost Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {costItems.map(item => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.quantity.toFixed(2)} {item.unit}</td>
              <td>${item.totalCost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>
    </aside>
  );
}
```

## App.tsx Integration

Update your main App component to use the store:

```typescript
import { useAppStore } from './store/useAppStore';
import { PREDEFINED_LABELS } from './store/predefinedLabels';
import { useEffect } from 'react';

function App() {
  const currentProjectId = useAppStore(state => state.currentProjectId);
  const labels = useAppStore(state => state.labels);
  const setCurrentProjectId = useAppStore(state => state.setCurrentProjectId);
  const addPredefinedLabels = useAppStore(state => state.addPredefinedLabels);

  // Initialize on first load
  useEffect(() => {
    // Create a project ID if none exists
    if (!currentProjectId) {
      const newProjectId = `project-${Date.now()}`;
      setCurrentProjectId(newProjectId);
    }

    // Add predefined labels if none exist
    if (labels.length === 0) {
      addPredefinedLabels(PREDEFINED_LABELS);
    }
  }, []);

  return (
    <div className="app">
      <Toolbar />
      <div className="main-content">
        <LabelsSidebar />
        <PDFViewerWithZoom />
        <AnnotationsSidebar />
      </div>
      <CostSummarySidebar />
    </div>
  );
}

export default App;
```

## Calibration Workflow

Implement a calibration workflow:

```typescript
import { useAppStore } from './store/useAppStore';
import { useState } from 'react';

function CalibrationModal({ onClose }: { onClose: () => void }) {
  const computeCalibration = useAppStore(state => state.computeCalibration);
  const [step, setStep] = useState(1);
  const [referenceLength, setReferenceLength] = useState(3.6);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [endPoint, setEndPoint] = useState<{x: number, y: number} | null>(null);

  const handleCanvasClick = (x: number, y: number) => {
    if (step === 2 && !startPoint) {
      setStartPoint({ x, y });
      setStep(3);
    } else if (step === 3 && startPoint && !endPoint) {
      setEndPoint({ x, y });

      // Calculate pixel distance
      const dx = x - startPoint.x;
      const dy = y - startPoint.y;
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);

      // Compute calibration
      computeCalibration(referenceLength, pixelDistance);

      onClose();
    }
  };

  return (
    <div className="calibration-modal">
      {step === 1 && (
        <div>
          <h2>Step 1: Enter Reference Length</h2>
          <p>Enter a known measurement from your drawing (in meters)</p>
          <input
            type="number"
            value={referenceLength}
            onChange={(e) => setReferenceLength(parseFloat(e.target.value))}
            step="0.1"
          />
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Click Start Point</h2>
          <p>Click the starting point of your reference measurement</p>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3: Click End Point</h2>
          <p>Click the ending point of your reference measurement</p>
        </div>
      )}

      <canvas onClick={(e) => handleCanvasClick(e.clientX, e.clientY)} />
    </div>
  );
}
```

## Event Handlers

### Handle Drawing Events

```typescript
function DrawingCanvas() {
  const activeTool = useAppStore(state => state.activeTool);
  const currentPage = useAppStore(state => state.currentPageNumber);
  const selectedLabelId = useAppStore(state => state.selectedLabelId);
  const addAnnotation = useAppStore(state => state.addAnnotation);

  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'line' || activeTool === 'polygon') {
      setIsDrawing(true);
      setPoints([{ x: e.clientX, y: e.clientY }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      setPoints([...points, { x: e.clientX, y: e.clientY }]);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && points.length > 1) {
      // Create annotation from points
      const annotation = createAnnotationFromPoints(
        points,
        activeTool,
        currentPage,
        selectedLabelId
      );

      addAnnotation(annotation);
      setIsDrawing(false);
      setPoints([]);
    }
  };

  return (
    <canvas
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}
```

## State Persistence

The store automatically persists to localStorage. To customize:

```typescript
// In useAppStore.ts, modify the persist config:
persist(
  // ... store implementation
  {
    name: 'my-custom-storage-key',
    partialize: (state) => ({
      // Only persist these fields
      currentProjectId: state.currentProjectId,
      annotations: state.annotations,
      labels: state.labels,
    }),
    // Optional: custom storage
    storage: {
      getItem: (name) => {
        const str = localStorage.getItem(name);
        return str ? JSON.parse(str) : null;
      },
      setItem: (name, value) => {
        localStorage.setItem(name, JSON.stringify(value));
      },
      removeItem: (name) => {
        localStorage.removeItem(name);
      },
    },
  }
)
```

## Testing

### Mock Store for Tests

```typescript
// test-utils.tsx
import { create } from 'zustand';
import { AppState } from './types/store';

export function createMockStore(initialState: Partial<AppState> = {}) {
  return create<AppState>(() => ({
    // Default state
    currentProjectId: '',
    currentPageNumber: 1,
    annotations: {},
    labels: [],
    // ... other defaults

    // Override with initial state
    ...initialState,

    // Mock actions
    addAnnotation: vi.fn(),
    updateAnnotation: vi.fn(),
    deleteAnnotation: vi.fn(),
    // ... other actions
  }));
}

// In tests
import { createMockStore } from './test-utils';

test('adds annotation', () => {
  const mockStore = createMockStore({
    currentPageNumber: 1,
    annotations: {},
  });

  const { addAnnotation } = mockStore.getState();
  addAnnotation(mockAnnotation);

  expect(addAnnotation).toHaveBeenCalledWith(mockAnnotation);
});
```

## Performance Tips

1. **Select only what you need**:
   ```typescript
   // ❌ Bad - re-renders on any state change
   const store = useAppStore();

   // ✅ Good - re-renders only when zoom changes
   const zoom = useAppStore(state => state.currentZoom);
   ```

2. **Use selectors for computed values**:
   ```typescript
   // ✅ Use pre-built selectors
   const annotations = useCurrentPageAnnotations();
   const isCalibrated = useIsCalibrated();
   ```

3. **Batch related actions**:
   ```typescript
   // Store automatically batches updates
   store.addAnnotation(annotation1);
   store.addAnnotation(annotation2);
   // Only one cost recalculation happens
   ```

## Troubleshooting

### State not updating

Make sure you're using the Immer-style updates in the store implementation:

```typescript
set((state) => {
  state.zoom = newZoom; // ✅ Immer handles immutability
});
```

### Cost items not calculating

Ensure calibration is set before adding annotations:

```typescript
const isCalibrated = useIsCalibrated();
if (!isCalibrated) {
  // Show calibration modal
}
```

### LocalStorage quota exceeded

Clear old data or implement cleanup:

```typescript
// Clear old projects
const clearOldData = () => {
  localStorage.removeItem('construction-cost-estimator-storage');
  useAppStore.getState().resetState();
};
```

## Next Steps

1. Integrate the store with your PDF viewer component
2. Create annotation drawing tools
3. Build the cost summary dashboard
4. Add export/import functionality
5. Implement undo/redo (consider zustand-middleware-undo)

For more examples, see `/src/store/examples.tsx`.
