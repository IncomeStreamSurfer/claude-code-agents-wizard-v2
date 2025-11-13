import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Label } from './ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Unit conversion factors to meters
 */
const UNIT_CONVERSIONS = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
} as const;

type Unit = keyof typeof UNIT_CONVERSIONS;

export interface CalibrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pixelDistance: number;
  onConfirm: (lengthInMeters: number) => void;
  onCancel: () => void;
}

/**
 * CalibrationDialog Component
 *
 * Dialog for inputting the real-world length of the calibration line.
 * Includes unit conversion and validation.
 *
 * Features:
 * - Input field for real-world length
 * - Unit selection dropdown (mm, cm, m, km)
 * - Auto-conversion to meters
 * - Validation for positive numbers
 * - Helper text with example
 * - Keyboard support (Enter to confirm, Escape to cancel)
 */
export function CalibrationDialog({
  open,
  onOpenChange,
  pixelDistance,
  onConfirm,
  onCancel,
}: CalibrationDialogProps) {
  const [length, setLength] = useState<string>('');
  const [unit, setUnit] = useState<Unit>('m');
  const [error, setError] = useState<string>('');

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setLength('');
      setUnit('m');
      setError('');
    }
  }, [open]);

  /**
   * Validate and convert length to meters
   */
  const getLengthInMeters = (): number | null => {
    const numericLength = parseFloat(length);

    if (isNaN(numericLength) || numericLength <= 0) {
      setError('Please enter a positive number');
      return null;
    }

    // Convert to meters
    const lengthInMeters = numericLength * UNIT_CONVERSIONS[unit];

    if (lengthInMeters < 0.001) {
      setError('Length is too small. Please use a larger reference.');
      return null;
    }

    if (lengthInMeters > 10000) {
      setError('Length is too large. Please check your input.');
      return null;
    }

    return lengthInMeters;
  };

  /**
   * Handle confirm button click
   */
  const handleConfirm = () => {
    const lengthInMeters = getLengthInMeters();

    if (lengthInMeters !== null) {
      onConfirm(lengthInMeters);
      onOpenChange(false);
    }
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  /**
   * Handle Enter key to confirm
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  /**
   * Calculate scale preview
   */
  const getScalePreview = (): string | null => {
    const lengthInMeters = getLengthInMeters();
    if (lengthInMeters === null) return null;

    const metersPerPixel = lengthInMeters / pixelDistance;
    return `1 pixel = ${metersPerPixel.toFixed(6)} meters`;
  };

  const scalePreview = getScalePreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Reference Length</DialogTitle>
          <DialogDescription>
            Enter the real-world length of the line you drew ({Math.round(pixelDistance)} pixels)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Measured Pixel Distance */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <CheckCircle className="w-4 h-4" />
              <span>
                <strong>Measured:</strong> {Math.round(pixelDistance)} pixels
              </span>
            </div>
          </div>

          {/* Length Input */}
          <div className="space-y-2">
            <Label htmlFor="length">Real-world Length</Label>
            <div className="flex gap-2">
              <Input
                id="length"
                type="number"
                placeholder="Enter length"
                value={length}
                onChange={(e) => {
                  setLength(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                min="0"
                step="any"
                className="flex-1"
                autoFocus
                aria-label="Real-world length"
              />
              <Select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-24"
                aria-label="Unit"
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="m">m</option>
                <option value="km">km</option>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Example: If the line represents a 3.6m wall, enter "3.6" and select "m"
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-sm text-red-900">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Scale Preview */}
          {scalePreview && !error && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-sm text-green-900">
                <CheckCircle className="w-4 h-4" />
                <span>
                  <strong>Scale:</strong> {scalePreview}
                </span>
              </div>
            </div>
          )}

          {/* Minimum Distance Warning */}
          {pixelDistance < 10 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-sm text-yellow-900">
                <AlertCircle className="w-4 h-4" />
                <span>
                  Line is very short ({Math.round(pixelDistance)} pixels). For better accuracy, draw a longer reference line.
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!length || !!error}>
            Confirm Calibration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
