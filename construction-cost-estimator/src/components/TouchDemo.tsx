import { useState } from 'react';
import { TouchAnnotationCanvas, useTouchAnnotationState } from './TouchAnnotationCanvas';
import { MobileAnnotationPanel } from './MobileAnnotationPanel';
import { TouchGestureGuide, CompactGestureGuide } from './TouchGestureGuide';
import { ResponsiveToolbar } from './ResponsiveToolbar';
import type { AnnotationData, LabelDefinition, AppState } from '../types/store';
import type { Point } from '../utils/touchHelpers';
import { isTouchSupported } from '../utils/touchHelpers';

/**
 * TouchDemo Component
 *
 * Comprehensive demo showcasing all touch features:
 * - Touch gesture recognition
 * - Mobile-optimized toolbar
 * - Annotation placement and editing
 * - Pinch zoom and pan
 * - Haptic feedback
 * - Responsive design
 */
export function TouchDemo() {
  const [activeTool, setActiveTool] = useState<AppState['activeTool']>('select');
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [showGestureGuide, setShowGestureGuide] = useState(false);
  const [showCompactGuide, setShowCompactGuide] = useState(true);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);

  const {
    zoom,
    pan,
    setZoom,
    setPan,
    resetView,
    zoomIn,
    zoomOut,
  } = useTouchAnnotationState();

  // Sample labels
  const labels: LabelDefinition[] = [
    {
      id: 'wall',
      name: 'Wall',
      color: '#ef4444',
      unit: 'linear_meters',
      category: 'Structure',
      createdAt: new Date(),
    },
    {
      id: 'door',
      name: 'Door',
      color: '#3b82f6',
      unit: 'count',
      category: 'Fixtures',
      createdAt: new Date(),
    },
    {
      id: 'window',
      name: 'Window',
      color: '#10b981',
      unit: 'count',
      category: 'Fixtures',
      createdAt: new Date(),
    },
  ];

  // Handle tap on canvas
  const handleTap = (position: Point) => {
    // Find annotation at tap position
    const tappedAnnotation = annotations.find((ann) => {
      const distance = Math.sqrt(
        Math.pow(ann.x - position.x, 2) + Math.pow(ann.y - position.y, 2)
      );
      return distance < 20; // 20px hit radius
    });

    if (tappedAnnotation) {
      setSelectedAnnotationId(tappedAnnotation.id);
      setShowAnnotationPanel(true);
    } else {
      setSelectedAnnotationId(null);
      setShowAnnotationPanel(false);
    }
  };

  // Handle long press - show context menu
  const handleLongPress = (position: Point) => {
    const tappedAnnotation = annotations.find((ann) => {
      const distance = Math.sqrt(
        Math.pow(ann.x - position.x, 2) + Math.pow(ann.y - position.y, 2)
      );
      return distance < 20;
    });

    if (tappedAnnotation) {
      setSelectedAnnotationId(tappedAnnotation.id);
      setShowAnnotationPanel(true);
    }
  };

  // Handle annotation placement
  const handleAnnotationPlace = (position: Point) => {
    const newAnnotation: AnnotationData = {
      id: `ann-${Date.now()}`,
      type: activeTool === 'marker' ? 'marker' : activeTool === 'label' ? 'label' : 'marker',
      x: position.x,
      y: position.y,
      pageNumber: 1,
      color: '#3b82f6',
      text: activeTool === 'label' ? 'New Label' : undefined,
      width: 0,
      height: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotationId(newAnnotation.id);
    setShowAnnotationPanel(true);
  };

  // Handle annotation drag
  const handleAnnotationDrag = (_position: Point, delta: Point) => {
    if (!selectedAnnotationId) return;

    setAnnotations(
      annotations.map((ann) =>
        ann.id === selectedAnnotationId
          ? { ...ann, x: ann.x + delta.x, y: ann.y + delta.y }
          : ann
      )
    );
  };

  // Handle annotation update
  const handleAnnotationUpdate = (id: string, updates: Partial<AnnotationData>) => {
    setAnnotations(
      annotations.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann))
    );
  };

  // Handle annotation delete
  const handleAnnotationDelete = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id));
    setSelectedAnnotationId(null);
  };

  // Handle annotation duplicate
  const handleAnnotationDuplicate = (annotation: AnnotationData) => {
    const newAnnotation: AnnotationData = {
      ...annotation,
      id: `ann-${Date.now()}`,
      x: annotation.x + 20,
      y: annotation.y + 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  // Handle swipe
  const handleSwipe = (_direction: 'up' | 'down' | 'left' | 'right') => {
    // Could be used for page navigation
  };

  // Handle zoom change
  const handleZoomChange = (newZoom: number, _center: Point) => {
    setZoom(newZoom);
  };

  // Handle pan change
  const handlePanChange = (newPan: { x: number; y: number }) => {
    setPan(newPan);
  };

  const selectedAnnotation = annotations.find((ann) => ann.id === selectedAnnotationId);
  const isTouchDevice = isTouchSupported();

  return (
    <div className="touch-demo w-full h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Touch Annotation Demo</h1>
          <p className="text-sm text-gray-600">
            {isTouchDevice ? 'Touch device detected' : 'Using mouse/trackpad'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGestureGuide(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
          >
            Help
          </button>
          <button
            onClick={resetView}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors"
          >
            Reset View
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        <TouchAnnotationCanvas
          width={800}
          height={600}
          currentZoom={zoom}
          currentPan={pan}
          activeTool={activeTool}
          enablePinchZoom={true}
          enableTwoFingerPan={true}
          enableHapticFeedback={true}
          onZoomChange={handleZoomChange}
          onPanChange={handlePanChange}
          onTap={handleTap}
          onLongPress={handleLongPress}
          onAnnotationPlace={handleAnnotationPlace}
          onAnnotationDrag={handleAnnotationDrag}
          onSwipe={handleSwipe}
          className="mx-auto mt-8"
        >
          {/* Demo Canvas Content */}
          <div className="w-[800px] h-[600px] bg-white rounded-lg shadow-lg relative">
            {/* Grid background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* Instructions */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-400 pointer-events-none">
              <p className="text-lg font-medium mb-2">
                {isTouchDevice ? 'Try Touch Gestures' : 'Enable Touch Emulation'}
              </p>
              <p className="text-sm">
                Tap • Long Press • Drag • Pinch • Pan
              </p>
            </div>

            {/* Render annotations */}
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="absolute"
                style={{
                  left: annotation.x,
                  top: annotation.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {annotation.type === 'marker' && (
                  <div
                    className={`w-6 h-6 rounded-full border-2 ${
                      annotation.id === selectedAnnotationId
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-700'
                    }`}
                    style={{ backgroundColor: annotation.color }}
                  />
                )}
                {annotation.type === 'label' && (
                  <div
                    className={`px-3 py-1 rounded shadow-md ${
                      annotation.id === selectedAnnotationId
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                    style={{ backgroundColor: annotation.color, color: 'white' }}
                  >
                    {annotation.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TouchAnnotationCanvas>

        {/* Zoom controls (desktop/fallback) */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-2">
          <button
            onClick={zoomIn}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-gray-100 active:bg-gray-200"
          >
            +
          </button>
          <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-sm font-medium">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={zoomOut}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-gray-100 active:bg-gray-200"
          >
            −
          </button>
        </div>

        {/* Compact gesture guide */}
        {showCompactGuide && isTouchDevice && (
          <CompactGestureGuide onClose={() => setShowCompactGuide(false)} />
        )}
      </main>

      {/* Responsive Toolbar */}
      <ResponsiveToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onUndo={() => console.log('Undo')}
        onRedo={() => console.log('Redo')}
        onSettings={() => console.log('Settings')}
        onHelp={() => setShowGestureGuide(true)}
        canUndo={annotations.length > 0}
        canRedo={false}
      />

      {/* Mobile Annotation Panel */}
      {selectedAnnotation && (
        <MobileAnnotationPanel
          annotation={selectedAnnotation}
          labels={labels}
          isOpen={showAnnotationPanel}
          onClose={() => setShowAnnotationPanel(false)}
          onUpdate={handleAnnotationUpdate}
          onDelete={handleAnnotationDelete}
          onDuplicate={handleAnnotationDuplicate}
        />
      )}

      {/* Gesture Guide Modal */}
      {showGestureGuide && (
        <TouchGestureGuide
          isOpen={showGestureGuide}
          onClose={() => setShowGestureGuide(false)}
        />
      )}
    </div>
  );
}
