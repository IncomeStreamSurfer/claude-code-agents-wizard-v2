import { useEffect, useState } from 'react';
import { TouchToolbar, CompactTouchToolbar } from './TouchToolbar';
import type { AppState } from '../types/store';
import { isTouchSupported } from '../utils/touchHelpers';

interface ResponsiveToolbarProps {
  activeTool: AppState['activeTool'];
  onToolChange: (tool: AppState['activeTool']) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

/**
 * ResponsiveToolbar Component
 *
 * Adapts the toolbar UI based on screen size and device capabilities
 * - Mobile (<768px): Full touch-optimized toolbar at bottom
 * - Tablet (768-1024px): Compact touch toolbar
 * - Desktop (>1024px): Traditional horizontal toolbar with tooltips
 */
export function ResponsiveToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onSettings,
  onHelp,
  canUndo = false,
  canRedo = false,
}: ResponsiveToolbarProps) {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch support
    setIsTouchDevice(isTouchSupported());

    // Detect screen size
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Show touch toolbar on mobile/tablet or any touch device
  if ((screenSize === 'mobile' || isTouchDevice) && screenSize !== 'desktop') {
    return (
      <TouchToolbar
        activeTool={activeTool}
        onToolChange={onToolChange}
        onUndo={onUndo}
        onRedo={onRedo}
        onSettings={onSettings}
        onHelp={onHelp}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    );
  }

  // Show compact toolbar on tablet
  if (screenSize === 'tablet') {
    return (
      <CompactTouchToolbar
        activeTool={activeTool}
        onToolChange={onToolChange}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    );
  }

  // Show desktop toolbar
  return (
    <DesktopToolbar
      activeTool={activeTool}
      onToolChange={onToolChange}
      onUndo={onUndo}
      onRedo={onRedo}
      onSettings={onSettings}
      onHelp={onHelp}
      canUndo={canUndo}
      canRedo={canRedo}
    />
  );
}

/**
 * Desktop Toolbar Component
 * Traditional horizontal toolbar with tooltips
 */
function DesktopToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onSettings,
  onHelp,
  canUndo,
  canRedo,
}: ResponsiveToolbarProps) {
  const tools: Array<{
    id: AppState['activeTool'];
    icon: string;
    label: string;
    shortcut?: string;
  }> = [
    { id: 'select', icon: '👆', label: 'Select', shortcut: 'V' },
    { id: 'marker', icon: '📍', label: 'Marker', shortcut: 'M' },
    { id: 'label', icon: '🏷️', label: 'Label', shortcut: 'L' },
    { id: 'line', icon: '📏', label: 'Line', shortcut: 'R' },
    { id: 'polygon', icon: '⬡', label: 'Polygon', shortcut: 'P' },
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-2 flex items-center gap-2">
        {/* Tools */}
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`
              group relative px-3 py-2 rounded transition-all duration-200
              ${
                activeTool === tool.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'hover:bg-gray-100 text-gray-700'
              }
            `}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            <span className="text-xl">{tool.icon}</span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {tool.label}
              {tool.shortcut && (
                <span className="ml-1 text-gray-400">({tool.shortcut})</span>
              )}
            </div>
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300" />

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            group relative px-3 py-2 rounded transition-all duration-200
            ${
              canUndo
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-400 cursor-not-allowed'
            }
          `}
          title="Undo (Ctrl+Z)"
        >
          <span className="text-xl">↶</span>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Undo <span className="text-gray-400">(Ctrl+Z)</span>
          </div>
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`
            group relative px-3 py-2 rounded transition-all duration-200
            ${
              canRedo
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-400 cursor-not-allowed'
            }
          `}
          title="Redo (Ctrl+Shift+Z)"
        >
          <span className="text-xl">↷</span>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Redo <span className="text-gray-400">(Ctrl+Shift+Z)</span>
          </div>
        </button>

        {/* Divider */}
        {(onSettings || onHelp) && <div className="w-px h-6 bg-gray-300" />}

        {/* Settings */}
        {onSettings && (
          <button
            onClick={onSettings}
            className="group relative px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-all duration-200"
            title="Settings"
          >
            <span className="text-xl">⚙️</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Settings
            </div>
          </button>
        )}

        {/* Help */}
        {onHelp && (
          <button
            onClick={onHelp}
            className="group relative px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-all duration-200"
            title="Help"
          >
            <span className="text-xl">❓</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Help <span className="text-gray-400">(H)</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to detect screen size
 */
export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

/**
 * Hook to detect if device is touch-enabled
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(isTouchSupported());
  }, []);

  return isTouchDevice;
}
