import { ProjectCard } from './ProjectCard';
import type { Project } from '../store/useProjectStore';

/**
 * Props for ProjectGrid component
 */
interface ProjectGridProps {
  /** Array of projects to display */
  projects: Project[];
  /** Handler to open a project */
  onOpenProject: (project: Project) => void;
  /** Handler to delete a project */
  onDeleteProject: (projectId: string) => void;
  /** Handler to duplicate a project */
  onDuplicateProject: (projectId: string) => void;
  /** Handler to rename a project */
  onRenameProject?: (projectId: string, newName: string) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * ProjectGrid Component
 *
 * Responsive grid layout for displaying project cards.
 *
 * Features:
 * - Responsive columns (1 mobile, 2 tablet, 3 desktop, 4 wide)
 * - Loading skeleton placeholders
 * - Empty state handling
 * - Smooth animations
 * - Touch-friendly spacing
 *
 * Layout:
 * - Mobile (<640px): 1 column
 * - Tablet (640px-1023px): 2 columns
 * - Desktop (1024px-1535px): 3 columns
 * - Wide (≥1536px): 4 columns
 *
 * Usage:
 * ```tsx
 * <ProjectGrid
 *   projects={projects}
 *   onOpenProject={handleOpenProject}
 *   onDeleteProject={handleDeleteProject}
 *   onDuplicateProject={handleDuplicateProject}
 *   onRenameProject={handleRenameProject}
 * />
 * ```
 */
export function ProjectGrid({
  projects,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onRenameProject,
  isLoading = false,
}: ProjectGridProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
          >
            {/* Thumbnail skeleton */}
            <div className="aspect-[4/3] bg-gray-200" />

            {/* Content skeleton */}
            <div className="p-4">
              {/* Title */}
              <div className="h-6 bg-gray-200 rounded mb-2" />

              {/* File name */}
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>

              {/* Footer */}
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpenProject}
          onDelete={onDeleteProject}
          onDuplicate={onDuplicateProject}
          onRename={onRenameProject}
        />
      ))}
    </div>
  );
}

/**
 * Loading skeleton component (can be used independently)
 */
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
        >
          {/* Thumbnail skeleton */}
          <div className="aspect-[4/3] bg-gray-200" />

          {/* Content skeleton */}
          <div className="p-4">
            {/* Title */}
            <div className="h-6 bg-gray-200 rounded mb-2" />

            {/* File name */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
