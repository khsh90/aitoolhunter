/**
 * Website Video Scraper
 * Scrapes YouTube video URLs directly from tool's official website
 */

import puppeteer from 'puppeteer';

/**
 * Scrape video URL from the official tool website
 * Looks for YouTube embeds, video elements, and YouTube links
 */
export async function scrapeVideoFromWebsite(websiteUrl: string, toolName: string): Promise<string | null> {
    let browser;

    try {
        console.log(`📹 Scraping video from official website: ${websiteUrl}`);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();

        // Set realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Navigate to the website with timeout
        await page.goto(websiteUrl, {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        // Wait a bit for dynamic content
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract video URL from the page
        const videoUrl = await page.evaluate(() => {
            // Strategy 1: Find YouTube iframe embed
            const youtubeIframe = document.querySelector(
                'iframe[src*="youtube.com/embed"], iframe[src*="youtu.be"]'
            );
            if (youtubeIframe) {
                const src = youtubeIframe.getAttribute('src') || '';
                // Extract video ID from embed URL
                const embedMatch = src.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
                if (embedMatch) {
                    return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
                }
                // Direct youtu.be link
                const youtubeMatch = src.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
                if (youtubeMatch) {
                    return `https://www.youtube.com/watch?v=${youtubeMatch[1]}`;
                }
            }

            // Strategy 2: Find video element with YouTube source
            const videoElements = Array.from(document.querySelectorAll('video source, video'));
            for (const video of videoElements) {
                const src = video.getAttribute('src') || '';
                if (src.includes('youtube.com') || src.includes('youtu.be')) {
                    // Extract video ID
                    const match = src.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                    if (match) {
                        return `https://www.youtube.com/watch?v=${match[1]}`;
                    }
                }
            }

            // Strategy 3: Find YouTube links in common video sections
            // Look for sections with keywords like "demo", "video", "watch", "tutorial"
            const videoSectionKeywords = ['demo', 'video', 'watch', 'tutorial', 'overview', 'introduction'];
            const allSections = Array.from(document.querySelectorAll('section, div[class*="video"], div[id*="video"]'));

            for (const section of allSections) {
                const sectionText = (section.textContent || '').toLowerCase();
                const hasVideoKeyword = videoSectionKeywords.some(keyword => sectionText.includes(keyword));

                if (hasVideoKeyword) {
                    const links = Array.from(section.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]'));
                    for (const link of links) {
                        const href = link.getAttribute('href') || '';
                        const match = href.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                        if (match) {
                            return `https://www.youtube.com/watch?v=${match[1]}`;
                        }
                    }
                }
            }

            // Strategy 4: Find any YouTube link on the page (broader search)
            const allYouTubeLinks = Array.from(
                document.querySelectorAll('a[href*="youtube.com/watch"], a[href*="youtu.be/"]')
            );

            for (const link of allYouTubeLinks) {
                const href = link.getAttribute('href') || '';
                // Extract video ID
                const match = href.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (match) {
                    return `https://www.youtube.com/watch?v=${match[1]}`;
                }
            }

            // Strategy 5: Check for Vimeo embeds (alternative video platform)
            const vimeoIframe = document.querySelector('iframe[src*="vimeo.com"]');
            if (vimeoIframe) {
                const src = vimeoIframe.getAttribute('src') || '';
                if (src) {
                    return src; // Return Vimeo URL as-is
                }
            }

            return '';
        });

        await browser.close();

        if (videoUrl) {
            console.log(`  ✅ Found video on official website: ${videoUrl}`);
            return videoUrl;
        } else {
            console.log(`  ℹ️ No video found on official website`);
            return null;
        }

    } catch (error) {
        console.error(`  ❌ Error scraping video from website:`, error instanceof Error ? error.message : 'Unknown error');
        if (browser) {
            await browser.close();
        }
        return null;
    }
}
