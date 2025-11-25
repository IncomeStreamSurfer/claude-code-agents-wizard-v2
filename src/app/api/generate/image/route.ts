import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNanoBananaClient } from '@/lib/ai/nano-banana';
import { PromptBuilder } from '@/lib/prompts';
import type { ImageType } from '@/lib/prompts/templates';
import type { StylePreset, OutputFormat } from '@/lib/ai/types';
import type { TablesInsert } from '@/types/database';

// ============================================================================
// Request/Response Types
// ============================================================================

interface GenerateImageRequest {
  brand_id: string;
  product_id?: string;
  talent_id?: string;
  image_type: ImageType;
  style_preset: StylePreset;
  custom_prompt?: string;
  output_formats: OutputFormat[];
  variations?: number; // 1-4, default 1
}

interface GeneratedImageResult {
  url: string;
  format: OutputFormat;
  variation_index: number;
}

interface GenerateImageResponse {
  job_id: string;
  status: 'completed' | 'failed';
  images?: GeneratedImageResult[];
  error?: string;
}

// ============================================================================
// Validation Helpers
// ============================================================================

function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body.brand_id || typeof body.brand_id !== 'string') {
    return { valid: false, error: 'brand_id is required and must be a string' };
  }

  if (!body.image_type || typeof body.image_type !== 'string') {
    return { valid: false, error: 'image_type is required and must be a string' };
  }

  const validImageTypes: ImageType[] = ['hero_shot', 'lifestyle', 'product_only', 'ugc_style'];
  if (!validImageTypes.includes(body.image_type)) {
    return { valid: false, error: `image_type must be one of: ${validImageTypes.join(', ')}` };
  }

  if (!body.style_preset || typeof body.style_preset !== 'string') {
    return { valid: false, error: 'style_preset is required and must be a string' };
  }

  const validStyles: StylePreset[] = ['minimal', 'bold', 'lifestyle', 'promotional'];
  if (!validStyles.includes(body.style_preset)) {
    return { valid: false, error: `style_preset must be one of: ${validStyles.join(', ')}` };
  }

  if (!body.output_formats || !Array.isArray(body.output_formats) || body.output_formats.length === 0) {
    return { valid: false, error: 'output_formats is required and must be a non-empty array' };
  }

  for (let i = 0; i < body.output_formats.length; i++) {
    const format = body.output_formats[i];
    if (!format.name || typeof format.name !== 'string') {
      return { valid: false, error: `output_formats[${i}].name is required and must be a string` };
    }
    if (!format.width || typeof format.width !== 'number' || format.width < 1) {
      return { valid: false, error: `output_formats[${i}].width must be a positive number` };
    }
    if (!format.height || typeof format.height !== 'number' || format.height < 1) {
      return { valid: false, error: `output_formats[${i}].height must be a positive number` };
    }
  }

  if (body.product_id !== undefined && typeof body.product_id !== 'string') {
    return { valid: false, error: 'product_id must be a string if provided' };
  }

  if (body.talent_id !== undefined && typeof body.talent_id !== 'string') {
    return { valid: false, error: 'talent_id must be a string if provided' };
  }

  if (body.custom_prompt !== undefined && typeof body.custom_prompt !== 'string') {
    return { valid: false, error: 'custom_prompt must be a string if provided' };
  }

  if (body.variations !== undefined) {
    if (typeof body.variations !== 'number' || body.variations < 1 || body.variations > 4) {
      return { valid: false, error: 'variations must be a number between 1 and 4' };
    }
  }

  return { valid: true };
}

/**
 * Upload base64 image to Supabase Storage
 */
async function uploadImageToStorage(
  supabase: any,
  orgId: string,
  brandId: string,
  base64Data: string,
  mimeType: string,
  filename: string
): Promise<string> {
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Determine file extension
  const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
  const path = `${orgId}/${brandId}/generated/${filename}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('creatives')
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('creatives')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

// ============================================================================
// POST /api/generate/image
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and Validate Request
    let body: GenerateImageRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

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

    // Verify Product Access (if provided)
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

    // Verify Talent Access (if provided)
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
      if (!talentData.is_active) {
        return NextResponse.json({ error: 'Talent is not active' }, { status: 400 });
      }
      talent = talentData;
    }

    // Build Generation Prompt (includes reference images from product/talent)
    const promptResult = PromptBuilder.buildImagePromptFromContext(
      body.image_type,
      body.style_preset,
      brand,
      product || undefined,
      talent || undefined,
      undefined,
      body.custom_prompt || undefined
    );

    // Log reference images for debugging
    if (promptResult.referenceImages && promptResult.referenceImages.length > 0) {
      console.log('[Image Generation] Reference images:', promptResult.referenceImages.map(img => ({
        type: img.type,
        description: img.description,
        urlPreview: img.url.substring(0, 50) + '...'
      })));
    }

    // Create Generation Job Record (status: processing)
    const jobData: TablesInsert<'generation_jobs'> = {
      brand_id: body.brand_id,
      product_id: body.product_id || null,
      talent_id: body.talent_id || null,
      type: 'image',
      status: 'processing',
      prompt: promptResult.prompt,
      negative_prompt: promptResult.negativePrompt,
      parameters: {
        image_type: body.image_type,
        style_preset: body.style_preset,
        output_formats: body.output_formats as unknown as string[],
        variations: body.variations || 1,
        reference_images_count: promptResult.referenceImages?.length || 0,
        reference_image_types: (promptResult.referenceImages?.map(img => img.type) || []) as string[],
      },
      started_at: new Date().toISOString(),
      attempts: 1,
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

    // Call Gemini API (synchronous - returns immediately with results)
    try {
      const nanoBananaClient = getNanoBananaClient();

      const geminiResult = await nanoBananaClient.generateImage({
        brand_id: body.brand_id,
        product_id: body.product_id,
        talent_id: body.talent_id,
        prompt: promptResult.prompt,
        negative_prompt: promptResult.negativePrompt,
        style_preset: body.style_preset,
        output_formats: body.output_formats,
        variations: body.variations || 1,
        reference_images: promptResult.referenceImages, // Pass product/talent images for multimodal generation
      });

      // Handle failed generation
      if (geminiResult.status === 'failed') {
        await supabase
          .from('generation_jobs')
          .update({
            status: 'failed',
            error_message: geminiResult.error || 'Generation failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        return NextResponse.json({
          job_id: job.id,
          status: 'failed',
          error: geminiResult.error || 'Generation failed',
        } as GenerateImageResponse, { status: 500 });
      }

      // Upload generated images to Supabase Storage
      const uploadedImages: GeneratedImageResult[] = [];

      if (geminiResult.images && geminiResult.images.length > 0) {
        for (const image of geminiResult.images) {
          // Extract base64 data from data URL
          const base64Match = image.url.match(/^data:([^;]+);base64,(.+)$/);
          if (base64Match) {
            const mimeType = base64Match[1];
            const base64Data = base64Match[2];
            const filename = `${job.id}_${image.variation_index}_${image.format.name}_${Date.now()}`;

            try {
              const publicUrl = await uploadImageToStorage(
                supabase,
                userData.org_id,
                body.brand_id,
                base64Data,
                mimeType,
                filename
              );

              uploadedImages.push({
                url: publicUrl,
                format: image.format,
                variation_index: image.variation_index,
              });
            } catch (uploadError) {
              console.error('Failed to upload image:', uploadError);
              // Continue with other images even if one fails
            }
          } else {
            // If not a data URL, use as-is (shouldn't happen with Gemini)
            uploadedImages.push({
              url: image.url,
              format: image.format,
              variation_index: image.variation_index,
            });
          }
        }
      }

      // Update job as completed with results
      const { error: updateError } = await supabase
        .from('generation_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result_url: uploadedImages[0]?.url || null,
          result_metadata: {
            external_job_id: geminiResult.job_id,
            model_version: geminiResult.metadata.model_version,
            images: uploadedImages,
          },
        })
        .eq('id', job.id);

      if (updateError) {
        console.error('Error updating job to completed:', updateError);
      }

      // Return success response with images
      const response: GenerateImageResponse = {
        job_id: job.id,
        status: 'completed',
        images: uploadedImages,
      };

      return NextResponse.json(response, { status: 201 });

    } catch (apiError: any) {
      console.error('Image generation error:', apiError);

      // Update job with error
      await supabase
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: apiError.message || 'Failed to generate image',
          completed_at: new Date().toISOString(),
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

      return NextResponse.json({
        job_id: job.id,
        status: 'failed',
        error: apiError.message || 'Generation failed',
      } as GenerateImageResponse, { status: 500 });
    }

  } catch (error) {
    console.error('POST /api/generate/image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
