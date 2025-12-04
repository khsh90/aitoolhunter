import { VerificationResult, VerificationSummary } from './types';

export async function verifyWebsiteUrl(url: string): Promise<VerificationResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    clearTimeout(timeoutId);

    // Accept 2xx, 3xx, and 403 (website exists but blocks HEAD requests)
    const valid = response.ok || response.status === 403;

    return {
      field: 'websiteUrl',
      valid: valid,
      error: valid ? undefined : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    return {
      field: 'websiteUrl',
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify URL'
    };
  }
}

export async function verifyImageUrl(url: string): Promise<VerificationResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isImage = contentType?.startsWith('image/');

    return {
      field: 'imageUrl',
      valid: response.ok && !!isImage,
      error: !response.ok ? `HTTP ${response.status}` :
             !isImage ? `Invalid content type: ${contentType}` :
             undefined
    };
  } catch (error) {
    return {
      field: 'imageUrl',
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify image'
    };
  }
}

export async function verifyYouTubeVideo(url: string): Promise<VerificationResult> {
  try {
    // Extract video ID from URL
    const videoId = url.match(/[?&]v=([^&]+)/)?.[1] || url.split('/').pop();

    if (!videoId) {
      return { field: 'videoUrl', valid: false, error: 'Invalid YouTube URL format' };
    }

    // Check using oEmbed endpoint (no API key required)
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    return {
      field: 'videoUrl',
      valid: response.ok,
      error: response.ok ? undefined : 'Video not found or unavailable'
    };
  } catch (error) {
    return {
      field: 'videoUrl',
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify video'
    };
  }
}

export function verifyDescription(description: string): VerificationResult {
  const length = description.trim().length;
  const valid = length >= 150 && length <= 200;

  return {
    field: 'description',
    valid,
    error: valid ? undefined : `Description must be 150-200 characters (current: ${length})`
  };
}

export async function verifyAllFields(data: {
  websiteUrl: string;
  imageUrl: string;
  videoUrl?: string;
  description: string;
}): Promise<VerificationSummary> {
  const results = await Promise.all([
    verifyWebsiteUrl(data.websiteUrl),
    verifyImageUrl(data.imageUrl),
    data.videoUrl ? verifyYouTubeVideo(data.videoUrl) : Promise.resolve({ field: 'videoUrl', valid: true }),
    Promise.resolve(verifyDescription(data.description))
  ]);

  return {
    allValid: results.every(r => r.valid),
    results: results.filter(r => !r.valid) // Only return failed validations
  };
}
