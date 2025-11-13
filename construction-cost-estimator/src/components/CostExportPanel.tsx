import React, { useState, useMemo } from 'react';
import { X, Download, Copy, FileJson, FileText, FileSpreadsheet, Printer, Check } from 'lucide-react';
import type { CostItem } from '../types';

/**
 * Export format options
 */
type ExportFormat = 'json' | 'csv' | 'xlsx' | 'print';

/**
 * Props for CostExportPanel component
 */
export interface CostExportPanelProps {
  costItems: CostItem[];
  grandTotal: number;
  totalWithMarkup: number;
  markupPercent: number;
  onClose: () => void;
  onExport?: (format: string, data: any) => void;
}

/**
 * Export options interface
 */
interface ExportOptions {
  includeMarkup: boolean;
  includeUnitCosts: boolean;
  groupByCategory: boolean;
  includePageInfo: boolean;
  includeNotes: boolean;
  includeTimestamps: boolean;
}

/**
 * CostExportPanel - Modal dialog for exporting cost data
 *
 * Features:
 * - Multiple export formats (JSON, CSV, Excel, Print)
 * - Format preview
 * - Customizable export options
 * - Filename input
 * - Download and copy to clipboard
 */
export const CostExportPanel: React.FC<CostExportPanelProps> = ({
  costItems,
  grandTotal,
  totalWithMarkup,
  markupPercent,
  onClose,
  onExport,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [filename, setFilename] = useState(`cost-estimate-${Date.now()}`);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeMarkup: true,
    includeUnitCosts: true,
    groupByCategory: true,
    includePageInfo: true,
    includeNotes: true,
    includeTimestamps: false,
  });

  // Generate export data based on format and options
  const exportData = useMemo(() => {
    let data: any;

    switch (selectedFormat) {
      case 'json':
        data = {
          exportDate: new Date().toISOString(),
          summary: {
            grandTotal,
            markupPercent: options.includeMarkup ? markupPercent : undefined,
            totalWithMarkup: options.includeMarkup ? totalWithMarkup : undefined,
            totalItems: costItems.length,
          },
          items: costItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitCost: options.includeUnitCosts ? item.unitCost : undefined,
            totalCost: item.totalCost,
            category: options.groupByCategory ? item.category : undefined,
            pageNumber: options.includePageInfo ? item.pageNumber : undefined,
            notes: options.includeNotes ? item.notes : undefined,
            createdAt: options.includeTimestamps ? item.createdAt : undefined,
            updatedAt: options.includeTimestamps ? item.updatedAt : undefined,
          })),
        };
        return JSON.stringify(data, null, 2);

      case 'csv':
        const headers: string[] = ['Description', 'Quantity', 'Unit'];
        if (options.includeUnitCosts) headers.push('Unit Cost');
        headers.push('Total Cost');
        if (options.groupByCategory) headers.push('Category');
        if (options.includePageInfo) headers.push('Page Number');
        if (options.includeNotes) headers.push('Notes');

        const rows = costItems.map(item => {
          const row: any[] = [item.description, item.quantity, item.unit];
          if (options.includeUnitCosts) row.push(item.unitCost);
          row.push(item.totalCost);
          if (options.groupByCategory) row.push(item.category || '');
          if (options.includePageInfo) row.push(item.pageNumber);
          if (options.includeNotes) row.push(item.notes || '');
          return row;
        });

        // Add summary rows
        if (options.includeMarkup) {
          rows.push([]);
          rows.push(['Grand Total', '', '', '', grandTotal]);
          rows.push([`Markup (${markupPercent}%)`, '', '', '', totalWithMarkup - grandTotal]);
          rows.push(['Total with Markup', '', '', '', totalWithMarkup]);
        }

        return [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

      case 'xlsx':
        // For Excel, we'll generate CSV format (actual XLSX would require a library)
        return 'Excel export requires xlsx library (coming soon)';

      case 'print':
        return generatePrintHTML();

      default:
        return '';
    }
  }, [selectedFormat, costItems, grandTotal, totalWithMarkup, markupPercent, options]);

  // Generate HTML for printing
  const generatePrintHTML = () => {
    const categorized: Record<string, CostItem[]> = {};
    costItems.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(item);
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Cost Estimate</title>
  <style>
    @media print {
      body { font-family: Arial, sans-serif; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f5f5f5; }
      .summary { margin-bottom: 20px; }
      .category { margin-top: 20px; font-weight: bold; background-color: #f0f0f0; }
    }
  </style>
</head>
<body>
  <h1>Construction Cost Estimate</h1>
  <p>Generated: ${new Date().toLocaleDateString()}</p>

  <div class="summary">
    <h2>Summary</h2>
    <p>Grand Total: $${grandTotal.toFixed(2)}</p>
    ${options.includeMarkup ? `
    <p>Markup (${markupPercent}%): $${(totalWithMarkup - grandTotal).toFixed(2)}</p>
    <p><strong>Total with Markup: $${totalWithMarkup.toFixed(2)}</strong></p>
    ` : ''}
  </div>

  ${options.groupByCategory ? Object.entries(categorized).map(([category, items]) => `
    <div class="category">
      <h3>${category}</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit</th>
            ${options.includeUnitCosts ? '<th>Unit Cost</th>' : ''}
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity.toFixed(2)}</td>
              <td>${item.unit}</td>
              ${options.includeUnitCosts ? `<td>$${item.unitCost.toFixed(2)}</td>` : ''}
              <td>$${item.totalCost.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('') : `
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantity</th>
          <th>Unit</th>
          ${options.includeUnitCosts ? '<th>Unit Cost</th>' : ''}
          <th>Total Cost</th>
        </tr>
      </thead>
      <tbody>
        ${costItems.map(item => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity.toFixed(2)}</td>
            <td>${item.unit}</td>
            ${options.includeUnitCosts ? `<td>$${item.unitCost.toFixed(2)}</td>` : ''}
            <td>$${item.totalCost.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `}
</body>
</html>
    `;
  };

  // Handle download
  const handleDownload = () => {
    let blob: Blob;
    let extension: string;

    switch (selectedFormat) {
      case 'json':
        blob = new Blob([exportData], { type: 'application/json' });
        extension = 'json';
        break;
      case 'csv':
        blob = new Blob([exportData], { type: 'text/csv' });
        extension = 'csv';
        break;
      case 'xlsx':
        alert('Excel export requires additional library. Please use CSV format.');
        return;
      case 'print':
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(exportData);
          printWindow.document.close();
          printWindow.print();
        }
        return;
      default:
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onExport) {
      onExport(selectedFormat, exportData);
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(exportData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle option
  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Export Cost Estimate</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedFormat('json')}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  selectedFormat === 'json'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileJson className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">JSON</div>
                  <div className="text-xs text-gray-600">Structured data</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat('csv')}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  selectedFormat === 'csv'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">CSV</div>
                  <div className="text-xs text-gray-600">Spreadsheet data</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat('xlsx')}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  selectedFormat === 'xlsx'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Excel</div>
                  <div className="text-xs text-gray-600">Coming soon</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat('print')}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  selectedFormat === 'print'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Printer className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Print</div>
                  <div className="text-xs text-gray-600">Print preview</div>
                </div>
              </button>
            </div>
          </div>

          {/* Filename Input */}
          {selectedFormat !== 'print' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Filename
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Enter filename"
              />
            </div>
          )}

          {/* Export Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Export Options
            </label>
            <div className="space-y-2">
              {Object.entries({
                includeMarkup: 'Include markup calculation',
                includeUnitCosts: 'Include unit costs',
                groupByCategory: 'Group by category',
                includePageInfo: 'Include page information',
                includeNotes: 'Include notes',
                includeTimestamps: 'Include timestamps',
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options[key as keyof ExportOptions]}
                    onChange={() => toggleOption(key as keyof ExportOptions)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedFormat !== 'print' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Preview
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-48 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {exportData.substring(0, 500)}
                  {exportData.length > 500 && '...'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {selectedFormat !== 'print' && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {selectedFormat === 'print' ? (
                <>
                  <Printer className="w-4 h-4" />
                  Print
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostExportPanel;
