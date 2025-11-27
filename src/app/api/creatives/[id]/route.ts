import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/creatives/[id]
 * Get a single creative by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Get creative with brand info, verify org access
    const { data: creative, error: creativeError } = await supabase
      .from('creatives')
      .select(`
        *,
        brands!inner (
          id,
          name,
          org_id
        )
      `)
      .eq('id', id)
      .eq('brands.org_id', userData.org_id)
      .single();

    if (creativeError || !creative) {
      return NextResponse.json({ error: 'Creative not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ data: creative });
  } catch (error) {
    console.error('GET /api/creatives/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/creatives/[id]
 * Delete a creative and its associated storage file
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Get creative to verify access and get file URL for cleanup
    const { data: creative, error: creativeError } = await supabase
      .from('creatives')
      .select(`
        *,
        brands!inner (
          id,
          name,
          org_id
        )
      `)
      .eq('id', id)
      .eq('brands.org_id', userData.org_id)
      .single();

    if (creativeError || !creative) {
      return NextResponse.json({ error: 'Creative not found or access denied' }, { status: 404 });
    }

    // Try to delete the file from storage if it's a Supabase storage URL
    if (creative.file_url) {
      try {
        // Extract path from Supabase storage URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/creatives/org_id/brand_id/generated/filename.png
        const urlParts = creative.file_url.split('/storage/v1/object/public/creatives/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { error: storageError } = await supabase.storage
            .from('creatives')
            .remove([filePath]);

          if (storageError) {
            console.warn('Failed to delete file from storage:', storageError);
            // Continue with database deletion even if storage deletion fails
          }
        }
      } catch (storageErr) {
        console.warn('Error cleaning up storage file:', storageErr);
        // Continue with database deletion
      }
    }

    // Also try to delete thumbnail if different from file_url
    if (creative.thumbnail_url && creative.thumbnail_url !== creative.file_url) {
      try {
        const urlParts = creative.thumbnail_url.split('/storage/v1/object/public/creatives/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage
            .from('creatives')
            .remove([filePath]);
        }
      } catch (thumbErr) {
        console.warn('Error cleaning up thumbnail file:', thumbErr);
      }
    }

    // Delete the creative record
    const { error: deleteError } = await supabase
      .from('creatives')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting creative:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ success: true, message: 'Creative deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/creatives/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
