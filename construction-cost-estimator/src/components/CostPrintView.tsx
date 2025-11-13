import React from 'react';
import type { CostItem } from '../types';
import type { CategoryTotals } from '../utils/costCalculations';

/**
 * Props for CostPrintView component
 */
export interface CostPrintViewProps {
  costItems: CostItem[];
  categoryTotals: Record<string, CategoryTotals>;
  grandTotal: number;
  totalWithMarkup: number;
  markupPercent: number;
  projectName?: string;
  projectDescription?: string;
  formatCost: (amount: number) => string;
}

/**
 * CostPrintView - Print-friendly cost estimate view
 *
 * Features:
 * - Professional print layout
 * - Project header information
 * - Cost summary section
 * - Detailed breakdown by category
 * - Category subtotals
 * - Grand total with markup
 * - Page breaks for long lists
 * - Print-specific CSS styling
 */
export const CostPrintView: React.FC<CostPrintViewProps> = ({
  costItems,
  categoryTotals,
  grandTotal,
  totalWithMarkup,
  markupPercent,
  projectName = 'Construction Project',
  projectDescription,
  formatCost,
}) => {
  // Group items by category
  const categorizedItems: Record<string, CostItem[]> = {};
  costItems.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!categorizedItems[category]) {
      categorizedItems[category] = [];
    }
    categorizedItems[category].push(item);
  });

  // Sort categories by cost (highest first)
  const sortedCategories = Object.keys(categorizedItems).sort(
    (a, b) => (categoryTotals[b]?.cost || 0) - (categoryTotals[a]?.cost || 0)
  );

  return (
    <div className="print-view">
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.75in;
          }

          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
          }

          .print-view {
            width: 100%;
            max-width: 100%;
          }

          /* Header Styles */
          .print-header {
            border-bottom: 3px solid #333;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }

          .print-title {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }

          .print-subtitle {
            font-size: 12pt;
            color: #666;
          }

          .print-date {
            font-size: 10pt;
            color: #999;
            margin-top: 0.5rem;
          }

          /* Summary Box */
          .print-summary {
            background-color: #f5f5f5;
            border: 2px solid #333;
            padding: 1rem;
            margin-bottom: 2rem;
          }

          .print-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 0.25rem 0;
          }

          .print-summary-total {
            font-size: 14pt;
            font-weight: bold;
            border-top: 2px solid #333;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
          }

          /* Table Styles */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1.5rem;
          }

          .print-table th {
            background-color: #333;
            color: #fff;
            padding: 0.5rem;
            text-align: left;
            font-weight: bold;
            border: 1px solid #333;
          }

          .print-table td {
            padding: 0.5rem;
            border: 1px solid #ddd;
          }

          .print-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
          }

          /* Category Header */
          .print-category-header {
            background-color: #e0e0e0;
            font-weight: bold;
            font-size: 12pt;
            padding: 0.75rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            border-left: 4px solid #333;
          }

          /* Subtotal Row */
          .print-subtotal {
            background-color: #f0f0f0;
            font-weight: bold;
          }

          /* Page Break */
          .page-break {
            page-break-after: always;
          }

          /* Footer */
          .print-footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #ddd;
            font-size: 9pt;
            color: #999;
            text-align: center;
          }

          /* Hide non-print elements */
          .no-print {
            display: none !important;
          }
        }

        /* Screen styles */
        @media screen {
          .print-view {
            max-width: 8.5in;
            margin: 2rem auto;
            padding: 2rem;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="print-header">
        <h1 className="print-title">Construction Cost Estimate</h1>
        <div className="print-subtitle">{projectName}</div>
        {projectDescription && (
          <div className="print-subtitle" style={{ marginTop: '0.5rem' }}>
            {projectDescription}
          </div>
        )}
        <div className="print-date">
          Generated: {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Cost Summary Section */}
      <div className="print-summary">
        <h2 style={{ fontSize: '14pt', marginBottom: '1rem', fontWeight: 'bold' }}>
          Cost Summary
        </h2>
        <div className="print-summary-row">
          <span>Total Items:</span>
          <span>{costItems.length}</span>
        </div>
        <div className="print-summary-row">
          <span>Categories:</span>
          <span>{Object.keys(categoryTotals).length}</span>
        </div>
        <div className="print-summary-row" style={{ marginTop: '1rem' }}>
          <span style={{ fontSize: '12pt' }}>Subtotal:</span>
          <span style={{ fontSize: '12pt', fontWeight: 'bold' }}>{formatCost(grandTotal)}</span>
        </div>
        <div className="print-summary-row">
          <span>Markup/Contingency ({markupPercent}%):</span>
          <span>{formatCost(totalWithMarkup - grandTotal)}</span>
        </div>
        <div className="print-summary-row print-summary-total">
          <span>Total Estimated Cost:</span>
          <span>{formatCost(totalWithMarkup)}</span>
        </div>
      </div>

      {/* Detailed Breakdown by Category */}
      <h2 style={{ fontSize: '16pt', marginBottom: '1rem', fontWeight: 'bold' }}>
        Detailed Cost Breakdown
      </h2>

      {sortedCategories.map((category, categoryIndex) => {
        const items = categorizedItems[category];
        const totals = categoryTotals[category];
        const shouldPageBreak = categoryIndex > 0 && categoryIndex % 2 === 0;

        return (
          <div key={category} className={shouldPageBreak ? 'page-break' : ''}>
            {/* Category Header */}
            <div className="print-category-header">
              {category}
              {totals && (
                <span style={{ float: 'right' }}>
                  {formatCost(totals.cost)} ({totals.percentage?.toFixed(1)}%)
                </span>
              )}
            </div>

            {/* Category Items Table */}
            <table className="print-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Description</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Quantity</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Unit</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Unit Cost</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.description}
                      {item.notes && (
                        <div style={{ fontSize: '9pt', color: '#666', marginTop: '0.25rem' }}>
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>{item.quantity.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{item.unit}</td>
                    <td style={{ textAlign: 'right' }}>{formatCost(item.unitCost)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCost(item.totalCost)}
                    </td>
                  </tr>
                ))}

                {/* Category Subtotal */}
                {totals && (
                  <tr className="print-subtotal">
                    <td colSpan={4} style={{ textAlign: 'right' }}>
                      <strong>{category} Subtotal:</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong>{formatCost(totals.cost)}</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Grand Total Summary Table */}
      <div style={{ marginTop: '2rem' }}>
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '12pt' }}>
                Grand Total:
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '12pt', width: '20%' }}>
                {formatCost(grandTotal)}
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: 'right' }}>
                Markup/Contingency ({markupPercent}%):
              </td>
              <td style={{ textAlign: 'right' }}>
                {formatCost(totalWithMarkup - grandTotal)}
              </td>
            </tr>
            <tr style={{ backgroundColor: '#333', color: '#fff' }}>
              <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '14pt' }}>
                Total Estimated Cost:
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '14pt' }}>
                {formatCost(totalWithMarkup)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="print-footer">
        <p>
          This estimate is based on measurements and calculations performed using construction cost
          estimation software. Actual costs may vary based on market conditions, material
          availability, and other factors.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Page generated on {new Date().toLocaleString()}
        </p>
      </div>

      {/* Print Button (visible only on screen) */}
      <div className="no-print" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '14pt',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Print This Document
        </button>
      </div>
    </div>
  );
};

export default CostPrintView;
