# MainLayout - Comprehensive Responsive Layout Documentation

## Overview

The `MainLayout` component is the cornerstone of the Construction Cost Estimator application, providing a professional, responsive, and feature-rich layout system that adapts seamlessly across all device sizes.

## Architecture

### Component Hierarchy

```
MainLayout
├── Navbar (Top Navigation)
├── LeftSidebar (Collapsible)
│   ├── Tab: Label Library
│   ├── Tab: Calibration Status
│   ├── Tab: Annotations List
│   └── Tab: Project Info
├── Main Content Area
│   ├── PDFViewerWithZoom
│   ├── AnnotationStage (Overlay)
│   └── AnnotationToolbar (Bottom)
├── RightSidebar (Collapsible)
│   └── CostEstimationPanel
└── Mobile Bottom Action Bar (Mobile Only)
```

## Layout Diagrams

### Desktop Layout (≥1536px)

```
┌─────────────────────────────────────────────────────────────┐
│                     Navbar (64px height)                     │
│  Logo | Sidebar Toggles | Project Name | Page Nav | Status  │
├───────────────┬─────────────────────────────┬────────────────┤
│               │                             │                │
│  Left Sidebar │      Main PDF Viewer        │ Right Sidebar  │
│   (350px)     │   + AnnotationStage         │    (420px)     │
│               │   + Zoom Controls           │                │
│  [Label Lib]  │                             │  [Cost Panel]  │
│  [Calibrate]  │                             │                │
│  [Annotate]   │                             │  - Grand Total │
│  [Project]    │                             │  - Categories  │
│               │                             │  - Items List  │
├───────────────┴─────────────────────────────┴────────────────┤
│              Annotation Toolbar (52px height)                │
│     [Select] [Marker] [Label] [Line] [Polygon] [Reset]       │
└─────────────────────────────────────────────────────────────┘
```

### Tablet Layout (640px - 1023px)

```
┌──────────────────────────────────────────────┐
│              Navbar (64px)                   │
│  [≡] Project Name | Page Nav | [≡]          │
├──────────────────────────────────────────────┤
│                                              │
│         Main PDF Viewer (Full Width)         │
│         + AnnotationStage                    │
│         + Zoom Controls                      │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│         Annotation Toolbar (52px)            │
│     [Tools] [Select] [Marker] [Line]         │
└──────────────────────────────────────────────┘

Sidebars: Slide-out overlays from left/right with backdrop
```

### Mobile Layout (<640px)

```
┌────────────────────────┐
│   Navbar (64px)        │
│  [≡] | Page # | [≡]    │
├────────────────────────┤
│                        │
│   PDF Viewer           │
│   (Full Screen)        │
│   + Zoom               │
│                        │
│                        │
│                        │
├────────────────────────┤
│  Toolbar (52px)        │
│  [Tools] [Select]      │
├────────────────────────┤
│ Bottom Action Bar      │
│ [🏷️] [📏] [💰]        │
└────────────────────────┘

Sidebars: Full-screen overlays with backdrop
```

## Responsive Breakpoints

### Breakpoint Summary

| Breakpoint | Width Range | Left Sidebar | Right Sidebar | Layout Mode |
|------------|-------------|--------------|---------------|-------------|
| **2xl** | ≥1536px | 350px (fixed) | 420px (fixed) | Full two-column |
| **xl** | 1024-1535px | 280px (fixed) | 380px (fixed) | Adjusted widths |
| **lg** | 1024-1279px | 280px (fixed) | 380px (fixed) | Compact |
| **md** | 640-1023px | Overlay | Overlay | Main full-width |
| **sm** | <640px | Overlay | Overlay | Mobile mode |

### Breakpoint Behavior Details

#### Desktop (≥1536px) - "Full Layout"
- **Left Sidebar**: Fixed, 350px wide, always visible by default
- **Right Sidebar**: Fixed, 420px wide, always visible by default
- **Main Content**: Flexes to fill remaining space
- **Toolbar**: Fixed at bottom of content area
- **Navigation**: Full navbar with all controls

#### Large Desktop (1024px - 1535px) - "Compact Layout"
- **Left Sidebar**: Fixed, 280px wide, toggleable
- **Right Sidebar**: Fixed, 380px wide, toggleable
- **Main Content**: Adjusts based on sidebar states
- **Toolbar**: Compact buttons
- **Navigation**: Full navbar

#### Tablet (640px - 1023px) - "Overlay Mode"
- **Left Sidebar**: Overlay from left, 280px wide, z-index: 40
- **Right Sidebar**: Overlay from right, 320px wide, z-index: 40
- **Main Content**: Full width
- **Backdrop**: Semi-transparent dark overlay (z-index: 30)
- **Toolbar**: Inline below PDF
- **Navigation**: Condensed navbar

#### Mobile (<640px) - "Mobile Mode"
- **Left Sidebar**: Full overlay from left
- **Right Sidebar**: Full overlay from right or slide-up panel
- **Main Content**: Full screen PDF viewer
- **Bottom Action Bar**: Fixed at bottom with quick access buttons
- **Backdrop**: Full-screen semi-transparent overlay
- **Toolbar**: Compact, essential tools only
- **Navigation**: Minimal navbar

## Component Documentation

### 1. MainLayout Component

**File**: `/src/components/MainLayout.tsx`

**Purpose**: Root layout container managing the entire application layout with responsive sidebar controls.

#### Props

```typescript
interface MainLayoutProps {
  pdfUrl?: string;              // URL or path to PDF file
  projectId?: string;           // Unique project identifier
  onProjectChange?: (project: any) => void;
  pdfMetadata?: {
    fileName?: string;
    fileSize?: number;
    totalPages?: number;
    uploadDate?: Date;
  };
}
```

#### State Management

- **leftSidebarOpen**: Boolean for left sidebar visibility
- **rightSidebarOpen**: Boolean for right sidebar visibility
- **isMobile**: Detected screen size (< 640px)
- **isTablet**: Detected screen size (640px - 1023px)
- **calibrationDialogOpen**: Boolean for calibration modal

#### Key Features

1. **Auto-responsive**: Automatically detects screen size and adjusts layout
2. **Debounced Resize**: Smooth handling of window resize events (150ms debounce)
3. **Keyboard Shortcuts**:
   - `Ctrl/Cmd + B`: Toggle left sidebar
   - `Ctrl/Cmd + E`: Toggle right sidebar
   - `Escape`: Close overlays (mobile/tablet)
4. **State Persistence**: Sidebar states saved per breakpoint

---

### 2. Navbar Component

**File**: `/src/components/Navbar.tsx`

**Purpose**: Top navigation bar with project info, page controls, and menu access.

#### Features

- **Logo & Title**: Application branding
- **Project Name Display**: Shows current PDF filename
- **Page Navigation**:
  - Previous/Next buttons
  - Page number input (jump to page)
  - Total pages display
- **Sidebar Toggle Buttons**: Show/hide left and right sidebars
- **Calibration Status Indicator**: Green (calibrated) / Red (not calibrated)
- **File Menu Dropdown**:
  - Upload PDF
  - Save Project
  - Export Estimate
  - Settings
  - Help
- **Last Saved Timestamp**: Shows auto-save status

#### Responsive Behavior

- **Desktop**: Full navbar with all elements
- **Tablet**: Condensed, essential controls
- **Mobile**: Hamburger menu, minimal controls

---

### 3. LeftSidebar Component

**File**: `/src/components/LeftSidebar.tsx`

**Purpose**: Tabbed sidebar for labels, calibration, annotations, and project info.

#### Tabs

1. **🏷️ Labels** - Label Library
   - Browse and select labels
   - Add/edit/delete labels
   - Category filtering
   - Search functionality

2. **📏 Calibration** - Calibration Status
   - View calibration data
   - Scale information
   - Reference measurements
   - Quick calibrate button

3. **📋 Annotations** - Annotations List
   - All annotations by page
   - Filter by type
   - Search annotations
   - Quick actions (delete, hide, duplicate)
   - Click to navigate

4. **ℹ️ Project** - Project Info
   - Project name/description
   - PDF file metadata
   - Statistics (annotation counts)
   - Management actions (clear, reset)

#### Width Specifications

- Desktop (≥1536px): 350px
- Large (1024-1535px): 280px
- Tablet/Mobile: 280px (overlay)

#### Animation

- Slide-in/out: `transform: translateX()`
- Duration: 300ms
- Easing: `ease-in-out`

---

### 4. RightSidebar Component

**File**: `/src/components/RightSidebar.tsx`

**Purpose**: Cost estimation panel with markup, categories, and item details.

#### Content

- **CostEstimationPanel**: Complete cost breakdown
  - Grand total with markup slider
  - Category totals with percentages
  - Detailed items list
  - Export options (JSON, CSV, Excel, Print)
  - Settings panel

#### Width Specifications

- Desktop (≥1536px): 420px
- Large (1024-1535px): 380px
- Tablet/Mobile: 320px (overlay)

#### Collapse Feature

- Desktop: Can collapse to 48px (vertical text)
- Expand button visible when collapsed
- Smooth transition

---

### 5. ProjectInfo Component

**File**: `/src/components/ProjectInfo.tsx`

**Purpose**: Display and manage project metadata and statistics.

#### Sections

1. **Project Details**
   - Editable name and description
   - Save/cancel buttons

2. **PDF Information**
   - File name, size, pages
   - Upload date
   - Current page

3. **Calibration Status**
   - Visual indicator (green/red)
   - Scale information
   - Reference measurements

4. **Annotation Statistics**
   - Total count
   - Breakdown by type
   - Breakdown by page
   - Available labels count

5. **Management Actions**
   - Clear all annotations
   - Reset entire project
   - Warning dialogs

---

### 6. AnnotationsList Component

**File**: `/src/components/AnnotationsList.tsx`

**Purpose**: Comprehensive list of all annotations with filtering and actions.

#### Features

- **Search**: Text-based search across annotations
- **Filter**: By type (marker, label, line, polygon)
- **Sort**: By page, type, date, or quantity
- **Group by Page**: Collapsible page sections
- **Quick Actions**:
  - Click to select and navigate
  - Hide/show annotations
  - Duplicate annotation
  - Delete annotation
- **Visual Indicators**:
  - Type icons with colors
  - Selected state highlighting
  - Badge counts

#### Empty State

Shows helpful message when no annotations exist or match filters.

---

## Usage Examples

### Basic Setup

```tsx
import { MainLayout } from './components/MainLayout';

function App() {
  return (
    <MainLayout
      pdfUrl="/path/to/drawing.pdf"
      projectId="project-001"
    />
  );
}
```

### With Metadata

```tsx
<MainLayout
  pdfUrl="/floor-plan.pdf"
  projectId="commercial-building-2024"
  pdfMetadata={{
    fileName: "Commercial Floor Plan - Level 1.pdf",
    fileSize: 2048000,
    totalPages: 12,
    uploadDate: new Date("2024-01-15")
  }}
  onProjectChange={(project) => {
    console.log("Project updated:", project);
    // Save to backend
  }}
/>
```

### Programmatic Control

```tsx
import { useAppStore } from './store/useAppStore';

function MyComponent() {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const currentPage = useAppStore((state) => state.currentPageNumber);

  return (
    <MainLayout pdfUrl="/drawing.pdf">
      <button onClick={() => setCurrentPage(1)}>Go to Page 1</button>
    </MainLayout>
  );
}
```

---

## Styling & Customization

### Tailwind Classes Used

#### Colors
- Primary: `blue-600`, `blue-700`
- Success: `green-50`, `green-600`
- Error: `red-50`, `red-600`
- Neutral: `gray-50` through `gray-900`

#### Spacing
- Navbar height: `h-16` (64px)
- Toolbar height: `h-13` (52px)
- Mobile action bar: `h-18` (72px)
- Sidebar padding: `p-4` (16px)

#### Z-Index Layering
- Backdrop: `z-30`
- Navbar: `z-30`
- Left Sidebar Overlay: `z-40`
- Right Sidebar Overlay: `z-40`
- Dropdowns: `z-50`

#### Transitions
- Sidebar slide: `transition-all duration-300 ease-in-out`
- Button hover: `transition-colors`
- Backdrop: `transition-opacity`

### Customizing Breakpoints

To modify breakpoints, edit the `handleResize` function in `MainLayout.tsx`:

```typescript
const handleResize = () => {
  const width = window.innerWidth;
  const mobile = width < 768;    // Change threshold
  const tablet = width >= 768 && width < 1280;  // Adjust range
  // ...
};
```

### Custom Sidebar Widths

Edit width classes in the component props:

```typescript
<LeftSidebar
  width="w-[400px]"  // Custom width
  // ...
/>
```

---

## Keyboard Shortcuts Reference

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Ctrl/Cmd + B` | Toggle left sidebar | Global |
| `Ctrl/Cmd + E` | Toggle right sidebar | Global |
| `Escape` | Close overlays | Overlay mode |
| `Ctrl/Cmd + Scroll` | Zoom PDF | PDF viewer |
| `Ctrl/Cmd + +/-` | Zoom in/out | PDF viewer |
| `Ctrl/Cmd + 0` | Reset zoom | PDF viewer |
| `Space + Drag` | Pan PDF | PDF viewer |
| `Arrow Keys` | Pan PDF | PDF viewer |
| `Delete` | Delete selected annotation | Annotation selected |

---

## Accessibility Features

### ARIA Labels
- All buttons have `aria-label` attributes
- Sidebar toggles have descriptive labels
- Status indicators use `aria-live="polite"`

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for navigation

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Descriptive link text
- Status announcements

### Focus Indicators
- Visible focus rings on all interactive elements
- High contrast focus states
- Skip to content links (optional)

---

## Performance Optimizations

### Debouncing
- Window resize events: 150ms debounce
- Search input: Real-time (consider adding debounce for large datasets)

### Memoization
- Filtered annotations list: `useMemo`
- Grouped annotations: `useMemo`
- Annotation counts: `useMemo`

### Lazy Loading
- Sidebar content: Rendered only when open
- PDF pages: Loaded on-demand by react-pdf

### Efficient Rendering
- Zustand store with selective subscriptions
- React.memo for heavy components (recommended)
- Virtualized lists for large annotation counts (future enhancement)

---

## Troubleshooting

### Sidebars Not Showing

**Problem**: Sidebars remain hidden after toggle.

**Solution**:
1. Check responsive breakpoint detection
2. Verify `isOpen` state is updating
3. Inspect z-index conflicts
4. Check Tailwind CSS is properly loaded

### PDF Not Displaying

**Problem**: PDF viewer shows blank or error.

**Solution**:
1. Verify `pdfUrl` prop is correct and accessible
2. Check CORS headers for external PDFs
3. Ensure react-pdf is properly configured
4. Check browser console for errors

### Layout Shifts on Resize

**Problem**: Layout jumps or shifts during window resize.

**Solution**:
1. Increase debounce time in `handleResize`
2. Add CSS transitions to smooth changes
3. Use `will-change` CSS property for animated elements

### Overlay Not Closing

**Problem**: Backdrop click doesn't close sidebars.

**Solution**:
1. Verify `onClick` handler on backdrop div
2. Check event propagation (stopPropagation)
3. Ensure z-index is correct (backdrop below sidebars)

---

## Future Enhancements

### Planned Features

1. **Swipe Gestures**
   - Swipe left/right to open/close sidebars on mobile
   - Swipe down to dismiss overlays

2. **Resizable Sidebars**
   - Drag handles to adjust sidebar widths
   - Remember custom widths per user

3. **Dark Mode**
   - Toggle switch in navbar
   - Persist theme preference
   - Adjust all colors for dark theme

4. **Multi-PDF Support**
   - Tabbed interface for multiple PDFs
   - Switch between documents
   - Unified annotation library

5. **Offline Mode**
   - Service worker for offline access
   - Local caching of PDFs and state
   - Sync when online

6. **Collaborative Features**
   - Real-time annotation sharing
   - Multi-user editing
   - Comments and discussions

---

## Integration Guide

### Adding Custom Components

To add a new tab to the left sidebar:

1. Create your component in `/src/components/`
2. Edit `LeftSidebar.tsx`:

```typescript
const TABS: TabDefinition[] = [
  // ... existing tabs
  {
    id: 'custom',
    label: 'Custom',
    icon: YourIcon,
    component: YourComponent,
  },
];
```

### Connecting to Backend

Example of saving project data:

```typescript
// In MainLayout.tsx
const handleProjectSave = async () => {
  const state = useAppStore.getState();

  await fetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      annotations: state.annotations,
      calibration: state.calibrationData,
      // ...
    }),
  });
};
```

### Custom Toolbar Actions

Add custom buttons to AnnotationToolbar:

```typescript
// In AnnotationToolbar.tsx
<Button onClick={customAction}>
  <CustomIcon />
  Custom Tool
</Button>
```

---

## Browser Support

### Tested Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Known Issues

- **Safari < 14**: CSS Grid layout issues (use flexbox fallback)
- **IE 11**: Not supported (no flexbox gap support)
- **Mobile Safari**: Touch event handling may require polyfill

---

## File Structure

```
src/
├── components/
│   ├── MainLayout.tsx          (600+ lines)
│   ├── Navbar.tsx              (300+ lines)
│   ├── LeftSidebar.tsx         (250+ lines)
│   ├── RightSidebar.tsx        (150+ lines)
│   ├── ProjectInfo.tsx         (350+ lines)
│   ├── AnnotationsList.tsx     (400+ lines)
│   ├── MainLayout.README.md    (This file)
│   └── ...
├── store/
│   └── useAppStore.ts
├── types/
│   ├── index.ts
│   └── store.ts
└── App.tsx
```

---

## Contributing

When modifying the layout components:

1. **Test all breakpoints**: Desktop, tablet, mobile
2. **Verify keyboard navigation**: Tab through all elements
3. **Check accessibility**: Run Lighthouse audit
4. **Update documentation**: Add notes to this README
5. **Add TypeScript types**: Keep all props typed
6. **Follow naming conventions**: Component names, file names, etc.

---

## License

MIT License - See project root for details.

---

## Support

For questions or issues:
- GitHub Issues: [repo-url]/issues
- Documentation: [docs-url]
- Email: support@example.com

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Author**: Construction Cost Estimator Team
