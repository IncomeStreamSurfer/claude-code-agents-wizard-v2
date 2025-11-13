# Cost Estimation Engine Documentation

## Overview

The Cost Estimation Engine is a comprehensive system for calculating construction costs from PDF annotations. It provides real-time cost calculations, category grouping, markup management, and visual representations.

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Cost Estimation Engine                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │   Core Calculations                     │   │
│  │   src/utils/costCalculations.ts         │   │
│  │   - Quantity calculations               │   │
│  │   - Cost aggregation                    │   │
│  │   - Category totals                     │   │
│  │   - Markup calculations                 │   │
│  └────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌────────────────────────────────────────┐   │
│  │   React Hook                            │   │
│  │   src/hooks/useCostEstimation.ts        │   │
│  │   - State management                    │   │
│  │   - Real-time updates                   │   │
│  │   - Export functions                    │   │
│  └────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌────────────────────────────────────────┐   │
│  │   UI Components                         │   │
│  │   - CostSummary (overview)              │   │
│  │   - CostBreakdown (details)             │   │
│  │   - CostChart (visualization)           │   │
│  └────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Core Concepts

### 1. Annotations
Annotations are measurements drawn on PDF pages:
- **Markers**: Point locations (count as 1)
- **Lines**: Linear measurements (converted to meters)
- **Polygons**: Area measurements (converted to square meters)
- **Rectangles**: Area measurements (converted to square meters)

### 2. Labels
Labels define what each annotation represents:
- Name (e.g., "Windows", "Walls", "Doors")
- Cost per unit
- Unit type (count, linear_meters, square_meters)
- Category (for grouping)

### 3. Calibration
Calibration converts pixel measurements to real-world units:
- Set a known reference length (e.g., 10 meters)
- Measure it in pixels on the drawing
- Calculate conversion factor: `metersPerPixel = referenceLength / pixelDistance`

### 4. Cost Calculation
Cost is calculated as: `totalCost = quantity × costPerUnit`

Where quantity depends on annotation type:
- **Count**: Always 1
- **Length**: Line length × metersPerPixel
- **Area**: Polygon area × metersPerPixel²

## API Reference

### Core Functions

#### `calculateAnnotationQuantity(annotation, calibrationData)`

Calculate quantity for a single annotation.

**Parameters:**
- `annotation: AnnotationData` - The annotation to measure
- `calibrationData: CalibrationData` - Calibration data for unit conversion

**Returns:**
```typescript
{
  quantity: number;    // Calculated quantity
  unit: string;        // Unit name (e.g., 'm', 'm²', 'count')
  rawValue?: number;   // Original pixel value
}
```

**Example:**
```typescript
const result = calculateAnnotationQuantity(annotation, calibrationData);
console.log(`${result.quantity} ${result.unit}`); // "25.5 m"
```

---

#### `calculateAnnotationCost(annotation, calibrationData, label)`

Calculate cost for a single annotation with its label.

**Parameters:**
- `annotation: AnnotationData` - The annotation
- `calibrationData: CalibrationData` - Calibration data
- `label: LabelDefinition` - Label with cost information

**Returns:**
```typescript
{
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  category?: string;
  // ... other CostItem fields
}
```

**Example:**
```typescript
const cost = calculateAnnotationCost(annotation, calibrationData, windowLabel);
console.log(`${cost.description}: ${cost.totalCost}`); // "Windows: $1500"
```

---

#### `aggregateAnnotationsToCosts(annotations, calibrationData, labels)`

Aggregate all annotations into cost items, grouped by label.

**Parameters:**
- `annotations: AnnotationData[]` - All annotations
- `calibrationData: CalibrationData` - Calibration data
- `labels: LabelDefinition[]` - Available labels

**Returns:**
```typescript
CostItem[]  // Array of aggregated cost items
```

**Example:**
```typescript
const costItems = aggregateAnnotationsToCosts(
  allAnnotations,
  calibrationData,
  labels
);

costItems.forEach(item => {
  console.log(`${item.description}: ${item.quantity} ${item.unit} @ $${item.unitCost} = $${item.totalCost}`);
});
```

---

#### `groupCostsByCategory(costItems)`

Group cost items by category.

**Returns:**
```typescript
Record<string, CostItem[]>
```

**Example:**
```typescript
const grouped = groupCostsByCategory(costItems);
// {
//   "Openings": [window1, window2, door1],
//   "Structure": [wall1, wall2, beam1],
// }
```

---

#### `calculateCategoryTotals(costItems)`

Calculate totals for each category.

**Returns:**
```typescript
Record<string, {
  quantity: number;
  cost: number;
  count: number;
  percentage?: number;
}>
```

**Example:**
```typescript
const totals = calculateCategoryTotals(costItems);
// {
//   "Openings": { quantity: 25, cost: 12500, count: 15, percentage: 45.2 }
// }
```

---

#### `calculateGrandTotal(costItems)`

Calculate total cost of all items.

**Returns:** `number`

**Example:**
```typescript
const total = calculateGrandTotal(costItems);
console.log(`Total: $${total}`); // "Total: $27500"
```

---

#### `calculateWithMarkup(baseCost, markupPercent)`

Calculate cost with markup/contingency.

**Parameters:**
- `baseCost: number` - Base cost
- `markupPercent: number` - Markup percentage (0-100)

**Returns:** `number`

**Example:**
```typescript
const final = calculateWithMarkup(25000, 15);
console.log(final); // 28750 (25000 * 1.15)
```

---

#### `formatCurrency(amount, currency?, locale?)`

Format amount as currency.

**Parameters:**
- `amount: number` - Amount to format
- `currency: string` - Currency code (default: 'USD')
- `locale: string` - Locale (default: 'en-US')

**Returns:** `string`

**Example:**
```typescript
formatCurrency(1234.56); // "$1,234.56"
formatCurrency(1234.56, 'EUR', 'de-DE'); // "1.234,56 €"
```

---

### React Hook

#### `useCostEstimation()`

React hook for cost estimation management.

**Returns:**
```typescript
{
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
  getSummary: () => SummaryData;
  getCostPerPage: () => Record<number, number>;
  getMostExpensiveItems: (limit?: number) => CostItem[];
}
```

**Example:**
```typescript
function MyComponent() {
  const {
    grandTotal,
    markupPercent,
    totalWithMarkup,
    setMarkup,
    formatCost,
  } = useCostEstimation();

  return (
    <div>
      <h2>Base Total: {formatCost(grandTotal)}</h2>
      <input
        type="number"
        value={markupPercent}
        onChange={(e) => setMarkup(parseFloat(e.target.value))}
      />
      <h2>Final Total: {formatCost(totalWithMarkup)}</h2>
    </div>
  );
}
```

---

#### `useCostFilters(costItems)`

React hook for filtering cost items.

**Parameters:**
- `costItems: CostItem[]` - Items to filter

**Returns:**
```typescript
{
  filteredItems: CostItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  minCost: number | null;
  setMinCost: (min: number | null) => void;
  maxCost: number | null;
  setMaxCost: (max: number | null) => void;
  clearFilters: () => void;
  hasFilters: boolean;
}
```

**Example:**
```typescript
function FilteredCostList() {
  const { costItems } = useCostEstimation();
  const {
    filteredItems,
    searchTerm,
    setSearchTerm,
  } = useCostFilters(costItems);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {filteredItems.map(item => (
        <div key={item.id}>{item.description}</div>
      ))}
    </div>
  );
}
```

## UI Components

### CostSummary

Quick cost overview with markup controls.

**Features:**
- Large, prominent total display
- Markup percentage slider and input
- Category breakdown cards
- Progress bars showing percentage distribution

**Usage:**
```typescript
import { CostSummary } from './components/CostSummary';

function App() {
  return <CostSummary />;
}
```

---

### CostBreakdown

Detailed cost breakdown table.

**Features:**
- All cost items with full details
- Group by category with subtotals
- Expandable/collapsible sections
- Sort by any column
- Search and filter
- Export to JSON/CSV

**Usage:**
```typescript
import { CostBreakdown } from './components/CostBreakdown';

function App() {
  return <CostBreakdown />;
}
```

---

### CostChart

Visual cost representation with charts.

**Features:**
- Pie chart showing percentage by category
- Bar chart showing totals by category
- Interactive tooltips
- Click to filter/highlight
- Category details table

**Usage:**
```typescript
import { CostChart } from './components/CostChart';

function App() {
  return <CostChart />;
}
```

---

### CostEstimationDemo

Complete demo with all features.

**Features:**
- Tabbed interface
- Status indicators
- Quick statistics
- Integration examples
- Features list

**Usage:**
```typescript
import { CostEstimationDemo } from './components/CostEstimationDemo';

function App() {
  return <CostEstimationDemo />;
}
```

## Quantity Calculation Formulas

### Point Markers (Count)
```
quantity = 1
unit = 'count'
```

### Line Measurements (Length)
```
pixelLength = sqrt((x2 - x1)² + (y2 - y1)²)
meters = pixelLength × metersPerPixel
quantity = meters
unit = 'linear_meters'
```

### Polygon Areas (Shoelace Formula)
```
area_pixels = |Σ(x[i] × y[i+1] - x[i+1] × y[i])| / 2
area_m² = area_pixels × (metersPerPixel)²
quantity = area_m²
unit = 'square_meters'
```

### Rectangle Areas
```
area_pixels = width × height
area_m² = area_pixels × (metersPerPixel)²
quantity = area_m²
unit = 'square_meters'
```

## Integration with Zustand Store

The cost estimation engine integrates seamlessly with the Zustand store:

```typescript
// Store automatically triggers recalculation when:
// 1. Annotation added/updated/deleted
store.addAnnotation(annotation);  // → recalculates costs
store.updateAnnotation(id, updates);  // → recalculates costs
store.deleteAnnotation(id);  // → recalculates costs

// 2. Calibration changed
store.computeCalibration(refLength, pixelDist);  // → recalculates costs

// 3. Label updated (if costPerUnit changed)
store.updateLabel(id, { costPerUnit: 150 });  // → recalculates costs

// Manual recalculation
store.calculateCostItems();
```

## Error Handling

### Not Calibrated
```typescript
if (!calibrationData.isCalibrated) {
  // Show warning: "Calibration required"
  // Cost calculations will return empty array
  return [];
}
```

### Missing Label
```typescript
if (!label) {
  // Skip annotation, warn in console
  console.warn(`No label found for annotation ${annotation.id}`);
  return null;
}
```

### Missing Cost Per Unit
```typescript
const unitCost = label.costPerUnit || 0;
// Defaults to 0, allows quantity tracking without cost
```

### Invalid Calibration
```typescript
const errors = validateCostCalculation(calibrationData);
if (errors.length > 0) {
  errors.forEach(error => console.error(error));
}
```

## Performance Optimization

### Memoization
All expensive calculations are memoized using `useMemo`:
```typescript
const costItems = useMemo(() => {
  return aggregateAnnotationsToCosts(annotations, calibration, labels);
}, [annotations, calibration, labels]);
```

### Debouncing
Markup changes trigger immediate UI updates but don't recalculate costs:
```typescript
// Markup only affects display, not core calculations
const totalWithMarkup = calculateWithMarkup(grandTotal, markupPercent);
```

### Batch Updates
Store uses Immer middleware for efficient batch updates:
```typescript
set((state) => {
  // Multiple changes in one update
  state.annotations[pageNum].push(annotation);
  state.costItems = recalculatedCosts;
});
```

## Testing Scenarios

### Test 1: Basic Cost Calculation
```typescript
// Setup
const calibration = { metersPerPixel: 0.01, isCalibrated: true };
const annotation = { type: 'marker', labelId: 'label-1' };
const label = { id: 'label-1', costPerUnit: 500, unit: 'count' };

// Execute
const cost = calculateAnnotationCost(annotation, calibration, label);

// Assert
expect(cost.quantity).toBe(1);
expect(cost.totalCost).toBe(500);
```

### Test 2: Line Measurement
```typescript
const annotation = {
  type: 'line',
  lineLength: 100, // pixels
  labelId: 'label-wall',
};
const label = { id: 'label-wall', costPerUnit: 150, unit: 'linear_meters' };
const calibration = { metersPerPixel: 0.1, isCalibrated: true };

const cost = calculateAnnotationCost(annotation, calibration, label);

expect(cost.quantity).toBe(10); // 100px × 0.1 = 10m
expect(cost.totalCost).toBe(1500); // 10m × $150/m = $1500
```

### Test 3: Polygon Area
```typescript
const annotation = {
  type: 'polygon',
  polygonArea: 10000, // square pixels
  labelId: 'label-floor',
};
const label = { id: 'label-floor', costPerUnit: 80, unit: 'square_meters' };
const calibration = { metersPerPixel: 0.1, isCalibrated: true };

const cost = calculateAnnotationCost(annotation, calibration, label);

expect(cost.quantity).toBe(100); // 10000px² × 0.01 = 100m²
expect(cost.totalCost).toBe(8000); // 100m² × $80/m² = $8000
```

### Test 4: Markup Calculation
```typescript
const baseCost = 25000;
const markupPercent = 15;

const total = calculateWithMarkup(baseCost, markupPercent);

expect(total).toBe(28750); // 25000 × 1.15
```

### Test 5: Category Aggregation
```typescript
const costItems = [
  { category: 'Openings', totalCost: 5000 },
  { category: 'Openings', totalCost: 3000 },
  { category: 'Structure', totalCost: 10000 },
];

const totals = calculateCategoryTotals(costItems);

expect(totals['Openings'].cost).toBe(8000);
expect(totals['Structure'].cost).toBe(10000);
expect(totals['Openings'].percentage).toBe(44.44);
```

## Troubleshooting

### Issue: Costs not updating
**Solution:** Check if calibration is complete and annotations have labelIds.

### Issue: Quantities showing as pixels
**Solution:** Calibrate the drawing to enable real-world units.

### Issue: Missing cost items
**Solution:** Ensure annotations have valid labelIds and labels exist in store.

### Issue: Incorrect totals
**Solution:** Check label costPerUnit values and unit types match annotation types.

### Issue: Export not working
**Solution:** Check browser console for errors, ensure cost items exist.

## Best Practices

1. **Always calibrate first** before adding annotations
2. **Assign labels** to all annotations for cost tracking
3. **Set cost per unit** on labels for accurate estimates
4. **Use categories** to organize cost items logically
5. **Add markup** for realistic project estimates
6. **Export regularly** to save cost data
7. **Test calculations** with known measurements
8. **Document assumptions** in annotation notes

## Future Enhancements

- [ ] Cost templates for common projects
- [ ] Historical cost data and trending
- [ ] Multi-currency support
- [ ] PDF report generation
- [ ] Cost comparison between versions
- [ ] Integration with external pricing APIs
- [ ] Custom formulas for complex calculations
- [ ] Budget tracking and variance analysis

## Support

For issues, questions, or contributions, please refer to the main project documentation.

---

**Version:** 1.0.0
**Last Updated:** 2024-11-13
