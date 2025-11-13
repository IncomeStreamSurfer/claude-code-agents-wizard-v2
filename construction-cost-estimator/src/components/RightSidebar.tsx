import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CostEstimationPanel } from './CostEstimationPanel';
import { cn } from '../utils/cn';
import { useState } from 'react';

/**
 * Props interface for RightSidebar component
 */
export interface RightSidebarProps {
  /** Whether the sidebar is open */
  isOpen: boolean;
  /** Callback to close the sidebar */
  onClose: () => void;
  /** Whether to render as an overlay (mobile/tablet) */
  isOverlay: boolean;
  /** Width class for the sidebar */
  width: string;
}

/**
 * RightSidebar Component
 *
 * Right sidebar containing the cost estimation panel. Supports both fixed
 * and overlay modes with smooth transitions and responsive design.
 *
 * Features:
 * - Cost Estimation Panel integration
 * - Smooth slide-in/out animations
 * - Fixed position (desktop) or overlay (mobile/tablet)
 * - Scrollable content area
 * - Close button in overlay mode
 * - Collapse/expand button
 * - Full-height scrolling
 * - Touch-friendly on mobile
 *
 * Responsive Behavior:
 * - Desktop (≥1024px): Fixed sidebar, 420px wide
 * - Large (1024px-1535px): Fixed sidebar, 380px wide
 * - Tablet/Mobile (<1024px): Overlay sidebar with backdrop
 *
 * Content:
 * - CostEstimationPanel with:
 *   - Grand total with markup
 *   - Category breakdown
 *   - Detailed items list
 *   - Export functionality
 *   - Settings panel
 *
 * Usage:
 * ```tsx
 * <RightSidebar
 *   isOpen={rightSidebarOpen}
 *   onClose={() => setRightSidebarOpen(false)}
 *   isOverlay={isMobile || isTablet}
 *   width="w-[420px]"
 * />
 * ```
 */
export function RightSidebar({ isOpen, onClose, isOverlay, width }: RightSidebarProps) {
  // State
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * Toggle collapse state
   */
  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Don't render if not open (for non-overlay mode)
  if (!isOpen && !isOverlay) {
    return null;
  }

  return (
    <aside
      className={cn(
        'bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-12' : width,
        isOverlay
          ? [
              'fixed top-16 right-0 bottom-0 z-40 shadow-xl',
              isOpen ? 'translate-x-0' : 'translate-x-full',
            ]
          : [
              'fixed top-16 right-0 bottom-0',
              isOpen ? 'translate-x-0' : 'translate-x-full',
            ]
      )}
      aria-label="Right sidebar"
    >
      {/* Collapsed State */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-4 gap-4">
          {/* Expand Button */}
          <button
            onClick={toggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Expand cost panel"
            title="Expand cost panel"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Vertical Text */}
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-sm font-semibold text-gray-700 whitespace-nowrap"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              Cost Estimation
            </span>
          </div>

          {/* Close Button (overlay mode) */}
          {isOverlay && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span>Cost Estimation</span>
            </h2>
            <div className="flex items-center gap-1">
              {/* Collapse Button */}
              {!isOverlay && (
                <button
                  onClick={toggleCollapse}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Collapse cost panel"
                  title="Collapse cost panel"
                >
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              )}
              {/* Close Button (overlay mode) */}
              {isOverlay && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <CostEstimationPanel
              collapsible={false}
              showChart={false}
            />
          </div>

          {/* Footer Hint */}
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-600 text-center">
              Costs calculated from calibrated annotations
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
