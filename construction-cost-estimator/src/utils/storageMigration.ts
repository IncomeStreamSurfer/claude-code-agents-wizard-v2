/**
 * Storage Migration Utilities
 *
 * Handles version migrations for local storage data structures.
 * Each migration transforms data from one version to the next.
 */

import * as storage from './localStorage';

/**
 * Migration result
 */
interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  error?: string;
}

/**
 * Migration function type
 */
type MigrationFn = () => Promise<void> | void;

/**
 * Available migrations mapped by version transition
 */
const migrations: Record<string, MigrationFn> = {
  '1-2': migrateV1toV2,
  '2-3': migrateV2toV3,
  '3-4': migrateV3toV4,
};

/**
 * Get migration path from one version to another
 */
function getMigrationPath(fromVersion: number, toVersion: number): string[] {
  const path: string[] = [];

  for (let v = fromVersion; v < toVersion; v++) {
    const key = `${v}-${v + 1}`;
    if (migrations[key]) {
      path.push(key);
    } else {
      throw new Error(`No migration path from v${v} to v${v + 1}`);
    }
  }

  return path;
}

/**
 * Migrate storage from one version to another
 */
export async function migrateStorage(
  fromVersion: number,
  toVersion: number
): Promise<MigrationResult> {
  try {
    console.log(`Starting migration from v${fromVersion} to v${toVersion}`);

    // Get migration path
    const path = getMigrationPath(fromVersion, toVersion);

    // Execute each migration in sequence
    for (const migrationKey of path) {
      const migration = migrations[migrationKey];
      console.log(`Executing migration: ${migrationKey}`);

      await migration();

      // Update version after each successful migration
      const [, newVersion] = migrationKey.split('-').map(Number);
      storage.setStorageVersion(newVersion);
    }

    console.log(`Migration complete: v${fromVersion} → v${toVersion}`);

    return {
      success: true,
      fromVersion,
      toVersion,
    };
  } catch (error) {
    console.error('Migration failed:', error);

    return {
      success: false,
      fromVersion,
      toVersion,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Auto-migrate to latest version
 */
export async function autoMigrate(): Promise<MigrationResult | null> {
  const currentVersion = storage.getStorageVersion();
  const latestVersion = storage.STORAGE_VERSION;

  if (currentVersion === latestVersion) {
    console.log(`Storage is already at latest version (v${latestVersion})`);
    return null;
  }

  if (currentVersion > latestVersion) {
    console.warn(
      `Storage version (v${currentVersion}) is newer than app version (v${latestVersion}). Skipping migration.`
    );
    return null;
  }

  console.log(`Auto-migrating from v${currentVersion} to v${latestVersion}`);
  return migrateStorage(currentVersion, latestVersion);
}

/**
 * Migration: v1 → v2
 * Example: Add new fields to project structure
 */
async function migrateV1toV2(): Promise<void> {
  console.log('Migrating v1 → v2: Adding lastAccessedAt to projects');

  const projects = storage.loadAllProjects();

  const migratedProjects = projects.map(project => ({
    ...project,
    // Add lastAccessedAt if it doesn't exist
    lastAccessedAt: project.lastAccessedAt || project.updatedAt,
  }));

  storage.setItem(storage.STORAGE_KEYS.PROJECTS, migratedProjects);
}

/**
 * Migration: v2 → v3
 * Example: Restructure annotations storage
 */
async function migrateV2toV3(): Promise<void> {
  console.log('Migrating v2 → v3: Restructuring annotations');

  // Example migration logic
  const annotations = storage.getItem<any>(storage.STORAGE_KEYS.ANNOTATIONS, {});

  // If annotations are in old format, convert to new format
  // This is just an example - actual migration logic would depend on changes
  if (annotations) {
    // Transformation logic here
    storage.setItem(storage.STORAGE_KEYS.ANNOTATIONS, annotations);
  }
}

/**
 * Migration: v3 → v4
 * Example: Add new calibration fields
 */
async function migrateV3toV4(): Promise<void> {
  console.log('Migrating v3 → v4: Updating calibration structure');

  const calibrations = storage.getItem<any>(storage.STORAGE_KEYS.CALIBRATION, {});

  // Add new fields to calibration data
  Object.keys(calibrations).forEach(projectId => {
    const calibration = calibrations[projectId];

    // Example: Add new field with default value
    calibrations[projectId] = {
      ...calibration,
      // Add new fields here
    };
  });

  storage.setItem(storage.STORAGE_KEYS.CALIBRATION, calibrations);
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  const currentVersion = storage.getStorageVersion();
  const latestVersion = storage.STORAGE_VERSION;

  return currentVersion < latestVersion;
}

/**
 * Get migration info
 */
export function getMigrationInfo() {
  const currentVersion = storage.getStorageVersion();
  const latestVersion = storage.STORAGE_VERSION;
  const needed = needsMigration();

  return {
    currentVersion,
    latestVersion,
    needed,
    path: needed ? getMigrationPath(currentVersion, latestVersion) : [],
  };
}

/**
 * Backup before migration
 */
export async function backupBeforeMigration(): Promise<void> {
  console.log('Creating backup before migration...');

  const backup = storage.exportAllData();
  const blob = new Blob([backup], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-before-migration-v${storage.getStorageVersion()}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('Backup created');
}

/**
 * Rollback to previous version (if possible)
 */
export async function rollbackMigration(toVersion: number): Promise<MigrationResult> {
  try {
    console.log(`Rolling back to v${toVersion}`);

    // Note: Rollback is risky and may cause data loss
    // In a real application, you'd want to restore from a backup

    console.warn('Rollback not fully implemented. Please restore from backup.');

    storage.setStorageVersion(toVersion);

    return {
      success: true,
      fromVersion: storage.getStorageVersion(),
      toVersion,
    };
  } catch (error) {
    return {
      success: false,
      fromVersion: storage.getStorageVersion(),
      toVersion,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate storage after migration
 */
export function validateStorageAfterMigration(): boolean {
  try {
    // Load all data and check structure
    const projects = storage.loadAllProjects();

    if (!Array.isArray(projects)) {
      console.error('Projects is not an array');
      return false;
    }

    // Validate each project
    for (const project of projects) {
      if (!project.id || !project.name || !project.pdfUrl) {
        console.error('Invalid project structure:', project);
        return false;
      }

      // Check that dates are valid
      if (!(project.createdAt instanceof Date) && !Date.parse(project.createdAt as any)) {
        console.error('Invalid createdAt date:', project);
        return false;
      }
    }

    // Check version is set correctly
    const version = storage.getStorageVersion();
    if (version !== storage.STORAGE_VERSION) {
      console.error(`Version mismatch: ${version} !== ${storage.STORAGE_VERSION}`);
      return false;
    }

    console.log('Storage validation passed');
    return true;
  } catch (error) {
    console.error('Storage validation failed:', error);
    return false;
  }
}

/**
 * Safe migration with backup and validation
 */
export async function safeMigrate(): Promise<MigrationResult> {
  try {
    // Step 1: Check if migration is needed
    if (!needsMigration()) {
      return {
        success: true,
        fromVersion: storage.STORAGE_VERSION,
        toVersion: storage.STORAGE_VERSION,
      };
    }

    // Step 2: Create backup
    await backupBeforeMigration();

    // Step 3: Run migration
    const result = await autoMigrate();

    if (!result) {
      return {
        success: true,
        fromVersion: storage.STORAGE_VERSION,
        toVersion: storage.STORAGE_VERSION,
      };
    }

    // Step 4: Validate
    const isValid = validateStorageAfterMigration();

    if (!isValid) {
      throw new Error('Storage validation failed after migration');
    }

    return result;
  } catch (error) {
    console.error('Safe migration failed:', error);

    return {
      success: false,
      fromVersion: storage.getStorageVersion(),
      toVersion: storage.STORAGE_VERSION,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
