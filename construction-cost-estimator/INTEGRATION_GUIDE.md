# Persistence System Integration Guide

This guide shows how to integrate the local storage persistence system into the existing Construction Cost Estimator application.

## Quick Start

### 1. Add Storage Status to App

Add the storage status indicator to your main App component:

```tsx
// src/App.tsx
import { StorageStatus } from './components/StorageStatus';

function App() {
  return (
    <div>
      {/* Your existing app content */}

      {/* Add storage status indicator */}
      <StorageStatus compact position="bottom-right" />
    </div>
  );
}
```

### 2. Run Migrations on App Start

Add automatic migration checking to your app initialization:

```tsx
// src/main.tsx or src/App.tsx
import { useEffect } from 'react';
import { autoMigrate } from './utils/storageMigration';

function App() {
  useEffect(() => {
    // Run migrations if needed
    autoMigrate()
      .then(result => {
        if (result) {
          console.log('Storage migrated:', result);
        }
      })
      .catch(error => {
        console.error('Migration failed:', error);
      });
  }, []);

  // ... rest of app
}
```

### 3. Enable Auto-Save for Projects

Add auto-save to the project detail page:

```tsx
// src/pages/ProjectDetail.tsx
import { useEffect } from 'react';
import { persistenceService } from '../services/persistenceService';
import { useParams } from 'react-router-dom';

function ProjectDetail() {
  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) {
      // Enable auto-save every 1 second
      persistenceService.enableAutoSave(projectId, 1000);
    }

    return () => {
      // Disable auto-save when leaving page
      persistenceService.disableAutoSave();
    };
  }, [projectId]);

  // ... rest of component
}
```

## Advanced Integration

### Using with Zustand Stores

The persistence system works alongside Zustand's built-in persistence. You can either:

**Option A: Use Zustand's persist middleware (current)**
- Keep existing Zustand persistence
- Add PersistenceService for advanced features

**Option B: Replace with custom persistence**
- Remove Zustand's persist middleware
- Use PersistenceService for all persistence

### Example: Enhanced Store with Auto-Save

```typescript
// src/store/useAppStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persistenceService } from '../services/persistenceService';
import * as storage from '../utils/localStorage';

export const useAppStore = create<AppState>()(
  devtools(
    immer((set, get) => ({
      // ... existing state

      // Enhanced save method
      saveState: () => {
        const state = get();

        // Validate before saving
        if (persistenceService.validateProjectData(state as any)) {
          storage.setItem('app-state', state);
        }
      },

      // ... existing actions
    })),
    { name: 'AppStore' }
  )
);

// Enable auto-save
let autoSaveInterval: number;

export function enableAutoSave(interval = 1000) {
  if (autoSaveInterval) clearInterval(autoSaveInterval);

  autoSaveInterval = window.setInterval(() => {
    useAppStore.getState().saveState();
  }, interval);
}

export function disableAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
}
```

### Using Project Storage Hook

For project-specific operations, use the project storage hook:

```tsx
// src/components/ProjectCard.tsx
import { useProjectLocalStorage } from '../hooks/useLocalStorage';

function ProjectCard({ project }) {
  const storage = useProjectLocalStorage(project.id);

  const handleSave = () => {
    // Save project
    storage.saveProject(project);
  };

  const handleDelete = () => {
    if (confirm('Delete project?')) {
      storage.clearProject();
    }
  };

  return (
    <div>
      <h3>{project.name}</h3>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

### Adding Storage Settings to Settings Page

```tsx
// src/pages/Settings.tsx
import { useState } from 'react';
import { StorageSettings } from '../components/StorageSettings';

function Settings() {
  const [showStorage, setShowStorage] = useState(false);

  return (
    <div>
      {/* Other settings */}

      <button onClick={() => setShowStorage(true)}>
        Storage Management
      </button>

      {showStorage && (
        <div className="modal">
          <StorageSettings onClose={() => setShowStorage(false)} />
        </div>
      )}
    </div>
  );
}
```

### Using Settings Hook

```tsx
// src/components/SettingsPanel.tsx
import { useSettingsLocalStorage } from '../hooks/useLocalStorage';

function SettingsPanel() {
  const { settings, updateSetting, resetSettings } = useSettingsLocalStorage();

  return (
    <div>
      <h2>Settings</h2>

      <label>
        Currency:
        <select
          value={settings.currency}
          onChange={e => updateSetting('currency', e.target.value)}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </label>

      <label>
        Decimals:
        <input
          type="number"
          value={settings.decimals}
          onChange={e => updateSetting('decimals', parseInt(e.target.value))}
        />
      </label>

      <label>
        Auto-save interval (ms):
        <input
          type="number"
          value={settings.autoSaveInterval}
          onChange={e => updateSetting('autoSaveInterval', parseInt(e.target.value))}
        />
      </label>

      <button onClick={resetSettings}>Reset to Defaults</button>
    </div>
  );
}
```

### Using Auto-Save Hook

```tsx
// src/components/NotesEditor.tsx
import { useState } from 'react';
import { useAutoSave } from '../hooks/useLocalStorage';

function NotesEditor({ projectId }) {
  const [notes, setNotes] = useState('');

  const { lastSaved, isSaving, error } = useAutoSave(
    `notes-${projectId}`,
    notes,
    1000, // Save every 1 second
    true  // Enabled
  );

  return (
    <div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Enter notes..."
      />

      <div className="save-status">
        {isSaving && '💾 Saving...'}
        {!isSaving && lastSaved && `✅ Saved ${formatTime(lastSaved)}`}
        {error && `❌ Error: ${error}`}
      </div>
    </div>
  );
}
```

### Storage Stats Display

```tsx
// src/components/Header.tsx
import { useStorageStats } from '../hooks/useLocalStorage';

function Header() {
  const stats = useStorageStats();

  return (
    <header>
      <h1>Construction Cost Estimator</h1>

      <div className="storage-info">
        Storage: {stats.usagePercent}%
        {stats.usagePercent > 75 && (
          <span className="warning">⚠️ Running low</span>
        )}
      </div>
    </header>
  );
}
```

## Common Patterns

### Pattern 1: Save on Change

```tsx
function MyComponent() {
  const [data, setData] = useState(initialData);

  const handleChange = (newData) => {
    setData(newData);
    storage.setItem('my-data', newData);
  };

  return <Editor data={data} onChange={handleChange} />;
}
```

### Pattern 2: Load on Mount

```tsx
function MyComponent() {
  const [data, setData] = useState(() => {
    return storage.getItem('my-data', defaultData);
  });

  // ... rest of component
}
```

### Pattern 3: Auto-Save with Debouncing

```tsx
function MyComponent() {
  const [data, setData] = useState(initialData);
  const { isSaving } = useAutoSave('my-data', data, 1000);

  return (
    <div>
      <Editor data={data} onChange={setData} />
      {isSaving && <span>Saving...</span>}
    </div>
  );
}
```

### Pattern 4: Validation Before Save

```tsx
function MyComponent() {
  const saveProject = (project) => {
    if (persistenceService.validateProjectData(project)) {
      const result = storage.saveProject(project);
      if (result.success) {
        showNotification('Project saved!');
      } else {
        showError(result.error);
      }
    } else {
      showError('Invalid project data');
    }
  };

  return <ProjectForm onSave={saveProject} />;
}
```

### Pattern 5: Error Handling

```tsx
function MyComponent() {
  const [error, setError] = useState(null);

  const handleSave = () => {
    const result = storage.saveProject(project);

    if (!result.success) {
      if (result.error === 'Storage quota exceeded') {
        setError('Storage full! Please delete old projects.');
      } else {
        setError(`Save failed: ${result.error}`);
      }
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Error Recovery

### Handling Corrupted Data

```tsx
// src/App.tsx
import { persistenceService } from './services/persistenceService';

function App() {
  useEffect(() => {
    // Check for corrupted data on startup
    if (persistenceService.hasCorruptedData()) {
      if (confirm('Corrupted data detected. Attempt recovery?')) {
        const recovered = persistenceService.recoverCorruptedData();

        if (recovered) {
          alert('Data recovered successfully!');
        } else {
          alert('Recovery failed. Please restore from backup.');
        }
      }
    }
  }, []);

  // ... rest of app
}
```

### Handling Quota Exceeded

```tsx
function handleQuotaExceeded() {
  // Try cleanup first
  storage.compressStorage();
  const cleared = storage.clearOldProjects(30);

  if (cleared > 0) {
    alert(`Freed up space by removing ${cleared} old projects`);
  } else {
    alert('Storage full! Please manually delete projects.');
  }
}
```

## Testing Integration

### Manual Testing Checklist

1. **Basic Persistence**
   - [ ] Create a project
   - [ ] Reload page
   - [ ] Verify project still exists

2. **Auto-Save**
   - [ ] Edit annotations
   - [ ] Wait 2 seconds
   - [ ] Check localStorage in DevTools
   - [ ] Verify changes saved

3. **Storage Warnings**
   - [ ] Fill storage to 80%
   - [ ] Verify warning appears
   - [ ] Click optimize
   - [ ] Verify space freed

4. **Export/Import**
   - [ ] Click export
   - [ ] Verify JSON file downloads
   - [ ] Clear all data
   - [ ] Import file
   - [ ] Verify data restored

5. **Migration**
   - [ ] Set storage version to 0
   - [ ] Reload page
   - [ ] Verify migration runs
   - [ ] Check version is current

### Automated Testing Example

```typescript
// src/__tests__/persistence.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import * as storage from '../utils/localStorage';

describe('Persistence', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('saves and loads project', () => {
    const project = {
      id: 'test-1',
      name: 'Test Project',
      // ... other fields
    };

    storage.saveProject(project);
    const loaded = storage.loadProject('test-1');

    expect(loaded).toEqual(project);
  });

  it('handles quota exceeded', () => {
    // Fill storage with large data
    const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
    const result = storage.setItem('large', largeData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('quota');
  });
});
```

## Performance Optimization

### Lazy Loading

```tsx
// Load data only when needed
const loadProject = useCallback(async (id: string) => {
  const project = storage.loadProject(id);
  if (project) {
    setProject(project);
  }
}, []);
```

### Batch Updates

```tsx
// Save multiple items at once
const saveBatch = () => {
  storage.saveAnnotations(projectId, annotations);
  storage.saveCalibration(projectId, calibration);
  storage.saveCostItems(projectId, costItems);
};
```

### Debounced Saves

```tsx
// Use debouncing for frequent updates
const debouncedSave = useMemo(
  () => debounce((data) => storage.setItem('key', data), 1000),
  []
);
```

## Troubleshooting

### Issue: Data not persisting

**Solution:**
1. Check if localStorage is available
2. Verify no browser errors in console
3. Check if in private/incognito mode
4. Verify storage quota not exceeded

### Issue: Performance slow

**Solution:**
1. Increase auto-save interval
2. Use debouncing
3. Reduce data size
4. Optimize storage regularly

### Issue: Storage full

**Solution:**
1. Run storage optimization
2. Clear old projects
3. Export and delete unused data
4. Reduce PDF quality/size

## Best Practices

1. **Always use hooks** - Use React hooks instead of direct storage calls
2. **Validate data** - Always validate before saving
3. **Handle errors** - Always check result.success
4. **Regular cleanup** - Run optimization periodically
5. **Backup important data** - Export before major changes
6. **Test recovery** - Test import/export regularly
7. **Monitor usage** - Show storage status to users
8. **Debounce saves** - Don't save on every keystroke

## Support

For issues or questions:
1. Check PERSISTENCE_GUIDE.md
2. Check browser console for errors
3. Try storage optimization
4. Export backup before making changes
5. Restore from backup if needed

---

**Ready to integrate!** 🚀

Start with adding the StorageStatus component and auto-save, then gradually integrate other features as needed.
