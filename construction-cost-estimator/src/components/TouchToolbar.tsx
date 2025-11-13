import { useState } from 'react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import type { AppState } from '../types/store';

interface TouchToolbarProps {
  activeTool: AppState['activeTool'];
  onToolChange: (tool: AppState['activeTool']) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

/**
 * TouchToolbar Component
 *
 * Mobile-optimized toolbar with large touch targets (min 48px × 48px)
 * Positioned at the bottom for easy thumb reach
 */
export function TouchToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onSettings,
  onHelp,
  canUndo = false,
  canRedo = false,
  className = '',
}: TouchToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const haptic = useHapticFeedback();

  const handleToolSelect = (tool: AppState['activeTool']) => {
    haptic.select();
    onToolChange(tool);
  };

  const handleUndo = () => {
    if (canUndo) {
      haptic.tap();
      onUndo?.();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      haptic.tap();
      onRedo?.();
    }
  };

  const handleSettings = () => {
    haptic.tap();
    onSettings?.();
  };

  const handleHelp = () => {
    haptic.tap();
    onHelp?.();
  };

  const toggleExpanded = () => {
    haptic.tap();
    setIsExpanded(!isExpanded);
  };

  const tools: Array<{ id: AppState['activeTool']; icon: string; label: string }> = [
    { id: 'select', icon: '👆', label: 'Select' },
    { id: 'marker', icon: '📍', label: 'Marker' },
    { id: 'label', icon: '🏷️', label: 'Label' },
    { id: 'line', icon: '📏', label: 'Line' },
    { id: 'polygon', icon: '⬡', label: 'Polygon' },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-transform duration-300 ${
        isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'
      } ${className}`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Collapse/Expand Handle */}
      <button
        onClick={toggleExpanded}
        className="w-full py-2 flex justify-center items-center touch-manipulation"
        aria-label={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full" />
      </button>

      {/* Toolbar Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Tool Selection */}
          <div className="grid grid-cols-5 gap-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`
                  flex flex-col items-center justify-center
                  min-h-[56px] min-w-[56px] p-2 rounded-lg
                  transition-all duration-200
                  touch-manipulation
                  ${
                    activeTool === tool.id
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }
                `}
                aria-label={tool.label}
                aria-pressed={activeTool === tool.id}
              >
                <span className="text-2xl mb-1">{tool.icon}</span>
                <span className="text-xs font-medium">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`
                flex-1 flex items-center justify-center gap-2
                min-h-[48px] px-4 rounded-lg
                transition-all duration-200
                touch-manipulation
                ${
                  canUndo
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label="Undo"
            >
              <span className="text-xl">↶</span>
              <span className="text-sm font-medium">Undo</span>
            </button>

            {/* Redo */}
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`
                flex-1 flex items-center justify-center gap-2
                min-h-[48px] px-4 rounded-lg
                transition-all duration-200
                touch-manipulation
                ${
                  canRedo
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label="Redo"
            >
              <span className="text-xl">↷</span>
              <span className="text-sm font-medium">Redo</span>
            </button>
          </div>

          {/* Settings and Help */}
          <div className="flex gap-2">
            {onSettings && (
              <button
                onClick={handleSettings}
                className="
                  flex-1 flex items-center justify-center gap-2
                  min-h-[48px] px-4 rounded-lg
                  bg-gray-100 text-gray-700
                  hover:bg-gray-200 active:bg-gray-300
                  transition-all duration-200
                  touch-manipulation
                "
                aria-label="Settings"
              >
                <span className="text-xl">⚙️</span>
                <span className="text-sm font-medium">Settings</span>
              </button>
            )}

            {onHelp && (
              <button
                onClick={handleHelp}
                className="
                  flex-1 flex items-center justify-center gap-2
                  min-h-[48px] px-4 rounded-lg
                  bg-gray-100 text-gray-700
                  hover:bg-gray-200 active:bg-gray-300
                  transition-all duration-200
                  touch-manipulation
                "
                aria-label="Help"
              >
                <span className="text-xl">❓</span>
                <span className="text-sm font-medium">Help</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact TouchToolbar for landscape or smaller screens
 */
export function CompactTouchToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className = '',
}: Omit<TouchToolbarProps, 'onSettings' | 'onHelp'>) {
  const haptic = useHapticFeedback();

  const handleToolSelect = (tool: AppState['activeTool']) => {
    haptic.select();
    onToolChange(tool);
  };

  const tools: Array<{ id: AppState['activeTool']; icon: string }> = [
    { id: 'select', icon: '👆' },
    { id: 'marker', icon: '📍' },
    { id: 'label', icon: '🏷️' },
    { id: 'line', icon: '📏' },
    { id: 'polygon', icon: '⬡' },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ${className}`}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="flex items-center justify-between px-2 py-2 gap-1">
        {/* Tools */}
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={`
              flex items-center justify-center
              min-h-[44px] min-w-[44px] rounded-lg
              transition-all duration-200
              touch-manipulation
              ${
                activeTool === tool.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700'
              }
            `}
            aria-label={`${tool.id} tool`}
            aria-pressed={activeTool === tool.id}
          >
            <span className="text-xl">{tool.icon}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          onClick={() => canUndo && onUndo?.()}
          disabled={!canUndo}
          className={`
            min-h-[44px] min-w-[44px] rounded-lg
            flex items-center justify-center
            touch-manipulation
            ${canUndo ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400'}
          `}
          aria-label="Undo"
        >
          <span className="text-xl">↶</span>
        </button>

        <button
          onClick={() => canRedo && onRedo?.()}
          disabled={!canRedo}
          className={`
            min-h-[44px] min-w-[44px] rounded-lg
            flex items-center justify-center
            touch-manipulation
            ${canRedo ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400'}
          `}
          aria-label="Redo"
        >
          <span className="text-xl">↷</span>
        </button>
      </div>
    </div>
  );
}
