/**
 * EXPORT INTEGRATION EXAMPLE
 *
 * This file shows how to integrate the export functionality
 * into your existing pages and components.
 *
 * Copy the relevant sections into your actual components.
 */

import { useState } from 'react';
import { ExportMenu } from './src/components/ExportMenu';
import { ExportDialog } from './src/components/ExportDialog';
import { useExport } from './src/hooks/useExport';

// ============================================
// EXAMPLE 1: Simple Export Button
// ============================================

function SimpleExportExample({ costItems }: { costItems: any[] }) {
  const { exportCostCSV, isExporting } = useExport();

  return (
    <button
      onClick={() => exportCostCSV(costItems, { markup: 15 })}
      disabled={isExporting}
    >
      {isExporting ? 'Exporting...' : 'Export to CSV'}
    </button>
  );
}

// ============================================
// EXAMPLE 2: Export Menu in Header
// ============================================

function PageWithExportMenu({ project, costItems, annotations }: any) {
  return (
    <div className="page">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">{project.name}</h1>

        {/* Export menu in header */}
        <ExportMenu
          project={project}
          costItems={costItems}
          annotations={annotations}
          dataType="full"
          markup={15}
        />
      </header>

      <main>
        {/* Your page content */}
      </main>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Export Dialog with Button
// ============================================

function PageWithExportDialog({ project, costItems }: any) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <div className="page">
      <header className="p-4">
        <button
          onClick={() => setIsExportDialogOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Export Options
        </button>
      </header>

      <main>
        {/* Your content */}
      </main>

      {/* Export dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        project={project}
        costItems={costItems}
        defaultMarkup={15}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 4: Multiple Export Options
// ============================================

function AdvancedExportExample({ costItems }: { costItems: any[] }) {
  const {
    exportCostJSON,
    exportCostCSV,
    exportCostPDF,
    exportCostExcel,
    isExporting,
    exportProgress,
    error,
  } = useExport();

  const [markup, setMarkup] = useState(15);

  return (
    <div className="export-section">
      {/* Markup control */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Markup Percentage
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={markup}
          onChange={e => setMarkup(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Export buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => exportCostJSON(costItems, { markup })}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Export JSON
        </button>

        <button
          onClick={() => exportCostCSV(costItems, { markup })}
          disabled={isExporting}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Export CSV
        </button>

        <button
          onClick={() => exportCostPDF(costItems, { markup })}
          disabled={isExporting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
        >
          Export PDF
        </button>

        <button
          onClick={() => exportCostExcel(costItems, { markup })}
          disabled={isExporting}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
        >
          Export Excel
        </button>
      </div>

      {/* Progress indicator */}
      {isExporting && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Exporting... {exportProgress}%
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Inline with Action Menu
// ============================================

function CostItemsTableWithExport({ costItems }: { costItems: any[] }) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  return (
    <div className="cost-items-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Cost Items</h2>

        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Export
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 z-10">
              <ExportMenu
                costItems={costItems}
                dataType="costs"
                markup={15}
              />
            </div>
          )}
        </div>
      </div>

      <table className="w-full">
        {/* Table content */}
      </table>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Using with Zustand Store
// ============================================

function StoreIntegrationExample() {
  // Assuming you have a Zustand store
  const project = useProjectStore(state => state.currentProject);
  const costItems = useProjectStore(state => state.costItems);
  const annotations = useProjectStore(state => state.annotations);
  const calibrationData = useProjectStore(state => state.calibrationData);

  return (
    <div className="page">
      <header className="flex justify-between p-4">
        <h1>{project?.name}</h1>

        <ExportMenu
          project={project}
          costItems={costItems}
          annotations={annotations}
          calibrationData={calibrationData}
          dataType="full"
          markup={15}
        />
      </header>

      {/* Rest of page */}
    </div>
  );
}

// ============================================
// EXAMPLE 7: Direct Function Usage
// ============================================

function DirectFunctionExample({ costItems }: { costItems: any[] }) {
  const handleExportJSON = () => {
    const {
      exportCostEstimateAsJSON,
      downloadText,
    } = require('./src/utils/exporters');

    const json = exportCostEstimateAsJSON(costItems, {
      markup: 15,
      prettyPrint: true,
    });

    downloadText(json, 'estimate.json', 'application/json');
  };

  const handleExportCSV = () => {
    const {
      exportCostItemsAsCSV,
      downloadText,
    } = require('./src/utils/exporters');

    const csv = exportCostItemsAsCSV(costItems, {
      markup: 15,
      groupByCategory: true,
      includeSubtotals: true,
    });

    downloadText(csv, 'estimate.csv', 'text/csv');
  };

  const handleExportPDF = async () => {
    const {
      exportCostEstimateAsPDF,
      downloadBlob,
    } = require('./src/utils/exporters');

    const pdfBlob = await exportCostEstimateAsPDF(costItems, {
      markup: 15,
      includeCoverPage: true,
      includeSummary: true,
      includeDetails: true,
    });

    downloadBlob(pdfBlob, 'estimate.pdf');
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleExportJSON}>Export JSON</button>
      <button onClick={handleExportCSV}>Export CSV</button>
      <button onClick={handleExportPDF}>Export PDF</button>
    </div>
  );
}

// ============================================
// EXAMPLE 8: Custom Export with Options
// ============================================

function CustomExportExample({ costItems }: { costItems: any[] }) {
  const { exportCostCSV } = useExport();
  const [options, setOptions] = useState({
    filename: '',
    markup: 15,
    includeTimestamp: true,
    groupByCategory: true,
  });

  const handleExport = () => {
    exportCostCSV(costItems, options);
  };

  return (
    <div className="custom-export-form">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Filename</label>
        <input
          type="text"
          value={options.filename}
          onChange={e => setOptions({ ...options, filename: e.target.value })}
          placeholder="Leave blank for auto-generated"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Markup %</label>
        <input
          type="number"
          value={options.markup}
          onChange={e => setOptions({ ...options, markup: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.includeTimestamp}
            onChange={e => setOptions({ ...options, includeTimestamp: e.target.checked })}
          />
          <span className="text-sm">Include timestamp in filename</span>
        </label>
      </div>

      <div className="mb-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.groupByCategory}
            onChange={e => setOptions({ ...options, groupByCategory: e.target.checked })}
          />
          <span className="text-sm">Group by category</span>
        </label>
      </div>

      <button
        onClick={handleExport}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Export CSV
      </button>
    </div>
  );
}

// ============================================
// Placeholder for store (if you use Zustand)
// ============================================
function useProjectStore(selector: any) {
  // This is just for the example
  // In real code, import your actual store
  return selector({
    currentProject: null,
    costItems: [],
    annotations: [],
    calibrationData: null,
  });
}

export {
  SimpleExportExample,
  PageWithExportMenu,
  PageWithExportDialog,
  AdvancedExportExample,
  CostItemsTableWithExport,
  StoreIntegrationExample,
  DirectFunctionExample,
  CustomExportExample,
};
