'use client';

import { useState } from 'react';
import { Search, TrendingUp, Users, Globe, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResearchForm, ResearchResults } from '@/components/research';
import { useResearchHistory, type ResearchResponse, type StoredResearchReport } from '@/hooks/use-research';

type ViewMode = 'home' | 'research' | 'results' | 'history';

export default function ResearchPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentResults, setCurrentResults] = useState<ResearchResponse | null>(null);
  const { data: researchHistory, isLoading: isHistoryLoading } = useResearchHistory();

  const handleResearchComplete = (results: ResearchResponse) => {
    setCurrentResults(results);
    setViewMode('results');
  };

  const handleStartResearch = () => {
    setViewMode('research');
    setCurrentResults(null);
  };

  const handleViewHistory = () => {
    setViewMode('history');
  };

  const handleBackToHome = () => {
    setViewMode('home');
    setCurrentResults(null);
  };

  const handleViewStoredReport = (report: StoredResearchReport) => {
    // Convert stored report to ResearchResponse format
    const results: ResearchResponse = {
      id: report.id,
      status: 'completed',
      results: report.data.results,
      analysis: report.data.analysis || undefined,
      adCopySuggestions: report.data.adCopySuggestions || undefined,
      timestamp: report.generated_at || report.created_at || '',
      searchCount: report.data.searchCount,
      successCount: report.data.successCount,
    };
    setCurrentResults(results);
    setViewMode('results');
  };

  // Home View
  if (viewMode === 'home') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Research Hub</h1>
          <p className="text-muted-foreground mt-1">
            Market intelligence, competitor analysis, and audience insights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={handleStartResearch}
          >
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle className="text-lg">Market Research</CardTitle>
              <CardDescription>
                Comprehensive market analysis with AI insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-not-allowed opacity-50">
            <CardHeader>
              <Globe className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle className="text-lg">Competitor Analysis</CardTitle>
              <CardDescription>Track competitor ads (Coming soon)</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-not-allowed opacity-50">
            <CardHeader>
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle className="text-lg">Audience Insights</CardTitle>
              <CardDescription>Understand your audience (Coming soon)</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-not-allowed opacity-50">
            <CardHeader>
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle className="text-lg">Keyword Research</CardTitle>
              <CardDescription>Find winning keywords (Coming soon)</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button onClick={handleStartResearch} className="gap-2">
            <Search className="h-4 w-4" />
            New Research
          </Button>
          <Button variant="outline" onClick={handleViewHistory} className="gap-2">
            <History className="h-4 w-4" />
            Research History
          </Button>
        </div>

        {/* Recent Research */}
        {researchHistory && researchHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Research</CardTitle>
              <CardDescription>Your latest research reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {researchHistory.slice(0, 3).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewStoredReport(report)}
                  >
                    <div>
                      <p className="font-medium">{report.title || 'Untitled Research'}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.brands?.name || 'No brand'} &bull;{' '}
                        {new Date(report.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {report.data.successCount}/{report.data.searchCount} searches
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Research Form View
  if (viewMode === 'research') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToHome}>
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Market Research</h1>
            <p className="text-muted-foreground mt-1">
              Gather comprehensive market intelligence powered by AI
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <ResearchForm onResearchComplete={handleResearchComplete} />
        </div>
      </div>
    );
  }

  // Results View
  if (viewMode === 'results' && currentResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToHome}>
            Back to Hub
          </Button>
        </div>

        <ResearchResults
          results={currentResults}
          onReset={handleStartResearch}
        />
      </div>
    );
  }

  // History View
  if (viewMode === 'history') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToHome}>
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Research History</h1>
            <p className="text-muted-foreground mt-1">
              View your past research reports
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : researchHistory && researchHistory.length > 0 ? (
              <div className="space-y-3">
                {researchHistory.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewStoredReport(report)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{report.title || 'Untitled Research'}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{report.brands?.name || 'No brand'}</span>
                        <span>&bull;</span>
                        <span>{report.data.input.productName}</span>
                        <span>&bull;</span>
                        <span>{new Date(report.created_at || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {report.data.successCount}/{report.data.searchCount} searches
                      </Badge>
                      {report.data.analysis && (
                        <Badge variant="default" className="gap-1">
                          AI Analyzed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No research history yet</p>
                <Button onClick={handleStartResearch} className="mt-4">
                  Start Your First Research
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback
  return null;
}
