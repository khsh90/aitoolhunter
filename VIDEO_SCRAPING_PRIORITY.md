# 📹 Video Scraping Priority System

## New Video Discovery Strategy

Updated the video scraping to prioritize getting videos directly from the tool's official website first, since these are more likely to be official demos/tutorials.

## Priority Order

### For Tools on Futurepedia:
```
1. Official Website (scrape YouTube embeds/links from tool site)
2. Futurepedia (video found on Futurepedia page)
3. YouTube API (search for most viewed relevant video)
4. YouTube Search URL (fallback when all else fails)
```

### For Tools NOT on Futurepedia (API Fallback):
```
1. Official Website (scrape YouTube embeds/links from tool site)
2. YouTube API (search for most viewed relevant video)
3. YouTube Search URL (fallback when all else fails)
```

## Why This Is Better

### Old Approach (Futurepedia → YouTube API):
```
❌ Problem: Futurepedia might not have the video
❌ Problem: Relies on external site (Futurepedia) for video
❌ Problem: May miss videos that are on the official site
```

### New Approach (Official Website → Futurepedia → YouTube API):
```
✅ Benefit: Gets video directly from the source (most accurate)
✅ Benefit: Official videos are higher quality demos
✅ Benefit: More likely to find official tutorials
✅ Benefit: Falls back to Futurepedia if website has no video
✅ Benefit: YouTube API as final safety net
```

---

## How It Works

### Step 1: Scrape Official Website

**File:** `lib/services/website-video-scraper.ts`

The scraper visits the tool's official website and looks for videos using multiple strategies:

**Strategy 1: YouTube iframe embeds**
```javascript
// Finds embedded YouTube videos like:
<iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
```

**Strategy 2: Video elements with YouTube source**
```javascript
// Finds video tags with YouTube URLs:
<video src="https://youtube.com/..."></video>
```

**Strategy 3: YouTube links in video sections**
```javascript
// Looks for sections with keywords: "demo", "video", "watch", "tutorial"
// Then finds YouTube links within those sections
```

**Strategy 4: Any YouTube link on the page**
```javascript
// Broader search - finds any YouTube link
// Extracts video ID and converts to standard format
```

**Strategy 5: Vimeo embeds** (bonus)
```javascript
// Also supports Vimeo as alternative video platform
```

### Step 2: Fallback to Futurepedia (if available)

If official website doesn't have a video, use the video found on Futurepedia.

### Step 3: Fallback to YouTube API

If neither official website nor Futurepedia has a video, search YouTube for relevant videos about the tool.

---

## Code Implementation

### File: `lib/ai.ts`

**Futurepedia Path (Lines 88-132):**
```javascript
// Video URL Priority: Official Website → Futurepedia → YouTube API
let videoUrl = '';

// Priority 1: Try to scrape video from official website
console.log(`📹 Video Priority 1: Checking official website...`);
const websiteVideo = await scrapeVideoFromWebsite(websiteUrl, toolName);
if (websiteVideo) {
  videoUrl = websiteVideo;
  console.log(`✅ Found video on official website`);
}

// Priority 2: Use video from Futurepedia if not found on official website
if (!videoUrl && futurepediaData.videoUrl) {
  videoUrl = futurepediaData.videoUrl;
  console.log(`📹 Video Priority 2: Using video from Futurepedia`);
}

// Priority 3: Try YouTube API as final fallback
if (!videoUrl) {
  console.log(`📹 Video Priority 3: Trying YouTube API search...`);
  const video = await findMostViewedVideo(toolName);
  if (video) {
    videoUrl = video.url;
  }
}
```

**API Fallback Path (Lines 195-233):**
```javascript
// Video URL Priority: Official Website → YouTube API
let videoUrl = '';

// Priority 1: Try to scrape video from official website
const websiteVideo = await scrapeVideoFromWebsite(websiteUrl, toolName);
if (websiteVideo) {
  videoUrl = websiteVideo;
}

// Priority 2: Try YouTube API search if not found on website
if (!videoUrl) {
  const video = await findMostViewedVideo(toolName);
  if (video) {
    videoUrl = video.url;
  }
}
```

---

## Console Logs

### Scenario 1: Video Found on Official Website

```
📹 Video Priority 1: Checking official website (https://capcut.com)...
📹 Scraping video from official website: https://capcut.com
  ✅ Found video on official website: https://www.youtube.com/watch?v=ABC123

Result: Uses video from official website
```

### Scenario 2: No Video on Website, Found on Futurepedia

```
📹 Video Priority 1: Checking official website (https://notion.so)...
📹 Scraping video from official website: https://notion.so
  ℹ️ No video found on official website
📹 Video Priority 2: Using video from Futurepedia: https://www.youtube.com/watch?v=XYZ789

Result: Uses video from Futurepedia
```

### Scenario 3: No Video on Website or Futurepedia, Found via YouTube API

```
📹 Video Priority 1: Checking official website (https://tool.com)...
  ℹ️ No video found on official website
📹 Video Priority 2: Using video from Futurepedia: (empty)
📹 Video Priority 3: Trying YouTube API search...
  ✅ Found video via YouTube API: https://www.youtube.com/watch?v=DEF456

Result: Uses YouTube API search result
```

### Scenario 4: All Methods Fail

```
📹 Video Priority 1: Checking official website (https://tool.com)...
  ℹ️ No video found on official website
📹 Video Priority 2: Using video from Futurepedia: (empty)
📹 Video Priority 3: Trying YouTube API search...
  ℹ️ Using YouTube search URL as fallback

Result: Uses YouTube search URL (user can search manually)
```

---

## Website Scraper Details

### What It Looks For:

**1. YouTube Embeds:**
- `<iframe src="https://www.youtube.com/embed/VIDEO_ID">`
- `<iframe src="https://youtu.be/VIDEO_ID">`

**2. Video Elements:**
- `<video src="https://youtube.com/...">`
- `<video><source src="https://youtube.com/..."></video>`

**3. YouTube Links in Video Sections:**
- Sections with keywords: "demo", "video", "watch", "tutorial", "overview", "introduction"
- YouTube links within those sections

**4. Any YouTube Link:**
- `<a href="https://www.youtube.com/watch?v=VIDEO_ID">`
- `<a href="https://youtu.be/VIDEO_ID">`

**5. Vimeo Embeds:**
- `<iframe src="https://player.vimeo.com/video/...">`

### Video ID Extraction:

Supports all YouTube URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&other=params`

Converts all to standard format: `https://www.youtube.com/watch?v=VIDEO_ID`

---

## Testing

### Test 1: Tool with Video on Official Website

```bash
Tool: CapCut
Expected: Finds video on capcut.com
Terminal should show:
  ✅ Found video on official website: https://www.youtube.com/watch?v=...
```

### Test 2: Tool with Video Only on Futurepedia

```bash
Tool: [Tool with no video on website]
Expected: Uses Futurepedia video
Terminal should show:
  ℹ️ No video found on official website
  📹 Video Priority 2: Using video from Futurepedia
```

### Test 3: Tool with No Video Anywhere

```bash
Tool: [New/obscure tool]
Expected: Falls back to YouTube API search
Terminal should show:
  ℹ️ No video found on official website
  📹 Video Priority 3: Trying YouTube API search...
```

---

## Benefits

### 1. Better Video Quality
- ✅ Official demos from the tool makers
- ✅ Most relevant content
- ✅ Latest product updates

### 2. More Accurate
- ✅ Videos are about the actual tool
- ✅ Not random third-party reviews
- ✅ Official tutorials and guides

### 3. Better Coverage
- ✅ Finds videos that Futurepedia might miss
- ✅ Multiple fallback strategies
- ✅ Comprehensive video discovery

### 4. User Trust
- ✅ Official videos build credibility
- ✅ Users see authentic content
- ✅ Better user experience

---

## Files Modified

| File | Purpose |
|------|---------|
| `lib/services/website-video-scraper.ts` | NEW - Scrapes videos from official website |
| `lib/ai.ts` | Updated video priority logic (2 places) |

---

## Performance

**Website Scraping:**
- Timeout: 15 seconds max
- Fast page load with networkidle2
- 2-second wait for dynamic content
- Efficient multiple-strategy search

**Error Handling:**
- Graceful fallbacks if website fails
- Doesn't break auto-generate flow
- Clear console logging for debugging

---

## Summary

**Old Flow:**
```
Futurepedia → YouTube API → Done
```

**New Flow:**
```
Official Website → Futurepedia → YouTube API → Done
         ↑
    Best quality!
```

Your AI Tool Hunter now finds the best, most relevant videos by checking the official website first! 🎥✨

---

## What This Means for Users

When you add a tool:
1. **Best case**: Gets official demo video from tool's website
2. **Good case**: Gets curated video from Futurepedia
3. **Fallback case**: Gets most-viewed YouTube video about the tool
4. **Last resort**: Provides YouTube search link

Users always get the best video available! 🚀
