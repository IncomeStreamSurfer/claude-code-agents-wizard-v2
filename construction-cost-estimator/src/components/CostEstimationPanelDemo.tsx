import React, { useState } from 'react';
import { CostEstimationPanel } from './CostEstimationPanel';
import { CostPrintView } from './CostPrintView';
import { useCostEstimation } from '../hooks/useCostEstimation';
import { useAppStore } from '../store/useAppStore';
import { Printer } from 'lucide-react';

/**
 * CostEstimationPanelDemo - Demo component for CostEstimationPanel
 *
 * Features:
 * - Interactive demo of the cost panel
 * - Toggle between panel and print view
 * - Example integration with store
 * - Sample data for testing
 */
export const CostEstimationPanelDemo: React.FC = () => {
  const [showPrintView, setShowPrintView] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number | string>('400px');
  const [isCompact, setIsCompact] = useState(false);

  // Get cost estimation data
  const {
    costItems,
    categoryTotals,
    grandTotal,
    totalWithMarkup,
    markupPercent,
    formatCost,
  } = useCostEstimation();

  // Handle export
  const handleExport = (format: string, data: any) => {
    console.log('Export requested:', { format, data });
  };

  // Handle settings change
  const handleSettingsChange = (settings: any) => {
    console.log('Settings changed:', settings);
  };

  // Generate sample data button
  const generateSampleData = () => {
    const store = useAppStore.getState();

    // Sample calibration
    store.computeCalibration(10, 100); // 10 meters = 100 pixels

    // Sample annotations with labels
    const sampleAnnotations = [
      {
        id: 'ann1',
        pageNumber: 1,
        type: 'marker' as const,
        x: 100,
        y: 100,
        width: 10,
        height: 10,
        color: '#3B82F6',
        labelId: 'label-window',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ann2',
        pageNumber: 1,
        type: 'line' as const,
        x: 150,
        y: 150,
        width: 200,
        height: 0,
        color: '#EF4444',
        labelId: 'label-wall',
        lineLength: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ann3',
        pageNumber: 1,
        type: 'polygon' as const,
        x: 300,
        y: 300,
        width: 100,
        height: 100,
        color: '#10B981',
        labelId: 'label-floor',
        polygonArea: 2500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleAnnotations.forEach(ann => store.addAnnotation(ann));
  };

  // Clear all data
  const clearData = () => {
    const store = useAppStore.getState();
    store.clearAnnotations();
    store.resetCalibration();
  };

  if (showPrintView) {
    return (
      <div>
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-50 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Print Preview</h1>
            <button
              onClick={() => setShowPrintView(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Panel
            </button>
          </div>
        </div>
        <div style={{ marginTop: '80px' }}>
          <CostPrintView
            costItems={costItems}
            categoryTotals={categoryTotals}
            grandTotal={grandTotal}
            totalWithMarkup={totalWithMarkup}
            markupPercent={markupPercent}
            projectName="Sample Construction Project"
            projectDescription="This is a demo project showing the print view functionality"
            formatCost={formatCost}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Cost Estimation Panel Demo
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Interactive Controls
            </h2>

            <div className="space-y-4">
              {/* Sample Data Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={generateSampleData}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Generate Sample Data
                </button>
                <button
                  onClick={clearData}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Data
                </button>
                <button
                  onClick={() => setShowPrintView(true)}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  View Print Preview
                </button>
              </div>

              {/* Panel Width Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panel Width
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPanelWidth('300px')}
                    className={`px-3 py-1.5 text-sm rounded ${
                      panelWidth === '300px'
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Compact (300px)
                  </button>
                  <button
                    onClick={() => setPanelWidth('400px')}
                    className={`px-3 py-1.5 text-sm rounded ${
                      panelWidth === '400px'
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Default (400px)
                  </button>
                  <button
                    onClick={() => setPanelWidth('500px')}
                    className={`px-3 py-1.5 text-sm rounded ${
                      panelWidth === '500px'
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Wide (500px)
                  </button>
                </div>
              </div>

              {/* Compact Mode Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompact}
                    onChange={(e) => setIsCompact(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Compact Mode
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Real-time cost calculations with markup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Category breakdown with percentages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Interactive markup slider (0-50%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Search and sort capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Export to JSON, CSV, and Print</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Customizable settings panel</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="text-lg font-bold text-gray-900">{costItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categories</span>
                  <span className="text-lg font-bold text-gray-900">
                    {Object.keys(categoryTotals).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Grand Total</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCost(grandTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">With Markup</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCost(totalWithMarkup)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              How to Use
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Click "Generate Sample Data" to populate the panel with example data</li>
              <li>Adjust the markup slider to see real-time cost updates</li>
              <li>Switch between "Category Breakdown" and "Items" tabs</li>
              <li>Use the search bar in the Items tab to filter results</li>
              <li>Click "Export" to download cost data in various formats</li>
              <li>Click "Settings" to customize panel display options</li>
              <li>Click "View Print Preview" to see the print-ready format</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Cost Estimation Panel */}
      <CostEstimationPanel
        width={panelWidth}
        collapsible={true}
        showChart={true}
        compact={isCompact}
        onExport={handleExport}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

export default CostEstimationPanelDemo;
