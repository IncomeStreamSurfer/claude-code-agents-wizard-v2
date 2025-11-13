import React, { useState } from 'react';
import { CostSummary } from './CostSummary';
import { CostBreakdown } from './CostBreakdown';
import { CostChart } from './CostChart';
import { useCostEstimation } from '../hooks/useCostEstimation';
import {
  DollarSign,
  List,
  BarChart,
  Info,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

type TabType = 'summary' | 'breakdown' | 'chart';

/**
 * CostEstimationDemo Component
 *
 * Comprehensive demo of all cost estimation features:
 * - Tabbed interface for different views
 * - Status indicators
 * - Quick statistics
 * - Integration examples
 */
export const CostEstimationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const {
    grandTotal,
    totalWithMarkup,
    markupPercent,
    totalItems,
    totalAnnotations,
    totalCategories,
    isCalibrated,
    hasAnnotations,
    hasLabels,
    formatCost,
  } = useCostEstimation();

  // Tab configuration
  const tabs = [
    {
      id: 'summary' as TabType,
      name: 'Summary',
      icon: DollarSign,
      description: 'Quick cost overview',
    },
    {
      id: 'breakdown' as TabType,
      name: 'Breakdown',
      icon: List,
      description: 'Detailed cost table',
    },
    {
      id: 'chart' as TabType,
      name: 'Chart',
      icon: BarChart,
      description: 'Visual representation',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cost Estimation Engine
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive cost calculation and analysis from PDF annotations
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {isCalibrated ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Calibration</p>
                <p className="text-xs text-gray-500">
                  {isCalibrated ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasAnnotations ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Annotations</p>
                <p className="text-xs text-gray-500">
                  {totalAnnotations} {totalAnnotations === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasLabels ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Labels</p>
                <p className="text-xs text-gray-500">
                  {totalItems} cost {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {isCalibrated && hasAnnotations && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-600">Base Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCost(grandTotal)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-600">With Markup</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCost(totalWithMarkup)}
              </p>
              {markupPercent > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  +{markupPercent}% markup
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalCategories}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-600">Cost Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalItems}
              </p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                How Cost Estimation Works
              </p>
              <p className="text-sm text-blue-700 mt-1">
                1. Calibrate your drawing to convert pixel measurements to real units
                <br />
                2. Add annotations (markers, lines, polygons) and assign labels
                <br />
                3. Labels define cost per unit (doors, walls, floors, etc.)
                <br />
                4. Costs are calculated automatically: quantity × unit cost
                <br />
                5. Add markup/contingency for final project estimate
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-semibold">{tab.name}</p>
                      <p className="text-xs">{tab.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'summary' && <CostSummary />}
            {activeTab === 'breakdown' && <CostBreakdown />}
            {activeTab === 'chart' && <CostChart />}
          </div>
        </div>

        {/* Integration Guide */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Integration Guide
          </h3>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 mb-2">
                Using Individual Components:
              </p>
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs">
{`import { CostSummary } from './components/CostSummary';
import { CostBreakdown } from './components/CostBreakdown';
import { CostChart } from './components/CostChart';

function MyApp() {
  return (
    <div>
      <CostSummary />
      <CostBreakdown />
      <CostChart />
    </div>
  );
}`}
              </pre>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2">
                Using the Hook Directly:
              </p>
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs">
{`import { useCostEstimation } from './hooks/useCostEstimation';

function MyComponent() {
  const {
    grandTotal,
    costItems,
    categoryTotals,
    setMarkup,
    formatCost,
  } = useCostEstimation();

  return (
    <div>
      <h2>Total: {formatCost(grandTotal)}</h2>
      {/* Your custom UI */}
    </div>
  );
}`}
              </pre>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2">
                Core Calculation Functions:
              </p>
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs">
{`import {
  calculateAnnotationQuantity,
  calculateAnnotationCost,
  aggregateAnnotationsToCosts,
  calculateWithMarkup,
  formatCurrency,
} from './utils/costCalculations';

// Calculate quantity for a single annotation
const { quantity, unit } = calculateAnnotationQuantity(
  annotation,
  calibrationData
);

// Calculate cost for annotation with label
const cost = calculateAnnotationCost(
  annotation,
  calibrationData,
  label
);

// Aggregate all annotations
const costItems = aggregateAnnotationsToCosts(
  annotations,
  calibrationData,
  labels
);`}
              </pre>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Real-time Calculation</p>
                <p className="text-gray-600 text-xs mt-1">
                  Costs update automatically when annotations change
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Markup/Contingency</p>
                <p className="text-gray-600 text-xs mt-1">
                  Add percentage markup for final estimates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Category Grouping</p>
                <p className="text-gray-600 text-xs mt-1">
                  Organize costs by category with subtotals
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Export Options</p>
                <p className="text-gray-600 text-xs mt-1">
                  Export to JSON or CSV format
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Visual Charts</p>
                <p className="text-gray-600 text-xs mt-1">
                  Pie and bar charts for cost visualization
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Filtering & Search</p>
                <p className="text-gray-600 text-xs mt-1">
                  Find specific items quickly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimationDemo;
