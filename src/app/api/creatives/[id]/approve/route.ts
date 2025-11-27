import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/creatives/[id]/approve
 * Update the approval status of a creative
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

    // Parse request body
    const body = await request.json();
    const { is_approved } = body;

    if (typeof is_approved !== 'boolean') {
      return NextResponse.json(
        { error: 'is_approved must be a boolean' },
        { status: 400 }
      );
    }

    // Get the creative to verify ownership through brand
    const { data: creative, error: fetchError } = await supabase
      .from('creatives')
      .select(`
        *,
        brands!inner (
          id,
          org_id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !creative) {
      return NextResponse.json({ error: 'Creative not found' }, { status: 404 });
    }

    // Verify user's org matches creative's brand's org
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.org_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 403 });
    }

    if ((creative.brands as any).org_id !== userData.org_id) {
      return NextResponse.json({ error: 'Not authorized to modify this creative' }, { status: 403 });
    }

    // Update the creative
    const { data, error } = await supabase
      .from('creatives')
      .update({
        is_approved,
        approved_by: is_approved ? user.id : null,
        approved_at: is_approved ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating creative approval:', error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PATCH /api/creatives/[id]/approve error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
