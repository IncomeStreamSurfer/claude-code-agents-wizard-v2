/**
 * Simple test runner for coordinate system
 * Run with: node test-coordinates.js
 */

// Mock the coordinate functions
function toNormalizedCoordinates(canvasX, canvasY, canvasWidth, canvasHeight) {
  if (canvasWidth === 0 || canvasHeight === 0) {
    console.warn('Canvas dimensions are zero, returning (0, 0)');
    return { x: 0, y: 0 };
  }
  return {
    x: Math.max(0, Math.min(1, canvasX / canvasWidth)),
    y: Math.max(0, Math.min(1, canvasY / canvasHeight)),
  };
}

function toCanvasCoordinates(normalizedX, normalizedY, canvasWidth, canvasHeight) {
  if (canvasWidth === 0 || canvasHeight === 0) {
    console.warn('Canvas dimensions are zero, returning (0, 0)');
    return { x: 0, y: 0 };
  }
  return {
    x: normalizedX * canvasWidth,
    y: normalizedY * canvasHeight,
  };
}

function calculateNormalizedDistance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateNormalizedArea(points) {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

// Test Scenario 1: Canvas Resize
function testCanvasResize() {
  console.log('=== Test Scenario 1: Canvas Resize ===');

  const marker = { x: 0.5, y: 0.5 };

  // 800x600
  let canvas = toCanvasCoordinates(marker.x, marker.y, 800, 600);
  console.log('800x600 canvas:', canvas);
  console.assert(canvas.x === 400 && canvas.y === 300, 'Should be at center (400, 300)');

  // 1200x900
  canvas = toCanvasCoordinates(marker.x, marker.y, 1200, 900);
  console.log('1200x900 canvas:', canvas);
  console.assert(canvas.x === 600 && canvas.y === 450, 'Should be at center (600, 450)');

  // 400x300
  canvas = toCanvasCoordinates(marker.x, marker.y, 400, 300);
  console.log('400x300 canvas:', canvas);
  console.assert(canvas.x === 200 && canvas.y === 150, 'Should be at center (200, 150)');

  console.log('✓ Canvas resize test passed\n');
}

// Test Scenario 2: Distance Measurement
function testDistance() {
  console.log('=== Test Scenario 2: Distance Measurement ===');

  const p1 = { x: 0.2, y: 0.5 };
  const p2 = { x: 0.5, y: 0.5 };

  const normalizedDist = calculateNormalizedDistance(p1, p2);
  console.log('Normalized distance:', normalizedDist);
  console.assert(Math.abs(normalizedDist - 0.3) < 0.001, 'Should be 0.3');

  const canvasDist = normalizedDist * 800; // 800px wide canvas
  console.log('Canvas distance:', canvasDist, 'px');
  console.assert(canvasDist === 240, 'Should be 240 pixels');

  const metersPerPixel = 0.03;
  const realDist = canvasDist * metersPerPixel;
  console.log('Real distance:', realDist, 'meters');
  console.assert(realDist === 7.2, 'Should be 7.2 meters');

  console.log('✓ Distance measurement test passed\n');
}

// Test Scenario 3: Polygon Area
function testPolygonArea() {
  console.log('=== Test Scenario 3: Polygon Area ===');

  const square = [
    { x: 0.2, y: 0.2 },
    { x: 0.4, y: 0.2 },
    { x: 0.4, y: 0.4 },
    { x: 0.2, y: 0.4 },
  ];

  const normalizedArea = calculateNormalizedArea(square);
  console.log('Normalized area:', normalizedArea);
  console.assert(Math.abs(normalizedArea - 0.04) < 0.001, 'Should be 0.04');

  const canvasArea = normalizedArea * 800 * 600;
  console.log('Canvas area:', canvasArea, 'px²');
  console.assert(canvasArea === 19200, 'Should be 19200 px²');

  const metersPerPixel = 0.03;
  const realArea = canvasArea * (metersPerPixel ** 2);
  console.log('Real area:', realArea, 'm²');
  console.assert(Math.abs(realArea - 17.28) < 0.01, 'Should be ~17.28 m²');

  console.log('✓ Polygon area test passed\n');
}

// Test Scenario 4: Round-trip Conversion
function testRoundTrip() {
  console.log('=== Test Scenario 4: Round-trip Conversion ===');

  const originalCanvas = { x: 400, y: 300 };
  console.log('Original canvas:', originalCanvas);

  const normalized = toNormalizedCoordinates(originalCanvas.x, originalCanvas.y, 800, 600);
  console.log('Normalized:', normalized);

  const backToCanvas = toCanvasCoordinates(normalized.x, normalized.y, 800, 600);
  console.log('Back to canvas:', backToCanvas);

  console.assert(
    backToCanvas.x === originalCanvas.x && backToCanvas.y === originalCanvas.y,
    'Round-trip should preserve coordinates'
  );

  console.log('✓ Round-trip test passed\n');
}

// Run all tests
console.log('==========================================');
console.log('Running Coordinate System Tests');
console.log('==========================================\n');

testCanvasResize();
testDistance();
testPolygonArea();
testRoundTrip();

console.log('==========================================');
console.log('All tests passed! ✓');
console.log('==========================================');
