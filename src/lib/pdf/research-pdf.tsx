'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import type { ResearchResponse } from '@/hooks/use-research';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    fontSize: 10,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 10,
  },
  sectionBadgeText: {
    fontSize: 9,
    color: '#92400e',
    fontWeight: 'bold',
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    textAlign: 'justify',
  },
  contentBox: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paragraph: {
    marginBottom: 10,
  },
  categoryItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryQuery: {
    fontSize: 9,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  successBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  successBadgeText: {
    fontSize: 8,
    color: '#065f46',
    fontWeight: 'bold',
  },
  failedBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  failedBadgeText: {
    fontSize: 8,
    color: '#991b1b',
    fontWeight: 'bold',
  },
  categoryContent: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#4b5563',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#9ca3af',
  },
});

// Helper function to format markdown-like content for PDF
function formatContent(content: string): string {
  // Remove markdown syntax but keep structure
  return content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert links to text
    .replace(/^[-*]\s/gm, '• ') // Convert list items to bullets
    .replace(/^\d+\.\s/gm, '• ') // Convert numbered lists to bullets
    .trim();
}

// Split text into paragraphs
function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

// Research PDF Document Component
function ResearchPdfDocument({ results }: { results: ResearchResponse }) {
  const formattedDate = new Date(results.timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Market Research Report</Text>
          <Text style={styles.subtitle}>
            Comprehensive analysis powered by AdForge AI
          </Text>
          <View style={styles.metadata}>
            <Text>Report ID: {results.id}</Text>
            <Text>Generated: {formattedDate}</Text>
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
          </View>
          <View style={styles.contentBox}>
            <Text style={styles.content}>
              This research report contains {results.searchCount} data points across multiple market intelligence categories.
              {results.successCount} of {results.searchCount} searches completed successfully, providing comprehensive
              insights for strategic decision-making.
            </Text>
          </View>
        </View>

        {/* AI Analysis Section */}
        {results.analysis && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>AI GENERATED</Text>
              </View>
            </View>
            <View style={styles.contentBox}>
              {splitIntoParagraphs(formatContent(results.analysis)).map((paragraph, idx) => (
                <Text key={idx} style={[styles.content, styles.paragraph]}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          Generated by AdForge • AI-Powered Marketing Intelligence
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      {/* Ad Copy Suggestions Page */}
      {results.adCopySuggestions && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ad Copy Suggestions</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>AI GENERATED</Text>
              </View>
            </View>
            <View style={styles.contentBox}>
              {splitIntoParagraphs(formatContent(results.adCopySuggestions)).map((paragraph, idx) => (
                <Text key={idx} style={[styles.content, styles.paragraph]}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </View>

          <Text style={styles.footer}>
            Generated by AdForge • AI-Powered Marketing Intelligence
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </Page>
      )}

      {/* Research Data Pages */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Research Data</Text>
          </View>

          {results.results.map((result, index) => (
            <View key={index} style={styles.categoryItem} wrap={false}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{result.category}</Text>
                {result.success ? (
                  <View style={styles.successBadge}>
                    <Text style={styles.successBadgeText}>SUCCESS</Text>
                  </View>
                ) : (
                  <View style={styles.failedBadge}>
                    <Text style={styles.failedBadgeText}>FAILED</Text>
                  </View>
                )}
              </View>
              <Text style={styles.categoryQuery}>Query: {result.query}</Text>
              {result.success ? (
                <Text style={styles.categoryContent}>
                  {formatContent(result.data).substring(0, 800)}
                  {result.data.length > 800 ? '...' : ''}
                </Text>
              ) : (
                <Text style={[styles.categoryContent, { color: '#991b1b' }]}>
                  Error: {result.error || 'Unknown error'}
                </Text>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated by AdForge • AI-Powered Marketing Intelligence
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

// Generate and download PDF
export async function generateResearchPdf(results: ResearchResponse): Promise<void> {
  const blob = await pdf(<ResearchPdfDocument results={results} />).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  link.download = `research-report-${date}.pdf`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  URL.revokeObjectURL(url);
}
