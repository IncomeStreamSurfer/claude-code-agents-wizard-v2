'use client';

import { useState, useRef, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Copy,
  Check,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ResearchResponse, ResearchResultItem } from '@/hooks/use-research';

interface ResearchResultsProps {
  results: ResearchResponse;
  onReset: () => void;
}

// Configure marked for better output
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Convert markdown to sanitized HTML
function markdownToHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml);
}

// Map categories to icons
const categoryIcons: Record<string, React.ReactNode> = {
  'Customer Insights': <Users className="h-4 w-4" />,
  'Competitive Analysis': <Target className="h-4 w-4" />,
  'Market Intelligence': <TrendingUp className="h-4 w-4" />,
  'Marketing Examples': <FileText className="h-4 w-4" />,
  'Pricing Intelligence': <DollarSign className="h-4 w-4" />,
  'Audience Research': <Users className="h-4 w-4" />,
  'Market & Pricing': <DollarSign className="h-4 w-4" />,
};

function CategoryResult({ result }: { result: ResearchResultItem }) {
  const [expanded, setExpanded] = useState(false);

  const htmlContent = useMemo(() => {
    if (result.success && result.data) {
      return markdownToHtml(result.data);
    }
    return '';
  }, [result.success, result.data]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">
            {categoryIcons[result.category] || <FileText className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-medium">{result.category}</h4>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {result.query}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result.success ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Success
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Failed
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 pt-0 border-t">
          {result.success ? (
            <div className="bg-muted/50 rounded-md p-4 max-h-96 overflow-y-auto">
              <div
                className="research-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          ) : (
            <p className="text-sm text-destructive">
              Error: {result.error || 'Unknown error'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MarkdownSection({
  title,
  icon,
  content,
}: {
  title: string;
  icon: React.ReactNode;
  content: string;
}) {
  const [copied, setCopied] = useState(false);

  const htmlContent = useMemo(() => markdownToHtml(content), [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-md p-5 max-h-[600px] overflow-y-auto border">
          <div
            className="research-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ResearchResults({ results, onReset }: ResearchResultsProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      // Dynamically import to avoid SSR issues
      const { generateResearchPdf } = await import('@/lib/pdf/research-pdf');
      await generateResearchPdf(results);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6" ref={contentRef}>
      {/* Scoped styles for research content */}
      <style jsx global>{`
        .research-content {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: hsl(var(--foreground));
        }

        .research-content h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5rem;
        }

        .research-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.625rem;
          color: hsl(var(--foreground));
        }

        .research-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .research-content h4, .research-content h5, .research-content h6 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 0.875rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .research-content p {
          margin-bottom: 1rem;
        }

        .research-content ul, .research-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .research-content ul {
          list-style-type: disc;
        }

        .research-content ol {
          list-style-type: decimal;
        }

        .research-content li {
          margin-bottom: 0.375rem;
        }

        .research-content li > ul, .research-content li > ol {
          margin-top: 0.375rem;
          margin-bottom: 0;
        }

        .research-content strong, .research-content b {
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .research-content em, .research-content i {
          font-style: italic;
        }

        .research-content code {
          background-color: hsl(var(--muted));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
        }

        .research-content pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }

        .research-content pre code {
          background-color: transparent;
          padding: 0;
        }

        .research-content blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        .research-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .research-content a:hover {
          opacity: 0.8;
        }

        .research-content hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 1.5rem 0;
        }

        .research-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .research-content th, .research-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem 0.75rem;
          text-align: left;
        }

        .research-content th {
          background-color: hsl(var(--muted));
          font-weight: 600;
        }

        .research-content tr:nth-child(even) {
          background-color: hsl(var(--muted) / 0.5);
        }

        .research-content > *:first-child {
          margin-top: 0;
        }

        .research-content > *:last-child {
          margin-bottom: 0;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Research Results</h2>
          <p className="text-muted-foreground">
            {results.successCount} of {results.searchCount} searches completed successfully
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="gap-2"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onReset}>
            Start New Research
          </Button>
        </div>
      </div>

      {/* AI Analysis */}
      {results.analysis && (
        <MarkdownSection
          title="AI Analysis"
          icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
          content={results.analysis}
        />
      )}

      {/* Ad Copy Suggestions */}
      {results.adCopySuggestions && (
        <MarkdownSection
          title="Ad Copy Suggestions"
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          content={results.adCopySuggestions}
        />
      )}

      {/* Raw Research Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Research Data</CardTitle>
          <CardDescription>
            Click on each category to expand and view the raw search results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.results.map((result, index) => (
            <CategoryResult key={index} result={result} />
          ))}
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>Research ID: {results.id}</span>
        <Separator orientation="vertical" className="h-4" />
        <span>
          Completed: {new Date(results.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
