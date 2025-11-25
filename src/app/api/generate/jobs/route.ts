import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { JobStatus } from '@/types/database';

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

interface ListJobsResponse {
  data: GenerationJobResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// ============================================================================
// GET /api/generate/jobs
// ============================================================================

/**
 * List generation jobs for the authenticated user's organization
 *
 * Query Parameters:
 * - brand_id: Filter by brand ID
 * - status: Filter by job status (queued, processing, completed, failed, cancelled)
 * - type: Filter by job type (image or video)
 * - limit: Number of results to return (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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
    // Step 3: Parse Query Parameters
    // ========================================================================

    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get('brand_id');
    const status = searchParams.get('status') as JobStatus | null;
    const type = searchParams.get('type');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validate and parse pagination parameters
    const limit = Math.min(parseInt(limitParam || '20', 10), 100);
    const offset = Math.max(parseInt(offsetParam || '0', 10), 0);

    // Validate status if provided
    const validStatuses: JobStatus[] = ['queued', 'processing', 'completed', 'failed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate type if provided
    if (type && !['image', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be either "image" or "video"' },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 4: Verify Brand Access (if filtering by brand)
    // ========================================================================

    if (brandId) {
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id')
        .eq('id', brandId)
        .eq('org_id', userData.org_id)
        .single();

      if (brandError || !brand) {
        return NextResponse.json({ error: 'Brand not found or access denied' }, { status: 404 });
      }
    }

    // ========================================================================
    // Step 5: Build Query for Jobs
    // ========================================================================

    // First, get all brand IDs for this organization to filter jobs
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id')
      .eq('org_id', userData.org_id);

    if (brandsError) {
      console.error('Error fetching brands:', brandsError);
      throw new Error('Failed to fetch brands');
    }

    const brandIds = brands.map(b => b.id);

    if (brandIds.length === 0) {
      // Organization has no brands, return empty result
      return NextResponse.json({
        data: [],
        pagination: { total: 0, limit, offset }
      });
    }

    // Build the jobs query
    let query = supabase
      .from('generation_jobs')
      .select(`
        id,
        type,
        status,
        brand_id,
        brands!inner(name),
        product_id,
        talent_id,
        prompt,
        parameters,
        result_url,
        result_metadata,
        error_message,
        created_at,
        started_at,
        completed_at
      `, { count: 'exact' })
      .in('brand_id', brandIds)
      .order('created_at', { ascending: false });

    // Apply filters
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // ========================================================================
    // Step 6: Execute Query
    // ========================================================================

    const { data: jobs, error: jobsError, count } = await query;

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      throw new Error('Failed to fetch jobs');
    }

    // ========================================================================
    // Step 7: Format Response
    // ========================================================================

    const formattedJobs: GenerationJobResponse[] = (jobs || []).map((job: any) => ({
      id: job.id,
      type: job.type,
      status: job.status,
      brand_id: job.brand_id,
      brand_name: job.brands?.name,
      product_id: job.product_id || undefined,
      talent_id: job.talent_id || undefined,
      prompt: job.prompt,
      parameters: job.parameters || {},
      result_url: job.result_url || undefined,
      result_metadata: job.result_metadata || undefined,
      error_message: job.error_message || undefined,
      created_at: job.created_at,
      started_at: job.started_at || undefined,
      completed_at: job.completed_at || undefined,
    }));

    const response: ListJobsResponse = {
      data: formattedJobs,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/generate/jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
