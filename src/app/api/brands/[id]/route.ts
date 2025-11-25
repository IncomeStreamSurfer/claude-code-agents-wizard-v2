import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TablesUpdate } from '@/types/database';

/**
 * Helper function to verify brand ownership
 * Returns the brand if user has access, otherwise returns null
 */
async function verifyBrandAccess(supabase: any, brandId: string, userId: string) {
  // Get user's organization ID
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', userId)
    .single();

  if (userError || !userData?.org_id) {
    return null;
  }

  // Check if brand belongs to user's organization
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .eq('org_id', userData.org_id)
    .single();

  if (brandError || !brand) {
    return null;
  }

  return brand;
}

/**
 * GET /api/brands/[id]
 * Get a single brand by ID (must belong to user's organization)
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

    // Verify brand access
    const brand = await verifyBrandAccess(supabase, id, user.id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ data: brand });
  } catch (error) {
    console.error('GET /api/brands/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/brands/[id]
 * Update a brand by ID (must belong to user's organization)
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

    // Verify brand access
    const existingBrand = await verifyBrandAccess(supabase, id, user.id);
    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Prepare update data (only include provided fields)
    const updateData: TablesUpdate<'brands'> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'Brand name cannot be empty' }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.industry !== undefined) updateData.industry = body.industry;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;
    if (body.website_url !== undefined) updateData.website_url = body.website_url;
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.fonts !== undefined) updateData.fonts = body.fonts;
    if (body.voice_profile !== undefined) updateData.voice_profile = body.voice_profile;
    if (body.target_audience !== undefined) updateData.target_audience = body.target_audience;

    // Set updated_at
    updateData.updated_at = new Date().toISOString();

    // Update brand
    const { data, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand:', error);

      // Check for unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A brand with this name already exists' }, { status: 409 });
      }

      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PATCH /api/brands/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/brands/[id]
 * Delete a brand by ID (must belong to user's organization)
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

    // Verify brand access
    const existingBrand = await verifyBrandAccess(supabase, id, user.id);
    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Check for dependencies before deleting
    // Check if brand has campaigns
    const { count: campaignCount, error: campaignError } = await supabase
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', id);

    if (campaignError) {
      console.error('Error checking campaigns:', campaignError);
      throw campaignError;
    }

    if (campaignCount && campaignCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with existing campaigns. Please delete campaigns first.' },
        { status: 409 }
      );
    }

    // Check if brand has products
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', id);

    if (productError) {
      console.error('Error checking products:', productError);
      throw productError;
    }

    if (productCount && productCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with existing products. Please delete products first.' },
        { status: 409 }
      );
    }

    // Check if brand has creatives
    const { count: creativeCount, error: creativeError } = await supabase
      .from('creatives')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', id);

    if (creativeError) {
      console.error('Error checking creatives:', creativeError);
      throw creativeError;
    }

    if (creativeCount && creativeCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with existing creatives. Please delete creatives first.' },
        { status: 409 }
      );
    }

    // Delete brand
    const { error: deleteError } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting brand:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/brands/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
