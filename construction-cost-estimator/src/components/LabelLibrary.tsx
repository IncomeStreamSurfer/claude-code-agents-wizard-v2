import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, Plus, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { LabelDefinition } from '../types/store';
import { LabelEditor } from './LabelEditor';
import { cn } from '../utils/cn';

/**
 * Props for LabelLibrary component
 */
export interface LabelLibraryProps {
  /** Callback when a label is selected */
  onLabelSelect?: (label: LabelDefinition) => void;
  /** Show simplified version */
  compact?: boolean;
  /** Show add/edit/delete buttons */
  showActions?: boolean;
  /** Filter to specific categories */
  categories?: string[];
}

/**
 * Category definitions
 */
const CATEGORIES = [
  { id: 'all', name: 'All', description: 'All labels' },
  { id: 'Openings', name: 'Openings', description: 'Windows, Doors, Gates, Skylights' },
  { id: 'Structure', name: 'Structures', description: 'Walls, Columns, Beams, Foundations' },
  { id: 'Surfaces', name: 'Surfaces', description: 'Floors, Ceilings, Roofs, Sidewalks' },
  { id: 'MEP', name: 'Equipment', description: 'HVAC, Electrical, Plumbing, Fire Safety' },
  { id: 'Circulation', name: 'Circulation', description: 'Stairs, Elevators, Ramps' },
  { id: 'Other', name: 'Other', description: 'Custom, Miscellaneous, Notes' },
];

/**
 * LabelLibrary Component
 *
 * Displays all available labels from Zustand store with category filters,
 * search functionality, and quick-select capabilities.
 *
 * Features:
 * - Display labels with color, icon, name, unit type, category
 * - Category filtering with label counts
 * - Search by name, category, unit type
 * - Click to select label (activates tool + applies styling)
 * - Add/edit/delete labels
 * - Keyboard navigation support
 * - Responsive grid layout
 *
 * Usage:
 * ```tsx
 * <LabelLibrary
 *   onLabelSelect={(label) => console.log('Selected:', label)}
 *   showActions={true}
 * />
 * ```
 */
export function LabelLibrary({
  onLabelSelect,
  compact = false,
  showActions = true,
  categories: categoryFilter,
}: LabelLibraryProps) {
  const labels = useAppStore((state) => state.labels);
  const selectedLabelId = useAppStore((state) => state.selectedLabelId);
  const selectLabel = useAppStore((state) => state.selectLabel);
  const setActiveTool = useAppStore((state) => state.setActiveTool);
  const deleteLabel = useAppStore((state) => state.deleteLabel);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelDefinition | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  /**
   * Filter labels by search query and category
   */
  const filteredLabels = useMemo(() => {
    let filtered = labels;

    // Apply category filter from props
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter(label => categoryFilter.includes(label.category || ''));
    }

    // Apply selected category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(label => label.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        label =>
          label.name.toLowerCase().includes(query) ||
          label.category?.toLowerCase().includes(query) ||
          label.description?.toLowerCase().includes(query) ||
          label.unit.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [labels, searchQuery, selectedCategory, categoryFilter]);

  /**
   * Group labels by category
   */
  const labelsByCategory = useMemo(() => {
    const grouped = new Map<string, LabelDefinition[]>();

    filteredLabels.forEach(label => {
      const category = label.category || 'Other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(label);
    });

    return grouped;
  }, [filteredLabels]);

  /**
   * Count labels per category
   */
  const labelCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set('all', labels.length);

    labels.forEach(label => {
      const category = label.category || 'Other';
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    return counts;
  }, [labels]);

  /**
   * Handle label selection
   */
  const handleLabelSelect = useCallback(
    (label: LabelDefinition) => {
      selectLabel(label.id);
      setActiveTool('label'); // Activate label tool
      onLabelSelect?.(label);
    },
    [selectLabel, setActiveTool, onLabelSelect]
  );

  /**
   * Handle label edit
   */
  const handleEditLabel = useCallback((label: LabelDefinition) => {
    setEditingLabel(label);
    setShowEditor(true);
  }, []);

  /**
   * Handle add new label
   */
  const handleAddLabel = useCallback(() => {
    setEditingLabel(null);
    setShowEditor(true);
  }, []);

  /**
   * Handle delete label
   */
  const handleDeleteLabel = useCallback(
    (labelId: string) => {
      if (confirm('Are you sure you want to delete this label?')) {
        deleteLabel(labelId);
      }
    },
    [deleteLabel]
  );

  /**
   * Toggle category collapse
   */
  const toggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

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

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to clear selection
      if (e.key === 'Escape' && selectedLabelId) {
        selectLabel(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLabelId, selectLabel]);

  return (
    <div className={cn('flex flex-col h-full bg-white', compact ? 'p-2' : 'p-4')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={cn('font-semibold text-gray-900', compact ? 'text-lg' : 'text-xl')}>
            Label Library
          </h2>
          <p className="text-sm text-gray-500">
            {filteredLabels.length} of {labels.length} labels
          </p>
        </div>
        {showActions && (
          <Button onClick={handleAddLabel} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Label
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search labels..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedCategory === cat.id
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {cat.name}
            <span className="ml-1.5 text-xs opacity-75">
              ({labelCountByCategory.get(cat.id === 'all' ? 'all' : cat.id) || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Labels Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredLabels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Filter className="w-12 h-12 mb-2 opacity-20" />
            <p>No labels found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : compact ? (
          // Compact grid view
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLabels.map(label => (
              <LabelCard
                key={label.id}
                label={label}
                isSelected={selectedLabelId === label.id}
                onSelect={handleLabelSelect}
                onEdit={showActions ? handleEditLabel : undefined}
                onDelete={showActions ? handleDeleteLabel : undefined}
                compact={true}
                getUnitDisplay={getUnitDisplay}
              />
            ))}
          </div>
        ) : (
          // Grouped by category view
          <div className="space-y-6">
            {Array.from(labelsByCategory.entries()).map(([category, categoryLabels]) => (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategoryCollapse(category)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      {category}
                    </h3>
                    <span className="text-xs text-gray-500">({categoryLabels.length})</span>
                  </div>
                  {collapsedCategories.has(category) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Category Labels */}
                {!collapsedCategories.has(category) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryLabels.map(label => (
                      <LabelCard
                        key={label.id}
                        label={label}
                        isSelected={selectedLabelId === label.id}
                        onSelect={handleLabelSelect}
                        onEdit={showActions ? handleEditLabel : undefined}
                        onDelete={showActions ? handleDeleteLabel : undefined}
                        compact={false}
                        getUnitDisplay={getUnitDisplay}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Label Editor Dialog */}
      {showEditor && (
        <LabelEditor
          label={editingLabel}
          onClose={() => {
            setShowEditor(false);
            setEditingLabel(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Individual Label Card Component
 */
interface LabelCardProps {
  label: LabelDefinition;
  isSelected: boolean;
  onSelect: (label: LabelDefinition) => void;
  onEdit?: (label: LabelDefinition) => void;
  onDelete?: (labelId: string) => void;
  compact: boolean;
  getUnitDisplay: (unit: string) => string;
}

function LabelCard({
  label,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  compact,
  getUnitDisplay,
}: LabelCardProps) {
  return (
    <div
      className={cn(
        'relative group border-2 rounded-lg p-3 cursor-pointer transition-all',
        'hover:shadow-md hover:scale-[1.02]',
        isSelected
          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
      onClick={() => onSelect(label)}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
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
          {!compact && label.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{label.description}</p>
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
      {(onEdit || onDelete) && (
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={e => {
                e.stopPropagation();
                onEdit(label);
              }}
              className="p-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
            >
              Edit
            </button>
          )}
          {onDelete && !label.id.startsWith('label-') && (
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete(label.id);
              }}
              className="p-1 text-xs bg-white border border-red-300 text-red-600 rounded hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
