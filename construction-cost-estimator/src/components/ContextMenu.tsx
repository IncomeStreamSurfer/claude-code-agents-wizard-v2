/**
 * ContextMenu Component
 *
 * Reusable right-click context menu for annotations.
 * Provides quick actions like edit, duplicate, delete, change color, etc.
 */

import { useEffect, useRef } from 'react';
import type { AnnotationData } from '../types/store';

/**
 * Context menu action
 */
export interface ContextMenuAction {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
}

/**
 * Props for ContextMenu component
 */
export interface ContextMenuProps {
  /** X position in pixels */
  x: number;

  /** Y position in pixels */
  y: number;

  /** Whether menu is visible */
  visible: boolean;

  /** Actions to display */
  actions: ContextMenuAction[];

  /** Callback when menu should close */
  onClose: () => void;
}

/**
 * ContextMenu component
 *
 * Displays a popup menu at specified coordinates with a list of actions.
 * Automatically closes when clicking outside or pressing Escape.
 */
export function ContextMenu({ x, y, visible, actions, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Handle clicks outside menu
   */
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {actions.map((action, index) => (
        <div key={index}>
          {action.separator ? (
            <div className="border-t border-gray-200 my-1" />
          ) : (
            <button
              onClick={() => {
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              className={`
                w-full text-left px-4 py-2 text-sm flex items-center gap-2
                ${
                  action.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : action.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }
                transition-colors
              `}
            >
              {action.icon && <span className="text-lg">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Hook for managing context menu state
 */
export function useContextMenu() {
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    annotation: AnnotationData | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    annotation: null,
  });

  const showMenu = (x: number, y: number, annotation: AnnotationData) => {
    setMenuState({ visible: true, x, y, annotation });
  };

  const hideMenu = () => {
    setMenuState({ visible: false, x: 0, y: 0, annotation: null });
  };

  return {
    menuState,
    showMenu,
    hideMenu,
  };
}

/**
 * Import useState
 */
import { useState } from 'react';
