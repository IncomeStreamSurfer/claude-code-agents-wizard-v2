import { useState } from 'react';
import { PDFViewerWithZoom } from './PDFViewerWithZoom';
import { CalibrationTool } from './CalibrationTool';
import { CalibrationToolbar } from './CalibrationToolbar';
import { CalibrationStatus } from './CalibrationStatus';
import { useAppStore } from '../store/useAppStore';

/**
 * CalibrationDemo Component
 *
 * Demonstration of the complete calibration system integrated with PDFViewerWithZoom.
 *
 * Features demonstrated:
 * - Calibration tool activation/deactivation
 * - Visual status display
 * - Integration with PDF viewer
 * - State management with Zustand
 * - Reset functionality
 *
 * Usage:
 * ```tsx
 * import { CalibrationDemo } from './components/CalibrationDemo';
 *
 * function App() {
 *   return <CalibrationDemo pdfUrl="/path/to/drawing.pdf" />;
 * }
 * ```
 */
export function CalibrationDemo({ pdfUrl }: { pdfUrl: string }) {
  const [isCalibrationActive, setIsCalibrationActive] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const calibrationData = useAppStore((state) => state.calibrationData);

  /**
   * Handle PDF page load to get canvas dimensions
   */
  const handlePageLoadComplete = (canvas: HTMLCanvasElement) => {
    const width = parseFloat(canvas.style.width) || canvas.width;
    const height = parseFloat(canvas.style.height) || canvas.height;
    setCanvasWidth(width);
    setCanvasHeight(height);
  };

  /**
   * Handle calibration completion
   */
  const handleCalibrationComplete = (data: any) => {
    console.log('Calibration complete:', data);

    // Show success message
    alert(
      `Calibration successful!\n\n` +
      `Scale: ${data.metersPerPixel.toFixed(6)} meters/pixel\n` +
      `Reference: ${data.referenceLength.toFixed(2)}m = ${Math.round(data.pixelDistance)} pixels`
    );
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Calibration Tool Demo
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Draw a reference line on the PDF to set the scale
              </p>
            </div>

            {/* Calibration Toolbar */}
            <CalibrationToolbar
              isCalibrationActive={isCalibrationActive}
              onToggleCalibration={() => setIsCalibrationActive(!isCalibrationActive)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* PDF Viewer */}
        <PDFViewerWithZoom
          pdfUrl={pdfUrl}
          pageNumber={1}
          onPageLoadComplete={handlePageLoadComplete}
        />

        {/* Calibration Tool Overlay */}
        {canvasWidth > 0 && canvasHeight > 0 && (
          <CalibrationTool
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            isActive={isCalibrationActive}
            onDeactivate={() => setIsCalibrationActive(false)}
            onCalibrationComplete={handleCalibrationComplete}
          />
        )}

        {/* Instructions Panel */}
        {!calibrationData.isCalibrated && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 max-w-md z-10">
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                How to Calibrate
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Click the "Calibrate" button</li>
                <li>Click on the start of a known measurement</li>
                <li>Click on the end of that measurement</li>
                <li>Enter the real-world length in the dialog</li>
                <li>Confirm to set the scale</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Status */}
      <footer className="bg-white border-t shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <CalibrationStatus
            isCalibrated={calibrationData.isCalibrated}
            metersPerPixel={calibrationData.metersPerPixel}
            referenceLength={calibrationData.referenceLength}
            pixelDistance={calibrationData.pixelDistance}
          />

          {/* Additional Info */}
          {calibrationData.isCalibrated && (
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Example Conversions:
              </h4>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                <div>
                  <strong>100 pixels =</strong>{' '}
                  {(100 * calibrationData.metersPerPixel).toFixed(3)}m
                </div>
                <div>
                  <strong>500 pixels =</strong>{' '}
                  {(500 * calibrationData.metersPerPixel).toFixed(3)}m
                </div>
                <div>
                  <strong>1 meter =</strong>{' '}
                  {Math.round(1 / calibrationData.metersPerPixel)} pixels
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
