import { useState, useRef, useEffect } from 'react';
import {
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import type { CostItem, AnnotationData, Project } from '../types';
import { useExport, type ExportFormat } from '../hooks/useExport';
import { estimateExportSize } from '../utils/exporters';

interface ExportMenuProps {
  project?: Project;
  costItems?: CostItem[];
  annotations?: AnnotationData[];
  calibrationData?: any;
  dataType?: 'project' | 'costs' | 'annotations' | 'full';
  markup?: number;
  className?: string;
}

/**
 * Export menu component with dropdown options
 */
export function ExportMenu({
  project,
  costItems = [],
  annotations = [],
  calibrationData,
  dataType = 'costs',
  markup = 0,
  className = '',
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    exportProjectJSON,
    exportProjectCSV,
    exportProjectPDF,
    exportCostJSON,
    exportCostCSV,
    exportCostPDF,
    exportCostExcel,
    exportAnnotationsJSON,
    exportAnnotationsCSV,
    exportFullProjectJSON,
    isExporting,
    exportProgress,
  } = useExport();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleExport = (format: ExportFormat) => {
    setIsOpen(false);

    switch (dataType) {
      case 'project':
        if (project) {
          if (format === 'json') exportProjectJSON(project, { markup });
          else if (format === 'csv') exportProjectCSV(project, { markup });
          else if (format === 'pdf' && costItems && annotations) {
            exportProjectPDF(project, costItems, annotations, { markup });
          }
        }
        break;

      case 'costs':
        if (costItems.length > 0) {
          if (format === 'json') exportCostJSON(costItems, { markup });
          else if (format === 'csv') exportCostCSV(costItems, { markup });
          else if (format === 'pdf') exportCostPDF(costItems, { markup });
          else if (format === 'excel') exportCostExcel(costItems, { markup });
        }
        break;

      case 'annotations':
        if (annotations.length > 0) {
          if (format === 'json') exportAnnotationsJSON(annotations);
          else if (format === 'csv') exportAnnotationsCSV(annotations);
        }
        break;

      case 'full':
        if (project) {
          if (format === 'json') {
            exportFullProjectJSON(
              project,
              costItems,
              annotations,
              calibrationData,
              { markup }
            );
          }
        }
        break;
    }
  };

  const getExportOptions = (): Array<{
    format: ExportFormat;
    icon: typeof FileJson;
    label: string;
    description: string;
    estimatedSize: string;
  }> => {
    const itemCount = costItems.length || annotations.length || 1;

    const options: Array<{
      format: ExportFormat;
      icon: typeof FileJson;
      label: string;
      description: string;
      estimatedSize: string;
    }> = [];

    // Always include JSON
    options.push({
      format: 'json',
      icon: FileJson,
      label: 'JSON',
      description: 'Machine-readable format',
      estimatedSize: estimateExportSize(itemCount, 'json'),
    });

    // Always include CSV
    options.push({
      format: 'csv',
      icon: FileSpreadsheet,
      label: 'CSV',
      description: 'Spreadsheet format',
      estimatedSize: estimateExportSize(itemCount, 'csv'),
    });

    // PDF for costs and project
    if (dataType === 'costs' || dataType === 'project') {
      options.push({
        format: 'pdf',
        icon: FileText,
        label: 'PDF',
        description: 'Professional report',
        estimatedSize: estimateExportSize(itemCount, 'pdf'),
      });
    }

    // Excel for costs
    if (dataType === 'costs') {
      options.push({
        format: 'excel',
        icon: FileSpreadsheet,
        label: 'Excel',
        description: 'Excel workbook',
        estimatedSize: estimateExportSize(itemCount, 'excel'),
      });
    }

    return options;
  };

  const options = getExportOptions();

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Export data"
        aria-expanded={isOpen}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Exporting... {exportProgress}%</span>
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            <span>Export</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && !isExporting && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Export Format</h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose a format to download
            </p>
          </div>

          <div className="py-2">
            {options.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Est. size: {option.estimatedSize}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-xs text-gray-500">
              {dataType === 'costs' && `${costItems.length} items`}
              {dataType === 'annotations' && `${annotations.length} annotations`}
              {dataType === 'project' && project?.name}
              {markup > 0 && ` • ${markup}% markup included`}
            </p>
          </div>
        </div>
      )}

      {/* Progress overlay */}
      {isExporting && exportProgress > 0 && exportProgress < 100 && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Exporting...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{exportProgress}% complete</p>
        </div>
      )}
    </div>
  );
}
