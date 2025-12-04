/**
 * Google Custom Search API Service
 * Fetches high-quality product images for AI tools
 */

export interface GoogleImageResult {
    link: string;
    title: string;
    thumbnailLink: string;
    contextLink: string;
}

/**
 * Search for high-quality product images using Google Custom Search API
 */
export async function searchGoogleImages(toolName: string, websiteUrl?: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    // If no search engine ID is configured, return null
    if (!searchEngineId) {
        console.log('Google Custom Search Engine ID not configured, skipping Google image search');
        return null;
    }

    if (!apiKey) {
        console.log('Google API key not found, skipping Google image search');
        return null;
    }

    try {
        // Extract domain from website URL if provided
        let domain = '';
        if (websiteUrl) {
            try {
                const url = new URL(websiteUrl);
                domain = url.hostname.replace('www.', '');
            } catch {
                // Invalid URL, ignore
            }
        }

        // Build search query - SPECIFICALLY TARGET LOGOS ONLY
        // Prioritize PNG logos from official website for best quality and transparency
        const searchQuery = domain
            ? `${toolName} logo site:${domain}`
            : `${toolName} official logo brand`;

        const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
        searchUrl.searchParams.append('key', apiKey);
        searchUrl.searchParams.append('cx', searchEngineId);
        searchUrl.searchParams.append('q', searchQuery);
        searchUrl.searchParams.append('searchType', 'image');
        searchUrl.searchParams.append('num', '5'); // Get top 5 results for better logo selection
        searchUrl.searchParams.append('imgSize', 'medium'); // Medium size - good for logos
        searchUrl.searchParams.append('imgType', 'photo'); // Prefer clean logo photos
        searchUrl.searchParams.append('fileType', 'png'); // PNG preferred for logo transparency
        searchUrl.searchParams.append('safe', 'active'); // Safe search

        console.log(`🔍 Searching Google Images for LOGO: ${searchQuery}`);

        const response = await fetch(searchUrl.toString(), {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Google Image Search API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.log(`No images found for ${toolName}`);
            return null;
        }

        // Return the first high-quality result
        const firstResult = data.items[0] as GoogleImageResult;
        console.log(`✅ Found image: ${firstResult.link}`);

        return firstResult.link;
    } catch (error) {
        console.error('Google Image Search error:', error);
        return null;
    }
}

/**
 * Search using Pexels API as fallback
 */
export async function searchPexelsImages(toolName: string): Promise<string | null> {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
        console.log('Pexels API key not found');
        return null;
    }

    try {
        // Search for generic tech/AI images related to the tool category
        const searchQuery = `${toolName} artificial intelligence technology`;

        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=square`,
            {
                headers: {
                    'Authorization': apiKey,
                },
            }
        );

        if (!response.ok) {
            console.error(`Pexels API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (!data.photos || data.photos.length === 0) {
            return null;
        }

        // Return medium-sized image
        return data.photos[0].src.medium;
    } catch (error) {
        console.error('Pexels search error:', error);
        return null;
    }
}
