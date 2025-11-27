'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobStatusBadge } from './job-status-badge';
import { Image, Video, Eye, X, RotateCcw } from 'lucide-react';
import type { GenerationJobWithBrand } from '@/hooks/use-generation-jobs';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useCancelJob } from '@/hooks/use-generation-jobs';

interface JobCardProps {
  job: GenerationJobWithBrand;
}

export function JobCard({ job }: JobCardProps) {
  const { mutate: cancelJob, isPending: isCancelling } = useCancelJob();

  const isImage = job.type === 'image';
  const isVideo = job.type === 'video';
  const canCancel = job.status === 'processing' || job.status === 'queued';
  const canRetry = job.status === 'failed';

  // Truncate prompt to 150 characters
  const truncatedPrompt = job.prompt.length > 150
    ? `${job.prompt.substring(0, 150)}...`
    : job.prompt;

  // Calculate progress for processing jobs
  const getProgress = () => {
    if (job.status === 'queued') return 0;
    if (job.status === 'processing') {
      // Estimate progress based on time elapsed
      const startTime = job.started_at ? new Date(job.started_at).getTime() : Date.now();
      const elapsed = Date.now() - startTime;
      // Assume average generation time of 30 seconds for images, 2 minutes for videos
      const estimatedTotal = isImage ? 30000 : 120000;
      const progress = Math.min((elapsed / estimatedTotal) * 100, 95);
      return Math.round(progress);
    }
    if (job.status === 'completed') return 100;
    return 0;
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this generation job?')) {
      cancelJob(job.id);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement retry logic
    console.log('Retry job:', job.id);
  };

  return (
    <Link href={`/creative/generate/jobs/${job.id}`}>
      <Card className="cursor-pointer hover:border-primary transition-colors">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isImage ? (
                <Image className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <Video className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className="text-sm font-medium truncate">
                {isImage ? 'Image Generation' : 'Video Generation'}
              </span>
            </div>
            <JobStatusBadge status={job.status || 'queued'} />
          </div>

          {/* Prompt Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {truncatedPrompt}
          </p>

          {/* Progress Bar (for processing jobs) */}
          {(job.status === 'processing' || job.status === 'queued') && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {job.status === 'queued' ? 'Waiting in queue...' : `${getProgress()}% complete`}
              </p>
            </div>
          )}

          {/* Error Message (for failed jobs) */}
          {job.status === 'failed' && job.error_message && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-2">
              <p className="text-xs text-red-700 dark:text-red-400 line-clamp-2">
                {job.error_message}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : 'Unknown'}
            </div>

            <div className="flex items-center gap-2">
              {/* View Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Eye className="h-3 w-3" />
                View
              </Button>

              {/* Cancel Button */}
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-destructive hover:text-destructive"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              )}

              {/* Retry Button */}
              {canRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={handleRetry}
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
