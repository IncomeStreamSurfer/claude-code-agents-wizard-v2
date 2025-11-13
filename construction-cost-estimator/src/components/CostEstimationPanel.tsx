import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DollarSign,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  Download,
  Settings,
  RefreshCw,
  Copy,
  BarChart3,
  Check,
  X as XIcon,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useCostEstimation } from '../hooks/useCostEstimation';
import type { CostItem } from '../types';
import { CostExportPanel } from './CostExportPanel';
import { CostSettingsPanel } from './CostSettingsPanel';
import { CostCategorySection } from './CostCategorySection';

/**
 * Sort options for cost items
 */
type SortField = 'name' | 'quantity' | 'cost' | 'category';
type SortDirection = 'asc' | 'desc';

/**
 * Active tab in the panel
 */
type ActiveTab = 'categories' | 'items';

/**
 * Panel settings interface
 */
export interface PanelSettings {
  currency: string;
  decimalPlaces: number;
  groupBy: 'category' | 'page' | 'label';
  showUnits: boolean;
  showPercentages: boolean;
  showZeroItems: boolean;
  autoRefresh: boolean;
}

/**
 * Props for CostEstimationPanel component
 */
export interface CostEstimationPanelProps {
  width?: number | string;
  collapsible?: boolean;
  showChart?: boolean;
  compact?: boolean;
  onExport?: (format: string, data: any) => void;
  onSettingsChange?: (settings: PanelSettings) => void;
}

/**
 * CostEstimationPanel - Comprehensive cost estimation sidebar panel
 *
 * Features:
 * - Grand total with markup calculation
 * - Markup slider control (0-50%)
 * - Statistics section (annotation count, categories, last updated)
 * - Category breakdown with percentages
 * - Detailed items list with sorting/filtering
 * - Export functionality (JSON, CSV, Excel, Print)
 * - Settings panel for customization
 * - Real-time updates with debouncing
 * - Responsive design for all screen sizes
 */
export const CostEstimationPanel: React.FC<CostEstimationPanelProps> = ({
  width = '400px',
  collapsible = true,
  showChart = false,
  onExport,
  onSettingsChange,
}) => {
  // Get cost estimation data
  const {
    costItems,
    groupedCosts,
    categoryTotals,
    grandTotal,
    markupPercent,
    totalWithMarkup,
    markupAmount,
    isCalibrated,
    hasAnnotations,
    totalItems,
    totalAnnotations,
    totalCategories,
    setMarkup,
    recalculate,
    formatCost,
  } = useCostEstimation();

  // Local state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isCalculating, setIsCalculating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<PanelSettings>({
    currency: 'USD',
    decimalPlaces: 2,
    groupBy: 'category',
    showUnits: true,
    showPercentages: true,
    showZeroItems: false,
    autoRefresh: true,
  });

  // Update last updated timestamp when cost items change
  useEffect(() => {
    setLastUpdated(new Date());
  }, [costItems, grandTotal]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (settings.autoRefresh && isCalibrated && hasAnnotations) {
      const timer = setTimeout(() => {
        recalculate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [settings.autoRefresh, isCalibrated, hasAnnotations, recalculate]);

  // Handle markup slider change
  const handleMarkupChange = useCallback((value: number) => {
    setMarkup(value);
  }, [setMarkup]);

  // Handle markup input change
  const handleMarkupInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setMarkup(Math.max(0, Math.min(50, value)));
    }
  }, [setMarkup]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let items = [...costItems];

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.description.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.notes?.toLowerCase().includes(search)
      );
    }

    // Filter zero items if needed
    if (!settings.showZeroItems) {
      items = items.filter(item => item.totalCost > 0);
    }

    // Sort items
    items.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.description.toLowerCase();
          bVal = b.description.toLowerCase();
          break;
        case 'quantity':
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case 'cost':
          aVal = a.totalCost;
          bVal = b.totalCost;
          break;
        case 'category':
          aVal = (a.category || 'Uncategorized').toLowerCase();
          bVal = (b.category || 'Uncategorized').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal === bVal) return 0;
      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [costItems, searchTerm, sortField, sortDirection, settings.showZeroItems]);

  // Group filtered items by category
  const groupedFilteredItems = useMemo(() => {
    const grouped: Record<string, CostItem[]> = {};
    filteredAndSortedItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }, [filteredAndSortedItems]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    recalculate();
    setLastUpdated(new Date());
    setIsCalculating(false);
  }, [recalculate]);

  // Handle copy to clipboard
  const handleCopy = useCallback(() => {
    const text = `Grand Total: ${formatCost(grandTotal)}\nWith ${markupPercent}% Markup: ${formatCost(totalWithMarkup)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [grandTotal, totalWithMarkup, markupPercent, formatCost]);

  // Handle settings change
  const handleSettingsChange = useCallback((newSettings: Partial<PanelSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (onSettingsChange) {
        onSettingsChange(updated);
      }
      return updated;
    });
  }, [onSettingsChange]);

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  // Render status indicator
  const renderStatusIndicator = () => {
    if (!isCalibrated) {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">Not Calibrated</span>
        </div>
      );
    }
    if (isCalculating) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-xs">Calculating...</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Check className="w-4 h-4" />
        <span className="text-xs">Synced</span>
      </div>
    );
  };

  // If collapsed, show minimal view
  if (isCollapsed && collapsible) {
    return (
      <div
        className="bg-white border-l border-gray-200 shadow-lg transition-all duration-300"
        style={{ width: '60px' }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full p-4 flex items-center justify-center hover:bg-gray-50"
          aria-label="Expand cost panel"
        >
          <ChevronUp className="w-5 h-5 text-gray-600 rotate-90" />
        </button>
        <div className="p-4 border-t border-gray-200">
          <div className="writing-mode-vertical text-sm font-semibold text-gray-700">
            Cost Estimation
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white border-l border-gray-200 shadow-lg flex flex-col h-full transition-all duration-300"
      style={{ width }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Cost Estimation</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {renderStatusIndicator()}
                <span className="text-xs text-gray-500">•</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(lastUpdated)}
                </div>
              </div>
            </div>
          </div>
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Collapse panel"
            >
              <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
            </button>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {!isCalibrated || !hasAnnotations ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No Cost Data</h3>
            <p className="text-sm text-gray-600">
              {!isCalibrated
                ? 'Please calibrate the drawing to calculate costs.'
                : 'Add annotations with labels to see cost estimates.'}
            </p>
          </div>
        ) : (
          <>
            {/* Grand Total Display */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-green-50 to-white">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Grand Total</div>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  {formatCost(grandTotal)}
                </div>
                <div className="text-sm text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span>+ {markupPercent}% markup</span>
                    <span className="font-semibold">{formatCost(markupAmount)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex items-center justify-between">
                    <span className="font-semibold">Total with Markup</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCost(totalWithMarkup)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Markup Slider */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Markup / Contingency</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={markupPercent}
                    onChange={handleMarkupInputChange}
                    min="0"
                    max="50"
                    step="1"
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md text-center"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={markupPercent}
                onChange={(e) => handleMarkupChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Annotations</span>
                  <span className="font-semibold text-gray-900">{totalAnnotations}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cost Items</span>
                  <span className="font-semibold text-gray-900">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold text-gray-900">{totalCategories}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Calibrated</span>
                  <span className="font-semibold text-green-600">
                    {isCalibrated ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'categories'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Category Breakdown
                </button>
                <button
                  onClick={() => setActiveTab('items')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'items'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Items ({totalItems})
                </button>
              </div>
            </div>

            {/* Category Breakdown Tab */}
            {activeTab === 'categories' && (
              <div className="p-4 space-y-2">
                {Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => b.cost - a.cost)
                  .map(([category, totals]) => (
                    <CostCategorySection
                      key={category}
                      category={category}
                      totals={totals}
                      items={groupedCosts[category] || []}
                      isExpanded={expandedCategories.has(category)}
                      onToggle={() => toggleCategory(category)}
                      formatCost={formatCost}
                      showPercentages={settings.showPercentages}
                      showUnits={settings.showUnits}
                    />
                  ))}
              </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="p-4">
                {/* Search and Sort */}
                <div className="mb-4 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search items..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <XIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Sort by:</label>
                    <select
                      value={`${sortField}-${sortDirection}`}
                      onChange={(e) => {
                        const [field, direction] = e.target.value.split('-');
                        setSortField(field as SortField);
                        setSortDirection(direction as SortDirection);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="quantity-asc">Quantity (Low-High)</option>
                      <option value="quantity-desc">Quantity (High-Low)</option>
                      <option value="cost-asc">Cost (Low-High)</option>
                      <option value="cost-desc">Cost (High-Low)</option>
                      <option value="category-asc">Category (A-Z)</option>
                      <option value="category-desc">Category (Z-A)</option>
                    </select>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {Object.entries(groupedFilteredItems).map(([category, items]) => (
                    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedCategories.has(category) ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                          <span className="font-semibold text-sm text-gray-900">{category}</span>
                          <span className="text-xs text-gray-500">({items.length})</span>
                        </div>
                      </button>

                      {expandedCategories.has(category) && (
                        <div className="divide-y divide-gray-100">
                          {items.map(item => (
                            <div key={item.id} className="px-4 py-3 hover:bg-gray-50">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.description}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {item.quantity.toFixed(settings.decimalPlaces)}{' '}
                                    {settings.showUnits && item.unit} × {formatCost(item.unitCost)}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold text-gray-900 ml-3">
                                  {formatCost(item.totalCost)}
                                </div>
                              </div>
                              {item.notes && (
                                <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredAndSortedItems.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">No items found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      {isCalibrated && hasAnnotations && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => setShowExportPanel(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              aria-label="Export costs"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleRefresh}
              disabled={isCalculating}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              aria-label="Refresh costs"
            >
              <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowSettingsPanel(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              aria-label="Panel settings"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            {showChart && (
              <button
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                aria-label="View chart"
              >
                <BarChart3 className="w-4 h-4" />
                Chart
              </button>
            )}
          </div>
        </div>
      )}

      {/* Export Panel Modal */}
      {showExportPanel && (
        <CostExportPanel
          costItems={costItems}
          grandTotal={grandTotal}
          totalWithMarkup={totalWithMarkup}
          markupPercent={markupPercent}
          onClose={() => setShowExportPanel(false)}
          onExport={onExport}
        />
      )}

      {/* Settings Panel Modal */}
      {showSettingsPanel && (
        <CostSettingsPanel
          settings={settings}
          onClose={() => setShowSettingsPanel(false)}
          onChange={handleSettingsChange}
        />
      )}
    </div>
  );
};

export default CostEstimationPanel;
