import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Tag,
  Ruler,
  Pentagon,
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Input } from './ui/input';
import type { AnnotationData } from '../types/store';
import { cn } from '../utils/cn';

/**
 * Sort options for annotations
 */
type SortField = 'type' | 'page' | 'createdAt' | 'quantity';
type SortDirection = 'asc' | 'desc';

/**
 * Filter options for annotations
 */
type FilterType = 'all' | 'marker' | 'label' | 'line' | 'polygon';

/**
 * AnnotationsList Component
 *
 * Displays a comprehensive list of all annotations across all pages.
 * Provides filtering, sorting, searching, and management actions.
 *
 * Features:
 * - View all annotations organized by page
 * - Search annotations by text/label
 * - Filter by annotation type
 * - Sort by type, page, date, or quantity
 * - Click to select annotation on canvas
 * - Quick actions (delete, duplicate, hide/show)
 * - Visual indicators (type icons, colors)
 * - Annotation statistics
 * - Collapsible page groups
 * - Total count and cost per annotation
 * - Empty state when no annotations
 *
 * Layout:
 * - Search bar at top
 * - Filter buttons row
 * - Sort dropdown
 * - Grouped by page (collapsible)
 * - Individual annotation cards
 * - Quick action buttons
 *
 * Usage:
 * ```tsx
 * <AnnotationsList />
 * ```
 */
export function AnnotationsList() {
  // Store state
  const annotations = useAppStore((state) => state.annotations);
  const labels = useAppStore((state) => state.labels);
  const selectAnnotation = useAppStore((state) => state.selectAnnotation);
  const deleteAnnotation = useAppStore((state) => state.deleteAnnotation);
  const selectedAnnotationId = useAppStore((state) => state.selectedAnnotationId);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('page');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [collapsedPages, setCollapsedPages] = useState<Set<number>>(new Set());
  const [hiddenAnnotations, setHiddenAnnotations] = useState<Set<string>>(new Set());

  /**
   * Get icon for annotation type
   */
  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'marker':
        return MapPin;
      case 'label':
        return Tag;
      case 'line':
        return Ruler;
      case 'polygon':
        return Pentagon;
      default:
        return MapPin;
    }
  };

  /**
   * Get label name for annotation
   */
  const getLabelName = (annotation: AnnotationData) => {
    if (annotation.labelId) {
      const label = labels.find((l) => l.id === annotation.labelId);
      return label?.name || 'Unknown Label';
    }
    return annotation.text || `${annotation.type} annotation`;
  };

  /**
   * Flatten annotations from all pages
   */
  const flattenedAnnotations = useMemo(() => {
    const flattened: (AnnotationData & { pageNumber: number })[] = [];
    Object.entries(annotations).forEach(([pageNum, pageAnnotations]) => {
      pageAnnotations.forEach((annotation) => {
        flattened.push({
          ...annotation,
          pageNumber: parseInt(pageNum, 10),
        });
      });
    });
    return flattened;
  }, [annotations]);

  /**
   * Filter and sort annotations
   */
  const filteredAnnotations = useMemo(() => {
    let filtered = flattenedAnnotations;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => {
        const labelName = getLabelName(a).toLowerCase();
        const text = (a.text || '').toLowerCase();
        const notes = (a.notes || '').toLowerCase();
        return labelName.includes(query) || text.includes(query) || notes.includes(query);
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'page':
          comparison = a.pageNumber - b.pageNumber;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'quantity':
          comparison = (a.quantity || 0) - (b.quantity || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [flattenedAnnotations, filterType, searchQuery, sortField, sortDirection]);

  /**
   * Group annotations by page
   */
  const groupedAnnotations = useMemo(() => {
    const grouped: Record<number, AnnotationData[]> = {};
    filteredAnnotations.forEach((annotation) => {
      const page = annotation.pageNumber;
      if (!grouped[page]) {
        grouped[page] = [];
      }
      grouped[page].push(annotation);
    });
    return grouped;
  }, [filteredAnnotations]);

  /**
   * Toggle page collapse
   */
  const togglePageCollapse = (pageNum: number) => {
    setCollapsedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  /**
   * Toggle annotation visibility
   */
  const toggleAnnotationVisibility = (e: React.MouseEvent, annotationId: string) => {
    e.stopPropagation();
    setHiddenAnnotations((prev) => {
      const next = new Set(prev);
      if (next.has(annotationId)) {
        next.delete(annotationId);
      } else {
        next.add(annotationId);
      }
      return next;
    });
  };

  /**
   * Handle annotation click
   */
  const handleAnnotationClick = (annotation: AnnotationData & { pageNumber: number }) => {
    // Navigate to page
    setCurrentPage(annotation.pageNumber);
    // Select annotation
    selectAnnotation(annotation.id);
  };

  /**
   * Handle delete annotation
   */
  const handleDeleteAnnotation = (
    e: React.MouseEvent,
    annotationId: string,
    annotationLabel: string
  ) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Delete annotation "${annotationLabel}"? This cannot be undone.`
    );
    if (confirmed) {
      deleteAnnotation(annotationId);
    }
  };

  /**
   * Handle duplicate annotation
   */
  const handleDuplicateAnnotation = (
    e: React.MouseEvent,
    annotation: AnnotationData & { pageNumber: number }
  ) => {
    e.stopPropagation();
    // TODO: Implement duplicate functionality
    console.log('Duplicate annotation:', annotation.id);
  };

  /**
   * Toggle sort direction
   */
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const totalCount = filteredAnnotations.length;
  const typeCount = {
    marker: filteredAnnotations.filter((a) => a.type === 'marker').length,
    label: filteredAnnotations.filter((a) => a.type === 'label').length,
    line: filteredAnnotations.filter((a) => a.type === 'line').length,
    polygon: filteredAnnotations.filter((a) => a.type === 'polygon').length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-3 border-b border-gray-200">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search annotations..."
            className="pl-9"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'marker', 'label', 'line', 'polygon'] as const).map((type) => {
            const count =
              type === 'all' ? totalCount : typeCount[type as keyof typeof typeCount];
            const Icon = type === 'all' ? Filter : getAnnotationIcon(type);
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{type}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    filterType === type ? 'bg-blue-700' : 'bg-gray-300 text-gray-700'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="page">Sort by Page</option>
            <option value="type">Sort by Type</option>
            <option value="createdAt">Sort by Date</option>
            <option value="quantity">Sort by Quantity</option>
          </select>
          <button
            onClick={toggleSortDirection}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
          >
            {sortDirection === 'asc' ? (
              <SortAsc className="w-4 h-4 text-gray-700" />
            ) : (
              <SortDesc className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Annotations List */}
      <div className="flex-1 overflow-y-auto">
        {totalCount === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-gray-300 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Annotations</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {searchQuery || filterType !== 'all'
                ? 'No annotations match your search or filter criteria.'
                : 'Start annotating the PDF to see annotations here.'}
            </p>
          </div>
        ) : (
          // Grouped Annotations
          <div className="divide-y divide-gray-200">
            {Object.entries(groupedAnnotations)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([pageNum, pageAnnotations]) => {
                const page = parseInt(pageNum);
                const isCollapsed = collapsedPages.has(page);

                return (
                  <div key={page}>
                    {/* Page Header */}
                    <button
                      onClick={() => togglePageCollapse(page)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm font-semibold text-gray-900">
                          Page {page}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {pageAnnotations.length}
                        </span>
                      </div>
                    </button>

                    {/* Page Annotations */}
                    {!isCollapsed && (
                      <div className="divide-y divide-gray-100">
                        {pageAnnotations.map((annotation) => {
                          const Icon = getAnnotationIcon(annotation.type);
                          const labelName = getLabelName(annotation);
                          const isSelected = annotation.id === selectedAnnotationId;
                          const isHidden = hiddenAnnotations.has(annotation.id);

                          return (
                            <div
                              key={annotation.id}
                              onClick={() =>
                                handleAnnotationClick(annotation as AnnotationData & { pageNumber: number })
                              }
                              className={cn(
                                'px-4 py-3 cursor-pointer transition-colors',
                                isSelected
                                  ? 'bg-blue-50 border-l-4 border-blue-600'
                                  : 'hover:bg-gray-50 border-l-4 border-transparent',
                                isHidden && 'opacity-40'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{
                                    backgroundColor: annotation.color + '20',
                                    color: annotation.color,
                                  }}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {labelName}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                                    >
                                      {annotation.type}
                                    </span>
                                    {annotation.quantity && (
                                      <span className="text-xs text-gray-500">
                                        Qty: {annotation.quantity.toFixed(2)} {annotation.unit}
                                      </span>
                                    )}
                                  </div>
                                  {annotation.notes && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      {annotation.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) =>
                                      toggleAnnotationVisibility(e, annotation.id)
                                    }
                                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                    title={isHidden ? 'Show' : 'Hide'}
                                  >
                                    {isHidden ? (
                                      <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleDuplicateAnnotation(e, annotation as AnnotationData & { pageNumber: number })
                                    }
                                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                    title="Duplicate"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleDeleteAnnotation(e, annotation.id, labelName)
                                    }
                                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
