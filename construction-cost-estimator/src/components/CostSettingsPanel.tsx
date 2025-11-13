import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import type { PanelSettings } from './CostEstimationPanel';

/**
 * Props for CostSettingsPanel component
 */
export interface CostSettingsPanelProps {
  settings: PanelSettings;
  onClose: () => void;
  onChange: (settings: Partial<PanelSettings>) => void;
}

/**
 * Available currency options
 */
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

/**
 * Default settings
 */
const DEFAULT_SETTINGS: PanelSettings = {
  currency: 'USD',
  decimalPlaces: 2,
  groupBy: 'category',
  showUnits: true,
  showPercentages: true,
  showZeroItems: false,
  autoRefresh: true,
};

/**
 * CostSettingsPanel - Modal dialog for panel settings
 *
 * Features:
 * - Currency selection
 * - Decimal places (0-3)
 * - Grouping options (by category, page, label)
 * - Display toggles (units, percentages, zero items)
 * - Auto-refresh toggle
 * - Save and reset functionality
 */
export const CostSettingsPanel: React.FC<CostSettingsPanelProps> = ({
  settings,
  onClose,
  onChange,
}) => {
  const [localSettings, setLocalSettings] = useState<PanelSettings>(settings);

  // Update local setting
  const updateSetting = <K extends keyof PanelSettings>(
    key: K,
    value: PanelSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // Save settings
  const handleSave = () => {
    onChange(localSettings);
    onClose();
  };

  // Reset to defaults
  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  // Cancel without saving
  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Panel Settings</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Currency
            </label>
            <select
              value={localSettings.currency}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          {/* Decimal Places */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Decimal Places
            </label>
            <div className="flex items-center gap-4">
              {[0, 1, 2, 3].map(places => (
                <button
                  key={places}
                  onClick={() => updateSetting('decimalPlaces', places)}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    localSettings.decimalPlaces === places
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {places}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Example: 1234.{localSettings.decimalPlaces === 0 ? '00' : '56'.substring(0, localSettings.decimalPlaces)}
            </p>
          </div>

          {/* Grouping Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Group Items By
            </label>
            <div className="space-y-2">
              {[
                { value: 'category', label: 'Category', description: 'Group by item category' },
                { value: 'page', label: 'Page', description: 'Group by PDF page number' },
                { value: 'label', label: 'Label', description: 'Group by label type' },
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    localSettings.groupBy === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="groupBy"
                    value={option.value}
                    checked={localSettings.groupBy === option.value}
                    onChange={(e) => updateSetting('groupBy', e.target.value as any)}
                    className="mt-0.5 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Display Options
            </label>
            <div className="space-y-3">
              {[
                {
                  key: 'showUnits' as const,
                  label: 'Show Units',
                  description: 'Display measurement units (m, m², ea)',
                },
                {
                  key: 'showPercentages' as const,
                  label: 'Show Percentages',
                  description: 'Display percentage of total for categories',
                },
                {
                  key: 'showZeroItems' as const,
                  label: 'Show Zero-Cost Items',
                  description: 'Include items with zero cost in lists',
                },
                {
                  key: 'autoRefresh' as const,
                  label: 'Auto-Refresh',
                  description: 'Automatically recalculate costs when changes occur',
                },
              ].map(option => (
                <label
                  key={option.key}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={localSettings[option.key]}
                    onChange={(e) => updateSetting(option.key, e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Panel Width (Future Enhancement) */}
          <div className="opacity-50 pointer-events-none">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Panel Width (Coming Soon)
            </label>
            <select
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
            >
              <option>300px - Compact</option>
              <option>400px - Default</option>
              <option>500px - Wide</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSettingsPanel;
