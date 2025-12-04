async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

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

export async function fetchLogo(websiteUrl: string, toolName: string): Promise<string> {
  try {
    const url = new URL(websiteUrl);
    const domain = url.hostname.replace('www.', '');

    // 1. Try Brandfetch (newest, best quality, comprehensive database)
    const brandfetchUrl = `https://img.brandfetch.io/${domain}`;
    if (await verifyImageUrl(brandfetchUrl)) {
      return brandfetchUrl;
    }

    // 2. Try Unavatar (multi-source aggregator, very reliable)
    const unavatarUrl = `https://unavatar.io/${domain}?fallback=false`;
    if (await verifyImageUrl(unavatarUrl)) {
      return unavatarUrl;
    }

    // 3. Try Clearbit (reliable fallback, good coverage)
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    if (await verifyImageUrl(clearbitUrl)) {
      return clearbitUrl;
    }

    // 4. Try Google Favicon (free, decent quality)
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    if (await verifyImageUrl(faviconUrl)) {
      return faviconUrl;
    }

    // 5. Fallback to UI Avatars (always works)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(toolName)}&size=512&background=gradient&color=ffffff&bold=true&font-size=0.4&length=2`;
  } catch (error) {
    // If URL parsing fails, use UI Avatars directly
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(toolName)}&size=512&background=gradient&color=ffffff&bold=true&font-size=0.4&length=2`;
  }
}
