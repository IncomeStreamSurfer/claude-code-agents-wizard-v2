# Cost Estimation Panel - Comprehensive Documentation

## Overview

The Cost Estimation Panel is a comprehensive, production-ready sidebar component for displaying live cost calculations with real-time updates and extensive export functionality. It serves as the primary cost management interface in the construction cost estimator application.

## Components

### 1. CostEstimationPanel (Main Component)

**File:** `/src/components/CostEstimationPanel.tsx`

The main panel component that displays all cost information in a collapsible sidebar.

#### Features

- **Grand Total Display**: Large, bold cost display with color-coded styling
- **Markup Calculator**: Interactive slider (0-50%) with direct input field
- **Statistics Section**: Shows annotation count, cost items, categories, and calibration status
- **Category Breakdown Tab**: Organized view of costs by category with percentages
- **Items Tab**: Detailed list with search, sort, and filter capabilities
- **Export Options**: Download as JSON, CSV, or print
- **Settings Panel**: Customize display preferences
- **Real-time Updates**: Auto-recalculates with debouncing (500ms)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Collapsible Interface**: Can be collapsed to save screen space

#### Props

```typescript
interface CostEstimationPanelProps {
  width?: number | string;        // Panel width (default: '400px')
  collapsible?: boolean;          // Enable collapse button (default: true)
  showChart?: boolean;            // Show chart button (default: false)
  compact?: boolean;              // Compact mode (default: false)
  onExport?: (format: string, data: any) => void;  // Export callback
  onSettingsChange?: (settings: PanelSettings) => void;  // Settings callback
}
```

#### Usage

```typescript
import { CostEstimationPanel } from './components/CostEstimationPanel';

function App() {
  const handleExport = (format, data) => {
    console.log('Exporting as:', format);
  };

  const handleSettingsChange = (settings) => {
    console.log('Settings updated:', settings);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        {/* Main content */}
      </div>
      <CostEstimationPanel
        width="400px"
        collapsible={true}
        showChart={true}
        onExport={handleExport}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
```

### 2. CostCategorySection

**File:** `/src/components/CostCategorySection.tsx`

Collapsible category section showing items grouped by category.

#### Features

- Category header with total cost and percentage
- Visual progress bar showing percentage of total
- Color-coded categories
- Expandable item list
- Item details with quantities and unit costs

#### Props

```typescript
interface CostCategorySectionProps {
  category: string;
  totals: CategoryTotals;
  items: CostItem[];
  isExpanded: boolean;
  onToggle: () => void;
  formatCost: (amount: number) => string;
  showPercentages?: boolean;
  showUnits?: boolean;
}
```

### 3. CostExportPanel

**File:** `/src/components/CostExportPanel.tsx`

Modal dialog for exporting cost data in multiple formats.

#### Features

- Multiple export formats: JSON, CSV, Excel (planned), Print
- Format preview
- Filename customization
- Export options:
  - Include markup
  - Include unit costs
  - Group by category
  - Include page info
  - Include notes
  - Include timestamps
- Copy to clipboard
- Download to file

#### Props

```typescript
interface CostExportPanelProps {
  costItems: CostItem[];
  grandTotal: number;
  totalWithMarkup: number;
  markupPercent: number;
  onClose: () => void;
  onExport?: (format: string, data: any) => void;
}
```

#### Export Formats

**JSON Format:**
```json
{
  "exportDate": "2024-01-15T10:30:00.000Z",
  "summary": {
    "grandTotal": 45320.00,
    "markupPercent": 15,
    "totalWithMarkup": 52118.00,
    "totalItems": 12
  },
  "items": [
    {
      "description": "Windows",
      "quantity": 8,
      "unit": "ea",
      "unitCost": 500,
      "totalCost": 4000,
      "category": "Openings"
    }
  ]
}
```

**CSV Format:**
```csv
Description,Quantity,Unit,Unit Cost,Total Cost,Category,Page Number,Notes
"Windows",8,"ea",500,4000,"Openings",1,"Standard double-hung"
"Doors",4,"ea",800,3200,"Openings",1,"Solid wood exterior"
```

### 4. CostSettingsPanel

**File:** `/src/components/CostSettingsPanel.tsx`

Modal dialog for customizing panel display settings.

#### Settings Options

- **Currency Selection**: USD, EUR, GBP, CAD, AUD, JPY, CNY, INR
- **Decimal Places**: 0, 1, 2, or 3 decimal places
- **Grouping**: By category, page, or label
- **Display Options**:
  - Show units (m, m², ea)
  - Show percentages
  - Show zero-cost items
  - Auto-refresh

#### Props

```typescript
interface CostSettingsPanelProps {
  settings: PanelSettings;
  onClose: () => void;
  onChange: (settings: Partial<PanelSettings>) => void;
}
```

### 5. CostPrintView

**File:** `/src/components/CostPrintView.tsx`

Professional print-ready view of cost estimates.

#### Features

- Professional print layout with proper margins
- Project header with title and description
- Cost summary box with totals
- Detailed breakdown by category
- Category subtotals
- Grand total with markup
- Automatic page breaks for long lists
- Print-specific CSS styling
- Footer with generation timestamp

#### Props

```typescript
interface CostPrintViewProps {
  costItems: CostItem[];
  categoryTotals: Record<string, CategoryTotals>;
  grandTotal: number;
  totalWithMarkup: number;
  markupPercent: number;
  projectName?: string;
  projectDescription?: string;
  formatCost: (amount: number) => string;
}
```

### 6. CostEstimationPanelDemo

**File:** `/src/components/CostEstimationPanelDemo.tsx`

Interactive demo showing all panel features.

#### Features

- Sample data generation
- Panel width adjustment
- Compact mode toggle
- Print preview
- Statistics display
- Usage instructions

## Integration Guide

### Step 1: Install Dependencies

The component uses the following dependencies (already in package.json):

```json
{
  "lucide-react": "^0.553.0",
  "zustand": "^5.0.8",
  "react": "^19.2.0",
  "tailwindcss": "^3.4.18"
}
```

### Step 2: Import Components

```typescript
import { CostEstimationPanel } from './components/CostEstimationPanel';
import { useCostEstimation } from './hooks/useCostEstimation';
```

### Step 3: Use in Layout

```typescript
function MainLayout() {
  return (
    <div className="flex h-screen">
      {/* Left sidebar - tools */}
      <div className="w-64 bg-gray-800">
        {/* Annotation tools */}
      </div>

      {/* Center - PDF viewer */}
      <div className="flex-1 bg-gray-100">
        {/* PDF viewer with annotations */}
      </div>

      {/* Right sidebar - cost panel */}
      <CostEstimationPanel
        width="400px"
        collapsible={true}
        showChart={true}
      />
    </div>
  );
}
```

### Step 4: Access Cost Data

The panel automatically integrates with the Zustand store through the `useCostEstimation` hook.

```typescript
function CustomComponent() {
  const {
    costItems,
    grandTotal,
    totalWithMarkup,
    markupPercent,
    setMarkup,
    downloadCosts,
  } = useCostEstimation();

  return (
    <div>
      <h1>Total: ${grandTotal}</h1>
      <button onClick={() => downloadCosts('csv')}>
        Export CSV
      </button>
    </div>
  );
}
```

## API Reference

### useCostEstimation Hook

Returns cost estimation state and actions.

```typescript
interface CostEstimationReturn {
  // Core data
  costItems: CostItem[];
  groupedCosts: Record<string, CostItem[]>;
  categoryTotals: Record<string, CategoryTotals>;
  grandTotal: number;

  // Markup
  markupPercent: number;
  totalWithMarkup: number;
  markupAmount: number;

  // Status
  isCalibrated: boolean;
  hasAnnotations: boolean;
  hasLabels: boolean;

  // Counts
  totalItems: number;
  totalAnnotations: number;
  totalCategories: number;

  // Actions
  recalculate: () => void;
  setMarkup: (percent: number) => void;
  getCostsByCategory: (category: string) => CostItem[];
  getCostsByLabel: (labelId: string) => CostItem[];
  getCostsByPage: (pageNumber: number) => CostItem[];
  exportCosts: (format: 'json' | 'csv') => string;
  downloadCosts: (format: 'json' | 'csv', filename?: string) => void;
  formatCost: (amount: number) => string;
  getSummary: () => CostSummary;
  getCostPerPage: () => Record<number, number>;
  getMostExpensiveItems: (limit?: number) => CostItem[];
}
```

## Styling Customization

### Tailwind Classes

The component uses Tailwind CSS. You can customize colors by modifying the classes:

```typescript
// Change primary color from blue to purple
<button className="bg-purple-600 hover:bg-purple-700">
  Export
</button>

// Change category colors
const CATEGORY_COLORS = {
  'Openings': 'bg-purple-500',
  'Structure': 'bg-indigo-500',
  // ...
};
```

### Category Colors

Default category color mapping:

- **Openings**: Blue (#3B82F6)
- **Structure**: Green (#10B981)
- **Surfaces**: Yellow (#F59E0B)
- **MEP**: Red (#EF4444)
- **Finishes**: Purple (#8B5CF6)
- **Foundations**: Gray (#6B7280)
- **Roofing**: Orange (#F97316)
- **Windows**: Cyan (#06B6D4)
- **Doors**: Indigo (#6366F1)
- **Uncategorized**: Gray (#9CA3AF)

## Performance Optimization

### Memoization

The component uses React's `useMemo` and `useCallback` extensively:

```typescript
// Expensive calculations are memoized
const filteredAndSortedItems = useMemo(() => {
  // Filtering and sorting logic
}, [costItems, searchTerm, sortField, sortDirection]);

// Event handlers are memoized
const handleMarkupChange = useCallback((value: number) => {
  setMarkup(value);
}, [setMarkup]);
```

### Debouncing

Real-time updates are debounced to prevent excessive recalculations:

```typescript
useEffect(() => {
  if (settings.autoRefresh && isCalibrated && hasAnnotations) {
    const timer = setTimeout(() => {
      recalculate();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }
}, [settings.autoRefresh, isCalibrated, hasAnnotations, recalculate]);
```

### Virtual Scrolling (Future Enhancement)

For lists with 100+ items, consider implementing virtual scrolling:

```typescript
import { FixedSizeList } from 'react-window';

// Virtualized list for large datasets
<FixedSizeList
  height={600}
  itemCount={costItems.length}
  itemSize={60}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* Render cost item */}
    </div>
  )}
</FixedSizeList>
```

## Accessibility

### ARIA Labels

All interactive elements have proper ARIA labels:

```typescript
<button
  onClick={handleRefresh}
  aria-label="Refresh costs"
  className="..."
>
  <RefreshCw className="w-4 h-4" />
</button>
```

### Keyboard Navigation

- Tab through buttons and inputs
- Enter/Space to activate buttons
- Escape to close modals

### Screen Reader Support

- Semantic HTML structure
- Descriptive text for icons
- Status indicators for loading states

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CostEstimationPanel } from './CostEstimationPanel';

describe('CostEstimationPanel', () => {
  it('renders grand total', () => {
    render(<CostEstimationPanel />);
    expect(screen.getByText(/Grand Total/i)).toBeInTheDocument();
  });

  it('updates markup on slider change', () => {
    render(<CostEstimationPanel />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 25 } });
    // Assert markup is updated
  });
});
```

### Integration Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useCostEstimation } from '../hooks/useCostEstimation';

describe('useCostEstimation', () => {
  it('calculates grand total correctly', () => {
    const { result } = renderHook(() => useCostEstimation());
    expect(result.current.grandTotal).toBe(0);
  });
});
```

## Troubleshooting

### Issue: Panel not showing costs

**Solution:** Ensure calibration is complete and annotations have labels assigned.

```typescript
// Check calibration status
const { isCalibrated, hasAnnotations } = useCostEstimation();
console.log({ isCalibrated, hasAnnotations });
```

### Issue: Export not working

**Solution:** Check browser permissions for file downloads.

```typescript
// Test export functionality
const { exportCosts } = useCostEstimation();
const data = exportCosts('json');
console.log(data);
```

### Issue: Real-time updates not working

**Solution:** Verify auto-refresh is enabled in settings.

```typescript
// Enable auto-refresh
const settings = {
  autoRefresh: true,
  // ... other settings
};
```

## Examples

### Basic Integration

```typescript
import { CostEstimationPanel } from './components/CostEstimationPanel';

function App() {
  return (
    <div className="flex h-screen">
      <main className="flex-1">
        {/* Your content */}
      </main>
      <CostEstimationPanel />
    </div>
  );
}
```

### With Custom Export Handler

```typescript
function App() {
  const handleExport = (format, data) => {
    // Send to server
    fetch('/api/export', {
      method: 'POST',
      body: JSON.stringify({ format, data }),
    });
  };

  return (
    <CostEstimationPanel onExport={handleExport} />
  );
}
```

### With Custom Width

```typescript
function App() {
  const [width, setWidth] = useState('400px');

  return (
    <>
      <select onChange={(e) => setWidth(e.target.value)}>
        <option value="300px">Compact</option>
        <option value="400px">Default</option>
        <option value="500px">Wide</option>
      </select>
      <CostEstimationPanel width={width} />
    </>
  );
}
```

## Keyboard Shortcuts

- **Ctrl/Cmd + E**: Export panel
- **Ctrl/Cmd + R**: Refresh costs
- **Ctrl/Cmd + ,**: Open settings
- **Escape**: Close modals
- **Tab**: Navigate between controls

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

1. **Excel Export**: Full XLSX support with formatting
2. **Email Integration**: Send estimates via email
3. **Cloud Sync**: Save estimates to cloud storage
4. **Chart Integration**: Show chart view inline
5. **Mobile Optimization**: Bottom sheet on mobile
6. **Dark Mode**: Theme toggle support
7. **Collaborative Editing**: Real-time cost sharing
8. **Historical Comparison**: Compare estimates over time

## Contributing

When contributing to this component:

1. Follow existing code style
2. Add JSDoc comments for new functions
3. Write tests for new features
4. Update this documentation
5. Ensure accessibility compliance

## License

Part of the Construction Cost Estimator application.

## Support

For issues or questions, please refer to the main project README or create an issue in the repository.
