import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AnnotationData, CalibrationData } from '../types/store';
import type { CostItem } from '../types';

/**
 * Extended Project interface with all metadata
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  pdfFileName: string;
  pdfFileSize: number;
  pdfUrl: string; // Base64 encoded or URL
  totalPages: number;
  thumbnail?: string; // Base64 preview of first page
  annotations: Record<number, AnnotationData[]>;
  calibrationData: CalibrationData;
  costItems: CostItem[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

/**
 * Project Store State
 */
interface ProjectStoreState {
  // ========== State ==========
  projects: Project[];
  currentProjectId: string | null;
  searchQuery: string;
  sortBy: 'name' | 'date' | 'cost';
  filterStatus: 'all' | 'recent' | 'archived';

  // ========== Computed ==========
  currentProject: Project | null;

  // ========== Actions ==========
  // Project CRUD
  createProject: (name: string, pdfFile: File, pdfUrl: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Promise<Project | null>;

  // Project Navigation
  openProject: (id: string) => void;
  closeProject: () => void;

  // Query & Filter
  getRecentProjects: (limit?: number) => Project[];
  searchProjects: (query: string) => Project[];
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'name' | 'date' | 'cost') => void;
  setFilterStatus: (status: 'all' | 'recent' | 'archived') => void;

  // PDF Processing
  extractPDFMetadata: (file: File) => Promise<{
    totalPages: number;
    thumbnail: string;
  }>;
}

/**
 * Generate unique project ID
 */
function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract PDF metadata and thumbnail using PDF.js
 */
async function extractPDFMetadata(file: File): Promise<{
  totalPages: number;
  thumbnail: string;
}> {
  try {
    // Dynamically import PDF.js
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const totalPages = pdf.numPages;

    // Render first page as thumbnail
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page to canvas
    await page.render({
      canvas: canvas,
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert canvas to base64
    const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

    return { totalPages, thumbnail };
  } catch (error) {
    console.error('Failed to extract PDF metadata:', error);
    return {
      totalPages: 1,
      thumbnail: '',
    };
  }
}

/**
 * Initial calibration data
 */
const initialCalibrationData: CalibrationData = {
  referenceLength: 0,
  pixelDistance: 0,
  metersPerPixel: 0,
  isCalibrated: false,
};

/**
 * Project Store
 */
export const useProjectStore = create<ProjectStoreState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // ========== Initial State ==========
        projects: [],
        currentProjectId: null,
        searchQuery: '',
        sortBy: 'date',
        filterStatus: 'all',

        // ========== Computed State ==========
        get currentProject() {
          const { projects, currentProjectId } = get();
          return projects.find(p => p.id === currentProjectId) || null;
        },

        // ========== Project CRUD ==========

        /**
         * Create a new project with PDF upload
         */
        createProject: async (name: string, pdfFile: File, pdfUrl: string): Promise<Project> => {
          // Extract PDF metadata
          const { totalPages, thumbnail } = await extractPDFMetadata(pdfFile);

          const newProject: Project = {
            id: generateProjectId(),
            name,
            description: '',
            pdfFileName: pdfFile.name,
            pdfFileSize: pdfFile.size,
            pdfUrl,
            totalPages,
            thumbnail,
            annotations: {},
            calibrationData: initialCalibrationData,
            costItems: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastAccessedAt: new Date(),
          };

          set((state) => {
            state.projects.unshift(newProject);
          });

          return newProject;
        },

        /**
         * Update an existing project
         */
        updateProject: (id: string, updates: Partial<Project>) => {
          set((state) => {
            const index = state.projects.findIndex(p => p.id === id);
            if (index !== -1) {
              state.projects[index] = {
                ...state.projects[index],
                ...updates,
                updatedAt: new Date(),
              };
            }
          });
        },

        /**
         * Delete a project
         */
        deleteProject: (id: string) => {
          set((state) => {
            state.projects = state.projects.filter(p => p.id !== id);

            // Close project if it was the current one
            if (state.currentProjectId === id) {
              state.currentProjectId = null;
            }
          });
        },

        /**
         * Duplicate an existing project
         */
        duplicateProject: async (id: string): Promise<Project | null> => {
          const project = get().projects.find(p => p.id === id);
          if (!project) return null;

          const duplicatedProject: Project = {
            ...project,
            id: generateProjectId(),
            name: `${project.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastAccessedAt: new Date(),
          };

          set((state) => {
            state.projects.unshift(duplicatedProject);
          });

          return duplicatedProject;
        },

        // ========== Project Navigation ==========

        /**
         * Open a project for editing
         */
        openProject: (id: string) => {
          set((state) => {
            state.currentProjectId = id;

            // Update last accessed time
            const index = state.projects.findIndex(p => p.id === id);
            if (index !== -1) {
              state.projects[index].lastAccessedAt = new Date();
            }
          });
        },

        /**
         * Close the current project
         */
        closeProject: () => {
          set((state) => {
            state.currentProjectId = null;
          });
        },

        // ========== Query & Filter ==========

        /**
         * Get recent projects
         */
        getRecentProjects: (limit: number = 5): Project[] => {
          const projects = get().projects;
          return [...projects]
            .sort((a, b) => {
              const aTime = a.lastAccessedAt || a.updatedAt;
              const bTime = b.lastAccessedAt || b.updatedAt;
              return bTime.getTime() - aTime.getTime();
            })
            .slice(0, limit);
        },

        /**
         * Search projects by name or description
         */
        searchProjects: (query: string): Project[] => {
          const projects = get().projects;
          const lowerQuery = query.toLowerCase();

          return projects.filter(project =>
            project.name.toLowerCase().includes(lowerQuery) ||
            (project.description && project.description.toLowerCase().includes(lowerQuery)) ||
            project.pdfFileName.toLowerCase().includes(lowerQuery)
          );
        },

        /**
         * Set search query
         */
        setSearchQuery: (query: string) => {
          set((state) => {
            state.searchQuery = query;
          });
        },

        /**
         * Set sort order
         */
        setSortBy: (sortBy: 'name' | 'date' | 'cost') => {
          set((state) => {
            state.sortBy = sortBy;
          });
        },

        /**
         * Set filter status
         */
        setFilterStatus: (status: 'all' | 'recent' | 'archived') => {
          set((state) => {
            state.filterStatus = status;
          });
        },

        /**
         * Extract PDF metadata (exposed for external use)
         */
        extractPDFMetadata: extractPDFMetadata,
      })),
      {
        name: 'construction-cost-estimator-projects',
        // Only persist projects data
        partialize: (state) => ({
          projects: state.projects,
          currentProjectId: state.currentProjectId,
        }),
      }
    ),
    { name: 'ProjectStore' }
  )
);

// ========== Selectors ==========

/**
 * Get all projects sorted by current sort order
 */
export const useSortedProjects = () => {
  return useProjectStore((state) => {
    const projects = [...state.projects];

    switch (state.sortBy) {
      case 'name':
        return projects.sort((a, b) => a.name.localeCompare(b.name));
      case 'date':
        return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      case 'cost':
        return projects.sort((a, b) => {
          const aCost = a.costItems.reduce((sum, item) => sum + item.totalCost, 0);
          const bCost = b.costItems.reduce((sum, item) => sum + item.totalCost, 0);
          return bCost - aCost;
        });
      default:
        return projects;
    }
  });
};

/**
 * Get filtered projects based on current filters
 */
export const useFilteredProjects = () => {
  return useProjectStore((state) => {
    let projects = useSortedProjects();

    // Apply search filter
    if (state.searchQuery) {
      projects = state.searchProjects(state.searchQuery);
    }

    // Apply status filter
    if (state.filterStatus === 'recent') {
      projects = state.getRecentProjects(10);
    }

    return projects;
  });
};

/**
 * Get project statistics
 */
export const useProjectStats = (projectId: string) => {
  return useProjectStore((state) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return null;

    const totalAnnotations = Object.values(project.annotations).reduce(
      (sum, annotations) => sum + annotations.length,
      0
    );

    const totalCost = project.costItems.reduce(
      (sum, item) => sum + item.totalCost,
      0
    );

    return {
      totalPages: project.totalPages,
      totalAnnotations,
      totalCost,
      isCalibrated: project.calibrationData.isCalibrated,
    };
  });
};
