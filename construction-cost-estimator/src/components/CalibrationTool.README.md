# Calibration Tool

A complete calibration engine for setting the scale in PDF construction drawings. Allows users to draw a reference line and input its real-world length to compute meters per pixel.

## Overview

The calibration system consists of four main components:

1. **CalibrationTool** - Interactive drawing tool for creating calibration lines
2. **CalibrationDialog** - Input dialog for real-world measurements
3. **CalibrationStatus** - Visual status indicators
4. **CalibrationToolbar** - Toolbar integration with controls

## Features

- Click-to-draw calibration line with visual feedback
- Real-time pixel distance display
- Unit conversion (mm, cm, m, km)
- Input validation and error handling
- Automatic storage in Zustand store with localStorage persistence
- Keyboard shortcuts (Enter to confirm, Escape to cancel)
- Responsive and accessible UI
- Scale preview and validation
- Reset functionality

## Installation

The components are already integrated into the project. No additional dependencies needed beyond the existing setup:

- `react-konva` for drawing
- `zustand` for state management
- `lucide-react` for icons
- `tailwindcss` for styling

## Usage

### Basic Integration with PDFViewerWithZoom

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components/PDFViewerWithZoom';
import { CalibrationTool } from './components/CalibrationTool';
import { CalibrationToolbar } from './components/CalibrationToolbar';
import { useAppStore } from './store/useAppStore';

function PDFApp() {
  const [isCalibrationActive, setIsCalibrationActive] = useState(false);
  const calibrationData = useAppStore((state) => state.calibrationData);

  return (
    <div className="relative w-full h-screen">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-30">
        <CalibrationToolbar
          isCalibrationActive={isCalibrationActive}
          onToggleCalibration={() => setIsCalibrationActive(!isCalibrationActive)}
        />
      </div>

      {/* PDF Viewer */}
      <PDFViewerWithZoom
        pdfUrl="/path/to/your/drawing.pdf"
        pageNumber={1}
      />

      {/* Calibration Tool Overlay */}
      <CalibrationTool
        canvasWidth={800}
        canvasHeight={1000}
        isActive={isCalibrationActive}
        onDeactivate={() => setIsCalibrationActive(false)}
        onCalibrationComplete={(data) => {
          console.log('Calibration complete:', data);
        }}
      />
    </div>
  );
}
```

### Standalone Status Display

```tsx
import { CalibrationStatus } from './components/CalibrationStatus';
import { useAppStore } from './store/useAppStore';

function StatusPanel() {
  const calibrationData = useAppStore((state) => state.calibrationData);

  return (
    <CalibrationStatus
      isCalibrated={calibrationData.isCalibrated}
      metersPerPixel={calibrationData.metersPerPixel}
      referenceLength={calibrationData.referenceLength}
      pixelDistance={calibrationData.pixelDistance}
    />
  );
}
```

### Using Store Actions

```tsx
import { useAppStore } from './store/useAppStore';

function MyComponent() {
  const calibrationData = useAppStore((state) => state.calibrationData);
  const computeCalibration = useAppStore((state) => state.computeCalibration);
  const resetCalibration = useAppStore((state) => state.resetCalibration);

  // Check if calibrated
  if (calibrationData.isCalibrated) {
    console.log('Scale:', calibrationData.metersPerPixel, 'm/pixel');
  }

  // Manual calibration (if needed)
  const handleManualCalibration = () => {
    computeCalibration(3.6, 120); // 3.6m = 120 pixels
  };

  // Reset calibration
  const handleReset = () => {
    resetCalibration();
  };
}
```

## Component API

### CalibrationTool

Interactive drawing tool for calibration.

**Props:**

```typescript
interface CalibrationToolProps {
  canvasWidth: number;        // Width of the PDF canvas in pixels
  canvasHeight: number;       // Height of the PDF canvas in pixels
  isActive: boolean;          // Whether the tool is currently active
  onDeactivate?: () => void;  // Callback when tool should deactivate
  onCalibrationComplete?: (data: CalibrationData) => void; // Callback on completion
}
```

**Usage:**

```tsx
<CalibrationTool
  canvasWidth={800}
  canvasHeight={1000}
  isActive={isCalibrationActive}
  onDeactivate={() => setIsCalibrationActive(false)}
  onCalibrationComplete={(data) => {
    console.log('Calibrated:', data);
  }}
/>
```

### CalibrationDialog

Dialog for inputting real-world measurements.

**Props:**

```typescript
interface CalibrationDialogProps {
  open: boolean;                              // Dialog open state
  onOpenChange: (open: boolean) => void;      // Open state change handler
  pixelDistance: number;                      // Measured pixel distance
  onConfirm: (lengthInMeters: number) => void; // Confirm handler
  onCancel: () => void;                       // Cancel handler
}
```

### CalibrationStatus

Visual status display component.

**Props:**

```typescript
interface CalibrationStatusProps {
  isCalibrated: boolean;      // Calibration status
  metersPerPixel: number;     // Computed scale
  referenceLength?: number;   // Reference length in meters
  pixelDistance?: number;     // Reference distance in pixels
  className?: string;         // Optional className
}
```

### CalibrationToolbar

Toolbar integration component.

**Props:**

```typescript
interface CalibrationToolbarProps {
  isCalibrationActive: boolean;           // Active state
  onToggleCalibration: () => void;        // Toggle handler
  className?: string;                     // Optional className
}
```

## Workflow

### User Workflow

1. User clicks "Calibrate" button in toolbar
2. Tool activates with visual instructions
3. User clicks on PDF to set start point (red circle appears)
4. User moves mouse to preview line (dashed red line)
5. User clicks to set end point (green circle appears, solid green line)
6. Dialog automatically opens showing:
   - Measured pixel distance
   - Input field for real-world length
   - Unit selector (mm, cm, m, km)
   - Scale preview
7. User enters known measurement (e.g., "3.6" meters for a wall)
8. User confirms
9. Scale is computed and stored
10. Green status indicator appears showing calibration success

### Developer Workflow

1. Import components
2. Add CalibrationToolbar to UI
3. Add CalibrationTool overlay
4. Connect state with isActive
5. Access calibration data from store
6. Use metersPerPixel for measurements

## Keyboard Shortcuts

- **Enter** - Confirm calibration in dialog
- **Escape** - Cancel calibration / close dialog

## Validation Rules

- Minimum pixel distance: 1 pixel (warns if < 10 pixels)
- Minimum real-world length: 0.001 meters (1mm)
- Maximum real-world length: 10000 meters (10km)
- Only positive numbers accepted
- Automatic unit conversion to meters

## State Management

The calibration data is stored in the Zustand store at `calibrationData`:

```typescript
interface CalibrationData {
  referenceLength: number;    // Reference length in meters
  pixelDistance: number;      // Measured pixel distance
  metersPerPixel: number;     // Computed scale (referenceLength / pixelDistance)
  isCalibrated: boolean;      // Calibration status
}
```

**Store Actions:**

- `computeCalibration(referenceLength, pixelDistance)` - Compute and store calibration
- `setCalibrationData(partialData)` - Update calibration data
- `resetCalibration()` - Reset to uncalibrated state

**Persistence:**

Calibration data is automatically persisted to localStorage via Zustand middleware.

## Testing Scenarios

### Test Case 1: Basic Calibration

```
Given: A PDF with a known 3.6m wall
When: User draws line across wall (120 pixels)
And: User enters "3.6" meters
Then: Scale should be 0.03 m/pixel
And: Status should show "Calibrated"
```

### Test Case 2: Unit Conversion

```
Given: User draws 150 pixel line
When: User enters "360" centimeters
Then: System converts to 3.6 meters
And: Scale is computed correctly (0.024 m/pixel)
```

### Test Case 3: Validation

```
Given: User draws very short line (5 pixels)
When: Dialog opens
Then: Warning appears about accuracy
But: User can still proceed
```

### Test Case 4: Reset

```
Given: System is calibrated
When: User clicks reset button
Then: Confirmation dialog appears
When: User confirms
Then: Calibration is cleared
And: Status shows "Not Calibrated"
```

### Test Case 5: Persistence

```
Given: User calibrates system
When: Page refreshes
Then: Calibration data is restored
And: Status shows previous calibration
```

## Styling and Theming

The components use TailwindCSS and can be customized via className props:

```tsx
<CalibrationToolbar
  className="bg-white shadow-lg rounded-lg p-4"
  isCalibrationActive={isActive}
  onToggleCalibration={handleToggle}
/>
```

**Color Scheme:**

- Red: Not calibrated, drawing in progress
- Green: Calibrated, successful state
- Blue: Active tool, primary actions
- Yellow: Warnings

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly status messages
- Color is not the only indicator (icons + text)
- Focus management in dialogs
- Semantic HTML structure

## Integration Examples

### Example 1: Full App with Annotations

```tsx
import { useState } from 'react';
import { PDFViewerWithZoom } from './components/PDFViewerWithZoom';
import { CalibrationTool } from './components/CalibrationTool';
import { CalibrationToolbar } from './components/CalibrationToolbar';
import { AnnotationStage } from './components/AnnotationStage';
import { useAppStore } from './store/useAppStore';

function ConstructionApp() {
  const [isCalibrationActive, setIsCalibrationActive] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

  const calibrationData = useAppStore((state) => state.calibrationData);
  const annotations = useAppStore((state) => state.getAnnotationsByPage(1));

  const handlePdfLoad = (canvas: HTMLCanvasElement) => {
    setPdfDimensions({
      width: canvas.width,
      height: canvas.height,
    });
  };

  return (
    <div className="relative w-full h-screen flex flex-col">
      {/* Header with Toolbar */}
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Construction Cost Estimator</h1>

        <CalibrationToolbar
          isCalibrationActive={isCalibrationActive}
          onToggleCalibration={() => setIsCalibrationActive(!isCalibrationActive)}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        <PDFViewerWithZoom
          pdfUrl="/drawings/floor-plan.pdf"
          pageNumber={1}
          onPageLoadComplete={handlePdfLoad}
        />

        {/* Calibration Tool (higher z-index when active) */}
        {pdfDimensions.width > 0 && (
          <CalibrationTool
            canvasWidth={pdfDimensions.width}
            canvasHeight={pdfDimensions.height}
            isActive={isCalibrationActive}
            onDeactivate={() => setIsCalibrationActive(false)}
            onCalibrationComplete={(data) => {
              console.log('Calibration complete:', data);
              alert(`Scale set: ${data.metersPerPixel.toFixed(6)} m/pixel`);
            }}
          />
        )}

        {/* Annotations (only when not calibrating) */}
        {!isCalibrationActive && pdfDimensions.width > 0 && (
          <AnnotationStage
            canvasWidth={pdfDimensions.width}
            canvasHeight={pdfDimensions.height}
            annotations={annotations}
          />
        )}
      </main>

      {/* Footer with Status */}
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

### Example 2: Measurement Tool Integration

```tsx
import { useAppStore } from './store/useAppStore';

function MeasurementTool() {
  const calibrationData = useAppStore((state) => state.calibrationData);

  const pixelToMeters = (pixels: number): number => {
    if (!calibrationData.isCalibrated) {
      throw new Error('System not calibrated');
    }
    return pixels * calibrationData.metersPerPixel;
  };

  const metersToPixels = (meters: number): number => {
    if (!calibrationData.isCalibrated) {
      throw new Error('System not calibrated');
    }
    return meters / calibrationData.metersPerPixel;
  };

  // Example: Convert 100 pixels to meters
  if (calibrationData.isCalibrated) {
    const meters = pixelToMeters(100);
    console.log(`100 pixels = ${meters.toFixed(2)} meters`);
  }
}
```

## Troubleshooting

### Issue: Calibration line not appearing

**Solution:** Ensure `isActive` prop is true and canvas dimensions are valid (> 0).

### Issue: Dialog not opening

**Solution:** Check that pixel distance is >= 1. Very short lines may not trigger the dialog.

### Issue: Scale seems incorrect

**Solution:**
1. Verify the reference measurement is correct
2. Check unit selection (mm vs m makes a big difference!)
3. Draw a longer line for better accuracy
4. Ensure PDF scale hasn't changed

### Issue: Calibration not persisting

**Solution:** Check that Zustand persistence middleware is configured correctly in the store.

## Performance Considerations

- Konva Stage is only rendered when tool is active
- Minimal re-renders with proper state management
- Canvas size should match PDF rendering for accuracy
- Dialog is lazy-loaded and only shown when needed

## Future Enhancements

Possible improvements for future versions:

- Multiple calibration points for distorted PDFs
- Calibration history and undo
- Import/export calibration settings
- Visual grid overlay showing scale
- Angle measurements
- Area calculations
- Calibration presets for common scales

## License

Part of the Construction Cost Estimator project.

## Support

For issues or questions, refer to the main project documentation.
