import { useState } from 'react';
import { X, Tag, Ruler, FileText, Info } from 'lucide-react';
import { LabelLibrary } from './LabelLibrary';
import { CalibrationStatus } from './CalibrationStatus';
import { AnnotationsList } from './AnnotationsList';
import { ProjectInfo } from './ProjectInfo';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

/**
 * Tab types for the left sidebar
 */
type TabType = 'labels' | 'calibration' | 'annotations' | 'project';

/**
 * Props interface for LeftSidebar component
 */
export interface LeftSidebarProps {
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
 * Tab definition interface
 */
interface TabDefinition {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
}

/**
 * Tab definitions
 */
const TABS: TabDefinition[] = [
  {
    id: 'labels',
    label: 'Labels',
    icon: Tag,
    component: LabelLibrary,
  },
  {
    id: 'calibration',
    label: 'Calibration',
    icon: Ruler,
    component: CalibrationStatus,
  },
  {
    id: 'annotations',
    label: 'Annotations',
    icon: FileText,
    component: AnnotationsList,
  },
  {
    id: 'project',
    label: 'Project',
    icon: Info,
    component: ProjectInfo,
  },
];

/**
 * LeftSidebar Component
 *
 * Left sidebar with tabbed interface for label library, calibration status,
 * annotations list, and project information. Supports both fixed and overlay modes
 * with smooth transitions and responsive design.
 *
 * Features:
 * - Tabbed interface with 4 tabs
 * - Tab 1: Label Library - Browse and select labels
 * - Tab 2: Calibration - View and manage calibration status
 * - Tab 3: Annotations - List of all annotations
 * - Tab 4: Project Info - Project metadata and statistics
 * - Smooth slide-in/out animations
 * - Fixed position (desktop) or overlay (mobile/tablet)
 * - Scrollable content area
 * - Close button in overlay mode
 * - Touch-friendly tab buttons
 * - Keyboard navigation support
 *
 * Responsive Behavior:
 * - Desktop (≥1024px): Fixed sidebar, 350px wide
 * - Large (1024px-1535px): Fixed sidebar, 280px wide
 * - Tablet/Mobile (<1024px): Overlay sidebar with backdrop
 *
 * Usage:
 * ```tsx
 * <LeftSidebar
 *   isOpen={leftSidebarOpen}
 *   onClose={() => setLeftSidebarOpen(false)}
 *   isOverlay={isMobile || isTablet}
 *   width="w-[350px]"
 * />
 * ```
 */
export function LeftSidebar({ isOpen, onClose, isOverlay, width }: LeftSidebarProps) {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('labels');

  // Store state
  const calibrationData = useAppStore((state) => state.calibrationData);
  const annotations = useAppStore((state) => state.annotations);

  /**
   * Get the active tab component
   */
  const getActiveTabContent = () => {
    const activeTabDef = TABS.find((tab) => tab.id === activeTab);
    if (!activeTabDef) return null;

    const Component = activeTabDef.component;

    // Render component based on tab type
    switch (activeTab) {
      case 'labels':
        return <Component showActions />;

      case 'calibration':
        return (
          <div className="p-4">
            <Component
              isCalibrated={calibrationData.isCalibrated}
              metersPerPixel={calibrationData.metersPerPixel}
              referenceLength={calibrationData.referenceLength}
              pixelDistance={calibrationData.pixelDistance}
            />
          </div>
        );

      case 'annotations':
        return <Component />;

      case 'project':
        return <Component />;

      default:
        return null;
    }
  };

  /**
   * Calculate total annotation count
   */
  const getTotalAnnotationCount = () => {
    return Object.values(annotations).reduce((total, pageAnnotations) => {
      return total + pageAnnotations.length;
    }, 0);
  };

  /**
   * Get badge count for tabs
   */
  const getTabBadge = (tabId: TabType): number | null => {
    switch (tabId) {
      case 'annotations':
        return getTotalAnnotationCount();
      default:
        return null;
    }
  };

  // Don't render if not open (for non-overlay mode)
  if (!isOpen && !isOverlay) {
    return null;
  }

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out',
        width,
        isOverlay ? [
          'fixed top-16 left-0 bottom-0 z-40 shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ] : [
          'fixed top-16 left-0 bottom-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ]
      )}
      aria-label="Left sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {TABS.find((tab) => tab.id === activeTab)?.label || 'Labels'}
        </h2>
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

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const badge = getTabBadge(tab.id);
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors relative',
                isActive
                  ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge !== null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {getActiveTabContent()}
      </div>

      {/* Footer (optional hints) */}
      {activeTab === 'labels' && (
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-600 text-center">
            Click a label to select and start annotating
          </p>
        </div>
      )}

      {activeTab === 'calibration' && !calibrationData.isCalibrated && (
        <div className="border-t border-gray-200 bg-red-50 p-3">
          <p className="text-xs text-red-700 text-center font-medium">
            ⚠️ Calibrate to enable measurements
          </p>
        </div>
      )}
    </aside>
  );
}
