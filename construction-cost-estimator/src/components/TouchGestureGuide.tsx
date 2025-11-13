import React, { useState } from 'react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface TouchGestureGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Gesture {
  id: string;
  name: string;
  icon: string;
  description: string;
  animation: string;
}

/**
 * TouchGestureGuide Component
 *
 * Displays an interactive guide showing available touch gestures
 * with animated demonstrations
 */
export function TouchGestureGuide({ isOpen, onClose }: TouchGestureGuideProps) {
  const haptic = useHapticFeedback();

  const gestures: Gesture[] = [
    {
      id: 'tap',
      name: 'Tap',
      icon: '👆',
      description: 'Select annotation or place marker',
      animation: 'animate-pulse',
    },
    {
      id: 'double-tap',
      name: 'Double Tap',
      icon: '👆👆',
      description: 'Toggle zoom or open edit dialog',
      animation: 'animate-bounce',
    },
    {
      id: 'long-press',
      name: 'Long Press',
      icon: '👇',
      description: 'Hold for 500ms to show context menu',
      animation: 'animate-pulse',
    },
    {
      id: 'drag',
      name: 'Drag',
      icon: '☝️',
      description: 'Touch and move to reposition annotations',
      animation: 'animate-pulse',
    },
    {
      id: 'pinch',
      name: 'Pinch',
      icon: '👌',
      description: 'Two fingers to zoom in/out',
      animation: 'animate-pulse',
    },
    {
      id: 'pan',
      name: 'Pan',
      icon: '✌️',
      description: 'Two fingers to move viewport',
      animation: 'animate-pulse',
    },
    {
      id: 'swipe',
      name: 'Swipe',
      icon: '👉',
      description: 'Swipe left/right to navigate pages',
      animation: 'animate-pulse',
    },
  ];

  if (!isOpen) return null;

  const handleClose = () => {
    haptic.tap();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
        style={{ touchAction: 'none' }}
      >
        {/* Guide Panel */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Touch Gestures</h2>
            <button
              onClick={handleClose}
              className="
                w-10 h-10 rounded-full
                flex items-center justify-center
                bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                transition-colors duration-200
              "
              style={{ touchAction: 'manipulation' }}
              aria-label="Close"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Introduction */}
            <p className="text-gray-600 mb-6">
              Learn how to interact with annotations using touch gestures.
              Practice these gestures on your device for the best experience.
            </p>

            {/* Gesture List */}
            <div className="space-y-4">
              {gestures.map((gesture) => (
                <div
                  key={gesture.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Icon */}
                  <div className={`text-4xl ${gesture.animation}`}>
                    {gesture.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{gesture.name}</h3>
                    <p className="text-gray-600 text-sm">{gesture.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Touch targets are optimized for thumb reach (min 44px)</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Haptic feedback confirms your actions (if supported)</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Use two fingers to zoom and pan without activating tools</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Long press on annotations to access quick actions</span>
                </li>
              </ul>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="
                w-full mt-6 py-3 px-4 rounded-lg
                bg-blue-500 text-white font-medium text-base
                hover:bg-blue-600 active:bg-blue-700
                transition-colors duration-200
              "
              style={{ touchAction: 'manipulation', minHeight: '48px' }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Compact Gesture Guide - Quick reference overlay
 */
export function CompactGestureGuide({ onClose }: { onClose: () => void }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const haptic = useHapticFeedback();

  const quickGestures = [
    { icon: '👆', text: 'Tap to select' },
    { icon: '👇', text: 'Long press for menu' },
    { icon: '👌', text: 'Pinch to zoom' },
    { icon: '✌️', text: 'Two fingers to pan' },
  ];

  const handleToggle = () => {
    haptic.tap();
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    haptic.tap();
    onClose();
  };

  return (
    <div
      className={`
        fixed bottom-20 right-4 z-40
        bg-white rounded-lg shadow-lg border border-gray-200
        transition-all duration-300
        ${isMinimized ? 'w-12 h-12' : 'w-64'}
      `}
      style={{ touchAction: 'manipulation' }}
    >
      {isMinimized ? (
        // Minimized State
        <button
          onClick={handleToggle}
          className="w-full h-full flex items-center justify-center text-2xl"
          aria-label="Show gesture guide"
        >
          ❓
        </button>
      ) : (
        // Expanded State
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Quick Guide</h3>
            <div className="flex gap-1">
              <button
                onClick={handleToggle}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                aria-label="Minimize"
              >
                <span className="text-xs">−</span>
              </button>
              <button
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <span className="text-xs">✕</span>
              </button>
            </div>
          </div>

          {/* Gestures */}
          <div className="space-y-2">
            {quickGestures.map((gesture, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="text-lg">{gesture.icon}</span>
                <span className="text-gray-600">{gesture.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
