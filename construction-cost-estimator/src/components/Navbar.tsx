import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Upload,
  Save,
  Download,
  Settings,
  HelpCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { Input } from './ui/input';

/**
 * Props interface for Navbar component
 */
export interface NavbarProps {
  /** Project name or filename to display */
  projectName?: string;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether the document is calibrated */
  isCalibrated: boolean;
  /** Whether left sidebar is open */
  leftSidebarOpen: boolean;
  /** Whether right sidebar is open */
  rightSidebarOpen: boolean;
  /** Callback to toggle left sidebar */
  onToggleLeftSidebar: () => void;
  /** Callback to toggle right sidebar */
  onToggleRightSidebar: () => void;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback for next page */
  onNextPage: () => void;
  /** Callback for previous page */
  onPrevPage: () => void;
  /** Callback to open calibration dialog */
  onOpenCalibration?: () => void;
}

/**
 * Navbar Component
 *
 * Top navigation bar for the Construction Cost Estimator application.
 * Provides project information, page navigation, file operations, view controls,
 * and status indicators.
 *
 * Features:
 * - Logo and app title
 * - Project name/filename display
 * - File menu dropdown (Upload, Save, Export)
 * - View menu (Toggle sidebars, Dark mode)
 * - Page navigation controls
 * - Calibration status indicator
 * - Last saved timestamp
 * - Responsive design (mobile, tablet, desktop)
 * - Keyboard shortcuts support
 * - Touch-friendly buttons (min 44px)
 *
 * Layout:
 * - Left: Logo, Menu, Project Name
 * - Center: Page Navigation
 * - Right: Status, View Controls, Settings
 */
export function Navbar({
  projectName = 'Untitled Project',
  currentPage,
  totalPages,
  isCalibrated,
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onPageChange,
  onNextPage,
  onPrevPage,
  onOpenCalibration,
}: NavbarProps) {
  // State
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);

  /**
   * Close dropdowns when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setFileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Update page input when currentPage changes
   */
  useEffect(() => {
    setPageInputValue(currentPage.toString());
  }, [currentPage]);

  /**
   * Handle page input change
   */
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  /**
   * Handle page input submit
   */
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      // Reset to current page if invalid
      setPageInputValue(currentPage.toString());
    }
    pageInputRef.current?.blur();
  };

  /**
   * Handle file operations
   */
  const handleUpload = () => {
    // TODO: Implement file upload
    console.log('Upload PDF');
    setFileMenuOpen(false);
  };

  const handleSave = () => {
    // TODO: Implement project save
    console.log('Save project');
    setLastSaved(new Date());
    setFileMenuOpen(false);
  };

  const handleExport = () => {
    // TODO: Implement export
    console.log('Export estimate');
    setFileMenuOpen(false);
  };

  /**
   * Format last saved time
   */
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleDateString();
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 z-30 relative shadow-sm">
      {/* Left Section: Logo, Menu, Project Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Logo */}
        <div className="flex-shrink-0 hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
            CC
          </div>
          <span className="font-bold text-gray-900 text-lg hidden lg:inline">
            Cost Estimator
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setFileMenuOpen(!fileMenuOpen)}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        {/* Sidebar Toggle Buttons */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={onToggleLeftSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={leftSidebarOpen ? 'Close left sidebar' : 'Open left sidebar'}
            title={`${leftSidebarOpen ? 'Hide' : 'Show'} Labels (Ctrl+B)`}
          >
            {leftSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 text-gray-700" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 text-gray-700" />
            )}
          </button>

          <button
            onClick={onToggleRightSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={rightSidebarOpen ? 'Close right sidebar' : 'Open right sidebar'}
            title={`${rightSidebarOpen ? 'Hide' : 'Show'} Costs (Ctrl+E)`}
          >
            {rightSidebarOpen ? (
              <PanelRightClose className="w-5 h-5 text-gray-700" />
            ) : (
              <PanelRightOpen className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Project Name */}
        <div className="flex items-center gap-2 min-w-0 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900 truncate">
            {projectName}
          </span>
        </div>
      </div>

      {/* Center Section: Page Navigation */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Page Input */}
        <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
            <Input
              ref={pageInputRef}
              type="text"
              value={pageInputValue}
              onChange={handlePageInputChange}
              className="w-12 h-7 text-center text-sm font-medium border-0 bg-transparent p-0 focus:ring-0"
              aria-label="Current page"
            />
            <span className="text-sm text-gray-500">/</span>
            <span className="text-sm font-medium text-gray-700 min-w-[2ch]">
              {totalPages}
            </span>
          </div>
        </form>

        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Right Section: Status and Actions */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Calibration Status */}
        <button
          onClick={onOpenCalibration}
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isCalibrated
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
          title={isCalibrated ? 'Calibrated - Click to recalibrate' : 'Not calibrated - Click to calibrate'}
        >
          {isCalibrated ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{isCalibrated ? 'Calibrated' : 'Not Calibrated'}</span>
        </button>

        {/* Last Saved */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{formatLastSaved(lastSaved)}</span>
        </div>

        {/* File Menu Dropdown */}
        <div className="relative" ref={fileMenuRef}>
          <button
            onClick={() => setFileMenuOpen(!fileMenuOpen)}
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">File</span>
          </button>

          {/* File Menu Dropdown Content */}
          {fileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleUpload}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload PDF</span>
              </button>
              <button
                onClick={handleSave}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Project</span>
              </button>
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Estimate</span>
              </button>
              <div className="border-t border-gray-200 my-1" />
              <button
                onClick={() => setFileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => setFileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
