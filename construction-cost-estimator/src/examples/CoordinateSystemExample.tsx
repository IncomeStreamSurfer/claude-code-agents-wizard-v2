/**
 * Coordinate System Integration Example
 *
 * This file demonstrates how to integrate the coordinate normalization system
 * into annotation components.
 */

import { useRef, useState, useEffect } from 'react';
import { useCoordinateSystem, useZoomPan } from '../hooks/useCoordinateSystem';
import type { AnnotationData } from '../types/store';
import type { Point } from '../utils/coordinates';

/**
 * Example 1: Basic Annotation Canvas with Coordinate System
 */
export function BasicAnnotationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const { zoom, pan, setZoom, setPan, zoomIn, zoomOut, resetView } = useZoomPan();

  // Initialize coordinate system
  const coordSystem = useCoordinateSystem({
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    zoom,
    panX: pan.x,
    panY: pan.y,
  });

  // Handle canvas click to add marker
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    // Convert click event to normalized coordinates
    const normalized = coordSystem.eventToNormalized(
      e.nativeEvent,
      canvasRef.current
    );

    if (!normalized) return;

    // Create new marker annotation
    const newMarker: AnnotationData = {
      id: `marker-${Date.now()}`,
      type: 'marker',
      x: normalized.x,
      y: normalized.y,
      color: '#FF6B6B',
    };

    setAnnotations([...annotations, newMarker]);
  };

  // Render annotations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Get only visible annotations (performance optimization)
    const visibleAnnotations = coordSystem.getVisibleAnnotations(annotations);

    // Render each visible annotation
    visibleAnnotations.forEach((annotation) => {
      if (annotation.type === 'marker') {
        // Convert normalized to canvas coordinates
        const pos = coordSystem.toCanvas(annotation.x, annotation.y);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = annotation.color || '#FF6B6B';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [annotations, coordSystem, canvasSize]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={resetView}>Reset View</button>
        <span style={{ marginLeft: 10 }}>
          Zoom: {(zoom * 100).toFixed(0)}% | Annotations: {annotations.length}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        style={{
          border: '1px solid #ccc',
          cursor: 'crosshair',
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

/**
 * Example 2: Line Drawing with Distance Measurement
 */
export function LineDrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [currentLine, setCurrentLine] = useState<Point[]>([]);
  const [canvasSize] = useState({ width: 800, height: 600 });

  const coordSystem = useCoordinateSystem({
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    zoom: 1.0,
    panX: 0,
    panY: 0,
  });

  // Handle canvas click to add line points
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const normalized = coordSystem.eventToNormalized(
      e.nativeEvent,
      canvasRef.current
    );

    if (!normalized) return;

    const newPoints = [...currentLine, normalized];

    if (newPoints.length === 2) {
      // Complete the line
      const newLine: AnnotationData = {
        id: `line-${Date.now()}`,
        type: 'line',
        x: newPoints[0].x,
        y: newPoints[0].y,
        points: newPoints,
        color: '#FFD93D',
      };

      setAnnotations([...annotations, newLine]);
      setCurrentLine([]);
    } else {
      setCurrentLine(newPoints);
    }
  };

  // Render annotations and current line
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Render completed lines
    annotations.forEach((annotation) => {
      if (annotation.type === 'line' && annotation.points) {
        const canvasPoints = coordSystem.denormalizePoints(annotation.points);

        ctx.beginPath();
        ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
        ctx.lineTo(canvasPoints[1].x, canvasPoints[1].y);
        ctx.strokeStyle = annotation.color || '#FFD93D';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw endpoints
        canvasPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = annotation.color || '#FFD93D';
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        // Calculate and display distance
        const pixelDistance = coordSystem.calculateDistance(
          annotation.points[0],
          annotation.points[1],
          true
        );

        const midPoint = {
          x: (canvasPoints[0].x + canvasPoints[1].x) / 2,
          y: (canvasPoints[0].y + canvasPoints[1].y) / 2,
        };

        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.fillText(`${pixelDistance.toFixed(1)} px`, midPoint.x, midPoint.y - 10);
      }
    });

    // Render current line being drawn
    if (currentLine.length === 1) {
      const canvasPoint = coordSystem.toCanvas(currentLine[0].x, currentLine[0].y);

      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD93D';
      ctx.fill();
    }
  }, [annotations, currentLine, coordSystem, canvasSize]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <strong>Click twice to draw a line</strong>
        {currentLine.length === 1 && <span> - Click again to complete</span>}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        style={{
          border: '1px solid #ccc',
          cursor: 'crosshair',
        }}
      />
      <div style={{ marginTop: 10 }}>
        <strong>Lines drawn: {annotations.length}</strong>
      </div>
    </div>
  );
}

/**
 * Example 3: Polygon Area Measurement
 */
export function PolygonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [canvasSize] = useState({ width: 800, height: 600 });

  const coordSystem = useCoordinateSystem({
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    zoom: 1.0,
    panX: 0,
    panY: 0,
  });

  // Handle canvas click to add polygon vertices
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const normalized = coordSystem.eventToNormalized(
      e.nativeEvent,
      canvasRef.current
    );

    if (!normalized) return;

    setCurrentPolygon([...currentPolygon, normalized]);
  };

  // Complete polygon on double-click
  const handleDoubleClick = () => {
    if (currentPolygon.length < 3) return;

    const newPolygon: AnnotationData = {
      id: `polygon-${Date.now()}`,
      type: 'polygon',
      x: currentPolygon[0].x,
      y: currentPolygon[0].y,
      points: currentPolygon,
      color: '#A8E6CF',
    };

    setAnnotations([...annotations, newPolygon]);
    setCurrentPolygon([]);
  };

  // Render annotations and current polygon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Render completed polygons
    annotations.forEach((annotation) => {
      if (annotation.type === 'polygon' && annotation.points) {
        const canvasPoints = coordSystem.denormalizePoints(annotation.points);

        // Draw filled polygon
        ctx.beginPath();
        ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
        canvasPoints.slice(1).forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();

        ctx.fillStyle = annotation.color || '#A8E6CF';
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.strokeStyle = annotation.color || '#A8E6CF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw vertices
        canvasPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = annotation.color || '#A8E6CF';
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        // Calculate and display area
        const normalizedArea = coordSystem.calculateArea(annotation.points);
        const pixelArea = normalizedArea * canvasSize.width * canvasSize.height;

        // Calculate centroid for label placement
        const centroid = {
          x: canvasPoints.reduce((sum, p) => sum + p.x, 0) / canvasPoints.length,
          y: canvasPoints.reduce((sum, p) => sum + p.y, 0) / canvasPoints.length,
        };

        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.fillText(`${pixelArea.toFixed(0)} px²`, centroid.x, centroid.y);
      }
    });

    // Render current polygon being drawn
    if (currentPolygon.length > 0) {
      const canvasPoints = coordSystem.denormalizePoints(currentPolygon);

      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      canvasPoints.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });

      ctx.strokeStyle = '#A8E6CF';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw vertices
      canvasPoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? '#FF6B6B' : '#A8E6CF';
        ctx.fill();
      });
    }
  }, [annotations, currentPolygon, coordSystem, canvasSize]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <strong>Click to add vertices, double-click to complete</strong>
        {currentPolygon.length > 0 && (
          <span> - {currentPolygon.length} vertices</span>
        )}
        <button onClick={handleDoubleClick} style={{ marginLeft: 10 }}>
          Complete Polygon
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        style={{
          border: '1px solid #ccc',
          cursor: 'crosshair',
        }}
      />
      <div style={{ marginTop: 10 }}>
        <strong>Polygons drawn: {annotations.length}</strong>
      </div>
    </div>
  );
}

/**
 * Example 4: Canvas Resize Test
 *
 * Demonstrates that annotations stay in correct position when canvas is resized.
 */
export function ResizableCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations] = useState<AnnotationData[]>([
    {
      id: 'marker-1',
      type: 'marker',
      x: 0.5,
      y: 0.5,
      color: '#FF6B6B',
    },
    {
      id: 'marker-2',
      type: 'marker',
      x: 0.25,
      y: 0.25,
      color: '#4ECDC4',
    },
    {
      id: 'marker-3',
      type: 'marker',
      x: 0.75,
      y: 0.75,
      color: '#FFD93D',
    },
  ]);

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const coordSystem = useCoordinateSystem({
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    zoom: 1.0,
    panX: 0,
    panY: 0,
  });

  // Render annotations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Render each annotation
    annotations.forEach((annotation) => {
      if (annotation.type === 'marker') {
        const pos = coordSystem.toCanvas(annotation.x, annotation.y);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = annotation.color || '#FF6B6B';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [annotations, coordSystem, canvasSize]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setCanvasSize({ width: 800, height: 600 })}>
          800x600
        </button>
        <button onClick={() => setCanvasSize({ width: 1200, height: 900 })}>
          1200x900
        </button>
        <button onClick={() => setCanvasSize({ width: 400, height: 300 })}>
          400x300
        </button>
        <span style={{ marginLeft: 10 }}>
          Current: {canvasSize.width}x{canvasSize.height}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          border: '1px solid #ccc',
        }}
      />
      <div style={{ marginTop: 10 }}>
        <strong>Test:</strong> Click the buttons to resize the canvas. The markers
        should stay at the same relative positions (center, top-left quarter, bottom-right quarter).
      </div>
    </div>
  );
}

/**
 * Example 5: Complete Demo with All Features
 */
export function CompleteDemoCanvas() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Coordinate System Examples</h1>

      <section style={{ marginBottom: 40 }}>
        <h2>1. Basic Markers</h2>
        <p>Click to add markers. Test zoom controls.</p>
        <BasicAnnotationCanvas />
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>2. Line Measurement</h2>
        <p>Click twice to draw a line with pixel distance.</p>
        <LineDrawingCanvas />
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>3. Polygon Area</h2>
        <p>Click to add vertices, double-click to complete polygon with area measurement.</p>
        <PolygonCanvas />
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>4. Canvas Resize Test</h2>
        <p>Resize the canvas and verify markers stay at correct positions.</p>
        <ResizableCanvas />
      </section>
    </div>
  );
}
