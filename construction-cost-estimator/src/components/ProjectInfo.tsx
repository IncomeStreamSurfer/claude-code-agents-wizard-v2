import { useState } from 'react';
import {
  FileText,
  Image,
  CheckCircle,
  Ruler,
  Tag,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore, useTotalAnnotationCount } from '../store/useAppStore';
import { Button } from './ui/button';
import { Input } from './ui/input';

/**
 * Props interface for ProjectInfo component
 */
export interface ProjectInfoProps {
  /** Optional project metadata */
  metadata?: {
    fileName?: string;
    fileSize?: number;
    totalPages?: number;
    uploadDate?: Date;
    projectName?: string;
    projectDescription?: string;
  };
}

/**
 * ProjectInfo Component
 *
 * Displays comprehensive project information including PDF metadata,
 * calibration status, annotation statistics, and management actions.
 *
 * Features:
 * - Project name and description (editable)
 * - PDF file information (name, size, pages, upload date)
 * - Current page dimensions and calibration status
 * - Annotation statistics (total, by type, by page)
 * - Recent annotation history
 * - Clear/reset options
 * - Warning dialogs for destructive actions
 *
 * Sections:
 * 1. Project Details - Name, description, metadata
 * 2. PDF Information - File details, dimensions
 * 3. Calibration Status - Scale, reference measurements
 * 4. Annotation Statistics - Counts, breakdown by type
 * 5. Management Actions - Clear, export, reset
 *
 * Usage:
 * ```tsx
 * <ProjectInfo
 *   metadata={{
 *     fileName: "Floor Plan.pdf",
 *     fileSize: 1024000,
 *     totalPages: 5,
 *     uploadDate: new Date()
 *   }}
 * />
 * ```
 */
export function ProjectInfo({ metadata }: ProjectInfoProps) {
  // Store state
  const currentProjectId = useAppStore((state) => state.currentProjectId);
  const currentPageNumber = useAppStore((state) => state.currentPageNumber);
  const calibrationData = useAppStore((state) => state.calibrationData);
  const annotations = useAppStore((state) => state.annotations);
  const labels = useAppStore((state) => state.labels);
  const clearAnnotations = useAppStore((state) => state.clearAnnotations);
  const resetState = useAppStore((state) => state.resetState);
  const totalAnnotationCount = useTotalAnnotationCount();

  // Local state
  const [projectName, setProjectName] = useState(
    metadata?.projectName || 'Untitled Project'
  );
  const [projectDescription, setProjectDescription] = useState(
    metadata?.projectDescription || ''
  );
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Format date
   */
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Get annotations by type
   */
  const getAnnotationsByType = () => {
    const typeCount: Record<string, number> = {
      marker: 0,
      label: 0,
      line: 0,
      polygon: 0,
    };

    Object.values(annotations).forEach((pageAnnotations) => {
      pageAnnotations.forEach((annotation) => {
        if (typeCount[annotation.type] !== undefined) {
          typeCount[annotation.type]++;
        }
      });
    });

    return typeCount;
  };

  /**
   * Get annotations per page
   */
  const getAnnotationsPerPage = () => {
    return Object.entries(annotations).map(([pageNum, pageAnnotations]) => ({
      page: parseInt(pageNum, 10),
      count: pageAnnotations.length,
    }));
  };

  /**
   * Handle clear all annotations
   */
  const handleClearAll = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear ALL annotations? This action cannot be undone.'
    );
    if (confirmed) {
      clearAnnotations();
    }
  };

  /**
   * Handle reset project
   */
  const handleResetProject = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset the entire project? This will clear all data including annotations, calibration, and labels. This action cannot be undone.'
    );
    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This is your final warning. All project data will be permanently lost. Continue?'
      );
      if (doubleConfirm) {
        resetState();
      }
    }
  };

  /**
   * Save project info
   */
  const handleSave = () => {
    // TODO: Implement save to backend or localStorage
    console.log('Saving project info:', { projectName, projectDescription });
    setIsEditing(false);
  };

  const annotationsByType = getAnnotationsByType();
  const annotationsPerPage = getAnnotationsPerPage();

  return (
    <div className="p-4 space-y-6">
      {/* Project Details Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Project Details
        </h3>
        <div className="space-y-3">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Project Name
            </label>
            {isEditing ? (
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full"
                placeholder="Enter project name"
              />
            ) : (
              <p className="text-sm text-gray-900 font-medium">{projectName}</p>
            )}
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter project description"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {projectDescription || 'No description provided'}
              </p>
            )}
          </div>

          {/* Edit/Save Button */}
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1">
                Save
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="w-full">
              Edit Details
            </Button>
          )}
        </div>
      </section>

      {/* PDF Information Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Image className="w-4 h-4" />
          PDF Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">File Name:</span>
            <span className="font-medium text-gray-900 text-right truncate ml-2">
              {metadata?.fileName || 'No file loaded'}
            </span>
          </div>
          {metadata?.fileSize && (
            <div className="flex justify-between">
              <span className="text-gray-600">File Size:</span>
              <span className="font-medium text-gray-900">
                {formatFileSize(metadata.fileSize)}
              </span>
            </div>
          )}
          {metadata?.totalPages && (
            <div className="flex justify-between">
              <span className="text-gray-600">Total Pages:</span>
              <span className="font-medium text-gray-900">{metadata.totalPages}</span>
            </div>
          )}
          {metadata?.uploadDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Uploaded:</span>
              <span className="font-medium text-gray-900 text-right text-xs">
                {formatDate(metadata.uploadDate)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Current Page:</span>
            <span className="font-medium text-gray-900">{currentPageNumber}</span>
          </div>
        </div>
      </section>

      {/* Calibration Status Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Calibration Status
        </h3>
        <div className="space-y-2">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              calibrationData.isCalibrated
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {calibrationData.isCalibrated ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Calibrated</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Not Calibrated</span>
              </>
            )}
          </div>
          {calibrationData.isCalibrated && (
            <div className="text-xs space-y-1 px-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Scale:</span>
                <span className="font-medium text-gray-900">
                  {calibrationData.metersPerPixel.toFixed(6)} m/px
                </span>
              </div>
              {calibrationData.referenceLength && calibrationData.pixelDistance && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium text-gray-900">
                      {calibrationData.referenceLength.toFixed(2)} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pixel Distance:</span>
                    <span className="font-medium text-gray-900">
                      {Math.round(calibrationData.pixelDistance)} px
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Annotation Statistics Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Annotation Statistics
        </h3>
        <div className="space-y-3">
          {/* Total Count */}
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">Total Annotations</span>
              <span className="text-lg font-bold text-blue-900">{totalAnnotationCount}</span>
            </div>
          </div>

          {/* By Type */}
          <div className="space-y-2 text-sm">
            <p className="text-xs font-medium text-gray-700">By Type:</p>
            {Object.entries(annotationsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between px-2">
                <span className="text-gray-600 capitalize">{type}:</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>

          {/* By Page */}
          {annotationsPerPage.length > 0 && (
            <div className="space-y-2 text-sm">
              <p className="text-xs font-medium text-gray-700">By Page:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {annotationsPerPage.map(({ page, count }) => (
                  <div key={page} className="flex justify-between px-2">
                    <span className="text-gray-600">Page {page}:</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Label Count */}
          <div className="flex justify-between px-2 text-sm">
            <span className="text-gray-600">Available Labels:</span>
            <span className="font-medium text-gray-900">{labels.length}</span>
          </div>
        </div>
      </section>

      {/* Management Actions Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Management
        </h3>
        <div className="space-y-2">
          <Button
            onClick={handleClearAll}
            variant="outline"
            size="sm"
            className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
            disabled={totalAnnotationCount === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Annotations
          </Button>
          <Button
            onClick={handleResetProject}
            variant="outline"
            size="sm"
            className="w-full text-red-600 border-red-300 hover:bg-red-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reset Entire Project
          </Button>
        </div>
      </section>

      {/* Project ID (Debug Info) */}
      {currentProjectId && (
        <section className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 break-all">
            <strong>Project ID:</strong> {currentProjectId}
          </p>
        </section>
      )}
    </div>
  );
}
