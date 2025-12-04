/**
 * Futurepedia Scraper Service with Puppeteer
 * Scrapes AI tool data from Futurepedia.io using browser automation
 */

import puppeteer from 'puppeteer';

export interface FuturepediaToolData {
    name: string;
    description: string;
    websiteUrl: string;
    imageUrl?: string;
    videoUrl?: string;
    keyFeatures: string[];
    pros: string[];
    cons: string[];
    whoIsUsing: string[];
    pricingTiers: {
        name: string;
        price: string;
        features?: string[];
    }[];
    whatMakesUnique: string;
    ratings?: {
        accuracyReliability: number;
        easeOfUse: number;
        functionalityFeatures: number;
        performanceSpeed: number;
        customizationFlexibility: number;
        dataPrivacySecurity: number;
        supportResources: number;
        costEfficiency: number;
        integrationCapabilities: number;
        overallScore: number;
    };
    uncommonUseCases?: string[];
}

/**
 * Search for a tool on Futurepedia and return its URL
 */
async function searchToolOnFuturepedia(toolName: string): Promise<string | null> {
    try {
        // Futurepedia uses URL format: /tool/{tool-name-lowercase}
        const slug = toolName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const potentialUrl = `https://www.futurepedia.io/tool/${slug}`;

        // Try to fetch the page
        const response = await fetch(potentialUrl, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            return potentialUrl;
        }

        return null;
    } catch (error) {
        console.error('Error searching Futurepedia:', error);
        return null;
    }
}

/**
 * Main function to scrape tool data from Futurepedia using Puppeteer
 */
export async function scrapeFuturepediaTool(toolName: string): Promise<FuturepediaToolData | null> {
    let browser;

    try {
        console.log(`🔍 Attempting to scrape ${toolName} from Futurepedia...`);

        // Step 1: Find the tool URL
        const toolUrl = await searchToolOnFuturepedia(toolName);
        if (!toolUrl) {
            console.log(`❌ Tool not found on Futurepedia: ${toolName}`);
            return null;
        }

        console.log(`✅ Found tool at: ${toolUrl}`);

        // Step 2: Launch Puppeteer browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Step 3: Navigate to the tool page
        console.log(`📄 Loading page...`);
        await page.goto(toolUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Step 4: Extract data from the rendered page
        console.log(`📊 Extracting data...`);

        // Use a simpler evaluation approach
        const description = await page.$eval('meta[property="og:description"],meta[name="description"]',
            el => el.getAttribute('content') || ''
        ).catch(() => '');

        // Extract image from meta tags or page
        const imageUrl = await page.evaluate(() => {
            // Try Open Graph image first
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) {
                const content = ogImage.getAttribute('content');
                if (content && content.startsWith('http')) {
                    return content;
                }
            }

            // Try Twitter image
            const twitterImage = document.querySelector('meta[name="twitter:image"]');
            if (twitterImage) {
                const content = twitterImage.getAttribute('content');
                if (content && content.startsWith('http')) {
                    return content;
                }
            }

            // Try to find the main product image on the page
            const images = Array.from(document.querySelectorAll('img'));
            for (const img of images) {
                const src = img.getAttribute('src') || '';
                const alt = img.getAttribute('alt') || '';
                // Look for images that might be logos or product images
                if ((alt.toLowerCase().includes('logo') ||
                     src.toLowerCase().includes('logo') ||
                     src.toLowerCase().includes('icon')) &&
                    src.startsWith('http')) {
                    return src;
                }
            }

            return '';
        });

        const websiteUrl = await page.evaluate(() => {
            // Look for "Visit Website" or "Official Website" button/link
            const links = Array.from(document.querySelectorAll('a'));
            for (const link of links) {
                const text = (link.textContent || '').toLowerCase();
                const ariaLabel = (link.getAttribute('aria-label') || '').toLowerCase();

                // Check text or aria-label for "visit" or "official"
                if (text.includes('visit') || text.includes('official') ||
                    ariaLabel.includes('visit') || ariaLabel.includes('official')) {
                    const href = link.getAttribute('href') || '';
                    // Make sure it's not a Futurepedia link
                    if (href.startsWith('http') && !href.includes('futurepedia.io')) {
                        return href;
                    }
                }
            }

            // Fallback: Look for the first external link that's not Futurepedia
            for (const link of links) {
                const href = link.getAttribute('href') || '';
                if (href.startsWith('http') &&
                    !href.includes('futurepedia.io') &&
                    !href.includes('youtube.com') &&
                    !href.includes('twitter.com') &&
                    !href.includes('linkedin.com')) {
                    return href;
                }
            }

            return window.location.href;
        });

        const videoUrl = await page.evaluate(() => {
            // Try to find YouTube iframe
            const iframe = document.querySelector('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
            if (iframe) {
                const src = iframe.getAttribute('src') || '';
                const match = src.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
                if (match) {
                    return `https://www.youtube.com/watch?v=${match[1]}`;
                }
            }

            // Try to find video element with source
            const video = document.querySelector('video source, video');
            if (video) {
                const src = video.getAttribute('src');
                if (src && src.includes('youtube')) {
                    return src;
                }
            }

            // Try to find any YouTube link in the page
            const links = Array.from(document.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]'));
            for (const link of links) {
                const href = link.getAttribute('href') || '';
                if (href.includes('/watch?v=') || href.includes('youtu.be/')) {
                    return href;
                }
            }

            return '';
        });

        const extractList = async (headingText: string) => {
            return await page.evaluate((heading) => {
                const items: string[] = [];
                const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4'));
                const targetHeading = headings.find(h => h.textContent && h.textContent.includes(heading));

                if (targetHeading) {
                    let next = targetHeading.nextElementSibling;
                    while (next && !next.matches('h1,h2,h3,h4')) {
                        if (next.matches('ul,ol')) {
                            const lis = Array.from(next.querySelectorAll('li'));
                            for (const li of lis) {
                                const text = li.textContent;
                                if (text) items.push(text.trim());
                            }
                        }
                        next = next.nextElementSibling;
                    }
                }
                return items;
            }, headingText);
        };

        const keyFeatures = await extractList('Key Features');
        const pros = await extractList('Pros');
        const cons = await extractList('Cons');
        const whoIsUsing = await extractList('Who is Using');
        const pricingItems = await extractList('Pricing');

        const pricingTiers = pricingItems.map(item => {
            const match = item.match(/([^:]+):\s*(.+)/);
            if (match) {
                const [, tierName, description] = match;
                const priceMatch = description.match(/\$[\d.]+(?:\/\w+)?|[Ff]ree/i);
                return {
                    name: tierName.trim(),
                    price: priceMatch ? priceMatch[0] : 'Contact for pricing',
                    features: []
                };
            }
            return null;
        }).filter(tier => tier !== null) as any[];

        const whatMakesUnique = await page.evaluate(() => {
            const headings = Array.from(document.querySelectorAll('h1,h2,h3'));
            const uniqueHeading = headings.find(h =>
                h.textContent && h.textContent.includes('What Makes') && h.textContent.includes('Unique')
            );

            if (uniqueHeading) {
                let next = uniqueHeading.nextElementSibling;
                let text = '';
                while (next && !next.matches('h1,h2,h3')) {
                    text += next.textContent + ' ';
                    next = next.nextElementSibling;
                }
                return text.trim();
            }
            return '';
        });

        let ratings: FuturepediaToolData['ratings'] = undefined;
        const ratingsItems = await extractList('How We Rated');

        if (ratingsItems.length > 0) {
            const ratingsObj: Record<string, number> = {};
            ratingsItems.forEach(item => {
                const match = item.match(/([^:]+):\s*([\d.]+)\/5/);
                if (match) {
                    const [, category, score] = match;
                    const key = category.trim()
                        .replace(/\s+and\s+/g, '')
                        .replace(/\s+/g, '')
                        .replace(/^./, c => c.toLowerCase());
                    ratingsObj[key] = parseFloat(score);
                }
            });

            if (Object.keys(ratingsObj).length > 0) {
                ratings = {
                    accuracyReliability: ratingsObj.accuracyReliability || ratingsObj.accuracy || 0,
                    easeOfUse: ratingsObj.easeofUse || ratingsObj.easeOfUse || 0,
                    functionalityFeatures: ratingsObj.functionalityFeatures || ratingsObj.functionality || 0,
                    performanceSpeed: ratingsObj.performanceSpeed || ratingsObj.performance || 0,
                    customizationFlexibility: ratingsObj.customizationFlexibility || ratingsObj.customization || 0,
                    dataPrivacySecurity: ratingsObj.dataPrivacySecurity || ratingsObj.privacy || 0,
                    supportResources: ratingsObj.supportResources || ratingsObj.support || 0,
                    costEfficiency: ratingsObj.costEfficiency || ratingsObj.cost || 0,
                    integrationCapabilities: ratingsObj.integrationCapabilities || ratingsObj.integration || 0,
                    overallScore: ratingsObj.overallScore || ratingsObj.overall || 0,
                };
            }
        }

        const uncommonUseCases = whoIsUsing.filter(item => item.toLowerCase().includes('uncommon'));

        // Construct final result
        const result: FuturepediaToolData = {
            name: toolName,
            description,
            websiteUrl,
            imageUrl: imageUrl || undefined,
            videoUrl: videoUrl || undefined,
            keyFeatures,
            pros,
            cons,
            whoIsUsing,
            pricingTiers,
            whatMakesUnique,
            ratings,
            uncommonUseCases: uncommonUseCases.length > 0 ? uncommonUseCases : undefined
        };

        console.log(`✅ Successfully scraped data for ${toolName}`);
        console.log(`   Website: ${result.websiteUrl}`);
        console.log(`   Video: ${result.videoUrl ? '✓ Found' : '✗ Not found'}`);
        console.log(`   Image: ${result.imageUrl ? '✓ Found' : '✗ Not found'}`);
        console.log(`   Features: ${result.keyFeatures.length}, Pros: ${result.pros.length}, Cons: ${result.cons.length}`);
        console.log(`   Pricing tiers: ${result.pricingTiers.length}, Ratings: ${result.ratings ? 'Yes' : 'No'}`);

        return result;

    } catch (error) {
        console.error(`❌ Error scraping Futurepedia for ${toolName}:`, error);
        return null;
    } finally {
        // Always close the browser
        if (browser) {
            await browser.close();
        }
    }
}
