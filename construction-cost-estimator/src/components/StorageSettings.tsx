/**
 * Storage Settings Component
 *
 * Provides UI for managing storage:
 * - View storage usage
 * - Clear old projects
 * - Optimize storage
 * - Export/import data
 * - Manage backups
 */

import React, { useState } from 'react';
import { useStorageStats, useProjectsList } from '../hooks/useLocalStorage';
import { persistenceService } from '../services/persistenceService';
import * as storage from '../utils/localStorage';
import * as migration from '../utils/storageMigration';

interface StorageSettingsProps {
  onClose?: () => void;
}

export const StorageSettings: React.FC<StorageSettingsProps> = ({ onClose }) => {
  const stats = useStorageStats();
  const { projects, clearOldProjects, refresh } = useProjectsList();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Format bytes to human-readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Handle optimize storage
  const handleOptimize = async () => {
    setIsOptimizing(true);
    setMessage(null);

    try {
      persistenceService.optimizeStorage();
      stats.refresh();
      refresh();

      setMessage({
        type: 'success',
        text: 'Storage optimized successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Optimization failed',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle clear old projects
  const handleClearOld = (days: number) => {
    const count = clearOldProjects(days);

    setMessage({
      type: 'success',
      text: `Cleared ${count} projects older than ${days} days`,
    });

    stats.refresh();
  };

  // Handle export data
  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      await storage.backupToFile();

      setMessage({
        type: 'success',
        text: 'Data exported successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Export failed',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle import data
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const result = await storage.restoreFromFile(file);

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Data imported successfully! Refreshing...',
        });

        // Refresh after import
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Import failed',
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Handle clear all data
  const handleClearAll = () => {
    if (!window.confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      return;
    }

    const result = storage.clearAll();

    if (result.success) {
      setMessage({
        type: 'success',
        text: 'All data cleared. Refreshing...',
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Failed to clear data',
      });
    }
  };

  // Handle run migrations
  const handleMigrate = async () => {
    if (!migration.needsMigration()) {
      setMessage({
        type: 'success',
        text: 'Storage is already up to date!',
      });
      return;
    }

    try {
      const result = await migration.safeMigrate();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Migrated from v${result.fromVersion} to v${result.toVersion}`,
        });
      } else {
        throw new Error(result.error || 'Migration failed');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Migration failed',
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Storage Settings</h2>
        {onClose && (
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            ...styles.message,
            backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Storage Usage */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Storage Usage</h3>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${stats.usagePercent}%`,
              backgroundColor:
                stats.usagePercent >= 90
                  ? '#ef4444'
                  : stats.usagePercent >= 75
                  ? '#f59e0b'
                  : '#10b981',
            }}
          />
        </div>

        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Used:</span>
            <span style={styles.statValue}>{formatBytes(stats.size)}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Total:</span>
            <span style={styles.statValue}>{formatBytes(stats.quota)}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Percentage:</span>
            <span style={styles.statValue}>{stats.usagePercent}%</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Projects:</span>
            <span style={styles.statValue}>{projects.length}</span>
          </div>
        </div>
      </div>

      {/* Cleanup */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Cleanup</h3>

        <div style={styles.buttonGroup}>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            style={styles.button}
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Storage'}
          </button>

          <button
            onClick={() => handleClearOld(30)}
            style={styles.button}
          >
            Clear Projects (30+ days)
          </button>

          <button
            onClick={() => handleClearOld(90)}
            style={styles.button}
          >
            Clear Projects (90+ days)
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Backup & Restore</h3>

        <div style={styles.buttonGroup}>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>

          <label style={{ ...styles.button, ...styles.fileButton }}>
            {isImporting ? 'Importing...' : 'Import Data'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div style={styles.hint}>
          Export creates a backup file. Import restores data from a backup.
        </div>
      </div>

      {/* Migrations */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Migrations</h3>

        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Current Version:</span>
            <span style={styles.statValue}>v{storage.getStorageVersion()}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Latest Version:</span>
            <span style={styles.statValue}>v{storage.STORAGE_VERSION}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Needs Migration:</span>
            <span style={styles.statValue}>
              {migration.needsMigration() ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {migration.needsMigration() && (
          <button onClick={handleMigrate} style={styles.button}>
            Run Migration
          </button>
        )}
      </div>

      {/* Danger Zone */}
      <div style={styles.section}>
        <h3 style={{ ...styles.sectionTitle, color: '#ef4444' }}>Danger Zone</h3>

        <button
          onClick={handleClearAll}
          style={{ ...styles.button, ...styles.dangerButton }}
        >
          Clear All Data
        </button>

        <div style={{ ...styles.hint, color: '#ef4444' }}>
          Warning: This will permanently delete all projects and data!
        </div>
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.25rem',
  },
  message: {
    padding: '1rem',
    borderRadius: '0.375rem',
    color: '#fff',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#111827',
  },
  progressBar: {
    width: '100%',
    height: '1rem',
    backgroundColor: '#e5e7eb',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  statValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#111827',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center' as const,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
  },
  fileButton: {
    display: 'inline-block',
    cursor: 'pointer',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
  },
  hint: {
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    color: '#6b7280',
    fontStyle: 'italic',
  },
};

export default StorageSettings;
