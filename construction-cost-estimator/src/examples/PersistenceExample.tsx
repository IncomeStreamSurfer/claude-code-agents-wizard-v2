/**
 * Persistence Example
 *
 * Demonstrates the local storage persistence system with:
 * - Auto-save functionality
 * - Storage status display
 * - Storage management
 * - Import/Export
 */

import React, { useState, useEffect } from 'react';
import { StorageStatus } from '../components/StorageStatus';
import { StorageSettings } from '../components/StorageSettings';
import {
  useLocalStorage,
  useProjectLocalStorage,
  useSettingsLocalStorage,
  useStorageStats,
  useAutoSave,
} from '../hooks/useLocalStorage';
import * as storage from '../utils/localStorage';

export const PersistenceExample: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [notes, setNotes] = useLocalStorage('demo-notes', '');
  const { settings, updateSetting } = useSettingsLocalStorage();
  const stats = useStorageStats();

  // Auto-save demo
  const { lastSaved, isSaving, error } = useAutoSave(
    'demo-autosave',
    notes,
    1000,
    true
  );

  return (
    <div style={styles.container}>
      <h1>Local Storage Persistence Demo</h1>

      {/* Storage Status */}
      <div style={styles.section}>
        <h2>Storage Status</h2>
        <StorageStatus detailed position="inline" />
      </div>

      {/* Auto-Save Demo */}
      <div style={styles.section}>
        <h2>Auto-Save Demo</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type something... auto-saves every 1 second"
          style={styles.textarea}
        />
        <div style={styles.status}>
          {isSaving && <span>💾 Saving...</span>}
          {!isSaving && lastSaved && (
            <span>✅ Saved {formatTimeAgo(lastSaved)}</span>
          )}
          {error && <span style={{ color: 'red' }}>❌ Error: {error}</span>}
        </div>
      </div>

      {/* Settings Demo */}
      <div style={styles.section}>
        <h2>Settings Demo</h2>
        <div style={styles.setting}>
          <label>Currency:</label>
          <select
            value={settings.currency}
            onChange={(e) => updateSetting('currency', e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div style={styles.setting}>
          <label>Decimals:</label>
          <input
            type="number"
            value={settings.decimals}
            onChange={(e) => updateSetting('decimals', parseInt(e.target.value))}
            min="0"
            max="4"
          />
        </div>
        <div style={styles.setting}>
          <label>Dark Mode:</label>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) => updateSetting('darkMode', e.target.checked)}
          />
        </div>
      </div>

      {/* Storage Stats */}
      <div style={styles.section}>
        <h2>Storage Statistics</h2>
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span>Used:</span>
            <span>{formatBytes(stats.size)}</span>
          </div>
          <div style={styles.stat}>
            <span>Quota:</span>
            <span>{formatBytes(stats.quota)}</span>
          </div>
          <div style={styles.stat}>
            <span>Usage:</span>
            <span>{stats.usagePercent}%</span>
          </div>
          <div style={styles.stat}>
            <span>Projects:</span>
            <span>{storage.loadAllProjects().length}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.section}>
        <h2>Actions</h2>
        <div style={styles.buttons}>
          <button onClick={() => setShowSettings(true)} style={styles.button}>
            Storage Settings
          </button>
          <button
            onClick={async () => {
              await storage.backupToFile();
            }}
            style={styles.button}
          >
            Export Data
          </button>
          <button
            onClick={() => {
              const confirmed = window.confirm(
                'Clear all data? This cannot be undone!'
              );
              if (confirmed) {
                storage.clearAll();
                window.location.reload();
              }
            }}
            style={{ ...styles.button, ...styles.dangerButton }}
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Storage Settings Modal */}
      {showSettings && (
        <div style={styles.modal}>
          <StorageSettings onClose={() => setShowSettings(false)} />
        </div>
      )}

      {/* Compact status indicator */}
      <StorageStatus compact position="bottom-right" />
    </div>
  );
};

// Helper functions

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    fontFamily: 'system-ui, sans-serif',
  },
  section: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  textarea: {
    width: '100%',
    minHeight: '150px',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontFamily: 'monospace',
  },
  status: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  setting: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: '#fff',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
};

export default PersistenceExample;
