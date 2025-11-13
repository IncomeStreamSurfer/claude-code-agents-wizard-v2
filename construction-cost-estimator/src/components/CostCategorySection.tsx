import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CostItem } from '../types';
import type { CategoryTotals } from '../utils/costCalculations';

/**
 * Props for CostCategorySection component
 */
export interface CostCategorySectionProps {
  category: string;
  totals: CategoryTotals;
  items: CostItem[];
  isExpanded: boolean;
  onToggle: () => void;
  formatCost: (amount: number) => string;
  showPercentages?: boolean;
  showUnits?: boolean;
}

/**
 * Color mapping for categories
 */
const CATEGORY_COLORS: Record<string, string> = {
  'Openings': 'bg-blue-500',
  'Structure': 'bg-green-500',
  'Surfaces': 'bg-yellow-500',
  'MEP': 'bg-red-500',
  'Finishes': 'bg-purple-500',
  'Foundations': 'bg-gray-500',
  'Roofing': 'bg-orange-500',
  'Windows': 'bg-cyan-500',
  'Doors': 'bg-indigo-500',
  'Uncategorized': 'bg-gray-400',
};

/**
 * CostCategorySection - Collapsible category section with items
 *
 * Features:
 * - Category header with total cost and percentage
 * - Progress bar showing percentage of total
 * - Expandable to show individual items
 * - Color-coded by category
 * - Item count indicator
 */
export const CostCategorySection: React.FC<CostCategorySectionProps> = ({
  category,
  totals,
  items,
  isExpanded,
  onToggle,
  formatCost,
  showPercentages = true,
  showUnits = true,
}) => {
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS['Uncategorized'];
  const percentage = totals.percentage || 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Expand/Collapse Icon */}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}

            {/* Category Color Indicator */}
            <div className={`w-3 h-3 rounded-full ${colorClass}`} />

            {/* Category Name */}
            <div className="text-left">
              <div className="font-semibold text-gray-900">{category}</div>
              <div className="text-xs text-gray-500">
                {totals.count} {totals.count === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          {/* Cost and Percentage */}
          <div className="text-right">
            <div className="font-bold text-gray-900">{formatCost(totals.cost)}</div>
            {showPercentages && (
              <div className="text-xs text-gray-600">{percentage.toFixed(1)}%</div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showPercentages && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
      </button>

      {/* Expanded Items List */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Item Description */}
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {item.description}
                    </div>

                    {/* Item Details */}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div>
                        {item.quantity.toFixed(2)}
                        {showUnits && ` ${item.unit}`}
                      </div>
                      <span>×</span>
                      <div>{formatCost(item.unitCost)}</div>
                      {item.pageNumber && (
                        <>
                          <span>•</span>
                          <div>Page {item.pageNumber}</div>
                        </>
                      )}
                    </div>

                    {/* Item Notes */}
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        {item.notes}
                      </div>
                    )}
                  </div>

                  {/* Item Total Cost */}
                  <div className="ml-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatCost(item.totalCost)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category Subtotal */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                {category} Subtotal
              </span>
              <span className="font-bold text-gray-900">
                {formatCost(totals.cost)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCategorySection;
