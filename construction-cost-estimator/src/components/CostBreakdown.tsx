import React, { useState, useMemo } from 'react';
import { useCostEstimation, useCostFilters } from '../hooks/useCostEstimation';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  Filter,
  X,
  SortAsc,
  SortDesc,
} from 'lucide-react';

type SortField = 'description' | 'quantity' | 'unitCost' | 'totalCost' | 'category';
type SortDirection = 'asc' | 'desc';

/**
 * CostBreakdown Component
 *
 * Displays detailed cost breakdown in a table format:
 * - All cost items with full details
 * - Group by category with subtotals
 * - Expandable/collapsible sections
 * - Sort and filter capabilities
 * - Search functionality
 * - Export options
 */
export const CostBreakdown: React.FC = () => {
  const {
    costItems,
    groupedCosts,
    categoryTotals,
    grandTotal,
    formatCost,
    downloadCosts,
    isCalibrated,
    hasAnnotations,
  } = useCostEstimation();

  const {
    filteredItems,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    clearFilters,
    hasFilters,
  } = useCostFilters(costItems);

  // Local state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('description');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(groupedCosts)));
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Sort items
  const sortedItems = useMemo(() => {
    const items = [...filteredItems];

    items.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle string comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal === bVal) return 0;
      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [filteredItems, sortField, sortDirection]);

  // Group sorted items by category
  const groupedSortedItems = useMemo(() => {
    const grouped: Record<string, typeof sortedItems> = {};
    sortedItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }, [sortedItems]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <SortAsc className="w-4 h-4" />
    ) : (
      <SortDesc className="w-4 h-4" />
    );
  };

  // Categories to display
  const categories = Object.keys(groupedSortedItems).sort();

  // Handle export
  const handleExport = (format: 'json' | 'csv') => {
    downloadCosts(format);
  };

  if (!isCalibrated || !hasAnnotations) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          {!isCalibrated
            ? 'Please calibrate the drawing to view cost breakdown.'
            : 'Add annotations to see cost breakdown.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Collapse All
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${
              showFilters || hasFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <div className="relative group">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('json')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-700">
            <div
              className="col-span-4 flex items-center gap-2 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('description')}
            >
              Description
              <SortIcon field="description" />
            </div>
            <div
              className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('quantity')}
            >
              Quantity
              <SortIcon field="quantity" />
            </div>
            <div className="col-span-1">Unit</div>
            <div
              className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('unitCost')}
            >
              Unit Cost
              <SortIcon field="unitCost" />
            </div>
            <div
              className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('totalCost')}
            >
              Total Cost
              <SortIcon field="totalCost" />
            </div>
            <div
              className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('category')}
            >
              Category
              <SortIcon field="category" />
            </div>
          </div>
        </div>

        {/* Table Body - Grouped by Category */}
        <div className="divide-y divide-gray-200">
          {categories.map(category => {
            const items = groupedSortedItems[category];
            const isExpanded = expandedCategories.has(category);
            const totals = categoryTotals[category];

            return (
              <div key={category}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full bg-gray-50 hover:bg-gray-100 px-4 py-3 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="font-semibold text-gray-900">{category}</span>
                    <span className="text-sm text-gray-500">
                      ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    {totals && (
                      <>
                        <span className="text-sm text-gray-600">
                          {totals.percentage?.toFixed(1)}%
                        </span>
                        <span className="font-bold text-gray-900">
                          {formatCost(totals.cost)}
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-gray-50"
                      >
                        <div className="col-span-4 text-gray-900">
                          {item.description}
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                        <div className="col-span-2 text-gray-700">
                          {item.quantity.toFixed(2)}
                        </div>
                        <div className="col-span-1 text-gray-600">{item.unit}</div>
                        <div className="col-span-2 text-gray-700">
                          {formatCost(item.unitCost)}
                        </div>
                        <div className="col-span-2 font-semibold text-gray-900">
                          {formatCost(item.totalCost)}
                        </div>
                        <div className="col-span-1 text-xs text-gray-500">
                          Page {item.pageNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grand Total Footer */}
        <div className="bg-gray-50 border-t-2 border-gray-300 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Grand Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCost(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* No Results */}
      {sortedItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No cost items match your filters.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CostBreakdown;
