import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNanoBananaClient } from '@/lib/ai/nano-banana';
import { getVeoClient } from '@/lib/ai/veo';
import type { JobStatus } from '@/types/database';
import type { ImageGenerationJob, VideoGenerationJob } from '@/lib/ai/types';

// ============================================================================
// Response Types
// ============================================================================

interface GenerationJobResponse {
  id: string;
  type: 'image' | 'video';
  status: JobStatus;
  brand_id: string;
  brand_name?: string;
  product_id?: string;
  talent_id?: string;
  prompt: string;
  parameters: object;
  result_url?: string;
  result_metadata?: object;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// ============================================================================
// GET /api/generate/jobs/[id]
// ============================================================================

/**
 * Get status of a specific generation job
 *
 * This endpoint:
 * 1. Verifies user has access to the job
 * 2. If job is 'processing', polls external API for updates
 * 3. Updates our database if external API shows job is complete
 * 4. Returns full job details including results if available
 */
export async function GET(
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
    // Step 4: Sync Status with External API (if processing)
    // ========================================================================

    let updatedJob = job;

    if (job.status === 'processing' && job.result_metadata?.external_job_id) {
      const externalJobId = job.result_metadata.external_job_id as string;

      try {
        let externalJob: ImageGenerationJob | VideoGenerationJob;

        // Call the appropriate external API based on job type
        if (job.type === 'image') {
          const nanoBananaClient = getNanoBananaClient();
          externalJob = await nanoBananaClient.getJobStatus(externalJobId);
        } else if (job.type === 'video') {
          const veoClient = getVeoClient();
          externalJob = await veoClient.getJobStatus(externalJobId);
        } else {
          throw new Error(`Unknown job type: ${job.type}`);
        }

        // Update our database if external job status changed to completed or failed
        if (externalJob.status === 'completed') {
          const updateData: any = {
            status: 'completed' as JobStatus,
            completed_at: new Date().toISOString(),
          };

          // Store result data based on job type
          if (job.type === 'image' && 'images' in externalJob) {
            updateData.result_url = externalJob.images?.[0]?.url;
            updateData.result_metadata = {
              ...job.result_metadata,
              external_job_id: externalJobId,
              images: externalJob.images,
              model_version: externalJob.metadata?.model_version,
            };
          } else if (job.type === 'video' && 'video' in externalJob) {
            updateData.result_url = externalJob.video?.url;
            updateData.result_metadata = {
              ...job.result_metadata,
              external_job_id: externalJobId,
              video: externalJob.video,
              model_version: externalJob.metadata?.model_version,
            };
          }

          const { data: updated, error: updateError } = await supabase
            .from('generation_jobs')
            .update(updateData)
            .eq('id', jobId)
            .select(`
              *,
              brands!inner(name, org_id)
            `)
            .single();

          if (updateError) {
            console.error('Error updating job status:', updateError);
          } else if (updated) {
            updatedJob = updated;
          }
        } else if (externalJob.status === 'failed') {
          const { data: updated, error: updateError } = await supabase
            .from('generation_jobs')
            .update({
              status: 'failed' as JobStatus,
              error_message: externalJob.error || 'Generation failed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', jobId)
            .select(`
              *,
              brands!inner(name, org_id)
            `)
            .single();

          if (updateError) {
            console.error('Error updating job status:', updateError);
          } else if (updated) {
            updatedJob = updated;
          }
        }

      } catch (externalError: any) {
        console.error('Error polling external API:', externalError);
        // Don't fail the request - return current DB state
        // External API might be temporarily unavailable
      }
    }

    // ========================================================================
    // Step 5: Format and Return Response
    // ========================================================================

    const response: GenerationJobResponse = {
      id: updatedJob.id,
      type: updatedJob.type,
      status: updatedJob.status,
      brand_id: updatedJob.brand_id,
      brand_name: updatedJob.brands?.name,
      product_id: updatedJob.product_id || undefined,
      talent_id: updatedJob.talent_id || undefined,
      prompt: updatedJob.prompt,
      parameters: updatedJob.parameters || {},
      result_url: updatedJob.result_url || undefined,
      result_metadata: updatedJob.result_metadata || undefined,
      error_message: updatedJob.error_message || undefined,
      created_at: updatedJob.created_at,
      started_at: updatedJob.started_at || undefined,
      completed_at: updatedJob.completed_at || undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/generate/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
