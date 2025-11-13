# Store Architecture

This document describes the Zustand store architecture for the Construction Cost Estimator application.

## Overview

The application uses a single Zustand store (`useAppStore`) to manage all global state. The store is enhanced with middleware for:

- **Persistence**: State is saved to localStorage and restored on app reload
- **Immer**: Immutable state updates with mutable-style code
- **DevTools**: Redux DevTools integration for debugging

## State Structure

### Project Information
```typescript
currentProjectId: string;        // Unique identifier for current project
currentPageNumber: number;       // Currently viewed PDF page
```

### Calibration Data
```typescript
calibrationData: {
  referenceLength: number;       // Known length in meters (e.g., 3.6m)
  pixelDistance: number;         // Measured pixels for reference length
  metersPerPixel: number;        // Computed conversion factor
  isCalibrated: boolean;         // Whether calibration is complete
}
```

### Annotations
```typescript
annotations: Record<number, AnnotationData[]>;  // Annotations grouped by page
selectedAnnotationId: string | null;            // Currently selected annotation
```

Each annotation includes:
- Basic properties: `id`, `pageNumber`, `type`, `x`, `y`, `width`, `height`, `color`
- Measurement data: `lineLength`, `polygonArea`, `points`, `quantity`, `unit`
- Metadata: `labelId`, `notes`, `createdAt`, `updatedAt`

### Labels
```typescript
labels: LabelDefinition[];       // Available label definitions
selectedLabelId: string | null;  // Currently selected label
```

Each label includes:
- Basic properties: `id`, `name`, `color`, `description`, `icon`
- Cost data: `unit`, `costPerUnit`, `category`

### Cost Items
```typescript
costItems: CostItem[];           // Computed cost items from annotations
```

Each cost item includes:
- Identification: `id`, `description`, `category`
- Quantities: `quantity`, `unit`, `unitCost`, `totalCost`
- Relationships: `labelId`, `annotationId`, `pageNumber`

### UI State
```typescript
activeTool: 'select' | 'marker' | 'label' | 'line' | 'polygon' | 'calibrate' | null;
isPanMode: boolean;
currentZoom: number;            // 1.0 = 100%
currentPan: { x: number; y: number };
```

## Actions

### Calibration Actions

#### `setCalibrationData(data: Partial<CalibrationData>)`
Update calibration data partially.

```typescript
// Example: Set reference length
store.setCalibrationData({ referenceLength: 3.6 });
```

#### `computeCalibration(referenceLength: number, pixelDistance: number)`
Compute calibration from a known reference length and measured pixel distance.

```typescript
// Example: User measures a 3.6m wall as 120 pixels
store.computeCalibration(3.6, 120);
// Result: metersPerPixel = 0.03, isCalibrated = true
```

#### `resetCalibration()`
Clear calibration data.

```typescript
store.resetCalibration();
```

### Annotation Actions

#### `addAnnotation(annotation: AnnotationData)`
Add a new annotation to a page.

```typescript
const annotation: AnnotationData = {
  id: 'annotation-123',
  pageNumber: 1,
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 50,
  height: 30,
  color: '#3B82F6',
  labelId: 'label-windows',
  unit: 'count',
  createdAt: new Date(),
  updatedAt: new Date(),
};

store.addAnnotation(annotation);
```

#### `updateAnnotation(id: string, updates: Partial<AnnotationData>)`
Update an existing annotation.

```typescript
store.updateAnnotation('annotation-123', {
  color: '#EF4444',
  notes: 'Double-pane window',
});
```

#### `deleteAnnotation(id: string)`
Remove an annotation.

```typescript
store.deleteAnnotation('annotation-123');
```

#### `selectAnnotation(id: string | null)`
Select an annotation for editing (or deselect with null).

```typescript
store.selectAnnotation('annotation-123');
```

#### `clearAnnotations(pageNumber?: number)`
Clear annotations for a specific page or all pages.

```typescript
// Clear current page
store.clearAnnotations(1);

// Clear all pages
store.clearAnnotations();
```

#### `getAnnotationsByPage(pageNumber: number): AnnotationData[]`
Get all annotations for a specific page.

```typescript
const pageAnnotations = store.getAnnotationsByPage(1);
```

### Label Actions

#### `addLabel(label: LabelDefinition)`
Add a new label definition.

```typescript
const label: LabelDefinition = {
  id: 'label-custom-1',
  name: 'Custom Element',
  color: '#10B981',
  unit: 'square_meters',
  costPerUnit: 100,
  category: 'Custom',
  createdAt: new Date(),
};

store.addLabel(label);
```

#### `updateLabel(id: string, updates: Partial<LabelDefinition>)`
Update a label definition.

```typescript
store.updateLabel('label-windows', {
  costPerUnit: 600, // Update cost
});
```

#### `deleteLabel(id: string)`
Remove a label definition.

```typescript
store.deleteLabel('label-custom-1');
```

#### `selectLabel(id: string | null)`
Select a label for applying to annotations.

```typescript
store.selectLabel('label-windows');
```

#### `addPredefinedLabels(labels: LabelDefinition[])`
Bulk add predefined labels.

```typescript
import { PREDEFINED_LABELS } from './predefinedLabels';
store.addPredefinedLabels(PREDEFINED_LABELS);
```

### Cost Item Actions

#### `calculateCostItems()`
Compute cost items from all annotations. This is called automatically when annotations change.

```typescript
store.calculateCostItems();
```

#### `updateCostItem(id: string, updates: Partial<CostItem>)`
Manually adjust a cost item.

```typescript
store.updateCostItem('cost-label-windows', {
  unitCost: 650, // Override calculated cost
});
```

#### `getTotalCost(): number`
Get total project cost.

```typescript
const total = store.getTotalCost();
console.log(`Total Cost: $${total}`);
```

#### `getCostByCategory(): Record<string, number>`
Get costs grouped by category.

```typescript
const categories = store.getCostByCategory();
// { "Structure": 45000, "Openings": 15000, "MEP": 8000 }
```

### UI Actions

#### `setActiveTool(tool: string | null)`
Set the active drawing tool.

```typescript
store.setActiveTool('polygon'); // Start drawing polygon
store.setActiveTool(null);      // Deselect tool
```

#### `setPanMode(enabled: boolean)`
Toggle pan mode for navigation.

```typescript
store.setPanMode(true);  // Enable panning
store.setPanMode(false); // Disable panning
```

#### `setZoom(zoom: number)`
Set zoom level (clamped between 0.1 and 5.0).

```typescript
store.setZoom(1.5);  // 150% zoom
store.setZoom(0.5);  // 50% zoom
```

#### `setPan(pan: { x: number; y: number })`
Set pan offset.

```typescript
store.setPan({ x: 100, y: 50 });
```

#### `setCurrentPage(pageNumber: number)`
Navigate to a specific page.

```typescript
store.setCurrentPage(2); // Go to page 2
```

### Project Actions

#### `setCurrentProjectId(projectId: string)`
Set the active project.

```typescript
store.setCurrentProjectId('project-abc-123');
```

#### `resetState()`
Reset entire store to initial state.

```typescript
store.resetState(); // Clear all data
```

## Selectors

Pre-built selectors for common queries:

### `useCurrentPageAnnotations()`
Get annotations for the current page.

```typescript
const PageAnnotations = () => {
  const annotations = useCurrentPageAnnotations();
  return <div>{annotations.length} annotations</div>;
};
```

### `useSelectedAnnotation()`
Get the currently selected annotation.

```typescript
const AnnotationEditor = () => {
  const annotation = useSelectedAnnotation();
  if (!annotation) return null;
  return <div>Edit: {annotation.id}</div>;
};
```

### `useSelectedLabel()`
Get the currently selected label.

```typescript
const LabelInfo = () => {
  const label = useSelectedLabel();
  return <div>Active Label: {label?.name}</div>;
};
```

### `useIsCalibrated()`
Check if calibration is complete.

```typescript
const CalibrationStatus = () => {
  const isCalibrated = useIsCalibrated();
  return <div>{isCalibrated ? 'Calibrated' : 'Not Calibrated'}</div>;
};
```

### `useTotalAnnotationCount()`
Get total annotations across all pages.

```typescript
const AnnotationCount = () => {
  const count = useTotalAnnotationCount();
  return <div>Total Annotations: {count}</div>;
};
```

### `useCostsByCategory()`
Get costs grouped by category.

```typescript
const CategoryCosts = () => {
  const costs = useCostsByCategory();
  return (
    <ul>
      {Object.entries(costs).map(([category, cost]) => (
        <li key={category}>{category}: ${cost}</li>
      ))}
    </ul>
  );
};
```

## Usage Examples

### Complete Workflow Example

```typescript
import { useAppStore } from './store/useAppStore';

function AnnotationWorkflow() {
  const store = useAppStore();

  // 1. Calibrate the drawing
  const handleCalibrate = () => {
    // User measures a 3.6m wall as 120 pixels
    store.computeCalibration(3.6, 120);
  };

  // 2. Add a window annotation
  const handleAddWindow = () => {
    const annotation: AnnotationData = {
      id: `annotation-${Date.now()}`,
      pageNumber: store.currentPageNumber,
      type: 'rectangle',
      x: 200,
      y: 150,
      width: 40,
      height: 60,
      color: '#3B82F6',
      labelId: 'label-windows',
      unit: 'count',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.addAnnotation(annotation);
    // Cost items are automatically recalculated
  };

  // 3. View total cost
  const totalCost = store.getTotalCost();

  return (
    <div>
      <button onClick={handleCalibrate}>Calibrate</button>
      <button onClick={handleAddWindow}>Add Window</button>
      <div>Total Cost: ${totalCost}</div>
    </div>
  );
}
```

### Persistence Example

```typescript
// State is automatically persisted to localStorage
// On app reload, state is restored

function AppInitializer() {
  const store = useAppStore();

  useEffect(() => {
    // Check if we have a project loaded
    if (store.currentProjectId) {
      console.log('Restored project:', store.currentProjectId);
      console.log('Annotations:', store.annotations);
      console.log('Calibration:', store.calibrationData);
    }
  }, []);

  return <div>App Ready</div>;
}
```

### Cost Calculation Example

```typescript
function CostSummary() {
  const store = useAppStore();
  const totalCost = store.getTotalCost();
  const categoryCosts = store.getCostByCategory();

  return (
    <div>
      <h2>Cost Summary</h2>

      <div>
        <h3>By Category</h3>
        {Object.entries(categoryCosts).map(([category, cost]) => (
          <div key={category}>
            {category}: ${cost.toFixed(2)}
          </div>
        ))}
      </div>

      <div>
        <h3>Total: ${totalCost.toFixed(2)}</h3>
      </div>
    </div>
  );
}
```

## Performance Considerations

### Efficient Updates

The store uses Immer middleware, which allows for mutable-style updates while maintaining immutability:

```typescript
// ❌ Manual immutable update (verbose)
set({
  annotations: {
    ...state.annotations,
    [pageNumber]: [
      ...state.annotations[pageNumber],
      newAnnotation
    ]
  }
});

// ✅ Immer-style update (simple)
set((state) => {
  state.annotations[pageNumber].push(newAnnotation);
});
```

### Selective Subscriptions

Only subscribe to the specific state you need:

```typescript
// ❌ Subscribes to entire store (re-renders on any change)
const store = useAppStore();

// ✅ Subscribes only to zoom (re-renders only when zoom changes)
const zoom = useAppStore(state => state.currentZoom);
```

### Batched Updates

Multiple actions can be chained efficiently:

```typescript
// Updates are batched automatically
store.addAnnotation(annotation1);
store.addAnnotation(annotation2);
store.addAnnotation(annotation3);
// Only one recalculation of cost items
```

## Integration with Components

### PDFViewerWithZoom Integration

```typescript
function PDFViewerWithZoom() {
  const currentPage = useAppStore(state => state.currentPageNumber);
  const zoom = useAppStore(state => state.currentZoom);
  const pan = useAppStore(state => state.currentPan);
  const annotations = useCurrentPageAnnotations();

  const { setZoom, setPan, setCurrentPage } = useAppStore();

  return (
    <PDFViewer
      page={currentPage}
      zoom={zoom}
      pan={pan}
      annotations={annotations}
      onZoomChange={setZoom}
      onPanChange={setPan}
      onPageChange={setCurrentPage}
    />
  );
}
```

### Toolbar Integration

```typescript
function Toolbar() {
  const activeTool = useAppStore(state => state.activeTool);
  const { setActiveTool } = useAppStore();

  return (
    <div>
      <button
        onClick={() => setActiveTool('line')}
        className={activeTool === 'line' ? 'active' : ''}
      >
        Line Tool
      </button>
      <button
        onClick={() => setActiveTool('polygon')}
        className={activeTool === 'polygon' ? 'active' : ''}
      >
        Polygon Tool
      </button>
    </div>
  );
}
```

## Testing

### Mock Store for Tests

```typescript
import { create } from 'zustand';

// Create a mock store for testing
const createMockStore = (initialState = {}) => {
  return create(() => ({
    ...initialState,
    // Add mock actions
    addAnnotation: vi.fn(),
    updateAnnotation: vi.fn(),
    // ... etc
  }));
};

// Use in tests
test('adds annotation', () => {
  const store = createMockStore({
    annotations: {},
    currentPageNumber: 1,
  });

  store.addAnnotation(mockAnnotation);
  expect(store.addAnnotation).toHaveBeenCalled();
});
```

## Troubleshooting

### State Not Persisting

Check localStorage quota and permissions:

```typescript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available:', e);
}
```

### Cost Items Not Updating

Ensure calibration is complete:

```typescript
const isCalibrated = useAppStore(state => state.calibrationData.isCalibrated);
if (!isCalibrated) {
  console.warn('Cannot calculate costs without calibration');
}
```

### Memory Leaks

Always use selectors or subscribe/unsubscribe properly:

```typescript
// ✅ React hook (auto-unsubscribes)
const zoom = useAppStore(state => state.currentZoom);

// ✅ Manual subscription (must unsubscribe)
const unsubscribe = useAppStore.subscribe(
  state => state.currentZoom,
  (zoom) => console.log('Zoom:', zoom)
);
// Call unsubscribe() when done
```

## Future Enhancements

Potential additions to the store:

- Undo/redo functionality
- Multi-user collaboration state
- Export/import state to JSON
- Annotation history/versioning
- Performance metrics tracking
- Background auto-save to server

---

For questions or issues, consult the [Zustand documentation](https://docs.pmnd.rs/zustand/getting-started/introduction) or create an issue in the project repository.
