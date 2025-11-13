/**
 * Usage Examples for the Construction Cost Estimator Store
 *
 * This file demonstrates common usage patterns and integration examples
 * for the Zustand store. Copy and adapt these patterns to your components.
 */

import { useAppStore, useCurrentPageAnnotations, useIsCalibrated } from './useAppStore';
import type { AnnotationData } from '../types/store';
import { generateAnnotationId } from './storeHelpers';

// ============================================================================
// EXAMPLE 1: Basic Store Usage
// ============================================================================

/**
 * Example: Simple component that displays and updates zoom level
 */
export function ZoomControls() {
  // Select only the state you need (optimizes re-renders)
  const currentZoom = useAppStore(state => state.currentZoom);
  const setZoom = useAppStore(state => state.setZoom);

  const handleZoomIn = () => setZoom(currentZoom + 0.1);
  const handleZoomOut = () => setZoom(currentZoom - 0.1);
  const handleResetZoom = () => setZoom(1.0);

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleZoomOut}>-</button>
      <span>{Math.round(currentZoom * 100)}%</span>
      <button onClick={handleZoomIn}>+</button>
      <button onClick={handleResetZoom}>Reset</button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Calibration Workflow
// ============================================================================

/**
 * Example: Calibration component that guides user through calibration
 */
export function CalibrationWizard() {
  const calibrationData = useAppStore(state => state.calibrationData);
  const computeCalibration = useAppStore(state => state.computeCalibration);
  const resetCalibration = useAppStore(state => state.resetCalibration);

  const [referenceLength, setReferenceLength] = useState(3.6);
  const [pixelDistance, setPixelDistance] = useState(120);

  const handleCalibrate = () => {
    computeCalibration(referenceLength, pixelDistance);
  };

  return (
    <div className="calibration-wizard">
      <h2>Drawing Calibration</h2>

      {!calibrationData.isCalibrated ? (
        <div>
          <p>Measure a known distance on the drawing to calibrate.</p>

          <label>
            Reference Length (meters):
            <input
              type="number"
              value={referenceLength}
              onChange={(e) => setReferenceLength(parseFloat(e.target.value))}
              step="0.1"
            />
          </label>

          <label>
            Pixel Distance:
            <input
              type="number"
              value={pixelDistance}
              onChange={(e) => setPixelDistance(parseFloat(e.target.value))}
            />
          </label>

          <button onClick={handleCalibrate}>Calibrate</button>
        </div>
      ) : (
        <div>
          <p>✓ Calibrated</p>
          <p>1 pixel = {calibrationData.metersPerPixel.toFixed(4)} meters</p>
          <button onClick={resetCalibration}>Reset Calibration</button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Adding Annotations
// ============================================================================

/**
 * Example: Add a window annotation at a specific location
 */
export function addWindowAnnotation(x: number, y: number) {
  const store = useAppStore.getState();

  const annotation: AnnotationData = {
    id: generateAnnotationId(),
    pageNumber: store.currentPageNumber,
    type: 'rectangle',
    x: x,
    y: y,
    width: 40,
    height: 60,
    color: '#3B82F6', // Blue color for windows
    labelId: 'label-windows',
    unit: 'count',
    quantity: 1,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.addAnnotation(annotation);
}

/**
 * Example: Add a wall annotation (line measurement)
 */
export function addWallAnnotation(points: { x: number; y: number }[]) {
  const store = useAppStore.getState();

  // Calculate line length from points
  let lineLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    lineLength += Math.sqrt(dx * dx + dy * dy);
  }

  const annotation: AnnotationData = {
    id: generateAnnotationId(),
    pageNumber: store.currentPageNumber,
    type: 'arrow',
    x: points[0].x,
    y: points[0].y,
    width: 0,
    height: 0,
    color: '#10B981', // Green color for walls
    labelId: 'label-walls',
    unit: 'linear_meters',
    lineLength: lineLength,
    points: points,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.addAnnotation(annotation);
}

// ============================================================================
// EXAMPLE 4: Displaying Annotations
// ============================================================================

/**
 * Example: Component that displays all annotations for the current page
 */
export function AnnotationList() {
  const annotations = useCurrentPageAnnotations();
  const selectedId = useAppStore(state => state.selectedAnnotationId);
  const selectAnnotation = useAppStore(state => state.selectAnnotation);
  const deleteAnnotation = useAppStore(state => state.deleteAnnotation);

  return (
    <div className="annotation-list">
      <h3>Annotations ({annotations.length})</h3>

      {annotations.length === 0 ? (
        <p>No annotations on this page.</p>
      ) : (
        <ul>
          {annotations.map((annotation) => (
            <li
              key={annotation.id}
              className={selectedId === annotation.id ? 'selected' : ''}
              onClick={() => selectAnnotation(annotation.id)}
            >
              <div>
                <strong>{annotation.type}</strong>
                {annotation.labelId && <span> - Label: {annotation.labelId}</span>}
              </div>
              <div>
                Position: ({annotation.x}, {annotation.y})
              </div>
              <button onClick={(e) => {
                e.stopPropagation();
                deleteAnnotation(annotation.id);
              }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Label Management
// ============================================================================

/**
 * Example: Label selector component
 */
export function LabelSelector() {
  const labels = useAppStore(state => state.labels);
  const selectedLabelId = useAppStore(state => state.selectedLabelId);
  const selectLabel = useAppStore(state => state.selectLabel);

  return (
    <div className="label-selector">
      <h3>Labels</h3>

      <div className="label-grid">
        {labels.map((label) => (
          <button
            key={label.id}
            className={selectedLabelId === label.id ? 'selected' : ''}
            style={{ borderColor: label.color }}
            onClick={() => selectLabel(label.id)}
          >
            <span style={{ color: label.color }}>{label.icon}</span>
            <span>{label.name}</span>
            <span>${label.costPerUnit}/{label.unit}</span>
          </button>
        ))}
      </div>

      <button onClick={() => selectLabel(null)}>
        Deselect
      </button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Cost Summary
// ============================================================================

/**
 * Example: Cost summary component with category breakdown
 */
export function CostSummary() {
  const costItems = useAppStore(state => state.costItems);
  const getTotalCost = useAppStore(state => state.getTotalCost);
  const getCostByCategory = useAppStore(state => state.getCostByCategory);
  const isCalibrated = useIsCalibrated();

  if (!isCalibrated) {
    return (
      <div className="cost-summary">
        <p>⚠️ Calibrate the drawing to calculate costs</p>
      </div>
    );
  }

  const totalCost = getTotalCost();
  const categoryTotals = getCostByCategory();

  return (
    <div className="cost-summary">
      <h2>Cost Summary</h2>

      <div className="cost-items">
        <h3>Line Items</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Unit Cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {costItems.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity.toFixed(2)}</td>
                <td>{item.unit}</td>
                <td>${item.unitCost.toFixed(2)}</td>
                <td>${item.totalCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="category-totals">
        <h3>By Category</h3>
        {Object.entries(categoryTotals).map(([category, cost]) => (
          <div key={category} className="category-row">
            <span>{category}</span>
            <span>${cost.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="total-cost">
        <h3>Total Project Cost</h3>
        <div className="cost-value">${totalCost.toFixed(2)}</div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Tool Selector
// ============================================================================

/**
 * Example: Drawing tool selector component
 */
export function ToolSelector() {
  const activeTool = useAppStore(state => state.activeTool);
  const setActiveTool = useAppStore(state => state.setActiveTool);

  const tools = [
    { id: 'select', label: 'Select', icon: '↖️' },
    { id: 'marker', label: 'Marker', icon: '📍' },
    { id: 'line', label: 'Line', icon: '📏' },
    { id: 'polygon', label: 'Polygon', icon: '⬡' },
    { id: 'calibrate', label: 'Calibrate', icon: '⚙️' },
  ];

  return (
    <div className="tool-selector">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={activeTool === tool.id ? 'active' : ''}
          onClick={() => setActiveTool(tool.id as any)}
          title={tool.label}
        >
          <span>{tool.icon}</span>
          <span>{tool.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Page Navigation
// ============================================================================

/**
 * Example: PDF page navigation component
 */
export function PageNavigation({ totalPages }: { totalPages: number }) {
  const currentPage = useAppStore(state => state.currentPageNumber);
  const setCurrentPage = useAppStore(state => state.setCurrentPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="page-navigation">
      <button onClick={handlePrevious} disabled={currentPage === 1}>
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button onClick={handleNext} disabled={currentPage === totalPages}>
        Next
      </button>

      <input
        type="number"
        min={1}
        max={totalPages}
        value={currentPage}
        onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 9: Persistent State Demo
// ============================================================================

/**
 * Example: Component that demonstrates state persistence
 */
export function PersistenceDemo() {
  const currentProjectId = useAppStore(state => state.currentProjectId);
  const annotations = useAppStore(state => state.annotations);
  const calibrationData = useAppStore(state => state.calibrationData);
  const resetState = useAppStore(state => state.resetState);

  const totalAnnotations = Object.values(annotations).reduce(
    (sum, pageAnnotations) => sum + pageAnnotations.length,
    0
  );

  return (
    <div className="persistence-demo">
      <h3>State Persistence</h3>

      <div>
        <p>Project ID: {currentProjectId || 'None'}</p>
        <p>Total Annotations: {totalAnnotations}</p>
        <p>Calibrated: {calibrationData.isCalibrated ? 'Yes' : 'No'}</p>
      </div>

      <div>
        <p>
          Your work is automatically saved to localStorage.
          Refresh the page to see it persist!
        </p>
      </div>

      <button onClick={resetState}>
        Clear All Data
      </button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 10: Direct Store Access (Outside React)
// ============================================================================

/**
 * Example: Export annotations to JSON (can be called from anywhere)
 */
export function exportAnnotationsToJSON(): string {
  const state = useAppStore.getState();

  const exportData = {
    projectId: state.currentProjectId,
    calibration: state.calibrationData,
    annotations: state.annotations,
    labels: state.labels,
    costItems: state.costItems,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Example: Import annotations from JSON
 */
export function importAnnotationsFromJSON(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString);
    const store = useAppStore.getState();

    // Restore state
    store.setCurrentProjectId(data.projectId);
    store.setCalibrationData(data.calibration);

    // Clear existing annotations
    store.clearAnnotations();

    // Add imported annotations
    Object.values(data.annotations).forEach((annotations) => {
      (annotations as AnnotationData[]).forEach(annotation => {
        store.addAnnotation(annotation);
      });
    });

    console.log('Import successful!');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// ============================================================================
// EXAMPLE 11: Custom Hook for Filtered Data
// ============================================================================

/**
 * Example: Custom hook to get annotations by label
 */
export function useAnnotationsByLabel(labelId: string) {
  return useAppStore((state) => {
    const allAnnotations: AnnotationData[] = [];

    Object.values(state.annotations).forEach(pageAnnotations => {
      allAnnotations.push(
        ...pageAnnotations.filter(a => a.labelId === labelId)
      );
    });

    return allAnnotations;
  });
}

/**
 * Example: Component using custom hook
 */
export function WindowCounter() {
  const windowAnnotations = useAnnotationsByLabel('label-windows');

  return (
    <div>
      <h3>Total Windows: {windowAnnotations.length}</h3>
    </div>
  );
}

// ============================================================================
// EXAMPLE 12: Batch Operations
// ============================================================================

/**
 * Example: Bulk update unit costs for a category
 */
export function updateCategoryPricing(category: string, percentChange: number) {
  const store = useAppStore.getState();
  const labels = store.labels.filter(l => l.category === category);

  labels.forEach(label => {
    if (label.costPerUnit) {
      const newCost = label.costPerUnit * (1 + percentChange / 100);
      store.updateLabel(label.id, { costPerUnit: newCost });
    }
  });

  // Recalculate costs
  store.calculateCostItems();
}

/**
 * Example: Component for bulk pricing updates
 */
export function BulkPricingUpdate() {
  const [category, setCategory] = useState('Structure');
  const [percentChange, setPercentChange] = useState(10);

  const handleUpdate = () => {
    updateCategoryPricing(category, percentChange);
  };

  return (
    <div className="bulk-pricing-update">
      <h3>Bulk Update Pricing</h3>

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="Structure">Structure</option>
        <option value="Openings">Openings</option>
        <option value="MEP">MEP</option>
      </select>

      <input
        type="number"
        value={percentChange}
        onChange={(e) => setPercentChange(parseFloat(e.target.value))}
      />
      <span>%</span>

      <button onClick={handleUpdate}>
        Apply {percentChange > 0 ? 'Increase' : 'Decrease'}
      </button>
    </div>
  );
}

// Note: Add React imports at the top when using these examples
import { useState } from 'react';
