/**
 * Cost Estimation Quick Start Guide
 *
 * A simple example showing how to get started with cost estimation
 */

import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CostSummary, CostBreakdown, CostChart } from '../components';

/**
 * Quick Start Example
 *
 * This component demonstrates the complete workflow:
 * 1. Set up calibration
 * 2. Add some sample annotations with labels
 * 3. Display cost estimation results
 */
export function CostEstimationQuickStart() {
  const [isSetup, setIsSetup] = React.useState(false);

  // Get store actions
  const computeCalibration = useAppStore((state) => state.computeCalibration);
  const addAnnotation = useAppStore((state) => state.addAnnotation);
  const labels = useAppStore((state) => state.labels);

  // Setup sample data
  const setupSampleData = () => {
    // 1. Calibrate: 10 meters = 100 pixels
    computeCalibration(10, 100);

    // 2. Find some labels
    const windowLabel = labels.find(l => l.name === 'Windows');
    const wallLabel = labels.find(l => l.name === 'Walls');
    const floorLabel = labels.find(l => l.name === 'Floors');

    if (!windowLabel || !wallLabel || !floorLabel) {
      console.error('Required labels not found');
      return;
    }

    // 3. Add sample annotations

    // Add 3 windows (markers)
    for (let i = 0; i < 3; i++) {
      addAnnotation({
        id: `window-${i}`,
        pageNumber: 1,
        type: 'marker',
        x: 100 + i * 50,
        y: 100,
        width: 10,
        height: 10,
        color: windowLabel.color,
        labelId: windowLabel.id,
        text: `Window ${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Add 2 walls (lines)
    addAnnotation({
      id: 'wall-1',
      pageNumber: 1,
      type: 'line',
      x: 50,
      y: 50,
      width: 0,
      height: 0,
      color: wallLabel.color,
      labelId: wallLabel.id,
      lineLength: 500, // 500 pixels = 50 meters
      points: [
        { x: 50, y: 50 },
        { x: 550, y: 50 },
      ],
      text: 'North Wall',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    addAnnotation({
      id: 'wall-2',
      pageNumber: 1,
      type: 'line',
      x: 50,
      y: 50,
      width: 0,
      height: 0,
      color: wallLabel.color,
      labelId: wallLabel.id,
      lineLength: 300, // 300 pixels = 30 meters
      points: [
        { x: 50, y: 50 },
        { x: 50, y: 350 },
      ],
      text: 'West Wall',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add 1 floor (polygon/area)
    addAnnotation({
      id: 'floor-1',
      pageNumber: 1,
      type: 'polygon',
      x: 100,
      y: 100,
      width: 0,
      height: 0,
      color: floorLabel.color,
      labelId: floorLabel.id,
      polygonArea: 150000, // 150,000 px² = 1,500 m² (with 0.1 m/px scaling)
      points: [
        { x: 100, y: 100 },
        { x: 500, y: 100 },
        { x: 500, y: 450 },
        { x: 100, y: 450 },
      ],
      text: 'Main Floor',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setIsSetup(true);
  };

  // Auto-setup on mount (optional)
  useEffect(() => {
    if (!isSetup && labels.length > 0) {
      // Uncomment to auto-setup:
      // setupSampleData();
    }
  }, [labels, isSetup]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-2">
            Cost Estimation Quick Start
          </h1>
          <p className="text-gray-600 mb-4">
            Follow these steps to start calculating costs from your annotations
          </p>

          {!isSetup && (
            <button
              onClick={setupSampleData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Load Sample Data
            </button>
          )}

          {isSetup && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ Sample data loaded! Scroll down to see the cost estimates.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Calibrate Your Drawing</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Set a known reference length (e.g., 10 meters) and measure it in pixels.
                  This allows the system to convert pixel measurements to real-world units.
                </p>
                <pre className="mt-2 bg-gray-50 rounded p-2 text-xs">
{`const { computeCalibration } = useAppStore();
computeCalibration(10, 100); // 10 meters = 100 pixels`}
                </pre>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Add Annotations with Labels</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Draw markers, lines, or polygons on your PDF and assign labels.
                  Labels define what each annotation represents and its cost per unit.
                </p>
                <pre className="mt-2 bg-gray-50 rounded p-2 text-xs">
{`const { addAnnotation } = useAppStore();
addAnnotation({
  type: 'marker',
  labelId: windowLabel.id, // Links to label with cost info
  // ... other properties
});`}
                </pre>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Display Cost Components</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Use the pre-built components to display cost information.
                  Costs are calculated automatically in real-time.
                </p>
                <pre className="mt-2 bg-gray-50 rounded p-2 text-xs">
{`import { CostSummary, CostBreakdown, CostChart } from './components';

<CostSummary />    {/* Overview with markup controls */}
<CostBreakdown />  {/* Detailed table */}
<CostChart />      {/* Visual charts */}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Components */}
        {isSetup && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cost Summary</h2>
              <CostSummary />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
              <CostBreakdown />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cost Chart</h2>
              <CostChart />
            </div>
          </>
        )}

        {/* Code Example */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Complete Example Code</h2>

          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
{`import { useAppStore } from './store/useAppStore';
import { CostSummary, CostBreakdown, CostChart } from './components';

function MyApp() {
  const computeCalibration = useAppStore(state => state.computeCalibration);
  const addAnnotation = useAppStore(state => state.addAnnotation);
  const labels = useAppStore(state => state.labels);

  const setupProject = () => {
    // 1. Calibrate
    computeCalibration(10, 100); // 10m = 100px

    // 2. Find labels
    const windowLabel = labels.find(l => l.name === 'Windows');

    // 3. Add annotation
    addAnnotation({
      id: 'window-1',
      pageNumber: 1,
      type: 'marker',
      x: 100,
      y: 100,
      width: 10,
      height: 10,
      color: windowLabel.color,
      labelId: windowLabel.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <div>
      <button onClick={setupProject}>Setup</button>
      <CostSummary />
      <CostBreakdown />
      <CostChart />
    </div>
  );
}`}
          </pre>
        </div>

        {/* Cost Formulas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cost Calculation Formulas</h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold">Markers (Count):</h3>
              <pre className="bg-gray-50 rounded p-2 mt-1">
                quantity = 1
                cost = 1 × costPerUnit
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">Lines (Length):</h3>
              <pre className="bg-gray-50 rounded p-2 mt-1">
                length_meters = lineLength_pixels × metersPerPixel
                cost = length_meters × costPerUnit
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">Polygons (Area):</h3>
              <pre className="bg-gray-50 rounded p-2 mt-1">
                area_m² = polygonArea_pixels × (metersPerPixel)²
                cost = area_m² × costPerUnit
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">With Markup:</h3>
              <pre className="bg-gray-50 rounded p-2 mt-1">
                finalCost = baseCost × (1 + markupPercent / 100)
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostEstimationQuickStart;
