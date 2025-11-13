import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Props for UploadDialog component
 */
interface UploadDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Upload handler - receives file and project name */
  onUpload: (file: File, projectName: string, description?: string) => Promise<void>;
}

/**
 * UploadDialog Component
 *
 * Modal dialog for uploading PDF files and creating new projects.
 *
 * Features:
 * - Drag and drop file upload
 * - Click to browse file picker
 * - File validation (PDF only, max 50MB)
 * - Auto-fill project name from filename
 * - Project name and description inputs
 * - Upload progress indication
 * - Success/error feedback
 * - Accessible modal with keyboard support
 *
 * Usage:
 * ```tsx
 * <UploadDialog
 *   open={uploadDialogOpen}
 *   onClose={() => setUploadDialogOpen(false)}
 *   onUpload={handleUpload}
 * />
 * ```
 */
export function UploadDialog({ open, onClose, onUpload }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Max file size (50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  // Reset state
  const resetState = useCallback(() => {
    setSelectedFile(null);
    setProjectName('');
    setDescription('');
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    setIsUploading(false);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetState();
      onClose();
    }
  }, [isUploading, resetState, onClose]);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Please upload a PDF file';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    return null;
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);

      // Auto-fill project name from filename (remove .pdf extension)
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      setProjectName(nameWithoutExt);
    },
    [validateFile]
  );

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !projectName.trim()) {
      setError('Please provide a project name');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (in a real app, this would be tied to actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await onUpload(selectedFile, projectName.trim(), description.trim() || undefined);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);

      // Close dialog after success
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, projectName, description, onUpload, handleClose]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upload PDF</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Drag and drop area */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
              ${selectedFile ? 'bg-green-50 border-green-500' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />

            {selectedFile ? (
              // File selected
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setProjectName('');
                  }}
                  disabled={isUploading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              // No file selected
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    Drop PDF here or click to browse
                  </p>
                  <p className="text-sm text-gray-600">
                    PDF files only • Max size: 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">Project created successfully!</p>
            </div>
          )}

          {/* Project name input */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isUploading}
              placeholder="e.g., Floor Plan - Building A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Description input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              placeholder="Add a description for this project..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Uploading...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !projectName.trim() || isUploading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isUploading ? 'Uploading...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
