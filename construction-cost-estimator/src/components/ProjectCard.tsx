import { FileText, Calendar, Layers, DollarSign, MoreVertical, Trash2, Copy, Edit } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '../store/useProjectStore';

/**
 * Props for ProjectCard component
 */
interface ProjectCardProps {
  /** Project data */
  project: Project;
  /** Click handler to open project */
  onOpen: (project: Project) => void;
  /** Handler to delete project */
  onDelete: (projectId: string) => void;
  /** Handler to duplicate project */
  onDuplicate: (projectId: string) => void;
  /** Handler to rename project */
  onRename?: (projectId: string, newName: string) => void;
}

/**
 * ProjectCard Component
 *
 * Displays a project card with thumbnail, metadata, and actions.
 *
 * Features:
 * - PDF thumbnail preview
 * - Project name (editable)
 * - File name and metadata
 * - Quick stats (pages, annotations, cost)
 * - Action menu (open, duplicate, delete)
 * - Hover effects and animations
 * - Touch-friendly for mobile
 *
 * Usage:
 * ```tsx
 * <ProjectCard
 *   project={project}
 *   onOpen={handleOpenProject}
 *   onDelete={handleDeleteProject}
 *   onDuplicate={handleDuplicateProject}
 * />
 * ```
 */
export function ProjectCard({
  project,
  onOpen,
  onDelete,
  onDuplicate,
  onRename,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);

  // Calculate stats
  const totalAnnotations = Object.values(project.annotations).reduce(
    (sum, annotations) => sum + annotations.length,
    0
  );

  const totalCost = project.costItems.reduce(
    (sum, item) => sum + item.totalCost,
    0
  );

  // Format date
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle name edit
  const handleNameSubmit = () => {
    if (editedName.trim() && editedName !== project.name && onRename) {
      onRename(project.id, editedName.trim());
    } else {
      setEditedName(project.name);
    }
    setIsEditing(false);
  };

  // Handle name edit cancel
  const handleNameCancel = () => {
    setEditedName(project.name);
    setIsEditing(false);
  };

  return (
    <div className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Thumbnail */}
      <div
        className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => onOpen(project)}
      >
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

        {/* Calibration badge */}
        {project.calibrationData.isCalibrated && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
            Calibrated
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header with name and menu */}
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Project name (editable) */}
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') handleNameCancel();
              }}
              className="flex-1 px-2 py-1 text-lg font-semibold border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <h3
              className="flex-1 text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => onOpen(project)}
            >
              {project.name}
            </h3>
          )}

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {/* Menu dropdown */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      onOpen(project);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 first:rounded-t-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Open & Edit
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onDuplicate(project.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <div className="border-t border-gray-200" />
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${project.name}"? This action cannot be undone.`)) {
                        onDelete(project.id);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 last:rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* File name */}
        <p className="text-sm text-gray-500 mb-3 line-clamp-1" title={project.pdfFileName}>
          {project.pdfFileName}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Pages */}
          <div className="flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{project.totalPages} pages</span>
          </div>

          {/* Annotations */}
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{totalAnnotations} notes</span>
          </div>
        </div>

        {/* Cost display */}
        {totalCost > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 rounded-lg">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Footer with date and file size */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(project.updatedAt)}</span>
          </div>
          <span>{formatFileSize(project.pdfFileSize)}</span>
        </div>
      </div>
    </div>
  );
}
