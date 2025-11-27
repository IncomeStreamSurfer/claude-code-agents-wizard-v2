import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TablesInsert } from '@/types/database';

/**
 * GET /api/products
 * List all products for the authenticated user's organization
 * Supports ?brand_id and ?search query parameters
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

    // Build query with brand join to enforce org isolation
    let query = supabase
      .from('products')
      .select(`
        *,
        brand:brands!inner(
          id,
          name,
          org_id,
          logo_url
        )
      `)
      .eq('brands.org_id', userData.org_id)
      .order('created_at', { ascending: false });

    // Apply brand filter if provided
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    // Apply search filter if provided (search by name or SKU)
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product for a brand in the authenticated user's organization
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
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    if (!body.brand_id || typeof body.brand_id !== 'string') {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    // Verify brand belongs to user's organization
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id, org_id')
      .eq('id', body.brand_id)
      .eq('org_id', userData.org_id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Brand not found or access denied' }, { status: 404 });
    }

    // Prepare product data
    const productData: TablesInsert<'products'> = {
      brand_id: body.brand_id,
      name: body.name.trim(),
      description: body.description || null,
      sku: body.sku || null,
      images: body.images || null,
      price: body.price || null,
      currency: body.currency || null,
      metadata: body.metadata || null,
      variants: body.variants || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      feed_product_id: body.feed_product_id || null,
      feed_source: body.feed_source || null,
      processed_images: body.processed_images || null,
    };

    // Insert product
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select(`
        *,
        brand:brands(
          id,
          name,
          org_id,
          logo_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating product:', error);

      // Check for unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A product with this SKU already exists' }, { status: 409 });
      }

      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
