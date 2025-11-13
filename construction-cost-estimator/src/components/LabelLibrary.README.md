# Label Library Component System

A comprehensive label management system for the Construction Cost Estimator application.

## Overview

The Label Library provides a complete solution for managing predefined construction labels with category filters, search functionality, and quick-select capabilities. It consists of three main components:

1. **LabelLibrary** - Main component with search, filtering, and grid display
2. **LabelEditor** - Dialog for creating and editing labels
3. **LabelCategory** - Category section component for grouped display

## Components

### LabelLibrary

The main component that displays all available labels with comprehensive filtering and management capabilities.

#### Props

```typescript
interface LabelLibraryProps {
  /** Callback when a label is selected */
  onLabelSelect?: (label: LabelDefinition) => void;

  /** Show simplified version */
  compact?: boolean;

  /** Show add/edit/delete buttons */
  showActions?: boolean;

  /** Filter to specific categories */
  categories?: string[];
}
```

#### Features

- **Display Options**:
  - Color swatch with label color
  - Icon (emoji or construction-specific)
  - Label name
  - Unit type (count, m, m²)
  - Category tag
  - Example cost (optional)
  - Selected state indicator

- **Category Filtering**:
  - Buttons for each category (All, Openings, Structure, Surfaces, etc.)
  - Show count of labels per category
  - Highlight selected category
  - Categories: Openings, Structure, Surfaces, MEP, Circulation, Other

- **Search**:
  - Text input to search labels
  - Filter by name, category, unit type, description
  - Show "No results" if no matches
  - Case-insensitive search

- **Quick Select**:
  - Click label to select it
  - Highlight selected label with green border and checkmark
  - Automatically activates label tool
  - Visual feedback with hover effects

- **Management Actions**:
  - Add custom label button
  - Edit existing label (opens LabelEditor dialog)
  - Delete custom labels (predefined labels protected)
  - Hover to reveal action buttons

- **Layout**:
  - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
  - Grouped by category view (default)
  - Compact view option
  - Collapsible category sections

#### Usage

```tsx
import { LabelLibrary } from './components/LabelLibrary';

function MyComponent() {
  const handleLabelSelect = (label) => {
    console.log('Selected:', label);
  };

  return (
    <LabelLibrary
      onLabelSelect={handleLabelSelect}
      showActions={true}
      compact={false}
    />
  );
}
```

#### Compact Mode

```tsx
<LabelLibrary
  compact={true}
  showActions={false}
  categories={['Openings', 'Structure']}
/>
```

---

### LabelEditor

Dialog component for creating new labels or editing existing ones.

#### Props

```typescript
interface LabelEditorProps {
  /** Label to edit (null for creating new) */
  label: LabelDefinition | null;

  /** Callback when dialog is closed */
  onClose: () => void;
}
```

#### Features

- **Input Fields**:
  - Label name (required)
  - Category dropdown (Openings, Structure, Surfaces, MEP, Circulation, Other)
  - Color picker with preset colors
  - Icon selector with common construction icons
  - Unit type dropdown (Count, Linear Meters, Square Meters)
  - Cost per unit (optional)
  - Description textarea (optional)

- **Validation**:
  - Required field validation
  - Numeric validation for cost
  - Error messages with icons
  - Visual feedback for invalid inputs

- **Preview**:
  - Live preview of label appearance
  - Shows how it will look in the library
  - Updates as you type

- **Keyboard Support**:
  - Cmd/Ctrl + Enter to save
  - ESC to cancel
  - Auto-focus on name field

#### Usage

```tsx
import { LabelEditor } from './components/LabelEditor';
import { useState } from 'react';

function MyComponent() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);

  return (
    <>
      <button onClick={() => setShowEditor(true)}>
        Add Label
      </button>

      {showEditor && (
        <LabelEditor
          label={editingLabel}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
}
```

#### Creating New Label

```tsx
<LabelEditor
  label={null}  // null = creating new
  onClose={handleClose}
/>
```

#### Editing Existing Label

```tsx
<LabelEditor
  label={existingLabel}  // pass label to edit
  onClose={handleClose}
/>
```

---

### LabelCategory

Component for displaying labels grouped by category with collapsible sections.

#### Props

```typescript
interface LabelCategoryProps {
  /** Category name */
  category: string;

  /** Category description */
  description?: string;

  /** Category icon */
  icon?: string;

  /** Labels in this category */
  labels: LabelDefinition[];

  /** Currently selected label ID */
  selectedLabelId: string | null;

  /** Callback when a label is selected */
  onLabelSelect: (label: LabelDefinition) => void;

  /** Callback when edit is clicked */
  onEditLabel?: (label: LabelDefinition) => void;

  /** Callback when delete is clicked */
  onDeleteLabel?: (labelId: string) => void;

  /** Callback when add label is clicked */
  onAddLabel?: (category: string) => void;

  /** Initially collapsed */
  initiallyCollapsed?: boolean;

  /** Show actions */
  showActions?: boolean;
}
```

#### Features

- Category name header with icon
- Grid of labels in category
- Collapsible (expand/collapse)
- Category description
- Count of labels
- Add label to category button
- Same label card design as LabelLibrary

#### Usage

```tsx
import { LabelCategory } from './components/LabelCategory';

function MyComponent() {
  const openingsLabels = labels.filter(l => l.category === 'Openings');

  return (
    <LabelCategory
      category="Openings"
      description="Windows, Doors, Gates, Skylights"
      labels={openingsLabels}
      selectedLabelId={selectedId}
      onLabelSelect={handleSelect}
      onAddLabel={handleAdd}
      showActions={true}
    />
  );
}
```

---

## Integration

### Zustand Store Integration

The Label Library integrates with the Zustand store for state management:

```typescript
// Store actions used:
- labels: LabelDefinition[]          // Get all labels
- selectedLabelId: string | null     // Get selected label
- selectLabel(id)                    // Select a label
- addLabel(label)                    // Add new label
- updateLabel(id, updates)           // Update label
- deleteLabel(id)                    // Delete label
- setActiveTool(tool)                // Set active tool
```

### Annotation Tools Integration

When a label is selected:

1. Label is selected in store: `selectLabel(label.id)`
2. Label tool is activated: `setActiveTool('label')`
3. Label properties are ready for use
4. When annotation is created, it references the label:
   ```typescript
   {
     labelId: label.id,
     color: label.color,
     unit: label.unit,
     // ... other annotation properties
   }
   ```

### Cost Items Integration

Labels link to cost items:

```typescript
// When annotation with label is created:
{
  annotationId: annotation.id,
  labelId: label.id,
  quantity: calculatedQuantity,
  unitCost: label.costPerUnit || 0,
  totalCost: quantity * unitCost,
  category: label.category,
  unit: label.unit
}
```

---

## Predefined Labels

The system comes with predefined labels for common construction elements:

### Openings (Blue)
- Windows (🪟) - Count - $500 each
- Doors (🚪) - Count - $800 each

### Structure (Green/Orange/Purple)
- Walls (🧱) - Linear Meters - $150/m
- Floors (⬜) - Square Meters - $80/m²
- Columns (⬛) - Count - $1200 each
- Beams (━) - Linear Meters - $200/m
- Roof Area (⛺) - Square Meters - $120/m²

### MEP (Cyan/Blue)
- Electrical Outlets (⚡) - Count - $50 each
- Plumbing Fixtures (🚰) - Count - $300 each

### Circulation (Pink)
- Stairs (🪜) - Count - $5000 each

---

## Customization

### Adding Custom Categories

Extend the `CATEGORIES` array in `LabelLibrary.tsx`:

```typescript
const CATEGORIES = [
  // ... existing categories
  { id: 'Custom', name: 'Custom', description: 'Custom labels' },
];
```

### Custom Icons

Add icons to the `COMMON_ICONS` array in `LabelEditor.tsx`:

```typescript
const COMMON_ICONS = [
  // ... existing icons
  '🔨', '🔧', '⚙️', // Add your custom icons
];
```

### Custom Colors

Add colors to the `PRESET_COLORS` array in `LabelEditor.tsx`:

```typescript
const PRESET_COLORS = [
  // ... existing colors
  '#FF6B6B', '#4ECDC4', // Add your custom colors
];
```

---

## Keyboard Shortcuts

### LabelLibrary
- **ESC** - Clear label selection

### LabelEditor
- **Cmd/Ctrl + Enter** - Save label
- **ESC** - Cancel and close dialog

---

## Responsive Design

The components adapt to different screen sizes:

### Mobile (< 640px)
- 1 column grid
- Compact search
- Stacked category filters
- Full-width dialogs

### Tablet (640px - 1024px)
- 2 column grid
- Side-by-side filters
- Responsive dialogs

### Desktop (> 1024px)
- 3 column grid
- Full feature set
- Optimal spacing

---

## Accessibility

### ARIA Labels
- All interactive elements have proper ARIA labels
- Dialog has proper role and aria-describedby

### Keyboard Navigation
- Tab through all interactive elements
- Enter to select labels
- ESC to close dialogs/clear selection
- Arrow keys for grid navigation (future enhancement)

### Screen Reader Support
- Semantic HTML elements
- Descriptive labels
- Status announcements for actions

---

## API Reference

### LabelDefinition Type

```typescript
interface LabelDefinition {
  id: string;                       // Unique identifier
  name: string;                     // Display name
  color: string;                    // Hex color (#RRGGBB)
  description?: string;             // Optional description
  icon?: string;                    // Emoji or icon
  unit: 'count' | 'linear_meters' | 'square_meters';
  costPerUnit?: number;             // Optional cost
  category?: string;                // Category name
  createdAt: Date;                  // Creation timestamp
}
```

### Store Actions

```typescript
// Get labels
const labels = useAppStore(state => state.labels);

// Select label
const selectLabel = useAppStore(state => state.selectLabel);
selectLabel('label-windows');

// Add label
const addLabel = useAppStore(state => state.addLabel);
addLabel({
  id: 'label-custom-123',
  name: 'Custom Window',
  color: '#3B82F6',
  icon: '🪟',
  unit: 'count',
  category: 'Openings',
  createdAt: new Date(),
});

// Update label
const updateLabel = useAppStore(state => state.updateLabel);
updateLabel('label-custom-123', { costPerUnit: 600 });

// Delete label
const deleteLabel = useAppStore(state => state.deleteLabel);
deleteLabel('label-custom-123');
```

---

## Examples

### Basic Usage

```tsx
import { LabelLibrary } from './components/LabelLibrary';

export function App() {
  return (
    <div className="h-screen">
      <LabelLibrary
        onLabelSelect={(label) => {
          console.log('Selected:', label);
        }}
        showActions={true}
      />
    </div>
  );
}
```

### Filtered Categories

```tsx
<LabelLibrary
  categories={['Openings', 'Structure']}
  compact={true}
  showActions={false}
/>
```

### Custom Handler

```tsx
function MyComponent() {
  const setActiveTool = useAppStore(state => state.setActiveTool);

  const handleLabelSelect = (label) => {
    // Custom logic before selection
    console.log('Selecting:', label);

    // Activate tool with custom settings
    setActiveTool('label');

    // Show notification
    alert(`Selected ${label.name}`);
  };

  return (
    <LabelLibrary onLabelSelect={handleLabelSelect} />
  );
}
```

### Programmatic Label Creation

```tsx
import { useAppStore } from './store/useAppStore';

function CreateCustomLabels() {
  const addLabel = useAppStore(state => state.addLabel);

  const createWindowLabel = () => {
    addLabel({
      id: `label-window-${Date.now()}`,
      name: 'Custom Window',
      color: '#3B82F6',
      icon: '🪟',
      unit: 'count',
      costPerUnit: 550,
      category: 'Openings',
      description: 'Custom window type',
      createdAt: new Date(),
    });
  };

  return (
    <button onClick={createWindowLabel}>
      Add Custom Window Label
    </button>
  );
}
```

---

## Troubleshooting

### Labels not showing
- Check if labels exist in store: `useAppStore(state => state.labels)`
- Verify PREDEFINED_LABELS are loaded
- Check browser console for errors

### Selection not working
- Verify `selectLabel` action is called
- Check `selectedLabelId` state
- Ensure `onLabelSelect` callback is defined

### Edit/Delete not showing
- Ensure `showActions={true}` is set
- Predefined labels (id starts with 'label-') can't be deleted
- Check permissions/user role

### Search not finding labels
- Search is case-insensitive
- Searches: name, category, description, unit
- Check for typos in search query

---

## Performance Considerations

- Uses `useMemo` for filtered labels
- Memoized callbacks with `useCallback`
- Efficient re-renders with Zustand selectors
- Virtual scrolling for large label sets (future enhancement)

---

## Future Enhancements

- [ ] Bulk import/export (JSON)
- [ ] Label templates
- [ ] Drag-and-drop reordering
- [ ] Label groups/folders
- [ ] Label history/versioning
- [ ] Label sharing between projects
- [ ] Advanced search with filters
- [ ] Label statistics
- [ ] Favorite labels
- [ ] Recently used labels

---

## Contributing

When adding features to the Label Library:

1. Update type definitions in `types/store.ts`
2. Add store actions in `store/useAppStore.ts`
3. Update UI components
4. Add tests (future)
5. Update this documentation

---

## License

Part of the Construction Cost Estimator application.

---

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
