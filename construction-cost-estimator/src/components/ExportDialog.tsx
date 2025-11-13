import { useState } from 'react';
import {
  X,
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { CostItem, AnnotationData, Project } from '../types';
import { useExport, type ExportFormat } from '../hooks/useExport';
import { estimateExportSize } from '../utils/exporters';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  costItems?: CostItem[];
  annotations?: AnnotationData[];
  calibrationData?: any;
  defaultFormat?: ExportFormat;
  defaultMarkup?: number;
}

/**
 * Advanced export dialog with detailed options
 */
export function ExportDialog({
  isOpen,
  onClose,
  project,
  costItems = [],
  annotations = [],
  calibrationData,
  defaultFormat = 'json',
  defaultMarkup = 0,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(defaultFormat);
  const [markup, setMarkup] = useState(defaultMarkup);
  const [filename, setFilename] = useState('');
  const [includeOptions, setIncludeOptions] = useState({
    annotations: true,
    calibration: true,
    costItems: true,
    metadata: true,
  });
  const [pdfOptions, setPdfOptions] = useState({
    coverPage: true,
    summary: true,
    details: true,
    annotationsList: false,
  });

  const {
    exportProjectPDF,
    exportCostJSON,
    exportCostCSV,
    exportCostPDF,
    exportCostExcel,
    exportFullProjectJSON,
    isExporting,
    exportProgress,
    error,
    lastExportFilename,
  } = useExport();

  const handleExport = async () => {
    if (!project && costItems.length === 0) return;

    const exportOptions = {
      filename: filename || undefined,
      markup,
      includeMetadata: includeOptions.metadata,
      groupByCategory: true,
    };

    switch (selectedFormat) {
      case 'json':
        if (includeOptions.annotations && includeOptions.calibration && project) {
          exportFullProjectJSON(
            project,
            costItems,
            annotations,
            calibrationData,
            exportOptions
          );
        } else {
          exportCostJSON(costItems, exportOptions);
        }
        break;

      case 'csv':
        exportCostCSV(costItems, exportOptions);
        break;

      case 'pdf':
        if (project) {
          await exportProjectPDF(project, costItems, annotations, {
            ...exportOptions,
            includeCoverPage: pdfOptions.coverPage,
            includeSummary: pdfOptions.summary,
            includeDetails: pdfOptions.details,
          });
        } else {
          await exportCostPDF(costItems, exportOptions);
        }
        break;

      case 'excel':
        await exportCostExcel(costItems, exportOptions);
        break;
    }

    // Close dialog after successful export
    if (!error) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const toggleIncludeOption = (option: keyof typeof includeOptions) => {
    setIncludeOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const togglePdfOption = (option: keyof typeof pdfOptions) => {
    setPdfOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'json':
        return FileJson;
      case 'csv':
      case 'excel':
        return FileSpreadsheet;
      case 'pdf':
        return FileText;
      default:
        return FileDown;
    }
  };

  const formats: Array<{ value: ExportFormat; label: string; description: string }> = [
    { value: 'json', label: 'JSON', description: 'Machine-readable format' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
    { value: 'pdf', label: 'PDF', description: 'Professional report' },
    { value: 'excel', label: 'Excel', description: 'Excel workbook' },
  ];

  const estimatedSize = estimateExportSize(costItems.length, selectedFormat);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="export-dialog-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 id="export-dialog-title" className="text-xl font-semibold text-gray-900">
            Export Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {formats.map(format => {
                const Icon = getFormatIcon(format.value);
                const isSelected = selectedFormat === format.value;
                return (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      <div>
                        <div
                          className={`font-medium ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}
                        >
                          {format.label}
                        </div>
                        <div className="text-sm text-gray-500">{format.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Estimated file size: {estimatedSize}
            </p>
          </div>

          {/* Filename */}
          <div>
            <label
              htmlFor="export-filename"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filename (optional)
            </label>
            <input
              id="export-filename"
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder={`${project?.name || 'export'}-${new Date().toISOString().split('T')[0]}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank for auto-generated filename
            </p>
          </div>

          {/* Markup */}
          <div>
            <label htmlFor="export-markup" className="block text-sm font-medium text-gray-700 mb-2">
              Markup Percentage
            </label>
            <div className="flex items-center gap-3">
              <input
                id="export-markup"
                type="number"
                min="0"
                max="100"
                step="1"
                value={markup}
                onChange={e => setMarkup(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">%</span>
              {markup > 0 && (
                <span className="text-sm text-gray-500">
                  ({markup}% will be added to final total)
                </span>
              )}
            </div>
          </div>

          {/* Include Options (for JSON) */}
          {selectedFormat === 'json' && project && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Include in Export
              </label>
              <div className="space-y-2">
                {Object.entries({
                  annotations: 'Annotations',
                  calibration: 'Calibration Data',
                  costItems: 'Cost Items',
                  metadata: 'Metadata',
                }).map(([key, label]) => {
                  const isChecked = includeOptions[key as keyof typeof includeOptions];
                  const Icon = isChecked ? CheckSquare : Square;
                  return (
                    <button
                      key={key}
                      onClick={() => toggleIncludeOption(key as keyof typeof includeOptions)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isChecked ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-gray-900">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PDF Options */}
          {selectedFormat === 'pdf' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                PDF Options
              </label>
              <div className="space-y-2">
                {Object.entries({
                  coverPage: 'Include Cover Page',
                  summary: 'Include Cost Summary',
                  details: 'Include Detailed Breakdown',
                  annotationsList: 'Include Annotations List',
                }).map(([key, label]) => {
                  const isChecked = pdfOptions[key as keyof typeof pdfOptions];
                  const Icon = isChecked ? CheckSquare : Square;
                  return (
                    <button
                      key={key}
                      onClick={() => togglePdfOption(key as keyof typeof pdfOptions)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isChecked ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-gray-900">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="font-medium text-blue-900">Exporting...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-sm text-blue-700 mt-2">{exportProgress}% complete</p>
            </div>
          )}

          {/* Success Message */}
          {lastExportFilename && !isExporting && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Export Successful</p>
                  <p className="text-sm text-green-700 mt-1">
                    Downloaded: {lastExportFilename}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Export Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {costItems.length > 0 && `${costItems.length} cost items`}
            {annotations.length > 0 && costItems.length > 0 && ' • '}
            {annotations.length > 0 && `${annotations.length} annotations`}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || (costItems.length === 0 && !project)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
