/**
 * Jina AI Research Service
 *
 * Performs comprehensive market research using Jina AI's search and web extraction capabilities.
 * Implements category-based search strategy for deep market intelligence.
 */

import { AIServiceError, AuthenticationError, RateLimitError } from './types';

// ============================================================================
// Configuration
// ============================================================================

const JINA_SEARCH_URL = 'https://s.jina.ai/';
const JINA_READ_URL = 'https://r.jina.ai/';
const JINA_API_KEY = process.env.JINA_API_KEY;

// ============================================================================
// Types
// ============================================================================

export interface ResearchInput {
  productName: string;
  businessType: string;
  businessDescription: string;
  targetAudience: string;
}

export interface SearchCategory {
  category: string;
  query: string;
}

export interface ResearchResult {
  category: string;
  query: string;
  data: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface ResearchReport {
  input: ResearchInput;
  results: ResearchResult[];
  timestamp: string;
  searchCount: number;
  successCount: number;
}

// ============================================================================
// Search Query Builder
// ============================================================================

/**
 * Build category-based search queries for comprehensive market research
 */
export function buildResearchQueries(input: ResearchInput): SearchCategory[] {
  const { productName, businessType, businessDescription, targetAudience } = input;

  return [
    // 1. Customer Insights - Reviews, complaints, testimonials
    {
      category: 'Customer Insights',
      query: `${productName} customer reviews complaints testimonials pain points problems solutions real experiences`,
    },

    // 2. Competitive Analysis - Competitors, alternatives, market positioning
    {
      category: 'Competitive Analysis',
      query: `${productName} competitors alternatives comparison ${businessDescription} market leaders best products pricing`,
    },

    // 3. Market Intelligence - Trends, market size, growth
    {
      category: 'Market Intelligence',
      query: `${businessDescription} trends 2024 2025 market size growth ${targetAudience} behavior statistics report`,
    },

    // 4. Marketing Examples - Successful campaigns, ads, case studies
    {
      category: 'Marketing Examples',
      query: `${businessDescription} advertising campaigns successful ads social media marketing examples case studies`,
    },

    // 5. Pricing Intelligence - Cost, value, ROI
    {
      category: 'Pricing Intelligence',
      query: `${productName} pricing cost price comparison value worth it ROI ${businessType} pricing guide`,
    },

    // 6. Audience Research - Demographics, preferences, behavior
    {
      category: 'Audience Research',
      query: `${targetAudience} buying behavior preferences needs wants challenges ${businessDescription}`,
    },
  ];
}

/**
 * Build prioritized search queries (for limited API calls)
 */
export function buildPrioritizedQueries(input: ResearchInput): SearchCategory[] {
  const { productName, businessDescription, targetAudience } = input;

  return [
    // Most important: Customer sentiment and pain points
    {
      category: 'Customer Insights',
      query: `${productName} customer reviews complaints testimonials pain points real experiences reddit honest opinion`,
    },

    // Second: Competitor landscape
    {
      category: 'Competitive Analysis',
      query: `${productName} alternatives competitors comparison versus vs best ${businessDescription} 2024 2025`,
    },

    // Third: Market context
    {
      category: 'Market & Pricing',
      query: `${businessDescription} market trends pricing ${targetAudience} behavior statistics ${productName}`,
    },
  ];
}

// ============================================================================
// Jina AI Research Client
// ============================================================================

export class JinaResearchClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || JINA_API_KEY || '';

    if (!this.apiKey) {
      console.warn('[JinaResearch] No API key provided. Some features may be limited.');
    }
  }

  /**
   * Execute a single search query via Jina AI
   */
  async search(query: string): Promise<string> {
    const url = JINA_SEARCH_URL + encodeURIComponent(query);

    console.log('[JinaResearch] Executing search', { query: query.substring(0, 100) + '...' });

    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      // Add API key if available
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError('Invalid Jina API key');
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new RateLimitError(
            'Jina rate limit exceeded',
            retryAfter ? parseInt(retryAfter) : undefined
          );
        }

        throw new AIServiceError(
          `Jina search failed: ${response.status}`,
          'SEARCH_FAILED',
          response.status
        );
      }

      // Jina returns markdown text
      const text = await response.text();

      console.log('[JinaResearch] Search completed', {
        resultLength: text.length,
      });

      return text;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      console.error('[JinaResearch] Search failed:', error);
      throw new AIServiceError(
        error instanceof Error ? error.message : 'Search failed',
        'SEARCH_ERROR'
      );
    }
  }

  /**
   * Read and extract content from a specific URL
   */
  async readUrl(url: string): Promise<string> {
    const jinaUrl = JINA_READ_URL + encodeURIComponent(url);

    console.log('[JinaResearch] Reading URL', { url: url.substring(0, 50) + '...' });

    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(jinaUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new AIServiceError(
          `Failed to read URL: ${response.status}`,
          'READ_FAILED',
          response.status
        );
      }

      const text = await response.text();
      return text;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      console.error('[JinaResearch] URL read failed:', error);
      throw new AIServiceError(
        error instanceof Error ? error.message : 'URL read failed',
        'READ_ERROR'
      );
    }
  }

  /**
   * Execute multiple category-based searches
   */
  async executeResearch(
    queries: SearchCategory[],
    options: {
      delayBetweenRequests?: number; // ms
      continueOnError?: boolean;
    } = {}
  ): Promise<ResearchResult[]> {
    const {
      delayBetweenRequests = 1000, // 1 second between requests to avoid rate limiting
      continueOnError = true,
    } = options;

    const results: ResearchResult[] = [];

    for (let i = 0; i < queries.length; i++) {
      const { category, query } = queries[i];

      console.log(`[JinaResearch] Processing ${i + 1}/${queries.length}: ${category}`);

      try {
        const data = await this.search(query);

        results.push({
          category,
          query,
          data,
          timestamp: new Date().toISOString(),
          success: true,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.error(`[JinaResearch] Failed: ${category}`, errorMessage);

        results.push({
          category,
          query,
          data: '',
          timestamp: new Date().toISOString(),
          success: false,
          error: errorMessage,
        });

        if (!continueOnError) {
          throw error;
        }
      }

      // Delay between requests (except for the last one)
      if (i < queries.length - 1 && delayBetweenRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    }

    return results;
  }

  /**
   * Run comprehensive market research for a product/business
   */
  async runComprehensiveResearch(
    input: ResearchInput,
    options: {
      usePrioritized?: boolean; // Use fewer, more focused queries
      delayBetweenRequests?: number;
    } = {}
  ): Promise<ResearchReport> {
    const { usePrioritized = false, delayBetweenRequests = 1000 } = options;

    console.log('[JinaResearch] Starting comprehensive research', {
      productName: input.productName,
      usePrioritized,
    });

    // Build search queries
    const queries = usePrioritized
      ? buildPrioritizedQueries(input)
      : buildResearchQueries(input);

    // Execute all searches
    const results = await this.executeResearch(queries, {
      delayBetweenRequests,
      continueOnError: true,
    });

    const report: ResearchReport = {
      input,
      results,
      timestamp: new Date().toISOString(),
      searchCount: results.length,
      successCount: results.filter(r => r.success).length,
    };

    console.log('[JinaResearch] Research completed', {
      searchCount: report.searchCount,
      successCount: report.successCount,
    });

    return report;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let jinaResearchClient: JinaResearchClient | null = null;

export function getJinaResearchClient(): JinaResearchClient {
  if (!jinaResearchClient) {
    jinaResearchClient = new JinaResearchClient();
  }
  return jinaResearchClient;
}

export function resetJinaResearchClient(): void {
  jinaResearchClient = null;
}
