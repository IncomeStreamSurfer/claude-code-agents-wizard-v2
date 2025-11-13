import { useMemo, useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { CostItem } from '../types';
import type { CategoryTotals } from '../utils/costCalculations';
import {
  aggregateAnnotationsToCosts,
  groupCostsByCategory,
  calculateCategoryTotals,
  calculateGrandTotal,
  calculateWithMarkup,
  exportCostsToJSON,
  exportCostsToCSV,
  formatCurrency,
} from '../utils/costCalculations';

/**
 * Cost estimation state interface
 */
export interface CostEstimationState {
  // Core data
  costItems: CostItem[];
  categoryTotals: Record<string, CategoryTotals>;
  grandTotal: number;

  // Markup/contingency
  markupPercent: number;
  totalWithMarkup: number;

  // Status
  isCalibrated: boolean;
  hasAnnotations: boolean;
  hasLabels: boolean;

  // Counts
  totalItems: number;
  totalAnnotations: number;
}

/**
 * Custom hook for cost estimation management
 *
 * Features:
 * - Real-time cost calculations from annotations
 * - Markup/contingency management
 * - Category grouping and totals
 * - Export to JSON/CSV
 * - Filtering and aggregation
 *
 * @returns Cost estimation state and actions
 */
export function useCostEstimation() {
  // Get data from store
  const annotations = useAppStore((state) => state.annotations);
  const labels = useAppStore((state) => state.labels);
  const calibrationData = useAppStore((state) => state.calibrationData);
  const costItems = useAppStore((state) => state.costItems);

  // Local state for markup
  const [markupPercent, setMarkupPercent] = useState<number>(0);

  // Flatten all annotations
  const allAnnotations = useMemo(() => {
    const flattened = [];
    for (const pageNum in annotations) {
      flattened.push(...annotations[pageNum]);
    }
    return flattened;
  }, [annotations]);

  // Calculate cost items from annotations
  const calculatedCostItems = useMemo(() => {
    if (!calibrationData.isCalibrated) {
      return [];
    }
    return aggregateAnnotationsToCosts(allAnnotations, calibrationData, labels);
  }, [allAnnotations, calibrationData, labels]);

  // Use calculated cost items or store cost items (prefer calculated)
  const activeCostItems = useMemo(() => {
    return calculatedCostItems.length > 0 ? calculatedCostItems : costItems;
  }, [calculatedCostItems, costItems]);

  // Group costs by category
  const groupedCosts = useMemo(() => {
    return groupCostsByCategory(activeCostItems);
  }, [activeCostItems]);

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    return calculateCategoryTotals(activeCostItems);
  }, [activeCostItems]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return calculateGrandTotal(activeCostItems);
  }, [activeCostItems]);

  // Calculate total with markup
  const totalWithMarkup = useMemo(() => {
    return calculateWithMarkup(grandTotal, markupPercent);
  }, [grandTotal, markupPercent]);

  // Status flags
  const isCalibrated = calibrationData.isCalibrated;
  const hasAnnotations = allAnnotations.length > 0;
  const hasLabels = labels.length > 0;

  // Recalculate costs (triggers store recalculation)
  const recalculate = useCallback(() => {
    useAppStore.getState().calculateCostItems();
  }, []);

  // Set markup percentage
  const setMarkup = useCallback((percent: number) => {
    const clamped = Math.max(0, Math.min(100, percent));
    setMarkupPercent(clamped);
  }, []);

  // Get costs by category
  const getCostsByCategory = useCallback((category: string) => {
    return groupedCosts[category] || [];
  }, [groupedCosts]);

  // Get costs by label
  const getCostsByLabel = useCallback((labelId: string) => {
    return activeCostItems.filter(item => item.labelId === labelId);
  }, [activeCostItems]);

  // Get costs by page
  const getCostsByPage = useCallback((pageNumber: number) => {
    return activeCostItems.filter(item => item.pageNumber === pageNumber);
  }, [activeCostItems]);

  // Export costs
  const exportCosts = useCallback((format: 'json' | 'csv'): string => {
    if (format === 'json') {
      return exportCostsToJSON(activeCostItems);
    } else {
      return exportCostsToCSV(activeCostItems);
    }
  }, [activeCostItems]);

  // Download costs as file
  const downloadCosts = useCallback((format: 'json' | 'csv', filename?: string) => {
    const content = exportCosts(format);
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv'
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `cost-estimate-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportCosts]);

  // Format currency helper
  const formatCost = useCallback((amount: number) => {
    return formatCurrency(amount);
  }, []);

  // Get summary statistics
  const getSummary = useCallback(() => {
    return {
      totalItems: activeCostItems.length,
      totalAnnotations: allAnnotations.length,
      categories: Object.keys(categoryTotals).length,
      grandTotal,
      totalWithMarkup,
      markupPercent,
      isCalibrated,
    };
  }, [
    activeCostItems.length,
    allAnnotations.length,
    categoryTotals,
    grandTotal,
    totalWithMarkup,
    markupPercent,
    isCalibrated,
  ]);

  // Calculate cost per page
  const getCostPerPage = useCallback(() => {
    const perPage: Record<number, number> = {};

    activeCostItems.forEach(item => {
      if (!perPage[item.pageNumber]) {
        perPage[item.pageNumber] = 0;
      }
      perPage[item.pageNumber] += item.totalCost;
    });

    return perPage;
  }, [activeCostItems]);

  // Get most expensive items
  const getMostExpensiveItems = useCallback((limit: number = 5) => {
    return [...activeCostItems]
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }, [activeCostItems]);

  // Auto-recalculate when dependencies change
  useEffect(() => {
    if (isCalibrated && hasAnnotations) {
      recalculate();
    }
  }, [isCalibrated, hasAnnotations, recalculate]);

  // Return state and actions
  return {
    // Core data
    costItems: activeCostItems,
    groupedCosts,
    categoryTotals,
    grandTotal,

    // Markup
    markupPercent,
    totalWithMarkup,
    markupAmount: totalWithMarkup - grandTotal,

    // Status
    isCalibrated,
    hasAnnotations,
    hasLabels,

    // Counts
    totalItems: activeCostItems.length,
    totalAnnotations: allAnnotations.length,
    totalCategories: Object.keys(categoryTotals).length,

    // Actions
    recalculate,
    setMarkup,
    getCostsByCategory,
    getCostsByLabel,
    getCostsByPage,
    exportCosts,
    downloadCosts,
    formatCost,
    getSummary,
    getCostPerPage,
    getMostExpensiveItems,
  };
}

/**
 * Hook for filtering cost items
 *
 * @param costItems - Cost items to filter
 * @returns Filtered cost items and filter actions
 */
export function useCostFilters(costItems: CostItem[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minCost, setMinCost] = useState<number | null>(null);
  const [maxCost, setMaxCost] = useState<number | null>(null);

  // Apply filters
  const filteredItems = useMemo(() => {
    return costItems.filter(item => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          item.description.toLowerCase().includes(search) ||
          item.category?.toLowerCase().includes(search) ||
          item.notes?.toLowerCase().includes(search);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      // Cost range filter
      if (minCost !== null && item.totalCost < minCost) {
        return false;
      }
      if (maxCost !== null && item.totalCost > maxCost) {
        return false;
      }

      return true;
    });
  }, [costItems, searchTerm, selectedCategory, minCost, maxCost]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory(null);
    setMinCost(null);
    setMaxCost(null);
  }, []);

  return {
    filteredItems,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    minCost,
    setMinCost,
    maxCost,
    setMaxCost,
    clearFilters,
    hasFilters: !!(searchTerm || selectedCategory || minCost !== null || maxCost !== null),
  };
}
