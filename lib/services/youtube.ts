import { YouTubeVideo } from './types';

interface YouTubeSearchResponse {
  items?: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
  }>;
}

interface YouTubeVideosResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

export async function findMostViewedVideo(toolName: string): Promise<YouTubeVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return null;
  }

  try {
    // Build improved search query - more specific to find relevant videos
    const searchQuery = `${toolName} AI tutorial review`;

    // Step 1: Search for videos
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=15&order=relevance&key=${apiKey}`
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube Search API error: ${searchResponse.status}`);
    }

    const searchData: YouTubeSearchResponse = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return null;
    }

    // Step 2: Get video statistics for viewCount
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');

    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`
    );

    if (!statsResponse.ok) {
      throw new Error(`YouTube Videos API error: ${statsResponse.status}`);
    }

    const statsData: YouTubeVideosResponse = await statsResponse.json();

    if (!statsData.items || statsData.items.length === 0) {
      return null;
    }

    // Extract tool name keywords for matching (handle multi-word tool names)
    const toolKeywords = toolName.toLowerCase().split(' ').filter(word => word.length > 2);

    // Sort by viewCount and filter by quality threshold + relevance
    const qualityVideos = statsData.items
      .filter(v => {
        const viewCount = parseInt(v.statistics.viewCount);
        const title = v.snippet.title.toLowerCase();

        // Higher quality threshold: 10,000 views minimum
        if (viewCount < 10000) return false;

        // Relevance filter: title must contain at least one tool keyword
        const hasRelevantKeyword = toolKeywords.some(keyword => title.includes(keyword));
        return hasRelevantKeyword;
      })
      .sort((a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount));

    if (qualityVideos.length === 0) {
      return null;
    }

    const topVideo = qualityVideos[0];

    return {
      videoId: topVideo.id,
      title: topVideo.snippet.title,
      viewCount: parseInt(topVideo.statistics.viewCount),
      thumbnailUrl: topVideo.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${topVideo.id}`
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    return null;
  }
}

// Fallback: Return YouTube search URL if API fails
export function getYouTubeSearchUrl(toolName: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(toolName + ' AI tutorial review')}`;
}
