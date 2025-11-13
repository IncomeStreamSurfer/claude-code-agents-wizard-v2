/**
 * Persistence Service
 *
 * High-level service for managing data persistence with:
 * - Auto-save functionality
 * - Data validation
 * - Error recovery
 * - Storage optimization
 * - Migration support
 */

import type { Project } from '../store/useProjectStore';
import type { AnnotationData, CalibrationData } from '../types/store';
import type { CostItem } from '../types';
import * as storage from '../utils/localStorage';

/**
 * Auto-save configuration
 */
interface AutoSaveConfig {
  enabled: boolean;
  interval: number;
  projectId: string;
}

/**
 * Persistence Service Class
 */
export class PersistenceService {
  private autoSaveTimer: number | null = null;
  private autoSaveConfig: AutoSaveConfig | null = null;
  private lastSaveTime: Date | null = null;
  private isSaving: boolean = false;

  /**
   * Enable auto-save for a project
   */
  enableAutoSave(projectId: string, interval: number = 1000): void {
    // Disable existing auto-save if any
    this.disableAutoSave();

    this.autoSaveConfig = {
      enabled: true,
      interval,
      projectId,
    };

    // Start auto-save timer
    this.autoSaveTimer = window.setInterval(() => {
      if (!this.isSaving) {
        this.performAutoSave();
      }
    }, interval);

    console.log(`Auto-save enabled for project ${projectId} with ${interval}ms interval`);
  }

  /**
   * Disable auto-save
   */
  disableAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    this.autoSaveConfig = null;
    console.log('Auto-save disabled');
  }

  /**
   * Perform auto-save operation
   */
  private performAutoSave(): void {
    if (!this.autoSaveConfig) return;

    this.isSaving = true;

    try {
      // Record the save time
      storage.recordLastSync();
      this.lastSaveTime = new Date();

      console.log(`Auto-save completed at ${this.lastSaveTime.toISOString()}`);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Force an immediate sync
   */
  async forceSync(): Promise<void> {
    if (this.isSaving) {
      console.warn('Already saving, skipping force sync');
      return;
    }

    this.performAutoSave();
  }

  /**
   * Get last save time
   */
  getLastSaveTime(): Date | null {
    return this.lastSaveTime || storage.getLastSync();
  }

  /**
   * Check if currently saving
   */
  getIsSaving(): boolean {
    return this.isSaving;
  }

  /**
   * Data validation methods
   */

  /**
   * Validate project data structure
   */
  validateProjectData(project: Project): boolean {
    try {
      // Check required fields
      if (!project.id || typeof project.id !== 'string') {
        console.error('Invalid project ID');
        return false;
      }

      if (!project.name || typeof project.name !== 'string') {
        console.error('Invalid project name');
        return false;
      }

      if (!project.pdfUrl || typeof project.pdfUrl !== 'string') {
        console.error('Invalid PDF URL');
        return false;
      }

      if (typeof project.totalPages !== 'number' || project.totalPages < 1) {
        console.error('Invalid total pages');
        return false;
      }

      // Validate dates
      if (!(project.createdAt instanceof Date) && !Date.parse(project.createdAt as any)) {
        console.error('Invalid createdAt date');
        return false;
      }

      if (!(project.updatedAt instanceof Date) && !Date.parse(project.updatedAt as any)) {
        console.error('Invalid updatedAt date');
        return false;
      }

      // Validate annotations structure
      if (project.annotations && typeof project.annotations !== 'object') {
        console.error('Invalid annotations structure');
        return false;
      }

      // Validate calibration data
      if (project.calibrationData) {
        if (!this.validateCalibrationData(project.calibrationData)) {
          console.error('Invalid calibration data');
          return false;
        }
      }

      // Validate cost items
      if (project.costItems) {
        if (!Array.isArray(project.costItems)) {
          console.error('Invalid cost items structure');
          return false;
        }

        for (const item of project.costItems) {
          if (!this.validateCostItem(item)) {
            console.error('Invalid cost item:', item);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating project data:', error);
      return false;
    }
  }

  /**
   * Validate annotations array
   */
  validateAnnotations(annotations: AnnotationData[]): boolean {
    try {
      if (!Array.isArray(annotations)) {
        console.error('Annotations must be an array');
        return false;
      }

      for (const annotation of annotations) {
        if (!annotation.id || typeof annotation.id !== 'string') {
          console.error('Invalid annotation ID');
          return false;
        }

        if (typeof annotation.pageNumber !== 'number' || annotation.pageNumber < 1) {
          console.error('Invalid annotation page number');
          return false;
        }

        if (!annotation.type) {
          console.error('Invalid annotation type');
          return false;
        }

        if (typeof annotation.x !== 'number' || typeof annotation.y !== 'number') {
          console.error('Invalid annotation coordinates');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating annotations:', error);
      return false;
    }
  }

  /**
   * Validate calibration data
   */
  private validateCalibrationData(calibration: CalibrationData): boolean {
    if (typeof calibration.referenceLength !== 'number') return false;
    if (typeof calibration.pixelDistance !== 'number') return false;
    if (typeof calibration.metersPerPixel !== 'number') return false;
    if (typeof calibration.isCalibrated !== 'boolean') return false;

    return true;
  }

  /**
   * Validate cost item
   */
  private validateCostItem(item: CostItem): boolean {
    if (!item.id || typeof item.id !== 'string') return false;
    if (!item.description || typeof item.description !== 'string') return false;
    if (typeof item.quantity !== 'number') return false;
    if (typeof item.unitCost !== 'number') return false;
    if (typeof item.totalCost !== 'number') return false;

    return true;
  }

  /**
   * Recovery methods
   */

  /**
   * Check if there's corrupted data in storage
   */
  hasCorruptedData(): boolean {
    try {
      const projects = storage.loadAllProjects();

      for (const project of projects) {
        if (!this.validateProjectData(project)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking for corrupted data:', error);
      return true;
    }
  }

  /**
   * Attempt to recover corrupted data
   */
  recoverCorruptedData(): boolean {
    try {
      console.log('Attempting to recover corrupted data...');

      const projects = storage.loadAllProjects();
      const validProjects: Project[] = [];

      for (const project of projects) {
        if (this.validateProjectData(project)) {
          validProjects.push(project);
        } else {
          console.warn(`Skipping corrupted project: ${project.id}`);
        }
      }

      // Save only valid projects
      storage.setItem(storage.STORAGE_KEYS.PROJECTS, validProjects);

      // Compress storage to remove orphaned data
      storage.compressStorage();

      console.log(`Recovery complete. Recovered ${validProjects.length} valid projects.`);
      return true;
    } catch (error) {
      console.error('Failed to recover corrupted data:', error);
      return false;
    }
  }

  /**
   * Restore to last good state (clear and reimport)
   */
  restoreLastGoodState(): void {
    try {
      console.log('Restoring to last good state...');

      // This would ideally restore from a backup
      // For now, we'll just clear corrupted data
      this.recoverCorruptedData();

      console.log('Restore complete');
    } catch (error) {
      console.error('Failed to restore last good state:', error);
    }
  }

  /**
   * Migration methods
   */

  /**
   * Migrate from version 1 to version 2
   * (Placeholder for future migrations)
   */
  migrateV1ToV2(): void {
    console.log('Migrating storage from v1 to v2...');

    // Example migration logic
    try {
      const projects = storage.loadAllProjects();

      // Apply migration transformations here
      // For example, add new fields, rename fields, etc.

      projects.forEach(project => {
        // Migration logic here
        storage.saveProject(project);
      });

      storage.setStorageVersion(2);
      console.log('Migration to v2 complete');
    } catch (error) {
      console.error('Migration to v2 failed:', error);
    }
  }

  /**
   * Migrate from version 2 to version 3
   * (Placeholder for future migrations)
   */
  migrateV2ToV3(): void {
    console.log('Migrating storage from v2 to v3...');

    try {
      // Migration logic here
      storage.setStorageVersion(3);
      console.log('Migration to v3 complete');
    } catch (error) {
      console.error('Migration to v3 failed:', error);
    }
  }

  /**
   * Run all necessary migrations
   */
  runMigrations(): void {
    const currentVersion = storage.getStorageVersion();
    console.log(`Current storage version: ${currentVersion}`);

    if (currentVersion < 2) {
      this.migrateV1ToV2();
    }

    if (currentVersion < 3) {
      this.migrateV2ToV3();
    }

    console.log('All migrations complete');
  }

  /**
   * Cleanup methods
   */

  /**
   * Remove unused data from storage
   */
  removeUnusedData(): void {
    try {
      console.log('Removing unused data...');

      // Compress storage (removes orphaned data)
      storage.compressStorage();

      // Clear old projects (older than 90 days)
      const cleared = storage.clearOldProjects(90);
      console.log(`Cleared ${cleared} old projects`);

      console.log('Cleanup complete');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Optimize storage by compressing and removing duplicates
   */
  optimizeStorage(): void {
    try {
      console.log('Optimizing storage...');

      // Compress storage
      storage.compressStorage();

      // Could add more optimization logic here:
      // - Deduplicate annotations
      // - Compress PDF thumbnails
      // - Remove unused labels

      console.log('Storage optimization complete');
    } catch (error) {
      console.error('Storage optimization failed:', error);
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    return {
      size: storage.getStorageSize(),
      quota: storage.getStorageQuota(),
      usagePercent: storage.getStorageUsagePercent(),
      isAvailable: storage.isLocalStorageAvailable(),
      lastSync: storage.getLastSync(),
      version: storage.getStorageVersion(),
    };
  }

  /**
   * Export and import methods
   */

  /**
   * Create a backup of all data
   */
  async createBackup(): Promise<void> {
    try {
      await storage.backupToFile();
      console.log('Backup created successfully');
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Restore from a backup file
   */
  async restoreFromBackup(file: File): Promise<void> {
    try {
      const result = await storage.restoreFromFile(file);

      if (!result.success) {
        throw new Error(result.error || 'Failed to restore backup');
      }

      console.log('Backup restored successfully');
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const persistenceService = new PersistenceService();
