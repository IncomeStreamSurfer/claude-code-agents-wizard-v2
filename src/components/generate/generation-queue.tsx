'use client';

import { useState, useMemo } from 'react';
import { useGenerationJobs, type GenerationJobsFilters } from '@/hooks/use-generation-jobs';
import { JobCard } from './job-card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JobStatus } from '@/types/database';

interface GenerationQueueProps {
  initialFilters?: GenerationJobsFilters;
}

export function GenerationQueue({ initialFilters }: GenerationQueueProps) {
  const [filters, setFilters] = useState<GenerationJobsFilters>(initialFilters || {});
  const { data: jobs, isLoading, error, refetch } = useGenerationJobs(filters);

  // Filter tabs
  const tabs = [
    { label: 'All', filter: {} },
    { label: 'Images', filter: { type: 'image' as const } },
    { label: 'Videos', filter: { type: 'video' as const } },
    { label: 'Processing', filter: { status: 'processing' as JobStatus } },
    { label: 'Completed', filter: { status: 'completed' as JobStatus } },
  ];

  const activeTab = useMemo(() => {
    return tabs.findIndex((tab) =>
      JSON.stringify(tab.filter) === JSON.stringify(filters)
    ) || 0;
  }, [filters]);

  const handleTabChange = (filter: GenerationJobsFilters) => {
    setFilters(filter);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Tabs Skeleton */}
        <div className="flex gap-2 border-b">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>

        {/* Jobs Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load generation jobs</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading your generation jobs. Please try again.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  // Empty state
  if (!jobs || jobs.length === 0) {
    return (
      <div className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 border-b">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.filter)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                index === activeTab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No generation jobs found</h3>
          <p className="text-muted-foreground mb-4">
            {Object.keys(filters).length > 0
              ? "Try adjusting your filters or create a new generation job."
              : "Get started by creating your first AI generation."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.filter)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              index === activeTab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Job Count */}
      <div className="text-sm text-muted-foreground text-center pt-4 border-t">
        Showing {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
      </div>
    </div>
  );
}
