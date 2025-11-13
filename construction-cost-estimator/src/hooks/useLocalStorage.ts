/**
 * React Hooks for Local Storage
 *
 * Provides React hooks for managing local storage with:
 * - Automatic state synchronization
 * - Type safety
 * - Error handling
 * - Project-specific persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { Project } from '../store/useProjectStore';
import type { AnnotationData, CalibrationData } from '../types/store';
import type { CostItem } from '../types';
import type { AppSettings, UIState } from '../utils/localStorage';
import * as storage from '../utils/localStorage';

/**
 * Generic hook for localStorage with automatic sync
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        storage.setItem(key, valueToStore);
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Project-specific local storage hook
 * Provides convenience methods for persisting project data
 */
export function useProjectLocalStorage(projectId: string) {
  /**
   * Save project to localStorage
   */
  const saveProject = useCallback(
    (project: Project) => {
      const result = storage.saveProject(project);
      if (!result.success) {
        console.error('Failed to save project:', result.error);
      }
      return result.success;
    },
    []
  );

  /**
   * Load project from localStorage
   */
  const loadProject = useCallback(() => {
    return storage.loadProject(projectId);
  }, [projectId]);

  /**
   * Save annotations for the project
   */
  const saveAnnotations = useCallback(
    (annotations: AnnotationData[]) => {
      const result = storage.saveAnnotations(projectId, annotations);
      if (!result.success) {
        console.error('Failed to save annotations:', result.error);
      }
      return result.success;
    },
    [projectId]
  );

  /**
   * Load annotations for the project
   */
  const loadAnnotations = useCallback(() => {
    return storage.loadAnnotations(projectId);
  }, [projectId]);

  /**
   * Save calibration data for the project
   */
  const saveCalibration = useCallback(
    (calibration: CalibrationData) => {
      const result = storage.saveCalibration(projectId, calibration);
      if (!result.success) {
        console.error('Failed to save calibration:', result.error);
      }
      return result.success;
    },
    [projectId]
  );

  /**
   * Load calibration data for the project
   */
  const loadCalibration = useCallback(() => {
    return storage.loadCalibration(projectId);
  }, [projectId]);

  /**
   * Save cost items for the project
   */
  const saveCostItems = useCallback(
    (items: CostItem[]) => {
      const result = storage.saveCostItems(projectId, items);
      if (!result.success) {
        console.error('Failed to save cost items:', result.error);
      }
      return result.success;
    },
    [projectId]
  );

  /**
   * Load cost items for the project
   */
  const loadCostItems = useCallback(() => {
    return storage.loadCostItems(projectId);
  }, [projectId]);

  /**
   * Clear all data for the project
   */
  const clearProject = useCallback(() => {
    const result = storage.deleteProject(projectId);
    if (!result.success) {
      console.error('Failed to clear project:', result.error);
    }
    return result.success;
  }, [projectId]);

  return {
    saveProject,
    loadProject,
    saveAnnotations,
    loadAnnotations,
    saveCalibration,
    loadCalibration,
    saveCostItems,
    loadCostItems,
    clearProject,
  };
}

/**
 * Settings local storage hook
 * Manages application settings with persistence
 */
export function useSettingsLocalStorage() {
  const [settings, setSettings] = useState<AppSettings>(() => storage.loadSettings());

  /**
   * Update a single setting
   */
  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      storage.saveSettings(newSettings);
    },
    [settings]
  );

  /**
   * Update multiple settings at once
   */
  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      storage.saveSettings(newSettings);
    },
    [settings]
  );

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(() => {
    const defaultSettings = storage.loadSettings();
    setSettings(defaultSettings);
    storage.saveSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
  };
}

/**
 * UI state local storage hook
 * Manages UI state with persistence and debouncing
 */
export function useUIStateLocalStorage() {
  const [uiState, setUIState] = useState<UIState>(() => storage.loadUIState());
  const [saveTimeout, setSaveTimeout] = useState<number | null>(null);

  /**
   * Update UI state with debounced save
   */
  const updateUIState = useCallback(
    (updates: Partial<UIState>) => {
      const newState = { ...uiState, ...updates };
      setUIState(newState);

      // Debounce the save operation
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = window.setTimeout(() => {
        storage.saveUIState(newState);
      }, 300); // Save after 300ms of no changes

      setSaveTimeout(timeout);
    },
    [uiState, saveTimeout]
  );

  /**
   * Force immediate save
   */
  const forceSave = useCallback(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    storage.saveUIState(uiState);
  }, [uiState, saveTimeout]);

  /**
   * Reset UI state to defaults
   */
  const resetUIState = useCallback(() => {
    const defaultState = storage.loadUIState();
    setUIState(defaultState);
    storage.saveUIState(defaultState);
  }, []);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      storage.saveUIState(uiState);
    };
  }, [uiState, saveTimeout]);

  return {
    uiState,
    updateUIState,
    forceSave,
    resetUIState,
  };
}

/**
 * Storage stats hook
 * Provides real-time storage usage information
 */
export function useStorageStats() {
  const [stats, setStats] = useState({
    size: 0,
    quota: 0,
    usagePercent: 0,
    isAvailable: true,
  });

  const updateStats = useCallback(() => {
    setStats({
      size: storage.getStorageSize(),
      quota: storage.getStorageQuota(),
      usagePercent: storage.getStorageUsagePercent(),
      isAvailable: storage.isLocalStorageAvailable(),
    });
  }, []);

  useEffect(() => {
    updateStats();

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    ...stats,
    refresh: updateStats,
  };
}

/**
 * Auto-save hook
 * Automatically saves data at specified intervals
 */
export function useAutoSave<T>(
  key: string,
  data: T,
  interval: number = 1000,
  enabled: boolean = true
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const save = () => {
      setIsSaving(true);
      setError(null);

      const result = storage.setItem(key, data);

      if (result.success) {
        setLastSaved(new Date());
        storage.recordLastSync();
      } else {
        setError(result.error || 'Unknown error');
      }

      setIsSaving(false);
    };

    // Save immediately on first render
    save();

    // Then save at intervals
    const timer = setInterval(save, interval);

    return () => clearInterval(timer);
  }, [key, data, interval, enabled]);

  return {
    lastSaved,
    isSaving,
    error,
  };
}

/**
 * Projects list hook
 * Manages the list of all projects with automatic persistence
 */
export function useProjectsList() {
  const [projects, setProjects] = useState<Project[]>(() => storage.loadAllProjects());

  /**
   * Refresh projects from storage
   */
  const refresh = useCallback(() => {
    setProjects(storage.loadAllProjects());
  }, []);

  /**
   * Add a new project
   */
  const addProject = useCallback(
    (project: Project) => {
      const result = storage.saveProject(project);
      if (result.success) {
        refresh();
        return true;
      }
      console.error('Failed to add project:', result.error);
      return false;
    },
    [refresh]
  );

  /**
   * Update a project
   */
  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      const result = storage.updateProjectMetadata(id, updates);
      if (result.success) {
        refresh();
        return true;
      }
      console.error('Failed to update project:', result.error);
      return false;
    },
    [refresh]
  );

  /**
   * Delete a project
   */
  const deleteProject = useCallback(
    (id: string) => {
      const result = storage.deleteProject(id);
      if (result.success) {
        refresh();
        return true;
      }
      console.error('Failed to delete project:', result.error);
      return false;
    },
    [refresh]
  );

  /**
   * Clear old projects
   */
  const clearOldProjects = useCallback(
    (daysOld: number) => {
      const count = storage.clearOldProjects(daysOld);
      refresh();
      return count;
    },
    [refresh]
  );

  return {
    projects,
    refresh,
    addProject,
    updateProject,
    deleteProject,
    clearOldProjects,
  };
}
