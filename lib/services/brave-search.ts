import { SearchResult, UnknownToolError } from './types';
import { verifyWebsiteUrl } from './verification';

interface BraveSearchResponse {
  web?: {
    results: Array<{
      url: string;
      title: string;
      description: string;
    }>;
  };
}

export async function searchOfficialWebsite(toolName: string): Promise<SearchResult> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    console.warn('Brave Search API key not configured, using fallback');
    throw new Error('Brave Search API key not configured');
  }

  try {
    // Build enhanced search query for AI tools
    const quoted = toolName.includes(' ') ? `"${toolName}"` : toolName;
    const query = `${quoted} official site AI tool`;

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status}`);
    }

    const data: BraveSearchResponse = await response.json();

    if (!data.web?.results || data.web.results.length === 0) {
      throw new UnknownToolError(toolName, 'No search results found');
    }

    // Enhanced filtering: exclude generic sites AND aggregator sites
    const validResults = data.web.results.filter(r => {
      const url = r.url.toLowerCase();
      const title = r.title.toLowerCase();
      const toolNameLower = toolName.toLowerCase();

      // Exclude generic reference sites
      if (url.includes('wikipedia.org') ||
        url.includes('dictionary.com') ||
        url.includes('urbandictionary.com') ||
        url.includes('wiktionary.org')) {
        return false;
      }

      // Exclude aggregator/review sites
      if (url.includes('producthunt.com') ||
        url.includes('alternativeto.net') ||
        url.includes('g2.com') ||
        url.includes('capterra.com') ||
        url.includes('trustpilot.com') ||
        url.includes('getapp.com')) {
        return false;
      }

      return true;
    });

    if (validResults.length === 0) {
      throw new UnknownToolError(toolName, 'Only generic or aggregator results found');
    }

    // Score and sort results to prioritize official sites
    const scoredResults = validResults.map(result => {
      let score = 0;
      const url = new URL(result.url);
      const domain = url.hostname.replace('www.', '').toLowerCase();
      const toolNameLower = toolName.toLowerCase();
      const toolKeywords = toolNameLower.split(' ');

      // Prioritize domains containing tool name
      if (toolKeywords.some(keyword => domain.includes(keyword))) {
        score += 10;
      }

      // Prefer .ai, .com, .io domains (common for AI tools)
      if (domain.endsWith('.ai')) score += 5;
      if (domain.endsWith('.com')) score += 3;
      if (domain.endsWith('.io')) score += 3;

      // Check if title mentions the tool name
      if (result.title.toLowerCase().includes(toolNameLower)) {
        score += 5;
      }

      // Check if description mentions the tool name
      if (result.description.toLowerCase().includes(toolNameLower)) {
        score += 2;
      }

      return { ...result, score };
    });

    // Sort by score (highest first)
    scoredResults.sort((a, b) => b.score - a.score);

    const topResult = scoredResults[0];

    // Extract domain
    const url = new URL(topResult.url);
    const domain = url.hostname.replace('www.', '');

    // Verify URL is accessible
    const verification = await verifyWebsiteUrl(topResult.url);
    if (!verification.valid) {
      throw new UnknownToolError(toolName, `Website URL not accessible: ${verification.error}`);
    }

    return {
      url: topResult.url,
      title: topResult.title,
      description: topResult.description,
      domain
    };
  } catch (error) {
    if (error instanceof UnknownToolError) {
      throw error;
    }
    throw new Error(`Brave Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fallback using DuckDuckGo Instant Answer API (no API key needed)
export async function searchWithDuckDuckGo(toolName: string): Promise<SearchResult | null> {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(toolName + ' official website')}&format=json&no_html=1`
    );

    if (!response.ok) {
      return null;
    }

    const data: any = await response.json();

    // DuckDuckGo Instant Answer returns different formats
    const url = data.AbstractURL || data.Redirect || null;

    if (!url) {
      return null;
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');

    return {
      url,
      title: data.Heading || toolName,
      description: data.AbstractText || '',
      domain
    };
  } catch (error) {
    console.error('DuckDuckGo search failed:', error);
    return null;
  }
}
