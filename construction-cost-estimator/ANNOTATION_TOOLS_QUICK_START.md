# Annotation Tools Quick Start Guide

## 🚀 Quick Start

```tsx
import {
  AnnotationToolbar,
  AnnotationToolsPanel,
  MarkerTool,
  LabelTool,
  LineMeasurementTool,
  PolygonAreaTool
} from './components';

function App() {
  const [canvasDimensions] = useState({ width: 800, height: 600 });

  return (
    <div>
      <AnnotationToolbar showReset showClear />

      <div className="annotation-canvas" style={canvasDimensions}>
        <MarkerTool {...canvasDimensions} />
        <LabelTool {...canvasDimensions} />
        <LineMeasurementTool {...canvasDimensions} />
        <PolygonAreaTool {...canvasDimensions} />
      </div>

      <AnnotationToolsPanel />
    </div>
  );
}
```

## ⌨️ Keyboard Shortcuts

| Key | Tool | Action |
|-----|------|--------|
| `M` | Marker | Activate marker tool |
| `L` | Label | Activate label tool |
| `D` | Distance | Activate line measurement tool |
| `A` | Area | Activate polygon tool |
| `V` | Select | Activate selection tool |
| `Escape` | Any | Cancel operation / Exit tool |
| `Delete` | Any | Delete selected annotation |
| `Enter` | Label | Confirm label creation |

## 🎯 Tool Usage

### Marker Tool (M)
1. Press `M` or click marker button
2. Click on canvas to place marker
3. Press `Escape` to exit tool

**Use cases:** Mark specific points, indicate locations

### Label Tool (L)
1. Press `L` or click label button
2. Click on canvas
3. Enter text in dialog
4. Select category (optional)
5. Press `Enter` or click "Create Label"

**Use cases:** Annotate elements, add descriptions, categorize items

### Line Tool (D)
1. Press `D` or click ruler button
2. Click start point
3. Click end point
4. Distance is calculated automatically

**Use cases:** Measure walls, beams, distances

### Polygon Tool (A)
1. Press `A` or click polygon button
2. Click to place vertices (minimum 3)
3. Right-click or double-click to close
4. Area is calculated automatically

**Use cases:** Measure rooms, floors, irregular areas

## 📊 Measurements

### Before Calibration
- Distances shown in **pixels**
- Areas shown in **px²**
- Warning displayed when attempting measurements

### After Calibration
- Distances shown in **meters** (m)
- Areas shown in **square meters** (m²)
- Accurate real-world measurements

### Calibrating
```tsx
import { useAppStore } from './store/useAppStore';

const computeCalibration = useAppStore((state) => state.computeCalibration);

// Example: 5 meters = 100 pixels
computeCalibration(5.0, 100);
```

## 🎨 Customization

### Change Tool Colors
```tsx
<MarkerTool color="#FF0000" />
<LabelTool color="#00FF00" />
<LineMeasurementTool color="#FFFF00" />
<PolygonAreaTool color="#00FFFF" />
```

### Add Callbacks
```tsx
<MarkerTool
  onMarkerPlaced={(marker) => console.log('Marker:', marker)}
/>

<LineMeasurementTool
  onLineMeasured={(line) => console.log('Distance:', line.text)}
/>

<PolygonAreaTool
  onPolygonMeasured={(polygon) => console.log('Area:', polygon.text)}
/>
```

## 📝 Editing Annotations

1. **Select:** Click on any annotation
2. **Edit:** Properties panel appears on right
3. **Change text:** Type in text field
4. **Change color:** Use color picker
5. **Change category:** Select from dropdown
6. **Duplicate:** Click duplicate button
7. **Delete:** Click delete button or press `Delete`

## 🔧 Store Integration

### Get Active Tool
```tsx
const activeTool = useAppStore((state) => state.activeTool);
```

### Get Annotations
```tsx
const annotations = useAppStore((state) =>
  state.annotations[state.currentPageNumber] || []
);
```

### Get Selected Annotation
```tsx
import { useSelectedAnnotation } from './store/useAppStore';
const selected = useSelectedAnnotation();
```

### Programmatic Control
```tsx
const setActiveTool = useAppStore((state) => state.setActiveTool);

// Activate marker tool
setActiveTool('marker');

// Deactivate all tools
setActiveTool(null);
```

## 💡 Pro Tips

1. **Calibrate first** for accurate measurements
2. **Use keyboard shortcuts** for faster workflow
3. **Press Escape** to cancel any operation
4. **Right-click polygons** to close them quickly
5. **Edit annotations** by clicking on them
6. **Use labels** to link annotations to cost items
7. **Check properties panel** for detailed info

## 🐛 Troubleshooting

### Annotations not appearing?
- Check canvas has class `annotation-canvas`
- Verify canvas dimensions are set correctly
- Ensure tools are rendered with correct dimensions

### Measurements incorrect?
- Verify calibration is set: `calibrationData.isCalibrated`
- Check `metersPerPixel` value is correct
- Ensure coordinates are normalized (0-1 range)

### Tool not activating?
- Check `activeTool` state in store
- Verify event listeners are attached
- Ensure no conflicting event handlers

### Keyboard shortcuts not working?
- Check if focus is on an input element
- Verify no browser extensions blocking keys
- Check console for JavaScript errors

## 📚 Further Reading

- [Full Documentation](./src/components/tools/TOOLS.md)
- [Implementation Summary](./ANNOTATION_TOOLS_IMPLEMENTATION.md)
- [Demo Component](./src/components/AnnotationToolsDemo.tsx)

## 🎓 Learning Path

1. **Start with demo:** `<AnnotationToolsDemo />`
2. **Try each tool:** Use keyboard shortcuts
3. **Edit annotations:** Click and modify
4. **Integrate:** Add to your PDF viewer
5. **Customize:** Adjust colors and callbacks
6. **Advanced:** Use store hooks and programmatic control

---

**Need Help?** Check the full documentation in `TOOLS.md`
