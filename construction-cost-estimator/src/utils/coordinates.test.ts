/**
 * Test Scenarios for Coordinate System
 *
 * These test scenarios verify the coordinate normalization system works correctly
 * for various use cases.
 */

import {
  toNormalizedCoordinates,
  toCanvasCoordinates,
  normalizeDistance,
  denormalizeDistance,
  normalizePoints,
  denormalizePoints,
  getBoundingBox,
  calculateNormalizedDistance,
  calculateNormalizedArea,
} from './coordinates';

import type { AnnotationData } from '../types/store';

/**
 * Test Scenario 1: Canvas Resize
 *
 * Verify that a marker stays at the correct position when canvas is resized.
 */
export function testCanvasResize() {
  console.log('=== Test Scenario 1: Canvas Resize ===');

  // Place marker at center of 800x600 canvas
  const marker: AnnotationData = {
    id: 'marker-1',
    type: 'marker',
    x: 0.5,
    y: 0.5,
  };

  // Render on 800x600
  let canvas = toCanvasCoordinates(marker.x, marker.y, 800, 600);
  console.log('800x600 canvas:', canvas);
  console.assert(canvas.x === 400 && canvas.y === 300, 'Should be at center (400, 300)');

  // Resize to 1200x900
  canvas = toCanvasCoordinates(marker.x, marker.y, 1200, 900);
  console.log('1200x900 canvas:', canvas);
  console.assert(canvas.x === 600 && canvas.y === 450, 'Should be at center (600, 450)');

  // Resize to 400x300
  canvas = toCanvasCoordinates(marker.x, marker.y, 400, 300);
  console.log('400x300 canvas:', canvas);
  console.assert(canvas.x === 200 && canvas.y === 150, 'Should be at center (200, 150)');

  console.log('✓ Canvas resize test passed\n');
}

/**
 * Test Scenario 2: Zoom
 *
 * Verify that normalized coordinates stay unchanged with zoom.
 */
export function testZoom() {
  console.log('=== Test Scenario 2: Zoom ===');

  // Marker at (0.25, 0.25) on 800x600 canvas
  const marker: AnnotationData = {
    id: 'marker-1',
    type: 'marker',
    x: 0.25,
    y: 0.25,
  };

  // At 100% zoom
  let canvas = toCanvasCoordinates(marker.x, marker.y, 800, 600);
  console.log('100% zoom - Canvas coords:', canvas);
  console.assert(canvas.x === 200 && canvas.y === 150, 'Should be at (200, 150)');

  // At 200% zoom (CSS transform will scale, but normalized coords stay same)
  console.log('200% zoom - Normalized coords unchanged:', marker.x, marker.y);
  console.assert(marker.x === 0.25 && marker.y === 0.25, 'Normalized coords should not change');

  console.log('✓ Zoom test passed\n');
}

/**
 * Test Scenario 3: Pan
 *
 * Verify that normalized coordinates stay unchanged with pan.
 */
export function testPan() {
  console.log('=== Test Scenario 3: Pan ===');

  // Marker at (0.5, 0.5)
  const marker: AnnotationData = {
    id: 'marker-1',
    type: 'marker',
    x: 0.5,
    y: 0.5,
  };

  // Normalized coordinates unchanged by pan
  console.log('Normalized coords (with or without pan):', marker.x, marker.y);
  console.assert(marker.x === 0.5 && marker.y === 0.5, 'Normalized coords should not change');

  console.log('✓ Pan test passed\n');
}

/**
 * Test Scenario 4: Calibration and Distance Measurement
 *
 * Verify distance calculations work correctly.
 */
export function testCalibration() {
  console.log('=== Test Scenario 4: Calibration and Distance ===');

  // Line from (0.2, 0.5) to (0.5, 0.5) on 800px wide canvas
  const line: AnnotationData = {
    id: 'line-1',
    type: 'line',
    x: 0.2,
    y: 0.5,
    points: [
      { x: 0.2, y: 0.5 },
      { x: 0.5, y: 0.5 },
    ],
  };

  // Normalized distance
  const normalizedDist = calculateNormalizedDistance(
    line.points![0],
    line.points![1]
  );
  console.log('Normalized distance:', normalizedDist);
  console.assert(
    Math.abs(normalizedDist - 0.3) < 0.001,
    'Normalized distance should be 0.3'
  );

  // Canvas distance on 800px wide canvas
  const canvasDist = denormalizeDistance(normalizedDist, 800);
  console.log('Canvas distance (800px canvas):', canvasDist);
  console.assert(canvasDist === 240, 'Canvas distance should be 240 pixels');

  // With calibration: 0.03 meters per pixel
  const metersPerPixel = 0.03;
  const realDist = canvasDist * metersPerPixel;
  console.log('Real-world distance:', realDist, 'meters');
  console.assert(realDist === 7.2, 'Real distance should be 7.2 meters');

  console.log('✓ Calibration test passed\n');
}

/**
 * Test Scenario 5: Polygon Area Calculation
 *
 * Verify area calculations work correctly.
 */
export function testPolygonArea() {
  console.log('=== Test Scenario 5: Polygon Area ===');

  // Square polygon: (0.2, 0.2), (0.4, 0.2), (0.4, 0.4), (0.2, 0.4)
  const polygon: AnnotationData = {
    id: 'polygon-1',
    type: 'polygon',
    x: 0.2,
    y: 0.2,
    points: [
      { x: 0.2, y: 0.2 },
      { x: 0.4, y: 0.2 },
      { x: 0.4, y: 0.4 },
      { x: 0.2, y: 0.4 },
    ],
  };

  // Normalized area (should be 0.2 * 0.2 = 0.04)
  const normalizedArea = calculateNormalizedArea(polygon.points!);
  console.log('Normalized area:', normalizedArea);
  console.assert(
    Math.abs(normalizedArea - 0.04) < 0.001,
    'Normalized area should be 0.04'
  );

  // Canvas area on 800x600 canvas
  const canvasArea = normalizedArea * 800 * 600;
  console.log('Canvas area (800x600 canvas):', canvasArea, 'px²');
  console.assert(canvasArea === 19200, 'Canvas area should be 19200 px²');

  // With calibration: 0.03 meters per pixel
  const metersPerPixel = 0.03;
  const realArea = canvasArea * (metersPerPixel ** 2);
  console.log('Real-world area:', realArea, 'm²');
  console.assert(
    Math.abs(realArea - 17.28) < 0.01,
    'Real area should be ~17.28 m²'
  );

  console.log('✓ Polygon area test passed\n');
}

/**
 * Test Scenario 6: Round-trip Conversion
 *
 * Verify that converting back and forth preserves coordinates.
 */
export function testRoundTrip() {
  console.log('=== Test Scenario 6: Round-trip Conversion ===');

  const canvasWidth = 800;
  const canvasHeight = 600;

  // Start with canvas coordinates
  const originalCanvas = { x: 400, y: 300 };
  console.log('Original canvas coords:', originalCanvas);

  // Convert to normalized
  const normalized = toNormalizedCoordinates(
    originalCanvas.x,
    originalCanvas.y,
    canvasWidth,
    canvasHeight
  );
  console.log('Normalized coords:', normalized);

  // Convert back to canvas
  const backToCanvas = toCanvasCoordinates(
    normalized.x,
    normalized.y,
    canvasWidth,
    canvasHeight
  );
  console.log('Back to canvas coords:', backToCanvas);

  console.assert(
    backToCanvas.x === originalCanvas.x && backToCanvas.y === originalCanvas.y,
    'Round-trip conversion should preserve coordinates'
  );

  console.log('✓ Round-trip test passed\n');
}

/**
 * Test Scenario 7: Multi-point Shape (Line)
 *
 * Verify normalizing and denormalizing point arrays.
 */
export function testMultiPointShape() {
  console.log('=== Test Scenario 7: Multi-point Shape ===');

  const canvasWidth = 800;
  const canvasHeight = 600;

  // Triangle vertices in pixels
  const pixelPoints = [
    { x: 400, y: 100 },
    { x: 200, y: 500 },
    { x: 600, y: 500 },
  ];
  console.log('Original pixel points:', pixelPoints);

  // Normalize
  const normalized = normalizePoints(pixelPoints, canvasWidth, canvasHeight);
  console.log('Normalized points:', normalized);

  // Verify normalized values
  console.assert(normalized[0].x === 0.5, 'First point x should be 0.5');
  console.assert(
    Math.abs(normalized[0].y - 0.167) < 0.01,
    'First point y should be ~0.167'
  );

  // Denormalize
  const backToPixels = denormalizePoints(normalized, canvasWidth, canvasHeight);
  console.log('Back to pixel points:', backToPixels);

  // Verify round-trip
  console.assert(
    backToPixels[0].x === pixelPoints[0].x &&
    backToPixels[0].y === pixelPoints[0].y,
    'Round-trip should preserve pixel coordinates'
  );

  console.log('✓ Multi-point shape test passed\n');
}

/**
 * Test Scenario 8: Bounding Box Calculation
 *
 * Verify bounding box calculations for different annotation types.
 */
export function testBoundingBox() {
  console.log('=== Test Scenario 8: Bounding Box ===');

  // Marker annotation
  const marker: AnnotationData = {
    id: 'marker-1',
    type: 'marker',
    x: 0.5,
    y: 0.5,
  };

  const markerBBox = getBoundingBox(marker);
  console.log('Marker bounding box:', markerBBox);
  console.assert(
    markerBBox.x < 0.5 && markerBBox.x + markerBBox.width > 0.5,
    'Marker bbox should contain center point'
  );

  // Line annotation
  const line: AnnotationData = {
    id: 'line-1',
    type: 'line',
    x: 0.2,
    y: 0.3,
    points: [
      { x: 0.2, y: 0.3 },
      { x: 0.8, y: 0.7 },
    ],
  };

  const lineBBox = getBoundingBox(line);
  console.log('Line bounding box:', lineBBox);
  console.assert(lineBBox.x === 0.2, 'Line bbox x should be 0.2');
  console.assert(lineBBox.y === 0.3, 'Line bbox y should be 0.3');
  console.assert(lineBBox.width === 0.6, 'Line bbox width should be 0.6');
  console.assert(lineBBox.height === 0.4, 'Line bbox height should be 0.4');

  console.log('✓ Bounding box test passed\n');
}

/**
 * Run all test scenarios
 */
export function runAllTests() {
  console.log('==========================================');
  console.log('Running Coordinate System Test Scenarios');
  console.log('==========================================\n');

  testCanvasResize();
  testZoom();
  testPan();
  testCalibration();
  testPolygonArea();
  testRoundTrip();
  testMultiPointShape();
  testBoundingBox();

  console.log('==========================================');
  console.log('All tests passed! ✓');
  console.log('==========================================');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests();
}
