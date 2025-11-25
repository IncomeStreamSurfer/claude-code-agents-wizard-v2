/**
 * OpenRouter Client for Claude Haiku 4.5
 *
 * Used for market research analysis, insights generation, and content processing.
 */

import {
  AIServiceError,
  AuthenticationError,
  RateLimitError,
  type Message,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
} from './types';

// ============================================================================
// Configuration
// ============================================================================

const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Default model - Claude Haiku 4.5 for fast, efficient responses
const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5';

// ============================================================================
// OpenRouter Client
// ============================================================================

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey?: string, baseUrl?: string, model?: string) {
    this.apiKey = apiKey || OPENROUTER_API_KEY || '';
    this.baseUrl = baseUrl || OPENROUTER_API_URL;
    this.model = model || DEFAULT_MODEL;

    if (!this.apiKey) {
      console.warn('[OpenRouter] No API key provided. Client will not function.');
    }
  }

  /**
   * Send a chat completion request to OpenRouter
   */
  async chatCompletion(
    messages: Message[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      topP?: number;
    } = {}
  ): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new AuthenticationError('OpenRouter API key not configured');
    }

    const requestBody: ChatCompletionRequest = {
      model: options.model || this.model,
      messages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1,
    };

    console.log('[OpenRouter] Sending request', {
      model: requestBody.model,
      messageCount: messages.length,
      maxTokens: requestBody.max_tokens,
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'AdForge',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new AuthenticationError('Invalid OpenRouter API key');
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new RateLimitError(
            'OpenRouter rate limit exceeded',
            retryAfter ? parseInt(retryAfter) : undefined
          );
        }

        throw new AIServiceError(
          errorData.error?.message || `OpenRouter API error: ${response.status}`,
          errorData.error?.code || 'API_ERROR',
          response.status,
          errorData
        );
      }

      const data: ChatCompletionResponse = await response.json();

      console.log('[OpenRouter] Response received', {
        model: data.model,
        usage: data.usage,
        finishReason: data.choices[0]?.finish_reason,
      });

      return data;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      console.error('[OpenRouter] Request failed:', error);
      throw new AIServiceError(
        error instanceof Error ? error.message : 'Unknown error',
        'REQUEST_FAILED'
      );
    }
  }

  /**
   * Simple text completion with a single prompt
   */
  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: Message[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await this.chatCompletion(messages);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Analyze research data and generate insights
   */
  async analyzeResearch(researchData: {
    category: string;
    query: string;
    data: string;
  }[]): Promise<string> {
    const systemPrompt = `You are a market research analyst for AdForge, an AI-powered digital marketing platform.
Your job is to analyze raw research data and extract actionable insights for creating effective advertising campaigns.

Focus on:
1. Customer pain points and desires
2. Competitor positioning and gaps
3. Market trends and opportunities
4. Pricing intelligence
5. Successful messaging themes
6. Target audience characteristics

Provide your analysis in a clear, structured format with specific, actionable recommendations.`;

    const researchSummary = researchData.map(item =>
      `## ${item.category}\n**Query:** ${item.query}\n\n${item.data}`
    ).join('\n\n---\n\n');

    const prompt = `Analyze the following market research data and provide comprehensive insights:\n\n${researchSummary}`;

    return this.complete(prompt, systemPrompt);
  }

  /**
   * Generate ad copy suggestions based on research insights
   */
  async generateAdCopySuggestions(
    productName: string,
    insights: string,
    targetAudience: string
  ): Promise<string> {
    const systemPrompt = `You are an expert advertising copywriter. Based on market research insights,
generate compelling ad copy variations for different platforms (Facebook, Instagram, Google Ads, TikTok).

For each platform, provide:
- 3 headline variations (character limits respected)
- 2 primary text variations
- 1 call-to-action suggestion

Keep copy authentic, benefit-focused, and aligned with the research insights.`;

    const prompt = `Product: ${productName}
Target Audience: ${targetAudience}

Research Insights:
${insights}

Generate optimized ad copy for this product based on the research insights.`;

    return this.complete(prompt, systemPrompt);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    openRouterClient = new OpenRouterClient();
  }
  return openRouterClient;
}

export function resetOpenRouterClient(): void {
  openRouterClient = null;
}
