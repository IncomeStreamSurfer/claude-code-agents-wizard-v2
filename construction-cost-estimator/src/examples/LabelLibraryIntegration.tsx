/**
 * LabelLibrary Integration Example
 *
 * This file demonstrates how to integrate the LabelLibrary components
 * into your application.
 */

import { LabelLibrary } from '../components/LabelLibrary';
import { LabelEditor } from '../components/LabelEditor';
import { LabelCategory } from '../components/LabelCategory';
import { useAppStore } from '../store/useAppStore';
import { useState } from 'react';
import type { LabelDefinition } from '../types/store';

/**
 * Example 1: Basic Label Library
 *
 * Shows the full label library with all features enabled.
 */
export function BasicLabelLibraryExample() {
  const handleLabelSelect = (label: LabelDefinition) => {
    console.log('Label selected:', label);
    // The library automatically:
    // 1. Selects the label in the store
    // 2. Activates the label tool
    // 3. Makes the label ready for annotation
  };

  return (
    <div className="h-screen">
      <LabelLibrary
        onLabelSelect={handleLabelSelect}
        showActions={true}
      />
    </div>
  );
}

/**
 * Example 2: Compact Label Picker
 *
 * Shows a simplified label picker without management actions.
 */
export function CompactLabelPickerExample() {
  return (
    <div className="w-96 h-[600px] border rounded-lg shadow-lg">
      <LabelLibrary
        compact={true}
        showActions={false}
        onLabelSelect={(label) => {
          console.log('Quick select:', label);
        }}
      />
    </div>
  );
}

/**
 * Example 3: Filtered Label Library
 *
 * Shows only specific categories.
 */
export function FilteredLabelLibraryExample() {
  return (
    <LabelLibrary
      categories={['Openings', 'Structure']}
      showActions={true}
      onLabelSelect={(label) => {
        console.log('Filtered label selected:', label);
      }}
    />
  );
}

/**
 * Example 4: Custom Label Management
 *
 * Shows how to programmatically add, edit, and delete labels.
 */
export function CustomLabelManagementExample() {
  const addLabel = useAppStore((state) => state.addLabel);
  const updateLabel = useAppStore((state) => state.updateLabel);
  const deleteLabel = useAppStore((state) => state.deleteLabel);

  const createCustomWindow = () => {
    const newLabel: LabelDefinition = {
      id: `label-custom-${Date.now()}`,
      name: 'Custom Window Type',
      color: '#3B82F6',
      icon: '🪟',
      unit: 'count',
      costPerUnit: 650,
      category: 'Openings',
      description: 'Custom double-glazed window',
      createdAt: new Date(),
    };

    addLabel(newLabel);
    console.log('Created custom label:', newLabel);
  };

  const updateWindowCost = (labelId: string) => {
    updateLabel(labelId, { costPerUnit: 700 });
    console.log('Updated label cost');
  };

  const deleteCustomLabel = (labelId: string) => {
    if (confirm('Delete this label?')) {
      deleteLabel(labelId);
      console.log('Deleted label:', labelId);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <button
          onClick={createCustomWindow}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Custom Window
        </button>
      </div>

      <LabelLibrary
        onLabelSelect={(label) => console.log('Selected:', label)}
        showActions={true}
      />
    </div>
  );
}

/**
 * Example 5: Label Editor Dialog
 *
 * Shows how to use the LabelEditor component for creating/editing labels.
 */
export function LabelEditorExample() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelDefinition | null>(null);

  const handleCreateNew = () => {
    setEditingLabel(null);
    setShowEditor(true);
  };

  const handleEdit = (label: LabelDefinition) => {
    setEditingLabel(label);
    setShowEditor(true);
  };

  return (
    <div className="p-6">
      <button
        onClick={handleCreateNew}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
      >
        Create New Label
      </button>

      {showEditor && (
        <LabelEditor
          label={editingLabel}
          onClose={() => {
            setShowEditor(false);
            setEditingLabel(null);
          }}
        />
      )}

      <LabelLibrary
        onLabelSelect={(label) => handleEdit(label)}
        showActions={true}
      />
    </div>
  );
}

/**
 * Example 6: Individual Category Component
 *
 * Shows how to use individual category components.
 */
export function IndividualCategoryExample() {
  const labels = useAppStore((state) => state.labels);
  const selectedLabelId = useAppStore((state) => state.selectedLabelId);
  const selectLabel = useAppStore((state) => state.selectLabel);
  const setActiveTool = useAppStore((state) => state.setActiveTool);

  // Filter labels by category
  const openingsLabels = labels.filter((l) => l.category === 'Openings');
  const structureLabels = labels.filter((l) => l.category === 'Structure');

  const handleLabelSelect = (label: LabelDefinition) => {
    selectLabel(label.id);
    setActiveTool('label');
    console.log('Selected:', label);
  };

  return (
    <div className="p-6 space-y-6">
      <LabelCategory
        category="Openings"
        description="Windows, Doors, Gates, Skylights"
        icon="🪟"
        labels={openingsLabels}
        selectedLabelId={selectedLabelId}
        onLabelSelect={handleLabelSelect}
        showActions={true}
      />

      <LabelCategory
        category="Structure"
        description="Walls, Columns, Beams, Foundations"
        icon="🏗️"
        labels={structureLabels}
        selectedLabelId={selectedLabelId}
        onLabelSelect={handleLabelSelect}
        showActions={true}
      />
    </div>
  );
}

/**
 * Example 7: Full Page Integration
 *
 * Shows a complete page with label library and annotation canvas.
 */
export function FullPageIntegrationExample() {
  const selectedLabel = useAppStore((state) =>
    state.labels.find((l) => l.id === state.selectedLabelId)
  );

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Label Library */}
      <div className="w-96 border-r bg-white overflow-y-auto">
        <LabelLibrary
          onLabelSelect={(label) => {
            console.log('Label selected for annotation:', label);
          }}
          showActions={true}
        />
      </div>

      {/* Main Content - Annotation Canvas */}
      <div className="flex-1 bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Annotation Canvas</h2>

          {selectedLabel ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-900">Selected Label</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-2xl"
                    style={{ backgroundColor: selectedLabel.color }}
                  >
                    {selectedLabel.icon}
                  </div>
                  <div>
                    <div className="font-medium">{selectedLabel.name}</div>
                    <div className="text-sm text-gray-600">
                      {selectedLabel.category} - {selectedLabel.unit}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-gray-600">
                Click on the canvas to place a label annotation.
                The label will use the color, icon, and unit type from the selected label.
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-12">
              Select a label from the library to start annotating
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 8: Store Integration
 *
 * Shows how to work with labels in the Zustand store.
 */
export function StoreIntegrationExample() {
  // Get store state
  const labels = useAppStore((state) => state.labels);
  const selectedLabelId = useAppStore((state) => state.selectedLabelId);

  // Get store actions
  const selectLabel = useAppStore((state) => state.selectLabel);
  const addLabel = useAppStore((state) => state.addLabel);
  const updateLabel = useAppStore((state) => state.updateLabel);
  const deleteLabel = useAppStore((state) => state.deleteLabel);

  // Example: Programmatically select a label
  const selectWindowLabel = () => {
    const windowLabel = labels.find((l) => l.name === 'Windows');
    if (windowLabel) {
      selectLabel(windowLabel.id);
    }
  };

  // Example: Create a custom label
  const createDoorLabel = () => {
    addLabel({
      id: `label-door-${Date.now()}`,
      name: 'Fire Door',
      color: '#EF4444',
      icon: '🚪',
      unit: 'count',
      costPerUnit: 1200,
      category: 'Openings',
      description: 'Fire-rated door',
      createdAt: new Date(),
    });
  };

  // Example: Update label pricing
  const updatePricing = () => {
    labels.forEach((label) => {
      if (label.category === 'Openings') {
        updateLabel(label.id, {
          costPerUnit: (label.costPerUnit || 0) * 1.1, // 10% increase
        });
      }
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Store Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={selectWindowLabel}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Select Window
          </button>
          <button
            onClick={createDoorLabel}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
          >
            Add Fire Door
          </button>
          <button
            onClick={updatePricing}
            className="px-3 py-1 bg-orange-600 text-white rounded text-sm"
          >
            Update Pricing +10%
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Current State</h3>
        <div className="text-sm">
          <div>Total Labels: {labels.length}</div>
          <div>Selected: {selectedLabelId || 'None'}</div>
        </div>
      </div>

      <LabelLibrary showActions={true} />
    </div>
  );
}
