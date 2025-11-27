import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TablesUpdate } from '@/types/database';

/**
 * Helper function to verify product ownership
 * Returns the product if user has access through brand org membership, otherwise returns null
 */
async function verifyProductAccess(supabase: any, productId: string, userId: string) {
  // Get user's organization ID
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', userId)
    .single();

  if (userError || !userData?.org_id) {
    return null;
  }

  // Check if product belongs to a brand in user's organization
  const { data: product, error: productError } = await supabase
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
    .eq('id', productId)
    .eq('brands.org_id', userData.org_id)
    .single();

  if (productError || !product) {
    return null;
  }

  return product;
}

/**
 * GET /api/products/[id]
 * Get a single product by ID (must belong to a brand in user's organization)
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

    // Verify product access
    const product = await verifyProductAccess(supabase, id, user.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id]
 * Update a product by ID (must belong to a brand in user's organization)
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

    // Verify product access
    const existingProduct = await verifyProductAccess(supabase, id, user.id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Prepare update data (only include provided fields)
    const updateData: TablesUpdate<'products'> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'Product name cannot be empty' }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.description !== undefined) updateData.description = body.description;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;
    if (body.variants !== undefined) updateData.variants = body.variants;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.feed_product_id !== undefined) updateData.feed_product_id = body.feed_product_id;
    if (body.feed_source !== undefined) updateData.feed_source = body.feed_source;
    if (body.processed_images !== undefined) updateData.processed_images = body.processed_images;

    // Set updated_at
    updateData.updated_at = new Date().toISOString();

    // Update product
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
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
      console.error('Error updating product:', error);

      // Check for unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A product with this SKU already exists' }, { status: 409 });
      }

      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PATCH /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product by ID (must belong to a brand in user's organization)
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

    // Verify product access
    const existingProduct = await verifyProductAccess(supabase, id, user.id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check for dependencies before deleting
    // Check if product has generation jobs
    const { count: jobCount, error: jobError } = await supabase
      .from('generation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', id);

    if (jobError) {
      console.error('Error checking generation jobs:', jobError);
      throw jobError;
    }

    if (jobCount && jobCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing generation jobs. Please delete jobs first.' },
        { status: 409 }
      );
    }

    // Delete product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
