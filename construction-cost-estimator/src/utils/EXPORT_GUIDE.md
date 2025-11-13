# Export Functionality Guide

Comprehensive documentation for the export system in the Construction Cost Estimator application.

## Table of Contents

- [Overview](#overview)
- [Supported Formats](#supported-formats)
- [Core Utilities](#core-utilities)
- [React Hook](#react-hook)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Advanced Features](#advanced-features)
- [Customization](#customization)
- [Error Handling](#error-handling)
- [Performance](#performance)

## Overview

The export system provides comprehensive functionality for exporting project data, cost estimates, and annotations in multiple formats:

- **JSON** - Machine-readable format for data interchange
- **CSV** - Spreadsheet-compatible format
- **PDF** - Professional reports with formatting
- **Excel** - Multi-sheet workbooks with styling

### Key Features

- Multiple export formats (JSON, CSV, PDF, Excel)
- Customizable export options
- Progress tracking for large exports
- Markup/margin calculation
- Category grouping and subtotals
- Professional PDF reports
- Excel workbooks with multiple sheets
- GeoJSON support for annotations
- Validation and error handling

## Supported Formats

### JSON

**Best for:**
- Data interchange
- Backups
- API integration
- Full project exports

**Features:**
- Pretty-printed output
- Metadata inclusion
- Complete data preservation
- GeoJSON variant for annotations

**Example output:**
```json
{
  "export": {
    "version": "1.0",
    "exportDate": "2024-01-15T10:30:00Z"
  },
  "costItems": [...],
  "summary": {
    "subtotal": 45320,
    "markup": { "percentage": 15, "amount": 6798 },
    "total": 52118
  }
}
```

### CSV

**Best for:**
- Excel import
- Google Sheets
- Data analysis
- Simple reports

**Features:**
- Proper CSV escaping
- Category grouping
- Subtotals
- Metadata headers
- Excel-compatible formatting

**Example output:**
```csv
Description,Quantity,Unit,Unit Cost,Total Cost,Category
Windows,8,count,500.00,4000.00,Openings
Doors,4,count,800.00,3200.00,Openings

SUBTOTAL,,,,45320.00,
Markup (15%),,,,6798.00,
TOTAL,,,,52118.00,
```

### PDF

**Best for:**
- Professional reports
- Client presentations
- Printing
- Document archival

**Features:**
- Cover page
- Cost summary
- Detailed breakdown
- Headers/footers
- Page numbering
- Professional styling
- Charts (optional)

**Structure:**
1. Cover page (project name, date)
2. Summary page (category totals)
3. Detailed breakdown (all items)
4. Annotations list (optional)

### Excel

**Best for:**
- Detailed analysis
- Multi-sheet reports
- Advanced formatting
- Data manipulation

**Features:**
- Multiple sheets (Summary, Items, Annotations)
- Cell formatting
- Currency formatting
- Number formatting
- Auto-fit columns
- Header styling

## Core Utilities

### File Structure

```
src/utils/
├── exporters.ts        # Main export functions
├── csvExporter.ts      # CSV-specific code
├── pdfExporter.ts      # PDF generation
├── excelExporter.ts    # Excel export
└── EXPORT_GUIDE.md     # This file
```

### Main Functions

#### `exporters.ts`

```typescript
// JSON exports
exportProjectAsJSON(project, options)
exportCostEstimateAsJSON(costItems, options)
exportAnnotationsAsJSON(annotations, options)
exportAnnotationsAsGeoJSON(annotations)

// CSV exports
exportProjectAsCSV(project)
exportCostItemsAsCSV(costItems, options)
exportAnnotationsAsCSV(annotations)
exportCostSummaryAsCSV(categoryTotals, total, markup)

// PDF exports
exportCostEstimateAsPDF(costItems, options)
exportProjectAsPDF(project, costItems, annotations, options)

// Excel exports
exportCostEstimateAsExcel(costItems, options)
exportFullProjectAsExcel(project, costItems, annotations, options)

// Batch exports
exportFullProject(project, costItems, annotations, calibration, options)

// Utilities
downloadBlob(blob, filename)
downloadText(text, filename, mimeType)
formatCurrencyForCSV(amount)
generateReportHeader(title, date)
estimateExportSize(itemCount, format)
validateExportData(data)
sanitizeFilename(filename)
generateFilename(prefix, extension, includeTimestamp)
```

## React Hook

### `useExport()`

The main hook for managing exports in React components.

```typescript
import { useExport } from '../hooks/useExport';

function MyComponent() {
  const {
    // Project exports
    exportProjectJSON,
    exportProjectCSV,
    exportProjectPDF,

    // Cost exports
    exportCostJSON,
    exportCostCSV,
    exportCostPDF,
    exportCostExcel,

    // Annotation exports
    exportAnnotationsJSON,
    exportAnnotationsCSV,
    exportAnnotationsGeoJSON,

    // Full project export
    exportFullProjectJSON,

    // State
    isExporting,
    exportProgress,
    lastExportFormat,
    lastExportFilename,
    error,

    // Actions
    resetExport,
  } = useExport();

  return (
    <button onClick={() => exportCostPDF(costItems, { markup: 15 })}>
      Export PDF
    </button>
  );
}
```

### Hook Features

- **Automatic progress tracking** - Progress updates during export
- **Error handling** - Catches and reports export errors
- **Validation** - Validates data before export
- **State management** - Tracks export status
- **Async support** - Handles async exports (PDF, Excel)

## Components

### ExportMenu

Dropdown menu for quick exports.

```typescript
import { ExportMenu } from '../components/ExportMenu';

<ExportMenu
  project={project}
  costItems={costItems}
  annotations={annotations}
  dataType="costs"
  markup={15}
/>
```

**Props:**
- `project` - Project data (optional)
- `costItems` - Cost items array (optional)
- `annotations` - Annotations array (optional)
- `calibrationData` - Calibration data (optional)
- `dataType` - Type of data ('project' | 'costs' | 'annotations' | 'full')
- `markup` - Markup percentage (default: 0)
- `className` - Additional CSS classes

**Features:**
- Format selection (JSON, CSV, PDF, Excel)
- File size estimates
- Progress indicator
- Click-outside to close
- Keyboard accessible

### ExportDialog

Advanced export dialog with detailed options.

```typescript
import { ExportDialog } from '../components/ExportDialog';

<ExportDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  project={project}
  costItems={costItems}
  annotations={annotations}
  calibrationData={calibrationData}
  defaultMarkup={15}
/>
```

**Props:**
- `isOpen` - Dialog visibility
- `onClose` - Close handler
- `project` - Project data (optional)
- `costItems` - Cost items (optional)
- `annotations` - Annotations (optional)
- `calibrationData` - Calibration data (optional)
- `defaultFormat` - Default export format
- `defaultMarkup` - Default markup percentage

**Features:**
- Format selection with descriptions
- Custom filename input
- Markup percentage input
- Include/exclude options (JSON)
- PDF-specific options
- Progress bar
- Success/error messages
- Preview option (future)

## Usage Examples

### Basic Export

```typescript
import { useExport } from '../hooks/useExport';

function CostEstimate({ costItems }) {
  const { exportCostCSV } = useExport();

  const handleExport = () => {
    exportCostCSV(costItems, {
      markup: 15,
      groupByCategory: true,
    });
  };

  return (
    <button onClick={handleExport}>
      Export to CSV
    </button>
  );
}
```

### Export with Progress

```typescript
function AdvancedExport({ costItems }) {
  const {
    exportCostPDF,
    isExporting,
    exportProgress,
  } = useExport();

  return (
    <div>
      <button
        onClick={() => exportCostPDF(costItems, { markup: 20 })}
        disabled={isExporting}
      >
        {isExporting ? `Exporting... ${exportProgress}%` : 'Export PDF'}
      </button>

      {isExporting && (
        <div className="progress-bar">
          <div style={{ width: `${exportProgress}%` }} />
        </div>
      )}
    </div>
  );
}
```

### Full Project Export

```typescript
function ProjectExport({ project, costItems, annotations, calibration }) {
  const { exportFullProjectJSON } = useExport();

  const handleExport = () => {
    exportFullProjectJSON(
      project,
      costItems,
      annotations,
      calibration,
      {
        markup: 15,
        includeTimestamp: true,
      }
    );
  };

  return <button onClick={handleExport}>Export Full Project</button>;
}
```

### Custom Filename

```typescript
function CustomExport({ costItems }) {
  const { exportCostExcel } = useExport();

  const handleExport = () => {
    exportCostExcel(costItems, {
      filename: 'my-custom-estimate.xlsx',
      markup: 10,
      includeTimestamp: false,
    });
  };

  return <button onClick={handleExport}>Export Excel</button>;
}
```

### Export Menu Integration

```typescript
import { ExportMenu } from '../components/ExportMenu';

function Dashboard({ project, costItems }) {
  return (
    <div className="dashboard">
      <h1>{project.name}</h1>

      <ExportMenu
        project={project}
        costItems={costItems}
        dataType="costs"
        markup={15}
        className="ml-auto"
      />
    </div>
  );
}
```

## API Reference

### Export Options

```typescript
interface ExportOptions {
  filename?: string;           // Custom filename
  includeTimestamp?: boolean;  // Add timestamp to filename (default: true)
  markup?: number;             // Markup percentage (default: 0)
  includeMetadata?: boolean;   // Include export metadata (default: true)
  groupByCategory?: boolean;   // Group items by category (default: true)
}
```

### PDF Options

```typescript
interface PDFOptions {
  includeCoverPage?: boolean;     // Include cover page (default: true)
  includeSummary?: boolean;       // Include summary page (default: true)
  includeDetails?: boolean;       // Include detailed breakdown (default: true)
  includeAnnotations?: boolean;   // Include annotations list
  pageNumbers?: boolean;          // Show page numbers (default: true)
  headerFooter?: boolean;         // Show headers/footers (default: true)
  markup?: number;                // Markup percentage
  projectName?: string;           // Project name for header
  companyName?: string;           // Company name for cover
  companyLogo?: string;           // Logo image data
}
```

### Excel Options

```typescript
interface ExcelExportOptions {
  includeCharts?: boolean;        // Include charts (future)
  includeSummary?: boolean;       // Include summary sheet (default: true)
  includeAnnotations?: boolean;   // Include annotations sheet
  markup?: number;                // Markup percentage
  sheetNames?: {
    summary?: string;
    costs?: string;
    annotations?: string;
  };
}
```

## Advanced Features

### Category Grouping

Cost items are automatically grouped by category in CSV and PDF exports:

```typescript
exportCostCSV(costItems, {
  groupByCategory: true,
  includeSubtotals: true,
});
```

### Markup Calculation

Markup is automatically calculated and included:

```typescript
exportCostPDF(costItems, {
  markup: 15, // 15% markup added to final total
});
```

### GeoJSON for Annotations

Export annotations in GeoJSON format for mapping applications:

```typescript
const geoJSON = exportAnnotationsAsGeoJSON(annotations);
// Compatible with Leaflet, Mapbox, etc.
```

### File Size Estimation

Get estimated file size before export:

```typescript
import { estimateExportSize } from '../utils/exporters';

const size = estimateExportSize(costItems.length, 'pdf');
console.log(`Estimated size: ${size}`); // "~2.5 MB"
```

### Data Validation

Validate data before export:

```typescript
import { validateExportData } from '../utils/exporters';

const validation = validateExportData(costItems);
if (!validation.valid) {
  console.error(validation.errors);
}
```

## Customization

### Custom PDF Styling

Modify colors in `pdfExporter.ts`:

```typescript
const COLORS = {
  primary: '#2563eb',      // Your brand color
  secondary: '#64748b',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
};
```

### Custom CSV Format

Modify CSV structure in `csvExporter.ts`:

```typescript
export function exportCostItemsAsCSV(costItems, options) {
  // Customize headers
  const headers = ['Item', 'Qty', 'Cost', 'Total'];

  // Customize data rows
  // ...
}
```

### Custom Excel Formatting

Modify cell formatting in `excelExporter.ts`:

```typescript
// Apply custom formatting
worksheet[cellAddress].z = '$#,##0.00'; // Currency
worksheet[cellAddress].z = '0.00';      // Number
worksheet[cellAddress].z = '@';         // Text
```

## Error Handling

### Hook-based Error Handling

```typescript
const { exportCostPDF, error } = useExport();

if (error) {
  console.error('Export failed:', error);
  // Show error message to user
}
```

### Try-Catch Pattern

```typescript
try {
  const json = exportCostEstimateAsJSON(costItems, options);
  downloadText(json, 'estimate.json', 'application/json');
} catch (error) {
  console.error('Export failed:', error);
  // Handle error
}
```

### Validation Errors

```typescript
const validation = validateExportData(costItems);
if (!validation.valid) {
  validation.errors.forEach(error => {
    console.error(error);
  });
  return;
}
```

## Performance

### Large Datasets

For large datasets (100+ items):

1. **Use streaming** - For very large files
2. **Show progress** - Use the progress tracking
3. **Async exports** - PDF and Excel are async
4. **Web Workers** - Consider for PDF generation (future)

### Memory Management

- PDF generation is memory-intensive
- Excel exports are more efficient than PDF
- JSON/CSV are most memory-efficient
- Consider file size limits in browsers

### Optimization Tips

1. **Batch processing** - Process items in chunks
2. **Lazy loading** - Load export libraries on demand
3. **Progress updates** - Update every 100 items
4. **Cancel support** - Allow canceling long exports (future)

## Browser Compatibility

- **Chrome/Edge** - Full support
- **Firefox** - Full support
- **Safari** - Full support
- **Mobile browsers** - Limited PDF support

### File Download

Uses modern `URL.createObjectURL` API:
- Supported in all modern browsers
- Automatic cleanup with `URL.revokeObjectURL`
- No server round-trip required

## Dependencies

### Required

- `jspdf` - PDF generation
- `html2canvas` - HTML to canvas (for future features)
- `xlsx` - Excel file generation

### Installation

```bash
npm install jspdf html2canvas xlsx
```

## Future Enhancements

- [ ] Charts in PDF reports
- [ ] Image annotations in PDF
- [ ] Custom templates
- [ ] Email integration
- [ ] Cloud storage sync
- [ ] Batch export multiple projects
- [ ] Export scheduling
- [ ] Export history
- [ ] Preview before export
- [ ] Compression for large files

## Testing

### Test Scenarios

1. Export single item
2. Export 100+ items
3. Export with/without markup
4. Export all formats
5. Export with empty data
6. Export with special characters
7. Large annotations list
8. All currencies
9. All units
10. Error conditions

### Demo Component

Use the `ExportDemo` component to test all features:

```typescript
import { ExportDemo } from '../components/ExportDemo';

<ExportDemo />
```

## Support

For issues or questions:
- Check this documentation
- Review the demo component
- Inspect error messages
- Check browser console

## License

Part of the Construction Cost Estimator application.
