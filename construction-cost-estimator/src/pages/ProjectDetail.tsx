import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Share2, Trash2 } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { useAppStore } from '../store/useAppStore';
import { MainLayout } from '../components/MainLayout';

/**
 * ProjectDetail Page Component
 *
 * Individual project editor page that displays the MainLayout component
 * for a specific project. Handles loading project data, syncing with the
 * annotation editor, and providing project-specific actions.
 *
 * Features:
 * - Load project by ID from URL params
 * - Display MainLayout with project's PDF
 * - Sync annotations/calibration between project store and app store
 * - Breadcrumb navigation back to dashboard
 * - Project actions (save, export, delete)
 * - Auto-save on changes
 * - 404 handling for missing projects
 *
 * Layout:
 * ```
 * ┌────────────────────────────────────┐
 * │ ← Back to Projects | [Save] [⋯]   │ ← Project header
 * ├────────────────────────────────────┤
 * │                                    │
 * │        MainLayout Component        │ ← Full editor
 * │    (PDF + Annotations + Costs)     │
 * │                                    │
 * └────────────────────────────────────┘
 * ```
 *
 * Routes:
 * - `/project/:id` - Project editor (this page)
 *
 * URL Params:
 * - `id` - Project ID
 *
 * Usage:
 * ```tsx
 * <ProjectDetail />
 * ```
 */
export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Project store
  const projects = useProjectStore((state) => state.projects);
  const updateProject = useProjectStore((state) => state.updateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const closeProject = useProjectStore((state) => state.closeProject);

  // App store (for annotation editing)
  const setCurrentProjectId = useAppStore((state) => state.setCurrentProjectId);
  const annotations = useAppStore((state) => state.annotations);
  const calibrationData = useAppStore((state) => state.calibrationData);
  const costItems = useAppStore((state) => state.costItems);

  // Local state
  const [project, setProject] = useState(() => projects.find((p) => p.id === id));
  const [showActions, setShowActions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Load project on mount and when ID changes
   */
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const foundProject = projects.find((p) => p.id === id);

    if (!foundProject) {
      // Project not found - redirect to dashboard
      console.error('Project not found:', id);
      navigate('/');
      return;
    }

    setProject(foundProject);
    setCurrentProjectId(id);

    // Load project data into app store
    // Note: The MainLayout will handle initializing with project data
  }, [id, projects, navigate, setCurrentProjectId]);

  /**
   * Auto-save project data when annotations/calibration/costs change
   */
  useEffect(() => {
    if (!project || !id) return;

    // Debounce save to avoid too many updates
    const saveTimeout = setTimeout(() => {
      handleAutoSave();
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [annotations, calibrationData, costItems, project, id]);

  /**
   * Auto-save project data
   */
  const handleAutoSave = useCallback(() => {
    if (!id) return;

    try {
      updateProject(id, {
        annotations,
        calibrationData,
        costItems,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to auto-save project:', error);
    }
  }, [id, annotations, calibrationData, costItems, updateProject]);

  /**
   * Manual save
   */
  const handleSave = useCallback(async () => {
    if (!id) return;

    setIsSaving(true);

    try {
      updateProject(id, {
        annotations,
        calibrationData,
        costItems,
        updatedAt: new Date(),
      });

      // Show success feedback
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Failed to save project:', error);
      setIsSaving(false);
    }
  }, [id, annotations, calibrationData, costItems, updateProject]);

  /**
   * Export project data as JSON
   */
  const handleExport = useCallback(() => {
    if (!project) return;

    const exportData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        pdfFileName: project.pdfFileName,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      annotations,
      calibrationData,
      costItems,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [project, annotations, calibrationData, costItems]);

  /**
   * Delete project with confirmation
   */
  const handleDelete = useCallback(() => {
    if (!project) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      deleteProject(project.id);
      closeProject();
      navigate('/');
    }
  }, [project, deleteProject, closeProject, navigate]);

  /**
   * Navigate back to dashboard
   */
  const handleBack = useCallback(() => {
    handleSave(); // Save before leaving
    closeProject();
    navigate('/');
  }, [handleSave, closeProject, navigate]);

  // Show loading state while project loads
  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Project Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20">
        {/* Left: Back button and project info */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Back to Projects</span>
          </button>

          <div className="border-l border-gray-300 pl-4 hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
            <p className="text-xs text-gray-500">{project.pdfFileName}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* More actions menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="More actions"
            >
              <span className="text-xl">⋯</span>
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      handleExport();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 first:rounded-t-lg"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <button
                    onClick={() => {
                      // Share functionality (future)
                      alert('Share functionality coming soon!');
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Project
                  </button>
                  <div className="border-t border-gray-200" />
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 last:rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout (PDF Editor) */}
      <div className="flex-1 overflow-hidden">
        <MainLayout
          pdfUrl={project.pdfUrl}
          projectId={project.id}
          pdfMetadata={{
            fileName: project.pdfFileName,
            fileSize: project.pdfFileSize,
            totalPages: project.totalPages,
            uploadDate: project.createdAt,
          }}
        />
      </div>

      {/* Auto-save indicator */}
      {isSaving && (
        <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 z-30">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-700">Saving...</span>
        </div>
      )}
    </div>
  );
}
