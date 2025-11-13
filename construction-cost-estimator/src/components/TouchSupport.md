# Touch Support Documentation

## Overview

Comprehensive touch support for mobile annotation interactions, enabling users on tablets and phones to draw, measure, and edit annotations using touch gestures like tap, drag, pinch-zoom, and long-press.

## Features

### Supported Gestures

1. **Tap** - Single touch for 250ms or less
   - Select annotation
   - Place marker/label
   - Activate UI buttons

2. **Double Tap** - Two quick taps within 300ms
   - Toggle zoom (1x ↔ 2x)
   - Open edit dialog

3. **Long Press** - Hold for 500ms
   - Show context menu
   - Access quick actions

4. **Drag** - Touch and move
   - Move annotations
   - Draw lines/polygons
   - Reposition elements

5. **Pinch** - Two-finger spread/pinch
   - Zoom in (spread fingers)
   - Zoom out (pinch fingers)
   - Centered on gesture point

6. **Pan** - Two-finger drag
   - Move viewport
   - Works when zoomed in
   - Constrained to bounds

7. **Swipe** - Quick directional gesture
   - Left/Right: Navigate pages
   - Up/Down: Show/hide panels

## Architecture

### Core Components

```
TouchSupport/
├── Hooks/
│   ├── useTouchGestures.ts       # Core gesture recognition
│   └── useHapticFeedback.ts      # Haptic feedback
├── Components/
│   ├── TouchAnnotationCanvas.tsx # Touch-enabled canvas wrapper
│   ├── TouchToolbar.tsx          # Mobile toolbar (bottom)
│   ├── MobileAnnotationPanel.tsx # Bottom sheet editor
│   ├── TouchGestureGuide.tsx     # Gesture help overlay
│   ├── ResponsiveToolbar.tsx     # Adaptive toolbar
│   └── TouchDemo.tsx             # Demo component
└── Utils/
    └── touchHelpers.ts           # Touch utilities
```

### Data Flow

```
User Touch
    ↓
useTouchGestures (event detection)
    ↓
Gesture Recognition (tap/drag/pinch/etc)
    ↓
Callback Handlers
    ↓
State Updates / Actions
    ↓
UI Feedback + Haptic
```

## Usage

### Basic Setup

```tsx
import { TouchAnnotationCanvas } from './components/TouchAnnotationCanvas';
import { TouchToolbar } from './components/TouchToolbar';
import { MobileAnnotationPanel } from './components/MobileAnnotationPanel';

function MyApp() {
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  return (
    <>
      <TouchAnnotationCanvas
        width={800}
        height={600}
        currentZoom={zoom}
        currentPan={pan}
        activeTool={activeTool}
        onZoomChange={setZoom}
        onPanChange={setPan}
        onTap={handleTap}
        onLongPress={handleLongPress}
      >
        {/* Your canvas content */}
      </TouchAnnotationCanvas>

      <TouchToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />
    </>
  );
}
```

### Using Touch Gestures Hook

```tsx
import { useTouchGestures } from '../hooks/useTouchGestures';

function MyComponent() {
  const elementRef = useRef<HTMLDivElement>(null);

  const { state, isTap, isDrag, isPinch } = useTouchGestures(
    elementRef,
    {
      onTap: (pos) => console.log('Tap at', pos),
      onDrag: (pos, delta) => console.log('Drag', delta),
      onPinch: (scale, center) => console.log('Pinch', scale),
    },
    {
      longPressDelay: 500,
      tapThreshold: 10,
      enablePinch: true,
      enablePan: true,
    }
  );

  return <div ref={elementRef}>Touch me!</div>;
}
```

### Using Haptic Feedback

```tsx
import { useHapticFeedback } from '../hooks/useHapticFeedback';

function MyButton() {
  const haptic = useHapticFeedback();

  const handleClick = () => {
    haptic.tap();      // Light feedback
    // Do something
  };

  const handleSuccess = () => {
    haptic.success();  // Success pattern
    // Show success
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

## Components

### TouchAnnotationCanvas

Touch-enabled wrapper for annotation canvas.

**Props:**
```typescript
interface TouchAnnotationCanvasProps {
  children: React.ReactNode;
  width: number;
  height: number;
  enablePinchZoom?: boolean;          // default: true
  enableTwoFingerPan?: boolean;       // default: true
  enableHapticFeedback?: boolean;     // default: true
  touchDelay?: number;                // default: 500ms
  tapThreshold?: number;              // default: 10px
  currentZoom?: number;
  currentPan?: { x: number; y: number };
  activeTool?: 'select' | 'marker' | 'label' | 'line' | 'polygon' | null;
  onZoomChange?: (zoom: number, center: Point) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
  onTap?: (position: Point) => void;
  onLongPress?: (position: Point) => void;
  onAnnotationPlace?: (position: Point) => void;
  onAnnotationDrag?: (position: Point, delta: Point) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}
```

### TouchToolbar

Mobile-optimized toolbar with large touch targets (min 48px × 48px).

**Features:**
- Bottom-positioned for thumb reach
- Collapsible/expandable
- Tool selection with visual feedback
- Undo/Redo buttons
- Settings and Help buttons

### MobileAnnotationPanel

Bottom sheet for editing annotation properties.

**Features:**
- Swipe down to close
- Large touch targets
- Color picker grid
- Category selector
- Text/notes editor
- Quick actions (Delete, Duplicate)

### TouchGestureGuide

Interactive guide showing available gestures.

**Features:**
- Animated gesture demonstrations
- Clear descriptions
- Tips section
- Dismissible overlay
- Compact mode available

### ResponsiveToolbar

Adaptive toolbar that changes based on screen size:
- **Mobile (<768px)**: Full TouchToolbar
- **Tablet (768-1024px)**: Compact TouchToolbar
- **Desktop (>1024px)**: Traditional toolbar with tooltips

## Touch Interaction Patterns

### Tool-Specific Interactions

**Select Tool:**
- Tap: Select annotation
- Long Press: Context menu
- Drag: Move annotation

**Marker/Label Tool:**
- Tap: Place marker at position
- Drag: Place marker at end position

**Line Tool:**
- Tap: Start line
- Drag: Draw line
- Tap again: End line

**Polygon Tool:**
- Tap: Add vertex
- Drag: Position next vertex
- Long Press: Complete polygon

### Universal Gestures (All Tools)

- **Pinch:** Zoom in/out (always available)
- **Two-Finger Pan:** Move viewport (always available)
- **Swipe Left/Right:** Navigate pages (when applicable)

## Touch Targets

All touch targets meet accessibility standards:
- **Minimum size:** 44px × 44px
- **Recommended size:** 48px × 48px or larger
- **Spacing:** At least 8px between targets

## Haptic Feedback Patterns

```typescript
haptic.tap()         // Light tap (10ms) - button press
haptic.select()      // Medium tap (20ms) - selection
haptic.longPress()   // Long vibration (40ms) - long press detected
haptic.success()     // Pattern [10, 50, 20] - action succeeded
haptic.warning()     // Pattern [15, 30, 15] - warning
haptic.error()       // Pattern [20, 30, 20, 30, 20] - error
```

## Browser Compatibility

| Browser | Touch Events | Multi-Touch | Haptic Feedback |
|---------|-------------|-------------|-----------------|
| iOS Safari | ✅ | ✅ | ✅ |
| Chrome (Android) | ✅ | ✅ | ✅ |
| Firefox (Mobile) | ✅ | ✅ | ✅ |
| Edge (Mobile) | ✅ | ✅ | ✅ |
| Desktop Browsers | ✅* | ✅* | ❌ |

*With touch-enabled devices or emulation

## Performance Optimization

### Implemented Optimizations

1. **Event Throttling:** Touch move events throttled to ~60fps (16ms)
2. **Passive Listeners:** Non-blocking scroll performance
3. **Debounced Updates:** State updates debounced for performance
4. **Request Animation Frame:** Smooth animations
5. **Transform over Position:** Hardware-accelerated transforms

### Best Practices

```tsx
// ✅ Good: Use transform for animations
<div style={{ transform: `translate(${x}px, ${y}px)` }} />

// ❌ Avoid: Using top/left for animations
<div style={{ left: x, top: y }} />

// ✅ Good: Throttle touch move handlers
const handleMove = throttle((e) => { ... }, 16);

// ✅ Good: Use passive listeners for scrolling
element.addEventListener('touchstart', handler, { passive: true });
```

## Testing

### Manual Testing Checklist

- [ ] Tap to select annotation
- [ ] Double tap to zoom
- [ ] Long press for context menu
- [ ] Drag to move annotation
- [ ] Pinch to zoom in/out
- [ ] Two-finger pan when zoomed
- [ ] Swipe to navigate pages
- [ ] Toolbar buttons respond to touch
- [ ] Bottom sheet swipes down to close
- [ ] Color picker selectable
- [ ] Text input works
- [ ] Haptic feedback triggers (on supported devices)

### Device Testing

Test on actual devices:
- iPhone (iOS Safari)
- iPad (iOS Safari)
- Android phone (Chrome)
- Android tablet (Chrome)
- Windows tablet (Edge)

### Emulation Testing

Use Chrome DevTools:
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select device (iPhone, iPad, etc.)
4. Enable touch emulation
5. Test gestures with mouse

## Known Limitations

1. **Haptic Feedback:** Not supported on desktop browsers
2. **Pinch Zoom:** May conflict with browser zoom (prevented with `touch-action: none`)
3. **Double Tap Zoom:** Browser default disabled for better control
4. **Text Selection:** Disabled during touch interactions (`user-select: none`)
5. **Context Menu:** Browser context menu prevented on long press

## Troubleshooting

### Issue: Touch events not working

**Solution:**
- Ensure `touch-action: none` on canvas element
- Check `preventDefaultOnTouch` is true
- Verify element has proper z-index

### Issue: Pinch zoom conflicts with browser

**Solution:**
```css
.canvas {
  touch-action: none;
  -webkit-touch-callout: none;
  user-select: none;
}
```

### Issue: Haptic feedback not working

**Solution:**
- Check device support with `navigator.vibrate`
- Ensure HTTPS (required for Vibration API)
- Check browser permissions

### Issue: Poor performance on older devices

**Solution:**
- Increase throttle delay (e.g., 32ms for 30fps)
- Reduce visual effects
- Simplify animations
- Use `will-change` CSS property sparingly

## Future Enhancements

### Planned Features

1. **Gesture Customization:** Allow users to customize gestures
2. **Multi-Touch Drawing:** Support for simultaneous multi-user annotations
3. **Pressure Sensitivity:** Use touch force for line thickness
4. **Palm Rejection:** Ignore accidental palm touches on tablets
5. **Stylus Support:** Enhanced precision with Apple Pencil / S Pen
6. **Gesture Recording:** Record and playback gesture macros
7. **Voice Commands:** Combine touch with voice input

### API Enhancements

1. **Touch History:** Access to previous touch positions
2. **Velocity Tracking:** Calculate gesture velocity/momentum
3. **Custom Gestures:** Define application-specific gestures
4. **Gesture Conflicts:** Better handling of competing gestures

## Resources

### Documentation
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [MDN Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [W3C Pointer Events](https://www.w3.org/TR/pointerevents/)

### Libraries Used
- React 18+
- TypeScript 5+
- Konva (canvas rendering)
- Tailwind CSS (styling)

### Related Files
- `/src/hooks/useTouchGestures.ts`
- `/src/hooks/useHapticFeedback.ts`
- `/src/utils/touchHelpers.ts`
- `/src/components/TouchAnnotationCanvas.tsx`
- `/src/components/TouchToolbar.tsx`
- `/src/components/MobileAnnotationPanel.tsx`
- `/src/components/TouchGestureGuide.tsx`
- `/src/components/ResponsiveToolbar.tsx`
- `/src/components/TouchDemo.tsx`

## Support

For issues or questions:
1. Check this documentation
2. Review the TouchDemo component for examples
3. Inspect browser console for errors
4. Test on actual touch device (not just emulation)
5. Check browser compatibility table

---

**Version:** 1.0.0
**Last Updated:** 2024-11-13
**Maintained by:** Construction Cost Estimator Team
