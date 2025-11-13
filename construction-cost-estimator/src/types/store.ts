import type { Annotation, Label, CostItem } from './index';

/**
 * Calibration data for converting pixel measurements to real-world units
 */
export interface CalibrationData {
  /** Reference length in meters (e.g., a known measurement on the drawing) */
  referenceLength: number;

  /** Measured pixel distance corresponding to the reference length */
  pixelDistance: number;

  /** Computed conversion factor (referenceLength / pixelDistance) */
  metersPerPixel: number;

  /** Whether calibration has been set */
  isCalibrated: boolean;
}

/**
 * Extended annotation data with measurement information
 */
export interface AnnotationData extends Annotation {
  /** For line annotations: length in pixels */
  lineLength?: number;

  /** For polygon annotations: area in pixels */
  polygonArea?: number;

  /** Array of points for polygon/line annotations */
  points?: { x: number; y: number }[];

  /** Computed quantity in real-world units (meters, sqm, count) */
  quantity?: number;

  /** Unit of measurement */
  unit?: 'count' | 'linear_meters' | 'square_meters';
}

/**
 * Label definition for categorizing annotations
 */
export interface LabelDefinition extends Label {
  /** Unit type for this label */
  unit: 'count' | 'linear_meters' | 'square_meters';

  /** Optional cost per unit */
  costPerUnit?: number;

  /** Optional category for grouping */
  category?: string;
}

/**
 * Main application state
 */
export interface AppState {
  // ========== Project Information ==========
  /** Current project ID */
  currentProjectId: string;

  /** Current page number being viewed */
  currentPageNumber: number;

  // ========== Calibration Data ==========
  /** Calibration settings for pixel-to-meter conversion */
  calibrationData: CalibrationData;

  // ========== Annotations ==========
  /** Annotations organized by page number */
  annotations: Record<number, AnnotationData[]>;

  /** ID of currently selected annotation */
  selectedAnnotationId: string | null;

  // ========== Labels Library ==========
  /** Available label definitions */
  labels: LabelDefinition[];

  /** ID of currently selected label */
  selectedLabelId: string | null;

  // ========== Cost Items ==========
  /** Aggregated cost items computed from annotations */
  costItems: CostItem[];

  // ========== UI State ==========
  /** Currently active drawing/interaction tool */
  activeTool: 'select' | 'marker' | 'label' | 'line' | 'polygon' | 'calibrate' | null;

  /** Whether pan mode is enabled */
  isPanMode: boolean;

  /** Current zoom level (1.0 = 100%) */
  currentZoom: number;

  /** Current pan offset */
  currentPan: { x: number; y: number };

  // ========== Actions ==========
  // Calibration Actions
  setCalibrationData: (data: Partial<CalibrationData>) => void;
  computeCalibration: (referenceLength: number, pixelDistance: number) => void;
  resetCalibration: () => void;

  // Annotation Actions
  addAnnotation: (annotation: AnnotationData) => void;
  updateAnnotation: (id: string, updates: Partial<AnnotationData>) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  clearAnnotations: (pageNumber?: number) => void;
  getAnnotationsByPage: (pageNumber: number) => AnnotationData[];

  // Label Actions
  addLabel: (label: LabelDefinition) => void;
  updateLabel: (id: string, updates: Partial<LabelDefinition>) => void;
  deleteLabel: (id: string) => void;
  selectLabel: (id: string | null) => void;
  addPredefinedLabels: (labels: LabelDefinition[]) => void;

  // Cost Item Actions
  calculateCostItems: () => void;
  updateCostItem: (id: string, updates: Partial<CostItem>) => void;
  getTotalCost: () => number;
  getCostByCategory: () => Record<string, number>;

  // UI Actions
  setActiveTool: (tool: AppState['activeTool']) => void;
  setPanMode: (enabled: boolean) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setCurrentPage: (pageNumber: number) => void;

  // Project Actions
  setCurrentProjectId: (projectId: string) => void;
  resetState: () => void;
}
