import { CheckCircle, AlertCircle, Ruler } from 'lucide-react';
import { cn } from '../utils/cn';

export interface CalibrationStatusProps {
  isCalibrated: boolean;
  metersPerPixel: number;
  referenceLength?: number;
  pixelDistance?: number;
  className?: string;
}

/**
 * CalibrationStatus Component
 *
 * Displays the current calibration status with visual indicators.
 *
 * Features:
 * - Color-coded status (green = calibrated, red = not calibrated)
 * - Display scale information
 * - Show reference measurements
 * - Compact and informative design
 */
export function CalibrationStatus({
  isCalibrated,
  metersPerPixel,
  referenceLength,
  pixelDistance,
  className,
}: CalibrationStatusProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors',
        isCalibrated
          ? 'bg-green-50 border-green-300 text-green-900'
          : 'bg-red-50 border-red-300 text-red-900',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {isCalibrated ? (
          <CheckCircle className="w-5 h-5" aria-label="Calibrated" />
        ) : (
          <AlertCircle className="w-5 h-5" aria-label="Not calibrated" />
        )}
      </div>

      {/* Status Content */}
      <div className="flex-1 min-w-0">
        {isCalibrated ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              <span className="text-sm font-semibold">Calibrated</span>
            </div>
            <div className="text-xs space-y-0.5">
              <div>
                <strong>Scale:</strong> 1 pixel = {metersPerPixel.toFixed(6)} m
              </div>
              {referenceLength && pixelDistance && (
                <div>
                  <strong>Reference:</strong> {referenceLength.toFixed(2)}m = {Math.round(pixelDistance)} px
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-sm font-semibold">Not Calibrated</span>
            <p className="text-xs">Draw a reference line to set scale</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version for toolbar
 */
export function CalibrationStatusCompact({
  isCalibrated,
  metersPerPixel,
  className,
}: Pick<CalibrationStatusProps, 'isCalibrated' | 'metersPerPixel' | 'className'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors',
        isCalibrated
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {isCalibrated ? (
        <>
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Scale: {metersPerPixel.toFixed(6)} m/px</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Not Calibrated</span>
        </>
      )}
    </div>
  );
}
