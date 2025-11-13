/**
 * Cost Estimation Engine - Usage Examples
 *
 * This file demonstrates various ways to use the cost estimation features
 * in your application.
 */

import React from 'react';
import {
  CostSummary,
  CostBreakdown,
  CostChart,
  CostEstimationDemo,
} from '../components';
import { useCostEstimation, useCostFilters } from '../hooks/useCostEstimation';
import {
  calculateAnnotationQuantity,
  calculateAnnotationCost,
  calculateWithMarkup,
  formatCurrency,
} from '../utils/costCalculations';

// ============================================================================
// Example 1: Using Pre-built Components
// ============================================================================

export function Example1_PrebuiltComponents() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Using Pre-built Components</h2>

      {/* Cost Summary - Quick overview */}
      <CostSummary />

      {/* Cost Breakdown - Detailed table */}
      <CostBreakdown />

      {/* Cost Chart - Visual representation */}
      <CostChart />
    </div>
  );
}

// ============================================================================
// Example 2: Using the Hook - Custom UI
// ============================================================================

export function Example2_CustomUI() {
  const {
    grandTotal,
    totalWithMarkup,
    markupPercent,
    setMarkup,
    categoryTotals,
    formatCost,
    downloadCosts,
  } = useCostEstimation();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Custom Cost Display</h2>

      {/* Simple Total Display */}
      <div className="mb-6">
        <p className="text-4xl font-bold text-blue-600">
          {formatCost(grandTotal)}
        </p>
        <p className="text-gray-600">Base Total</p>
      </div>

      {/* Markup Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Markup: {markupPercent}%
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={markupPercent}
          onChange={(e) => setMarkup(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Final Total */}
      <div className="mb-6">
        <p className="text-2xl font-bold">
          {formatCost(totalWithMarkup)}
        </p>
        <p className="text-gray-600">Final Total with Markup</p>
      </div>

      {/* Category Summary */}
      <div className="space-y-2">
        <h3 className="font-semibold">By Category:</h3>
        {Object.entries(categoryTotals).map(([category, totals]) => (
          <div key={category} className="flex justify-between">
            <span>{category}</span>
            <span className="font-medium">{formatCost(totals.cost)}</span>
          </div>
        ))}
      </div>

      {/* Export Buttons */}
      <div className="mt-6 space-x-2">
        <button
          onClick={() => downloadCosts('json')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Export JSON
        </button>
        <button
          onClick={() => downloadCosts('csv')}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Example 3: Filtering Cost Items
// ============================================================================

export function Example3_Filtering() {
  const { costItems, formatCost } = useCostEstimation();
  const {
    filteredItems,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    clearFilters,
    hasFilters,
  } = useCostFilters(costItems);

  // Get unique categories
  const categories = Array.from(
    new Set(costItems.map(item => item.category).filter(Boolean))
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Filtered Cost List</h2>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search items..."
          className="w-full px-4 py-2 border rounded"
        />

        {/* Category Filter */}
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Showing {filteredItems.length} of {costItems.length} items
        </p>

        {filteredItems.map(item => (
          <div
            key={item.id}
            className="p-3 border rounded hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} {item.unit} × {formatCost(item.unitCost)}
                </p>
              </div>
              <p className="font-bold">{formatCost(item.totalCost)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Example 4: Direct Calculation Functions
// ============================================================================

export function Example4_DirectCalculations() {
  const [results, setResults] = React.useState<string[]>([]);

  const runExamples = () => {
    const newResults: string[] = [];

    // Example calibration
    const calibration = {
      referenceLength: 10,
      pixelDistance: 100,
      metersPerPixel: 0.1,
      isCalibrated: true,
    };

    // Example 1: Calculate quantity for a marker
    const marker = {
      id: '1',
      type: 'marker' as const,
      pageNumber: 1,
      x: 100,
      y: 100,
      width: 10,
      height: 10,
      color: '#FF0000',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const markerQty = calculateAnnotationQuantity(marker, calibration);
    newResults.push(
      `Marker: ${markerQty.quantity} ${markerQty.unit}`
    );

    // Example 2: Calculate quantity for a line
    const line = {
      ...marker,
      type: 'line' as const,
      lineLength: 500, // pixels
    };

    const lineQty = calculateAnnotationQuantity(line, calibration);
    newResults.push(
      `Line: ${lineQty.quantity} ${lineQty.unit} (${lineQty.rawValue}px)`
    );

    // Example 3: Calculate quantity for a polygon
    const polygon = {
      ...marker,
      type: 'polygon' as const,
      polygonArea: 10000, // square pixels
    };

    const polygonQty = calculateAnnotationQuantity(polygon, calibration);
    newResults.push(
      `Polygon: ${polygonQty.quantity.toFixed(2)} ${polygonQty.unit} (${polygonQty.rawValue}px²)`
    );

    // Example 4: Calculate cost with label
    const label = {
      id: 'label-1',
      name: 'Windows',
      color: '#3B82F6',
      unit: 'count' as const,
      costPerUnit: 500,
      category: 'Openings',
      createdAt: new Date(),
    };

    const annotationWithLabel = {
      ...marker,
      labelId: label.id,
    };

    const cost = calculateAnnotationCost(
      annotationWithLabel,
      calibration,
      label
    );

    if (cost) {
      newResults.push(
        `Cost: ${cost.description} - ${cost.quantity} ${cost.unit} @ ${formatCurrency(cost.unitCost)} = ${formatCurrency(cost.totalCost)}`
      );
    }

    // Example 5: Calculate with markup
    const baseCost = 25000;
    const withMarkup = calculateWithMarkup(baseCost, 15);
    newResults.push(
      `Markup: ${formatCurrency(baseCost)} + 15% = ${formatCurrency(withMarkup)}`
    );

    setResults(newResults);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Direct Calculations</h2>

      <button
        onClick={runExamples}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Run Example Calculations
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Results:</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 rounded font-mono text-sm"
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Advanced Features
// ============================================================================

export function Example5_AdvancedFeatures() {
  const {
    costItems,
    getCostsByCategory,
    getMostExpensiveItems,
    getCostPerPage,
    formatCost,
  } = useCostEstimation();

  const mostExpensive = getMostExpensiveItems(3);
  const costPerPage = getCostPerPage();

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold">Advanced Features</h2>

      {/* Most Expensive Items */}
      <div>
        <h3 className="font-semibold mb-3">Top 3 Most Expensive Items:</h3>
        <div className="space-y-2">
          {mostExpensive.map((item, index) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-400">
                  #{index + 1}
                </span>
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-blue-600">
                {formatCost(item.totalCost)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Per Page */}
      <div>
        <h3 className="font-semibold mb-3">Cost Per Page:</h3>
        <div className="space-y-2">
          {Object.entries(costPerPage).map(([page, cost]) => (
            <div
              key={page}
              className="flex justify-between p-2 border-b"
            >
              <span>Page {page}</span>
              <span className="font-medium">{formatCost(cost)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="font-semibold mb-3">Items by Category:</h3>
        <div className="space-y-4">
          {Array.from(new Set(costItems.map(item => item.category))).map(category => {
            if (!category) return null;
            const items = getCostsByCategory(category);

            return (
              <div key={category} className="border rounded p-3">
                <p className="font-medium mb-2">
                  {category} ({items.length} items)
                </p>
                <div className="space-y-1 text-sm">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between text-gray-600"
                    >
                      <span>{item.description}</span>
                      <span>{formatCost(item.totalCost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 6: Complete Demo
// ============================================================================

export function Example6_CompleteDemo() {
  return <CostEstimationDemo />;
}

// ============================================================================
// All Examples Collection
// ============================================================================

export function AllCostEstimationExamples() {
  const [activeExample, setActiveExample] = React.useState(1);

  const examples = [
    { id: 1, title: 'Pre-built Components', component: Example1_PrebuiltComponents },
    { id: 2, title: 'Custom UI with Hook', component: Example2_CustomUI },
    { id: 3, title: 'Filtering', component: Example3_Filtering },
    { id: 4, title: 'Direct Calculations', component: Example4_DirectCalculations },
    { id: 5, title: 'Advanced Features', component: Example5_AdvancedFeatures },
    { id: 6, title: 'Complete Demo', component: Example6_CompleteDemo },
  ];

  const ActiveComponent = examples.find(ex => ex.id === activeExample)?.component;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-2">
            Cost Estimation Examples
          </h1>
          <p className="text-gray-600">
            Explore different ways to use the cost estimation engine
          </p>
        </div>

        {/* Example Selector */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            {examples.map(ex => (
              <button
                key={ex.id}
                onClick={() => setActiveExample(ex.id)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeExample === ex.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ex.id}. {ex.title}
              </button>
            ))}
          </div>
        </div>

        {/* Active Example */}
        <div>
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}

export default AllCostEstimationExamples;
