import { useState } from 'react';
import { FileDown, Plus, Trash2 } from 'lucide-react';
import type { Project, CostItem, AnnotationData } from '../types';
import { ExportMenu } from './ExportMenu';
import { ExportDialog } from './ExportDialog';

/**
 * Demo component showcasing export functionality
 */
export function ExportDemo() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [markup, setMarkup] = useState(15);

  // Sample project data
  const sampleProject: Project = {
    id: 'demo-project-1',
    name: 'Sample Construction Project',
    description: 'A demo project showcasing export functionality',
    pdfFileName: 'floor-plan.pdf',
    pdfFileSize: 2500000, // 2.5 MB
    totalPages: 5,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  };

  // Sample cost items
  const [costItems, setCostItems] = useState<CostItem[]>([
    {
      id: '1',
      description: 'Windows (Standard)',
      quantity: 8,
      unit: 'count',
      unitCost: 500,
      totalCost: 4000,
      category: 'Openings',
      pageNumber: 1,
      notes: 'Standard double-pane windows',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      description: 'Doors (Interior)',
      quantity: 6,
      unit: 'count',
      unitCost: 300,
      totalCost: 1800,
      category: 'Openings',
      pageNumber: 1,
      notes: 'Standard interior doors',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      description: 'Doors (Exterior)',
      quantity: 2,
      unit: 'count',
      unitCost: 800,
      totalCost: 1600,
      category: 'Openings',
      pageNumber: 1,
      notes: 'Exterior steel doors',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '4',
      description: 'Drywall',
      quantity: 250,
      unit: 'square_meters',
      unitCost: 25,
      totalCost: 6250,
      category: 'Finishes',
      pageNumber: 2,
      notes: '1/2 inch drywall with finish',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
    {
      id: '5',
      description: 'Paint (Interior)',
      quantity: 300,
      unit: 'square_meters',
      unitCost: 15,
      totalCost: 4500,
      category: 'Finishes',
      pageNumber: 2,
      notes: 'Two coats, standard colors',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
    {
      id: '6',
      description: 'Flooring (Hardwood)',
      quantity: 120,
      unit: 'square_meters',
      unitCost: 80,
      totalCost: 9600,
      category: 'Finishes',
      pageNumber: 2,
      notes: 'Oak hardwood flooring',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
    {
      id: '7',
      description: 'Electrical Outlets',
      quantity: 45,
      unit: 'count',
      unitCost: 50,
      totalCost: 2250,
      category: 'Electrical',
      pageNumber: 3,
      notes: 'Standard outlets with cover plates',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17'),
    },
    {
      id: '8',
      description: 'Light Fixtures',
      quantity: 18,
      unit: 'count',
      unitCost: 150,
      totalCost: 2700,
      category: 'Electrical',
      pageNumber: 3,
      notes: 'LED ceiling fixtures',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17'),
    },
    {
      id: '9',
      description: 'Plumbing Fixtures',
      quantity: 8,
      unit: 'count',
      unitCost: 400,
      totalCost: 3200,
      category: 'Plumbing',
      pageNumber: 4,
      notes: 'Sinks, toilets, and faucets',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
    },
    {
      id: '10',
      description: 'HVAC System',
      quantity: 1,
      unit: 'count',
      unitCost: 8500,
      totalCost: 8500,
      category: 'HVAC',
      pageNumber: 5,
      notes: 'Central air system with installation',
      createdAt: new Date('2024-01-19'),
      updatedAt: new Date('2024-01-19'),
    },
  ]);

  // Sample annotations
  const sampleAnnotations: AnnotationData[] = [
    {
      id: 'ann-1',
      type: 'marker',
      pageNumber: 1,
      x: 0.25,
      y: 0.3,
      width: 0.05,
      height: 0.05,
      color: '#ef4444',
      text: 'Window 1',
      labelId: 'windows',
      quantity: 1,
      unit: 'count',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'ann-2',
      type: 'line',
      pageNumber: 1,
      x: 0.1,
      y: 0.5,
      width: 0.4,
      height: 0.02,
      color: '#3b82f6',
      text: 'Wall length: 12m',
      lineLength: 400,
      quantity: 12,
      unit: 'linear_meters',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'ann-3',
      type: 'polygon',
      pageNumber: 2,
      x: 0.2,
      y: 0.2,
      width: 0.3,
      height: 0.4,
      color: '#10b981',
      text: 'Room area: 45 sqm',
      polygonArea: 1500,
      quantity: 45,
      unit: 'square_meters',
      points: [
        { x: 0.2, y: 0.2 },
        { x: 0.5, y: 0.2 },
        { x: 0.5, y: 0.6 },
        { x: 0.2, y: 0.6 },
      ],
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
  ];

  const calibrationData = {
    referenceLength: 10,
    pixelDistance: 333,
    metersPerPixel: 0.03,
    isCalibrated: true,
  };

  // Calculate totals
  const subtotal = costItems.reduce((sum, item) => sum + item.totalCost, 0);
  const markupAmount = subtotal * (markup / 100);
  const total = subtotal + markupAmount;

  // Category breakdown
  const categoryTotals = costItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + item.totalCost;
    return acc;
  }, {} as Record<string, number>);

  const addSampleItem = () => {
    const newItem: CostItem = {
      id: `${costItems.length + 1}`,
      description: `Sample Item ${costItems.length + 1}`,
      quantity: Math.floor(Math.random() * 20) + 1,
      unit: 'count',
      unitCost: Math.floor(Math.random() * 500) + 100,
      totalCost: 0,
      category: 'Miscellaneous',
      pageNumber: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    newItem.totalCost = newItem.quantity * newItem.unitCost;
    setCostItems([...costItems, newItem]);
  };

  const removeLastItem = () => {
    if (costItems.length > 0) {
      setCostItems(costItems.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Export Functionality Demo</h1>
              <p className="text-gray-600 mt-2">
                Test the export features with sample data
              </p>
            </div>
            <FileDown className="w-12 h-12 text-blue-600" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{costItems.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Subtotal</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                ${subtotal.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">
                Total (with {markup}% markup)
              </p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Export Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Options</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="markup-input" className="block text-sm font-medium text-gray-700 mb-2">
                Markup Percentage
              </label>
              <input
                id="markup-input"
                type="number"
                min="0"
                max="100"
                value={markup}
                onChange={e => setMarkup(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <ExportMenu
              project={sampleProject}
              costItems={costItems}
              annotations={sampleAnnotations}
              calibrationData={calibrationData}
              dataType="costs"
              markup={markup}
            />

            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Advanced Export</span>
            </button>

            <ExportMenu
              annotations={sampleAnnotations}
              dataType="annotations"
              className="ml-auto"
            />
          </div>
        </div>

        {/* Cost Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cost Items</h2>
            <div className="flex gap-2">
              <button
                onClick={addSampleItem}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
              <button
                onClick={removeLastItem}
                disabled={costItems.length === 0}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Remove Last
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Qty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Unit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Unit Cost</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                </tr>
              </thead>
              <tbody>
                {costItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4 text-right">{item.quantity}</td>
                    <td className="py-3 px-4">{item.unit}</td>
                    <td className="py-3 px-4 text-right">${item.unitCost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${item.totalCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="py-3 px-4 text-right">
                    Subtotal:
                  </td>
                  <td className="py-3 px-4 text-right">${subtotal.toFixed(2)}</td>
                  <td></td>
                </tr>
                {markup > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="py-3 px-4 text-right">
                      Markup ({markup}%):
                    </td>
                    <td className="py-3 px-4 text-right">${markupAmount.toFixed(2)}</td>
                    <td></td>
                  </tr>
                )}
                <tr className="bg-blue-600 text-white font-bold">
                  <td colSpan={4} className="py-3 px-4 text-right">
                    Total:
                  </td>
                  <td className="py-3 px-4 text-right">${total.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium">{category}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ${amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        project={sampleProject}
        costItems={costItems}
        annotations={sampleAnnotations}
        calibrationData={calibrationData}
        defaultMarkup={markup}
      />
    </div>
  );
}
