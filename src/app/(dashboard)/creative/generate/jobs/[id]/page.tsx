'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGenerationJob, useCancelJob } from '@/hooks/use-generation-jobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { JobStatusBadge } from '@/components/generate/job-status-badge';
import { ResultsGallery } from '@/components/generate/results-gallery';
import {
  ArrowLeft,
  AlertCircle,
  X,
  RotateCcw,
  Image as ImageIcon,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

export default function GenerationJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { data: job, isLoading, error } = useGenerationJob(jobId);
  const { mutate: cancelJob, isPending: isCancelling } = useCancelJob();

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this generation job?')) {
      cancelJob(jobId, {
        onSuccess: () => {
          router.push('/creative/generate/jobs');
        },
      });
    }
  };

  const handleRetry = () => {
    // TODO: Implement retry logic
    console.log('Retry job:', jobId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="space-y-6">
        <Link href="/creative/generate/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Job not found</h3>
          <p className="text-muted-foreground mb-4">
            The generation job you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/creative/generate/jobs">
            <Button>View All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isImage = job.type === 'image';
  const isVideo = job.type === 'video';
  const canCancel = job.status === 'processing' || job.status === 'queued';
  const canRetry = job.status === 'failed';
  const isCompleted = job.status === 'completed';

  // Parse result metadata for images/videos
  const rawResults = job.result_metadata as {
    images?: Array<{
      url: string;
      format: { name: string; width: number; height: number };
      variation_index: number;
    }>;
    video?: {
      url: string;
      thumbnail_url?: string;
      duration: number;
      dimensions: {
        width: number;
        height: number;
      };
    };
  } | null;

  // Transform images to match ResultImage interface
  const results = rawResults ? {
    images: rawResults.images?.map((img) => ({
      url: img.url,
      width: img.format.width,
      height: img.format.height,
      format: img.format.name,
      variation: `Variation ${img.variation_index + 1}`,
    })),
    video: rawResults.video,
  } : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/creative/generate/jobs">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isImage ? (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Video className="h-8 w-8 text-muted-foreground" />
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {isImage ? 'Image Generation Job' : 'Video Generation Job'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Job ID: {job.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Job
            </Button>
          )}
          {canRetry && (
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Job Status</CardTitle>
            <JobStatusBadge status={job.status || 'queued'} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Created */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {job.created_at ? format(new Date(job.created_at), 'PPp') : 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ''}
                </p>
              </div>
            </div>

            {/* Duration */}
            {job.started_at && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {job.status === 'processing' ? 'Processing Time' : 'Duration'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.completed_at
                      ? `${Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s`
                      : formatDistanceToNow(new Date(job.started_at))}
                  </p>
                </div>
              </div>
            )}

            {/* Attempts */}
            <div className="flex items-start gap-3">
              {job.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : job.status === 'failed' ? (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 animate-spin" />
              )}
              <div>
                <p className="text-sm font-medium">Attempts</p>
                <p className="text-sm text-muted-foreground">
                  {job.attempts || 1} {(job.attempts || 1) === 1 ? 'attempt' : 'attempts'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar for processing */}
          {(job.status === 'processing' || job.status === 'queued') && (
            <div className="mt-6 space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                <div className="bg-primary h-3 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {job.status === 'queued' ? 'Waiting in queue...' : 'Generating your content...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prompt Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Details</CardTitle>
          <CardDescription>The prompt and parameters used for this generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Prompt</p>
            <div className="bg-muted rounded-md p-4">
              <p className="text-sm">{job.prompt}</p>
            </div>
          </div>

          {job.negative_prompt && (
            <div>
              <p className="text-sm font-medium mb-2">Negative Prompt</p>
              <div className="bg-muted rounded-md p-4">
                <p className="text-sm text-muted-foreground">{job.negative_prompt}</p>
              </div>
            </div>
          )}

          {job.parameters && (
            <div>
              <p className="text-sm font-medium mb-2">Parameters</p>
              <div className="bg-muted rounded-md p-4">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(job.parameters, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {job.status === 'failed' && job.error_message && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-md p-4">
              <p className="text-sm text-red-700 dark:text-red-400">{job.error_message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isCompleted && job.result_url && results && (
        <ResultsGallery
          type={job.type as 'image' | 'video'}
          results={results}
          brandId={job.brand_id}
          jobId={job.id}
          prompt={job.prompt}
        />
      )}
    </div>
  );
}
