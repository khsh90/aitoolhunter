/**
 * Product Image Service
 * Fetches logos and icons for AI tools with smart fallbacks
 */

import { searchGoogleImages } from './google-image-search';

async function verifyImageUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
    } catch {
        return false;
    }
}

/**
 * Fetch product image using multiple strategies with smart fallbacks
 * Priority: Brandfetch → Unavatar → Clearbit → Google Search → Favicon → Placeholder
 */
export async function fetchProductImage(websiteUrl: string, toolName: string, _description?: string): Promise<string> {
    console.log(`\n🖼️  Fetching LOGO for ${toolName}...`);

    let domain = '';
    try {
        const url = new URL(websiteUrl);
        domain = url.hostname.replace('www.', '');
    } catch {
        console.log('  ⚠️ Invalid website URL, will try logo services with tool name');
    }

    // Strategy 1: Try Brandfetch API (newest, best quality, comprehensive database)
    if (domain) {
        try {
            console.log('  Strategy 1: Trying Brandfetch logo...');
            const brandfetchUrl = `https://img.brandfetch.io/${domain}`;
            if (await verifyImageUrl(brandfetchUrl)) {
                console.log(`  ✅ Found beautiful logo via Brandfetch`);
                return brandfetchUrl;
            }
        } catch (error) {
            console.log('  ❌ Brandfetch failed');
        }
    }

    // Strategy 2: Try Unavatar (multi-source aggregator, very reliable)
    if (domain) {
        try {
            console.log('  Strategy 2: Trying Unavatar logo...');
            const unavatarUrl = `https://unavatar.io/${domain}?fallback=false`;
            if (await verifyImageUrl(unavatarUrl)) {
                console.log(`  ✅ Found beautiful logo via Unavatar`);
                return unavatarUrl;
            }
        } catch (error) {
            console.log('  ❌ Unavatar failed');
        }
    }

    // Strategy 3: Try Clearbit (reliable fallback, good coverage)
    if (domain) {
        try {
            console.log('  Strategy 3: Trying Clearbit logo...');
            const clearbitUrl = `https://logo.clearbit.com/${domain}`;
            if (await verifyImageUrl(clearbitUrl)) {
                console.log(`  ✅ Found logo via Clearbit`);
                return clearbitUrl;
            }
        } catch (error) {
            console.log('  ❌ Clearbit failed');
        }
    }

    // Strategy 4: Try Google Custom Search for high-quality logos (if configured)
    try {
        console.log('  Strategy 4: Trying Google Custom Search...');
        const googleImage = await searchGoogleImages(toolName, websiteUrl);
        if (googleImage && await verifyImageUrl(googleImage)) {
            console.log(`  ✅ Found high-quality logo via Google Search`);
            return googleImage;
        }
    } catch (error) {
        console.log('  ❌ Google Custom Search failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Strategy 5: Try Google Favicon API (larger size - 256px)
    if (domain) {
        try {
            console.log('  Strategy 5: Trying Google Favicon (large size)...');
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
            if (await verifyImageUrl(faviconUrl)) {
                console.log(`  ✅ Using Google Favicon (256px)`);
                return faviconUrl;
            }
        } catch (error) {
            console.log('  ❌ Google Favicon failed');
        }
    }

    // Strategy 6: Beautiful gradient placeholder with tool initials
    console.log('  Strategy 6: Creating beautiful placeholder with tool initials...');
    const encodedName = encodeURIComponent(toolName);
    // Using gradient background and larger size for better visual
    return `https://ui-avatars.com/api/?name=${encodedName}&size=512&background=gradient&color=ffffff&bold=true&font-size=0.4&length=2`;
}
