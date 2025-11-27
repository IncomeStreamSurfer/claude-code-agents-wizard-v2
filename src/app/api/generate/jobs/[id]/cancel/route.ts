import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNanoBananaClient } from '@/lib/ai/nano-banana';
import { getVeoClient } from '@/lib/ai/veo';
import type { JobStatus } from '@/types/database';

// ============================================================================
// Response Types
// ============================================================================

interface CancelJobResponse {
  success: boolean;
  message: string;
  job_id: string;
  status: JobStatus;
}

// ============================================================================
// POST /api/generate/jobs/[id]/cancel
// ============================================================================

/**
 * Cancel a generation job
 *
 * This endpoint:
 * 1. Verifies user has access to the job
 * 2. Checks if job can be cancelled (only 'queued' or 'processing' jobs)
 * 3. Calls external API to cancel the job
 * 4. Updates our database to mark job as cancelled
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: jobId } = await params;

    // ========================================================================
    // Step 1: Authentication
    // ========================================================================

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ========================================================================
    // Step 2: Get User's Organization
    // ========================================================================

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.org_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 403 });
    }

    // ========================================================================
    // Step 3: Fetch Job and Verify Access
    // ========================================================================

    const { data: job, error: jobError } = await supabase
      .from('generation_jobs')
      .select(`
        *,
        brands!inner(name, org_id)
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify brand belongs to user's organization
    if (job.brands.org_id !== userData.org_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // ========================================================================
    // Step 4: Validate Job Can Be Cancelled
    // ========================================================================

    const cancellableStatuses: JobStatus[] = ['queued', 'processing'];

    if (!cancellableStatuses.includes(job.status)) {
      return NextResponse.json(
        {
          error: `Cannot cancel job with status '${job.status}'. Only jobs with status 'queued' or 'processing' can be cancelled.`,
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 5: Cancel Job in External API
    // ========================================================================

    let externalCancelled = false;
    let externalError: string | null = null;

    if (job.result_metadata?.external_job_id) {
      const externalJobId = job.result_metadata.external_job_id as string;

      try {
        // Call the appropriate external API based on job type
        if (job.type === 'image') {
          const nanoBananaClient = getNanoBananaClient();
          const result = await nanoBananaClient.cancelJob(externalJobId);
          externalCancelled = result.success;
        } else if (job.type === 'video') {
          const veoClient = getVeoClient();
          const result = await veoClient.cancelJob(externalJobId);
          externalCancelled = result.success;
        } else {
          throw new Error(`Unknown job type: ${job.type}`);
        }
      } catch (error: any) {
        console.error('Error cancelling job in external API:', error);
        externalError = error.message;

        // Special handling for job not found errors
        // If external job doesn't exist, we still want to mark our job as cancelled
        if (error.name === 'JobNotFoundError') {
          externalCancelled = true;
        } else {
          // For other errors, don't proceed with cancellation
          return NextResponse.json(
            { error: `Failed to cancel job: ${error.message}` },
            { status: 500 }
          );
        }
      }
    } else {
      // No external job ID means job was never submitted to external API
      // Safe to mark as cancelled in our database
      externalCancelled = true;
    }

    // ========================================================================
    // Step 6: Update Database
    // ========================================================================

    const { error: updateError } = await supabase
      .from('generation_jobs')
      .update({
        status: 'cancelled' as JobStatus,
        completed_at: new Date().toISOString(),
        error_message: externalError || job.error_message,
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job status:', updateError);
      throw new Error('Failed to update job status');
    }

    // ========================================================================
    // Step 7: Return Success Response
    // ========================================================================

    const response: CancelJobResponse = {
      success: true,
      message: externalCancelled
        ? 'Job cancelled successfully'
        : 'Job marked as cancelled in database (external cancellation may have failed)',
      job_id: jobId,
      status: 'cancelled',
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('POST /api/generate/jobs/[id]/cancel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
