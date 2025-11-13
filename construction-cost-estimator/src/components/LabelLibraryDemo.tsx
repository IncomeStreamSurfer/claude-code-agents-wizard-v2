import { useState } from 'react';
import { LabelLibrary } from './LabelLibrary';
import { LabelCategory } from './LabelCategory';
import { useAppStore } from '../store/useAppStore';
import type { LabelDefinition } from '../types/store';

/**
 * LabelLibraryDemo Component
 *
 * Demonstrates the LabelLibrary and LabelCategory components.
 *
 * Features:
 * - Full LabelLibrary component
 * - Individual LabelCategory component
 * - Label selection handling
 * - State management integration
 *
 * Usage:
 * ```tsx
 * <LabelLibraryDemo />
 * ```
 */
export function LabelLibraryDemo() {
  const [selectedDemo, setSelectedDemo] = useState<'library' | 'category'>('library');
  const labels = useAppStore((state) => state.labels);
  const selectedLabelId = useAppStore((state) => state.selectedLabelId);

  // Group labels by category for category demo
  const labelsByCategory = labels.reduce((acc, label) => {
    const category = label.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(label);
    return acc;
  }, {} as Record<string, LabelDefinition[]>);

  const handleLabelSelect = (label: LabelDefinition) => {
    console.log('Label selected:', label);
  };

  const handleEditLabel = (label: LabelDefinition) => {
    console.log('Edit label:', label);
  };

  const handleDeleteLabel = (labelId: string) => {
    console.log('Delete label:', labelId);
  };

  const handleAddLabel = (category?: string) => {
    console.log('Add label to category:', category || 'default');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Label Library Demo</h1>
          <p className="text-gray-600">
            Explore the label library components for managing construction labels.
          </p>

          {/* Demo Selector */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSelectedDemo('library')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDemo === 'library'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Full Library
            </button>
            <button
              onClick={() => setSelectedDemo('category')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDemo === 'category'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Category View
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {selectedDemo === 'library' ? (
            // Full Library Demo
            <div className="h-[800px]">
              <LabelLibrary
                onLabelSelect={handleLabelSelect}
                showActions={true}
              />
            </div>
          ) : (
            // Category View Demo
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Category View</h2>
                <p className="text-gray-600 mb-6">
                  Individual category components with collapsible sections.
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(labelsByCategory).map(([category, categoryLabels]) => (
                  <LabelCategory
                    key={category}
                    category={category}
                    labels={categoryLabels}
                    selectedLabelId={selectedLabelId}
                    onLabelSelect={handleLabelSelect}
                    onEditLabel={handleEditLabel}
                    onDeleteLabel={handleDeleteLabel}
                    onAddLabel={handleAddLabel}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Features</h3>
          <ul className="text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Search & Filter:</strong> Search labels by name, category, or unit type.
                Filter by category with counts.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Quick Select:</strong> Click any label to select it and activate the label
                tool.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Label Management:</strong> Add, edit, and delete custom labels with full
                validation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Responsive Design:</strong> Adapts to mobile, tablet, and desktop screens.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Keyboard Navigation:</strong> Press ESC to clear selection, or use arrow
                keys to navigate.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Category Organization:</strong> Labels grouped by construction categories
                (Openings, Structure, etc.).
              </span>
            </li>
          </ul>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-blue-600">{labels.length}</div>
            <div className="text-gray-600 mt-1">Total Labels</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600">
              {Object.keys(labelsByCategory).length}
            </div>
            <div className="text-gray-600 mt-1">Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-purple-600">
              {labels.filter(l => l.costPerUnit !== undefined).length}
            </div>
            <div className="text-gray-600 mt-1">With Pricing</div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Example</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {`import { LabelLibrary } from './components/LabelLibrary';
import { useAppStore } from './store/useAppStore';

function MyComponent() {
  const handleLabelSelect = (label) => {
    console.log('Selected label:', label);
  };

  return (
    <LabelLibrary
      onLabelSelect={handleLabelSelect}
      showActions={true}
      compact={false}
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
