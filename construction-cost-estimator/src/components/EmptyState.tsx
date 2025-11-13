import { FileText, Upload } from 'lucide-react';

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  /** Main title */
  title?: string;
  /** Description message */
  message?: string;
  /** Action button text */
  actionText?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Show upload icon */
  showUploadIcon?: boolean;
}

/**
 * EmptyState Component
 *
 * Displays a friendly empty state message when no projects exist.
 * Encourages users to upload their first PDF and start a project.
 *
 * Features:
 * - Large icon visual
 * - Clear call-to-action
 * - Helpful guidance text
 * - Action button
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   title="No Projects Yet"
 *   message="Upload a construction drawing to get started"
 *   actionText="Upload PDF"
 *   onAction={() => setUploadDialogOpen(true)}
 * />
 * ```
 */
export function EmptyState({
  title = 'No Projects Yet',
  message = 'Upload a construction drawing to create your first project',
  actionText = 'Upload PDF',
  onAction,
  showUploadIcon = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      {/* Icon */}
      <div className="mb-6">
        {showUploadIcon ? (
          <div className="relative">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        {title}
      </h2>

      {/* Message */}
      <p className="text-gray-600 mb-2 max-w-md">
        {message}
      </p>

      {/* Helpful tips */}
      <div className="text-sm text-gray-500 mb-8 max-w-lg">
        <p className="mb-2">You can upload:</p>
        <ul className="list-disc list-inside text-left inline-block">
          <li>Floor plans and architectural drawings</li>
          <li>Elevation and section drawings</li>
          <li>Site plans and layouts</li>
          <li>Construction specifications</li>
        </ul>
      </div>

      {/* Action Button */}
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Upload className="w-5 h-5" />
          {actionText}
        </button>
      )}

      {/* Additional help text */}
      <p className="mt-6 text-xs text-gray-400">
        Supported format: PDF • Max size: 50MB
      </p>
    </div>
  );
}
