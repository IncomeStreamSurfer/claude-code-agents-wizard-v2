import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVeoClient } from '@/lib/ai/veo';
import { PromptBuilder } from '@/lib/prompts';
import type { VideoType } from '@/lib/prompts/templates';
import type { StylePreset } from '@/lib/ai/types';
import type { TablesInsert } from '@/types/database';

// ============================================================================
// Request/Response Types
// ============================================================================

interface GenerateVideoRequest {
  brand_id: string;
  product_id?: string;
  talent_id?: string;
  video_type: VideoType;
  style_preset: StylePreset;
  script?: string; // Optional script/voiceover text
  custom_prompt?: string;
  duration_seconds: 15 | 30 | 60;
  aspect_ratio: '1:1' | '9:16' | '16:9';
  music_mood?: 'upbeat' | 'calm' | 'energetic' | 'professional';
  include_captions?: boolean;
}

interface GenerateVideoResponse {
  job_id: string;
  external_job_id: string;
  status: 'queued';
  estimated_time_seconds: number;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate request body structure and required fields
 */
function validateRequest(body: any): { valid: boolean; error?: string } {
  // Required fields
  if (!body.brand_id || typeof body.brand_id !== 'string') {
    return { valid: false, error: 'brand_id is required and must be a string' };
  }

  if (!body.video_type || typeof body.video_type !== 'string') {
    return { valid: false, error: 'video_type is required and must be a string' };
  }

  const validVideoTypes: VideoType[] = ['ugc', 'product_demo', 'testimonial', 'dynamic'];
  if (!validVideoTypes.includes(body.video_type)) {
    return { valid: false, error: `video_type must be one of: ${validVideoTypes.join(', ')}` };
  }

  if (!body.style_preset || typeof body.style_preset !== 'string') {
    return { valid: false, error: 'style_preset is required and must be a string' };
  }

  const validStyles: StylePreset[] = ['minimal', 'bold', 'lifestyle', 'promotional'];
  if (!validStyles.includes(body.style_preset)) {
    return { valid: false, error: `style_preset must be one of: ${validStyles.join(', ')}` };
  }

  if (!body.duration_seconds || typeof body.duration_seconds !== 'number') {
    return { valid: false, error: 'duration_seconds is required and must be a number' };
  }

  const validDurations = [15, 30, 60];
  if (!validDurations.includes(body.duration_seconds)) {
    return { valid: false, error: `duration_seconds must be one of: ${validDurations.join(', ')}` };
  }

  if (!body.aspect_ratio || typeof body.aspect_ratio !== 'string') {
    return { valid: false, error: 'aspect_ratio is required and must be a string' };
  }

  const validAspectRatios = ['1:1', '9:16', '16:9'];
  if (!validAspectRatios.includes(body.aspect_ratio)) {
    return { valid: false, error: `aspect_ratio must be one of: ${validAspectRatios.join(', ')}` };
  }

  // Optional fields validation
  if (body.product_id !== undefined && typeof body.product_id !== 'string') {
    return { valid: false, error: 'product_id must be a string if provided' };
  }

  if (body.talent_id !== undefined && typeof body.talent_id !== 'string') {
    return { valid: false, error: 'talent_id must be a string if provided' };
  }

  if (body.script !== undefined && typeof body.script !== 'string') {
    return { valid: false, error: 'script must be a string if provided' };
  }

  if (body.custom_prompt !== undefined && typeof body.custom_prompt !== 'string') {
    return { valid: false, error: 'custom_prompt must be a string if provided' };
  }

  if (body.music_mood !== undefined) {
    const validMoods = ['upbeat', 'calm', 'energetic', 'professional'];
    if (!validMoods.includes(body.music_mood)) {
      return { valid: false, error: `music_mood must be one of: ${validMoods.join(', ')}` };
    }
  }

  if (body.include_captions !== undefined && typeof body.include_captions !== 'boolean') {
    return { valid: false, error: 'include_captions must be a boolean if provided' };
  }

  return { valid: true };
}

/**
 * Estimate video generation time based on duration and complexity
 */
function estimateGenerationTime(durationSeconds: number, videoType: VideoType): number {
  // Base time: 120 seconds (2 minutes)
  let baseTime = 120;

  // Add time based on video duration
  baseTime += durationSeconds * 2; // ~2 seconds per second of video

  // Adjust based on complexity
  const complexityMultipliers: Record<VideoType, number> = {
    ugc: 1.0,           // Simpler, faster
    product_demo: 1.2,  // Moderate complexity
    testimonial: 1.1,   // Moderate complexity
    dynamic: 1.5,       // Most complex, slowest
  };

  return Math.round(baseTime * complexityMultipliers[videoType]);
}

// ============================================================================
// POST /api/generate/video
// ============================================================================

/**
 * Start a video generation job
 *
 * This endpoint:
 * 1. Validates authentication and request
 * 2. Verifies user has access to brand/product/talent
 * 3. Builds the generation prompt
 * 4. Creates a generation_jobs record
 * 5. Calls VEO 3.1 API to start generation
 * 6. Returns job information to client
 */
export async function POST(request: NextRequest) {
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
    // Step 2: Parse and Validate Request
    // ========================================================================

    let body: GenerateVideoRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // ========================================================================
    // Step 3: Verify Brand Access
    // ========================================================================

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.org_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 403 });
    }

    // Verify brand belongs to user's organization
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', body.brand_id)
      .eq('org_id', userData.org_id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Brand not found or access denied' }, { status: 404 });
    }

    // ========================================================================
    // Step 4: Verify Product Access (if provided)
    // ========================================================================

    let product = null;
    if (body.product_id) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', body.product_id)
        .eq('brand_id', body.brand_id)
        .single();

      if (productError || !productData) {
        return NextResponse.json({ error: 'Product not found or does not belong to this brand' }, { status: 404 });
      }

      product = productData;
    }

    // ========================================================================
    // Step 5: Verify Talent Access (if provided)
    // ========================================================================

    let talent = null;
    if (body.talent_id) {
      const { data: talentData, error: talentError } = await supabase
        .from('talents')
        .select('*')
        .eq('id', body.talent_id)
        .eq('brand_id', body.brand_id)
        .single();

      if (talentError || !talentData) {
        return NextResponse.json({ error: 'Talent not found or does not belong to this brand' }, { status: 404 });
      }

      // Check if talent is active
      if (!talentData.is_active) {
        return NextResponse.json({ error: 'Talent is not active' }, { status: 400 });
      }

      talent = talentData;
    }

    // ========================================================================
    // Step 6: Build Generation Prompt
    // ========================================================================

    // Build action description from script if provided
    let actionDescription = body.script;

    // Add music mood to custom additions if provided
    let customAdditions = body.custom_prompt || '';
    if (body.music_mood) {
      customAdditions += `, ${body.music_mood} background music`;
    }
    if (body.include_captions) {
      customAdditions += ', with on-screen captions';
    }

    const promptResult = PromptBuilder.buildVideoPromptFromContext(
      body.video_type,
      body.style_preset,
      brand,
      product || undefined,
      talent || undefined,
      actionDescription || undefined,
      body.duration_seconds,
      customAdditions || undefined
    );

    // ========================================================================
    // Step 7: Create Generation Job Record
    // ========================================================================

    const jobData: TablesInsert<'generation_jobs'> = {
      brand_id: body.brand_id,
      product_id: body.product_id || null,
      talent_id: body.talent_id || null,
      type: 'video',
      status: 'queued',
      prompt: promptResult.prompt,
      negative_prompt: promptResult.negativePrompt,
      parameters: {
        video_type: body.video_type,
        style_preset: body.style_preset,
        duration_seconds: body.duration_seconds,
        aspect_ratio: body.aspect_ratio,
        music_mood: body.music_mood,
        include_captions: body.include_captions,
        script: body.script,
      },
      attempts: 0,
    };

    const { data: job, error: jobError } = await supabase
      .from('generation_jobs')
      .insert(jobData)
      .select()
      .single();

    if (jobError || !job) {
      console.error('Error creating generation job:', jobError);
      throw new Error('Failed to create generation job');
    }

    // ========================================================================
    // Step 8: Call VEO 3.1 API
    // ========================================================================

    let veoJob;
    try {
      const veoClient = getVeoClient();

      veoJob = await veoClient.generateVideo({
        brand_id: body.brand_id,
        product_id: body.product_id,
        talent_id: body.talent_id,
        prompt: promptResult.prompt,
        duration: body.duration_seconds,
        aspect_ratio: body.aspect_ratio,
        style_preset: body.style_preset,
      });

    } catch (apiError: any) {
      console.error('VEO 3.1 API error:', apiError);

      // Update job with error
      await supabase
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: apiError.message || 'Failed to start video generation',
          attempts: 1,
        })
        .eq('id', job.id);

      // Return appropriate error response
      if (apiError.name === 'ValidationError') {
        return NextResponse.json({ error: apiError.message }, { status: 400 });
      } else if (apiError.name === 'AuthenticationError') {
        return NextResponse.json({ error: 'AI service authentication failed' }, { status: 500 });
      } else if (apiError.name === 'RateLimitError') {
        return NextResponse.json({
          error: 'Rate limit exceeded',
          retry_after: apiError.retryAfter
        }, { status: 429 });
      }

      throw apiError;
    }

    // ========================================================================
    // Step 9: Update Job with External Job ID
    // ========================================================================

    const { error: updateError } = await supabase
      .from('generation_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        result_metadata: {
          external_job_id: veoJob.job_id,
        },
      })
      .eq('id', job.id);

    if (updateError) {
      console.error('Error updating job with external ID:', updateError);
      // Don't fail the request, generation is already started
    }

    // ========================================================================
    // Step 10: Return Response
    // ========================================================================

    const response: GenerateVideoResponse = {
      job_id: job.id,
      external_job_id: veoJob.job_id,
      status: 'queued',
      estimated_time_seconds: estimateGenerationTime(body.duration_seconds, body.video_type),
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST /api/generate/video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
