import type { LabelDefinition } from '../types/store';

/**
 * Predefined labels for common construction elements
 * These can be used as starting templates for new projects
 */
export const PREDEFINED_LABELS: LabelDefinition[] = [
  {
    id: 'label-windows',
    name: 'Windows',
    color: '#3B82F6', // blue
    description: 'Window openings and frames',
    icon: '🪟',
    unit: 'count',
    category: 'Openings',
    costPerUnit: 500, // Example cost per window
    createdAt: new Date(),
  },
  {
    id: 'label-doors',
    name: 'Doors',
    color: '#EF4444', // red
    description: 'Door openings and frames',
    icon: '🚪',
    unit: 'count',
    category: 'Openings',
    costPerUnit: 800, // Example cost per door
    createdAt: new Date(),
  },
  {
    id: 'label-walls',
    name: 'Walls',
    color: '#10B981', // green
    description: 'Wall segments and partitions',
    icon: '🧱',
    unit: 'linear_meters',
    category: 'Structure',
    costPerUnit: 150, // Example cost per linear meter
    createdAt: new Date(),
  },
  {
    id: 'label-floors',
    name: 'Floors',
    color: '#F59E0B', // yellow/orange
    description: 'Floor areas',
    icon: '⬜',
    unit: 'square_meters',
    category: 'Structure',
    costPerUnit: 80, // Example cost per square meter
    createdAt: new Date(),
  },
  {
    id: 'label-columns',
    name: 'Columns',
    color: '#8B5CF6', // purple
    description: 'Structural columns',
    icon: '⬛',
    unit: 'count',
    category: 'Structure',
    costPerUnit: 1200, // Example cost per column
    createdAt: new Date(),
  },
  {
    id: 'label-beams',
    name: 'Beams',
    color: '#F97316', // orange
    description: 'Structural beams',
    icon: '━',
    unit: 'linear_meters',
    category: 'Structure',
    costPerUnit: 200, // Example cost per linear meter
    createdAt: new Date(),
  },
  {
    id: 'label-electrical',
    name: 'Electrical Outlets',
    color: '#06B6D4', // cyan
    description: 'Electrical outlets and switches',
    icon: '⚡',
    unit: 'count',
    category: 'MEP',
    costPerUnit: 50, // Example cost per outlet
    createdAt: new Date(),
  },
  {
    id: 'label-plumbing',
    name: 'Plumbing Fixtures',
    color: '#0EA5E9', // light blue
    description: 'Plumbing fixtures and connections',
    icon: '🚰',
    unit: 'count',
    category: 'MEP',
    costPerUnit: 300, // Example cost per fixture
    createdAt: new Date(),
  },
  {
    id: 'label-stairs',
    name: 'Stairs',
    color: '#EC4899', // pink
    description: 'Stairways and steps',
    icon: '🪜',
    unit: 'count',
    category: 'Circulation',
    costPerUnit: 5000, // Example cost per stairway
    createdAt: new Date(),
  },
  {
    id: 'label-roof',
    name: 'Roof Area',
    color: '#78716C', // stone/gray
    description: 'Roof coverage area',
    icon: '⛺',
    unit: 'square_meters',
    category: 'Structure',
    costPerUnit: 120, // Example cost per square meter
    createdAt: new Date(),
  },
];

/**
 * Get a label by its ID
 */
export function getPredefinedLabel(id: string): LabelDefinition | undefined {
  return PREDEFINED_LABELS.find(label => label.id === id);
}

/**
 * Get labels by category
 */
export function getPredefinedLabelsByCategory(category: string): LabelDefinition[] {
  return PREDEFINED_LABELS.filter(label => label.category === category);
}

/**
 * Get all unique categories
 */
export function getPredefinedCategories(): string[] {
  const categories = new Set(PREDEFINED_LABELS.map(label => label.category).filter(Boolean));
  return Array.from(categories) as string[];
}
