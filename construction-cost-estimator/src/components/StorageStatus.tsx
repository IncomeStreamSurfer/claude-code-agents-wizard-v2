/**
 * Storage Status Component
 *
 * Displays storage usage information and save status
 * Shows real-time indicators for:
 * - Storage usage (percentage)
 * - Save status (saving/saved)
 * - Last save time
 * - Storage warnings
 */

import React, { useEffect, useState } from 'react';
import { useStorageStats } from '../hooks/useLocalStorage';
import { persistenceService } from '../services/persistenceService';
import * as storage from '../utils/localStorage';

interface StorageStatusProps {
  /**
   * Show detailed stats (default: false)
   */
  detailed?: boolean;

  /**
   * Compact mode (smaller display)
   */
  compact?: boolean;

  /**
   * Position: 'top-right' | 'bottom-right' | 'inline'
   */
  position?: 'top-right' | 'bottom-right' | 'inline';

  /**
   * Custom className
   */
  className?: string;
}

export const StorageStatus: React.FC<StorageStatusProps> = ({
  detailed = false,
  compact = false,
  position = 'bottom-right',
  className = '',
}) => {
  const stats = useStorageStats();
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update save status
  useEffect(() => {
    const updateSaveStatus = () => {
      setIsSaving(persistenceService.getIsSaving());
      setLastSaveTime(persistenceService.getLastSaveTime());
    };

    updateSaveStatus();

    const interval = setInterval(updateSaveStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format bytes to human-readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format time ago
  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Get storage status color
  const getStatusColor = (): string => {
    if (!stats.isAvailable) return 'red';
    if (stats.usagePercent >= 90) return 'red';
    if (stats.usagePercent >= 75) return 'orange';
    return 'green';
  };

  // Get save status
  const getSaveStatus = (): { text: string; color: string } => {
    if (isSaving) {
      return { text: 'Saving...', color: 'blue' };
    }

    if (lastSaveTime) {
      const secondsAgo = Math.floor((new Date().getTime() - lastSaveTime.getTime()) / 1000);
      if (secondsAgo < 3) {
        return { text: 'Saved', color: 'green' };
      }
    }

    return { text: formatTimeAgo(lastSaveTime), color: 'gray' };
  };

  const saveStatus = getSaveStatus();
  const statusColor = getStatusColor();

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 1000,
    },
    'bottom-right': {
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 1000,
    },
    'inline': {
      position: 'relative',
    },
  };

  if (!stats.isAvailable) {
    return (
      <div
        className={`storage-status error ${className}`}
        style={positionStyles[position]}
      >
        <div style={styles.container}>
          <span style={{ ...styles.icon, color: 'red' }}>⚠</span>
          <span style={styles.text}>Storage unavailable</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`storage-status compact ${className}`}
        style={positionStyles[position]}
        title={`Storage: ${stats.usagePercent}% used | ${saveStatus.text}`}
      >
        <div style={styles.compactContainer}>
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: saveStatus.color,
            }}
          />
          <span style={styles.compactText}>{stats.usagePercent}%</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`storage-status ${className}`}
      style={positionStyles[position]}
    >
      <div style={styles.container}>
        {/* Save status */}
        <div style={styles.row}>
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: saveStatus.color,
            }}
          />
          <span style={styles.text}>{saveStatus.text}</span>
        </div>

        {/* Storage usage */}
        <div style={styles.row}>
          <span style={{ ...styles.icon, color: statusColor }}>💾</span>
          <span style={styles.text}>
            {formatBytes(stats.size)} / {formatBytes(stats.quota)}
          </span>
          <span style={styles.percentage}>({stats.usagePercent}%)</span>
        </div>

        {/* Warnings */}
        {stats.usagePercent >= 75 && (
          <div style={{ ...styles.warning, color: statusColor }}>
            {stats.usagePercent >= 90
              ? 'Storage almost full!'
              : 'Storage usage high'}
          </div>
        )}

        {/* Detailed stats */}
        {detailed && (
          <div style={styles.details}>
            <div style={styles.detailRow}>
              <span>Projects:</span>
              <span>{storage.loadAllProjects().length}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Last save:</span>
              <span>{formatTimeAgo(lastSaveTime)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Version:</span>
              <span>v{storage.getStorageVersion()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    minWidth: '200px',
  },
  compactContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    padding: '0.5rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  icon: {
    fontSize: '1rem',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  text: {
    fontSize: '0.875rem',
  },
  compactText: {
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  percentage: {
    fontSize: '0.75rem',
    opacity: 0.7,
  },
  warning: {
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textAlign: 'center' as const,
  },
  details: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '0.75rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
    opacity: 0.8,
  },
};

export default StorageStatus;
