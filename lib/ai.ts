import { searchOfficialWebsite, searchWithDuckDuckGo } from './services/brave-search';
import { findMostViewedVideo, getYouTubeSearchUrl } from './services/youtube';
import { fetchLogo } from './services/logo';
import { fetchProductImage } from './services/image';
import { generateDescription as generateDescriptionWithGemini, categorize, detectToolType } from './services/gemini';
import { generateDescriptionWithGroq, categorizeWithGroq } from './services/groq';
import { verifyAllFields } from './services/verification';
import { checkQuota, incrementQuota } from './services/quota-tracker';
import { AutoGenerateResult, UnknownToolError, Category } from './services/types';
import { scrapeFuturepediaTool } from './services/futurepedia-scraper';
import { scrapeVideoFromWebsite } from './services/website-video-scraper';

/**
 * Decode HTML entities in text
 * Fixes issues like "Google&#x27;s" → "Google's"
 */
function decodeHtmlEntities(text: string): string {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
  };

  let decoded = text;

  // Replace named entities
  for (const [entity, char] of Object.entries(entityMap)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  // Replace numeric entities (decimal)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

  // Replace numeric entities (hexadecimal)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

  return decoded;
}

export async function autoGenerateToolData(toolName: string): Promise<AutoGenerateResult> {
  try {
    // ========================================
    // STEP 0: Try Futurepedia Scraping First (Enhanced Data)
    // ========================================
    console.log(`\n🔍 Attempting to scrape ${toolName} from Futurepedia...`);
    try {
      const futurepediaData = await scrapeFuturepediaTool(toolName);

      if (futurepediaData) {
        console.log(`✅ Successfully scraped ${toolName} from Futurepedia!`);

        // Get product image - prioritize Google Search over scraped image
        let imageUrl = await fetchProductImage(futurepediaData.websiteUrl, toolName, futurepediaData.description);

        // If Google Search failed and we have a scraped image, use it as fallback
        if (!imageUrl || imageUrl.includes('ui-avatars.com')) {
          imageUrl = futurepediaData.imageUrl || imageUrl;
        }

        console.log(`📸 Using image from: ${imageUrl.includes('ui-avatars') ? 'Placeholder' : imageUrl.includes('futurepedia') ? 'Futurepedia' : 'Google Search'}`);

        // Determine category from description
        let category: Category = 'AI Tools';
        try {
          const geminiQuota = await checkQuota('gemini');
          if (geminiQuota.canUse) {
            category = await categorize(toolName, futurepediaData.description);
            await incrementQuota('gemini');
          }
        } catch (error) {
          console.error('Categorization error:', error);
        }

        // Determine tool type from pricing
        const toolType = futurepediaData.pricingTiers.some((tier: any) =>
          tier.price.toLowerCase().includes('free')
        ) ? 'Free' : 'Paid';

        // Clean description HTML entities
        const cleanDescription = decodeHtmlEntities(futurepediaData.description);

        // Video URL Priority: Official Website → Futurepedia → YouTube API
        let videoUrl = '';

        // Priority 1: Try to scrape video from official website
        console.log(`📹 Video Priority 1: Checking official website (${futurepediaData.websiteUrl})...`);
        try {
          const websiteVideo = await scrapeVideoFromWebsite(futurepediaData.websiteUrl, toolName);
          if (websiteVideo) {
            videoUrl = websiteVideo;
            console.log(`✅ Found video on official website: ${videoUrl}`);
          }
        } catch (error) {
          console.log(`  ℹ️ Could not scrape video from official website`);
        }

        // Priority 2: Use video from Futurepedia if not found on official website
        if (!videoUrl && futurepediaData.videoUrl) {
          videoUrl = futurepediaData.videoUrl;
          console.log(`📹 Video Priority 2: Using video from Futurepedia: ${videoUrl}`);
        }

        // Priority 3: Try YouTube API as final fallback
        if (!videoUrl) {
          console.log(`📹 Video Priority 3: Trying YouTube API search...`);
          try {
            const youtubeQuota = await checkQuota('youtube');
            if (youtubeQuota.canUse) {
              const video = await findMostViewedVideo(toolName);
              if (video) {
                videoUrl = video.url;
                await incrementQuota('youtube');
                console.log(`  ✅ Found video via YouTube API: ${videoUrl}`);
              } else {
                videoUrl = getYouTubeSearchUrl(toolName);
                console.log(`  ℹ️ Using YouTube search URL as final fallback`);
              }
            } else {
              console.warn('  ⚠️ YouTube quota exceeded, using search URL');
              videoUrl = getYouTubeSearchUrl(toolName);
            }
          } catch (error) {
            console.error('  ❌ YouTube search error:', error);
            videoUrl = getYouTubeSearchUrl(toolName);
          }
        }

        return {
          success: true,
          data: {
            websiteUrl: futurepediaData.websiteUrl,
            imageUrl,
            videoUrl,
            description: cleanDescription,
            category,
            toolType,
            keyFeatures: futurepediaData.keyFeatures,
            pros: futurepediaData.pros,
            cons: futurepediaData.cons,
            whoIsUsing: futurepediaData.whoIsUsing,
            pricingTiers: futurepediaData.pricingTiers,
            whatMakesUnique: futurepediaData.whatMakesUnique,
            ratings: futurepediaData.ratings,
            uncommonUseCases: futurepediaData.uncommonUseCases,
            dataSource: 'futurepedia'
          }
        };
      }
    } catch (error) {
      console.log(`ℹ️ Futurepedia scraping failed or tool not found: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log(`ℹ️ Falling back to standard API method...`);

    // ========================================
    // FALLBACK: Standard API Method (Basic Data)
    // ========================================
    // Step 1: Search for official website
    let searchResult;
    try {
      const braveQuota = await checkQuota('brave');
      if (!braveQuota.canUse) {
        console.warn('Brave Search quota exceeded, using DuckDuckGo fallback');
        searchResult = await searchWithDuckDuckGo(toolName);
        if (!searchResult) {
          throw new UnknownToolError(toolName, 'No search results found');
        }
      } else {
        searchResult = await searchOfficialWebsite(toolName);
        await incrementQuota('brave');
      }
    } catch (error) {
      if (error instanceof UnknownToolError) {
        throw error;
      }
      // Try DuckDuckGo fallback
      searchResult = await searchWithDuckDuckGo(toolName);
      if (!searchResult) {
        throw new UnknownToolError(toolName, 'Search failed and fallback returned no results');
      }
    }

    const websiteUrl = searchResult.url;
    const metaDescription = searchResult.description;

    // Step 2: Fetch product image (will use logo as fallback)
    let imageUrl = '';

    // Step 3: Find YouTube video - Priority: Official Website → YouTube API
    let videoUrl = '';

    // Priority 1: Try to scrape video from official website
    console.log(`📹 Video Priority 1: Checking official website (${websiteUrl})...`);
    try {
      const websiteVideo = await scrapeVideoFromWebsite(websiteUrl, toolName);
      if (websiteVideo) {
        videoUrl = websiteVideo;
        console.log(`✅ Found video on official website: ${videoUrl}`);
      }
    } catch (error) {
      console.log(`  ℹ️ Could not scrape video from official website`);
    }

    // Priority 2: Try YouTube API search if not found on website
    if (!videoUrl) {
      console.log(`📹 Video Priority 2: Trying YouTube API search...`);
      try {
        const youtubeQuota = await checkQuota('youtube');
        if (youtubeQuota.canUse) {
          const video = await findMostViewedVideo(toolName);
          if (video) {
            videoUrl = video.url;
            await incrementQuota('youtube');
            console.log(`  ✅ Found video via YouTube API: ${videoUrl}`);
          } else {
            videoUrl = getYouTubeSearchUrl(toolName);
            console.log(`  ℹ️ Using YouTube search URL as fallback`);
          }
        } else {
          console.warn('  ⚠️ YouTube quota exceeded, using search URL');
          videoUrl = getYouTubeSearchUrl(toolName);
        }
      } catch (error) {
        console.error('  ❌ YouTube search error:', error);
        videoUrl = getYouTubeSearchUrl(toolName);
      }
    }

    // Step 4: Generate description (150-200 chars)
    let description = '';
    try {
      const geminiQuota = await checkQuota('gemini');
      if (geminiQuota.canUse) {
        description = await generateDescriptionWithGemini(toolName, { websiteUrl, metaDescription });
        description = decodeHtmlEntities(description); // Clean HTML entities
        await incrementQuota('gemini');
      } else {
        console.warn('Gemini quota exceeded, using Groq fallback');
        const groqQuota = await checkQuota('groq');
        if (groqQuota.canUse) {
          description = await generateDescriptionWithGroq(toolName, { websiteUrl, metaDescription });
          description = decodeHtmlEntities(description); // Clean HTML entities
          await incrementQuota('groq');
        } else {
          // Final fallback: use meta description
          description = metaDescription || `${toolName} is an AI-powered tool for enhanced productivity and automation.`;
          description = decodeHtmlEntities(description); // Clean HTML entities
          if (description.length > 200) {
            description = description.substring(0, 197) + '...';
          }
        }
      }
    } catch (error) {
      console.error('Description generation error:', error);
      description = metaDescription || `${toolName} is an AI-powered tool.`;
      description = decodeHtmlEntities(description); // Clean HTML entities
      if (description.length > 200) {
        description = description.substring(0, 197) + '...';
      }
    }

    // Step 5: Determine category
    let category: Category = 'AI Tools';
    try {
      const geminiQuota = await checkQuota('gemini');
      if (geminiQuota.canUse) {
        category = await categorize(toolName, metaDescription || description);
        await incrementQuota('gemini');
      } else {
        const groqQuota = await checkQuota('groq');
        if (groqQuota.canUse) {
          category = await categorizeWithGroq(toolName, metaDescription || description);
          await incrementQuota('groq');
        }
      }
    } catch (error) {
      console.error('Categorization error:', error);
    }

    // Step 6: Detect tool type (Free/Paid)
    let toolType: 'Free' | 'Paid' = 'Free';
    try {
      const geminiQuota = await checkQuota('gemini');
      if (geminiQuota.canUse) {
        toolType = await detectToolType(toolName, { websiteUrl, metaDescription });
        await incrementQuota('gemini');
      }
    } catch (error) {
      console.error('Tool type detection error:', error);
    }

    // Step 6b: Fetch product image with description context
    imageUrl = await fetchProductImage(websiteUrl, toolName, description);

    // Step 7: Auto-verify all fields
    const verification = await verifyAllFields({
      websiteUrl,
      imageUrl,
      videoUrl,
      description
    });

    if (!verification.allValid) {
      return {
        success: false,
        errors: verification.results,
        partialData: {
          websiteUrl,
          imageUrl,
          videoUrl,
          description,
          category,
          toolType
        }
      };
    }

    // Step 8: Return validated data
    return {
      success: true,
      data: {
        websiteUrl,
        imageUrl,
        videoUrl,
        description,
        category,
        toolType
      }
    };
  } catch (error) {
    if (error instanceof UnknownToolError) {
      throw error;
    }
    throw new Error(`Auto-generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Legacy function for backward compatibility
export async function generateDescription(toolName: string, category: string): Promise<string> {
  const descriptions = [
    `Experience the power of AI with ${toolName}. This innovative tool in the ${category} space streamlines your workflow and boosts productivity.`,
    `${toolName} is a game-changer for ${category} enthusiasts. Unlock new possibilities and achieve professional results with ease.`,
    `Discover the future of ${category} with ${toolName}. Designed for efficiency and precision, it's the perfect companion for your projects.`,
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
}
