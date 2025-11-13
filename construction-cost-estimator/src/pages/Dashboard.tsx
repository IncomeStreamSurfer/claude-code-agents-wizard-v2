import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { DashboardHeader } from '../components/DashboardHeader';
import { ProjectGrid } from '../components/ProjectGrid';
import { EmptyState } from '../components/EmptyState';
import { UploadDialog } from '../components/UploadDialog';
import type { Project } from '../store/useProjectStore';

/**
 * Dashboard Page Component
 *
 * Main landing page for the Construction Cost Estimator application.
 * Displays all projects, allows creating new projects, and provides
 * search/filter capabilities.
 *
 * Features:
 * - Project grid with cards
 * - Search functionality
 * - Sort options (name, date, cost)
 * - Filter options (all, recent, archived)
 * - Upload dialog for new projects
 * - Empty state for first-time users
 * - Responsive layout
 * - Project actions (open, duplicate, delete, rename)
 *
 * Layout Structure:
 * ```
 * ┌──────────────────────────────────┐
 * │  Construction Cost Estimator     │ ← App title
 * │  Projects Dashboard              │
 * ├──────────────────────────────────┤
 * │  [+ New Project]  [⌕ Search]     │ ← Header with actions
 * ├──────────────────────────────────┤
 * │                                  │
 * │  Project Cards Grid              │ ← Grid of projects
 * │  ┌──────────┐ ┌──────────┐      │
 * │  │ Project1 │ │ Project2 │ ...  │
 * │  └──────────┘ └──────────┘      │
 * │                                  │
 * └──────────────────────────────────┘
 * ```
 *
 * Routes:
 * - `/` - Dashboard (this page)
 * - `/project/:id` - Project detail/editor page
 *
 * Usage:
 * ```tsx
 * <Dashboard />
 * ```
 */
export function Dashboard() {
  const navigate = useNavigate();

  // Project store
  const projects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const duplicateProject = useProjectStore((state) => state.duplicateProject);
  const openProject = useProjectStore((state) => state.openProject);
  const searchQuery = useProjectStore((state) => state.searchQuery);
  const setSearchQuery = useProjectStore((state) => state.setSearchQuery);
  const sortBy = useProjectStore((state) => state.sortBy);
  const setSortBy = useProjectStore((state) => state.setSortBy);
  const filterStatus = useProjectStore((state) => state.filterStatus);
  const setFilterStatus = useProjectStore((state) => state.setFilterStatus);

  // Local UI state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get filtered and sorted projects
  const getFilteredProjects = useCallback(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query)) ||
          project.pdfFileName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus === 'recent') {
      filtered = filtered
        .sort((a, b) => {
          const aTime = a.lastAccessedAt || a.updatedAt;
          const bTime = b.lastAccessedAt || b.updatedAt;
          return bTime.getTime() - aTime.getTime();
        })
        .slice(0, 10);
    }

    // Apply sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
      case 'cost':
        filtered.sort((a, b) => {
          const aCost = a.costItems.reduce((sum, item) => sum + item.totalCost, 0);
          const bCost = b.costItems.reduce((sum, item) => sum + item.totalCost, 0);
          return bCost - aCost;
        });
        break;
    }

    return filtered;
  }, [projects, searchQuery, filterStatus, sortBy]);

  const filteredProjects = getFilteredProjects();

  /**
   * Handle new project button click
   */
  const handleNewProject = useCallback(() => {
    setUploadDialogOpen(true);
  }, []);

  /**
   * Handle file upload and project creation
   */
  const handleUpload = useCallback(
    async (file: File, projectName: string, description?: string) => {
      try {
        setIsLoading(true);

        // Convert file to base64 for storage
        const fileUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Create project
        const newProject = await createProject(projectName, file, fileUrl);

        // Update description if provided
        if (description) {
          updateProject(newProject.id, { description });
        }

        // Success - dialog will close automatically
      } catch (error) {
        console.error('Failed to create project:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [createProject, updateProject]
  );

  /**
   * Handle opening a project
   */
  const handleOpenProject = useCallback(
    (project: Project) => {
      openProject(project.id);
      navigate(`/project/${project.id}`);
    },
    [openProject, navigate]
  );

  /**
   * Handle deleting a project
   */
  const handleDeleteProject = useCallback(
    (projectId: string) => {
      deleteProject(projectId);
    },
    [deleteProject]
  );

  /**
   * Handle duplicating a project
   */
  const handleDuplicateProject = useCallback(
    async (projectId: string) => {
      try {
        const duplicated = await duplicateProject(projectId);
        if (duplicated) {
          // Optionally show success message
          console.log('Project duplicated:', duplicated.name);
        }
      } catch (error) {
        console.error('Failed to duplicate project:', error);
      }
    },
    [duplicateProject]
  );

  /**
   * Handle renaming a project
   */
  const handleRenameProject = useCallback(
    (projectId: string, newName: string) => {
      updateProject(projectId, { name: newName });
    },
    [updateProject]
  );

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New project
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewProject();
      }

      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNewProject]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
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

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Project count and filters summary */}
        {filteredProjects.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {searchQuery && (
                <span>
                  Found <span className="font-semibold">{filteredProjects.length}</span> project
                  {filteredProjects.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </span>
              )}
              {!searchQuery && filterStatus === 'recent' && (
                <span>
                  Showing <span className="font-semibold">{filteredProjects.length}</span> recent
                  project{filteredProjects.length !== 1 ? 's' : ''}
                </span>
              )}
              {!searchQuery && filterStatus === 'all' && filteredProjects.length !== projects.length && (
                <span>
                  Showing <span className="font-semibold">{filteredProjects.length}</span> of{' '}
                  <span className="font-semibold">{projects.length}</span> projects
                </span>
              )}
            </p>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && (
          <EmptyState
            title="No Projects Yet"
            message="Upload a construction drawing to create your first project"
            actionText="Upload PDF"
            onAction={handleNewProject}
            showUploadIcon
          />
        )}

        {/* No search results */}
        {projects.length > 0 && filteredProjects.length === 0 && (
          <EmptyState
            title="No Projects Found"
            message={`No projects match "${searchQuery}". Try a different search term.`}
            actionText="Clear Search"
            onAction={() => setSearchQuery('')}
            showUploadIcon={false}
          />
        )}

        {/* Project grid */}
        {filteredProjects.length > 0 && (
          <ProjectGrid
            projects={filteredProjects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onRenameProject={handleRenameProject}
            isLoading={isLoading}
          />
        )}

        {/* Quick stats section (optional) */}
        {projects.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Projects</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {projects.reduce((sum, p) => {
                  return (
                    sum +
                    Object.values(p.annotations).reduce((aSum, annotations) => aSum + annotations.length, 0)
                  );
                }, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Annotations</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-3xl font-bold text-gray-900">
                $
                {projects
                  .reduce((sum, p) => sum + p.costItems.reduce((cSum, item) => cSum + item.totalCost, 0), 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Estimated Cost</p>
            </div>
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <UploadDialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} onUpload={handleUpload} />

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs text-gray-600 hidden lg:block">
        <p className="font-semibold mb-2">Keyboard Shortcuts</p>
        <ul className="space-y-1">
          <li>
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Ctrl</kbd> +{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">N</kbd> - New Project
          </li>
          <li>
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Ctrl</kbd> +{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">F</kbd> - Search
          </li>
        </ul>
      </div>
    </div>
  );
}
