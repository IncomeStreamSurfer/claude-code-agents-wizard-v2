import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Navbar } from './Navbar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { PDFViewerWithZoom } from './PDFViewerWithZoom';
import { AnnotationToolbar } from './AnnotationToolbar';
import { CalibrationDialog } from './CalibrationDialog';

/**
 * Props interface for MainLayout component
 */
export interface MainLayoutProps {
  /** URL or path to the PDF file to display */
  pdfUrl?: string;
  /** Project ID for tracking and persistence */
  projectId?: string;
  /** Optional PDF file metadata */
  pdfMetadata?: {
    fileName?: string;
    fileSize?: number;
    totalPages?: number;
    uploadDate?: Date;
  };
}

/**
 * MainLayout Component
 *
 * Comprehensive responsive layout for the Construction Cost Estimator application.
 * Provides a professional two-column design with collapsible sidebars that adapt
 * to different screen sizes.
 *
 * Layout Structure:
 * - Desktop (≥1536px): Full two-column layout with both sidebars visible
 * - Large (1024px-1535px): Adjusted sidebar widths
 * - Tablet (640px-1023px): Left sidebar collapses, overlays available
 * - Mobile (<640px): All sidebars as overlays, full-screen PDF viewer
 *
 * Features:
 * - Responsive breakpoints with smooth transitions
 * - Collapsible left sidebar (Label Library, Calibration, Annotations, Project Info)
 * - Collapsible right sidebar (Cost Estimation Panel)
 * - Overlay mode for mobile/tablet
 * - PDF viewer with zoom and pan
 * - Annotation tools integrated
 * - Calibration dialog
 * - State persistence via Zustand
 * - Touch-friendly on mobile
 * - Keyboard shortcuts support
 * - Proper z-index layering
 *
 * Keyboard Shortcuts:
 * - Ctrl/Cmd + B: Toggle left sidebar
 * - Ctrl/Cmd + E: Toggle right sidebar
 * - Escape: Close overlays
 *
 * Usage:
 * ```tsx
 * <MainLayout
 *   pdfUrl="/path/to/document.pdf"
 *   projectId="project-123"
 *   pdfMetadata={{
 *     fileName: "Floor Plan.pdf",
 *     fileSize: 1024000,
 *     totalPages: 5
 *   }}
 * />
 * ```
 */
export function MainLayout({
  pdfUrl = '',
  projectId = '',
  pdfMetadata,
}: MainLayoutProps) {
  // Zustand store state
  const currentPageNumber = useAppStore((state) => state.currentPageNumber);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const setCurrentProjectId = useAppStore((state) => state.setCurrentProjectId);
  const getAnnotationsByPage = useAppStore((state) => state.getAnnotationsByPage);

  // Local UI state for sidebar visibility
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [totalPages] = useState(pdfMetadata?.totalPages || 1);

  // PDF state
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState<Error | null>(null);

  /**
   * Set project ID on mount
   */
  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
  }, [projectId, setCurrentProjectId]);

  /**
   * Handle responsive breakpoints
   */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 640;
      const tablet = width >= 640 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      // Auto-close sidebars on mobile
      if (mobile) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      } else if (tablet) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      } else {
        // Desktop: keep sidebars open by default
        setLeftSidebarOpen(true);
        setRightSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Debounced resize listener
    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B: Toggle left sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setLeftSidebarOpen((prev) => !prev);
      }

      // Ctrl/Cmd + E: Toggle right sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setRightSidebarOpen((prev) => !prev);
      }

      // Escape: Close overlays
      if (e.key === 'Escape') {
        if (isMobile || isTablet) {
          setLeftSidebarOpen(false);
          setRightSidebarOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, isTablet]);

  /**
   * Handle page navigation
   */
  const handlePageChange = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(totalPages, newPage));
      setCurrentPage(validPage);
    },
    [totalPages, setCurrentPage]
  );

  const handleNextPage = useCallback(() => {
    handlePageChange(currentPageNumber + 1);
  }, [currentPageNumber, handlePageChange]);

  const handlePrevPage = useCallback(() => {
    handlePageChange(currentPageNumber - 1);
  }, [currentPageNumber, handlePageChange]);

  /**
   * Handle PDF load
   */
  const handlePDFLoad = useCallback(() => {
    setPdfLoaded(true);
    setPdfError(null);
  }, []);

  /**
   * Handle PDF error
   */
  const handlePDFError = useCallback((error: Error) => {
    setPdfError(error);
    setPdfLoaded(false);
  }, []);

  /**
   * Toggle sidebars
   */
  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebarOpen((prev) => !prev);
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Open calibration dialog
   */
  const handleOpenCalibration = useCallback(() => {
    setCalibrationDialogOpen(true);
  }, []);

  /**
   * Calculate sidebar widths based on screen size
   */
  const getLayoutClasses = () => {
    const isOverlay = isMobile || isTablet;

    return {
      leftSidebarWidth: isOverlay ? 'w-[280px]' : 'w-[350px] 2xl:w-[350px] xl:w-[280px]',
      rightSidebarWidth: isOverlay ? 'w-[320px]' : 'w-[420px] 2xl:w-[420px] xl:w-[380px]',
      mainContentClass: `flex-1 ${
        !isOverlay && leftSidebarOpen ? 'ml-[350px] xl:ml-[280px]' : ''
      } ${!isOverlay && rightSidebarOpen ? 'mr-[420px] xl:mr-[380px]' : ''}`,
    };
  };

  const { leftSidebarWidth, rightSidebarWidth, mainContentClass } = getLayoutClasses();
  const isOverlayMode = isMobile || isTablet;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Top Navbar */}
      <Navbar
        projectName={pdfMetadata?.fileName || 'Untitled Project'}
        currentPage={currentPageNumber}
        totalPages={totalPages}
        isCalibrated={useAppStore((state) => state.calibrationData.isCalibrated)}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        onToggleLeftSidebar={toggleLeftSidebar}
        onToggleRightSidebar={toggleRightSidebar}
        onPageChange={handlePageChange}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onOpenCalibration={handleOpenCalibration}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <LeftSidebar
          isOpen={leftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
          isOverlay={isOverlayMode}
          width={leftSidebarWidth}
        />

        {/* Main PDF Viewer Area */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${mainContentClass}`}>
          {/* PDF Viewer */}
          <div className="flex-1 relative overflow-hidden">
            {pdfUrl ? (
              <PDFViewerWithZoom
                pdfUrl={pdfUrl}
                pageNumber={currentPageNumber}
                scale={1.5}
                minZoom={0.25}
                maxZoom={4}
                annotations={getAnnotationsByPage(currentPageNumber) as any}
                onPageLoadComplete={handlePDFLoad}
                onError={handlePDFError}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center p-8">
                  <div className="text-gray-400 text-6xl mb-4">📄</div>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    No PDF Loaded
                  </h2>
                  <p className="text-gray-500 mb-4">
                    Upload a construction drawing to get started
                  </p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Upload PDF
                  </button>
                </div>
              </div>
            )}

            {/* PDF Error Display */}
            {pdfError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <div className="text-center p-8 max-w-md">
                  <div className="text-red-500 text-5xl mb-4">⚠️</div>
                  <h2 className="text-xl font-semibold text-red-700 mb-2">
                    Error Loading PDF
                  </h2>
                  <p className="text-red-600 text-sm mb-4">{pdfError.message}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Annotation Toolbar */}
          {pdfLoaded && (
            <div className="border-t bg-white shadow-lg p-3">
              <AnnotationToolbar showReset showClear />
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
          isOverlay={isOverlayMode}
          width={rightSidebarWidth}
        />

        {/* Overlay Backdrop (for mobile/tablet) */}
        {isOverlayMode && (leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Mobile Bottom Action Bar */}
      {isMobile && pdfLoaded && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20 safe-area-bottom">
          <div className="flex items-center justify-around p-3">
            <button
              onClick={toggleLeftSidebar}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle labels"
            >
              <span className="text-2xl">🏷️</span>
              <span className="text-xs font-medium text-gray-700">Labels</span>
            </button>

            <button
              onClick={handleOpenCalibration}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Calibrate"
            >
              <span className="text-2xl">📏</span>
              <span className="text-xs font-medium text-gray-700">Calibrate</span>
            </button>

            <button
              onClick={toggleRightSidebar}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle costs"
            >
              <span className="text-2xl">💰</span>
              <span className="text-xs font-medium text-gray-700">Costs</span>
            </button>
          </div>
        </div>
      )}

      {/* Calibration Dialog */}
      <CalibrationDialog
        open={calibrationDialogOpen}
        onOpenChange={setCalibrationDialogOpen}
        pixelDistance={100}
        onConfirm={() => setCalibrationDialogOpen(false)}
        onCancel={() => setCalibrationDialogOpen(false)}
      />
    </div>
  );
}
