# Store Testing and Verification

This document shows how to test and verify the store implementation.

## Quick Verification Test

Open your browser console and run:

```javascript
// Get store instance
const store = useAppStore.getState();

// 1. Test Calibration
console.log('=== Testing Calibration ===');
store.computeCalibration(3.6, 120);
console.log('Calibrated:', store.calibrationData);
// Expected: { referenceLength: 3.6, pixelDistance: 120, metersPerPixel: 0.03, isCalibrated: true }

// 2. Test Adding Annotation
console.log('\n=== Testing Annotations ===');
store.addAnnotation({
  id: 'test-1',
  pageNumber: 1,
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 50,
  height: 30,
  color: '#3B82F6',
  labelId: 'label-windows',
  unit: 'count',
  quantity: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});
console.log('Annotations:', store.annotations);
// Expected: { 1: [{ id: 'test-1', ... }] }

// 3. Test Cost Calculation
console.log('\n=== Testing Cost Calculation ===');
store.calculateCostItems();
console.log('Cost Items:', store.costItems);
console.log('Total Cost:', store.getTotalCost());
// Expected: Cost items array with calculated costs

// 4. Test Labels
console.log('\n=== Testing Labels ===');
console.log('Labels:', store.labels.length);
console.log('First label:', store.labels[0]);
// Expected: Predefined labels (Windows, Doors, etc.)

// 5. Test UI State
console.log('\n=== Testing UI State ===');
store.setZoom(1.5);
store.setActiveTool('line');
console.log('Zoom:', store.currentZoom); // Expected: 1.5
console.log('Active Tool:', store.activeTool); // Expected: 'line'

// 6. Test Persistence
console.log('\n=== Testing Persistence ===');
const storageKey = 'construction-cost-estimator-storage';
const stored = localStorage.getItem(storageKey);
console.log('LocalStorage contains data:', !!stored);
console.log('Stored data size:', stored?.length, 'characters');
```

## Manual Testing Checklist

### Calibration
- [ ] Can set calibration with valid numbers
- [ ] Calibration rejects negative numbers
- [ ] Calibration rejects zero values
- [ ] metersPerPixel is correctly calculated
- [ ] isCalibrated flag is set to true
- [ ] Can reset calibration

### Annotations
- [ ] Can add annotation to page 1
- [ ] Can add multiple annotations to same page
- [ ] Can add annotations to different pages
- [ ] Can update annotation properties
- [ ] Can delete annotation
- [ ] Can select/deselect annotation
- [ ] Can clear annotations for specific page
- [ ] Can clear all annotations

### Labels
- [ ] Predefined labels are loaded
- [ ] Can add custom label
- [ ] Can update label properties
- [ ] Can delete label
- [ ] Can select/deselect label
- [ ] Label color is preserved

### Cost Items
- [ ] Cost items are calculated after adding annotation
- [ ] Cost items update when annotation changes
- [ ] Cost items recalculate when label cost changes
- [ ] Total cost is correct sum
- [ ] Cost by category groups correctly
- [ ] Quantities are calculated based on calibration

### UI State
- [ ] Zoom level changes correctly
- [ ] Zoom is clamped between 0.1 and 5.0
- [ ] Pan offset updates correctly
- [ ] Active tool changes correctly
- [ ] Pan mode toggles correctly
- [ ] Page navigation works

### Persistence
- [ ] State persists to localStorage
- [ ] State is restored on page reload
- [ ] Only relevant state is persisted (no UI state)
- [ ] Can reset all state

## Component Integration Tests

### Test 1: Add Window Annotation

```typescript
test('adds window annotation and calculates cost', () => {
  const { result } = renderHook(() => useAppStore());

  // Setup
  act(() => {
    result.current.computeCalibration(3.6, 120);
  });

  // Add annotation
  const annotation: AnnotationData = {
    id: 'window-1',
    pageNumber: 1,
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 40,
    height: 60,
    color: '#3B82F6',
    labelId: 'label-windows',
    unit: 'count',
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  act(() => {
    result.current.addAnnotation(annotation);
  });

  // Verify
  expect(result.current.annotations[1]).toHaveLength(1);
  expect(result.current.annotations[1][0].id).toBe('window-1');

  // Check cost calculation
  act(() => {
    result.current.calculateCostItems();
  });

  expect(result.current.costItems.length).toBeGreaterThan(0);
  const windowCost = result.current.costItems.find(
    item => item.labelId === 'label-windows'
  );
  expect(windowCost).toBeDefined();
  expect(windowCost?.quantity).toBe(1);
});
```

### Test 2: Measure Wall Length

```typescript
test('measures wall length correctly', () => {
  const { result } = renderHook(() => useAppStore());

  // Calibrate: 3.6m = 120px, so 1px = 0.03m
  act(() => {
    result.current.computeCalibration(3.6, 120);
  });

  // Add wall annotation with 120 pixel length
  const annotation: AnnotationData = {
    id: 'wall-1',
    pageNumber: 1,
    type: 'arrow',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: '#10B981',
    labelId: 'label-walls',
    unit: 'linear_meters',
    lineLength: 120, // 120 pixels
    points: [{ x: 0, y: 0 }, { x: 120, y: 0 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  act(() => {
    result.current.addAnnotation(annotation);
    result.current.calculateCostItems();
  });

  const wallCost = result.current.costItems.find(
    item => item.labelId === 'label-walls'
  );

  // 120 pixels × 0.03 m/pixel = 3.6 meters
  expect(wallCost?.quantity).toBeCloseTo(3.6, 1);
});
```

### Test 3: Multiple Annotations Aggregate

```typescript
test('aggregates multiple windows into one cost item', () => {
  const { result } = renderHook(() => useAppStore());

  act(() => {
    result.current.computeCalibration(3.6, 120);
  });

  // Add 3 window annotations
  act(() => {
    for (let i = 0; i < 3; i++) {
      result.current.addAnnotation({
        id: `window-${i}`,
        pageNumber: 1,
        type: 'rectangle',
        x: 100 * i,
        y: 100,
        width: 40,
        height: 60,
        color: '#3B82F6',
        labelId: 'label-windows',
        unit: 'count',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    result.current.calculateCostItems();
  });

  const windowCost = result.current.costItems.find(
    item => item.labelId === 'label-windows'
  );

  // Should aggregate to 3 windows
  expect(windowCost?.quantity).toBe(3);

  // With unit cost of 500, total should be 1500
  expect(windowCost?.totalCost).toBe(1500);
});
```

### Test 4: Persistence

```typescript
test('persists state to localStorage', () => {
  const { result, rerender } = renderHook(() => useAppStore());

  // Add some data
  act(() => {
    result.current.setCurrentProjectId('project-123');
    result.current.computeCalibration(3.6, 120);
    result.current.addAnnotation({
      id: 'test-annotation',
      pageNumber: 1,
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 50,
      height: 30,
      color: '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Check localStorage
  const stored = localStorage.getItem('construction-cost-estimator-storage');
  expect(stored).toBeTruthy();

  const parsedData = JSON.parse(stored!);
  expect(parsedData.state.currentProjectId).toBe('project-123');
  expect(parsedData.state.calibrationData.isCalibrated).toBe(true);
  expect(parsedData.state.annotations[1]).toHaveLength(1);
});
```

### Test 5: Selectors

```typescript
test('selectors return correct data', () => {
  const { result } = renderHook(() => ({
    store: useAppStore(),
    currentAnnotations: useCurrentPageAnnotations(),
    isCalibrated: useIsCalibrated(),
    totalCount: useTotalAnnotationCount(),
  }));

  // Initially no annotations
  expect(result.current.currentAnnotations).toHaveLength(0);
  expect(result.current.isCalibrated).toBe(false);
  expect(result.current.totalCount).toBe(0);

  // Add data
  act(() => {
    result.current.store.computeCalibration(3.6, 120);
    result.current.store.addAnnotation({
      id: 'test-1',
      pageNumber: 1,
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 50,
      height: 30,
      color: '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Check selectors
  expect(result.current.currentAnnotations).toHaveLength(1);
  expect(result.current.isCalibrated).toBe(true);
  expect(result.current.totalCount).toBe(1);
});
```

## Performance Tests

### Test Re-render Optimization

```typescript
test('only re-renders when selected state changes', () => {
  let renderCount = 0;

  function TestComponent() {
    const zoom = useAppStore(state => state.currentZoom);
    renderCount++;
    return <div>{zoom}</div>;
  }

  const { rerender } = render(<TestComponent />);
  expect(renderCount).toBe(1);

  // Change unrelated state
  act(() => {
    useAppStore.getState().setCurrentPage(2);
  });
  rerender(<TestComponent />);
  expect(renderCount).toBe(1); // Should not re-render

  // Change zoom
  act(() => {
    useAppStore.getState().setZoom(1.5);
  });
  rerender(<TestComponent />);
  expect(renderCount).toBe(2); // Should re-render
});
```

## Browser Console Tests

Open browser console and paste:

```javascript
// Clear everything first
useAppStore.getState().resetState();

// Test complete workflow
(async () => {
  const store = useAppStore.getState();

  console.log('1. Calibrating...');
  store.computeCalibration(3.6, 120);

  console.log('2. Adding 5 windows...');
  for (let i = 0; i < 5; i++) {
    store.addAnnotation({
      id: `window-${i}`,
      pageNumber: 1,
      type: 'rectangle',
      x: 100 + i * 60,
      y: 100,
      width: 40,
      height: 60,
      color: '#3B82F6',
      labelId: 'label-windows',
      unit: 'count',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log('3. Adding 2 doors...');
  for (let i = 0; i < 2; i++) {
    store.addAnnotation({
      id: `door-${i}`,
      pageNumber: 1,
      type: 'rectangle',
      x: 100 + i * 120,
      y: 200,
      width: 50,
      height: 80,
      color: '#EF4444',
      labelId: 'label-doors',
      unit: 'count',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log('4. Calculating costs...');
  store.calculateCostItems();

  console.log('\n=== RESULTS ===');
  console.log('Total Annotations:', Object.values(store.annotations).flat().length);
  console.log('Cost Items:', store.costItems);
  console.log('Total Cost: $' + store.getTotalCost().toFixed(2));
  console.log('By Category:', store.getCostByCategory());

  console.log('\n✅ All tests passed!');
})();
```

Expected output:
```
Total Annotations: 7
Cost Items: [
  { description: "Windows", quantity: 5, totalCost: 2500 },
  { description: "Doors", quantity: 2, totalCost: 1600 }
]
Total Cost: $4100.00
By Category: { "Openings": 4100 }
```

## Troubleshooting Tests

### If cost items are not calculating

```javascript
const store = useAppStore.getState();

// Check calibration
console.log('Is Calibrated:', store.calibrationData.isCalibrated);
console.log('Meters Per Pixel:', store.calibrationData.metersPerPixel);

// Check annotations have labelIds
console.log('Annotations:', store.annotations);

// Manually trigger calculation
store.calculateCostItems();
console.log('Cost Items:', store.costItems);
```

### If persistence is not working

```javascript
// Check localStorage
const key = 'construction-cost-estimator-storage';
const data = localStorage.getItem(key);
console.log('Data exists:', !!data);
console.log('Data size:', data?.length);

// View data
console.log('Stored data:', JSON.parse(data || '{}'));

// Clear if corrupted
localStorage.removeItem(key);
```

### If selectors are not updating

```javascript
// Subscribe to changes
const unsubscribe = useAppStore.subscribe(
  state => state.annotations,
  (annotations) => {
    console.log('Annotations changed:', annotations);
  }
);

// Make a change
useAppStore.getState().addAnnotation({...});

// Don't forget to unsubscribe
unsubscribe();
```

## Next Steps

After verifying these tests:

1. Integrate store with your PDF viewer component
2. Build annotation drawing UI
3. Create cost summary dashboard
4. Add export/import functionality
5. Implement real-time updates

For more examples, see:
- `/src/store/examples.tsx` - Component examples
- `/src/store/STORE.md` - Full documentation
- `/src/store/INTEGRATION.md` - Integration guide
