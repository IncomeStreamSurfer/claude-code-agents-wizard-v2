/**
 * Local Storage Utilities for Construction Cost Estimator
 *
 * Provides comprehensive persistence functionality including:
 * - Generic storage operations
 * - Project data persistence
 * - Annotation persistence
 * - Calibration persistence
 * - Cost items persistence
 * - Settings and UI state persistence
 * - Storage management and optimization
 * - Import/Export functionality
 * - Versioning and migration support
 */

import type { Project } from '../store/useProjectStore';
import type { AnnotationData, CalibrationData } from '../types/store';
import type { CostItem } from '../types';

/**
 * Storage keys for all persisted data
 */
export const STORAGE_KEYS = {
  PROJECTS: 'ce_projects',
  CURRENT_PROJECT: 'ce_current_project',
  ANNOTATIONS: 'ce_annotations',
  CALIBRATION: 'ce_calibration',
  COST_ITEMS: 'ce_cost_items',
  UI_STATE: 'ce_ui_state',
  SETTINGS: 'ce_settings',
  SYNC_QUEUE: 'ce_sync_queue',
  VERSION: 'ce_version',
  LAST_SYNC: 'ce_last_sync',
} as const;

/**
 * Current storage version for migration purposes
 */
export const STORAGE_VERSION = 1;

/**
 * Application settings interface
 */
export interface AppSettings {
  currency: string;
  decimals: number;
  autoSaveInterval: number;
  darkMode: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  defaultZoom: number;
  language: string;
  dateFormat: string;
  backupEnabled: boolean;
  backupInterval: number;
}

/**
 * UI state interface
 */
export interface UIState {
  currentZoom: number;
  currentPan: { x: number; y: number };
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  activeTab: string;
  recentColors: string[];
}

/**
 * Storage result wrapper
 */
interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  decimals: 2,
  autoSaveInterval: 1000,
  darkMode: false,
  showGrid: false,
  snapToGrid: false,
  gridSize: 10,
  defaultZoom: 1.0,
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  backupEnabled: false,
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Default UI state
 */
const DEFAULT_UI_STATE: UIState = {
  currentZoom: 1.0,
  currentPan: { x: 0, y: 0 },
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  leftSidebarWidth: 280,
  rightSidebarWidth: 320,
  activeTab: 'annotations',
  recentColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
};

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generic storage operations
 */

/**
 * Set an item in localStorage with error handling
 */
export function setItem<T>(key: string, data: T): StorageResult<T> {
  try {
    if (!isLocalStorageAvailable()) {
      return { success: false, error: 'localStorage not available' };
    }

    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);

    return { success: true, data };
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      return { success: false, error: 'Storage quota exceeded' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get an item from localStorage with error handling
 */
export function getItem<T>(key: string, defaultValue?: T): T | null {
  try {
    if (!isLocalStorageAvailable()) {
      return defaultValue || null;
    }

    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue || null;
    }

    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return defaultValue || null;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeItem(key: string): StorageResult<void> {
  try {
    if (!isLocalStorageAvailable()) {
      return { success: false, error: 'localStorage not available' };
    }

    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Clear all application data from localStorage
 */
export function clearAll(): StorageResult<void> {
  try {
    if (!isLocalStorageAvailable()) {
      return { success: false, error: 'localStorage not available' };
    }

    // Remove all keys that start with 'ce_'
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Project persistence functions
 */

/**
 * Save a single project
 */
export function saveProject(project: Project): StorageResult<Project> {
  const projects = loadAllProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);

  const updatedProject = existingIndex >= 0
    ? { ...project, updatedAt: new Date() }
    : { ...project, createdAt: new Date(), updatedAt: new Date() };

  if (existingIndex >= 0) {
    projects[existingIndex] = updatedProject;
  } else {
    projects.push(updatedProject);
  }

  const result = setItem(STORAGE_KEYS.PROJECTS, projects);
  return result.success
    ? { success: true, data: updatedProject }
    : { success: false, error: result.error };
}

/**
 * Load a single project by ID
 */
export function loadProject(id: string): Project | null {
  const projects = loadAllProjects();
  return projects.find(p => p.id === id) || null;
}

/**
 * Load all projects
 */
export function loadAllProjects(): Project[] {
  const projects = getItem<Project[]>(STORAGE_KEYS.PROJECTS, []);

  // Parse dates back into Date objects
  return (projects || []).map(project => ({
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
    lastAccessedAt: project.lastAccessedAt ? new Date(project.lastAccessedAt) : undefined,
  }));
}

/**
 * Delete a project
 */
export function deleteProject(id: string): StorageResult<void> {
  const projects = loadAllProjects();
  const filtered = projects.filter(p => p.id !== id);

  // Also delete associated data
  removeAnnotations(id);
  removeCalibration(id);
  removeCostItems(id);

  const result = setItem(STORAGE_KEYS.PROJECTS, filtered);
  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}

/**
 * Update project metadata only (without full data)
 */
export function updateProjectMetadata(id: string, updates: Partial<Project>): StorageResult<Project> {
  const project = loadProject(id);
  if (!project) {
    return { success: false, error: 'Project not found' };
  }

  const updated = {
    ...project,
    ...updates,
    updatedAt: new Date(),
  };

  return saveProject(updated);
}

/**
 * Annotation persistence functions
 */

/**
 * Save annotations for a project
 */
export function saveAnnotations(projectId: string, annotations: AnnotationData[]): StorageResult<AnnotationData[]> {
  const allAnnotations = getItem<Record<string, AnnotationData[]>>(STORAGE_KEYS.ANNOTATIONS, {}) || {};
  allAnnotations[projectId] = annotations;
  const result = setItem(STORAGE_KEYS.ANNOTATIONS, allAnnotations);
  return result.success
    ? { success: true, data: annotations }
    : { success: false, error: result.error };
}

/**
 * Load annotations for a project
 */
export function loadAnnotations(projectId: string): AnnotationData[] {
  const allAnnotations = getItem<Record<string, AnnotationData[]>>(STORAGE_KEYS.ANNOTATIONS, {}) || {};
  const annotations = allAnnotations[projectId] || [];

  // Parse dates back into Date objects
  return annotations.map(annotation => ({
    ...annotation,
    createdAt: new Date(annotation.createdAt),
    updatedAt: new Date(annotation.updatedAt),
  }));
}

/**
 * Append a single annotation to a project
 */
export function appendAnnotation(projectId: string, annotation: AnnotationData): StorageResult<AnnotationData> {
  const annotations = loadAnnotations(projectId);
  annotations.push(annotation);
  const result = saveAnnotations(projectId, annotations);
  return result.success
    ? { success: true, data: annotation }
    : { success: false, error: result.error };
}

/**
 * Remove annotations for a project
 */
function removeAnnotations(projectId: string): void {
  const allAnnotations = getItem<Record<string, AnnotationData[]>>(STORAGE_KEYS.ANNOTATIONS, {}) || {};
  delete allAnnotations[projectId];
  setItem(STORAGE_KEYS.ANNOTATIONS, allAnnotations);
}

/**
 * Calibration persistence functions
 */

/**
 * Save calibration data for a project
 */
export function saveCalibration(projectId: string, calibration: CalibrationData): StorageResult<CalibrationData> {
  const allCalibrations = getItem<Record<string, CalibrationData>>(STORAGE_KEYS.CALIBRATION, {}) || {};
  allCalibrations[projectId] = calibration;
  const result = setItem(STORAGE_KEYS.CALIBRATION, allCalibrations);
  return result.success
    ? { success: true, data: calibration }
    : { success: false, error: result.error };
}

/**
 * Load calibration data for a project
 */
export function loadCalibration(projectId: string): CalibrationData | null {
  const allCalibrations = getItem<Record<string, CalibrationData>>(STORAGE_KEYS.CALIBRATION, {}) || {};
  return allCalibrations[projectId] || null;
}

/**
 * Remove calibration for a project
 */
function removeCalibration(projectId: string): void {
  const allCalibrations = getItem<Record<string, CalibrationData>>(STORAGE_KEYS.CALIBRATION, {}) || {};
  delete allCalibrations[projectId];
  setItem(STORAGE_KEYS.CALIBRATION, allCalibrations);
}

/**
 * Cost items persistence functions
 */

/**
 * Save cost items for a project
 */
export function saveCostItems(projectId: string, costs: CostItem[]): StorageResult<CostItem[]> {
  const allCosts = getItem<Record<string, CostItem[]>>(STORAGE_KEYS.COST_ITEMS, {}) || {};
  allCosts[projectId] = costs;
  const result = setItem(STORAGE_KEYS.COST_ITEMS, allCosts);
  return result.success
    ? { success: true, data: costs }
    : { success: false, error: result.error };
}

/**
 * Load cost items for a project
 */
export function loadCostItems(projectId: string): CostItem[] {
  const allCosts = getItem<Record<string, CostItem[]>>(STORAGE_KEYS.COST_ITEMS, {}) || {};
  const costs = allCosts[projectId] || [];

  // Parse dates back into Date objects
  return costs.map(cost => ({
    ...cost,
    createdAt: new Date(cost.createdAt),
    updatedAt: new Date(cost.updatedAt),
  }));
}

/**
 * Remove cost items for a project
 */
function removeCostItems(projectId: string): void {
  const allCosts = getItem<Record<string, CostItem[]>>(STORAGE_KEYS.COST_ITEMS, {}) || {};
  delete allCosts[projectId];
  setItem(STORAGE_KEYS.COST_ITEMS, allCosts);
}

/**
 * Settings persistence functions
 */

/**
 * Save application settings
 */
export function saveSettings(settings: AppSettings): StorageResult<AppSettings> {
  return setItem(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Load application settings
 */
export function loadSettings(): AppSettings {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS) || DEFAULT_SETTINGS;
}

/**
 * UI state persistence functions
 */

/**
 * Save UI state
 */
export function saveUIState(state: UIState): StorageResult<UIState> {
  return setItem(STORAGE_KEYS.UI_STATE, state);
}

/**
 * Load UI state
 */
export function loadUIState(): UIState {
  return getItem<UIState>(STORAGE_KEYS.UI_STATE, DEFAULT_UI_STATE) || DEFAULT_UI_STATE;
}

/**
 * Storage management functions
 */

/**
 * Get current storage size in bytes
 */
export function getStorageSize(): number {
  if (!isLocalStorageAvailable()) return 0;

  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ce_')) {
      const value = localStorage.getItem(key);
      if (value) {
        // Approximate size: key + value in UTF-16 (2 bytes per char)
        total += (key.length + value.length) * 2;
      }
    }
  }
  return total;
}

/**
 * Get storage quota (estimated, browsers typically allow 5-10MB)
 */
export function getStorageQuota(): number {
  // Most browsers allow 5-10MB, we'll estimate 5MB conservatively
  return 5 * 1024 * 1024; // 5MB in bytes
}

/**
 * Get storage usage as percentage
 */
export function getStorageUsagePercent(): number {
  const size = getStorageSize();
  const quota = getStorageQuota();
  return Math.round((size / quota) * 100);
}

/**
 * Clear old projects older than specified days
 * @returns Number of projects deleted
 */
export function clearOldProjects(daysOld: number): number {
  const projects = loadAllProjects();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const oldProjects = projects.filter(p => {
    const lastAccessed = p.lastAccessedAt || p.updatedAt;
    return lastAccessed < cutoffDate;
  });

  oldProjects.forEach(p => deleteProject(p.id));

  return oldProjects.length;
}

/**
 * Compress storage by removing redundant data
 */
export function compressStorage(): StorageResult<void> {
  try {
    // Remove projects without PDF data (corrupted)
    const projects = loadAllProjects();
    const validProjects = projects.filter(p => p.pdfUrl && p.pdfUrl.length > 0);

    if (validProjects.length < projects.length) {
      setItem(STORAGE_KEYS.PROJECTS, validProjects);
    }

    // Remove orphaned annotations (no matching project)
    const projectIds = new Set(validProjects.map(p => p.id));
    const allAnnotations = getItem<Record<string, AnnotationData[]>>(STORAGE_KEYS.ANNOTATIONS, {}) || {};

    Object.keys(allAnnotations).forEach(projectId => {
      if (!projectIds.has(projectId)) {
        delete allAnnotations[projectId];
      }
    });
    setItem(STORAGE_KEYS.ANNOTATIONS, allAnnotations);

    // Remove orphaned calibrations
    const allCalibrations = getItem<Record<string, CalibrationData>>(STORAGE_KEYS.CALIBRATION, {}) || {};
    Object.keys(allCalibrations).forEach(projectId => {
      if (!projectIds.has(projectId)) {
        delete allCalibrations[projectId];
      }
    });
    setItem(STORAGE_KEYS.CALIBRATION, allCalibrations);

    // Remove orphaned cost items
    const allCosts = getItem<Record<string, CostItem[]>>(STORAGE_KEYS.COST_ITEMS, {}) || {};
    Object.keys(allCosts).forEach(projectId => {
      if (!projectIds.has(projectId)) {
        delete allCosts[projectId];
      }
    });
    setItem(STORAGE_KEYS.COST_ITEMS, allCosts);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Sync and backup functions
 */

/**
 * Export all data as JSON string
 */
export function exportAllData(): string {
  const data = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    projects: loadAllProjects(),
    annotations: getItem<Record<string, AnnotationData[]>>(STORAGE_KEYS.ANNOTATIONS, {}),
    calibrations: getItem<Record<string, CalibrationData>>(STORAGE_KEYS.CALIBRATION, {}),
    costItems: getItem<Record<string, CostItem[]>>(STORAGE_KEYS.COST_ITEMS, {}),
    settings: loadSettings(),
    uiState: loadUIState(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import all data from JSON string
 */
export function importAllData(jsonString: string): StorageResult<void> {
  try {
    const data = JSON.parse(jsonString);

    // Validate data structure
    if (!data.version || !data.projects) {
      return { success: false, error: 'Invalid data format' };
    }

    // Clear existing data
    clearAll();

    // Import data
    if (data.projects) setItem(STORAGE_KEYS.PROJECTS, data.projects);
    if (data.annotations) setItem(STORAGE_KEYS.ANNOTATIONS, data.annotations);
    if (data.calibrations) setItem(STORAGE_KEYS.CALIBRATION, data.calibrations);
    if (data.costItems) setItem(STORAGE_KEYS.COST_ITEMS, data.costItems);
    if (data.settings) setItem(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.uiState) setItem(STORAGE_KEYS.UI_STATE, data.uiState);

    setItem(STORAGE_KEYS.VERSION, data.version);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Backup all data to a downloadable file
 */
export async function backupToFile(): Promise<void> {
  const jsonString = exportAllData();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `construction-estimator-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restore data from a file
 */
export async function restoreFromFile(file: File): Promise<StorageResult<void>> {
  try {
    const text = await file.text();
    return importAllData(text);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Versioning functions
 */

/**
 * Get current storage version
 */
export function getStorageVersion(): number {
  return getItem<number>(STORAGE_KEYS.VERSION, STORAGE_VERSION) || STORAGE_VERSION;
}

/**
 * Set storage version
 */
export function setStorageVersion(version: number): StorageResult<number> {
  return setItem(STORAGE_KEYS.VERSION, version);
}

/**
 * Record last sync timestamp
 */
export function recordLastSync(): void {
  setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

/**
 * Get last sync timestamp
 */
export function getLastSync(): Date | null {
  const lastSync = getItem<string>(STORAGE_KEYS.LAST_SYNC);
  return lastSync ? new Date(lastSync) : null;
}
