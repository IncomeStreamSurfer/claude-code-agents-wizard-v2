import React from 'react';
import { MapPin, Tag, Ruler, Pentagon, Hand, MousePointer, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '../store/useAppStore';
import { useTotalAnnotationCount } from '../store/useAppStore';

/**
 * Props for AnnotationToolbar component
 */
export interface AnnotationToolbarProps {
  /** Callback when tool is selected */
  onToolChange?: (tool: 'select' | 'marker' | 'label' | 'line' | 'polygon' | null) => void;
  /** Show reset button */
  showReset?: boolean;
  /** Show clear button */
  showClear?: boolean;
  /** Callback when reset is clicked */
  onReset?: () => void;
  /** Callback when clear is clicked */
  onClear?: () => void;
}

/**
 * AnnotationToolbar Component
 *
 * Main toolbar for selecting annotation tools and managing annotations.
 * Displays tool buttons with icons, keyboard shortcuts, and active state indicators.
 *
 * Features:
 * - Tool selection buttons (Select, Marker, Label, Line, Polygon)
 * - Active tool indicator with highlighted button
 * - Keyboard shortcuts displayed in tooltips
 * - Reset and Clear buttons for annotation management
 * - Annotation count display
 * - Integration with Zustand store
 *
 * Keyboard Shortcuts:
 * - V: Select tool
 * - M: Marker tool
 * - L: Label tool
 * - D: Line/Distance tool
 * - A: Area/Polygon tool
 * - Escape: Cancel current tool
 *
 * Usage:
 * ```tsx
 * <AnnotationToolbar
 *   onToolChange={(tool) => console.log('Tool changed:', tool)}
 *   showReset
 *   showClear
 * />
 * ```
 */
export function AnnotationToolbar({
  onToolChange,
  showReset = false,
  showClear = false,
  onReset,
  onClear,
}: AnnotationToolbarProps) {
  const activeTool = useAppStore((state) => state.activeTool);
  const setActiveTool = useAppStore((state) => state.setActiveTool);
  const clearAnnotations = useAppStore((state) => state.clearAnnotations);
  const currentPageNumber = useAppStore((state) => state.currentPageNumber);
  const annotationCount = useTotalAnnotationCount();

  /**
   * Handle tool selection
   */
  const handleToolSelect = (tool: typeof activeTool) => {
    // Toggle off if clicking active tool
    const newTool = activeTool === tool ? null : tool;
    setActiveTool(newTool);

    if (onToolChange) {
      onToolChange(newTool as any);
    }
  };

  /**
   * Handle reset
   */
  const handleReset = () => {
    setActiveTool(null);
    if (onReset) {
      onReset();
    }
  };

  /**
   * Handle clear annotations
   */
  const handleClear = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all annotations on this page?'
    );
    if (confirmed) {
      clearAnnotations(currentPageNumber);
      if (onClear) {
        onClear();
      }
    }
  };

  /**
   * Keyboard shortcuts
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'v':
        e.preventDefault();
        handleToolSelect('select');
        break;
      case 'm':
        e.preventDefault();
        handleToolSelect('marker');
        break;
      case 'l':
        e.preventDefault();
        handleToolSelect('label');
        break;
      case 'd':
        e.preventDefault();
        handleToolSelect('line');
        break;
      case 'a':
        e.preventDefault();
        handleToolSelect('polygon');
        break;
      case 'escape':
        e.preventDefault();
        setActiveTool(null);
        break;
    }
  };

  // Set up keyboard shortcuts
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    return () => {
      window.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [activeTool]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-md">
      {/* Tool selection buttons */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        {/* Select tool */}
        <Button
          variant={activeTool === 'select' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolSelect('select')}
          title="Select Tool (V)"
          className="relative"
        >
          <MousePointer className="w-4 h-4" />
          {activeTool === 'select' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </Button>

        {/* Pan tool */}
        <Button
          variant={activeTool === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolSelect(null)}
          title="Pan Tool (Hand)"
        >
          <Hand className="w-4 h-4" />
        </Button>
      </div>

      {/* Drawing tools */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        {/* Marker tool */}
        <Button
          variant={activeTool === 'marker' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolSelect('marker')}
          title="Marker Tool (M) - Place point markers"
          className="relative"
        >
          <MapPin className="w-4 h-4" />
          {activeTool === 'marker' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>

        {/* Label tool */}
        <Button
          variant={activeTool === 'label' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolSelect('label')}
          title="Label Tool (L) - Add text labels"
          className="relative"
        >
          <Tag className="w-4 h-4" />
          {activeTool === 'label' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </Button>
      </div>

      {/* Measurement tools */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        {/* Line measurement tool */}
        <Button
          variant={activeTool === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolSelect('line')}
          title="Line Tool (D) - Measure distances"
          className="relative"
        >
          <Ruler className="w-4 h-4" />
          {activeTool === 'line' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
          )}
        </Button>

        {/* Polygon area tool */}
        <Button
          variant={activeTool === 'polygon' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolSelect('polygon')}
          title="Polygon Tool (A) - Measure areas"
          className="relative"
        >
          <Pentagon className="w-4 h-4" />
          {activeTool === 'polygon' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {showReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            title="Reset Tool"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}

        {showClear && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            title="Clear Annotations"
            disabled={annotationCount === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Annotation count */}
      {annotationCount > 0 && (
        <div className="ml-auto text-sm text-gray-600 border-l border-gray-200 pl-2">
          {annotationCount} annotation{annotationCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of AnnotationToolbar for mobile/small screens
 */
export function AnnotationToolbarCompact() {
  const activeTool = useAppStore((state) => state.activeTool);
  const setActiveTool = useAppStore((state) => state.setActiveTool);

  const handleToolSelect = (tool: typeof activeTool) => {
    const newTool = activeTool === tool ? null : tool;
    setActiveTool(newTool);
  };

  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-white border border-gray-200 rounded-full shadow-md">
      <button
        onClick={() => handleToolSelect('marker')}
        className={`p-2 rounded-full transition-colors ${
          activeTool === 'marker' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
        }`}
        title="Marker"
      >
        <MapPin className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleToolSelect('label')}
        className={`p-2 rounded-full transition-colors ${
          activeTool === 'label' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
        }`}
        title="Label"
      >
        <Tag className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleToolSelect('line')}
        className={`p-2 rounded-full transition-colors ${
          activeTool === 'line' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'
        }`}
        title="Line"
      >
        <Ruler className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleToolSelect('polygon')}
        className={`p-2 rounded-full transition-colors ${
          activeTool === 'polygon' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
        }`}
        title="Polygon"
      >
        <Pentagon className="w-4 h-4" />
      </button>
    </div>
  );
}
