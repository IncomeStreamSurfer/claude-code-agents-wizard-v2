import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TablesUpdate } from '@/types/database';

/**
 * Helper function to verify talent ownership
 * Returns the talent if user has access, otherwise returns null
 */
async function verifyTalentAccess(supabase: any, talentId: string, userId: string) {
  // Get user's organization ID
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', userId)
    .single();

  if (userError || !userData?.org_id) {
    return null;
  }

  // Get talent with brand info
  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('*, brands!inner(org_id)')
    .eq('id', talentId)
    .single();

  if (talentError || !talent) {
    return null;
  }

  // Check if talent's brand belongs to user's organization
  if (talent.brands.org_id !== userData.org_id) {
    return null;
  }

  // Remove the brands object before returning
  const { brands, ...talentWithoutBrands } = talent;

  return talentWithoutBrands;
}

/**
 * GET /api/talents/[id]
 * Get a single talent by ID (must belong to user's organization)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify talent access
    const talent = await verifyTalentAccess(supabase, id, user.id);
    if (!talent) {
      return NextResponse.json({ error: 'Talent not found' }, { status: 404 });
    }

    return NextResponse.json({ data: talent });
  } catch (error) {
    console.error('GET /api/talents/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/talents/[id]
 * Update a talent by ID (must belong to user's organization)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify talent access
    const existingTalent = await verifyTalentAccess(supabase, id, user.id);
    if (!existingTalent) {
      return NextResponse.json({ error: 'Talent not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Prepare update data (only include provided fields)
    const updateData: TablesUpdate<'talents'> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'Talent name cannot be empty' }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.reference_images !== undefined) {
      if (!Array.isArray(body.reference_images) || body.reference_images.length === 0) {
        return NextResponse.json({ error: 'At least one reference image is required' }, { status: 400 });
      }
      updateData.reference_images = body.reference_images;
    }

    if (body.face_encoding !== undefined) updateData.face_encoding = body.face_encoding;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.approved_platforms !== undefined) updateData.approved_platforms = body.approved_platforms;
    if (body.usage_rights !== undefined) updateData.usage_rights = body.usage_rights;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at;

    // Set updated_at
    updateData.updated_at = new Date().toISOString();

    // Update talent
    const { data, error } = await supabase
      .from('talents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating talent:', error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PATCH /api/talents/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/talents/[id]
 * Delete a talent by ID (must belong to user's organization)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify talent access
    const existingTalent = await verifyTalentAccess(supabase, id, user.id);
    if (!existingTalent) {
      return NextResponse.json({ error: 'Talent not found' }, { status: 404 });
    }

    // Check for dependencies before deleting
    // Check if talent has generation jobs
    const { count: jobCount, error: jobError } = await supabase
      .from('generation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('talent_id', id);

    if (jobError) {
      console.error('Error checking generation jobs:', jobError);
      throw jobError;
    }

    if (jobCount && jobCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete talent with existing generation jobs. Please delete jobs first.' },
        { status: 409 }
      );
    }

    // Delete talent
    const { error: deleteError } = await supabase
      .from('talents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting talent:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/talents/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
