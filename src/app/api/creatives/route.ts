import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/creatives
 * Create a new creative asset
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      brand_id,
      type,
      file_url,
      thumbnail_url,
      name,
      dimensions,
      duration_seconds,
      file_size_bytes,
      source = 'generated',
      metadata,
      tags,
      is_approved = true,
    } = body;

    // Validate required fields
    if (!brand_id || !type || !file_url) {
      return NextResponse.json(
        { error: 'Missing required fields: brand_id, type, file_url' },
        { status: 400 }
      );
    }

    // Verify user has access to this brand
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.org_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 403 });
    }

    // Verify brand belongs to user's org
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, org_id')
      .eq('id', brand_id)
      .eq('org_id', userData.org_id)
      .single();

    if (brandError || !brandData) {
      return NextResponse.json({ error: 'Brand not found or access denied' }, { status: 403 });
    }

    // Create creative
    const { data: creative, error: createError } = await supabase
      .from('creatives')
      .insert({
        brand_id,
        type,
        file_url,
        thumbnail_url,
        name,
        dimensions,
        duration_seconds,
        file_size_bytes,
        source,
        metadata,
        tags,
        is_approved,
        approved_by: is_approved ? user.id : null,
        approved_at: is_approved ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating creative:', createError);
      throw createError;
    }

    return NextResponse.json({ data: creative }, { status: 201 });
  } catch (error) {
    console.error('POST /api/creatives error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/creatives
 * List all creatives for the authenticated user's organization
 * Supports filtering by brand_id, type, source, and search
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
    const type = searchParams.get('type');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    // Build query - join with brands to filter by org
    let query = supabase
      .from('creatives')
      .select(`
        *,
        brands!inner (
          id,
          name,
          org_id
        )
      `)
      .eq('brands.org_id', userData.org_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,metadata->>prompt.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching creatives:', error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/creatives error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
