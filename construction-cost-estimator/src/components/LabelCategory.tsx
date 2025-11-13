import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../utils/cn';
import type { LabelDefinition } from '../types/store';

/**
 * Props for LabelCategory component
 */
export interface LabelCategoryProps {
  /** Category name */
  category: string;
  /** Category description */
  description?: string;
  /** Category icon */
  icon?: string;
  /** Labels in this category */
  labels: LabelDefinition[];
  /** Currently selected label ID */
  selectedLabelId: string | null;
  /** Callback when a label is selected */
  onLabelSelect: (label: LabelDefinition) => void;
  /** Callback when edit is clicked */
  onEditLabel?: (label: LabelDefinition) => void;
  /** Callback when delete is clicked */
  onDeleteLabel?: (labelId: string) => void;
  /** Callback when add label is clicked */
  onAddLabel?: (category: string) => void;
  /** Initially collapsed */
  initiallyCollapsed?: boolean;
  /** Show actions */
  showActions?: boolean;
}

/**
 * Category icons
 */
const CATEGORY_ICONS: Record<string, string> = {
  Openings: '🪟',
  Structure: '🏗️',
  Surfaces: '⬜',
  MEP: '⚡',
  Circulation: '🪜',
  Other: '📌',
};

/**
 * LabelCategory Component
 *
 * Displays a collapsible category section with labels.
 *
 * Features:
 * - Category name header with icon
 * - Grid of labels in category
 * - Collapsible (expand/collapse)
 * - Category description
 * - Count of labels
 * - Add label to category action
 *
 * Usage:
 * ```tsx
 * <LabelCategory
 *   category="Openings"
 *   description="Windows, Doors, Gates"
 *   labels={openingsLabels}
 *   selectedLabelId={selectedId}
 *   onLabelSelect={(label) => console.log('Selected:', label)}
 *   onAddLabel={(cat) => console.log('Add to:', cat)}
 * />
 * ```
 */
export function LabelCategory({
  category,
  description,
  icon,
  labels,
  selectedLabelId,
  onLabelSelect,
  onEditLabel,
  onDeleteLabel,
  onAddLabel,
  initiallyCollapsed = false,
  showActions = true,
}: LabelCategoryProps) {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  const categoryIcon = icon || CATEGORY_ICONS[category] || '📁';

  /**
   * Toggle collapse state
   */
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  /**
   * Handle add label click
   */
  const handleAddLabel = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddLabel?.(category);
    },
    [category, onAddLabel]
  );

  /**
   * Get unit display name
   */
  const getUnitDisplay = (unit: string): string => {
    switch (unit) {
      case 'count':
        return 'Count';
      case 'linear_meters':
        return 'm';
      case 'square_meters':
        return 'm²';
      default:
        return unit;
    }
  };

  return (
    <div className="space-y-3">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={toggleCollapse}
          className="flex items-center gap-3 text-left hover:opacity-70 transition-opacity flex-1"
        >
          <div className="text-2xl">{categoryIcon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {category}
              </h3>
              <span className="text-xs text-gray-500">({labels.length})</span>
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </button>

        {/* Add Label Button */}
        {showActions && onAddLabel && !isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddLabel}
            className="flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Category Labels Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {labels.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">
              No labels in this category
            </div>
          ) : (
            labels.map(label => (
              <div
                key={label.id}
                className={cn(
                  'relative group border-2 rounded-lg p-3 cursor-pointer transition-all',
                  'hover:shadow-md hover:scale-[1.02]',
                  selectedLabelId === label.id
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
                onClick={() => onLabelSelect(label)}
              >
                {/* Selected Indicator */}
                {selectedLabelId === label.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {/* Label Content */}
                <div className="flex items-start gap-3">
                  {/* Color Swatch */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.icon || '📌'}
                  </div>

                  {/* Label Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{label.name}</h4>
                    {label.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {label.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {getUnitDisplay(label.unit)}
                      </span>
                      {label.costPerUnit !== undefined && (
                        <span className="text-xs text-gray-500">${label.costPerUnit}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions (shown on hover) */}
                {showActions && (onEditLabel || onDeleteLabel) && (
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditLabel && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onEditLabel(label);
                        }}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                    )}
                    {onDeleteLabel && !label.id.startsWith('label-') && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteLabel(label.id);
                        }}
                        className="px-2 py-1 text-xs bg-white border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
