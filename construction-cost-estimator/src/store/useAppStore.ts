import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppState, AnnotationData, LabelDefinition, CalibrationData } from '../types/store';
import type { CostItem } from '../types';
import {
  aggregateCostItems,
  getTotalCost,
  getCostByCategory,
  validateCalibration,
} from './storeHelpers';
import { PREDEFINED_LABELS } from './predefinedLabels';

/**
 * Initial calibration state
 */
const initialCalibrationData: CalibrationData = {
  referenceLength: 0,
  pixelDistance: 0,
  metersPerPixel: 0,
  isCalibrated: false,
};

/**
 * Initial application state
 */
const initialState = {
  currentProjectId: '',
  currentPageNumber: 1,
  calibrationData: initialCalibrationData,
  annotations: {},
  selectedAnnotationId: null,
  labels: PREDEFINED_LABELS,
  selectedLabelId: null,
  costItems: [],
  activeTool: null,
  isPanMode: false,
  currentZoom: 1.0,
  currentPan: { x: 0, y: 0 },
};

/**
 * Main application store using Zustand
 *
 * Features:
 * - State persistence with localStorage
 * - Immutable updates with Immer
 * - DevTools integration for debugging
 * - Type-safe actions and selectors
 */
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // ========== Initial State ==========
        ...initialState,

        // ========== Calibration Actions ==========

        /**
         * Set calibration data (partial update)
         */
        setCalibrationData: (data: Partial<CalibrationData>) => {
          set((state) => {
            state.calibrationData = { ...state.calibrationData, ...data };
          });
        },

        /**
         * Compute calibration from reference length and pixel distance
         */
        computeCalibration: (referenceLength: number, pixelDistance: number) => {
          // Validate inputs
          const error = validateCalibration(referenceLength, pixelDistance);
          if (error) {
            console.error('Calibration validation failed:', error);
            return;
          }

          const metersPerPixel = referenceLength / pixelDistance;

          set((state) => {
            state.calibrationData = {
              referenceLength,
              pixelDistance,
              metersPerPixel,
              isCalibrated: true,
            };
          });

          // Recalculate cost items with new calibration
          get().calculateCostItems();
        },

        /**
         * Reset calibration to initial state
         */
        resetCalibration: () => {
          set((state) => {
            state.calibrationData = initialCalibrationData;
          });
        },

        // ========== Annotation Actions ==========

        /**
         * Add a new annotation to the current page
         */
        addAnnotation: (annotation: AnnotationData) => {
          set((state) => {
            const pageNum = annotation.pageNumber;
            if (!state.annotations[pageNum]) {
              state.annotations[pageNum] = [];
            }
            state.annotations[pageNum].push(annotation);
          });

          // Recalculate cost items
          get().calculateCostItems();
        },

        /**
         * Update an existing annotation
         */
        updateAnnotation: (id: string, updates: Partial<AnnotationData>) => {
          set((state) => {
            // Find the annotation across all pages
            for (const pageNum in state.annotations) {
              const annotations = state.annotations[pageNum];
              const index = annotations.findIndex((a: AnnotationData) => a.id === id);

              if (index !== -1) {
                state.annotations[pageNum][index] = {
                  ...annotations[index],
                  ...updates,
                  updatedAt: new Date(),
                };
                break;
              }
            }
          });

          // Recalculate cost items
          get().calculateCostItems();
        },

        /**
         * Delete an annotation
         */
        deleteAnnotation: (id: string) => {
          set((state) => {
            // Find and remove the annotation across all pages
            for (const pageNum in state.annotations) {
              const annotations = state.annotations[pageNum];
              const index = annotations.findIndex((a: AnnotationData) => a.id === id);

              if (index !== -1) {
                state.annotations[pageNum].splice(index, 1);
                break;
              }
            }

            // Deselect if this was the selected annotation
            if (state.selectedAnnotationId === id) {
              state.selectedAnnotationId = null;
            }
          });

          // Recalculate cost items
          get().calculateCostItems();
        },

        /**
         * Select an annotation (or deselect if null)
         */
        selectAnnotation: (id: string | null) => {
          set((state) => {
            state.selectedAnnotationId = id;
          });
        },

        /**
         * Clear annotations for a specific page or all pages
         */
        clearAnnotations: (pageNumber?: number) => {
          set((state) => {
            if (pageNumber !== undefined) {
              state.annotations[pageNumber] = [];
            } else {
              state.annotations = {};
            }
            state.selectedAnnotationId = null;
          });

          // Recalculate cost items
          get().calculateCostItems();
        },

        /**
         * Get annotations for a specific page
         */
        getAnnotationsByPage: (pageNumber: number): AnnotationData[] => {
          return get().annotations[pageNumber] || [];
        },

        // ========== Label Actions ==========

        /**
         * Add a new label definition
         */
        addLabel: (label: LabelDefinition) => {
          set((state) => {
            state.labels.push(label);
          });
        },

        /**
         * Update an existing label
         */
        updateLabel: (id: string, updates: Partial<LabelDefinition>) => {
          set((state) => {
            const index = state.labels.findIndex((l: LabelDefinition) => l.id === id);
            if (index !== -1) {
              state.labels[index] = { ...state.labels[index], ...updates };
            }
          });

          // Recalculate cost items if cost changed
          if (updates.costPerUnit !== undefined) {
            get().calculateCostItems();
          }
        },

        /**
         * Delete a label
         */
        deleteLabel: (id: string) => {
          set((state) => {
            state.labels = state.labels.filter((l: LabelDefinition) => l.id !== id);

            // Deselect if this was the selected label
            if (state.selectedLabelId === id) {
              state.selectedLabelId = null;
            }
          });

          // Recalculate cost items
          get().calculateCostItems();
        },

        /**
         * Select a label (or deselect if null)
         */
        selectLabel: (id: string | null) => {
          set((state) => {
            state.selectedLabelId = id;
          });
        },

        /**
         * Add multiple predefined labels at once
         */
        addPredefinedLabels: (labels: LabelDefinition[]) => {
          set((state) => {
            state.labels.push(...labels);
          });
        },

        // ========== Cost Item Actions ==========

        /**
         * Calculate cost items from all annotations
         */
        calculateCostItems: () => {
          const state = get();

          // Skip if not calibrated
          if (!state.calibrationData.isCalibrated) {
            set((state) => {
              state.costItems = [];
            });
            return;
          }

          // Flatten all annotations from all pages
          const allAnnotations: AnnotationData[] = [];
          for (const pageNum in state.annotations) {
            allAnnotations.push(...state.annotations[pageNum]);
          }

          // Aggregate into cost items
          const costItems = aggregateCostItems(
            allAnnotations,
            state.labels,
            state.calibrationData.metersPerPixel
          );

          set((state) => {
            state.costItems = costItems;
          });
        },

        /**
         * Update a specific cost item
         */
        updateCostItem: (id: string, updates: Partial<CostItem>) => {
          set((state) => {
            const index = state.costItems.findIndex((item: CostItem) => item.id === id);
            if (index !== -1) {
              state.costItems[index] = {
                ...state.costItems[index],
                ...updates,
                updatedAt: new Date(),
              };

              // Recalculate total cost if quantity or unit cost changed
              if (updates.quantity !== undefined || updates.unitCost !== undefined) {
                const item = state.costItems[index];
                item.totalCost = item.quantity * item.unitCost;
              }
            }
          });
        },

        /**
         * Get total cost across all cost items
         */
        getTotalCost: (): number => {
          return getTotalCost(get().costItems);
        },

        /**
         * Get cost totals grouped by category
         */
        getCostByCategory: (): Record<string, number> => {
          return getCostByCategory(get().costItems);
        },

        // ========== UI Actions ==========

        /**
         * Set the active tool
         */
        setActiveTool: (tool: AppState['activeTool']) => {
          set((state) => {
            state.activeTool = tool;
            // Disable pan mode when selecting a drawing tool
            if (tool !== 'select' && tool !== null) {
              state.isPanMode = false;
            }
          });
        },

        /**
         * Toggle pan mode
         */
        setPanMode: (enabled: boolean) => {
          set((state) => {
            state.isPanMode = enabled;
            // Deselect tool when entering pan mode
            if (enabled) {
              state.activeTool = null;
            }
          });
        },

        /**
         * Set zoom level
         */
        setZoom: (zoom: number) => {
          set((state) => {
            // Clamp zoom between 0.1 and 5.0
            state.currentZoom = Math.max(0.1, Math.min(5.0, zoom));
          });
        },

        /**
         * Set pan offset
         */
        setPan: (pan: { x: number; y: number }) => {
          set((state) => {
            state.currentPan = pan;
          });
        },

        /**
         * Set current page number
         */
        setCurrentPage: (pageNumber: number) => {
          set((state) => {
            state.currentPageNumber = Math.max(1, pageNumber);
            // Deselect annotation when changing pages
            state.selectedAnnotationId = null;
          });
        },

        // ========== Project Actions ==========

        /**
         * Set the current project ID
         */
        setCurrentProjectId: (projectId: string) => {
          set((state) => {
            state.currentProjectId = projectId;
          });
        },

        /**
         * Reset entire state to initial values
         */
        resetState: () => {
          set(initialState);
        },
      })),
      {
        name: 'construction-cost-estimator-storage',
        // Only persist certain fields, not UI state
        partialize: (state) => ({
          currentProjectId: state.currentProjectId,
          currentPageNumber: state.currentPageNumber,
          calibrationData: state.calibrationData,
          annotations: state.annotations,
          labels: state.labels,
          costItems: state.costItems,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);

// ========== Selectors ==========

/**
 * Select annotations for the current page
 */
export const useCurrentPageAnnotations = () => {
  return useAppStore((state) =>
    state.annotations[state.currentPageNumber] || []
  );
};

/**
 * Select the currently selected annotation
 */
export const useSelectedAnnotation = () => {
  return useAppStore((state) => {
    if (!state.selectedAnnotationId) return null;

    // Find annotation across all pages
    for (const pageNum in state.annotations) {
      const annotation = state.annotations[pageNum].find(
        a => a.id === state.selectedAnnotationId
      );
      if (annotation) return annotation;
    }

    return null;
  });
};

/**
 * Select the currently selected label
 */
export const useSelectedLabel = () => {
  return useAppStore((state) =>
    state.labels.find(l => l.id === state.selectedLabelId) || null
  );
};

/**
 * Check if calibration is complete
 */
export const useIsCalibrated = () => {
  return useAppStore((state) => state.calibrationData.isCalibrated);
};

/**
 * Get total number of annotations across all pages
 */
export const useTotalAnnotationCount = () => {
  return useAppStore((state) => {
    let count = 0;
    for (const pageNum in state.annotations) {
      count += state.annotations[pageNum].length;
    }
    return count;
  });
};

/**
 * Get cost items grouped by category
 */
export const useCostsByCategory = () => {
  return useAppStore((state) => getCostByCategory(state.costItems));
};
