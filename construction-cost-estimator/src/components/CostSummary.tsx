import React from 'react';
import { useCostEstimation } from '../hooks/useCostEstimation';
import { DollarSign, TrendingUp, Package, AlertCircle } from 'lucide-react';

/**
 * CostSummary Component
 *
 * Displays a quick overview of cost estimation:
 * - Total cost (large, prominent)
 * - Markup controls
 * - Cost breakdown by category (cards)
 * - Real-time updates
 */
export const CostSummary: React.FC = () => {
  const {
    grandTotal,
    markupPercent,
    totalWithMarkup,
    markupAmount,
    setMarkup,
    categoryTotals,
    totalItems,
    totalAnnotations,
    isCalibrated,
    hasAnnotations,
    formatCost,
  } = useCostEstimation();

  // Handle markup input change
  const handleMarkupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setMarkup(value);
  };

  // Warning if not calibrated
  if (!isCalibrated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-yellow-800">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Calibration Required</h3>
            <p className="text-sm mt-1">
              Please calibrate the drawing to calculate costs in real-world units.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No annotations message
  if (!hasAnnotations) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-gray-600">
          <Package className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">No Annotations Yet</h3>
            <p className="text-sm mt-1">
              Add annotations to the drawing to start calculating costs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort categories by cost (descending)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b.cost - a.cost);

  return (
    <div className="space-y-6">
      {/* Main Total Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Base Total</p>
            <p className="text-4xl font-bold mt-2">
              {formatCost(grandTotal)}
            </p>
            <p className="text-blue-100 text-sm mt-2">
              {totalItems} items from {totalAnnotations} annotations
            </p>
          </div>
          <div className="bg-blue-500/30 p-3 rounded-lg">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>

        {/* Markup Section */}
        <div className="mt-6 pt-6 border-t border-blue-400/30">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-blue-100">
              Markup / Contingency
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={markupPercent}
                onChange={handleMarkupChange}
                className="w-20 px-3 py-1 rounded-md text-gray-900 text-sm font-medium text-right"
              />
              <span className="text-blue-100 text-sm">%</span>
            </div>
          </div>

          {/* Markup Slider */}
          <input
            type="range"
            min="0"
            max="50"
            step="0.5"
            value={markupPercent}
            onChange={handleMarkupChange}
            className="w-full h-2 bg-blue-400/30 rounded-lg appearance-none cursor-pointer"
          />

          {/* Total with Markup */}
          {markupPercent > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-400/30">
              <div className="flex items-center justify-between">
                <span className="text-blue-100 text-sm">Markup Amount:</span>
                <span className="text-white font-semibold">
                  {formatCost(markupAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-blue-100 font-medium">Final Total:</span>
                <span className="text-white text-2xl font-bold">
                  {formatCost(totalWithMarkup)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Cost by Category
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedCategories.map(([category, totals]) => (
            <div
              key={category}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{category}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {totals.count} {totals.count === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCost(totals.cost)}
                  </p>
                  {totals.percentage !== undefined && (
                    <p className="text-sm text-gray-500 mt-1">
                      {totals.percentage.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${totals.percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No categories message */}
        {sortedCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No cost items available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSummary;
