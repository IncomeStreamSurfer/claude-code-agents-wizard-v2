# Calibration Tool - Usage Guide

Complete guide for integrating and using the calibration engine in your Construction Cost Estimator app.

## Quick Start

### 1. Import Components

```tsx
import {
  CalibrationTool,
  CalibrationToolbar,
  CalibrationStatus,
} from './components';
import { useAppStore } from './store/useAppStore';
```

### 2. Add to Your Component

```tsx
function PDFApp() {
  const [isCalibrationActive, setIsCalibrationActive] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  const calibrationData = useAppStore((state) => state.calibrationData);

  return (
    <div className="relative w-full h-screen">
      {/* Add toolbar */}
      <CalibrationToolbar
        isCalibrationActive={isCalibrationActive}
        onToggleCalibration={() => setIsCalibrationActive(!isCalibrationActive)}
      />

      {/* Your PDF viewer */}
      <PDFViewerWithZoom
        pdfUrl="/your-pdf.pdf"
        pageNumber={1}
        onPageLoadComplete={(canvas) => {
          setCanvasDimensions({
            width: canvas.width,
            height: canvas.height,
          });
        }}
      />

      {/* Add calibration overlay */}
      {canvasDimensions.width > 0 && (
        <CalibrationTool
          canvasWidth={canvasDimensions.width}
          canvasHeight={canvasDimensions.height}
          isActive={isCalibrationActive}
          onDeactivate={() => setIsCalibrationActive(false)}
        />
      )}
    </div>
  );
}
```

### 3. Use Calibration Data

```tsx
const { isCalibrated, metersPerPixel } = useAppStore(
  (state) => state.calibrationData
);

// Convert pixels to meters
const meters = pixels * metersPerPixel;

// Convert meters to pixels
const pixels = meters / metersPerPixel;
```

## Integration with PDFViewerWithZoom

### Complete Example

```tsx
import { useState } from 'react';
import {
  PDFViewerWithZoom,
  CalibrationTool,
  CalibrationToolbar,
  CalibrationStatus,
} from './components';
import { useAppStore } from './store/useAppStore';

export function ConstructionEstimatorApp() {
  // UI State
  const [isCalibrationActive, setIsCalibrationActive] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

  // Store State
  const calibrationData = useAppStore((state) => state.calibrationData);

  // Handlers
  const handlePageLoad = (canvas: HTMLCanvasElement) => {
    setPdfDimensions({
      width: parseFloat(canvas.style.width) || canvas.width,
      height: parseFloat(canvas.style.height) || canvas.height,
    });
  };

  const handleCalibrationComplete = (data) => {
    console.log('Calibration data:', data);
    // You can add custom logic here
  };

  return (
    <div className="relative w-full h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Construction Cost Estimator</h1>

        {/* Calibration Controls */}
        <div className="flex items-center gap-4">
          <CalibrationToolbar
            isCalibrationActive={isCalibrationActive}
            onToggleCalibration={() => setIsCalibrationActive(!isCalibrationActive)}
          />
        </div>
      </header>

      {/* Main Viewer */}
      <main className="flex-1 relative">
        <PDFViewerWithZoom
          pdfUrl="/uploads/floor-plan.pdf"
          pageNumber={1}
          scale={1.5}
          onPageLoadComplete={handlePageLoad}
        />

        {/* Calibration Tool (only when active) */}
        {pdfDimensions.width > 0 && (
          <CalibrationTool
            canvasWidth={pdfDimensions.width}
            canvasHeight={pdfDimensions.height}
            isActive={isCalibrationActive}
            onDeactivate={() => setIsCalibrationActive(false)}
            onCalibrationComplete={handleCalibrationComplete}
          />
        )}
      </main>

      {/* Status Footer */}
      <footer className="bg-gray-50 border-t p-4">
        <CalibrationStatus
          isCalibrated={calibrationData.isCalibrated}
          metersPerPixel={calibrationData.metersPerPixel}
          referenceLength={calibrationData.referenceLength}
          pixelDistance={calibrationData.pixelDistance}
        />
      </footer>
    </div>
  );
}
```

## Using Store Actions

### Access Calibration Data

```tsx
import { useAppStore } from './store/useAppStore';

// In your component
const calibrationData = useAppStore((state) => state.calibrationData);

console.log(calibrationData.isCalibrated);     // boolean
console.log(calibrationData.metersPerPixel);   // number
console.log(calibrationData.referenceLength);  // number
console.log(calibrationData.pixelDistance);    // number
```

### Manual Calibration

```tsx
const computeCalibration = useAppStore((state) => state.computeCalibration);

// Set calibration manually (if you know the values)
computeCalibration(3.6, 120); // 3.6 meters = 120 pixels
```

### Reset Calibration

```tsx
const resetCalibration = useAppStore((state) => state.resetCalibration);

// Clear calibration
resetCalibration();
```

### Check Calibration Status

```tsx
import { useIsCalibrated } from './store/useAppStore';

const isCalibrated = useIsCalibrated();

if (isCalibrated) {
  // Proceed with measurements
} else {
  // Show calibration prompt
}
```

## Measurement Utilities

### Create Helper Functions

```tsx
import { useAppStore } from './store/useAppStore';

/**
 * Convert pixels to meters
 */
export function pixelsToMeters(pixels: number): number {
  const { isCalibrated, metersPerPixel } = useAppStore.getState().calibrationData;

  if (!isCalibrated) {
    throw new Error('System not calibrated');
  }

  return pixels * metersPerPixel;
}

/**
 * Convert meters to pixels
 */
export function metersToPixels(meters: number): number {
  const { isCalibrated, metersPerPixel } = useAppStore.getState().calibrationData;

  if (!isCalibrated) {
    throw new Error('System not calibrated');
  }

  return meters / metersPerPixel;
}

/**
 * Convert pixel area to square meters
 */
export function pixelAreaToSquareMeters(pixelArea: number): number {
  const { isCalibrated, metersPerPixel } = useAppStore.getState().calibrationData;

  if (!isCalibrated) {
    throw new Error('System not calibrated');
  }

  return pixelArea * (metersPerPixel * metersPerPixel);
}

/**
 * Format meters with unit
 */
export function formatMeters(meters: number): string {
  if (meters < 1) {
    return `${(meters * 100).toFixed(1)} cm`;
  } else if (meters < 1000) {
    return `${meters.toFixed(2)} m`;
  } else {
    return `${(meters / 1000).toFixed(2)} km`;
  }
}
```

### Use in Components

```tsx
import { pixelsToMeters, formatMeters } from './utils/measurements';

function DistanceMeasurementTool() {
  const [pixelDistance, setPixelDistance] = useState(0);

  const meters = pixelsToMeters(pixelDistance);
  const formatted = formatMeters(meters);

  return (
    <div>
      <p>Distance: {formatted}</p>
    </div>
  );
}
```

## Testing the Calibration

### Manual Test

```tsx
import { useAppStore } from './store/useAppStore';

function CalibrationTest() {
  const { isCalibrated, metersPerPixel } = useAppStore(
    (state) => state.calibrationData
  );
  const computeCalibration = useAppStore((state) => state.computeCalibration);

  const runTest = () => {
    // Test: 3.6m wall = 120 pixels
    computeCalibration(3.6, 120);

    const expectedScale = 3.6 / 120; // 0.03 m/pixel
    console.assert(
      Math.abs(metersPerPixel - expectedScale) < 0.0001,
      'Scale calculation correct'
    );

    console.log('Test passed!');
  };

  return (
    <button onClick={runTest}>
      Run Calibration Test
    </button>
  );
}
```

### Automated Test (Jest)

```tsx
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from './store/useAppStore';

describe('Calibration', () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      useAppStore.getState().resetCalibration();
    });
  });

  it('should compute calibration correctly', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.computeCalibration(3.6, 120);
    });

    expect(result.current.calibrationData.isCalibrated).toBe(true);
    expect(result.current.calibrationData.metersPerPixel).toBeCloseTo(0.03);
    expect(result.current.calibrationData.referenceLength).toBe(3.6);
    expect(result.current.calibrationData.pixelDistance).toBe(120);
  });

  it('should reset calibration', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.computeCalibration(3.6, 120);
      result.current.resetCalibration();
    });

    expect(result.current.calibrationData.isCalibrated).toBe(false);
    expect(result.current.calibrationData.metersPerPixel).toBe(0);
  });
});
```

## Common Patterns

### Conditional Rendering Based on Calibration

```tsx
function MeasurementPanel() {
  const isCalibrated = useIsCalibrated();

  if (!isCalibrated) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
        <p className="text-yellow-900">
          Please calibrate the system before taking measurements.
        </p>
      </div>
    );
  }

  return <ActualMeasurementTools />;
}
```

### Toolbar Integration

```tsx
function AppToolbar() {
  const [isCalibrationActive, setIsCalibrationActive] = useState(false);

  return (
    <div className="flex items-center gap-4">
      {/* Other tools */}
      <button onClick={() => {/* ... */}}>Annotate</button>
      <button onClick={() => {/* ... */}}>Measure</button>

      {/* Calibration controls */}
      <CalibrationToolbar
        isCalibrationActive={isCalibrationActive}
        onToggleCalibration={() => setIsCalibrationActive(!isCalibrationActive)}
      />
    </div>
  );
}
```

### Multi-Page Calibration

If you have multiple pages, you might want to store calibration per page:

```tsx
// This requires modifying the store structure
// For now, calibration is global across all pages
const calibrationData = useAppStore((state) => state.calibrationData);

// To implement per-page calibration, you would need to:
// 1. Modify store to store calibrations by page number
// 2. Update components to use current page's calibration
// 3. Add UI to manage multiple calibrations
```

## Styling Customization

### Custom Button Styles

```tsx
import { CalibrationButton } from './components';

<CalibrationButton
  onClick={handleClick}
  isActive={isActive}
  className="bg-purple-600 hover:bg-purple-700"
/>
```

### Custom Status Colors

```tsx
import { CalibrationStatus } from './components';

<CalibrationStatus
  isCalibrated={isCalibrated}
  metersPerPixel={metersPerPixel}
  className="border-2 border-blue-500"
/>
```

## Keyboard Shortcuts

The calibration system supports these keyboard shortcuts:

- **Enter** - Confirm calibration in dialog
- **Escape** - Cancel calibration / close dialog

You can add more shortcuts:

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + K to activate calibration
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsCalibrationActive(true);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Troubleshooting

### Issue: Canvas dimensions are 0

**Problem:** CalibrationTool doesn't appear because canvas dimensions aren't set.

**Solution:**
```tsx
const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

<PDFViewerWithZoom
  onPageLoadComplete={(canvas) => {
    setDimensions({
      width: parseFloat(canvas.style.width) || canvas.width,
      height: parseFloat(canvas.style.height) || canvas.height,
    });
  }}
/>

{dimensions.width > 0 && (
  <CalibrationTool
    canvasWidth={dimensions.width}
    canvasHeight={dimensions.height}
    // ...
  />
)}
```

### Issue: Scale seems wrong

**Problem:** Measurements don't match real-world values.

**Solution:**
1. Verify you're measuring the PDF canvas, not the container
2. Check that zoom/scale doesn't affect the canvas dimensions
3. Use a longer reference line for better accuracy
4. Verify unit conversion (3.6m ≠ 360mm!)

### Issue: Calibration not persisting

**Problem:** Calibration resets on page reload.

**Solution:** Ensure Zustand persistence is configured in the store:

```tsx
// This is already configured in useAppStore.ts
persist(
  immer((set, get) => ({ /* ... */ })),
  {
    name: 'construction-cost-estimator-storage',
    partialize: (state) => ({
      calibrationData: state.calibrationData,
      // ... other persisted fields
    }),
  }
)
```

## Performance Tips

1. **Conditional Rendering:** Only render CalibrationTool when active
2. **Memoization:** Use React.memo for status components
3. **Debounce:** Debounce mouse move events if needed
4. **Canvas Size:** Keep canvas size reasonable (don't render at 4K if not needed)

## Next Steps

After calibration is working:

1. Build measurement tools that use the calibration data
2. Add annotation features for marking measurements
3. Implement cost calculation based on measured quantities
4. Export measurements and calibration data
5. Add measurement history and reporting

## Support

For issues or questions:
- Check the main README
- Review the CalibrationTool.README.md
- Check component prop types and JSDoc comments
- Run the CalibrationDemo to see a working example
