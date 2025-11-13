# Dashboard & Projects System - Documentation

Complete guide for the Construction Cost Estimator Dashboard and Projects system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Components](#components)
5. [State Management](#state-management)
6. [Usage Guide](#usage-guide)
7. [API Reference](#api-reference)
8. [Integration Steps](#integration-steps)
9. [Customization](#customization)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Dashboard and Projects system provides a complete project management interface for the Construction Cost Estimator application. Users can:

- **Manage multiple projects** with a visual dashboard
- **Upload PDFs** to create new projects
- **Search and filter** projects
- **Open projects** to edit annotations and estimate costs
- **Export and share** project data

### Key Features

- 📁 Multiple project support
- 🔍 Search and filter capabilities
- 📤 Drag-and-drop PDF upload
- 🖼️ PDF thumbnail previews
- 💰 Cost tracking per project
- 📊 Project statistics
- 💾 Auto-save and persistence
- 📱 Fully responsive design

---

## Architecture

### Component Hierarchy

```
App (Router)
├── Dashboard
│   ├── DashboardHeader
│   │   ├── Search input
│   │   ├── Sort dropdown
│   │   └── Filter dropdown
│   ├── ProjectGrid
│   │   └── ProjectCard (multiple)
│   ├── EmptyState
│   └── UploadDialog
│
└── ProjectDetail
    ├── Project header (back, save, actions)
    └── MainLayout (PDF editor)
```

### Data Flow

```
┌─────────────────────────────────────────┐
│           ProjectStore                  │
│  (Multiple projects + metadata)         │
└─────────────┬───────────────────────────┘
              │
              ├─────────────────────────┐
              ↓                         ↓
      ┌───────────────┐        ┌───────────────┐
      │   Dashboard   │        │ ProjectDetail │
      │   (List view) │        │ (Editor view) │
      └───────────────┘        └───────┬───────┘
                                       │
                                       ↓
                              ┌────────────────┐
                              │    AppStore    │
                              │  (Current      │
                              │   project's    │
                              │   annotations) │
                              └────────────────┘
```

### Store Separation

**ProjectStore** (`useProjectStore.ts`)
- Manages ALL projects
- Project metadata (name, description, dates)
- PDF file data and thumbnails
- Project-level CRUD operations
- Persisted to localStorage

**AppStore** (`useAppStore.ts`)
- Manages CURRENT project's editing state
- Annotations, calibration, cost items
- UI state (zoom, pan, active tool)
- Synced with ProjectStore on save

---

## File Structure

```
src/
├── pages/
│   ├── Dashboard.tsx              # Main dashboard page
│   ├── ProjectDetail.tsx          # Project editor page
│   └── Dashboard.README.md        # This documentation
│
├── components/
│   ├── DashboardHeader.tsx        # Search, filters, actions
│   ├── ProjectCard.tsx            # Individual project card
│   ├── ProjectGrid.tsx            # Responsive grid layout
│   ├── UploadDialog.tsx           # PDF upload modal
│   ├── EmptyState.tsx             # Empty state display
│   └── MainLayout.tsx             # PDF editor (existing)
│
├── store/
│   ├── useProjectStore.ts         # Project management store
│   └── useAppStore.ts             # Annotation editor store
│
└── App.tsx                        # Router setup
```

---

## Components

### Dashboard (`/src/pages/Dashboard.tsx`)

**Purpose**: Main landing page displaying all projects.

**Features**:
- Project cards in responsive grid
- Search by name/description/filename
- Sort by name/date/cost
- Filter by status (all/recent)
- Empty state for first-time users
- Upload dialog trigger
- Keyboard shortcuts (Ctrl+N, Ctrl+F)
- Project statistics

**Props**: None (uses stores)

**Usage**:
```tsx
import { Dashboard } from './pages/Dashboard';

// Rendered by React Router at "/"
<Route path="/" element={<Dashboard />} />
```

---

### ProjectDetail (`/src/pages/ProjectDetail.tsx`)

**Purpose**: Individual project editor page with PDF viewer and annotation tools.

**Features**:
- Load project by URL param (`:id`)
- Display MainLayout with project PDF
- Project header with back button
- Save button with auto-save
- Export project data to JSON
- Delete project with confirmation
- Sync annotations between stores

**Props**: None (uses URL params and stores)

**Usage**:
```tsx
import { ProjectDetail } from './pages/ProjectDetail';

// Rendered by React Router at "/project/:id"
<Route path="/project/:id" element={<ProjectDetail />} />
```

---

### DashboardHeader (`/src/components/DashboardHeader.tsx`)

**Purpose**: Header bar with search, filters, and actions.

**Props**:
```typescript
interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'name' | 'date' | 'cost';
  onSortChange: (sortBy: 'name' | 'date' | 'cost') => void;
  filterStatus: 'all' | 'recent' | 'archived';
  onFilterChange: (status: 'all' | 'recent' | 'archived') => void;
  onNewProject: () => void;
  projectCount: number;
}
```

**Usage**:
```tsx
<DashboardHeader
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  sortBy={sortBy}
  onSortChange={setSortBy}
  filterStatus={filterStatus}
  onFilterChange={setFilterStatus}
  onNewProject={handleNewProject}
  projectCount={projects.length}
/>
```

---

### ProjectCard (`/src/components/ProjectCard.tsx`)

**Purpose**: Display individual project with thumbnail and metadata.

**Props**:
```typescript
interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (projectId: string) => void;
  onRename?: (projectId: string, newName: string) => void;
}
```

**Features**:
- PDF thumbnail preview
- Project name (click to edit)
- File metadata
- Stats (pages, annotations, cost)
- Action menu (open, rename, duplicate, delete)
- Calibration badge
- Hover effects

**Usage**:
```tsx
<ProjectCard
  project={project}
  onOpen={handleOpenProject}
  onDelete={handleDeleteProject}
  onDuplicate={handleDuplicateProject}
  onRename={handleRenameProject}
/>
```

---

### ProjectGrid (`/src/components/ProjectGrid.tsx`)

**Purpose**: Responsive grid layout for project cards.

**Props**:
```typescript
interface ProjectGridProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  isLoading?: boolean;
}
```

**Layout**:
- Mobile (<640px): 1 column
- Tablet (640px-1023px): 2 columns
- Desktop (1024px-1535px): 3 columns
- Wide (≥1536px): 4 columns

**Usage**:
```tsx
<ProjectGrid
  projects={filteredProjects}
  onOpenProject={handleOpenProject}
  onDeleteProject={handleDeleteProject}
  onDuplicateProject={handleDuplicateProject}
  onRenameProject={handleRenameProject}
  isLoading={isLoading}
/>
```

---

### UploadDialog (`/src/components/UploadDialog.tsx`)

**Purpose**: Modal for uploading PDFs and creating new projects.

**Props**:
```typescript
interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, projectName: string, description?: string) => Promise<void>;
}
```

**Features**:
- Drag-and-drop zone
- File picker (click to browse)
- File validation (PDF only, max 50MB)
- Auto-fill project name from filename
- Project name and description inputs
- Upload progress bar
- Error/success feedback

**Usage**:
```tsx
<UploadDialog
  open={uploadDialogOpen}
  onClose={() => setUploadDialogOpen(false)}
  onUpload={handleUpload}
/>
```

---

### EmptyState (`/src/components/EmptyState.tsx`)

**Purpose**: Display friendly empty state with call-to-action.

**Props**:
```typescript
interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  showUploadIcon?: boolean;
}
```

**Usage**:
```tsx
<EmptyState
  title="No Projects Yet"
  message="Upload a construction drawing to get started"
  actionText="Upload PDF"
  onAction={() => setUploadDialogOpen(true)}
  showUploadIcon
/>
```

---

## State Management

### Project Store (`useProjectStore`)

**Purpose**: Manage all projects and their metadata.

**State**:
```typescript
{
  projects: Project[];
  currentProjectId: string | null;
  searchQuery: string;
  sortBy: 'name' | 'date' | 'cost';
  filterStatus: 'all' | 'recent' | 'archived';
}
```

**Actions**:

**Project CRUD**:
- `createProject(name, pdfFile, pdfUrl)` - Create new project
- `updateProject(id, updates)` - Update project metadata
- `deleteProject(id)` - Delete project
- `duplicateProject(id)` - Duplicate project

**Navigation**:
- `openProject(id)` - Set as current project
- `closeProject()` - Clear current project

**Query & Filter**:
- `getRecentProjects(limit)` - Get recently accessed projects
- `searchProjects(query)` - Search by name/description
- `setSearchQuery(query)` - Set search query
- `setSortBy(sortBy)` - Set sort order
- `setFilterStatus(status)` - Set filter

**Example Usage**:
```typescript
import { useProjectStore } from '../store/useProjectStore';

function MyComponent() {
  const projects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);

  const handleUpload = async (file: File) => {
    const fileUrl = await convertToBase64(file);
    const project = await createProject('My Project', file, fileUrl);
    console.log('Created:', project);
  };
}
```

---

### App Store (`useAppStore`)

**Purpose**: Manage current project's annotation editing state.

**State**:
```typescript
{
  currentProjectId: string;
  currentPageNumber: number;
  calibrationData: CalibrationData;
  annotations: Record<number, AnnotationData[]>;
  labels: LabelDefinition[];
  costItems: CostItem[];
  activeTool: string | null;
  // ... UI state
}
```

**Actions**:
- Annotation CRUD: `addAnnotation`, `updateAnnotation`, `deleteAnnotation`
- Calibration: `computeCalibration`, `resetCalibration`
- Cost calculation: `calculateCostItems`, `getTotalCost`
- UI state: `setActiveTool`, `setZoom`, `setPan`

**Example Usage**:
```typescript
import { useAppStore } from '../store/useAppStore';

function Editor() {
  const annotations = useAppStore((state) => state.annotations);
  const addAnnotation = useAppStore((state) => state.addAnnotation);

  const handleAddMarker = () => {
    addAnnotation({
      id: generateId(),
      type: 'marker',
      pageNumber: 1,
      x: 100,
      y: 100,
      // ...
    });
  };
}
```

---

## Usage Guide

### Creating Your First Project

1. **Open the app** - Navigate to `/` (Dashboard)
2. **Click "New Project"** or press `Ctrl+N`
3. **Upload a PDF**:
   - Drag and drop a PDF file, or
   - Click the upload zone to browse
4. **Enter project details**:
   - Project name (auto-filled from filename)
   - Optional description
5. **Click "Create Project"**
6. **Project opens automatically** in editor

### Managing Projects

**Search**:
- Type in search box to filter by name/description/filename
- Press `Ctrl+F` to focus search

**Sort**:
- Click sort dropdown
- Choose: Name, Date Modified, or Cost

**Filter**:
- Click filter dropdown
- Choose: All Projects or Recent

**Actions on a project**:
- **Open**: Click card or "Open & Edit" in menu
- **Rename**: Click "Rename" in menu, or click name to edit
- **Duplicate**: Click "Duplicate" in menu
- **Delete**: Click "Delete" in menu (with confirmation)

### Editing a Project

1. **Open project** from dashboard
2. **Use MainLayout tools**:
   - Draw annotations
   - Calibrate measurements
   - Estimate costs
3. **Auto-save** runs every 1 second
4. **Manual save**: Click "Save" button
5. **Export**: Click ⋯ menu → "Export Data"
6. **Back to dashboard**: Click "← Back to Projects"

---

## API Reference

### Project Interface

```typescript
interface Project {
  id: string;                              // Unique project ID
  name: string;                            // Project name
  description?: string;                    // Optional description
  pdfFileName: string;                     // Original PDF filename
  pdfFileSize: number;                     // File size in bytes
  pdfUrl: string;                          // Base64 or URL
  totalPages: number;                      // Number of PDF pages
  thumbnail?: string;                      // Base64 preview image
  annotations: Record<number, AnnotationData[]>; // Page annotations
  calibrationData: CalibrationData;        // Calibration settings
  costItems: CostItem[];                   // Cost items
  createdAt: Date;                         // Creation timestamp
  updatedAt: Date;                         // Last update timestamp
  lastAccessedAt?: Date;                   // Last accessed timestamp
}
```

### createProject

```typescript
async function createProject(
  name: string,
  pdfFile: File,
  pdfUrl: string
): Promise<Project>
```

**Parameters**:
- `name` - Project name
- `pdfFile` - PDF File object
- `pdfUrl` - Base64-encoded PDF data or URL

**Returns**: Created `Project` object

**Example**:
```typescript
const fileUrl = await new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.readAsDataURL(file);
});

const project = await createProject('Floor Plan A', file, fileUrl);
```

### updateProject

```typescript
function updateProject(
  id: string,
  updates: Partial<Project>
): void
```

**Parameters**:
- `id` - Project ID
- `updates` - Partial project object with fields to update

**Example**:
```typescript
updateProject('project-123', {
  name: 'New Name',
  description: 'Updated description',
  annotations: newAnnotations,
});
```

### deleteProject

```typescript
function deleteProject(id: string): void
```

**Parameters**:
- `id` - Project ID to delete

**Example**:
```typescript
if (confirm('Delete project?')) {
  deleteProject('project-123');
}
```

### duplicateProject

```typescript
async function duplicateProject(id: string): Promise<Project | null>
```

**Parameters**:
- `id` - Project ID to duplicate

**Returns**: Duplicated `Project` object, or `null` if not found

**Example**:
```typescript
const copy = await duplicateProject('project-123');
if (copy) {
  console.log('Duplicated:', copy.name);
}
```

---

## Integration Steps

### Step 1: Install Dependencies

```bash
npm install react-router-dom
```

### Step 2: Verify File Structure

Ensure all files are in place:
```
src/
├── pages/
│   ├── Dashboard.tsx
│   └── ProjectDetail.tsx
├── components/
│   ├── DashboardHeader.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectGrid.tsx
│   ├── UploadDialog.tsx
│   └── EmptyState.tsx
├── store/
│   └── useProjectStore.ts
└── App.tsx
```

### Step 3: Update App.tsx

```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetail } from './pages/ProjectDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Test the Dashboard

1. Open `http://localhost:5173` (or your dev port)
2. You should see the empty state dashboard
3. Click "Upload PDF" to create your first project
4. Upload a PDF file
5. Project should open in editor
6. Navigate back to dashboard
7. Verify project appears in grid

---

## Customization

### Changing Grid Layout

Edit `/src/components/ProjectGrid.tsx`:

```tsx
// Change grid columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
//                                                              ↑ Add column
```

### Customizing Project Card

Edit `/src/components/ProjectCard.tsx`:

```tsx
// Change thumbnail aspect ratio
<div className="aspect-[16/9] bg-gray-100"> {/* was aspect-[4/3] */}

// Hide cost display
{false && totalCost > 0 && (
  <div className="flex items-center gap-2">...
```

### Adding Custom Actions

In `/src/pages/Dashboard.tsx`:

```tsx
// Add custom action
const handleArchiveProject = useCallback((projectId: string) => {
  updateProject(projectId, { archived: true });
}, [updateProject]);

// Pass to ProjectCard
<ProjectCard
  project={project}
  onArchive={handleArchiveProject}
  // ...
/>
```

### Changing Upload Limits

Edit `/src/components/UploadDialog.tsx`:

```tsx
// Max file size (100MB instead of 50MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;
```

---

## Troubleshooting

### Projects not persisting

**Problem**: Projects disappear after page reload.

**Solution**: Check browser localStorage:
```javascript
// In browser console:
localStorage.getItem('construction-cost-estimator-projects')
```

If null, ensure `persist` middleware is configured in `useProjectStore.ts`.

### PDF not loading in editor

**Problem**: PDF shows as blank or errors.

**Solution**:
1. Check PDF file size (must be < 50MB)
2. Verify `pdfUrl` is valid base64 or URL
3. Check browser console for PDF.js errors
4. Ensure PDF.js worker is loaded

### Thumbnails not generating

**Problem**: Project cards show placeholder icon instead of thumbnail.

**Solution**:
1. Check PDF.js is installed: `npm list pdfjs-dist`
2. Verify worker source in `useProjectStore.ts`:
   ```typescript
   pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
   ```
3. Check browser network tab for worker load errors

### Search not working

**Problem**: Search doesn't filter projects.

**Solution**: Check `getFilteredProjects` in `Dashboard.tsx`:
```typescript
const getFilteredProjects = useCallback(() => {
  console.log('Search query:', searchQuery);
  console.log('Projects:', projects);
  // Verify filter logic...
}, [projects, searchQuery]);
```

### Router navigation fails

**Problem**: Clicking links doesn't navigate.

**Solution**:
1. Verify `BrowserRouter` wraps `App` in `main.tsx`
2. Use `useNavigate()` hook instead of `window.location`
3. Check route paths match exactly

### Auto-save not working

**Problem**: Changes lost when navigating away.

**Solution**: Check `ProjectDetail.tsx`:
```typescript
// Ensure auto-save effect runs
useEffect(() => {
  console.log('Auto-save triggered');
  // ...
}, [annotations, calibrationData, costItems]);
```

---

## Best Practices

### Performance

1. **Lazy load thumbnails**: Generate on demand
2. **Paginate projects**: Show 20-50 per page
3. **Debounce search**: Wait 300ms after typing
4. **Memoize filters**: Use `useMemo` for expensive calculations
5. **Virtualize grid**: Use `react-window` for 100+ projects

### UX

1. **Loading states**: Show skeletons while loading
2. **Error boundaries**: Catch and display errors gracefully
3. **Confirmation dialogs**: Always confirm destructive actions
4. **Keyboard shortcuts**: Add shortcuts for power users
5. **Mobile-first**: Design for mobile, enhance for desktop

### Data Management

1. **Validation**: Validate file types and sizes
2. **Backups**: Export/import project data
3. **Versioning**: Track project versions
4. **Sync**: Consider cloud sync for multi-device
5. **Cleanup**: Delete unused thumbnails

---

## Future Enhancements

Potential features to add:

- [ ] Cloud storage integration
- [ ] Project sharing and collaboration
- [ ] Templates and presets
- [ ] Batch operations (delete, export)
- [ ] Project tags and categories
- [ ] Activity history
- [ ] PDF comparison view
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Export to various formats (Excel, PDF report)

---

## Support

For issues or questions:

1. Check this documentation
2. Review code comments
3. Search existing GitHub issues
4. Open a new issue with:
   - Description of problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

---

## License

[Your license here]

---

**Last Updated**: 2025-11-13
**Version**: 1.0.0
