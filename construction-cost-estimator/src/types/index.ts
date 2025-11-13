// PDF Page representation
export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  imageData?: string; // Base64 encoded image data
}

// Annotation types for marking up PDF pages
export interface Annotation {
  id: string;
  pageNumber: number;
  type: 'rectangle' | 'highlight' | 'text' | 'arrow' | 'marker' | 'label' | 'line' | 'polygon';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  labelId?: string; // Associated label if categorized
  notes?: string;
  text?: string; // Text content for labels and measurements
  createdAt: Date;
  updatedAt: Date;
}

// Label/Category for organizing annotations
export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  icon?: string;
  createdAt: Date;
}

// Cost item extracted from the PDF
export interface CostItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  category?: string;
  labelId?: string; // Associated label
  annotationId?: string; // Associated annotation
  pageNumber: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project metadata
export interface Project {
  id: string;
  name: string;
  description?: string;
  pdfFileName: string;
  pdfFileSize: number;
  totalPages: number;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export store types for convenience
export type {
  CalibrationData,
  AnnotationData,
  LabelDefinition,
  AppState,
} from './store';
