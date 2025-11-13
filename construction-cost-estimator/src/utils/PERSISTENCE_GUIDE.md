# Local Storage Persistence Guide

Comprehensive documentation for the Construction Cost Estimator's local storage persistence system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Storage Structure](#storage-structure)
4. [API Reference](#api-reference)
5. [React Hooks](#react-hooks)
6. [Usage Examples](#usage-examples)
7. [Storage Management](#storage-management)
8. [Migrations](#migrations)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The persistence system provides automatic local storage for all application data including:

- **Projects**: Complete project metadata and settings
- **Annotations**: Drawing annotations with measurements
- **Calibration**: Pixel-to-meter conversion data
- **Cost Items**: Calculated cost estimates
- **UI State**: User interface preferences (zoom, pan, sidebar state)
- **Settings**: Application settings and preferences

### Key Features

- ✅ Automatic save with debouncing (max 1 save per second)
- ✅ Type-safe React hooks
- ✅ Storage quota monitoring
- ✅ Data validation
- ✅ Error recovery
- ✅ Import/Export functionality
- ✅ Version migrations
- ✅ Storage optimization

---

## Architecture

```
┌─────────────────────────────────────────┐
│          React Components               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         React Hooks Layer               │
│  (useLocalStorage, useProjectStorage)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Persistence Service Layer          │
│   (Auto-save, Validation, Recovery)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Storage Utilities Layer            │
│  (CRUD operations, Import/Export)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Browser localStorage            │
└─────────────────────────────────────────┘
```

---

## Storage Structure

### Keys

All data is stored under prefixed keys:

```typescript
const STORAGE_KEYS = {
  PROJECTS: 'ce_projects',
  CURRENT_PROJECT: 'ce_current_project',
  ANNOTATIONS: 'ce_annotations',
  CALIBRATION: 'ce_calibration',
  COST_ITEMS: 'ce_cost_items',
  UI_STATE: 'ce_ui_state',
  SETTINGS: 'ce_settings',
  SYNC_QUEUE: 'ce_sync_queue',
  VERSION: 'ce_version',
  LAST_SYNC: 'ce_last_sync',
};
```

### Data Format

```javascript
// Projects list
localStorage.ce_projects = [
  {
    id: "project-1",
    name: "Floor Plan",
    description: "Main building floor plan",
    pdfFileName: "plan.pdf",
    pdfFileSize: 1024000,
    pdfUrl: "data:application/pdf;base64,...",
    totalPages: 5,
    thumbnail: "data:image/jpeg;base64,...",
    annotations: {},
    calibrationData: {...},
    costItems: [],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T15:45:00Z",
    lastAccessedAt: "2024-01-15T15:45:00Z"
  }
]

// Current project ID
localStorage.ce_current_project = "project-1"

// Annotations (organized by project)
localStorage.ce_annotations = {
  "project-1": [
    {
      id: "ann-1",
      type: "marker",
      pageNumber: 1,
      x: 100,
      y: 150,
      ...
    }
  ]
}

// Calibration (organized by project)
localStorage.ce_calibration = {
  "project-1": {
    referenceLength: 5.0,
    pixelDistance: 150,
    metersPerPixel: 0.0333,
    isCalibrated: true
  }
}

// Cost items (organized by project)
localStorage.ce_cost_items = {
  "project-1": [
    {
      id: "cost-1",
      description: "Windows",
      quantity: 8,
      unit: "count",
      unitCost: 500,
      totalCost: 4000,
      ...
    }
  ]
}

// UI state
localStorage.ce_ui_state = {
  currentZoom: 1.5,
  currentPan: { x: 0, y: 0 },
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  ...
}

// Settings
localStorage.ce_settings = {
  currency: "USD",
  decimals: 2,
  autoSaveInterval: 1000,
  darkMode: false,
  ...
}
```

---

## API Reference

### Core Functions

#### `setItem<T>(key: string, data: T): StorageResult<T>`

Save data to localStorage with error handling.

```typescript
const result = setItem('my-key', { foo: 'bar' });
if (result.success) {
  console.log('Saved successfully');
} else {
  console.error('Save failed:', result.error);
}
```

#### `getItem<T>(key: string, defaultValue?: T): T | null`

Retrieve data from localStorage with default fallback.

```typescript
const data = getItem<MyType>('my-key', defaultValue);
```

#### `removeItem(key: string): StorageResult<void>`

Remove an item from localStorage.

```typescript
removeItem('my-key');
```

#### `clearAll(): StorageResult<void>`

Clear all application data from localStorage.

```typescript
clearAll();
```

### Project Functions

#### `saveProject(project: Project): StorageResult<Project>`

Save a complete project.

```typescript
const result = saveProject({
  id: 'project-1',
  name: 'My Project',
  pdfUrl: '...',
  // ... other fields
});
```

#### `loadProject(id: string): Project | null`

Load a project by ID.

```typescript
const project = loadProject('project-1');
```

#### `loadAllProjects(): Project[]`

Load all projects.

```typescript
const projects = loadAllProjects();
```

#### `deleteProject(id: string): StorageResult<void>`

Delete a project and all associated data.

```typescript
deleteProject('project-1');
```

### Annotation Functions

#### `saveAnnotations(projectId: string, annotations: AnnotationData[])`

Save annotations for a project.

```typescript
saveAnnotations('project-1', [
  { id: 'ann-1', type: 'marker', ... },
  { id: 'ann-2', type: 'line', ... }
]);
```

#### `loadAnnotations(projectId: string): AnnotationData[]`

Load annotations for a project.

```typescript
const annotations = loadAnnotations('project-1');
```

### Calibration Functions

#### `saveCalibration(projectId: string, calibration: CalibrationData)`

Save calibration data for a project.

```typescript
saveCalibration('project-1', {
  referenceLength: 5.0,
  pixelDistance: 150,
  metersPerPixel: 0.0333,
  isCalibrated: true
});
```

#### `loadCalibration(projectId: string): CalibrationData | null`

Load calibration data for a project.

```typescript
const calibration = loadCalibration('project-1');
```

### Storage Management

#### `getStorageSize(): number`

Get current storage usage in bytes.

```typescript
const size = getStorageSize(); // e.g., 1024000
```

#### `getStorageQuota(): number`

Get estimated storage quota (typically 5-10MB).

```typescript
const quota = getStorageQuota(); // e.g., 5242880
```

#### `getStorageUsagePercent(): number`

Get storage usage as percentage.

```typescript
const percent = getStorageUsagePercent(); // e.g., 45
```

#### `clearOldProjects(daysOld: number): number`

Clear projects older than specified days. Returns count deleted.

```typescript
const count = clearOldProjects(30); // Clear projects older than 30 days
console.log(`Deleted ${count} old projects`);
```

#### `compressStorage(): StorageResult<void>`

Optimize storage by removing orphaned data.

```typescript
compressStorage();
```

### Import/Export

#### `exportAllData(): string`

Export all data as JSON string.

```typescript
const jsonData = exportAllData();
// Save to file, send to server, etc.
```

#### `importAllData(jsonString: string): StorageResult<void>`

Import data from JSON string.

```typescript
const result = importAllData(jsonData);
if (result.success) {
  console.log('Data imported successfully');
}
```

#### `backupToFile(): Promise<void>`

Download a backup file.

```typescript
await backupToFile(); // Triggers download
```

#### `restoreFromFile(file: File): Promise<StorageResult<void>>`

Restore from a backup file.

```typescript
const result = await restoreFromFile(file);
```

---

## React Hooks

### useLocalStorage

Generic hook for any data with automatic persistence.

```typescript
const [value, setValue] = useLocalStorage('my-key', defaultValue);

// Use like useState
setValue({ foo: 'bar' });
setValue(prev => ({ ...prev, foo: 'baz' }));
```

### useProjectLocalStorage

Project-specific storage operations.

```typescript
const {
  saveProject,
  loadProject,
  saveAnnotations,
  loadAnnotations,
  saveCalibration,
  loadCalibration,
  saveCostItems,
  loadCostItems,
  clearProject,
} = useProjectLocalStorage(projectId);

// Save annotations
saveAnnotations([...annotations]);

// Load calibration
const calibration = loadCalibration();
```

### useSettingsLocalStorage

Settings management with persistence.

```typescript
const { settings, updateSetting, updateSettings, resetSettings } = useSettingsLocalStorage();

// Update single setting
updateSetting('currency', 'EUR');

// Update multiple settings
updateSettings({
  currency: 'EUR',
  decimals: 3
});

// Reset to defaults
resetSettings();
```

### useUIStateLocalStorage

UI state with debounced persistence.

```typescript
const { uiState, updateUIState, forceSave, resetUIState } = useUIStateLocalStorage();

// Update UI state (debounced save)
updateUIState({ currentZoom: 1.5 });

// Force immediate save
forceSave();
```

### useStorageStats

Real-time storage statistics.

```typescript
const { size, quota, usagePercent, isAvailable, refresh } = useStorageStats();

console.log(`Storage: ${usagePercent}% used`);
```

### useAutoSave

Automatic saving at intervals.

```typescript
const { lastSaved, isSaving, error } = useAutoSave(
  'my-key',
  data,
  1000, // interval in ms
  true  // enabled
);

if (isSaving) {
  console.log('Saving...');
} else if (lastSaved) {
  console.log(`Last saved: ${lastSaved}`);
}
```

---

## Usage Examples

### Example 1: Basic Project Persistence

```typescript
import { useProjectLocalStorage } from '../hooks/useLocalStorage';

function MyComponent() {
  const projectId = 'project-1';
  const storage = useProjectLocalStorage(projectId);

  // Load on mount
  useEffect(() => {
    const project = storage.loadProject();
    if (project) {
      // Use project data
    }
  }, []);

  // Save annotations when they change
  const handleAnnotationsChange = (annotations) => {
    storage.saveAnnotations(annotations);
  };

  return <div>...</div>;
}
```

### Example 2: Auto-Save with Debouncing

```typescript
import { useAutoSave } from '../hooks/useLocalStorage';

function Editor() {
  const [content, setContent] = useState('');

  // Auto-save every 1 second
  const { lastSaved, isSaving } = useAutoSave(
    'editor-content',
    content,
    1000
  );

  return (
    <div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div>
        {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved}` : 'Never saved'}
      </div>
    </div>
  );
}
```

### Example 3: Storage Status Display

```typescript
import { StorageStatus } from '../components/StorageStatus';

function App() {
  return (
    <div>
      {/* Compact status in bottom-right */}
      <StorageStatus compact position="bottom-right" />

      {/* Detailed status */}
      <StorageStatus detailed position="top-right" />
    </div>
  );
}
```

### Example 4: Storage Management

```typescript
import { StorageSettings } from '../components/StorageSettings';
import { useState } from 'react';

function SettingsPage() {
  const [showStorage, setShowStorage] = useState(false);

  return (
    <div>
      <button onClick={() => setShowStorage(true)}>
        Storage Settings
      </button>

      {showStorage && (
        <StorageSettings onClose={() => setShowStorage(false)} />
      )}
    </div>
  );
}
```

### Example 5: Export/Import Data

```typescript
import * as storage from '../utils/localStorage';

// Export data
async function handleExport() {
  await storage.backupToFile();
  // Downloads backup-YYYY-MM-DD.json
}

// Import data
async function handleImport(file: File) {
  const result = await storage.restoreFromFile(file);

  if (result.success) {
    alert('Data restored successfully!');
    window.location.reload();
  } else {
    alert(`Import failed: ${result.error}`);
  }
}
```

---

## Storage Management

### Quota Management

Browser localStorage typically provides 5-10MB of storage. Monitor usage:

```typescript
const usage = getStorageUsagePercent();

if (usage >= 90) {
  alert('Storage almost full! Please clean up old projects.');
  clearOldProjects(30); // Clear projects older than 30 days
}
```

### Optimization

Regular optimization removes orphaned data:

```typescript
import { persistenceService } from '../services/persistenceService';

// Optimize storage
persistenceService.optimizeStorage();

// Remove unused data
persistenceService.removeUnusedData();
```

### Automatic Cleanup

Set up automatic cleanup:

```typescript
// On app start
useEffect(() => {
  // Clear very old projects
  const count = clearOldProjects(90);
  console.log(`Cleaned up ${count} old projects`);

  // Optimize storage
  compressStorage();
}, []);
```

---

## Migrations

### Version Management

```typescript
import * as migration from '../utils/storageMigration';

// Check if migration needed
if (migration.needsMigration()) {
  const info = migration.getMigrationInfo();
  console.log(`Migration needed: v${info.currentVersion} → v${info.latestVersion}`);
}
```

### Running Migrations

```typescript
// Safe migration (with backup)
const result = await migration.safeMigrate();

if (result.success) {
  console.log('Migration successful');
} else {
  console.error('Migration failed:', result.error);
}
```

### On App Load

```typescript
// In App.tsx or main entry point
useEffect(() => {
  // Auto-migrate if needed
  migration.autoMigrate()
    .then(result => {
      if (result) {
        console.log('Migration completed:', result);
      }
    })
    .catch(error => {
      console.error('Migration failed:', error);
    });
}, []);
```

---

## Error Handling

### Storage Unavailable

```typescript
if (!isLocalStorageAvailable()) {
  alert('Local storage is not available. Data will not be saved.');
  // Fall back to in-memory storage
}
```

### Quota Exceeded

```typescript
const result = setItem('key', largeData);

if (!result.success && result.error === 'Storage quota exceeded') {
  // Clean up old data
  clearOldProjects(30);
  compressStorage();

  // Retry
  const retryResult = setItem('key', largeData);
  if (!retryResult.success) {
    alert('Storage full. Please delete old projects.');
  }
}
```

### Corrupted Data

```typescript
import { persistenceService } from '../services/persistenceService';

if (persistenceService.hasCorruptedData()) {
  if (confirm('Corrupted data detected. Attempt recovery?')) {
    const recovered = persistenceService.recoverCorruptedData();

    if (recovered) {
      alert('Data recovered successfully');
    } else {
      alert('Recovery failed. Please restore from backup.');
    }
  }
}
```

---

## Best Practices

### 1. Always Use Hooks

Prefer hooks over direct storage calls:

```typescript
// ✅ Good
const { saveProject } = useProjectLocalStorage(projectId);
saveProject(project);

// ❌ Avoid
import * as storage from '../utils/localStorage';
storage.saveProject(project);
```

### 2. Debounce Frequent Updates

Don't save on every keystroke:

```typescript
// ✅ Good - debounced
const { updateUIState } = useUIStateLocalStorage();
updateUIState({ zoom: newZoom }); // Debounced internally

// ❌ Avoid - too frequent
onChange={(e) => {
  setItem('value', e.target.value); // Saves on every keystroke
}}
```

### 3. Validate Before Saving

```typescript
const saveProject = (project) => {
  if (persistenceService.validateProjectData(project)) {
    storage.saveProject(project);
  } else {
    console.error('Invalid project data');
  }
};
```

### 4. Handle Errors Gracefully

```typescript
const result = saveProject(project);

if (!result.success) {
  // Don't crash - show user-friendly message
  showNotification(`Save failed: ${result.error}`, 'error');
}
```

### 5. Regular Backups

Encourage users to export data:

```typescript
// Remind users to backup monthly
useEffect(() => {
  const lastBackup = getLastBackupDate();
  const daysSinceBackup = getDaysSince(lastBackup);

  if (daysSinceBackup > 30) {
    showBackupReminder();
  }
}, []);
```

---

## Troubleshooting

### Problem: Data Not Persisting

**Solution:** Check if localStorage is available and not in private/incognito mode.

```typescript
console.log('localStorage available:', isLocalStorageAvailable());
```

### Problem: Storage Quota Exceeded

**Solution:** Clean up old data and compress storage.

```typescript
clearOldProjects(30);
compressStorage();
```

### Problem: Data Corrupted

**Solution:** Run recovery or restore from backup.

```typescript
persistenceService.recoverCorruptedData();
// or
restoreFromFile(backupFile);
```

### Problem: Slow Performance

**Solution:** Reduce auto-save frequency and optimize storage.

```typescript
// Increase save interval
const { updateSetting } = useSettingsLocalStorage();
updateSetting('autoSaveInterval', 3000); // 3 seconds instead of 1

// Optimize storage
persistenceService.optimizeStorage();
```

### Problem: Migration Failed

**Solution:** Restore from pre-migration backup.

```typescript
// Migrations automatically create backups
// Check downloads folder for backup file
// Then restore manually
```

---

## Testing Checklist

- [ ] Create project, reload browser → data persists
- [ ] Edit annotations, close/reopen → changes saved
- [ ] Fill storage to 95% → warning shown
- [ ] Simulate corrupted data → recovery works
- [ ] Export data → file downloads
- [ ] Import data → data restores correctly
- [ ] Clear old projects → old projects removed
- [ ] Optimize storage → orphaned data removed
- [ ] Run migration → data migrated successfully
- [ ] Test in private mode → graceful fallback
- [ ] Test quota exceeded → cleanup triggered
- [ ] Test auto-save → saves at intervals

---

## Support

For issues or questions:
1. Check this guide
2. Check browser console for errors
3. Try storage optimization
4. Export backup before making changes
5. Restore from backup if needed

---

**Last Updated:** 2024-01-15
**Version:** 1.0
**Maintainer:** Construction Cost Estimator Team
