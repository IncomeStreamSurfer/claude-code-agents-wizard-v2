import { useState, useCallback } from 'react';
import type { Project, CostItem, AnnotationData } from '../types';
import {
  exportProjectAsJSON,
  exportProjectAsCSV,
  exportCostEstimateAsJSON,
  exportCostItemsAsCSV,
  exportCostEstimateAsPDF,
  exportCostEstimateAsExcel,
  exportAnnotationsAsJSON,
  exportAnnotationsAsCSV,
  exportAnnotationsAsGeoJSON,
  exportFullProject,
  downloadBlob,
  downloadText,
  generateFilename,
  validateExportData,
} from '../utils/exporters';

/**
 * Export format type
 */
export type ExportFormat = 'json' | 'csv' | 'pdf' | 'excel';

/**
 * Export status
 */
interface ExportState {
  isExporting: boolean;
  exportProgress: number; // 0-100
  lastExportFormat: ExportFormat | null;
  lastExportFilename: string | null;
  error: string | null;
}

/**
 * Export options
 */
interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  markup?: number;
  includeMetadata?: boolean;
  groupByCategory?: boolean;
  // PDF-specific options
  includeCoverPage?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
  includeAnnotations?: boolean;
}

/**
 * Hook for managing exports
 */
export function useExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    exportProgress: 0,
    lastExportFormat: null,
    lastExportFilename: null,
    error: null,
  });

  // Helper to update progress
  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, exportProgress: progress }));
  }, []);

  // Helper to start export
  const startExport = useCallback((format: ExportFormat) => {
    setState({
      isExporting: true,
      exportProgress: 0,
      lastExportFormat: format,
      lastExportFilename: null,
      error: null,
    });
  }, []);

  // Helper to finish export
  const finishExport = useCallback((filename: string | null, error: string | null = null) => {
    setState(prev => ({
      ...prev,
      isExporting: false,
      exportProgress: 100,
      lastExportFilename: filename,
      error,
    }));
  }, []);

  // ========== Project Export Functions ==========

  const exportProjectJSON = useCallback(
    (project: Project, options: ExportOptions = {}) => {
      try {
        startExport('json');
        updateProgress(30);

        const validation = validateExportData(project);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        const json = exportProjectAsJSON(project, {
          includeMetadata: options.includeMetadata !== false,
          prettyPrint: true,
        });

        updateProgress(70);

        const filename = options.filename || generateFilename(
          project.name,
          'json',
          options.includeTimestamp !== false
        );

        downloadText(json, filename, 'application/json');
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  const exportProjectCSV = useCallback(
    (project: Project, options: ExportOptions = {}) => {
      try {
        startExport('csv');
        updateProgress(30);

        const validation = validateExportData(project);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        const csv = exportProjectAsCSV(project);
        updateProgress(70);

        const filename = options.filename || generateFilename(
          project.name,
          'csv',
          options.includeTimestamp !== false
        );

        downloadText(csv, filename, 'text/csv');
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  const exportProjectPDF = useCallback(
    async (
      project: Project,
      costItems: CostItem[],
      annotations: AnnotationData[],
      options: ExportOptions = {}
    ) => {
      try {
        startExport('pdf');
        updateProgress(20);

        const validation = validateExportData(project);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        updateProgress(40);

        // Dynamic import for PDF generation
        const { exportProjectAsPDF } = await import('../utils/pdfExporter');
        updateProgress(50);

        const pdfBlob = await exportProjectAsPDF(project, costItems, annotations, {
          projectName: project.name,
          markup: options.markup,
          includeCoverPage: options.includeCoverPage !== false,
          includeSummary: options.includeSummary !== false,
          includeDetails: options.includeDetails !== false,
          includeAnnotations: options.includeAnnotations,
        });

        updateProgress(90);

        const filename = options.filename || generateFilename(
          project.name,
          'pdf',
          options.includeTimestamp !== false
        );

        downloadBlob(pdfBlob, filename);
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  // ========== Cost Export Functions ==========

  const exportCostJSON = useCallback(
    (costItems: CostItem[], options: ExportOptions = {}) => {
      try {
        startExport('json');
        updateProgress(30);

        const validation = validateExportData(costItems);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        const json = exportCostEstimateAsJSON(costItems, {
          includeMetadata: options.includeMetadata !== false,
          prettyPrint: true,
          markup: options.markup,
        });

        updateProgress(70);

        const filename = options.filename || generateFilename(
          'cost-estimate',
          'json',
          options.includeTimestamp !== false
        );

        downloadText(json, filename, 'application/json');
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  const exportCostCSV = useCallback(
    (costItems: CostItem[], options: ExportOptions = {}) => {
      try {
        startExport('csv');
        updateProgress(30);

        const validation = validateExportData(costItems);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        const csv = exportCostItemsAsCSV(costItems, {
          includeHeaders: true,
          includeMetadata: options.includeMetadata !== false,
          groupByCategory: options.groupByCategory !== false,
          includeSubtotals: true,
          markup: options.markup,
        });

        updateProgress(70);

        const filename = options.filename || generateFilename(
          'cost-estimate',
          'csv',
          options.includeTimestamp !== false
        );

        downloadText(csv, filename, 'text/csv');
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  const exportCostPDF = useCallback(
    async (costItems: CostItem[], options: ExportOptions = {}) => {
      try {
        startExport('pdf');
        updateProgress(20);

        const validation = validateExportData(costItems);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        updateProgress(40);

        const pdfBlob = await exportCostEstimateAsPDF(costItems, {
          includeCoverPage: true,
          includeSummary: true,
          includeDetails: true,
          markup: options.markup,
          projectName: 'Cost Estimate',
        });

        updateProgress(90);

        const filename = options.filename || generateFilename(
          'cost-estimate',
          'pdf',
          options.includeTimestamp !== false
        );

        downloadBlob(pdfBlob, filename);
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  const exportCostExcel = useCallback(
    async (costItems: CostItem[], options: ExportOptions = {}) => {
      try {
        startExport('excel');
        updateProgress(20);

        const validation = validateExportData(costItems);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        updateProgress(40);

        const excelBlob = await exportCostEstimateAsExcel(costItems, {
          includeSummary: true,
          markup: options.markup,
        });

        updateProgress(90);

        const filename = options.filename || generateFilename(
          'cost-estimate',
          'xlsx',
          options.includeTimestamp !== false
        );

        downloadBlob(excelBlob, filename);
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  // ========== Annotations Export Functions ==========

  const exportAnnotationsJSON = useCallback(
    (annotations: AnnotationData[], options: ExportOptions = {}) => {
      try {
        startExport('json');
        updateProgress(30);

        const validation = validateExportData(annotations);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        const json = exportAnnotationsAsJSON(annotations, {
          includeMetadata: options.includeMetadata !== false,
          prettyPrint: true,
        });

        updateProgress(70);

        const filename = options.filename || generateFilename(
          'annotations',
          'json',
          options.includeTimestamp !== false
        );

        downloadText(json, filename, 'application/json');
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  const exportAnnotationsCSV = useCallback(
    (annotations: AnnotationData[], options: ExportOptions = {}) => {
      try {
        startExport('csv');
        updateProgress(30);

        const validation = validateExportData(annotations);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        const csv = exportAnnotationsAsCSV(annotations);
        updateProgress(70);

        const filename = options.filename || generateFilename(
          'annotations',
          'csv',
          options.includeTimestamp !== false
        );

        downloadText(csv, filename, 'text/csv');
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  const exportAnnotationsGeoJSON = useCallback(
    (annotations: AnnotationData[], options: ExportOptions = {}) => {
      try {
        startExport('json');
        updateProgress(30);

        const validation = validateExportData(annotations);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        const geoJSON = exportAnnotationsAsGeoJSON(annotations);
        updateProgress(70);

        const filename = options.filename || generateFilename(
          'annotations',
          'geojson',
          options.includeTimestamp !== false
        );

        downloadText(geoJSON, filename, 'application/geo+json');
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  // ========== Full Project Export ==========

  const exportFullProjectJSON = useCallback(
    (
      project: Project,
      costItems: CostItem[],
      annotations: AnnotationData[],
      calibrationData: any,
      options: ExportOptions = {}
    ) => {
      try {
        startExport('json');
        updateProgress(30);

        const json = exportFullProject(
          project,
          costItems,
          annotations,
          calibrationData,
          {
            includeCalibration: true,
            includeAnnotations: true,
            includeCostItems: true,
            markup: options.markup,
          }
        );

        updateProgress(70);

        const filename = options.filename || generateFilename(
          `${project.name}-full`,
          'json',
          options.includeTimestamp !== false
        );

        downloadText(json, filename, 'application/json');
        updateProgress(100);
        finishExport(filename);
      } catch (error) {
        finishExport(null, error instanceof Error ? error.message : 'Export failed');
        console.error('Export error:', error);
      }
    },
    [startExport, updateProgress, finishExport]
  );

  // Reset export state
  const resetExport = useCallback(() => {
    setState({
      isExporting: false,
      exportProgress: 0,
      lastExportFormat: null,
      lastExportFilename: null,
      error: null,
    });
  }, []);

  return {
    // Project exports
    exportProjectJSON,
    exportProjectCSV,
    exportProjectPDF,

    // Cost exports
    exportCostJSON,
    exportCostCSV,
    exportCostPDF,
    exportCostExcel,

    // Annotation exports
    exportAnnotationsJSON,
    exportAnnotationsCSV,
    exportAnnotationsGeoJSON,

    // Full project export
    exportFullProjectJSON,

    // State
    isExporting: state.isExporting,
    exportProgress: state.exportProgress,
    lastExportFormat: state.lastExportFormat,
    lastExportFilename: state.lastExportFilename,
    error: state.error,

    // Actions
    resetExport,
  };
}
