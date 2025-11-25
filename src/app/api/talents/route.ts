import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TablesInsert } from '@/types/database';

/**
 * GET /api/talents
 * List all talents for the authenticated user's organization
 * Supports ?brand_id and ?search query parameters for filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.org_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get('brand_id');
    const search = searchParams.get('search');

    // Get all brands for this organization (for filtering talents)
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id')
      .eq('org_id', userData.org_id);

    if (brandsError) {
      console.error('Error fetching brands:', brandsError);
      throw brandsError;
    }

    const brandIds = brands.map(b => b.id);

    if (brandIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Build query - filter talents by brand IDs from user's org
    let query = supabase
      .from('talents')
      .select('*')
      .in('brand_id', brandIds)
      .order('created_at', { ascending: false });

    // Apply brand filter if provided
    if (brandId) {
      // Verify the brand belongs to user's org
      if (!brandIds.includes(brandId)) {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }
      query = query.eq('brand_id', brandId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching talents:', error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/talents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talents
 * Create a new talent for a brand in the authenticated user's organization
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.org_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Talent name is required' }, { status: 400 });
    }

    if (!body.brand_id || typeof body.brand_id !== 'string') {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    if (!body.reference_images || !Array.isArray(body.reference_images) || body.reference_images.length === 0) {
      return NextResponse.json({ error: 'At least one reference image is required' }, { status: 400 });
    }

    // Verify brand belongs to user's organization
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('id', body.brand_id)
      .eq('org_id', userData.org_id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Prepare talent data
    const talentData: TablesInsert<'talents'> = {
      brand_id: body.brand_id,
      name: body.name.trim(),
      reference_images: body.reference_images,
      face_encoding: body.face_encoding || null,
      notes: body.notes || null,
      approved_platforms: body.approved_platforms || null,
      usage_rights: body.usage_rights || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      expires_at: body.expires_at || null,
    };

    // Insert talent
    const { data, error } = await supabase
      .from('talents')
      .insert(talentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating talent:', error);
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/talents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
