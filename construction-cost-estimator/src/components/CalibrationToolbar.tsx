import { Ruler, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { CalibrationStatusCompact } from './CalibrationStatus';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

export interface CalibrationToolbarProps {
  /** Whether calibration tool is currently active */
  isCalibrationActive: boolean;
  /** Callback to activate/deactivate calibration tool */
  onToggleCalibration: () => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * CalibrationToolbar Component
 *
 * Toolbar integration for calibration functionality.
 *
 * Features:
 * - Calibrate button to activate tool
 * - Visual status indicator
 * - Reset button when calibrated
 * - Compact design for toolbar
 */
export function CalibrationToolbar({
  isCalibrationActive,
  onToggleCalibration,
  className,
}: CalibrationToolbarProps) {
  const calibrationData = useAppStore((state) => state.calibrationData);
  const resetCalibration = useAppStore((state) => state.resetCalibration);

  const handleReset = () => {
    if (window.confirm('Reset calibration? This will require re-calibrating for accurate measurements.')) {
      resetCalibration();
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Calibration Status */}
      <CalibrationStatusCompact
        isCalibrated={calibrationData.isCalibrated}
        metersPerPixel={calibrationData.metersPerPixel}
      />

      {/* Calibrate Button */}
      <Button
        variant={isCalibrationActive ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleCalibration}
        className={cn(
          'flex items-center gap-2',
          isCalibrationActive && 'bg-blue-600 hover:bg-blue-700'
        )}
        title={
          isCalibrationActive
            ? 'Click to cancel calibration'
            : 'Click to start calibration'
        }
      >
        <Ruler className="w-4 h-4" />
        <span>{isCalibrationActive ? 'Cancel' : 'Calibrate'}</span>
      </Button>

      {/* Reset Button (only shown when calibrated) */}
      {calibrationData.isCalibrated && !isCalibrationActive && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          title="Reset calibration"
          className="text-gray-600 hover:text-red-600 hover:bg-red-50"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Standalone calibration button for simple integration
 */
export function CalibrationButton({
  onClick,
  isActive,
  className,
}: {
  onClick: () => void;
  isActive: boolean;
  className?: string;
}) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={cn('flex items-center gap-2', className)}
      title="Set scale by drawing a reference line"
    >
      <Ruler className="w-4 h-4" />
      <span>Calibrate</span>
    </Button>
  );
}
