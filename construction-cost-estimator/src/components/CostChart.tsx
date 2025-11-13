import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useCostEstimation } from '../hooks/useCostEstimation';
import { PieChartIcon, BarChartIcon, AlertCircle } from 'lucide-react';

type ChartType = 'pie' | 'bar';

/**
 * Colors for chart categories
 */
const CHART_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // orange
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange-red
  '#78716C', // stone
  '#0EA5E9', // light blue
];

/**
 * CostChart Component
 *
 * Displays visual cost representation:
 * - Pie chart showing percentage by category
 * - Bar chart showing totals by category
 * - Interactive tooltips
 * - Switchable chart types
 */
export const CostChart: React.FC = () => {
  const {
    categoryTotals,
    grandTotal,
    formatCost,
    isCalibrated,
    hasAnnotations,
  } = useCostEstimation();

  const [chartType, setChartType] = useState<ChartType>('pie');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Prepare data for charts
  const chartData = Object.entries(categoryTotals)
    .map(([category, totals]) => ({
      name: category,
      value: totals.cost,
      percentage: totals.percentage || 0,
      count: totals.count,
      quantity: totals.quantity,
    }))
    .sort((a, b) => b.value - a.value);

  // Handle chart click
  const handlePieClick = (data: any) => {
    setSelectedCategory(
      selectedCategory === data.name ? null : data.name
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">Cost:</span> {formatCost(data.value)}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Percentage:</span> {data.percentage.toFixed(1)}%
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Items:</span> {data.count}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  if (!isCalibrated || !hasAnnotations) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-gray-600">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">No Data Available</h3>
            <p className="text-sm mt-1">
              {!isCalibrated
                ? 'Please calibrate the drawing to view cost charts.'
                : 'Add annotations to see cost visualization.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No cost data to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Cost Visualization</h3>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              chartType === 'pie'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              chartType === 'bar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChartIcon className="w-4 h-4" />
            Bar Chart
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {chartType === 'pie' ? (
          // Pie Chart
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                onClick={handlePieClick}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    opacity={
                      selectedCategory === null || selectedCategory === entry.name
                        ? 1
                        : 0.3
                    }
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          // Bar Chart
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={() => 'Cost'}
              />
              <Bar
                dataKey="value"
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
                onClick={handlePieClick}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    opacity={
                      selectedCategory === null || selectedCategory === entry.name
                        ? 1
                        : 0.3
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Details Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Category Details</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {chartData.map((item, index) => {
            const isSelected = selectedCategory === item.name;
            return (
              <div
                key={item.name}
                className={`px-6 py-4 transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handlePieClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.count} {item.count === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCost(item.value)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.percentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-300">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCost(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Category Info */}
      {selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-900">
              Selected: <span className="font-semibold">{selectedCategory}</span>
            </p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostChart;
