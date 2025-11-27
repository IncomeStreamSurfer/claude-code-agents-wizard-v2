import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getJinaResearchClient, getOpenRouterClient } from '@/lib/ai';
import type { ResearchInput } from '@/lib/ai';

// ============================================================================
// Request/Response Types
// ============================================================================

interface ResearchRequest {
  productName: string;
  businessType: string;
  businessDescription: string;
  targetAudience: string;
  brand_id?: string;
  usePrioritized?: boolean; // Use fewer, focused queries
  analyzeWithAI?: boolean; // Process results with Claude Haiku
}

interface ResearchResponse {
  id: string;
  status: 'completed' | 'failed';
  results: Array<{
    category: string;
    query: string;
    data: string;
    success: boolean;
    error?: string;
  }>;
  analysis?: string;
  adCopySuggestions?: string;
  timestamp: string;
  searchCount: number;
  successCount: number;
}

// ============================================================================
// Validation
// ============================================================================

function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body.productName || typeof body.productName !== 'string') {
    return { valid: false, error: 'productName is required' };
  }

  if (!body.businessType || typeof body.businessType !== 'string') {
    return { valid: false, error: 'businessType is required' };
  }

  if (!body.businessDescription || typeof body.businessDescription !== 'string') {
    return { valid: false, error: 'businessDescription is required' };
  }

  if (!body.targetAudience || typeof body.targetAudience !== 'string') {
    return { valid: false, error: 'targetAudience is required' };
  }

  return { valid: true };
}

// ============================================================================
// POST /api/research
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    let body: ResearchRequest;
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

    // Verify brand access if provided
    if (body.brand_id) {
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id')
        .eq('id', body.brand_id)
        .eq('org_id', userData.org_id)
        .single();

      if (brandError || !brand) {
        return NextResponse.json({ error: 'Brand not found or access denied' }, { status: 404 });
      }
    }

    // Create research input
    const researchInput: ResearchInput = {
      productName: body.productName,
      businessType: body.businessType,
      businessDescription: body.businessDescription,
      targetAudience: body.targetAudience,
    };

    console.log('[Research API] Starting research', {
      productName: body.productName,
      usePrioritized: body.usePrioritized,
      analyzeWithAI: body.analyzeWithAI,
    });

    // Execute Jina AI research
    const jinaClient = getJinaResearchClient();
    const researchReport = await jinaClient.runComprehensiveResearch(researchInput, {
      usePrioritized: body.usePrioritized ?? false,
      delayBetweenRequests: 1500, // 1.5s between requests
    });

    // Prepare response
    const response: ResearchResponse = {
      id: `research_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: researchReport.successCount > 0 ? 'completed' : 'failed',
      results: researchReport.results.map(r => ({
        category: r.category,
        query: r.query,
        data: r.data,
        success: r.success,
        error: r.error,
      })),
      timestamp: researchReport.timestamp,
      searchCount: researchReport.searchCount,
      successCount: researchReport.successCount,
    };

    // AI Analysis with Claude Haiku (if requested and we have results)
    if (body.analyzeWithAI && researchReport.successCount > 0) {
      try {
        const openRouterClient = getOpenRouterClient();

        // Filter successful results for analysis
        const successfulResults = researchReport.results
          .filter(r => r.success && r.data)
          .map(r => ({
            category: r.category,
            query: r.query,
            data: r.data.substring(0, 8000), // Limit data per category to avoid token limits
          }));

        console.log('[Research API] Analyzing with Claude Haiku', {
          categoriesCount: successfulResults.length,
        });

        // Get comprehensive analysis
        const analysis = await openRouterClient.analyzeResearch(successfulResults);
        response.analysis = analysis;

        // Generate ad copy suggestions
        const adCopySuggestions = await openRouterClient.generateAdCopySuggestions(
          body.productName,
          analysis,
          body.targetAudience
        );
        response.adCopySuggestions = adCopySuggestions;

      } catch (aiError) {
        console.error('[Research API] AI analysis failed:', aiError);
        // Continue without AI analysis - we still have the raw research data
      }
    }

    // Optionally store research in database (for history)
    // Only save if a brand_id is provided (required by schema)
    if (body.brand_id) {
      try {
        await supabase
          .from('research_reports')
          .insert({
            brand_id: body.brand_id,
            type: 'market_research',
            title: `Research: ${body.productName}`,
            data: {
              input: {
                productName: body.productName,
                businessType: body.businessType,
                businessDescription: body.businessDescription,
                targetAudience: body.targetAudience,
              },
              results: response.results,
              analysis: response.analysis || null,
              adCopySuggestions: response.adCopySuggestions || null,
              searchCount: response.searchCount,
              successCount: response.successCount,
            },
            generated_at: new Date().toISOString(),
          });
      } catch (dbError) {
        // Log but don't fail - research was still successful
        console.warn('[Research API] Failed to store research report:', dbError);
      }
    }

    console.log('[Research API] Research completed', {
      id: response.id,
      searchCount: response.searchCount,
      successCount: response.successCount,
      hasAnalysis: !!response.analysis,
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('POST /api/research error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/research - Get research history
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query - join with brands to filter by org
    let query = supabase
      .from('research_reports')
      .select(`
        *,
        brands!inner (
          id,
          name,
          org_id
        )
      `)
      .eq('brands.org_id', userData.org_id)
      .eq('type', 'market_research')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data: reports, error: queryError } = await query;

    if (queryError) {
      console.error('Failed to fetch research reports:', queryError);
      return NextResponse.json({ error: 'Failed to fetch research history' }, { status: 500 });
    }

    return NextResponse.json({ data: reports || [] });

  } catch (error) {
    console.error('GET /api/research error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
