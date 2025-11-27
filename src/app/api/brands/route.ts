import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TablesInsert } from '@/types/database';

/**
 * GET /api/brands
 * List all brands for the authenticated user's organization
 * Supports ?search query parameter for filtering by name
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

    // Get search parameter
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('brands')
      .select('*')
      .eq('org_id', userData.org_id)
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/brands error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brands
 * Create a new brand for the authenticated user's organization
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
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    // Prepare brand data
    const brandData: TablesInsert<'brands'> = {
      org_id: userData.org_id,
      name: body.name.trim(),
      industry: body.industry || null,
      logo_url: body.logo_url || null,
      website_url: body.website_url || null,
      colors: body.colors || null,
      fonts: body.fonts || null,
      voice_profile: body.voice_profile || null,
      target_audience: body.target_audience || null,
    };

    // Insert brand
    const { data, error } = await supabase
      .from('brands')
      .insert(brandData)
      .select()
      .single();

    if (error) {
      console.error('Error creating brand:', error);

      // Check for unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A brand with this name already exists' }, { status: 409 });
      }

      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/brands error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
